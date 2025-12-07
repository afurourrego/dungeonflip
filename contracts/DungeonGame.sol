// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./AventurerNFT.sol";
import "./FeeDistributor.sol";
import "./ProgressTracker.sol";
import "./RewardsPool.sol";

/**
 * @title DungeonGame
 * @notice Fully on-chain dungeon crawler that keeps gameplay tied to the NFT itself.
 *         Players voluntarily deposit their Aventurer NFT while exploring and can
 *         withdraw it at any time. Game progress is stored per tokenId, so whoever
 *         owns the NFT can resume the run from the latest checkpoint.
 */
contract DungeonGame is Ownable, Pausable, ReentrancyGuard {
    using Math for uint256;

    /// @notice Entry fee (0.00001 ETH)
    uint256 public constant ENTRY_FEE = 0.00001 ether;

    /// @notice Cooldown between fresh dungeon entries (30 seconds)
    uint256 public constant GAME_COOLDOWN = 30 seconds;

    /// @notice Max rooms per run (soft cap for score calculation)
    uint8 public constant MAX_ROOMS = 50;

    /// @notice Card types supported by the contract
    enum CardType {
        Monster,
        Trap,
        PotionSmall,
        PotionFull,
        Treasure
    }

    /// @notice Lifecycle state for a given token run
    enum RunStatus {
        Idle,
        Active,
        Paused,
        Dead,
        Completed
    }

    /// @notice Core run data tied to a specific NFT tokenId
    struct RunState {
        address lastKnownOwner;
        RunStatus status;
        bool nftDeposited;
        uint8 currentRoom;
        uint8 currentHP;
        uint8 maxHP;
        uint8 atk;
        uint8 def;
        uint16 gems;
        uint256 lastSeed;
        uint256 lastAction;
    }

    AventurerNFT public immutable aventurerNFT;
    FeeDistributor public immutable feeDistributor;
    ProgressTracker public immutable progressTracker;
    RewardsPool public immutable rewardsPool;

    /// @notice tokenId => run data
    mapping(uint256 => RunState) public tokenRuns;

    /// @notice address => last time began a fresh run
    mapping(address => uint256) public lastEntryTime;

    /// @notice address => tokenId currently being played (0 if none)
    /// @dev This allows frontend to quickly find active token without scanning
    mapping(address => uint256) public activeTokenByWallet;

    /// @notice Aggregate stats
    uint256 public totalRunsStarted;
    uint256 public totalRunsCompleted;

    /// @notice Events for frontend consumption
    event RunStarted(address indexed player, uint256 indexed tokenId, uint8 room, bool resumed);
    event RunPaused(address indexed player, uint256 indexed tokenId, uint8 room, uint8 hp, uint16 gems);
    event RunExited(address indexed player, uint256 indexed tokenId, uint8 roomsCleared, uint16 gems, uint256 score);
    event RunDied(address indexed player, uint256 indexed tokenId, uint8 room, uint16 gems);
    event CardResolved(
        address indexed player,
        uint256 indexed tokenId,
        CardType cardType,
        uint8 room,
        uint8 hp,
        uint16 gems
    );

    constructor(
        address _aventurerNFT,
        address payable _feeDistributor,
        address _progressTracker,
        address payable _rewardsPool
    ) Ownable(msg.sender) {
        require(_aventurerNFT != address(0), "invalid NFT");
        require(_feeDistributor != address(0), "invalid distributor");
        require(_progressTracker != address(0), "invalid tracker");
        require(_rewardsPool != address(0), "invalid pool");

        aventurerNFT = AventurerNFT(_aventurerNFT);
        feeDistributor = FeeDistributor(_feeDistributor);
        progressTracker = ProgressTracker(_progressTracker);
        rewardsPool = RewardsPool(_rewardsPool);
    }

    // -------------------------------------------------------------------------
    // External user actions
    // -------------------------------------------------------------------------

    /**
     * @notice Deposit an NFT and either start a new adventure or resume a paused run.
     */
    function enterDungeon(uint256 tokenId) external payable nonReentrant whenNotPaused {
        RunState storage run = tokenRuns[tokenId];
        bool isResume = run.status == RunStatus.Paused;

        // For fresh entries, check ownership and transfer NFT
        // For resumed runs, only check that caller is the run owner (NFT already held in contract)
        if (!isResume) {
            require(aventurerNFT.ownerOf(tokenId) == msg.sender, "not token owner");
            require(msg.value == ENTRY_FEE, "fee required");
            
            // Enforce cooldown on fresh entries
            require(block.timestamp >= lastEntryTime[msg.sender] + GAME_COOLDOWN, "cooldown active");
            lastEntryTime[msg.sender] = block.timestamp;

            AventurerNFT.Stats memory stats = aventurerNFT.getAventurerStats(tokenId);
            run.atk = stats.atk;
            run.def = stats.def;
            run.maxHP = stats.hp;
            run.currentHP = stats.hp;
            run.currentRoom = 1;
            run.gems = 0;
            run.status = RunStatus.Active;
            run.lastKnownOwner = msg.sender;
            run.nftDeposited = true;
            totalRunsStarted += 1;

            // Track active token for this wallet (allows quick frontend lookup)
            activeTokenByWallet[msg.sender] = tokenId;

            // Take custody of the NFT only on fresh entry
            aventurerNFT.transferFrom(msg.sender, address(this), tokenId);
            feeDistributor.distributeEntryFee{value: ENTRY_FEE}();
        } else {
            // Resume: verify caller owns this paused run
            require(run.lastKnownOwner == msg.sender, "not run owner");
            require(msg.value == 0, "resume is free");
            require(run.currentHP > 0, "no HP to resume");
            run.status = RunStatus.Active;
            
            // Re-track active token on resume
            activeTokenByWallet[msg.sender] = tokenId;
        }

        run.lastAction = block.timestamp;
        run.lastSeed = _nextSeed(run.lastSeed, msg.sender, tokenId);

        emit RunStarted(msg.sender, tokenId, run.currentRoom, isResume);
    }

    /**
     * @notice Resolve the next room by selecting one of four face-down cards.
     */
    function chooseCard(uint256 tokenId, uint8 cardIndex) external nonReentrant whenNotPaused {
        RunState storage run = tokenRuns[tokenId];
        require(run.nftDeposited && run.status == RunStatus.Active, "run not active");
        require(run.lastKnownOwner == msg.sender, "not run owner");
        require(cardIndex < 4, "invalid card");
        require(run.currentHP > 0, "no HP");

        uint256 random = _nextSeed(run.lastSeed, msg.sender, tokenId ^ uint256(cardIndex));
        run.lastSeed = random;

        CardType card = _drawCard(random % 100);

        if (card == CardType.Monster) {
            _resolveMonster(run, random);
        } else if (card == CardType.Trap) {
            _resolveTrap(run);
        } else if (card == CardType.PotionSmall) {
            _heal(run, 1);
        } else if (card == CardType.PotionFull) {
            _heal(run, type(uint8).max);
        } else {
            _grantTreasure(run, random);
        }

        emit CardResolved(msg.sender, tokenId, card, run.currentRoom, run.currentHP, run.gems);

        if (run.currentHP == 0) {
            _handleDeath(run, tokenId);
            return;
        }

        run.currentRoom = run.currentRoom + 1;
        if (run.currentRoom > MAX_ROOMS) {
            // Auto-exit if player cleared the cap
            run.currentRoom = MAX_ROOMS;
            _completeRun(run, tokenId);
        }
    }

    /**
     * @notice Exit the dungeon voluntarily, marking the run victorious.
     */
    function exitDungeon(uint256 tokenId) external nonReentrant {
        RunState storage run = tokenRuns[tokenId];
        require(run.nftDeposited && run.status == RunStatus.Active, "run not active");
        require(run.lastKnownOwner == msg.sender, "not run owner");
        _completeRun(run, tokenId);
    }

    /**
     * @notice Pause a run and withdraw the NFT while keeping progress stored on-chain.
     */
    function pauseRun(uint256 tokenId) external nonReentrant {
        RunState storage run = tokenRuns[tokenId];
        require(run.nftDeposited && run.status == RunStatus.Active, "run not active");
        require(run.lastKnownOwner == msg.sender, "not run owner");

        run.status = RunStatus.Paused;
        run.nftDeposited = false;
        run.lastAction = block.timestamp;

        // Clear active token tracking (NFT returning to wallet)
        activeTokenByWallet[msg.sender] = 0;

        aventurerNFT.safeTransferFrom(address(this), msg.sender, tokenId);
        emit RunPaused(msg.sender, tokenId, run.currentRoom, run.currentHP, run.gems);
    }

    /**
     * @notice After death, owner can reclaim the NFT (progress resets to Idle).
     */
    function claimAfterDeath(uint256 tokenId) external nonReentrant {
        RunState storage run = tokenRuns[tokenId];
        require(run.status == RunStatus.Dead, "not dead");
        require(run.lastKnownOwner == msg.sender, "not owner");
        require(run.nftDeposited, "already claimed");

        run.status = RunStatus.Idle;
        run.nftDeposited = false;
        run.currentRoom = 1;
        run.currentHP = run.maxHP;
        run.gems = 0;

        // Clear active token tracking
        activeTokenByWallet[msg.sender] = 0;

        aventurerNFT.safeTransferFrom(address(this), msg.sender, tokenId);
    }

    /**
     * @notice Emergency claim if contract is paused/completed run.
     */
    function forceWithdraw(uint256 tokenId) external nonReentrant {
        RunState storage run = tokenRuns[tokenId];
        require(run.nftDeposited, "not deposited");
        require(run.lastKnownOwner == msg.sender, "not owner");
        require(run.status != RunStatus.Active, "run active");

        run.nftDeposited = false;
        
        // Clear active token tracking
        activeTokenByWallet[msg.sender] = 0;

        aventurerNFT.safeTransferFrom(address(this), msg.sender, tokenId);
    }

    // -------------------------------------------------------------------------
    // Internal gameplay helpers
    // -------------------------------------------------------------------------

    function _completeRun(RunState storage run, uint256 tokenId) internal {
        run.status = RunStatus.Completed;
        run.nftDeposited = false;
        totalRunsCompleted += 1;

        // Clear active token tracking before transfer
        activeTokenByWallet[run.lastKnownOwner] = 0;

        aventurerNFT.safeTransferFrom(address(this), run.lastKnownOwner, tokenId);

        uint8 roomsCleared = run.currentRoom > 0 ? run.currentRoom - 1 : 0;
        uint256 score = _calculateScore(roomsCleared, run.gems, run.maxHP);
        progressTracker.updateScore(run.lastKnownOwner, score);

        emit RunExited(run.lastKnownOwner, tokenId, roomsCleared, run.gems, score);

        // Reset lightweight portions so a new run starts clean
        run.currentRoom = 1;
        run.currentHP = run.maxHP;
        run.gems = 0;
        run.status = RunStatus.Idle;
    }

    function _handleDeath(RunState storage run, uint256 tokenId) internal {
        run.status = RunStatus.Dead;
        emit RunDied(run.lastKnownOwner, tokenId, run.currentRoom, run.gems);
    }

    function _resolveTrap(RunState storage run) internal {
        if (run.currentHP > 0) {
            run.currentHP -= 1;
        }
    }

    function _heal(RunState storage run, uint8 amount) internal {
        uint8 target = amount == type(uint8).max ? run.maxHP : run.currentHP + amount;
        if (target > run.maxHP) {
            target = run.maxHP;
        }
        run.currentHP = target;
    }

    function _grantTreasure(RunState storage run, uint256 random) internal {
        uint256 roll = (random >> 16) % 100;
        uint16 reward;
        if (roll < 40) reward = 10;
        else if (roll < 65) reward = 20;
        else if (roll < 85) reward = 30;
        else reward = 50;
        run.gems += reward;
    }

    function _resolveMonster(RunState storage run, uint256 random) internal {
        uint8 monsterHP = uint8(3 + (random % 4)); // 3-6 HP
        uint8 monsterATK = uint8(1 + ((random >> 8) % 4)); // 1-4 ATK
        uint8 monsterDEF = uint8((random >> 12) % 2); // 0-1 DEF
        uint256 rolls = random >> 16;

        for (uint8 round = 0; round < 6; round++) {
            // Player attacks
            bool playerHits = (rolls & 0xFF) % 100 < 80; // 80% chance
            rolls >>= 8;
            if (playerHits) {
                uint8 dmg = run.atk > monsterDEF ? run.atk - monsterDEF : 1;
                monsterHP = dmg >= monsterHP ? 0 : monsterHP - dmg;
            }
            if (monsterHP == 0) {
                break;
            }

            // Monster attacks
            bool monsterHits = (rolls & 0xFF) % 100 < 70; // 70% chance
            rolls >>= 8;
            if (monsterHits) {
                uint8 dmg = monsterATK > run.def ? monsterATK - run.def : 1;
                run.currentHP = dmg >= run.currentHP ? 0 : run.currentHP - dmg;
                if (run.currentHP == 0) {
                    return;
                }
            }
        }

        if (monsterHP == 0) {
            // Reward: either gems or healing
            uint8 rewardRoll = uint8(rolls % 3);
            if (rewardRoll == 0) {
                run.gems += 15;
            } else if (rewardRoll == 1) {
                _heal(run, 1);
            } else {
                _heal(run, type(uint8).max);
            }
        } else {
            // Stalemate results in chip damage to player
            if (run.currentHP > 0) {
                run.currentHP = run.currentHP > 1 ? run.currentHP - 1 : 0;
            }
        }
    }

    function _drawCard(uint256 roll) internal pure returns (CardType) {
        if (roll < 40) return CardType.Monster; // 40%
        if (roll < 55) return CardType.Trap;    // 15%
        if (roll < 70) return CardType.PotionSmall; // 15%
        if (roll < 85) return CardType.PotionFull;  // 15%
        return CardType.Treasure;                     // 15%
    }

    function _calculateScore(uint8 roomsCleared, uint16 gems, uint8 maxHP) internal pure returns (uint256) {
        uint256 roomScore = uint256(roomsCleared) * 100;
        uint256 gemScore = uint256(gems) * 5;
        uint256 vitalityBonus = uint256(maxHP) * 10;
        return roomScore + gemScore + vitalityBonus;
    }

    function _nextSeed(uint256 prevSeed, address player, uint256 salt) internal view returns (uint256) {
        return uint256(keccak256(abi.encode(block.prevrandao, block.timestamp, player, salt, prevSeed)));
    }

    // Owner utilities --------------------------------------------------------

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
}
