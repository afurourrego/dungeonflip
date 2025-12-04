import { expect } from "chai";
import { ethers } from "hardhat";
import { DungeonGame, AventurerNFT, FeeDistributor, ProgressTracker, RewardsPool } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

/**
 * Test suite for DungeonGame contract
 * Built with AI assistance (GitHub Copilot) for Seedify Vibe Coins Hackathon
 */
describe("DungeonGame", function () {
  let dungeonGame: DungeonGame;
  let aventurerNFT: AventurerNFT;
  let feeDistributor: FeeDistributor;
  let progressTracker: ProgressTracker;
  let rewardsPool: RewardsPool;
  let owner: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;
  let players: SignerWithAddress[];

  const ENTRY_FEE = ethers.parseEther("0.00001");
  const GAME_COOLDOWN = 30; // 30 seconds

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    owner = signers[0];
    player1 = signers[1];
    player2 = signers[2];
    players = signers.slice(3, 13); // 10 more players

    // Deploy all contracts
    const AventurerNFTFactory = await ethers.getContractFactory("AventurerNFT");
    aventurerNFT = await AventurerNFTFactory.deploy() as unknown as AventurerNFT;

    const FeeDistributorFactory = await ethers.getContractFactory("FeeDistributor");
    feeDistributor = await FeeDistributorFactory.deploy() as unknown as FeeDistributor;

    const ProgressTrackerFactory = await ethers.getContractFactory("ProgressTracker");
    progressTracker = await ProgressTrackerFactory.deploy() as unknown as ProgressTracker;

    const RewardsPoolFactory = await ethers.getContractFactory("RewardsPool");
    rewardsPool = await RewardsPoolFactory.deploy() as unknown as RewardsPool;

    const DungeonGameFactory = await ethers.getContractFactory("DungeonGame");
    dungeonGame = await DungeonGameFactory.deploy(
      await aventurerNFT.getAddress(),
      await feeDistributor.getAddress(),
      await progressTracker.getAddress(),
      await rewardsPool.getAddress()
    ) as unknown as DungeonGame;

    // Configure contracts
    await feeDistributor.setGameContract(await dungeonGame.getAddress());
    await feeDistributor.setRewardsPoolContract(await rewardsPool.getAddress());
    await progressTracker.setGameContract(await dungeonGame.getAddress());
    await progressTracker.setRewardsPoolContract(await rewardsPool.getAddress());
    await rewardsPool.setFeeDistributor(await feeDistributor.getAddress());
    await rewardsPool.setProgressTracker(await progressTracker.getAddress());
    await rewardsPool.setGameContract(await dungeonGame.getAddress());

    // Mint NFTs for testing
    await aventurerNFT.connect(player1).mintAventurer();
    await aventurerNFT.connect(player2).mintAventurer();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await dungeonGame.owner()).to.equal(owner.address);
    });

    it("Should initialize with correct constants", async function () {
      expect(await dungeonGame.ENTRY_FEE()).to.equal(ENTRY_FEE);
      expect(await dungeonGame.GAME_COOLDOWN()).to.equal(GAME_COOLDOWN);
      expect(await dungeonGame.MAX_DUNGEON_LEVEL()).to.equal(10);
    });

    it("Should link to correct contracts", async function () {
      expect(await dungeonGame.aventurerNFT()).to.equal(await aventurerNFT.getAddress());
      expect(await dungeonGame.feeDistributor()).to.equal(await feeDistributor.getAddress());
      expect(await dungeonGame.progressTracker()).to.equal(await progressTracker.getAddress());
      expect(await dungeonGame.rewardsPool()).to.equal(await rewardsPool.getAddress());
    });

    it("Should not be paused on deployment", async function () {
      expect(await dungeonGame.paused()).to.be.false;
    });
  });

  describe("Starting Games", function () {
    it("Should start a game with correct entry fee", async function () {
      await expect(
        dungeonGame.connect(player1).startGame(1, { value: ENTRY_FEE })
      ).to.emit(dungeonGame, "GameStarted");
    });

    it("Should reject incorrect entry fee", async function () {
      await expect(
        dungeonGame.connect(player1).startGame(1, { value: ethers.parseEther("0.005") })
      ).to.be.revertedWith("Incorrect entry fee");
    });

    it("Should require NFT ownership", async function () {
      await expect(
        dungeonGame.connect(player2).startGame(1, { value: ENTRY_FEE })
      ).to.be.revertedWith("Not token owner");
    });

    it("Should prevent starting multiple active games", async function () {
      await dungeonGame.connect(player1).startGame(1, { value: ENTRY_FEE });
      
      await expect(
        dungeonGame.connect(player1).startGame(1, { value: ENTRY_FEE })
      ).to.be.revertedWith("Game already active");
    });

    it("Should enforce cooldown period", async function () {
      await dungeonGame.connect(player1).startGame(1, { value: ENTRY_FEE });
      await dungeonGame.connect(player1).completeGame();
      
      await expect(
        dungeonGame.connect(player1).startGame(1, { value: ENTRY_FEE })
      ).to.be.revertedWith("Cooldown not finished");
    });

    it("Should allow game after cooldown expires", async function () {
      await dungeonGame.connect(player1).startGame(1, { value: ENTRY_FEE });
      await dungeonGame.connect(player1).completeGame();
      
      await time.increase(GAME_COOLDOWN);
      
      await expect(
        dungeonGame.connect(player1).startGame(1, { value: ENTRY_FEE })
      ).to.not.be.reverted;
    });

    it("Should distribute entry fee to FeeDistributor", async function () {
      const balanceBefore = await feeDistributor.getTotalBalance();
      
      await dungeonGame.connect(player1).startGame(1, { value: ENTRY_FEE });
      
      const balanceAfter = await feeDistributor.getTotalBalance();
      expect(balanceAfter - balanceBefore).to.equal(ENTRY_FEE);
    });

    it("Should increment total games played", async function () {
      expect(await dungeonGame.totalGamesPlayed()).to.equal(0);
      
      await dungeonGame.connect(player1).startGame(1, { value: ENTRY_FEE });
      expect(await dungeonGame.totalGamesPlayed()).to.equal(1);
      
      await dungeonGame.connect(player1).completeGame();
      await time.increase(GAME_COOLDOWN);
      await dungeonGame.connect(player1).startGame(1, { value: ENTRY_FEE });
      expect(await dungeonGame.totalGamesPlayed()).to.equal(2);
    });

    it("Should track total fees collected", async function () {
      await dungeonGame.connect(player1).startGame(1, { value: ENTRY_FEE });
      expect(await dungeonGame.totalFeesCollected()).to.equal(ENTRY_FEE);
      
      await dungeonGame.connect(player1).completeGame();
      await time.increase(GAME_COOLDOWN);
      await dungeonGame.connect(player1).startGame(1, { value: ENTRY_FEE });
      expect(await dungeonGame.totalFeesCollected()).to.equal(ENTRY_FEE * 2n);
    });

    it("Should create game session", async function () {
      await dungeonGame.connect(player1).startGame(1, { value: ENTRY_FEE });
      
      const session = await dungeonGame.getPlayerSession(player1.address);
      expect(session.tokenId).to.equal(1);
      expect(session.active).to.be.true;
      expect(session.levelsCompleted).to.equal(0);
      expect(session.scoreEarned).to.equal(0);
    });
  });

  describe("Completing Games", function () {
    beforeEach(async function () {
      await dungeonGame.connect(player1).startGame(1, { value: ENTRY_FEE });
    });

    it("Should complete game successfully", async function () {
      await expect(
        dungeonGame.connect(player1).completeGame()
      ).to.emit(dungeonGame, "GameEnded");
    });

    it("Should require active game", async function () {
      await dungeonGame.connect(player1).completeGame();
      
      await expect(
        dungeonGame.connect(player1).completeGame()
      ).to.be.revertedWith("No active game");
    });

    it("Should record levels completed", async function () {
      await dungeonGame.connect(player1).completeGame();
      
      const session = await dungeonGame.getPlayerSession(player1.address);
      expect(session.levelsCompleted).to.be.gt(0);
      expect(session.levelsCompleted).to.be.lte(10);
    });

    it("Should calculate and record score", async function () {
      await dungeonGame.connect(player1).completeGame();
      
      const session = await dungeonGame.getPlayerSession(player1.address);
      expect(session.scoreEarned).to.be.gt(0);
    });

    it("Should mark session as inactive", async function () {
      await dungeonGame.connect(player1).completeGame();
      
      const session = await dungeonGame.getPlayerSession(player1.address);
      expect(session.active).to.be.false;
    });

    it("Should update progress tracker", async function () {
      await dungeonGame.connect(player1).completeGame();
      
      const progress = await progressTracker.getPlayerProgress(player1.address);
      expect(progress.totalScore).to.be.gt(0);
      expect(progress.gamesPlayed).to.equal(1);
    });

    it("Should accumulate scores across multiple games", async function () {
      await dungeonGame.connect(player1).completeGame();
      const session1 = await dungeonGame.getPlayerSession(player1.address);
      
      await time.increase(GAME_COOLDOWN);
      await dungeonGame.connect(player1).startGame(1, { value: ENTRY_FEE });
      await dungeonGame.connect(player1).completeGame();
      
      const progress = await progressTracker.getPlayerProgress(player1.address);
      expect(progress.totalScore).to.be.gte(session1.scoreEarned);
      expect(progress.gamesPlayed).to.equal(2);
    });
  });

  describe("View Functions", function () {
    it("Should check if player can start game", async function () {
      expect(await dungeonGame.canStartGame(player1.address)).to.be.true;
      
      await dungeonGame.connect(player1).startGame(1, { value: ENTRY_FEE });
      expect(await dungeonGame.canStartGame(player1.address)).to.be.false;
      
      await dungeonGame.connect(player1).completeGame();
      expect(await dungeonGame.canStartGame(player1.address)).to.be.false;
      
      await time.increase(GAME_COOLDOWN);
      expect(await dungeonGame.canStartGame(player1.address)).to.be.true;
    });

    it("Should return cooldown remaining", async function () {
      expect(await dungeonGame.getCooldownRemaining(player1.address)).to.equal(0);
      
      await dungeonGame.connect(player1).startGame(1, { value: ENTRY_FEE });
      await dungeonGame.connect(player1).completeGame();
      
      const remaining = await dungeonGame.getCooldownRemaining(player1.address);
      expect(remaining).to.be.gt(0);
      expect(remaining).to.be.lte(GAME_COOLDOWN);
      
      await time.increase(GAME_COOLDOWN);
      expect(await dungeonGame.getCooldownRemaining(player1.address)).to.equal(0);
    });

    it("Should return player session data", async function () {
      await dungeonGame.connect(player1).startGame(1, { value: ENTRY_FEE });
      
      const session = await dungeonGame.getPlayerSession(player1.address);
      expect(session.tokenId).to.equal(1);
      expect(session.active).to.be.true;
    });
  });

  describe("Week Management", function () {
    it("Should allow owner to advance week", async function () {
      const weekBefore = await progressTracker.currentWeek();
      
      await time.increase(6 * 24 * 60 * 60); // Wait 6 days
      await dungeonGame.advanceWeek();
      
      const weekAfter = await progressTracker.currentWeek();
      expect(weekAfter).to.equal(weekBefore + 1n);
    });

    it("Should prevent non-owner from advancing week", async function () {
      await expect(
        dungeonGame.connect(player1).advanceWeek()
      ).to.be.revertedWithCustomError(dungeonGame, "OwnableUnauthorizedAccount");
    });

    it("Should advance week in both tracker and pool", async function () {
      await time.increase(6 * 24 * 60 * 60); // Wait 6 days
      await dungeonGame.advanceWeek();
      
      expect(await progressTracker.currentWeek()).to.equal(2);
      expect(await rewardsPool.currentWeek()).to.equal(2);
    });
  });

  describe("Reward Distribution", function () {
    beforeEach(async function () {
      // Create a competitive leaderboard
      for (let i = 0; i < 10; i++) {
        await aventurerNFT.connect(players[i]).mintAventurer();
        await dungeonGame.connect(players[i]).startGame(i + 3, { value: ENTRY_FEE });
        await dungeonGame.connect(players[i]).completeGame();
      }
    });

    it("Should distribute rewards to top players", async function () {
      const topPlayers = players.slice(0, 10).map(p => p.address);
      
      await expect(
        dungeonGame.distributeWeeklyRewards(topPlayers)
      ).to.emit(rewardsPool, "RewardsDistributed");
    });

    it("Should prevent non-owner from distributing rewards", async function () {
      const topPlayers = players.slice(0, 10).map(p => p.address);
      
      await expect(
        dungeonGame.connect(player1).distributeWeeklyRewards(topPlayers)
      ).to.be.revertedWithCustomError(dungeonGame, "OwnableUnauthorizedAccount");
    });
  });

  describe("Contract Updates", function () {
    it("Should allow owner to update contracts", async function () {
      const newNFT = await (await ethers.getContractFactory("AventurerNFT")).deploy();
      const newFeeDistributor = await (await ethers.getContractFactory("FeeDistributor")).deploy();
      const newTracker = await (await ethers.getContractFactory("ProgressTracker")).deploy();
      const newPool = await (await ethers.getContractFactory("RewardsPool")).deploy();
      
      await expect(
        dungeonGame.updateContracts(
          await newNFT.getAddress(),
          await newFeeDistributor.getAddress(),
          await newTracker.getAddress(),
          await newPool.getAddress()
        )
      ).to.emit(dungeonGame, "ContractsUpdated");
    });

    it("Should prevent non-owner from updating contracts", async function () {
      await expect(
        dungeonGame.connect(player1).updateContracts(
          await aventurerNFT.getAddress(),
          await feeDistributor.getAddress(),
          await progressTracker.getAddress(),
          await rewardsPool.getAddress()
        )
      ).to.be.revertedWithCustomError(dungeonGame, "OwnableUnauthorizedAccount");
    });

    it("Should prevent zero addresses", async function () {
      await expect(
        dungeonGame.updateContracts(
          ethers.ZeroAddress,
          await feeDistributor.getAddress(),
          await progressTracker.getAddress(),
          await rewardsPool.getAddress()
        )
      ).to.be.revertedWith("Invalid NFT address");
    });
  });

  describe("Pause Functionality", function () {
    it("Should allow owner to pause", async function () {
      await dungeonGame.pause();
      expect(await dungeonGame.paused()).to.be.true;
    });

    it("Should allow owner to unpause", async function () {
      await dungeonGame.pause();
      await dungeonGame.unpause();
      expect(await dungeonGame.paused()).to.be.false;
    });

    it("Should prevent non-owner from pausing", async function () {
      await expect(
        dungeonGame.connect(player1).pause()
      ).to.be.revertedWithCustomError(dungeonGame, "OwnableUnauthorizedAccount");
    });

    it("Should prevent starting games when paused", async function () {
      await dungeonGame.pause();
      
      await expect(
        dungeonGame.connect(player1).startGame(1, { value: ENTRY_FEE })
      ).to.be.revertedWithCustomError(dungeonGame, "EnforcedPause");
    });

    it("Should prevent completing games when paused", async function () {
      await dungeonGame.connect(player1).startGame(1, { value: ENTRY_FEE });
      await dungeonGame.pause();
      
      await expect(
        dungeonGame.connect(player1).completeGame()
      ).to.be.revertedWithCustomError(dungeonGame, "EnforcedPause");
    });
  });

  describe("Integration Scenarios", function () {
    it("Should handle complete game cycle", async function () {
      // Start game
      await dungeonGame.connect(player1).startGame(1, { value: ENTRY_FEE });
      
      // Complete game
      await dungeonGame.connect(player1).completeGame();
      const session = await dungeonGame.getPlayerSession(player1.address);
      
      // Verify results
      expect(session.active).to.be.false;
      expect(session.levelsCompleted).to.be.gt(0);
      expect(session.scoreEarned).to.be.gt(0);
      
      // Check progress updated
      const progress = await progressTracker.getPlayerProgress(player1.address);
      expect(progress.totalScore).to.equal(session.scoreEarned);
    });

    it("Should handle multiple players competing", async function () {
      // Player 1 plays
      await dungeonGame.connect(player1).startGame(1, { value: ENTRY_FEE });
      await dungeonGame.connect(player1).completeGame();
      
      // Player 2 plays
      await dungeonGame.connect(player2).startGame(2, { value: ENTRY_FEE });
      await dungeonGame.connect(player2).completeGame();
      
      // Verify both have progress
      const progress1 = await progressTracker.getPlayerProgress(player1.address);
      const progress2 = await progressTracker.getPlayerProgress(player2.address);
      
      expect(progress1.gamesPlayed).to.equal(1);
      expect(progress2.gamesPlayed).to.equal(1);
    });

    it("Should handle weekly cycle with rewards", async function () {
      // Create leaderboard
      for (let i = 0; i < 10; i++) {
        await aventurerNFT.connect(players[i]).mintAventurer();
        await dungeonGame.connect(players[i]).startGame(i + 3, { value: ENTRY_FEE });
        await dungeonGame.connect(players[i]).completeGame();
      }
      
      // Advance week
      await time.increase(6 * 24 * 60 * 60);
      await dungeonGame.advanceWeek();
      
      // Distribute rewards
      const topPlayers = players.slice(0, 10).map(p => p.address);
      await dungeonGame.distributeWeeklyRewards(topPlayers);
      
      // Verify week advanced
      expect(await progressTracker.currentWeek()).to.equal(2);
      expect(await rewardsPool.currentWeek()).to.equal(2);
    });
  });

  describe("Gas Optimization", function () {
    it("Should start game efficiently", async function () {
      const tx = await dungeonGame.connect(player1).startGame(1, { value: ENTRY_FEE });
      const receipt = await tx.wait();
      
      // Should be under 300k gas
      expect(receipt!.gasUsed).to.be.lt(300000);
    });

    it("Should complete game efficiently", async function () {
      await dungeonGame.connect(player1).startGame(1, { value: ENTRY_FEE });
      
      const tx = await dungeonGame.connect(player1).completeGame();
      const receipt = await tx.wait();
      
      // Should be under 350k gas (includes progress tracker update)
      expect(receipt!.gasUsed).to.be.lt(350000);
    });
  });
});
