import { ethers } from "hardhat";

/**
 * Script to manually trigger weekly reward distribution
 * Can be run manually or scheduled via cron job
 *
 * Usage:
 * npx hardhat run scripts/distribute-rewards.ts --network baseSepolia
 *
 * Built with AI assistance (Claude Code) for Seedify Vibe Coins Hackathon
 */
async function main() {
  console.log("🎁 Starting Weekly Rewards Distribution...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Using account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Contract addresses (update these after deployment)
  const REWARDS_POOL_ADDRESS = process.env.REWARDS_POOL_ADDRESS || "0x9A19912DDb7e71b4dccC9036f9395D88979A4F17";
  const PROGRESS_TRACKER_ADDRESS = process.env.PROGRESS_TRACKER_ADDRESS || "0x623435ECC6b3B418d79EE396298aF59710632595";

  // Connect to contracts
  console.log("🔗 Connecting to contracts...");
  const rewardsPool = await ethers.getContractAt("RewardsPool", REWARDS_POOL_ADDRESS);
  const progressTracker = await ethers.getContractAt("ProgressTracker", PROGRESS_TRACKER_ADDRESS);
  console.log("✅ Connected\n");

  // Check if we can advance the week
  console.log("⏰ Checking if week can be advanced...");
  const canAdvance = await rewardsPool.canAdvanceWeek();

  if (!canAdvance) {
    const timeUntil = await rewardsPool.timeUntilNextWeek();
    const hours = Number(timeUntil) / 3600;
    console.log(`❌ Cannot advance week yet. Time remaining: ${hours.toFixed(2)} hours`);
    console.log("\n⚠️  Distribution not executed.");
    return;
  }

  console.log("✅ Week can be advanced\n");

  // Get current week info
  const currentWeek = await rewardsPool.currentWeek();
  console.log(`📅 Current week: ${currentWeek}`);

  // Get pool balance
  const poolBalance = await rewardsPool.getCurrentPoolBalance();
  console.log(`💎 Current pool balance: ${ethers.formatEther(poolBalance)} ETH`);

  if (poolBalance === 0n) {
    console.log("\n⚠️  No funds in pool, advancing week without distribution...");
    const tx = await rewardsPool.advanceWeek();
    await tx.wait();
    console.log("✅ Week advanced to:", (await rewardsPool.currentWeek()).toString());
    return;
  }

  // Get expected prizes
  const expectedPrizes = await rewardsPool.getExpectedPrizes();
  console.log("\n💰 Expected Prize Distribution:");
  const ranks = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];
  for (let i = 0; i < 10; i++) {
    console.log(`   ${ranks[i]} place: ${ethers.formatEther(expectedPrizes[i])} ETH`);
  }

  // Get top 10 players
  console.log("\n🏆 Getting top 10 players from ProgressTracker...");
  const topPlayersWithScores = await progressTracker.getTopPlayers(Number(currentWeek));

  // Extract just addresses (getTopPlayers returns [addresses[], scores[]])
  const topPlayers = topPlayersWithScores[0];
  const scores = topPlayersWithScores[1];

  // Check if we have enough players
  const activePlayers = topPlayers.filter((addr: string) => addr !== ethers.ZeroAddress);
  console.log(`   Found ${activePlayers.length} active players this week`);

  if (activePlayers.length === 0) {
    console.log("\n⚠️  No active players this week, advancing week without distribution...");
    const tx = await rewardsPool.advanceWeek();
    await tx.wait();
    console.log("✅ Week advanced to:", (await rewardsPool.currentWeek()).toString());
    return;
  }

  // Display leaderboard
  console.log("\n📊 Current Leaderboard:");
  for (let i = 0; i < activePlayers.length && i < 10; i++) {
    const score = scores[i];
    const address = topPlayers[i];
    const shortAddr = `${address.slice(0, 6)}...${address.slice(-4)}`;
    console.log(`   ${ranks[i]}: ${shortAddr} - Score: ${score.toString()}`);
  }

  // Pad with zero addresses if fewer than 10 players
  const paddedPlayers = [...topPlayers];
  while (paddedPlayers.length < 10) {
    paddedPlayers.push(ethers.ZeroAddress);
  }

  console.log("\n🚀 Executing distribution...");
  console.log("   Step 1: Advancing week...");

  // Advance the week
  const advanceTx = await rewardsPool.advanceWeek();
  await advanceTx.wait();
  console.log("   ✅ Week advanced to:", (await rewardsPool.currentWeek()).toString());

  console.log("   Step 2: Distributing rewards...");

  // Distribute rewards
  try {
    const distributeTx = await rewardsPool.distributeRewards(paddedPlayers.slice(0, 10));
    const receipt = await distributeTx.wait();

    console.log("   ✅ Rewards distributed!");
    console.log(`   ⛽ Gas used: ${receipt?.gasUsed.toString()}`);

    // Parse events to show actual prizes
    const distributedEvent = receipt?.logs.find((log: any) => {
      try {
        const parsed = rewardsPool.interface.parseLog(log);
        return parsed?.name === "RewardsDistributed";
      } catch {
        return false;
      }
    });

    if (distributedEvent) {
      const parsed = rewardsPool.interface.parseLog(distributedEvent);
      const totalAmount = parsed?.args?.totalAmount;
      console.log(`   💎 Total distributed: ${ethers.formatEther(totalAmount)} ETH`);
    }

  } catch (error: any) {
    console.error("\n❌ Distribution failed:", error.message);

    // Check if it's due to insufficient players with non-zero addresses
    if (activePlayers.length < 10) {
      console.log("\n⚠️  Note: distributeRewards() requires exactly 10 non-zero addresses.");
      console.log("   Consider updating the contract to handle fewer than 10 players,");
      console.log("   or wait until there are at least 10 active players.");
    }

    throw error;
  }

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("🎉 DISTRIBUTION COMPLETE! 🎉");
  console.log("═══════════════════════════════════════════════════════\n");

  console.log("📝 Next Steps:");
  console.log("   1. Verify transactions on BaseScan");
  console.log("   2. Confirm winners received their prizes");
  console.log("   3. Update frontend to display new week");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
