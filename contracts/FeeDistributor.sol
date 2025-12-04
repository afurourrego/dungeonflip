// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title FeeDistributor
 * @dev Manages automatic distribution of entry fees
 * @notice Distribution: 70% Rewards Pool, 20% Dev Treasury, 10% Marketing
 * 
 * Built with AI assistance (GitHub Copilot + Claude) for Seedify Vibe Coins Hackathon
 */
contract FeeDistributor is Ownable, Pausable {
    
    // ============================================
    // STATE VARIABLES
    // ============================================
    
    /// @notice Distribution percentages (sum = 100)
    uint256 public constant REWARDS_PERCENTAGE = 70;
    uint256 public constant DEV_PERCENTAGE = 20;
    uint256 public constant MARKETING_PERCENTAGE = 10;
    
    /// @notice Accumulated balances for each pool
    uint256 public rewardsPoolBalance;
    uint256 public devTreasuryBalance;
    uint256 public marketingBalance;
    
    /// @notice Total fees received
    uint256 public totalFeesReceived;
    
    /// @notice Authorized game contract that can distribute fees
    address public gameContract;
    
    /// @notice Rewards pool contract address
    address public rewardsPoolContract;
    
    // ============================================
    // EVENTS
    // ============================================
    
    /// @notice Emitted when entry fee is distributed
    event FeeDistributed(
        uint256 totalAmount,
        uint256 rewardsAmount,
        uint256 devAmount,
        uint256 marketingAmount,
        uint256 timestamp
    );
    
    /// @notice Emitted when rewards pool withdraws
    event RewardsWithdrawn(address indexed to, uint256 amount);
    
    /// @notice Emitted when dev treasury withdraws
    event DevWithdrawn(address indexed to, uint256 amount);
    
    /// @notice Emitted when marketing withdraws
    event MarketingWithdrawn(address indexed to, uint256 amount);
    
    /// @notice Emitted when game contract is updated
    event GameContractUpdated(address indexed oldContract, address indexed newContract);
    
    /// @notice Emitted when rewards pool contract is updated
    event RewardsPoolContractUpdated(address indexed oldContract, address indexed newContract);
    
    // ============================================
    // MODIFIERS
    // ============================================
    
    /// @notice Only the authorized game contract can call
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
     * @dev Initializes the fee distributor
     */
    constructor() Ownable(msg.sender) {}
    
    // ============================================
    // EXTERNAL FUNCTIONS
    // ============================================
    
    /**
     * @notice Distribute received entry fee into three pools
     * @dev Called by game contract when player pays entry fee
     * @dev Automatically splits: 70% rewards, 20% dev, 10% marketing
     */
    function distributeEntryFee() external payable onlyGameContract whenNotPaused {
        require(msg.value > 0, "Amount must be greater than 0");
        
        uint256 amount = msg.value;
        
        // Calculate distribution amounts
        uint256 rewardsAmount = (amount * REWARDS_PERCENTAGE) / 100;
        uint256 devAmount = (amount * DEV_PERCENTAGE) / 100;
        uint256 marketingAmount = (amount * MARKETING_PERCENTAGE) / 100;
        
        // Handle rounding (any dust goes to rewards pool)
        uint256 distributed = rewardsAmount + devAmount + marketingAmount;
        if (distributed < amount) {
            rewardsAmount += (amount - distributed);
        }
        
        // Update balances
        rewardsPoolBalance += rewardsAmount;
        devTreasuryBalance += devAmount;
        marketingBalance += marketingAmount;
        totalFeesReceived += amount;
        
        // Emit event
        emit FeeDistributed(
            amount,
            rewardsAmount,
            devAmount,
            marketingAmount,
            block.timestamp
        );
    }
    
    /**
     * @notice Withdraw accumulated rewards pool balance
     * @dev Only callable by rewards pool contract
     * @param to Address to send funds
     * @return amount Amount withdrawn
     */
    function withdrawRewardsPool(address to) external onlyRewardsPool returns (uint256) {
        require(to != address(0), "Invalid address");
        
        uint256 amount = rewardsPoolBalance;
        require(amount > 0, "No balance to withdraw");
        
        rewardsPoolBalance = 0;
        
        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit RewardsWithdrawn(to, amount);
        
        return amount;
    }
    
    /**
     * @notice Withdraw accumulated dev treasury balance
     * @dev Only callable by owner
     * @param to Address to send funds
     * @return amount Amount withdrawn
     */
    function withdrawDevTreasury(address to) external onlyOwner returns (uint256) {
        require(to != address(0), "Invalid address");
        
        uint256 amount = devTreasuryBalance;
        require(amount > 0, "No balance to withdraw");
        
        devTreasuryBalance = 0;
        
        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit DevWithdrawn(to, amount);
        
        return amount;
    }
    
    /**
     * @notice Withdraw accumulated marketing balance
     * @dev Only callable by owner
     * @param to Address to send funds
     * @return amount Amount withdrawn
     */
    function withdrawMarketing(address to) external onlyOwner returns (uint256) {
        require(to != address(0), "Invalid address");
        
        uint256 amount = marketingBalance;
        require(amount > 0, "No balance to withdraw");
        
        marketingBalance = 0;
        
        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit MarketingWithdrawn(to, amount);
        
        return amount;
    }
    
    /**
     * @notice Get all balances
     * @return rewards Rewards pool balance
     * @return dev Dev treasury balance
     * @return marketing Marketing balance
     */
    function getBalances() external view returns (
        uint256 rewards,
        uint256 dev,
        uint256 marketing
    ) {
        return (rewardsPoolBalance, devTreasuryBalance, marketingBalance);
    }
    
    /**
     * @notice Get total contract balance
     * @return Total ETH held by contract
     */
    function getTotalBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // ============================================
    // OWNER FUNCTIONS
    // ============================================
    
    /**
     * @notice Set the authorized game contract address
     * @dev Only callable by owner
     * @param _gameContract Address of the game contract
     */
    function setGameContract(address _gameContract) external onlyOwner {
        require(_gameContract != address(0), "Invalid address");
        
        address oldContract = gameContract;
        gameContract = _gameContract;
        
        emit GameContractUpdated(oldContract, _gameContract);
    }
    
    /**
     * @notice Set the rewards pool contract address
     * @dev Only callable by owner
     * @param _rewardsPoolContract Address of the rewards pool contract
     */
    function setRewardsPoolContract(address _rewardsPoolContract) external onlyOwner {
        require(_rewardsPoolContract != address(0), "Invalid address");
        
        address oldContract = rewardsPoolContract;
        rewardsPoolContract = _rewardsPoolContract;
        
        emit RewardsPoolContractUpdated(oldContract, _rewardsPoolContract);
    }
    
    /**
     * @notice Pause fee distribution (emergency use)
     * @dev Only callable by owner
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause fee distribution
     * @dev Only callable by owner
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Emergency withdrawal (only if critical issue)
     * @dev Only callable by owner, should rarely be used
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
     * @notice Prevent direct ETH transfers
     * @dev Only accept ETH through distributeEntryFee
     */
    receive() external payable {
        revert("Use distributeEntryFee function");
    }
}
