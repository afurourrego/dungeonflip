import { expect } from "chai";
import { ethers } from "hardhat";
import { FeeDistributor } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

/**
 * Test suite for FeeDistributor contract
 * Built with AI assistance (GitHub Copilot + Claude) for Seedify Vibe Coins Hackathon
 */
describe("FeeDistributor", function () {
  let distributor: FeeDistributor;
  let owner: SignerWithAddress;
  let gameContract: SignerWithAddress;
  let rewardsPool: SignerWithAddress;
  let devTreasury: SignerWithAddress;
  let marketing: SignerWithAddress;
  let player: SignerWithAddress;

  const ENTRY_FEE = ethers.parseEther("0.00001");

  beforeEach(async function () {
    [owner, gameContract, rewardsPool, devTreasury, marketing, player] = await ethers.getSigners();
    
    const DistributorFactory = await ethers.getContractFactory("FeeDistributor");
    distributor = await DistributorFactory.deploy() as unknown as FeeDistributor;
    
    // Set authorized contracts
    await distributor.setGameContract(gameContract.address);
    await distributor.setRewardsPoolContract(rewardsPool.address);
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await distributor.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero balances", async function () {
      const [rewards, dev, mkt] = await distributor.getBalances();
      expect(rewards).to.equal(0);
      expect(dev).to.equal(0);
      expect(mkt).to.equal(0);
    });

    it("Should have correct distribution percentages", async function () {
      expect(await distributor.REWARDS_PERCENTAGE()).to.equal(70);
      expect(await distributor.DEV_PERCENTAGE()).to.equal(20);
      expect(await distributor.MARKETING_PERCENTAGE()).to.equal(10);
    });

    it("Should not be paused on deployment", async function () {
      expect(await distributor.paused()).to.equal(false);
    });
  });

  describe("Contract Configuration", function () {
    it("Should allow owner to set game contract", async function () {
      const newGame = player.address;
      
      await expect(distributor.setGameContract(newGame))
        .to.emit(distributor, "GameContractUpdated")
        .withArgs(gameContract.address, newGame);
      
      expect(await distributor.gameContract()).to.equal(newGame);
    });

    it("Should allow owner to set rewards pool contract", async function () {
      const newPool = player.address;
      
      await expect(distributor.setRewardsPoolContract(newPool))
        .to.emit(distributor, "RewardsPoolContractUpdated")
        .withArgs(rewardsPool.address, newPool);
      
      expect(await distributor.rewardsPoolContract()).to.equal(newPool);
    });

    it("Should prevent non-owner from setting game contract", async function () {
      await expect(
        distributor.connect(player).setGameContract(player.address)
      ).to.be.revertedWithCustomError(distributor, "OwnableUnauthorizedAccount");
    });

    it("Should prevent setting zero address as game contract", async function () {
      await expect(
        distributor.setGameContract(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });

    it("Should prevent setting zero address as rewards pool", async function () {
      await expect(
        distributor.setRewardsPoolContract(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });
  });

  describe("Fee Distribution", function () {
    it("Should correctly distribute entry fee (70/20/10)", async function () {
      await distributor.connect(gameContract).distributeEntryFee({ value: ENTRY_FEE });
      
      const [rewards, dev, mkt] = await distributor.getBalances();
      
      // 70% of 0.00001 ETH = 0.000007 ETH
      expect(rewards).to.equal(ethers.parseEther("0.000007"));
      
      // 20% of 0.00001 ETH = 0.000002 ETH
      expect(dev).to.equal(ethers.parseEther("0.000002"));
      
      // 10% of 0.00001 ETH = 0.000001 ETH
      expect(mkt).to.equal(ethers.parseEther("0.000001"));
    });

    it("Should emit FeeDistributed event", async function () {
      const tx = await distributor.connect(gameContract).distributeEntryFee({ value: ENTRY_FEE });
      
      await expect(tx).to.emit(distributor, "FeeDistributed");
    });

    it("Should track total fees received", async function () {
      await distributor.connect(gameContract).distributeEntryFee({ value: ENTRY_FEE });
      await distributor.connect(gameContract).distributeEntryFee({ value: ENTRY_FEE });
      
      expect(await distributor.totalFeesReceived()).to.equal(ethers.parseEther("0.00002"));
    });

    it("Should handle multiple fee distributions", async function () {
      await distributor.connect(gameContract).distributeEntryFee({ value: ENTRY_FEE });
      await distributor.connect(gameContract).distributeEntryFee({ value: ENTRY_FEE });
      await distributor.connect(gameContract).distributeEntryFee({ value: ENTRY_FEE });
      
      const [rewards, dev, mkt] = await distributor.getBalances();
      
      expect(rewards).to.equal(ethers.parseEther("0.000021"));
      expect(dev).to.equal(ethers.parseEther("0.000006"));
      expect(mkt).to.equal(ethers.parseEther("0.000003"));
    });

    it("Should prevent non-game contract from distributing", async function () {
      await expect(
        distributor.connect(player).distributeEntryFee({ value: ENTRY_FEE })
      ).to.be.revertedWith("Only game contract");
    });

    it("Should prevent zero amount distribution", async function () {
      await expect(
        distributor.connect(gameContract).distributeEntryFee({ value: 0 })
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should prevent distribution when paused", async function () {
      await distributor.pause();
      
      await expect(
        distributor.connect(gameContract).distributeEntryFee({ value: ENTRY_FEE })
      ).to.be.revertedWithCustomError(distributor, "EnforcedPause");
    });

    it("Should handle rounding correctly", async function () {
      const oddAmount = ethers.parseEther("0.011"); // Amount that doesn't divide evenly
      
      await distributor.connect(gameContract).distributeEntryFee({ value: oddAmount });
      
      const [rewards, dev, mkt] = await distributor.getBalances();
      
      // Total should equal input (no lost wei)
      expect(rewards + dev + mkt).to.equal(oddAmount);
    });
  });

  describe("Rewards Pool Withdrawal", function () {
    beforeEach(async function () {
      await distributor.connect(gameContract).distributeEntryFee({ value: ENTRY_FEE });
    });

    it("Should allow rewards pool to withdraw", async function () {
      const balanceBefore = await ethers.provider.getBalance(devTreasury.address);
      
      await distributor.connect(rewardsPool).withdrawRewardsPool(devTreasury.address);
      
      const balanceAfter = await ethers.provider.getBalance(devTreasury.address);
      
      expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("0.000007"));
    });

    it("Should emit RewardsWithdrawn event", async function () {
      await expect(
        distributor.connect(rewardsPool).withdrawRewardsPool(devTreasury.address)
      ).to.emit(distributor, "RewardsWithdrawn")
        .withArgs(devTreasury.address, ethers.parseEther("0.000007"));
    });

    it("Should reset rewards balance after withdrawal", async function () {
      await distributor.connect(rewardsPool).withdrawRewardsPool(devTreasury.address);
      
      const [rewards] = await distributor.getBalances();
      expect(rewards).to.equal(0);
    });

    it("Should prevent non-rewards pool from withdrawing", async function () {
      await expect(
        distributor.connect(player).withdrawRewardsPool(player.address)
      ).to.be.revertedWith("Only rewards pool");
    });

    it("Should prevent withdrawal to zero address", async function () {
      await expect(
        distributor.connect(rewardsPool).withdrawRewardsPool(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });

    it("Should prevent withdrawal when balance is zero", async function () {
      await distributor.connect(rewardsPool).withdrawRewardsPool(devTreasury.address);
      
      await expect(
        distributor.connect(rewardsPool).withdrawRewardsPool(devTreasury.address)
      ).to.be.revertedWith("No balance to withdraw");
    });
  });

  describe("Dev Treasury Withdrawal", function () {
    beforeEach(async function () {
      await distributor.connect(gameContract).distributeEntryFee({ value: ENTRY_FEE });
    });

    it("Should allow owner to withdraw dev treasury", async function () {
      const balanceBefore = await ethers.provider.getBalance(devTreasury.address);
      
      await distributor.withdrawDevTreasury(devTreasury.address);
      
      const balanceAfter = await ethers.provider.getBalance(devTreasury.address);
      
      expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("0.000002"));
    });

    it("Should emit DevWithdrawn event", async function () {
      await expect(
        distributor.withdrawDevTreasury(devTreasury.address)
      ).to.emit(distributor, "DevWithdrawn")
        .withArgs(devTreasury.address, ethers.parseEther("0.000002"));
    });

    it("Should reset dev balance after withdrawal", async function () {
      await distributor.withdrawDevTreasury(devTreasury.address);
      
      const [, dev] = await distributor.getBalances();
      expect(dev).to.equal(0);
    });

    it("Should prevent non-owner from withdrawing", async function () {
      await expect(
        distributor.connect(player).withdrawDevTreasury(player.address)
      ).to.be.revertedWithCustomError(distributor, "OwnableUnauthorizedAccount");
    });
  });

  describe("Marketing Withdrawal", function () {
    beforeEach(async function () {
      await distributor.connect(gameContract).distributeEntryFee({ value: ENTRY_FEE });
    });

    it("Should allow owner to withdraw marketing", async function () {
      const balanceBefore = await ethers.provider.getBalance(marketing.address);
      
      await distributor.withdrawMarketing(marketing.address);
      
      const balanceAfter = await ethers.provider.getBalance(marketing.address);
      
      expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("0.000001"));
    });

    it("Should emit MarketingWithdrawn event", async function () {
      await expect(
        distributor.withdrawMarketing(marketing.address)
      ).to.emit(distributor, "MarketingWithdrawn")
        .withArgs(marketing.address, ethers.parseEther("0.000001"));
    });

    it("Should reset marketing balance after withdrawal", async function () {
      await distributor.withdrawMarketing(marketing.address);
      
      const [, , mkt] = await distributor.getBalances();
      expect(mkt).to.equal(0);
    });

    it("Should prevent non-owner from withdrawing", async function () {
      await expect(
        distributor.connect(player).withdrawMarketing(player.address)
      ).to.be.revertedWithCustomError(distributor, "OwnableUnauthorizedAccount");
    });
  });

  describe("Pause Functionality", function () {
    it("Should allow owner to pause", async function () {
      await distributor.pause();
      expect(await distributor.paused()).to.be.true;
    });

    it("Should allow owner to unpause", async function () {
      await distributor.pause();
      await distributor.unpause();
      expect(await distributor.paused()).to.be.false;
    });

    it("Should prevent non-owner from pausing", async function () {
      await expect(
        distributor.connect(player).pause()
      ).to.be.revertedWithCustomError(distributor, "OwnableUnauthorizedAccount");
    });

    it("Should allow distribution after unpause", async function () {
      await distributor.pause();
      await distributor.unpause();
      
      await expect(
        distributor.connect(gameContract).distributeEntryFee({ value: ENTRY_FEE })
      ).to.not.be.reverted;
    });
  });

  describe("Emergency Withdrawal", function () {
    beforeEach(async function () {
      await distributor.connect(gameContract).distributeEntryFee({ value: ENTRY_FEE });
    });

    it("Should allow owner to emergency withdraw", async function () {
      const balanceBefore = await ethers.provider.getBalance(owner.address);
      const contractBalance = await distributor.getTotalBalance();
      
      const tx = await distributor.emergencyWithdraw(owner.address);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * tx.gasPrice!;
      
      const balanceAfter = await ethers.provider.getBalance(owner.address);
      
      expect(balanceAfter - balanceBefore + BigInt(gasUsed)).to.equal(contractBalance);
    });

    it("Should prevent non-owner from emergency withdrawal", async function () {
      await expect(
        distributor.connect(player).emergencyWithdraw(player.address)
      ).to.be.revertedWithCustomError(distributor, "OwnableUnauthorizedAccount");
    });

    it("Should prevent emergency withdrawal to zero address", async function () {
      await expect(
        distributor.emergencyWithdraw(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });
  });

  describe("View Functions", function () {
    it("Should return correct balances", async function () {
      await distributor.connect(gameContract).distributeEntryFee({ value: ENTRY_FEE });
      
      const [rewards, dev, mkt] = await distributor.getBalances();
      
      expect(rewards).to.equal(ethers.parseEther("0.000007"));
      expect(dev).to.equal(ethers.parseEther("0.000002"));
      expect(mkt).to.equal(ethers.parseEther("0.000001"));
    });

    it("Should return correct total balance", async function () {
      await distributor.connect(gameContract).distributeEntryFee({ value: ENTRY_FEE });
      
      expect(await distributor.getTotalBalance()).to.equal(ENTRY_FEE);
    });

    it("Should track balances independently", async function () {
      await distributor.connect(gameContract).distributeEntryFee({ value: ENTRY_FEE });
      
      await distributor.withdrawDevTreasury(devTreasury.address);
      
      const [rewards, dev, mkt] = await distributor.getBalances();
      
      expect(rewards).to.equal(ethers.parseEther("0.000007"));
      expect(dev).to.equal(0);
      expect(mkt).to.equal(ethers.parseEther("0.000001"));
    });
  });

  describe("Receive Function", function () {
    it("Should reject direct ETH transfers", async function () {
      await expect(
        player.sendTransaction({
          to: await distributor.getAddress(),
          value: ENTRY_FEE
        })
      ).to.be.revertedWith("Use distributeEntryFee function");
    });
  });

  describe("Gas Optimization", function () {
    it("Should distribute fee efficiently", async function () {
      const tx = await distributor.connect(gameContract).distributeEntryFee({ value: ENTRY_FEE });
      const receipt = await tx.wait();
      
      // Should use less than 150k gas
      expect(receipt!.gasUsed).to.be.lt(150000);
    });
  });

  describe("Integration Scenarios", function () {
    it("Should handle complete cycle: distribute -> withdraw all", async function () {
      // Distribute
      await distributor.connect(gameContract).distributeEntryFee({ value: ENTRY_FEE });
      
      // Withdraw all
      await distributor.connect(rewardsPool).withdrawRewardsPool(devTreasury.address);
      await distributor.withdrawDevTreasury(devTreasury.address);
      await distributor.withdrawMarketing(marketing.address);
      
      // All balances should be zero
      const [rewards, dev, mkt] = await distributor.getBalances();
      expect(rewards).to.equal(0);
      expect(dev).to.equal(0);
      expect(mkt).to.equal(0);
      
      // Contract balance should be zero
      expect(await distributor.getTotalBalance()).to.equal(0);
    });

    it("Should handle multiple distributions and selective withdrawals", async function () {
      // Distribute 5 times
      for (let i = 0; i < 5; i++) {
        await distributor.connect(gameContract).distributeEntryFee({ value: ENTRY_FEE });
      }
      
      // Only withdraw dev
      await distributor.withdrawDevTreasury(devTreasury.address);
      
      const [rewards, dev, mkt] = await distributor.getBalances();
      
      expect(rewards).to.equal(ethers.parseEther("0.000035"));
      expect(dev).to.equal(0);
      expect(mkt).to.equal(ethers.parseEther("0.000005"));
    });
  });
});
