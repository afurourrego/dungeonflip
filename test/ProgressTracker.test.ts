import { expect } from "chai";
import { ethers } from "hardhat";
import { ProgressTracker } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

/**
 * Test suite for ProgressTracker contract
 * Built with AI assistance (GitHub Copilot) for Seedify Vibe Coins Hackathon
 */
describe("ProgressTracker", function () {
  let progressTracker: ProgressTracker;
  let owner: SignerWithAddress;
  let gameContract: SignerWithAddress;
  let rewardsPool: SignerWithAddress;
  let players: SignerWithAddress[];

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    owner = signers[0];
    gameContract = signers[1];
    rewardsPool = signers[2];
    players = signers.slice(3, 23); // 20 players for testing

    const ProgressTrackerFactory = await ethers.getContractFactory("ProgressTracker");
    progressTracker = await ProgressTrackerFactory.deploy() as unknown as ProgressTracker;
    
    await progressTracker.setGameContract(gameContract.address);
    await progressTracker.setRewardsPoolContract(rewardsPool.address);
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await progressTracker.owner()).to.equal(owner.address);
    });

    it("Should initialize with week 1", async function () {
      expect(await progressTracker.currentWeek()).to.equal(1);
    });

    it("Should start with zero total players", async function () {
      expect(await progressTracker.totalPlayers()).to.equal(0);
    });

    it("Should not be paused on deployment", async function () {
      expect(await progressTracker.paused()).to.be.false;
    });
  });

  describe("Contract Configuration", function () {
    it("Should allow owner to set game contract", async function () {
      const newGameContract = players[0].address;
      await expect(progressTracker.setGameContract(newGameContract))
        .to.emit(progressTracker, "GameContractUpdated")
        .withArgs(gameContract.address, newGameContract);
      
      expect(await progressTracker.gameContract()).to.equal(newGameContract);
    });

    it("Should allow owner to set rewards pool contract", async function () {
      const newRewardsPool = players[0].address;
      await expect(progressTracker.setRewardsPoolContract(newRewardsPool))
        .to.emit(progressTracker, "RewardsPoolContractUpdated")
        .withArgs(rewardsPool.address, newRewardsPool);
      
      expect(await progressTracker.rewardsPoolContract()).to.equal(newRewardsPool);
    });

    it("Should prevent non-owner from setting game contract", async function () {
      await expect(
        progressTracker.connect(players[0]).setGameContract(players[1].address)
      ).to.be.revertedWithCustomError(progressTracker, "OwnableUnauthorizedAccount");
    });

    it("Should prevent setting zero address as game contract", async function () {
      await expect(
        progressTracker.setGameContract(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });

    it("Should prevent setting zero address as rewards pool", async function () {
      await expect(
        progressTracker.setRewardsPoolContract(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });
  });

  describe("Score Updates", function () {
    it("Should update player score", async function () {
      const player = players[0].address;
      const score = 100;

      await expect(
        progressTracker.connect(gameContract).updateScore(player, score)
      ).to.emit(progressTracker, "ScoreUpdated")
        .withArgs(player, score, score, score, 1);

      const progress = await progressTracker.getPlayerProgress(player);
      expect(progress.totalScore).to.equal(score);
      expect(progress.weeklyScore).to.equal(score);
      expect(progress.gamesPlayed).to.equal(1);
    });

    it("Should accumulate multiple scores", async function () {
      const player = players[0].address;
      
      await progressTracker.connect(gameContract).updateScore(player, 100);
      await progressTracker.connect(gameContract).updateScore(player, 50);
      await progressTracker.connect(gameContract).updateScore(player, 25);

      const progress = await progressTracker.getPlayerProgress(player);
      expect(progress.totalScore).to.equal(175);
      expect(progress.weeklyScore).to.equal(175);
      expect(progress.gamesPlayed).to.equal(3);
    });

    it("Should increment total players on first score", async function () {
      expect(await progressTracker.totalPlayers()).to.equal(0);
      
      await progressTracker.connect(gameContract).updateScore(players[0].address, 100);
      expect(await progressTracker.totalPlayers()).to.equal(1);
      
      await progressTracker.connect(gameContract).updateScore(players[1].address, 50);
      expect(await progressTracker.totalPlayers()).to.equal(2);
    });

    it("Should not increment total players on subsequent scores", async function () {
      await progressTracker.connect(gameContract).updateScore(players[0].address, 100);
      expect(await progressTracker.totalPlayers()).to.equal(1);
      
      await progressTracker.connect(gameContract).updateScore(players[0].address, 50);
      expect(await progressTracker.totalPlayers()).to.equal(1);
    });

    it("Should mark player as active", async function () {
      const player = players[0].address;
      expect(await progressTracker.isPlayerActive(player)).to.be.false;
      
      await progressTracker.connect(gameContract).updateScore(player, 100);
      expect(await progressTracker.isPlayerActive(player)).to.be.true;
    });

    it("Should prevent non-game contract from updating scores", async function () {
      await expect(
        progressTracker.connect(players[0]).updateScore(players[1].address, 100)
      ).to.be.revertedWith("Only game contract");
    });

    it("Should prevent zero score updates", async function () {
      await expect(
        progressTracker.connect(gameContract).updateScore(players[0].address, 0)
      ).to.be.revertedWith("Score must be greater than 0");
    });

    it("Should prevent zero address player", async function () {
      await expect(
        progressTracker.connect(gameContract).updateScore(ethers.ZeroAddress, 100)
      ).to.be.revertedWith("Invalid player address");
    });

    it("Should prevent updates when paused", async function () {
      await progressTracker.pause();
      
      await expect(
        progressTracker.connect(gameContract).updateScore(players[0].address, 100)
      ).to.be.revertedWithCustomError(progressTracker, "EnforcedPause");
    });
  });

  describe("Week Advancement", function () {
    it("Should advance to next week", async function () {
      expect(await progressTracker.currentWeek()).to.equal(1);
      
      await expect(progressTracker.connect(gameContract).advanceWeek())
        .to.emit(progressTracker, "WeekAdvanced")
        .withArgs(1, 2);
      
      expect(await progressTracker.currentWeek()).to.equal(2);
    });

    it("Should reset weekly scores on new week", async function () {
      const player = players[0].address;
      
      // Week 1: Score 100
      await progressTracker.connect(gameContract).updateScore(player, 100);
      let progress = await progressTracker.getPlayerProgress(player);
      expect(progress.weeklyScore).to.equal(100);
      expect(progress.totalScore).to.equal(100);
      
      // Advance to week 2
      await progressTracker.connect(gameContract).advanceWeek();
      
      // Week 2: Score 50 (weekly resets, total accumulates)
      await progressTracker.connect(gameContract).updateScore(player, 50);
      progress = await progressTracker.getPlayerProgress(player);
      expect(progress.weeklyScore).to.equal(50); // Reset for new week
      expect(progress.totalScore).to.equal(150); // Accumulated
    });

    it("Should prevent non-game contract from advancing week", async function () {
      await expect(
        progressTracker.connect(players[0]).advanceWeek()
      ).to.be.revertedWith("Only game contract");
    });

    it("Should prevent advancing when paused", async function () {
      await progressTracker.pause();
      
      await expect(
        progressTracker.connect(gameContract).advanceWeek()
      ).to.be.revertedWithCustomError(progressTracker, "EnforcedPause");
    });
  });

  describe("Leaderboard", function () {
    beforeEach(async function () {
      // Create leaderboard with different scores
      await progressTracker.connect(gameContract).updateScore(players[0].address, 500); // 1st
      await progressTracker.connect(gameContract).updateScore(players[1].address, 400); // 2nd
      await progressTracker.connect(gameContract).updateScore(players[2].address, 300); // 3rd
      await progressTracker.connect(gameContract).updateScore(players[3].address, 200); // 4th
      await progressTracker.connect(gameContract).updateScore(players[4].address, 180); // 5th
      await progressTracker.connect(gameContract).updateScore(players[5].address, 160); // 6th
      await progressTracker.connect(gameContract).updateScore(players[6].address, 140); // 7th
      await progressTracker.connect(gameContract).updateScore(players[7].address, 120); // 8th
      await progressTracker.connect(gameContract).updateScore(players[8].address, 100); // 9th
      await progressTracker.connect(gameContract).updateScore(players[9].address, 80);  // 10th
      await progressTracker.connect(gameContract).updateScore(players[10].address, 60); // 11th
    });

    it("Should return top 10 players sorted by score", async function () {
      const topPlayers = await progressTracker.connect(rewardsPool).getTopPlayers.staticCall(1);
      
      expect(topPlayers.length).to.equal(10);
      expect(topPlayers[0]).to.equal(players[0].address); // 500 points
      expect(topPlayers[1]).to.equal(players[1].address); // 400 points
      expect(topPlayers[9]).to.equal(players[9].address); // 80 points
    });

    it("Should emit LeaderboardFinalized event", async function () {
      await expect(
        progressTracker.connect(rewardsPool).getTopPlayers(1)
      ).to.emit(progressTracker, "LeaderboardFinalized");
    });

    it("Should store finalized leaderboard", async function () {
      await progressTracker.connect(rewardsPool).getTopPlayers(1);
      
      const storedLeaderboard = await progressTracker.getWeeklyLeaderboard(1);
      expect(storedLeaderboard.length).to.equal(11); // All 11 players
      expect(storedLeaderboard[0]).to.equal(players[0].address); // Top player
    });

    it("Should return cached leaderboard on second call", async function () {
      const firstCall = await progressTracker.connect(rewardsPool).getTopPlayers.staticCall(1);
      const secondCall = await progressTracker.connect(rewardsPool).getTopPlayers.staticCall(1);
      
      expect(firstCall.length).to.equal(10);
      expect(secondCall.length).to.equal(10);
      expect(firstCall[0]).to.equal(secondCall[0]);
    });

    it("Should prevent non-rewards pool from getting top players", async function () {
      await expect(
        progressTracker.connect(players[0]).getTopPlayers(1)
      ).to.be.revertedWith("Only rewards pool");
    });

    it("Should handle fewer than 10 players", async function () {
      // Deploy new tracker with only 3 players
      const ProgressTrackerFactory = await ethers.getContractFactory("ProgressTracker");
      const newTracker = await ProgressTrackerFactory.deploy() as unknown as ProgressTracker;
      await newTracker.setGameContract(gameContract.address);
      await newTracker.setRewardsPoolContract(rewardsPool.address);
      
      await newTracker.connect(gameContract).updateScore(players[0].address, 100);
      await newTracker.connect(gameContract).updateScore(players[1].address, 80);
      await newTracker.connect(gameContract).updateScore(players[2].address, 60);
      
      const topPlayers = await newTracker.connect(rewardsPool).getTopPlayers.staticCall(1);
      
      // Should return 10 slots, with only 3 filled (rest are zero addresses)
      expect(topPlayers.length).to.equal(10);
      expect(topPlayers[0]).to.equal(players[0].address);
      expect(topPlayers[1]).to.equal(players[1].address);
      expect(topPlayers[2]).to.equal(players[2].address);
      expect(topPlayers[3]).to.equal(ethers.ZeroAddress);
    });
  });

  describe("View Functions", function () {
    it("Should return player progress", async function () {
      const player = players[0].address;
      await progressTracker.connect(gameContract).updateScore(player, 100);
      await progressTracker.connect(gameContract).updateScore(player, 50);
      
      const progress = await progressTracker.getPlayerProgress(player);
      expect(progress.totalScore).to.equal(150);
      expect(progress.weeklyScore).to.equal(150);
      expect(progress.gamesPlayed).to.equal(2);
      expect(progress.lastPlayedWeek).to.equal(1);
      expect(progress.isActive).to.be.true;
    });

    it("Should return current week players", async function () {
      await progressTracker.connect(gameContract).updateScore(players[0].address, 100);
      await progressTracker.connect(gameContract).updateScore(players[1].address, 80);
      await progressTracker.connect(gameContract).updateScore(players[2].address, 60);
      
      const weekPlayers = await progressTracker.getCurrentWeekPlayers();
      expect(weekPlayers.length).to.equal(3);
    });

    it("Should return active player count", async function () {
      expect(await progressTracker.getActivePlayerCount()).to.equal(0);
      
      await progressTracker.connect(gameContract).updateScore(players[0].address, 100);
      expect(await progressTracker.getActivePlayerCount()).to.equal(1);
      
      await progressTracker.connect(gameContract).updateScore(players[1].address, 50);
      expect(await progressTracker.getActivePlayerCount()).to.equal(2);
    });

    it("Should check if player is active", async function () {
      expect(await progressTracker.isPlayerActive(players[0].address)).to.be.false;
      
      await progressTracker.connect(gameContract).updateScore(players[0].address, 100);
      expect(await progressTracker.isPlayerActive(players[0].address)).to.be.true;
    });

    it("Should return weekly leaderboard", async function () {
      await progressTracker.connect(gameContract).updateScore(players[0].address, 100);
      await progressTracker.connect(rewardsPool).getTopPlayers(1);
      
      const leaderboard = await progressTracker.getWeeklyLeaderboard(1);
      expect(leaderboard.length).to.be.gt(0);
    });
  });

  describe("Pause Functionality", function () {
    it("Should allow owner to pause", async function () {
      await progressTracker.pause();
      expect(await progressTracker.paused()).to.be.true;
    });

    it("Should allow owner to unpause", async function () {
      await progressTracker.pause();
      await progressTracker.unpause();
      expect(await progressTracker.paused()).to.be.false;
    });

    it("Should prevent non-owner from pausing", async function () {
      await expect(
        progressTracker.connect(players[0]).pause()
      ).to.be.revertedWithCustomError(progressTracker, "OwnableUnauthorizedAccount");
    });

    it("Should allow operations after unpause", async function () {
      await progressTracker.pause();
      await progressTracker.unpause();
      
      await expect(
        progressTracker.connect(gameContract).updateScore(players[0].address, 100)
      ).to.not.be.reverted;
    });
  });

  describe("Integration Scenarios", function () {
    it("Should handle complete weekly cycle", async function () {
      // Week 1: Players compete
      for (let i = 0; i < 10; i++) {
        await progressTracker.connect(gameContract).updateScore(
          players[i].address, 
          (10 - i) * 100 // Descending scores
        );
      }
      
      // Get leaderboard
      const week1Leaders = await progressTracker.connect(rewardsPool).getTopPlayers.staticCall(1);
      expect(week1Leaders[0]).to.equal(players[0].address);
      
      // Advance week
      await progressTracker.connect(gameContract).advanceWeek();
      expect(await progressTracker.currentWeek()).to.equal(2);
      
      // Week 2: Different results
      await progressTracker.connect(gameContract).updateScore(players[9].address, 1000);
      const progress = await progressTracker.getPlayerProgress(players[9].address);
      expect(progress.weeklyScore).to.equal(1000); // Reset for week 2
    });

    it("Should handle multiple weeks with different winners", async function () {
      // Week 1
      await progressTracker.connect(gameContract).updateScore(players[0].address, 100);
      await progressTracker.connect(gameContract).updateScore(players[1].address, 80);
      const week1Leaders = await progressTracker.connect(rewardsPool).getTopPlayers.staticCall(1);
      
      // Week 2
      await progressTracker.connect(gameContract).advanceWeek();
      await progressTracker.connect(gameContract).updateScore(players[2].address, 200);
      await progressTracker.connect(gameContract).updateScore(players[3].address, 150);
      const week2Leaders = await progressTracker.connect(rewardsPool).getTopPlayers.staticCall(2);
      
      // Verify different winners
      expect(week1Leaders[0]).to.equal(players[0].address);
      expect(week2Leaders[0]).to.equal(players[2].address);
    });
  });

  describe("Gas Optimization", function () {
    it("Should update score efficiently for first player", async function () {
      const tx = await progressTracker.connect(gameContract).updateScore(players[0].address, 100);
      const receipt = await tx.wait();
      
      // First update includes array push and initialization (~230k gas)
      expect(receipt!.gasUsed).to.be.lt(250000);
    });

    it("Should update score efficiently for subsequent updates", async function () {
      await progressTracker.connect(gameContract).updateScore(players[0].address, 100);
      
      const tx = await progressTracker.connect(gameContract).updateScore(players[0].address, 50);
      const receipt = await tx.wait();
      
      // Subsequent updates should be cheaper (~100k gas)
      expect(receipt!.gasUsed).to.be.lt(150000);
    });
  });
});
