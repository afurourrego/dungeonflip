// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IFeeDistributor {
    function withdrawRewardsPool(address to) external returns (uint256);
    function rewardsPoolBalance() external view returns (uint256);
}

/**
 * @title RewardsPool
 * @dev Manages weekly prize distribution to top 10 players
 * @notice Distribution every Friday at 16:20 UTC
 * 
 * Prize breakdown:
 * 1st: 30%, 2nd: 20%, 3rd: 15%, 4th: 10%, 5th: 8%
 * 6th: 6%, 7th: 4%, 8th: 3%, 9th: 2%, 10th: 2%
 * 
 * Built with AI assistance (GitHub Copilot + Claude) for Seedify Vibe Coins Hackathon
 */
contract RewardsPool is Ownable, Pausable {
    
    // ============================================
    // STATE VARIABLES
    // ============================================
    
    /// @notice Prize distribution percentages for top 10 players
    uint256[10] public PRIZE_PERCENTAGES = [30, 20, 15, 10, 8, 6, 4, 3, 2, 2];
    
    /// @notice Current week number (starts at 1)
    uint256 public currentWeek;
    
    /// @notice Timestamp of the last week advancement
    uint256 public lastWeekAdvance;
    
    /// @notice Duration of a week in seconds (7 days)
    uint256 public constant WEEK_DURATION = 7 days;
    
    /// @notice Minimum time between week advances (to prevent double distribution)
    uint256 public constant MIN_ADVANCE_INTERVAL = 6 days;
    
    /// @notice Fee distributor contract
    IFeeDistributor public feeDistributor;
    
    /// @notice Progress tracker contract (authorized to provide winners)
    address public progressTracker;
    
    /// @notice Game contract (authorized to trigger distributions)
    address public gameContract;
    
    /// @notice History of prize distributions
    struct WeekDistribution {
        uint256 weekNumber;
        uint256 totalPrize;
        uint256 timestamp;
        bool distributed;
    }
    
    mapping(uint256 => WeekDistribution) public weekHistory;
    
    /// @notice Track total prizes distributed
    uint256 public totalPrizesDistributed;
    
    // ============================================
    // EVENTS
    // ============================================
    
    /// @notice Emitted when week is advanced
    event WeekAdvanced(
        uint256 indexed weekNumber,
        uint256 timestamp,
        uint256 poolBalance
    );
    
    /// @notice Emitted when rewards are distributed
    event RewardsDistributed(
        uint256 indexed weekNumber,
        uint256 totalAmount,
        address[] winners,
        uint256[] prizes,
        uint256 timestamp
    );
    
    /// @notice Emitted when a prize is awarded to a player
    event PrizeAwarded(
        address indexed player,
        uint256 amount,
        uint256 rank,
        uint256 weekNumber
    );
    
    /// @notice Emitted when fee distributor is updated
    event FeeDistributorUpdated(address indexed oldDistributor, address indexed newDistributor);
    
    /// @notice Emitted when progress tracker is updated
    event ProgressTrackerUpdated(address indexed oldTracker, address indexed newTracker);
    
    // ============================================
    // MODIFIERS
    // ============================================
    
    /// @notice Only progress tracker, game contract, or owner can provide winners
    modifier onlyProgressTracker() {
        require(
            msg.sender == progressTracker || 
            msg.sender == gameContract || 
            msg.sender == owner(), 
            "Only progress tracker, game, or owner"
        );
        _;
    }
    
    // ============================================
    // CONSTRUCTOR
    // ============================================
    
    /**
     * @dev Initializes the rewards pool
     */
    constructor() Ownable(msg.sender) {
        currentWeek = 1;
        lastWeekAdvance = block.timestamp;
    }
    
    // ============================================
    // EXTERNAL FUNCTIONS
    // ============================================
    
    /**
     * @notice Advance to the next week
     * @dev Can only be called after MIN_ADVANCE_INTERVAL has passed
     */
    function advanceWeek() external whenNotPaused {
        require(
            block.timestamp >= lastWeekAdvance + MIN_ADVANCE_INTERVAL,
            "Too early to advance week"
        );
        
        uint256 previousWeek = currentWeek;
        currentWeek++;
        lastWeekAdvance = block.timestamp;
        
        emit WeekAdvanced(currentWeek, block.timestamp, address(this).balance);
        
        // Mark previous week as ready for distribution
        if (weekHistory[previousWeek].totalPrize == 0) {
            weekHistory[previousWeek] = WeekDistribution({
                weekNumber: previousWeek,
                totalPrize: 0,
                timestamp: block.timestamp,
                distributed: false
            });
        }
    }
    
    /**
     * @notice Distribute rewards to top 10 players
     * @dev Called with list of top players from progress tracker
     * @param topPlayers Array of top 10 player addresses (ordered by rank)
     */
    function distributeRewards(address[] calldata topPlayers) 
        external 
        onlyProgressTracker 
        whenNotPaused 
    {
        require(topPlayers.length == 10, "Must provide exactly 10 players");
        require(address(feeDistributor) != address(0), "Fee distributor not set");
        
        // Withdraw accumulated balance from fee distributor
        uint256 totalPrize = feeDistributor.withdrawRewardsPool(address(this));
        require(totalPrize > 0, "No prize pool available");
        
        uint256[] memory prizes = new uint256[](10);
        uint256 totalDistributed = 0;
        
        // Calculate and distribute prizes
        for (uint256 i = 0; i < 10; i++) {
            address winner = topPlayers[i];
            require(winner != address(0), "Invalid winner address");
            
            uint256 prize = (totalPrize * PRIZE_PERCENTAGES[i]) / 100;
            prizes[i] = prize;
            
            // Send prize to winner
            (bool success, ) = payable(winner).call{value: prize}("");
            require(success, "Prize transfer failed");
            
            totalDistributed += prize;
            
            emit PrizeAwarded(winner, prize, i + 1, currentWeek - 1);
        }
        
        // Handle any remaining dust (send to first place)
        if (totalPrize > totalDistributed) {
            uint256 dust = totalPrize - totalDistributed;
            (bool success, ) = payable(topPlayers[0]).call{value: dust}("");
            require(success, "Dust transfer failed");
            prizes[0] += dust;
            totalDistributed += dust;
        }
        
        // Update history
        uint256 distributionWeek = currentWeek - 1;
        weekHistory[distributionWeek] = WeekDistribution({
            weekNumber: distributionWeek,
            totalPrize: totalPrize,
            timestamp: block.timestamp,
            distributed: true
        });
        
        totalPrizesDistributed += totalPrize;
        
        emit RewardsDistributed(
            distributionWeek,
            totalPrize,
            topPlayers,
            prizes,
            block.timestamp
        );
    }
    
    /**
     * @notice Get current prize pool balance
     * @dev Checks both local balance and fee distributor balance
     * @return Local balance in this contract
     */
    function getCurrentPoolBalance() external view returns (uint256) {
        uint256 localBalance = address(this).balance;
        if (address(feeDistributor) == address(0)) {
            return localBalance;
        }
        return localBalance + feeDistributor.rewardsPoolBalance();
    }
    
    /**
     * @notice Check if week can be advanced
     * @return True if enough time has passed
     */
    function canAdvanceWeek() external view returns (bool) {
        return block.timestamp >= lastWeekAdvance + MIN_ADVANCE_INTERVAL;
    }
    
    /**
     * @notice Get time until next week can be advanced
     * @return Seconds until next advancement (0 if can advance now)
     */
    function timeUntilNextWeek() external view returns (uint256) {
        uint256 nextAdvanceTime = lastWeekAdvance + MIN_ADVANCE_INTERVAL;
        if (block.timestamp >= nextAdvanceTime) {
            return 0;
        }
        return nextAdvanceTime - block.timestamp;
    }
    
    /**
     * @notice Get distribution history for a specific week
     * @param weekNumber The week to query
     * @return distribution The distribution data
     */
    function getWeekHistory(uint256 weekNumber) 
        external 
        view 
        returns (WeekDistribution memory) 
    {
        return weekHistory[weekNumber];
    }
    
    /**
     * @notice Get expected prizes for current pool
     * @return prizes Array of 10 prize amounts
     */
    function getExpectedPrizes() external view returns (uint256[10] memory prizes) {
        uint256 balance = address(this).balance;
        if (address(feeDistributor) != address(0)) {
            balance += feeDistributor.rewardsPoolBalance();
        }
        
        for (uint256 i = 0; i < 10; i++) {
            prizes[i] = (balance * PRIZE_PERCENTAGES[i]) / 100;
        }
        
        return prizes;
    }
    
    // ============================================
    // OWNER FUNCTIONS
    // ============================================
    
    /**
     * @notice Set the fee distributor contract
     * @param _feeDistributor Address of fee distributor
     */
    function setFeeDistributor(address _feeDistributor) external onlyOwner {
        require(_feeDistributor != address(0), "Invalid address");
        
        address oldDistributor = address(feeDistributor);
        feeDistributor = IFeeDistributor(_feeDistributor);
        
        emit FeeDistributorUpdated(oldDistributor, _feeDistributor);
    }
    
    /**
     * @notice Set the progress tracker contract
     * @param _progressTracker Address of progress tracker
     */
    function setProgressTracker(address _progressTracker) external onlyOwner {
        require(_progressTracker != address(0), "Invalid address");
        
        address oldTracker = progressTracker;
        progressTracker = _progressTracker;
        
        emit ProgressTrackerUpdated(oldTracker, _progressTracker);
    }
    
    /**
     * @notice Set game contract address (owner only)
     * @param _gameContract Address of game contract
     */
    function setGameContract(address _gameContract) external onlyOwner {
        require(_gameContract != address(0), "Invalid address");
        gameContract = _gameContract;
    }
    
    /**
     * @notice Pause the contract (emergency use)
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
    
    /**
     * @notice Emergency withdrawal (only if critical issue)
     * @dev Should rarely be used - for emergency situations only
     * @param to Address to send funds
     */
    function emergencyWithdraw(address to) external onlyOwner {
        require(to != address(0), "Invalid address");
        
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");
        
        (bool success, ) = payable(to).call{value: balance}("");
        require(success, "Transfer failed");
    }
    
    // ============================================
    // RECEIVE FUNCTION
    // ============================================
    
    /**
     * @notice Receive ETH from fee distributor
     */
    receive() external payable {
        // Accept ETH from fee distributor
        require(msg.sender == address(feeDistributor), "Only fee distributor can send ETH");
    }
}
