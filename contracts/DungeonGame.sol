// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./AventurerNFT.sol";
import "./FeeDistributor.sol";
import "./ProgressTracker.sol";
import "./RewardsPool.sol";

/**
 * @title DungeonGame
 * @dev Main game contract that orchestrates dungeon runs and integrates all other contracts
 * @notice Built with AI assistance (GitHub Copilot) for Seedify Vibe Coins Hackathon
 */
contract DungeonGame is Ownable, Pausable {
    
    // ============================================
    // STATE VARIABLES
    // ============================================
    
    /// @notice Entry fee to play (0.00001 ETH)
    uint256 public constant ENTRY_FEE = 0.00001 ether;
    
    /// @notice Minimum time between games (30 seconds cooldown)
    uint256 public constant GAME_COOLDOWN = 30 seconds;

    /// @notice Base score per level completed
    uint256 public constant BASE_SCORE_PER_LEVEL = 10;
    
    /// @notice Contract references
    AventurerNFT public aventurerNFT;
    FeeDistributor public feeDistributor;
    ProgressTracker public progressTracker;
    RewardsPool public rewardsPool;
    
    /// @notice Game session data
    struct GameSession {
        uint256 tokenId;
        uint256 levelsCompleted;
        uint256 scoreEarned;
        uint256 timestamp;
        bool active;
        // NEW: Checkpoint data for game resumption
        uint8 currentRoom;           // Current room number (1-10)
        uint8 currentHP;             // Current HP
        uint8 gemsCollected;         // Gems collected so far
        uint256 lastCheckpointTime;  // Timestamp of last checkpoint
        uint256 seed;                // Random seed for this game session
    }
    
    /// @notice Mapping from player to their current game session
    mapping(address => GameSession) public playerSessions;
    
    /// @notice Mapping from player to last game timestamp (for cooldown)
    mapping(address => uint256) public lastGameTime;
    
    /// @notice Total games played
    uint256 public totalGamesPlayed;
    
    /// @notice Total entry fees collected
    uint256 public totalFeesCollected;
    
    // ============================================
    // EVENTS
    // ============================================
    
    /// @notice Emitted when a game starts
    event GameStarted(
        address indexed player,
        uint256 indexed tokenId,
        uint256 timestamp
    );
    
    /// @notice Emitted when a game ends
    event GameEnded(
        address indexed player,
        uint256 indexed tokenId,
        uint256 levelsCompleted,
        uint256 scoreEarned,
        uint256 timestamp
    );
    
    /// @notice Emitted when contracts are updated
    event ContractsUpdated(
        address aventurerNFT,
        address feeDistributor,
        address progressTracker,
        address rewardsPool
    );

    // NEW: Adventure Log Events

    /// @notice Emitted when game state checkpoint is saved
    event GameCheckpoint(
        address indexed player,
        uint256 indexed tokenId,
        uint8 currentRoom,
        uint8 currentHP,
        uint8 gemsCollected,
        uint256 timestamp
    );

    /// @notice Emitted when player dies
    event PlayerDied(
        address indexed player,
        uint256 indexed tokenId,
        uint8 roomNumber,
        uint8 gemsCollected,
        uint256 timestamp
    );

    /// @notice Emitted when a room is completed
    event RoomCompleted(
        address indexed player,
        uint256 indexed tokenId,
        uint8 roomNumber,
        uint8 cardType,
        uint8 hpRemaining,
        uint8 gemsCollected,
        uint256 timestamp
    );
    
    // ============================================
    // CONSTRUCTOR
    // ============================================
    
    /**
     * @dev Initialize the game contract
     */
    constructor(
        address _aventurerNFT,
        address payable _feeDistributor,
        address _progressTracker,
        address payable _rewardsPool
    ) Ownable(msg.sender) {
        require(_aventurerNFT != address(0), "Invalid NFT address");
        require(_feeDistributor != address(0), "Invalid distributor address");
        require(_progressTracker != address(0), "Invalid tracker address");
        require(_rewardsPool != address(0), "Invalid pool address");
        
        aventurerNFT = AventurerNFT(_aventurerNFT);
        feeDistributor = FeeDistributor(_feeDistributor);
        progressTracker = ProgressTracker(_progressTracker);
        rewardsPool = RewardsPool(_rewardsPool);
    }
    
    // ============================================
    // EXTERNAL FUNCTIONS
    // ============================================
    
    /**
     * @notice Start a new game session
     * @param tokenId The adventurer NFT token ID to use
     */
    function startGame(uint256 tokenId) 
        external 
        payable 
        whenNotPaused 
    {
        require(msg.value == ENTRY_FEE, "Incorrect entry fee");
        require(aventurerNFT.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(!playerSessions[msg.sender].active, "Game already active");
        require(
            block.timestamp >= lastGameTime[msg.sender] + GAME_COOLDOWN,
            "Cooldown not finished"
        );
        
        // Distribute entry fee
        feeDistributor.distributeEntryFee{value: ENTRY_FEE}();
        totalFeesCollected += ENTRY_FEE;

        // Generate random seed for this game
        uint256 gameSeed = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    msg.sender,
                    tokenId,
                    totalGamesPlayed
                )
            )
        );

        // Get initial HP from NFT stats
        AventurerNFT.Stats memory stats = aventurerNFT.getAventurerStats(tokenId);

        // Create game session
        playerSessions[msg.sender] = GameSession({
            tokenId: tokenId,
            levelsCompleted: 0,
            scoreEarned: 0,
            timestamp: block.timestamp,
            active: true,
            currentRoom: 1,
            currentHP: uint8(stats.hp),
            gemsCollected: 0,
            lastCheckpointTime: block.timestamp,
            seed: gameSeed
        });

        lastGameTime[msg.sender] = block.timestamp;
        totalGamesPlayed++;

        emit GameStarted(msg.sender, tokenId, block.timestamp);
    }
    
    /**
     * @notice Update game checkpoint
     * @param currentRoom Current room number
     * @param currentHP Player's current HP
     * @param gemsCollected Gems collected so far
     */
    function updateCheckpoint(
        uint8 currentRoom,
        uint8 currentHP,
        uint8 gemsCollected
    ) external whenNotPaused {
        GameSession storage session = playerSessions[msg.sender];
        require(session.active, "No active game");
        require(currentRoom >= session.currentRoom, "Cannot go backwards");
        require(currentHP > 0, "Player is dead");

        // Update session state
        session.currentRoom = currentRoom;
        session.currentHP = currentHP;
        session.gemsCollected = gemsCollected;
        session.lastCheckpointTime = block.timestamp;

        emit GameCheckpoint(
            msg.sender,
            session.tokenId,
            currentRoom,
            currentHP,
            gemsCollected,
            block.timestamp
        );
    }

    /**
     * @notice Record player death
     * @param roomNumber Room where player died
     * @param finalGemsCollected Final gems collected
     */
    function recordDeath(
        uint8 roomNumber,
        uint8 finalGemsCollected
    ) external whenNotPaused {
        GameSession storage session = playerSessions[msg.sender];
        require(session.active, "No active game");

        // Mark session as complete (death)
        session.active = false;
        session.levelsCompleted = roomNumber > 0 ? roomNumber - 1 : 0;
        session.currentHP = 0;
        session.gemsCollected = finalGemsCollected;
        session.scoreEarned = 0; // No score for deaths

        emit PlayerDied(
            msg.sender,
            session.tokenId,
            roomNumber,
            finalGemsCollected,
            block.timestamp
        );

        emit GameEnded(
            msg.sender,
            session.tokenId,
            session.levelsCompleted,
            0, // zero score for death
            block.timestamp
        );
    }


    /**
     * @notice Log room completion (for adventure log)
     * @param roomNumber Room that was completed
     * @param cardType Type of card encountered (0=Monster, 1=Treasure, 2=Trap, 3=Potion)
     * @param hpRemaining Player HP after room
     * @param gemsCollected Total gems collected
     */
    function logRoomCompletion(
        uint8 roomNumber,
        uint8 cardType,
        uint8 hpRemaining,
        uint8 gemsCollected
    ) external whenNotPaused {
        GameSession storage session = playerSessions[msg.sender];
        require(session.active, "No active game");

        emit RoomCompleted(
            msg.sender,
            session.tokenId,
            roomNumber,
            cardType,
            hpRemaining,
            gemsCollected,
            block.timestamp
        );
    }

    /**
     * @notice Complete the game and record results
     * @dev In production, this would validate game proof. For demo, we simulate results.
     */
    function completeGame() external whenNotPaused {
        GameSession storage session = playerSessions[msg.sender];
        require(session.active, "No active game");
        
        // Get adventurer stats for score calculation
        AventurerNFT.Stats memory stats = aventurerNFT.getAventurerStats(session.tokenId);
        
        // Simulate dungeon run based on stats (pseudo-random)
        uint256 levelsCompleted = _simulateDungeonRun(stats.atk, stats.def, stats.hp, session.tokenId);
        uint256 scoreEarned = _calculateScore(levelsCompleted, stats.atk, stats.def, stats.hp);
        
        // Update session
        session.levelsCompleted = levelsCompleted;
        session.scoreEarned = scoreEarned;
        session.active = false;
        
        // Update player progress
        progressTracker.updateScore(msg.sender, scoreEarned);
        
        emit GameEnded(
            msg.sender,
            session.tokenId,
            levelsCompleted,
            scoreEarned,
            block.timestamp
        );
    }
    
    /**
     * @notice Advance to next week (owner only)
     * @dev Advances week in both ProgressTracker and RewardsPool
     */
    function advanceWeek() external onlyOwner {
        progressTracker.advanceWeek();
        rewardsPool.advanceWeek();
    }
    
    /**
     * @notice Distribute weekly rewards to top 10 players
     * @dev This is a convenience function that calls RewardsPool.distributeRewards
     * @dev which internally gets top players from ProgressTracker
     * @param topPlayers Array of top 10 player addresses (from off-chain or manual call)
     */
    function distributeWeeklyRewards(address[] calldata topPlayers) external onlyOwner {
        // Distribute rewards to provided top players
        rewardsPool.distributeRewards(topPlayers);
    }
    
    /**
     * @notice Update contract addresses (owner only)
     */
    function updateContracts(
        address _aventurerNFT,
        address payable _feeDistributor,
        address _progressTracker,
        address payable _rewardsPool
    ) external onlyOwner {
        require(_aventurerNFT != address(0), "Invalid NFT address");
        require(_feeDistributor != address(0), "Invalid distributor address");
        require(_progressTracker != address(0), "Invalid tracker address");
        require(_rewardsPool != address(0), "Invalid pool address");
        
        aventurerNFT = AventurerNFT(_aventurerNFT);
        feeDistributor = FeeDistributor(_feeDistributor);
        progressTracker = ProgressTracker(_progressTracker);
        rewardsPool = RewardsPool(_rewardsPool);
        
        emit ContractsUpdated(
            _aventurerNFT,
            _feeDistributor,
            _progressTracker,
            _rewardsPool
        );
    }
    
    // ============================================
    // VIEW FUNCTIONS
    // ============================================
    
    /**
     * @notice Get player's current game session
     */
    function getPlayerSession(address player)
        external
        view
        returns (
            uint256 tokenId,
            uint256 levelsCompleted,
            uint256 scoreEarned,
            uint256 timestamp,
            bool active,
            uint8 currentRoom,
            uint8 currentHP,
            uint8 gemsCollected,
            uint256 lastCheckpointTime,
            uint256 seed
        )
    {
        GameSession memory session = playerSessions[player];
        return (
            session.tokenId,
            session.levelsCompleted,
            session.scoreEarned,
            session.timestamp,
            session.active,
            session.currentRoom,
            session.currentHP,
            session.gemsCollected,
            session.lastCheckpointTime,
            session.seed
        );
    }
    
    /**
     * @notice Check if player can start a new game
     */
    function canStartGame(address player) external view returns (bool) {
        return !playerSessions[player].active &&
               block.timestamp >= lastGameTime[player] + GAME_COOLDOWN;
    }
    
    /**
     * @notice Get time remaining until player can start new game
     */
    function getCooldownRemaining(address player) external view returns (uint256) {
        if (block.timestamp >= lastGameTime[player] + GAME_COOLDOWN) {
            return 0;
        }
        return (lastGameTime[player] + GAME_COOLDOWN) - block.timestamp;
    }
    
    // ============================================
    // INTERNAL FUNCTIONS
    // ============================================
    
    /**
     * @dev Simulate dungeon run based on adventurer stats
     * @return Number of levels completed (0-10)
     */
    function _simulateDungeonRun(
        uint256 atk,
        uint256 def,
        uint256 hp,
        uint256 tokenId
    ) internal view returns (uint256) {
        // Calculate total power (weighted sum of stats)
        uint256 totalPower = (atk * 3) + (def * 2) + hp;
        
        // Generate pseudo-random number based on stats and block data
        uint256 randomFactor = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    tokenId,
                    msg.sender,
                    totalPower
                )
            )
        ) % 100;
        
        // Calculate success threshold (higher power = higher success chance)
        // Min power: (1*3 + 1*2 + 4) = 9, Max power: (2*3 + 2*2 + 6) = 16
        // Normalize to 0-100 scale: ((power - 9) * 100) / 7
        uint256 successThreshold = ((totalPower - 9) * 100) / 7;
        
        // Calculate levels completed based on power and luck
        uint256 levelsCompleted;
        if (randomFactor < successThreshold) {
            // Good run: 7-10 levels
            levelsCompleted = 7 + (randomFactor % 4);
        } else if (randomFactor < successThreshold + 30) {
            // Average run: 4-6 levels
            levelsCompleted = 4 + (randomFactor % 3);
        } else {
            // Poor run: 1-3 levels
            levelsCompleted = 1 + (randomFactor % 3);
        }
        
        return levelsCompleted;
    }
    
    /**
     * @dev Calculate score based on performance
     */
    function _calculateScore(
        uint256 levelsCompleted,
        uint256 atk,
        uint256 def,
        uint256 hp
    ) internal pure returns (uint256) {
        // Base score: 10 points per level
        uint256 baseScore = levelsCompleted * BASE_SCORE_PER_LEVEL;
        
        // Bonus for high stats (max +20%)
        uint256 statBonus = (atk + def + hp - 6) * 2; // 0-20% bonus
        uint256 bonusScore = (baseScore * statBonus) / 100;
        
        // Bonus for completing many levels (exponential)
        uint256 levelBonus = 0;
        if (levelsCompleted >= 10) {
            levelBonus = 50; // Perfect run bonus
        } else if (levelsCompleted >= 7) {
            levelBonus = 20; // Good run bonus
        }
        
        return baseScore + bonusScore + levelBonus;
    }
    
    // ============================================
    // OWNER FUNCTIONS
    // ============================================
    
    /**
     * @notice Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
