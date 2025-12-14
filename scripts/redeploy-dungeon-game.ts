import { ethers, network } from "hardhat";

function requiredAddress(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Missing env var: ${name}`);
  if (!value.startsWith("0x") || value.length !== 42) throw new Error(`Invalid address in ${name}: ${value}`);
  return value;
}

function firstDefined(keys: string[]): { key: string; value: string } {
  for (const key of keys) {
    const value = process.env[key];
    if (value) return { key, value };
  }
  throw new Error(`Missing env var: one of [${keys.join(", ")}]`);
}

function requiredAddressFrom(keys: string[]): string {
  const { key, value } = firstDefined(keys);
  return requiredAddress(value, key);
}

async function main() {
  const signers = await ethers.getSigners();
  if (!signers.length) {
    throw new Error(
      "No deployer account available. Set PRIVATE_KEY in .env (without 0x) and ensure it has Base Sepolia ETH."
    );
  }
  const [deployer] = signers;

  const isSepolia = network.name === "baseSepolia";
  const suffix = isSepolia ? "_SEPOLIA" : "";

  // Support both frontend-style NEXT_PUBLIC_* vars and backend-style *_ADDRESS vars.
  // This lets us keep already-deployed supporting contracts and redeploy only DungeonGame.
  const aventurerNFTAddress = requiredAddressFrom([
    `NEXT_PUBLIC_AVENTURER_NFT_ADDRESS${suffix}`,
    "AVENTURER_NFT_ADDRESS",
  ]);
  const feeDistributorAddress = requiredAddressFrom([
    `NEXT_PUBLIC_FEE_DISTRIBUTOR_ADDRESS${suffix}`,
    "FEE_DISTRIBUTOR_ADDRESS",
  ]);
  const progressTrackerAddress = requiredAddressFrom([
    `NEXT_PUBLIC_PROGRESS_TRACKER_ADDRESS${suffix}`,
    "PROGRESS_TRACKER_ADDRESS",
  ]);
  const rewardsPoolAddress = requiredAddressFrom([
    `NEXT_PUBLIC_REWARDS_POOL_ADDRESS${suffix}`,
    "REWARDS_POOL_ADDRESS",
  ]);

  console.log(`Redeploying DungeonGame on network: ${network.name}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log("Using existing contracts:");
  console.log("  AventurerNFT:    ", aventurerNFTAddress);
  console.log("  FeeDistributor:  ", feeDistributorAddress);
  console.log("  ProgressTracker: ", progressTrackerAddress);
  console.log("  RewardsPool:     ", rewardsPoolAddress);

  const DungeonGameFactory = await ethers.getContractFactory("DungeonGame");
  const dungeonGame = await DungeonGameFactory.deploy(
    aventurerNFTAddress,
    feeDistributorAddress,
    progressTrackerAddress
  );
  await dungeonGame.waitForDeployment();
  const dungeonGameAddress = await dungeonGame.getAddress();

  console.log("✅ DungeonGame deployed to:", dungeonGameAddress);

  const feeDistributor = await ethers.getContractAt("FeeDistributor", feeDistributorAddress);
  const progressTracker = await ethers.getContractAt("ProgressTracker", progressTrackerAddress);
  const rewardsPool = await ethers.getContractAt("RewardsPool", rewardsPoolAddress);

  console.log("Updating game contract references...");
  await (await feeDistributor.setGameContract(dungeonGameAddress)).wait();
  await (await progressTracker.setGameContract(dungeonGameAddress)).wait();
  await (await rewardsPool.setGameContract(dungeonGameAddress)).wait();

  console.log("✅ References updated.");
  console.log("");
  console.log("Next:");
  console.log(
    `- Set NEXT_PUBLIC_DUNGEON_GAME_ADDRESS${suffix}=${dungeonGameAddress} in your .env and restart the frontend`
  );
}

main().catch((error) => {
  console.error("❌ Redeploy failed:", error);
  process.exitCode = 1;
});

