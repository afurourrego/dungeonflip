import { expect } from "chai";
import { ethers } from "hardhat";
import { RewardsPool, FeeDistributor } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

/**
 * Test suite for RewardsPool contract
 * Built with AI assistance (GitHub Copilot + Claude) for Seedify Vibe Coins Hackathon
 */
describe("RewardsPool", function () {
  let rewardsPool: RewardsPool;
  let feeDistributor: FeeDistributor;
  let owner: SignerWithAddress;
  let progressTracker: SignerWithAddress;
  let gameContract: SignerWithAddress;
  let players: SignerWithAddress[];

  const ENTRY_FEE = ethers.parseEther("0.00001");
  const WEEK = 7 * 24 * 60 * 60; // 7 days in seconds

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    owner = signers[0];
    progressTracker = signers[1];
    gameContract = signers[2];
    players = signers.slice(3, 13); // 10 players

    // Deploy FeeDistributor
    const FeeDistributorFactory = await ethers.getContractFactory("FeeDistributor");
    feeDistributor = await FeeDistributorFactory.deploy() as unknown as FeeDistributor;
    
    // Deploy RewardsPool
    const RewardsPoolFactory = await ethers.getContractFactory("RewardsPool");
    rewardsPool = await RewardsPoolFactory.deploy() as unknown as RewardsPool;
    
    // Configure contracts
    await feeDistributor.setGameContract(gameContract.address);
    await feeDistributor.setRewardsPoolContract(await rewardsPool.getAddress());
    await rewardsPool.setFeeDistributor(await feeDistributor.getAddress());
    await rewardsPool.setProgressTracker(progressTracker.address);
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await rewardsPool.owner()).to.equal(owner.address);
    });

    it("Should initialize with week 1", async function () {
      expect(await rewardsPool.currentWeek()).to.equal(1);
    });

    it("Should set last week advance timestamp", async function () {
      expect(await rewardsPool.lastWeekAdvance()).to.be.gt(0);
    });

    it("Should have correct prize percentages", async function () {
      const expectedPercentages = [30, 20, 15, 10, 8, 6, 4, 3, 2, 2];
      
      for (let i = 0; i < 10; i++) {
        expect(await rewardsPool.PRIZE_PERCENTAGES(i)).to.equal(expectedPercentages[i]);
      }
    });

    it("Should not be paused on deployment", async function () {
      expect(await rewardsPool.paused()).to.equal(false);
    });
  });

  describe("Contract Configuration", function () {
    it("Should allow owner to set fee distributor", async function () {
      const newDistributor = players[0].address;
      
      await expect(rewardsPool.setFeeDistributor(newDistributor))
        .to.emit(rewardsPool, "FeeDistributorUpdated");
      
      expect(await rewardsPool.feeDistributor()).to.equal(newDistributor);
    });

    it("Should allow owner to set progress tracker", async function () {
      const newTracker = players[0].address;
      
      await expect(rewardsPool.setProgressTracker(newTracker))
        .to.emit(rewardsPool, "ProgressTrackerUpdated");
      
      expect(await rewardsPool.progressTracker()).to.equal(newTracker);
    });

    it("Should prevent setting zero address as fee distributor", async function () {
      await expect(
        rewardsPool.setFeeDistributor(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });

    it("Should prevent setting zero address as progress tracker", async function () {
      await expect(
        rewardsPool.setProgressTracker(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });

    it("Should prevent non-owner from setting contracts", async function () {
      await expect(
        rewardsPool.connect(players[0]).setFeeDistributor(players[0].address)
      ).to.be.revertedWithCustomError(rewardsPool, "OwnableUnauthorizedAccount");
    });
  });

  describe("Week Advancement", function () {
    it("Should not allow advancing week too early", async function () {
      await expect(
        rewardsPool.advanceWeek()
      ).to.be.revertedWith("Too early to advance week");
    });

    it("Should allow advancing week after MIN_ADVANCE_INTERVAL", async function () {
      await time.increase(6 * 24 * 60 * 60); // 6 days
      
      await expect(rewardsPool.advanceWeek())
        .to.emit(rewardsPool, "WeekAdvanced")
        .withArgs(2, await time.latest() + 1, 0);
      
      expect(await rewardsPool.currentWeek()).to.equal(2);
    });

    it("Should update lastWeekAdvance timestamp", async function () {
      await time.increase(6 * 24 * 60 * 60);
      
      const tx = await rewardsPool.advanceWeek();
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);
      
      expect(await rewardsPool.lastWeekAdvance()).to.equal(block!.timestamp);
    });

    it("Should prevent advancing when paused", async function () {
      await time.increase(6 * 24 * 60 * 60);
      await rewardsPool.pause();
      
      await expect(
        rewardsPool.advanceWeek()
      ).to.be.revertedWithCustomError(rewardsPool, "EnforcedPause");
    });

    it("Should allow multiple week advancements", async function () {
      for (let i = 0; i < 3; i++) {
        await time.increase(6 * 24 * 60 * 60);
        await rewardsPool.advanceWeek();
      }
      
      expect(await rewardsPool.currentWeek()).to.equal(4);
    });
  });

  describe("Rewards Distribution", function () {
    beforeEach(async function () {
      // Simulate entry fees to build up rewards pool
      for (let i = 0; i < 10; i++) {
        await feeDistributor.connect(gameContract).distributeEntryFee({ value: ENTRY_FEE });
      }
    });

    it("Should distribute rewards to top 10 players", async function () {
      const playerAddresses = players.map(p => p.address);
      
      await expect(rewardsPool.connect(progressTracker).distributeRewards(playerAddresses))
        .to.emit(rewardsPool, "RewardsDistributed");
    });

    it("Should transfer correct prize amounts", async function () {
      const playerAddresses = players.map(p => p.address);
      const balancesBefore = await Promise.all(
        players.map(p => ethers.provider.getBalance(p.address))
      );
      
      await rewardsPool.connect(progressTracker).distributeRewards(playerAddresses);
      
      const balancesAfter = await Promise.all(
        players.map(p => ethers.provider.getBalance(p.address))
      );
      
      // Check 1st place got ~30% of 70% of total fees (0.00007 ETH * 0.3 = 0.000021 ETH)
      const firstPlacePrize = balancesAfter[0] - balancesBefore[0];
      expect(firstPlacePrize).to.be.closeTo(ethers.parseEther("0.000021"), ethers.parseEther("0.000001"));
    });

    it("Should emit PrizeAwarded events for all winners", async function () {
      const playerAddresses = players.map(p => p.address);
      
      const tx = await rewardsPool.connect(progressTracker).distributeRewards(playerAddresses);
      const receipt = await tx.wait();
      
      // Should have 10 PrizeAwarded events
      const prizeEvents = receipt!.logs.filter((log: any) => {
        try {
          const parsed = rewardsPool.interface.parseLog(log);
          return parsed?.name === "PrizeAwarded";
        } catch {
          return false;
        }
      });
      
      expect(prizeEvents.length).to.equal(10);
    });

    it("Should update week history after distribution", async function () {
      const playerAddresses = players.map(p => p.address);
      
      // Advance to week 2 so distribution saves to week 1
      await time.increase(6 * 24 * 60 * 60);
      await rewardsPool.advanceWeek();
      
      await rewardsPool.connect(progressTracker).distributeRewards(playerAddresses);
      
      // History records for week currentWeek - 1 (now week 1)
      const history = await rewardsPool.getWeekHistory(1);
      expect(history.totalPrize).to.be.gt(0);
      expect(history.distributed).to.be.true;
      expect(history.weekNumber).to.equal(1);
    });

    it("Should update total prizes distributed", async function () {
      const playerAddresses = players.map(p => p.address);
      
      await rewardsPool.connect(progressTracker).distributeRewards(playerAddresses);
      
      expect(await rewardsPool.totalPrizesDistributed()).to.be.gt(0);
    });

    it("Should require exactly 10 players", async function () {
      const tooFewPlayers = players.slice(0, 9).map(p => p.address);
      
      await expect(
        rewardsPool.connect(progressTracker).distributeRewards(tooFewPlayers)
      ).to.be.revertedWith("Must provide exactly 10 players");
    });

    it("Should prevent non-progress-tracker from distributing", async function () {
      const playerAddresses = players.map(p => p.address);
      
      await expect(
        rewardsPool.connect(players[0]).distributeRewards(playerAddresses)
      ).to.be.revertedWith("Only progress tracker, game, or owner");
    });

    it("Should prevent distribution with zero address in winners", async function () {
      const playerAddresses = players.map(p => p.address);
      playerAddresses[5] = ethers.ZeroAddress;
      
      await expect(
        rewardsPool.connect(progressTracker).distributeRewards(playerAddresses)
      ).to.be.revertedWith("Invalid winner address");
    });

    it("Should prevent distribution when paused", async function () {
      await rewardsPool.pause();
      const playerAddresses = players.map(p => p.address);
      
      await expect(
        rewardsPool.connect(progressTracker).distributeRewards(playerAddresses)
      ).to.be.revertedWithCustomError(rewardsPool, "EnforcedPause");
    });

    it("Should handle dust correctly", async function () {
      const playerAddresses = players.map(p => p.address);
      
      // Use odd amount that creates dust
      await feeDistributor.connect(gameContract).distributeEntryFee({ 
        value: ethers.parseEther("0.011") 
      });
      
      await rewardsPool.connect(progressTracker).distributeRewards(playerAddresses);
      
      // Contract balance should be zero (all distributed including dust)
      expect(await rewardsPool.getCurrentPoolBalance()).to.equal(0);
    });
  });

  describe("View Functions", function () {
    it("Should return current pool balance", async function () {
      expect(await rewardsPool.getCurrentPoolBalance()).to.equal(0);
      
      await feeDistributor.connect(gameContract).distributeEntryFee({ value: ENTRY_FEE });
      
      // Balance is still in fee distributor until withdrawn
      expect(await rewardsPool.getCurrentPoolBalance()).to.equal(0);
    });

    it("Should check if week can be advanced", async function () {
      expect(await rewardsPool.canAdvanceWeek()).to.be.false;
      
      await time.increase(6 * 24 * 60 * 60);
      
      expect(await rewardsPool.canAdvanceWeek()).to.be.true;
    });

    it("Should calculate time until next week", async function () {
      const timeUntil = await rewardsPool.timeUntilNextWeek();
      expect(timeUntil).to.be.gt(0);
      
      await time.increase(6 * 24 * 60 * 60);
      
      expect(await rewardsPool.timeUntilNextWeek()).to.equal(0);
    });

    it("Should return expected prizes", async function () {
      // getExpectedPrizes() returns prizes based on RewardsPool's current balance
      // In normal operation, RewardsPool balance is 0 until distributeRewards() is called
      // So we check with 0 balance (expected behavior)
      const expectedPrizes = await rewardsPool.getExpectedPrizes();
      
      // With 0 balance, all prizes should be 0
      expect(expectedPrizes.length).to.equal(10);
      for (let i = 0; i < 10; i++) {
        expect(expectedPrizes[i]).to.equal(0);
      }
    });

    it("Should return week history", async function () {
      await time.increase(6 * 24 * 60 * 60);
      await rewardsPool.advanceWeek();
      
      const history = await rewardsPool.getWeekHistory(1);
      expect(history.weekNumber).to.equal(1);
    });
  });

  describe("Pause Functionality", function () {
    it("Should allow owner to pause", async function () {
      await rewardsPool.pause();
      expect(await rewardsPool.paused()).to.be.true;
    });

    it("Should allow owner to unpause", async function () {
      await rewardsPool.pause();
      await rewardsPool.unpause();
      expect(await rewardsPool.paused()).to.be.false;
    });

    it("Should prevent non-owner from pausing", async function () {
      await expect(
        rewardsPool.connect(players[0]).pause()
      ).to.be.revertedWithCustomError(rewardsPool, "OwnableUnauthorizedAccount");
    });
  });

  describe("Emergency Withdrawal", function () {
    it("Should revert when no balance to withdraw", async function () {
      // RewardsPool has no balance in normal operation
      await expect(
        rewardsPool.emergencyWithdraw(owner.address)
      ).to.be.revertedWith("No balance");
    });

    it("Should prevent non-owner from emergency withdrawal", async function () {
      await expect(
        rewardsPool.connect(players[0]).emergencyWithdraw(players[0].address)
      ).to.be.revertedWithCustomError(rewardsPool, "OwnableUnauthorizedAccount");
    });

    it("Should prevent withdrawal to zero address", async function () {
      await expect(
        rewardsPool.emergencyWithdraw(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });
  });

  describe("Receive Function", function () {
    it("Should accept ETH from fee distributor during distribution", async function () {
      await feeDistributor.connect(gameContract).distributeEntryFee({ value: ENTRY_FEE });
      
      // Distribute rewards will trigger receive function
      const playerAddresses = players.map(p => p.address);
      await expect(
        rewardsPool.connect(progressTracker).distributeRewards(playerAddresses)
      ).to.not.be.reverted;
    });
  });

  describe("Integration Scenarios", function () {
    it("Should handle complete weekly cycle", async function () {
      // Week 1: Accumulate fees
      for (let i = 0; i < 10; i++) {
        await feeDistributor.connect(gameContract).distributeEntryFee({ value: ENTRY_FEE });
      }
      
      // Advance week
      await time.increase(6 * 24 * 60 * 60);
      await rewardsPool.advanceWeek();
      
      // Distribute rewards
      const playerAddresses = players.map(p => p.address);
      await rewardsPool.connect(progressTracker).distributeRewards(playerAddresses);
      
      // Check week 2 started
      expect(await rewardsPool.currentWeek()).to.equal(2);
      
      // Check history
      const history = await rewardsPool.getWeekHistory(1);
      expect(history.distributed).to.be.true;
    });

    it("Should handle multiple weeks", async function () {
      for (let week = 0; week < 3; week++) {
        // Accumulate fees
        for (let i = 0; i < 5; i++) {
          await feeDistributor.connect(gameContract).distributeEntryFee({ value: ENTRY_FEE });
        }
        
        // Advance and distribute
        if (week > 0) {
          await time.increase(6 * 24 * 60 * 60);
          await rewardsPool.advanceWeek();
        }
        
        const playerAddresses = players.map(p => p.address);
        await rewardsPool.connect(progressTracker).distributeRewards(playerAddresses);
      }
      
      expect(await rewardsPool.totalPrizesDistributed()).to.be.gt(0);
    });
  });
});
