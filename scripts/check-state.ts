import { ethers } from "hardhat";

async function main() {
  const wallet = "0x63681916b9Bb50F885AA707f86F68dCC785c022e";
  const gameAddress = "0x9E4cD14a37959b6852951fcfbf495d838e9e36A8";
  
  const game = await ethers.getContractAt("DungeonGame", gameAddress);
  
  console.log("Checking state for wallet:", wallet);
  console.log("Game contract:", gameAddress);
  console.log("");
  
  const activeToken = await game.activeTokenByWallet(wallet);
  console.log("activeTokenByWallet:", activeToken.toString());
  
  // Check tokenRuns for tokens 1-5
  for (let i = 1; i <= 5; i++) {
    try {
      const run = await game.tokenRuns(i);
      console.log(`tokenRuns[${i}]:`, {
        lastKnownOwner: run.lastKnownOwner,
        status: run.status.toString(),
        nftDeposited: run.nftDeposited,
        currentRoom: run.currentRoom.toString(),
        currentHP: run.currentHP.toString(),
      });
    } catch (e) {
      console.log(`tokenRuns[${i}]: error`);
    }
  }
}

main().catch(console.error);
