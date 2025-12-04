// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ProgressTracker
 * @dev Tracks player progress, scores, and maintains weekly leaderboards
 * @notice Built with AI assistance (GitHub Copilot) for Seedify Vibe Coins Hackathon
 */
contract ProgressTracker is Ownable, Pausable {
    
    // ============================================
    // STATE VARIABLES
    // ============================================
    
    /// @notice Main game contract (authorized to update progress)
    address public gameContract;
    
    /// @notice Rewards pool contract (authorized to read leaderboard)
    address public rewardsPoolContract;
    
    /// @notice Player progress data
    struct PlayerProgress {
        uint256 totalScore;
        uint256 weeklyScore;
        uint256 gamesPlayed;
        uint256 lastPlayedWeek;
        bool isActive;
    }
    
    /// @notice Mapping from player address to their progress
    mapping(address => PlayerProgress) public playerProgress;
    
    /// @notice Array of all active players
    address[] public activePlayers;
    
    /// @notice Mapping to check if player is in active players array
    mapping(address => bool) public isActivePlayer;
    
    /// @notice Current week number (synchronized with RewardsPool)
    uint256 public currentWeek;
    
    /// @notice Weekly leaderboard (week => sorted player addresses)
    mapping(uint256 => address[]) public weeklyLeaderboard;
    
    /// @notice Total players registered
    uint256 public totalPlayers;
    
    // ============================================
    // EVENTS
    // ============================================
    
    /// @notice Emitted when a player's score is updated
    event ScoreUpdated(
        address indexed player,
        uint256 scoreAdded,
        uint256 newTotalScore,
        uint256 newWeeklyScore,
        uint256 weekNumber
    );
    
    /// @notice Emitted when week advances
    event WeekAdvanced(uint256 indexed oldWeek, uint256 indexed newWeek);
    
    /// @notice Emitted when leaderboard is finalized
    event LeaderboardFinalized(uint256 indexed weekNumber, address[] topPlayers);
    
    /// @notice Emitted when game contract is updated
    event GameContractUpdated(address indexed oldContract, address indexed newContract);
    
    /// @notice Emitted when rewards pool contract is updated
    event RewardsPoolContractUpdated(address indexed oldContract, address indexed newContract);
    
    // ============================================
    // MODIFIERS
    // ============================================
    
    /// @notice Only the game contract can call
    modifier onlyGameContract() {
        require(msg.sender == gameContract, "Only game contract");
        _;
    }
    
    /// @notice Only the rewards pool contract can call
    modifier onlyRewardsPool() {
        require(msg.sender == rewardsPoolContract, "Only rewards pool");
        _;
    }
    
    // ============================================
    // CONSTRUCTOR
    // ============================================
    
    /**
     * @dev Initializes the progress tracker
     */
    constructor() Ownable(msg.sender) {
        currentWeek = 1;
    }
    
    // ============================================
    // EXTERNAL FUNCTIONS
    // ============================================
    
    /**
     * @notice Update player score after a game
     * @param player Address of the player
     * @param scoreToAdd Score earned in the game
     */
    function updateScore(
        address player, 
        uint256 scoreToAdd
    ) 
        external 
        onlyGameContract 
        whenNotPaused 
    {
        require(player != address(0), "Invalid player address");
        require(scoreToAdd > 0, "Score must be greater than 0");
        
        PlayerProgress storage progress = playerProgress[player];
        
        // Initialize new player
        if (!progress.isActive) {
            progress.isActive = true;
            totalPlayers++;
            
            if (!isActivePlayer[player]) {
                activePlayers.push(player);
                isActivePlayer[player] = true;
            }
        }
        
        // Reset weekly score if new week
        if (progress.lastPlayedWeek < currentWeek) {
            progress.weeklyScore = 0;
            progress.lastPlayedWeek = currentWeek;
        }
        
        // Update scores
        progress.totalScore += scoreToAdd;
        progress.weeklyScore += scoreToAdd;
        progress.gamesPlayed++;
        
        emit ScoreUpdated(
            player,
            scoreToAdd,
            progress.totalScore,
            progress.weeklyScore,
            currentWeek
        );
    }
    
    /**
     * @notice Advance to next week (called by game contract)
     */
    function advanceWeek() external onlyGameContract whenNotPaused {
        uint256 oldWeek = currentWeek;
        currentWeek++;
        
        emit WeekAdvanced(oldWeek, currentWeek);
    }
    
    /**
     * @notice Get top 10 players for the week (called by rewards pool)
     * @param weekNumber Week to get leaderboard for (0 = current week)
     * @return topPlayers Array of top 10 player addresses
     */
    function getTopPlayers(uint256 weekNumber) 
        external 
        onlyRewardsPool 
        returns (address[] memory topPlayers) 
    {
        uint256 targetWeek = weekNumber == 0 ? currentWeek : weekNumber;
        
        // If leaderboard already finalized, return it
        if (weeklyLeaderboard[targetWeek].length > 0) {
            address[] memory finalizedBoard = weeklyLeaderboard[targetWeek];
            topPlayers = new address[](10);
            for (uint256 i = 0; i < 10 && i < finalizedBoard.length; i++) {
                topPlayers[i] = finalizedBoard[i];
            }
            return topPlayers;
        }
        
        // Build and sort leaderboard for the week
        address[] memory sortedPlayers = _buildAndSortLeaderboard(targetWeek);
        
        // Store finalized leaderboard
        weeklyLeaderboard[targetWeek] = sortedPlayers;
        
        // Return top 10
        topPlayers = new address[](10);
        for (uint256 i = 0; i < 10 && i < sortedPlayers.length; i++) {
            topPlayers[i] = sortedPlayers[i];
        }
        
        emit LeaderboardFinalized(targetWeek, topPlayers);
        
        return topPlayers;
    }
    
    /**
     * @notice Set game contract address (owner only)
     */
    function setGameContract(address _gameContract) external onlyOwner {
        require(_gameContract != address(0), "Invalid address");
        address oldContract = gameContract;
        gameContract = _gameContract;
        emit GameContractUpdated(oldContract, _gameContract);
    }
    
    /**
     * @notice Set rewards pool contract address (owner only)
     */
    function setRewardsPoolContract(address _rewardsPoolContract) external onlyOwner {
        require(_rewardsPoolContract != address(0), "Invalid address");
        address oldContract = rewardsPoolContract;
        rewardsPoolContract = _rewardsPoolContract;
        emit RewardsPoolContractUpdated(oldContract, _rewardsPoolContract);
    }
    
    // ============================================
    // VIEW FUNCTIONS
    // ============================================
    
    /**
     * @notice Get player's progress data
     */
    function getPlayerProgress(address player) 
        external 
        view 
        returns (
            uint256 totalScore,
            uint256 weeklyScore,
            uint256 gamesPlayed,
            uint256 lastPlayedWeek,
            bool isActive
        ) 
    {
        PlayerProgress memory progress = playerProgress[player];
        return (
            progress.totalScore,
            progress.weeklyScore,
            progress.gamesPlayed,
            progress.lastPlayedWeek,
            progress.isActive
        );
    }
    
    /**
     * @notice Get current week's leaderboard preview (unsorted)
     */
    function getCurrentWeekPlayers() external view returns (address[] memory) {
        uint256 count = 0;
        
        // Count active players this week
        for (uint256 i = 0; i < activePlayers.length; i++) {
            if (playerProgress[activePlayers[i]].lastPlayedWeek == currentWeek) {
                count++;
            }
        }
        
        // Build array of active players
        address[] memory weekPlayers = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < activePlayers.length; i++) {
            if (playerProgress[activePlayers[i]].lastPlayedWeek == currentWeek) {
                weekPlayers[index] = activePlayers[i];
                index++;
            }
        }
        
        return weekPlayers;
    }
    
    /**
     * @notice Get total number of active players
     */
    function getActivePlayerCount() external view returns (uint256) {
        return activePlayers.length;
    }
    
    /**
     * @notice Check if address is an active player
     */
    function isPlayerActive(address player) external view returns (bool) {
        return playerProgress[player].isActive;
    }
    
    /**
     * @notice Get finalized leaderboard for a week
     */
    function getWeeklyLeaderboard(uint256 weekNumber) 
        external 
        view 
        returns (address[] memory) 
    {
        return weeklyLeaderboard[weekNumber];
    }
    
    // ============================================
    // INTERNAL FUNCTIONS
    // ============================================
    
    /**
     * @dev Build and sort leaderboard for a specific week
     */
    function _buildAndSortLeaderboard(uint256 weekNumber) 
        internal 
        view 
        returns (address[] memory) 
    {
        // Collect players who played in the target week
        address[] memory weekPlayers = new address[](activePlayers.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < activePlayers.length; i++) {
            address player = activePlayers[i];
            if (playerProgress[player].lastPlayedWeek == weekNumber) {
                weekPlayers[count] = player;
                count++;
            }
        }
        
        // Resize array to actual count
        address[] memory players = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            players[i] = weekPlayers[i];
        }
        
        // Sort players by weekly score (bubble sort - gas intensive but simple)
        // For production, consider off-chain sorting or gas-optimized algorithm
        for (uint256 i = 0; i < players.length; i++) {
            for (uint256 j = i + 1; j < players.length; j++) {
                if (playerProgress[players[i]].weeklyScore < playerProgress[players[j]].weeklyScore) {
                    address temp = players[i];
                    players[i] = players[j];
                    players[j] = temp;
                }
            }
        }
        
        return players;
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
