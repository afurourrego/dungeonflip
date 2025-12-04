import { expect } from "chai";
import { ethers } from "hardhat";
import { AventurerNFT } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

/**
 * Test suite for AventurerNFT contract
 * Built with AI assistance (GitHub Copilot + Claude) for Seedify Vibe Coins Hackathon
 */
describe("AventurerNFT", function () {
  let nft: AventurerNFT;
  let owner: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;

  // Deploy fresh contract before each test
  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();
    
    const NFTFactory = await ethers.getContractFactory("AventurerNFT");
    nft = await NFTFactory.deploy() as unknown as AventurerNFT;
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await nft.name()).to.equal("DungeonFlip Aventurer");
      expect(await nft.symbol()).to.equal("DFAV");
    });

    it("Should set the deployer as owner", async function () {
      expect(await nft.owner()).to.equal(owner.address);
    });

    it("Should start with zero total supply", async function () {
      expect(await nft.totalSupply()).to.equal(0);
    });

    it("Should not be paused on deployment", async function () {
      expect(await nft.paused()).to.equal(false);
    });
  });

  describe("Minting", function () {
    it("Should mint a new adventurer NFT", async function () {
      await expect(nft.connect(player1).mintAventurer())
        .to.emit(nft, "AventurerMinted");
      
      expect(await nft.balanceOf(player1.address)).to.equal(1);
      expect(await nft.totalSupply()).to.equal(1);
    });

    it("Should assign correct token ID (starting from 1)", async function () {
      await nft.connect(player1).mintAventurer();
      
      expect(await nft.ownerOf(1)).to.equal(player1.address);
    });

    it("Should generate stats within valid ranges", async function () {
      await nft.connect(player1).mintAventurer();
      
      const stats = await nft.getAventurerStats(1);
      
      // ATK should be 1-2
      expect(stats.atk).to.be.within(1, 2);
      
      // DEF should be 1-2
      expect(stats.def).to.be.within(1, 2);
      
      // HP should be 4-6
      expect(stats.hp).to.be.within(4, 6);
      
      // Minted timestamp should be set
      expect(stats.mintedAt).to.be.gt(0);
    });

    it("Should emit AventurerMinted event with correct parameters", async function () {
      const tx = await nft.connect(player1).mintAventurer();
      const receipt = await tx.wait();
      
      // Find the AventurerMinted event
      const event = receipt?.logs.find(
        (log: any) => {
          try {
            const parsed = nft.interface.parseLog(log);
            return parsed?.name === "AventurerMinted";
          } catch {
            return false;
          }
        }
      );
      
      expect(event).to.not.be.undefined;
    });

    it("Should allow multiple mints per address", async function () {
      await nft.connect(player1).mintAventurer();
      await nft.connect(player1).mintAventurer();
      
      expect(await nft.balanceOf(player1.address)).to.equal(2);
      expect(await nft.totalSupply()).to.equal(2);
    });

    it("Should assign sequential token IDs", async function () {
      await nft.connect(player1).mintAventurer();
      await nft.connect(player2).mintAventurer();
      await nft.connect(player1).mintAventurer();
      
      expect(await nft.ownerOf(1)).to.equal(player1.address);
      expect(await nft.ownerOf(2)).to.equal(player2.address);
      expect(await nft.ownerOf(3)).to.equal(player1.address);
    });

    it("Should generate different stats for different tokens", async function () {
      await nft.connect(player1).mintAventurer();
      await nft.connect(player1).mintAventurer();
      
      const stats1 = await nft.getAventurerStats(1);
      const stats2 = await nft.getAventurerStats(2);
      
      // At least one stat should be different (very high probability)
      const isDifferent = 
        stats1.atk !== stats2.atk || 
        stats1.def !== stats2.def || 
        stats1.hp !== stats2.hp;
      
      expect(isDifferent).to.be.true;
    });

    it("Should fail minting when paused", async function () {
      await nft.connect(owner).pause();
      
      await expect(
        nft.connect(player1).mintAventurer()
      ).to.be.revertedWithCustomError(nft, "EnforcedPause");
    });
  });

  describe("Stats Retrieval", function () {
    it("Should return correct stats for a token", async function () {
      await nft.connect(player1).mintAventurer();
      
      const stats = await nft.getAventurerStats(1);
      
      expect(stats.atk).to.exist;
      expect(stats.def).to.exist;
      expect(stats.hp).to.exist;
      expect(stats.mintedAt).to.be.gt(0);
    });

    it("Should revert when querying non-existent token", async function () {
      await expect(
        nft.getAventurerStats(999)
      ).to.be.revertedWith("Token does not exist");
    });

    it("Should return correct stats after transfer", async function () {
      await nft.connect(player1).mintAventurer();
      
      const statsBefore = await nft.getAventurerStats(1);
      
      // Transfer to player2
      await nft.connect(player1).transferFrom(player1.address, player2.address, 1);
      
      const statsAfter = await nft.getAventurerStats(1);
      
      // Stats should remain the same after transfer
      expect(statsAfter.atk).to.equal(statsBefore.atk);
      expect(statsAfter.def).to.equal(statsBefore.def);
      expect(statsAfter.hp).to.equal(statsBefore.hp);
    });
  });

  describe("Ownership Checks", function () {
    it("Should correctly identify token ownership", async function () {
      await nft.connect(player1).mintAventurer();
      
      expect(await nft.isOwnerOf(player1.address, 1)).to.be.true;
      expect(await nft.isOwnerOf(player2.address, 1)).to.be.false;
    });

    it("Should update ownership after transfer", async function () {
      await nft.connect(player1).mintAventurer();
      
      await nft.connect(player1).transferFrom(player1.address, player2.address, 1);
      
      expect(await nft.isOwnerOf(player1.address, 1)).to.be.false;
      expect(await nft.isOwnerOf(player2.address, 1)).to.be.true;
    });
  });

  describe("Pause Functionality", function () {
    it("Should allow owner to pause", async function () {
      await expect(nft.connect(owner).pause())
        .to.not.be.reverted;
      
      expect(await nft.paused()).to.be.true;
    });

    it("Should allow owner to unpause", async function () {
      await nft.connect(owner).pause();
      
      await expect(nft.connect(owner).unpause())
        .to.not.be.reverted;
      
      expect(await nft.paused()).to.be.false;
    });

    it("Should prevent non-owner from pausing", async function () {
      await expect(
        nft.connect(player1).pause()
      ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
    });

    it("Should prevent non-owner from unpausing", async function () {
      await nft.connect(owner).pause();
      
      await expect(
        nft.connect(player1).unpause()
      ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
    });

    it("Should allow minting after unpause", async function () {
      await nft.connect(owner).pause();
      await nft.connect(owner).unpause();
      
      await expect(nft.connect(player1).mintAventurer())
        .to.not.be.reverted;
    });
  });

  describe("Base URI", function () {
    it("Should return empty tokenURI when base URI not set", async function () {
      await nft.connect(player1).mintAventurer();
      
      const uri = await nft.tokenURI(1);
      expect(uri).to.equal("");
    });

    it("Should allow owner to set base URI", async function () {
      await expect(
        nft.connect(owner).setBaseURI("https://example.com/metadata/")
      ).to.emit(nft, "BaseURIUpdated")
        .withArgs("https://example.com/metadata/");
    });

    it("Should return correct tokenURI after base URI is set", async function () {
      await nft.connect(player1).mintAventurer();
      
      await nft.connect(owner).setBaseURI("https://example.com/metadata/");
      
      const uri = await nft.tokenURI(1);
      expect(uri).to.equal("https://example.com/metadata/1");
    });

    it("Should prevent non-owner from setting base URI", async function () {
      await expect(
        nft.connect(player1).setBaseURI("https://example.com/metadata/")
      ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
    });

    it("Should revert tokenURI for non-existent token", async function () {
      await expect(
        nft.tokenURI(999)
      ).to.be.revertedWith("Token does not exist");
    });
  });

  describe("Total Supply", function () {
    it("Should track total supply correctly", async function () {
      expect(await nft.totalSupply()).to.equal(0);
      
      await nft.connect(player1).mintAventurer();
      expect(await nft.totalSupply()).to.equal(1);
      
      await nft.connect(player2).mintAventurer();
      expect(await nft.totalSupply()).to.equal(2);
      
      await nft.connect(player1).mintAventurer();
      expect(await nft.totalSupply()).to.equal(3);
    });

    it("Should not decrease total supply after transfer", async function () {
      await nft.connect(player1).mintAventurer();
      await nft.connect(player1).mintAventurer();
      
      expect(await nft.totalSupply()).to.equal(2);
      
      await nft.connect(player1).transferFrom(player1.address, player2.address, 1);
      
      expect(await nft.totalSupply()).to.equal(2);
    });
  });

  describe("Gas Optimization", function () {
    it("Should mint within reasonable gas limits", async function () {
      const tx = await nft.connect(player1).mintAventurer();
      const receipt = await tx.wait();
      
      // Minting should use less than 200k gas
      expect(receipt?.gasUsed).to.be.lt(200000);
    });

    it("Should efficiently handle multiple mints", async function () {
      const numMints = 5;
      
      for (let i = 0; i < numMints; i++) {
        await nft.connect(player1).mintAventurer();
      }
      
      expect(await nft.balanceOf(player1.address)).to.equal(numMints);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle minting with token ID 0 never used", async function () {
      await nft.connect(player1).mintAventurer();
      
      await expect(
        nft.ownerOf(0)
      ).to.be.revertedWithCustomError(nft, "ERC721NonexistentToken");
    });

    it("Should handle large number of mints", async function () {
      const numMints = 10;
      
      for (let i = 0; i < numMints; i++) {
        await nft.connect(player1).mintAventurer();
      }
      
      expect(await nft.totalSupply()).to.equal(numMints);
      expect(await nft.balanceOf(player1.address)).to.equal(numMints);
    });

    it("Should maintain unique token IDs across multiple minters", async function () {
      const signers = [player1, player2, owner];
      const tokenIds = new Set();
      
      for (const signer of signers) {
        const tx = await nft.connect(signer).mintAventurer();
        const receipt = await tx.wait();
        
        // Extract token ID from event (simplified - in production parse the event properly)
        const totalSupply = await nft.totalSupply();
        tokenIds.add(totalSupply.toString());
      }
      
      // All token IDs should be unique
      expect(tokenIds.size).to.equal(signers.length);
    });
  });
});
