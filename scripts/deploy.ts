import { ethers } from "hardhat";

/**
 * Deployment script for DungeonFlip contracts
 * Deploys to Base Sepolia testnet
 * Built with AI assistance (GitHub Copilot) for Seedify Vibe Coins Hackathon
 */
async function main() {
  console.log("🚀 Starting DungeonFlip deployment to Base Sepolia...\n");

  const signers = await ethers.getSigners();
  if (!signers.length) {
    throw new Error(
      "No deployer account available. Set PRIVATE_KEY in .env (without 0x) and fund it with Base Sepolia ETH."
    );
  }
  const [deployer] = signers;
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // 1. Deploy AventurerNFT
  console.log("1️⃣  Deploying AventurerNFT...");
  const AventurerNFTFactory = await ethers.getContractFactory("AventurerNFT");
  const aventurerNFT = await AventurerNFTFactory.deploy();
  await aventurerNFT.waitForDeployment();
  const nftAddress = await aventurerNFT.getAddress();
  console.log("✅ AventurerNFT deployed to:", nftAddress, "\n");

  // 2. Deploy FeeDistributor
  console.log("2️⃣  Deploying FeeDistributor...");
  const FeeDistributorFactory = await ethers.getContractFactory("FeeDistributor");
  const feeDistributor = await FeeDistributorFactory.deploy();
  await feeDistributor.waitForDeployment();
  const feeDistributorAddress = await feeDistributor.getAddress();
  console.log("✅ FeeDistributor deployed to:", feeDistributorAddress, "\n");

  // 3. Deploy ProgressTracker
  console.log("3️⃣  Deploying ProgressTracker...");
  const ProgressTrackerFactory = await ethers.getContractFactory("ProgressTracker");
  const progressTracker = await ProgressTrackerFactory.deploy();
  await progressTracker.waitForDeployment();
  const progressTrackerAddress = await progressTracker.getAddress();
  console.log("✅ ProgressTracker deployed to:", progressTrackerAddress, "\n");

  // 4. Deploy RewardsPool
  console.log("4️⃣  Deploying RewardsPool...");
  const RewardsPoolFactory = await ethers.getContractFactory("RewardsPool");
  const rewardsPool = await RewardsPoolFactory.deploy();
  await rewardsPool.waitForDeployment();
  const rewardsPoolAddress = await rewardsPool.getAddress();
  console.log("✅ RewardsPool deployed to:", rewardsPoolAddress, "\n");

  // 5. Deploy DungeonGame
  console.log("5️⃣  Deploying DungeonGame...");
  const DungeonGameFactory = await ethers.getContractFactory("DungeonGame");
  const dungeonGame = await DungeonGameFactory.deploy(
    nftAddress,
    feeDistributorAddress,
    progressTrackerAddress,
    rewardsPoolAddress
  );
  await dungeonGame.waitForDeployment();
  const dungeonGameAddress = await dungeonGame.getAddress();
  console.log("✅ DungeonGame deployed to:", dungeonGameAddress, "\n");

  // 6. Configure contracts
  console.log("⚙️  Configuring contract connections...\n");

  console.log("   Setting game contract in FeeDistributor...");
  await feeDistributor.setGameContract(dungeonGameAddress);
  
  console.log("   Setting rewards pool in FeeDistributor...");
  await feeDistributor.setRewardsPoolContract(rewardsPoolAddress);
  
  console.log("   Setting game contract in ProgressTracker...");
  await progressTracker.setGameContract(dungeonGameAddress);
  
  console.log("   Setting rewards pool in ProgressTracker...");
  await progressTracker.setRewardsPoolContract(rewardsPoolAddress);
  
  console.log("   Setting fee distributor in RewardsPool...");
  await rewardsPool.setFeeDistributor(feeDistributorAddress);
  
  console.log("   Setting progress tracker in RewardsPool...");
  await rewardsPool.setProgressTracker(progressTrackerAddress);
  
  console.log("   Setting game contract in RewardsPool...");
  await rewardsPool.setGameContract(dungeonGameAddress);
  
  console.log("✅ Configuration complete!\n");

  // Summary
  console.log("═══════════════════════════════════════════════════════");
  console.log("🎉 DEPLOYMENT SUCCESSFUL! 🎉");
  console.log("═══════════════════════════════════════════════════════\n");
  
  console.log("📋 Contract Addresses:");
  console.log("   AventurerNFT:     ", nftAddress);
  console.log("   FeeDistributor:   ", feeDistributorAddress);
  console.log("   ProgressTracker:  ", progressTrackerAddress);
  console.log("   RewardsPool:      ", rewardsPoolAddress);
  console.log("   DungeonGame:      ", dungeonGameAddress);
  console.log("");

  console.log("📝 Next Steps:");
  console.log("   1. Verify contracts on BaseScan:");
  console.log("      npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS>");
  console.log("");
  console.log("   2. Save addresses to .env:");
  console.log("      AVENTURER_NFT_ADDRESS=" + nftAddress);
  console.log("      FEE_DISTRIBUTOR_ADDRESS=" + feeDistributorAddress);
  console.log("      PROGRESS_TRACKER_ADDRESS=" + progressTrackerAddress);
  console.log("      REWARDS_POOL_ADDRESS=" + rewardsPoolAddress);
  console.log("      DUNGEON_GAME_ADDRESS=" + dungeonGameAddress);
  console.log("");
  console.log("   3. Test the deployment:");
  console.log("      - Mint an NFT");
  console.log("      - Start a game with 0.01 ETH");
  console.log("      - Complete the game");
  console.log("");
  console.log("🔗 View on BaseScan:");
  console.log("   https://sepolia.basescan.org/address/" + dungeonGameAddress);
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
