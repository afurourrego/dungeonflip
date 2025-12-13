# 🎮 DungeonFlip

**A Web3 card-based dungeon crawler game built for the Seedify Vibe Coins Hackathon**

[![Built for Seedify Vibe Coins](https://img.shields.io/badge/Built%20for-Seedify%20Vibe%20Coins-blue)](https://docs.seedify.fund/seedify-vibecoins/)
[![Base Network](https://img.shields.io/badge/Network-Base-0052FF)](https://base.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636)](https://soliditylang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)

---

## 🎯 About

DungeonFlip is an engaging card-based dungeon crawler where players mint NFT adventurers, pay entry fees in ETH, and compete for weekly prizes. Built entirely with AI-assisted development (Vibe Coding), this project showcases the power of modern AI tools in Web3 game development.

### 🎮 Game Features

- **NFT Adventurers:** Mint free adventurers with randomized stats (ATK, DEF, HP)
- **Card-Based Gameplay:** Face monsters, collect treasures, avoid traps, and use potions
- **Turn-Based Combat:** Strategic dice-roll combat system with defense mechanics
- **Leaderboard:** Compete for top 10 positions based on gems collected
- **Weekly Prizes:** 0.00001 ETH entry fee distributed to top players every Friday

---

## 🏗️ Tech Stack

### Smart Contracts
- **Blockchain:** Base (Ethereum L2)
- **Language:** Solidity ^0.8.20
- **Framework:** Hardhat + TypeScript
- **Standards:** ERC-721 (NFTs)
- **Testing:** Hardhat + Chai + Ethers.js

### Frontend
- **Framework:** Next.js 16 (React 19, App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Web3:** Wagmi v2 + Viem v2
- **Wallet:** RainbowKit (MetaMask, Coinbase Wallet)
- **State:** Zustand

---

## 📁 Project Structure

```
dungeonflip/
├── contracts/          # Solidity smart contracts
├── frontend/           # Next.js frontend application
├── scripts/            # Deployment scripts
├── test/              # Contract tests
├── ai_logs/           # AI-assisted development logs
├── docs/              # Technical documentation
└── PROJECT_PLAN.md    # Complete development roadmap
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20.18.1 LTS (Hardhat crashes on 22+)
- npm or yarn
- MetaMask or Coinbase Wallet
- Base Sepolia testnet ETH (bridge from Ethereum Sepolia via [bridge.base.org](https://bridge.base.org/) or request from the [Base faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))

### Installation

```bash
# Clone the repository
git clone https://github.com/afurourrego/dungeonflip.git
cd dungeonflip

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure your private key and API keys in .env
```

### Smart Contracts

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Check coverage
npx hardhat coverage

# Deploy to Base Sepolia
npx hardhat run scripts/deploy.ts --network baseSepolia

# Verify contracts
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS>
```

### Frontend

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

---

## 💰 Economy & Revenue Model

### Entry Fee Distribution
- **Entry Fee:** 0.00001 ETH per dungeon run
- **Distribution:**
  - 70% → Weekly Rewards Pool (top 10 players)
  - 20% → Development Treasury
  - 10% → Marketing Reserve

### Weekly Prizes
- **Distribution Time:** Every Friday at 16:20 UTC
- **Top 10 Players:** Decreasing percentage distribution
  - 1st place: 30% of pool
  - 2nd place: 20% of pool
  - 3rd place: 15% of pool
  - ... (see PROJECT_PLAN.md for full breakdown)

---

## 🎮 How to Play

1. **Connect Wallet:** Connect your MetaMask or Coinbase Wallet to Base network
2. **Mint NFT:** Mint a free Adventurer NFT (only gas fees)
3. **Enter Dungeon:** Pay 0.00001 ETH entry fee to start a run
4. **Play Cards:** Each room has 4 cards - flip to reveal:
   - 🦹 Monster (45%) - Enter turn-based combat
   - 💎 Treasure (30%) - Collect gems for leaderboard
   - 🕸️ Trap (15%) - Lose 1 HP
   - 🧪 Potion (10%) - Restore HP
5. **Progress or Exit:** Continue to next room or exit with your gems
6. **Compete:** Climb the leaderboard to win weekly prizes!

---

## 🧪 Testing

### Smart Contract Tests
```bash
# Run all tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Check coverage
npx hardhat coverage
```

### Frontend Testing
```bash
cd frontend
npm run test          # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

---

## 📚 Documentation

- **[INTRODUCTION.md](./docs/INTRODUCTION.md)** - Player onboarding and how-to-play guide
- **[WHITEPAPER.md](./docs/WHITEPAPER.md)** - Complete technical and economic documentation
- **[ROADMAP.md](./docs/ROADMAP.md)** - Development phases and future plans
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Current project status and metrics
- **[PROJECT_PLAN.md](./PROJECT_PLAN.md)** - Original development roadmap
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Deployment guide and contract addresses

**Web Pages:**
- `/introduction` - Interactive introduction page
- `/whitepaper` - Web version of whitepaper
- `/roadmap` - Interactive roadmap
- `/game` - Play the game
- `/leaderboard` - View current standings

---

## 🤖 AI-Assisted Development (Vibe Coding)

This project was built using AI-assisted development tools:

- **GitHub Copilot** - Code generation and autocomplete
- **Claude (Cursor)** - Architecture design and problem-solving
- **ChatGPT** - Documentation and research

All AI prompts, iterations, and challenges are documented in the `ai_logs/` folder:
- [prompts.md](./ai_logs/prompts.md) - All AI prompts used
- [iteration_history.md](./ai_logs/iteration_history.md) - Development iterations
- [tools_used.md](./ai_logs/tools_used.md) - AI tools documentation
- [challenges.md](./ai_logs/challenges.md) - Problems solved with AI

---

## 🚀 Deployment & Live Contracts

### Base Sepolia (Testnet)
- **Status:** ✅ Live (Latest deploy: Dec 13, 2025)
- **Contracts:**

| Contract | Address | Explorer |
| --- | --- | --- |
| AventurerNFT | `0x07753598E13Bce7388bD66F1016155684cc3293B` | [View →](https://sepolia.basescan.org/address/0x07753598E13Bce7388bD66F1016155684cc3293B) |
| DungeonGame | `0x066d926eA2b3Fd48BC44e0eE8b5EA14474c40746` | [View →](https://sepolia.basescan.org/address/0x066d926eA2b3Fd48BC44e0eE8b5EA14474c40746) |
| FeeDistributor | `0xD00c128486dE1C13074769922BEBe735F378A290` | [View →](https://sepolia.basescan.org/address/0xD00c128486dE1C13074769922BEBe735F378A290) |
| ProgressTracker | `0x623435ECC6b3B418d79EE396298aF59710632595` | [View →](https://sepolia.basescan.org/address/0x623435ECC6b3B418d79EE396298aF59710632595) |
| RewardsPool | `0x9A19912DDb7e71b4dccC9036f9395D88979A4F17` | [View →](https://sepolia.basescan.org/address/0x9A19912DDb7e71b4dccC9036f9395D88979A4F17) |

- **Frontend:** [Coming Soon - Vercel Deploy]

### Base Mainnet
- **Status:** ⏳ Not deployed yet (pending QA + audit)
- **Next step:** rerun `scripts/deploy.ts` against `base` network once testing signs off.

---

## 🏆 Hackathon Submission

This project is submitted to the **Seedify Vibe Coins Hackathon**.

### Submission Requirements
- ✅ Public code repository
- ✅ AI logs folder with prompts and iterations
- ✅ Working prototype on Base
- ✅ Demo video (max 5 minutes)
- ✅ Project description (max 150 words)
- ✅ Team info (max 150 words)
- ✅ Unit tests and documentation

### Links
- **Demo Video:** [Coming Soon]
- **Live App:** [Coming Soon]
- **DoraHacks Submission:** [Coming Soon]

---

## 📝 License

MIT License - see [LICENSE](./LICENSE) file for details

---

## 👥 Team

Built by passionate developers leveraging AI tools to create innovative Web3 experiences.

---

## 🙏 Acknowledgments

- **Seedify Fund** - For hosting the Vibe Coins Hackathon
- **Base Network** - For excellent L2 infrastructure
- **OpenZeppelin** - For secure smart contract libraries
- **GitHub Copilot & Claude** - For AI-assisted development
- **Original DungeonHack Team** - For inspiration

---

## 🔗 Links

- [Seedify Vibe Coins Documentation](https://docs.seedify.fund/seedify-vibecoins/)
- [Base Documentation](https://docs.base.org/)
- [DoraHacks Platform](https://dorahacks.io/)
- [Project Plan](./PROJECT_PLAN.md)

---

**Status:** 🟢 Ready for Hackathon Submission
**Version:** 1.0.0
**Last Updated:** December 13, 2025

---

⭐️ If you like this project, please consider starring it on GitHub!
