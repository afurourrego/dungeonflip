# 🎮 DungeonFlip - Project Plan & Roadmap
## Seedify Vibe Coins Hackathon Submission

**Version:** 2.0.0  
**Target Blockchain:** Base (Ethereum L2)  
**Original Project:** [dungeonhack](https://github.com/afurourrego/dungeonhack) (OneChain/Move)  
**New Implementation:** DungeonFlip on Base (Solidity/EVM)  
**Last Updated:** December 4, 2025

---

## 📋 Executive Summary

DungeonFlip is a Web3 card-based dungeon crawler game being rebuilt for the **Seedify Vibe Coins Hackathon**. The project demonstrates AI-assisted development (Vibe Coding) while creating a revenue-generating blockchain game on Base network.

### 🎯 Core Objectives
1. **Rebuild** dungeonhack game for Base blockchain (Solidity instead of Move)
2. **Implement** revenue model with ETH-based economy
3. **Document** all AI-assisted development with prompts and iteration logs
4. **Deploy** working prototype with full Web3 integration
5. **Create** comprehensive tests and documentation
6. **Submit** to Seedify Vibe Coins with all requirements met

### 💰 Revenue Model
- **Entry Fee:** 0.00001 ETH per dungeon run
- **Distribution:**
  - 70% → Weekly Rewards Pool (top 10 players)
  - 20% → Development Treasury
  - 10% → Marketing Reserve
- **Prize Distribution:** Every Friday at 16:20 UTC
- **Leaderboard:** Based on total gems collected

---

## 🎮 Game Overview

### Core Mechanics
- **Infinite Dungeon:** Players progress through rooms, choosing to continue or exit with rewards
- **Cards per Room:** 4 random cards per room
- **Card Distribution:**
  - 🦹 Monster (45%) - Turn-based combat with dice rolls
  - 💎 Treasure (30%) - Collect gems for leaderboard
  - 🕸️ Trap (15%) - Lose 1 HP
  - 🧪 Potion (10%) - Restore HP up to max

### Combat System
- **Player Stats:** ATK (1-2), DEF (1-2), HP (4-6)
- **Hit Chance:** 80% for player attacks
- **Damage Calculation:** Monster ATK - Player DEF (minimum 0)
- **Defense:** Can completely block attacks if DEF ≥ Monster ATK

### Win/Lose Conditions
- **Win:** Exit dungeon voluntarily with gems collected
- **Lose:** HP reaches 0

---

## 🏗️ Architecture Overview

### Technology Stack

#### Smart Contracts
- **Language:** Solidity ^0.8.20
- **Framework:** Hardhat
- **Network:** Base (Ethereum L2)
- **Standards:** ERC-721 (NFTs), ERC-20 compatible patterns
- **Testing:** Hardhat + Chai + Ethers.js

#### Frontend
- **Framework:** Next.js 14 (React, App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **State Management:** Zustand
- **Web3 Integration:** Wagmi v2 + Viem v2
- **Wallet Support:** RainbowKit (MetaMask, Coinbase Wallet, WalletConnect)
- **Query Management:** @tanstack/react-query

#### Development Tools
- **AI Assistant:** GitHub Copilot + Claude (Cursor/VS Code)
- **Deployment:** Vercel (frontend), Base Sepolia Testnet → Base Mainnet
- **Verification:** BaseScan
- **Version Control:** Git/GitHub

---

## 📁 Project Structure

```
dungeonflip/
├── contracts/                      # Solidity smart contracts
│   ├── AventurerNFT.sol           # ERC-721 NFT (owned object)
│   ├── DungeonGame.sol            # Core game logic + entry fees
│   ├── FeeDistributor.sol         # ETH distribution logic
│   ├── RewardsPool.sol            # Weekly prize pool management
│   └── ProgressTracker.sol        # Leaderboard & stats tracking
│
├── frontend/                       # Next.js frontend
│   ├── src/
│   │   ├── app/                   # Next.js 14 App Router
│   │   │   ├── page.tsx           # Home/Landing page
│   │   │   ├── game/              # Game interface
│   │   │   └── leaderboard/       # Leaderboard page
│   │   ├── components/            # React components
│   │   │   ├── wallet/            # Wallet connection
│   │   │   ├── game/              # Game UI components
│   │   │   └── common/            # Shared components
│   │   ├── lib/                   # Utilities & blockchain logic
│   │   │   ├── contracts/         # Contract ABIs & addresses
│   │   │   ├── utils/             # Helper functions
│   │   │   └── constants.ts       # Game constants
│   │   ├── hooks/                 # React hooks
│   │   │   ├── useNFT.ts          # NFT operations
│   │   │   ├── useGame.ts         # Game state
│   │   │   └── useLeaderboard.ts  # Leaderboard data
│   │   ├── store/                 # Zustand state management
│   │   └── styles/                # Global styles
│   ├── public/                    # Static assets
│   │   ├── images/                # Card images, icons
│   │   └── sounds/                # Game sound effects
│   └── package.json
│
├── scripts/                        # Deployment scripts
│   ├── deploy.ts                  # Main deployment script
│   ├── verify.ts                  # Contract verification
│   └── setup-contracts.ts         # Post-deployment setup
│
├── test/                          # Contract tests
│   ├── AventurerNFT.test.ts
│   ├── DungeonGame.test.ts
│   ├── FeeDistributor.test.ts
│   ├── RewardsPool.test.ts
│   └── ProgressTracker.test.ts
│
├── ai_logs/                       # 🚨 REQUIRED FOR HACKATHON
│   ├── prompts.md                 # All AI prompts used
│   ├── iteration_history.md       # Development iterations
│   ├── tools_used.md              # AI tools documentation
│   └── challenges.md              # Problems solved with AI
│
├── docs/                          # Documentation
│   ├── ARCHITECTURE.md            # Technical architecture
│   ├── DEPLOYMENT.md              # Deployment guide
│   ├── GAME_MECHANICS.md          # Game rules & mechanics
│   ├── BASE_INTEGRATION.md        # Base-specific implementation
│   ├── TESTING.md                 # Testing guide
│   └── API_REFERENCE.md           # Contract API documentation
│
├── .env.example                   # Environment variables template
├── hardhat.config.ts              # Hardhat configuration
├── package.json                   # Root dependencies
├── tsconfig.json                  # TypeScript config
├── README.md                      # Project overview
├── PROJECT_PLAN.md                # This file
└── HACKATHON_SUBMISSION.md        # Submission document

```

---

## 📝 Smart Contract Architecture

### 1. AventurerNFT.sol
**Purpose:** ERC-721 NFT representing player characters

**Key Features:**
- Free minting (only gas fees)
- Randomized stats on mint (ATK, DEF, HP)
- Ownable pattern for admin functions
- Metadata stored on-chain or IPFS
- Event emission for indexing

**Functions:**
```solidity
function mintAventurer() external returns (uint256 tokenId)
function getAventurerStats(uint256 tokenId) external view returns (Stats memory)
function tokenURI(uint256 tokenId) public view override returns (string memory)
```

**Events:**
```solidity
event AventurerMinted(address indexed owner, uint256 indexed tokenId, Stats stats)
```

---

### 2. DungeonGame.sol
**Purpose:** Core game logic and entry fee management

**Key Features:**
- Entry fee collection (0.00001 ETH)
- Run tracking with NFT ownership validation
- Integration with FeeDistributor
- Run completion recording
- Emergency pause functionality

**Functions:**
```solidity
function enterDungeon(uint256 nftTokenId) external payable returns (uint256 runId)
function completeRun(uint256 runId, uint256 gemsCollected, uint256 roomsCleared) external
function getActiveRun(address player) external view returns (Run memory)
function isNFTOwner(address player, uint256 tokenId) external view returns (bool)
```

**State Variables:**
```solidity
uint256 public constant ENTRY_FEE = 0.00001 ether;
mapping(address => Run) public activeRuns;
uint256 public totalRunsCompleted;
```

**Events:**
```solidity
event RunStarted(address indexed player, uint256 indexed runId, uint256 nftTokenId)
event RunCompleted(address indexed player, uint256 indexed runId, uint256 gems, uint256 rooms)
```

---

### 3. FeeDistributor.sol
**Purpose:** Automatic ETH distribution to pools

**Key Features:**
- Receives entry fees from DungeonGame
- Automatic split: 70% rewards / 20% dev / 10% marketing
- Withdrawal functions for each pool
- Transparent tracking

**Functions:**
```solidity
function distributeEntryFee() external payable
function withdrawRewardsPool(address to) external onlyRewardsPool returns (uint256)
function withdrawDevTreasury(address to) external onlyOwner returns (uint256)
function withdrawMarketing(address to) external onlyOwner returns (uint256)
function getBalances() external view returns (uint256 rewards, uint256 dev, uint256 marketing)
```

**Distribution:**
```solidity
uint256 public constant REWARDS_PERCENTAGE = 70;
uint256 public constant DEV_PERCENTAGE = 20;
uint256 public constant MARKETING_PERCENTAGE = 10;
```

---

### 4. RewardsPool.sol
**Purpose:** Weekly prize distribution to top players

**Key Features:**
- Weekly prize pool accumulation
- Top 10 player distribution
- Automated distribution via keeper or manual trigger
- Prize calculation with decreasing percentages
- Season/week tracking

**Functions:**
```solidity
function advanceWeek() external
function distributeRewards(address[] calldata topPlayers) external
function getCurrentWeek() external view returns (uint256)
function getCurrentPool() external view returns (uint256)
function canDistribute() external view returns (bool)
```

**Prize Distribution:**
```solidity
// 1st: 30%, 2nd: 20%, 3rd: 15%, 4th: 10%, 5th: 8%, 6th: 6%, 7th: 4%, 8th: 3%, 9th: 2%, 10th: 2%
uint256[10] public PRIZE_PERCENTAGES = [30, 20, 15, 10, 8, 6, 4, 3, 2, 2];
```

**Events:**
```solidity
event WeekAdvanced(uint256 indexed weekNumber, uint256 timestamp)
event RewardsDistributed(uint256 indexed weekNumber, uint256 totalAmount, address[] winners)
event PrizeAwarded(address indexed player, uint256 amount, uint256 rank)
```

---

### 5. ProgressTracker.sol
**Purpose:** Leaderboard and player statistics tracking

**Key Features:**
- Weekly leaderboard management
- Player stats aggregation
- Gas-optimized storage
- Query functions for frontend

**Functions:**
```solidity
function recordRun(address player, uint256 gems, uint256 rooms) external onlyGame
function getTopPlayers(uint256 week, uint256 count) external view returns (address[] memory)
function getPlayerStats(address player) external view returns (PlayerStats memory)
function getCurrentWeekLeaderboard() external view returns (LeaderboardEntry[] memory)
```

**Structs:**
```solidity
struct PlayerStats {
    uint256 totalGems;
    uint256 totalRuns;
    uint256 highestGems;
    uint256 deepestRoom;
}

struct LeaderboardEntry {
    address player;
    uint256 gems;
    uint256 runs;
}
```

---

## 🚀 Development Roadmap

### Phase 1: Project Setup & Foundation (Days 1-2)
**Status:** 🔲 Not Started

#### Tasks:
1. **Initialize Repository**
   - [ ] Create GitHub repository
   - [ ] Initialize git with proper .gitignore
   - [ ] Set up branch protection rules
   - [ ] Create initial README.md

2. **Setup Development Environment**
   - [ ] Install Node.js v18+, npm/yarn
   - [ ] Initialize Hardhat project with TypeScript
   - [ ] Configure Hardhat for Base network
   - [ ] Install development dependencies
   - [ ] Setup VS Code extensions (Solidity, Prettier, ESLint)

3. **Configure Networks & Tools**
   - [ ] Add Base Sepolia testnet to hardhat.config.ts
   - [ ] Add Base mainnet configuration
   - [ ] Setup .env file with private keys and API keys
   - [ ] Configure Etherscan/BaseScan API for verification
   - [ ] Install and configure hardhat-deploy

4. **Create AI Logs Structure**
   - [ ] Create `ai_logs/` directory
   - [ ] Initialize `prompts.md` with template
   - [ ] Initialize `iteration_history.md`
   - [ ] Initialize `tools_used.md`
   - [ ] Initialize `challenges.md`

5. **Document Initial Prompts**
   - [ ] Record project initialization prompts
   - [ ] Document setup assistance from AI
   - [ ] Note tools and commands suggested

**Deliverables:**
- ✅ Working development environment
- ✅ Hardhat project configured for Base
- ✅ AI logs structure ready
- ✅ Initial documentation

---

### Phase 2: Smart Contract Development (Days 3-7)
**Status:** 🔲 Not Started

#### Tasks:

**2.1 AventurerNFT Contract**
- [ ] Write AventurerNFT.sol with ERC-721 standard
- [ ] Implement randomized stats generation (ATK, DEF, HP)
- [ ] Add metadata generation (on-chain or IPFS)
- [ ] Implement minting function (free + gas)
- [ ] Add admin functions (pause, unpause)
- [ ] Write unit tests for all functions
- [ ] Document all AI prompts used
- [ ] Test gas optimization

**2.2 FeeDistributor Contract**
- [ ] Write FeeDistributor.sol
- [ ] Implement 70/20/10 distribution logic
- [ ] Add withdrawal functions for each pool
- [ ] Implement access control (Ownable)
- [ ] Add balance query functions
- [ ] Write unit tests
- [ ] Document AI assistance
- [ ] Test edge cases (zero amounts, reentrancy)

**2.3 RewardsPool Contract**
- [ ] Write RewardsPool.sol
- [ ] Implement week tracking and advancement
- [ ] Create prize distribution logic
- [ ] Add top 10 player distribution function
- [ ] Implement automated distribution capability
- [ ] Write unit tests
- [ ] Document AI prompts
- [ ] Test time-based logic

**2.4 ProgressTracker Contract**
- [ ] Write ProgressTracker.sol
- [ ] Implement leaderboard storage (gas-optimized)
- [ ] Add player stats tracking
- [ ] Create query functions for leaderboard
- [ ] Implement week-based separation
- [ ] Write unit tests
- [ ] Document AI assistance
- [ ] Test sorting and ranking logic

**2.5 DungeonGame Contract**
- [ ] Write DungeonGame.sol
- [ ] Implement entry fee collection
- [ ] Add NFT ownership validation
- [ ] Create run management (start, complete)
- [ ] Integrate with all other contracts
- [ ] Add emergency pause functionality
- [ ] Write comprehensive unit tests
- [ ] Document all AI prompts
- [ ] Test integration between all contracts

**2.6 Contract Integration & Testing**
- [ ] Write integration tests for all contracts
- [ ] Test complete game flow (mint → enter → complete)
- [ ] Test fee distribution flow
- [ ] Test rewards distribution
- [ ] Test leaderboard updates
- [ ] Run gas optimization analysis
- [ ] Perform security audit checklist
- [ ] Document test results

**Deliverables:**
- ✅ 5 fully functional smart contracts
- ✅ Comprehensive test suite (>90% coverage)
- ✅ AI prompts documented for each contract
- ✅ Gas optimization report
- ✅ Security considerations documented

**AI Prompts to Document:**
- Contract structure and architecture prompts
- Solidity syntax and best practices questions
- Security vulnerability checks
- Gas optimization suggestions
- Test case generation prompts
- Integration testing strategies

---

### Phase 3: Frontend Development (Days 8-12)
**Status:** 🔲 Not Started

#### Tasks:

**3.1 Project Setup**
- [ ] Initialize Next.js 14 project with TypeScript
- [ ] Install and configure TailwindCSS
- [ ] Setup Wagmi v2 + Viem v2
- [ ] Configure RainbowKit for wallet connection
- [ ] Setup Zustand for state management
- [ ] Configure @tanstack/react-query
- [ ] Document AI assistance in setup

**3.2 Wallet Integration**
- [ ] Create wallet connection component
- [ ] Implement RainbowKit provider setup
- [ ] Add network switching (Base Sepolia/Mainnet)
- [ ] Create wallet state hooks
- [ ] Add account display component
- [ ] Test with MetaMask and Coinbase Wallet
- [ ] Document prompts for wallet integration

**3.3 Contract Integration Layer**
- [ ] Create contract ABI files
- [ ] Setup contract address management
- [ ] Create wagmi hooks for each contract
- [ ] Implement useNFT hook (mint, check ownership)
- [ ] Implement useGame hook (enter, complete run)
- [ ] Implement useLeaderboard hook (fetch data)
- [ ] Document AI assistance with Web3 integration

**3.4 Game UI Components**
- [ ] Create landing page with game overview
- [ ] Build NFT minting interface
- [ ] Design game board layout
- [ ] Create card components (Monster, Treasure, Trap, Potion)
- [ ] Build combat interface with dice rolls
- [ ] Add HP, ATK, DEF display
- [ ] Create room progression indicator
- [ ] Add exit dungeon button
- [ ] Document UI/UX prompts to AI

**3.5 Game Logic (Client-Side)**
- [ ] Implement card generation algorithm
- [ ] Create turn-based combat system
- [ ] Add damage calculation (with DEF)
- [ ] Implement HP tracking
- [ ] Add gems collection logic
- [ ] Create room progression system
- [ ] Add game state management (Zustand)
- [ ] Document game logic AI assistance

**3.6 Leaderboard Page**
- [ ] Create leaderboard UI
- [ ] Fetch and display top 10 players
- [ ] Show player stats (gems, runs, rank)
- [ ] Add current week display
- [ ] Show prize pool amount
- [ ] Add time until next distribution
- [ ] Document prompts for data visualization

**3.7 Additional Features**
- [ ] Add loading states and skeletons
- [ ] Implement error handling and toasts
- [ ] Create responsive design (mobile-friendly)
- [ ] Add sound effects (optional)
- [ ] Add animations for card flips
- [ ] Create game instructions/tutorial
- [ ] Add FAQ section
- [ ] Document AI assistance for UX enhancements

**Deliverables:**
- ✅ Fully functional Next.js frontend
- ✅ Complete wallet integration
- ✅ Game interface with all mechanics
- ✅ Leaderboard display
- ✅ Mobile-responsive design
- ✅ AI prompts documented for frontend

**AI Prompts to Document:**
- Next.js App Router setup and structure
- Wagmi hooks implementation
- React component design patterns
- TailwindCSS styling queries
- State management with Zustand
- Web3 transaction handling
- Error handling strategies
- Responsive design tips

---

### Phase 4: Testing & Quality Assurance (Days 13-15)
**Status:** 🔲 Not Started

#### Tasks:

**4.1 Smart Contract Testing**
- [ ] Run full test suite
- [ ] Achieve >90% code coverage
- [ ] Test on local Hardhat network
- [ ] Deploy to Base Sepolia testnet
- [ ] Verify contracts on BaseScan
- [ ] Test all functions on testnet
- [ ] Document testing process

**4.2 Frontend Testing**
- [ ] Test wallet connection flow
- [ ] Test NFT minting (testnet)
- [ ] Test game entry with payment
- [ ] Test complete game flow
- [ ] Test leaderboard data fetching
- [ ] Test error scenarios
- [ ] Test on multiple browsers
- [ ] Test mobile responsiveness
- [ ] Document frontend testing

**4.3 Integration Testing**
- [ ] Test full user journey (end-to-end)
- [ ] Test with different wallet types
- [ ] Test network switching
- [ ] Test concurrent users (if possible)
- [ ] Test edge cases (insufficient funds, wrong network)
- [ ] Document integration tests

**4.4 Security Review**
- [ ] Review for common vulnerabilities (reentrancy, overflow)
- [ ] Check access control mechanisms
- [ ] Review fee distribution logic
- [ ] Test pause/unpause functionality
- [ ] Review randomization (if on-chain)
- [ ] Document security considerations

**4.5 Performance Optimization**
- [ ] Optimize gas usage in contracts
- [ ] Optimize frontend bundle size
- [ ] Test loading performance
- [ ] Optimize image assets
- [ ] Test transaction confirmation times
- [ ] Document optimizations

**Deliverables:**
- ✅ Comprehensive test results
- ✅ Verified contracts on testnet
- ✅ Security review report
- ✅ Performance optimization report
- ✅ Bug fixes completed

---

### Phase 5: Documentation (Days 16-17)
**Status:** 🔲 Not Started

#### Tasks:

**5.1 Technical Documentation**
- [ ] Complete ARCHITECTURE.md
- [ ] Complete API_REFERENCE.md
- [ ] Complete DEPLOYMENT.md
- [ ] Complete TESTING.md
- [ ] Complete BASE_INTEGRATION.md
- [ ] Complete GAME_MECHANICS.md
- [ ] Add inline code comments
- [ ] Document contract addresses

**5.2 User Documentation**
- [ ] Write comprehensive README.md
- [ ] Create quickstart guide
- [ ] Add how-to-play instructions
- [ ] Create FAQ section
- [ ] Add troubleshooting guide
- [ ] Document wallet setup

**5.3 AI Logs Completion**
- [ ] Finalize prompts.md with all prompts used
- [ ] Complete iteration_history.md with all iterations
- [ ] Update tools_used.md with all tools
- [ ] Complete challenges.md with problems solved
- [ ] Add summary of AI assistance impact

**5.4 Hackathon Submission Documents**
- [ ] Create HACKATHON_SUBMISSION.md
- [ ] Write project description (max 150 words)
- [ ] Write team info (max 150 words)
- [ ] Prepare demo video script
- [ ] List all Vibe Coding tools used

**Deliverables:**
- ✅ Complete technical documentation
- ✅ User-friendly guides
- ✅ AI logs fully documented
- ✅ Hackathon submission ready

---

### Phase 6: Deployment & Demo (Days 18-20)
**Status:** 🔲 Not Started

#### Tasks:

**6.1 Testnet Deployment**
- [ ] Deploy all contracts to Base Sepolia
- [ ] Verify all contracts on BaseScan
- [ ] Test all functions on testnet
- [ ] Deploy frontend to Vercel (testnet config)
- [ ] Test complete flow on testnet
- [ ] Document deployment process

**6.2 Mainnet Deployment**
- [ ] Audit contracts one final time
- [ ] Deploy all contracts to Base mainnet
- [ ] Verify all contracts on BaseScan
- [ ] Update frontend with mainnet addresses
- [ ] Deploy production frontend to Vercel
- [ ] Test on mainnet (small amounts)
- [ ] Document mainnet deployment

**6.3 Demo Video Creation**
- [ ] Write demo script (max 5 minutes)
- [ ] Record wallet connection demo
- [ ] Record NFT minting process
- [ ] Record full game playthrough
- [ ] Record leaderboard interaction
- [ ] Explain Vibe Coding process used
- [ ] Show AI-assisted development examples
- [ ] Edit and finalize video
- [ ] Upload to YouTube/Vimeo
- [ ] Add video link to submission

**6.4 Final Testing**
- [ ] Test production deployment
- [ ] Verify all links work
- [ ] Test from fresh wallet
- [ ] Test on mobile devices
- [ ] Gather initial feedback
- [ ] Fix any critical issues

**Deliverables:**
- ✅ Deployed contracts on Base mainnet
- ✅ Live frontend on Vercel
- ✅ Demo video uploaded
- ✅ Production environment tested
- ✅ All documentation links verified

---

### Phase 7: Hackathon Submission (Day 21)
**Status:** 🔲 Not Started

#### Tasks:

**7.1 Pre-Submission Checklist**
- [ ] Verify all contracts deployed and verified
- [ ] Verify frontend is live and functional
- [ ] Verify AI logs folder is complete
- [ ] Verify demo video is accessible
- [ ] Verify all documentation is complete
- [ ] Verify README has deployment instructions
- [ ] Verify project description is under 150 words
- [ ] Verify team info is under 150 words

**7.2 Repository Preparation**
- [ ] Clean up repository
- [ ] Verify commit history shows AI-assisted development
- [ ] Add LICENSE file (MIT)
- [ ] Ensure .env.example is up to date
- [ ] Verify all dependencies are listed
- [ ] Add badges to README (if applicable)
- [ ] Create GitHub release/tag

**7.3 Submission**
- [ ] Submit basic info on Seedify typeform
- [ ] Submit project details on DoraHacks
- [ ] Include GitHub repository link
- [ ] Include demo video link
- [ ] Include live deployment link
- [ ] Include project description
- [ ] Include team info
- [ ] Submit all required materials

**7.4 Post-Submission**
- [ ] Share on social media (Twitter/X)
- [ ] Engage with hackathon community
- [ ] Prepare for potential pitch day
- [ ] Monitor for feedback/questions
- [ ] Be ready to make quick fixes if needed

**Deliverables:**
- ✅ Complete hackathon submission
- ✅ All requirements met
- ✅ Repository public and accessible
- ✅ Demo video live
- ✅ Ready for evaluation

---

## 🔧 Technical Implementation Details

### Base Network Integration

#### Network Configuration
```typescript
// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org",
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 84532,
    },
    base: {
      url: process.env.BASE_MAINNET_RPC || "https://mainnet.base.org",
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 8453,
    },
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_API_KEY!,
      base: process.env.BASESCAN_API_KEY!,
    },
  },
};

export default config;
```

#### Frontend Configuration
```typescript
// wagmi.config.ts
import { http, createConfig } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors'

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    metaMask(),
    coinbaseWallet({ appName: 'DungeonFlip' }),
    walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID! }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
})
```

### Game Logic Implementation

#### Card Generation (Client-Side)
```typescript
// lib/game/cardGeneration.ts
enum CardType {
  MONSTER = 'MONSTER',
  TREASURE = 'TREASURE',
  TRAP = 'TRAP',
  POTION = 'POTION',
}

const CARD_PROBABILITIES = {
  MONSTER: 0.45,
  TREASURE: 0.30,
  TRAP: 0.15,
  POTION: 0.10,
};

export function generateCards(count: number = 4): CardType[] {
  const cards: CardType[] = [];
  
  for (let i = 0; i < count; i++) {
    const rand = Math.random();
    
    if (rand < CARD_PROBABILITIES.MONSTER) {
      cards.push(CardType.MONSTER);
    } else if (rand < CARD_PROBABILITIES.MONSTER + CARD_PROBABILITIES.TREASURE) {
      cards.push(CardType.TREASURE);
    } else if (rand < 1 - CARD_PROBABILITIES.POTION) {
      cards.push(CardType.TRAP);
    } else {
      cards.push(CardType.POTION);
    }
  }
  
  return cards;
}
```

#### Combat System
```typescript
// lib/game/combat.ts
interface CombatResult {
  playerDamage: number;
  monsterDamage: number;
  playerHit: boolean;
  monsterHit: boolean;
}

export function resolveCombat(
  playerAtk: number,
  playerDef: number,
  monsterAtk: number,
  monsterDef: number
): CombatResult {
  const playerHitChance = 0.8;
  const playerHit = Math.random() < playerHitChance;
  
  const playerDamage = playerHit ? Math.max(playerAtk - monsterDef, 0) : 0;
  const monsterDamage = Math.max(monsterAtk - playerDef, 0);
  
  return {
    playerDamage,
    monsterDamage,
    playerHit,
    monsterHit: true,
  };
}
```

### State Management

#### Game State (Zustand)
```typescript
// store/gameStore.ts
import create from 'zustand';

interface GameState {
  currentRun: {
    runId: number | null;
    nftTokenId: number | null;
    hp: number;
    maxHp: number;
    atk: number;
    def: number;
    gems: number;
    roomsCleared: number;
    isActive: boolean;
  };
  startRun: (runId: number, nftTokenId: number, stats: any) => void;
  updateHP: (newHp: number) => void;
  collectGems: (amount: number) => void;
  advanceRoom: () => void;
  endRun: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentRun: {
    runId: null,
    nftTokenId: null,
    hp: 0,
    maxHp: 0,
    atk: 0,
    def: 0,
    gems: 0,
    roomsCleared: 0,
    isActive: false,
  },
  startRun: (runId, nftTokenId, stats) => set({
    currentRun: {
      runId,
      nftTokenId,
      hp: stats.hp,
      maxHp: stats.hp,
      atk: stats.atk,
      def: stats.def,
      gems: 0,
      roomsCleared: 0,
      isActive: true,
    }
  }),
  updateHP: (newHp) => set((state) => ({
    currentRun: { ...state.currentRun, hp: Math.max(0, newHp) }
  })),
  collectGems: (amount) => set((state) => ({
    currentRun: { ...state.currentRun, gems: state.currentRun.gems + amount }
  })),
  advanceRoom: () => set((state) => ({
    currentRun: { ...state.currentRun, roomsCleared: state.currentRun.roomsCleared + 1 }
  })),
  endRun: () => set({
    currentRun: {
      runId: null,
      nftTokenId: null,
      hp: 0,
      maxHp: 0,
      atk: 0,
      def: 0,
      gems: 0,
      roomsCleared: 0,
      isActive: false,
    }
  }),
}));
```

---

## 🧪 Testing Strategy

### Smart Contract Tests

#### Test Coverage Goals
- **Unit Tests:** >90% code coverage
- **Integration Tests:** All contract interactions
- **Edge Cases:** Boundary conditions, zero values
- **Security Tests:** Reentrancy, overflow, access control

#### Example Test Structure
```typescript
// test/AventurerNFT.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";
import { AventurerNFT } from "../typechain-types";

describe("AventurerNFT", function () {
  let nft: AventurerNFT;
  let owner: any;
  let player: any;

  beforeEach(async function () {
    [owner, player] = await ethers.getSigners();
    const NFT = await ethers.getContractFactory("AventurerNFT");
    nft = await NFT.deploy();
  });

  describe("Minting", function () {
    it("Should mint a new adventurer NFT", async function () {
      await expect(nft.connect(player).mintAventurer())
        .to.emit(nft, "AventurerMinted");
      
      expect(await nft.balanceOf(player.address)).to.equal(1);
    });

    it("Should generate random stats within range", async function () {
      await nft.connect(player).mintAventurer();
      const stats = await nft.getAventurerStats(1);
      
      expect(stats.atk).to.be.within(1, 2);
      expect(stats.def).to.be.within(1, 2);
      expect(stats.hp).to.be.within(4, 6);
    });

    it("Should allow multiple mints per address", async function () {
      await nft.connect(player).mintAventurer();
      await nft.connect(player).mintAventurer();
      
      expect(await nft.balanceOf(player.address)).to.equal(2);
    });
  });
});
```

### Frontend Testing

#### Testing Approach
- **Manual Testing:** User flows, UI/UX
- **Browser Testing:** Chrome, Firefox, Safari, Mobile
- **Wallet Testing:** MetaMask, Coinbase Wallet
- **Network Testing:** Base Sepolia, Base Mainnet

#### Test Scenarios
1. **Wallet Connection:**
   - Connect with MetaMask
   - Connect with Coinbase Wallet
   - Switch networks
   - Disconnect and reconnect

2. **NFT Minting:**
   - Mint first NFT
   - Mint multiple NFTs
   - View NFT stats
   - Handle minting errors

3. **Game Flow:**
   - Enter dungeon with payment
   - Play through multiple rooms
   - Handle card interactions
   - Combat mechanics
   - Exit dungeon successfully
   - Handle death scenario

4. **Leaderboard:**
   - View current week leaders
   - View player stats
   - Check prize pool
   - Verify data accuracy

---

## 📚 AI Logs Documentation Requirements

### prompts.md Structure
```markdown
# AI Prompts Used in DungeonFlip Development

## Project Setup Prompts

### Prompt 1: Initial Project Structure
**Date:** 2025-12-04
**Tool:** GitHub Copilot
**Prompt:** "Create a Hardhat project structure for a game on Base blockchain with NFTs, leaderboard, and rewards distribution"
**Response:** [Include AI response]
**Iteration:** Initial
**Outcome:** Basic project structure created

### Prompt 2: Smart Contract Architecture
**Date:** 2025-12-04
**Tool:** Claude (Cursor)
**Prompt:** "Design smart contract architecture for a dungeon game with entry fees, NFT ownership, and weekly rewards"
**Response:** [Include AI response]
**Iteration:** 1
**Outcome:** Five-contract architecture designed

[Continue for all prompts...]
```

### iteration_history.md Structure
```markdown
# Development Iteration History

## Sprint 1: Smart Contract Development

### Iteration 1: AventurerNFT Contract
**Date:** 2025-12-05
**Goal:** Implement basic ERC-721 NFT with random stats
**AI Assistance:** Used GitHub Copilot to generate ERC-721 boilerplate
**Changes Made:**
- Created AventurerNFT.sol
- Implemented mintAventurer() function
- Added randomized stats generation
**Issues Encountered:** Randomness on-chain limitations
**Solution:** Used block.timestamp and blockhash for pseudo-randomness
**Testing:** Wrote 10 unit tests, all passing

[Continue for all iterations...]
```

### tools_used.md Structure
```markdown
# AI Tools Used in Development

## Primary Tools

### 1. GitHub Copilot
**Version:** Latest (VS Code Extension)
**Usage:** Code generation, autocomplete, refactoring
**Frequency:** Throughout entire development
**Key Features Used:**
- Inline suggestions
- Multi-line completions
- Function generation
- Test generation

### 2. Claude (Cursor)
**Version:** Claude 3.5 Sonnet
**Usage:** Architecture design, problem-solving, debugging
**Frequency:** Daily for planning and complex issues
**Key Features Used:**
- Long-form explanations
- Code reviews
- Architecture suggestions
- Documentation generation

### 3. ChatGPT
**Version:** GPT-4
**Usage:** Research, documentation, Solidity best practices
**Frequency:** As needed for specific questions

[Continue with details...]
```

### challenges.md Structure
```markdown
# Challenges Solved with AI Assistance

## Challenge 1: Random Number Generation in Solidity
**Date:** 2025-12-05
**Context:** Needed to generate random stats for NFT minting
**Problem:** Solidity doesn't have true randomness, and Chainlink VRF is expensive
**AI Tool Used:** Claude (Cursor)
**Prompt:** "How to generate pseudo-random numbers in Solidity for NFT stats without using Chainlink VRF?"
**Solution Provided:** Use combination of block.timestamp, block.prevrandao, and user address
**Implementation:** [Code snippet]
**Outcome:** Acceptable randomness for game purposes at low cost

## Challenge 2: Gas Optimization for Leaderboard
**Date:** 2025-12-07
**Context:** Leaderboard updates were consuming too much gas
**Problem:** Sorting on-chain is expensive
**AI Tool Used:** GitHub Copilot
**Prompt:** "Optimize Solidity leaderboard storage and updates for gas efficiency"
**Solution Provided:** Use mapping with separate array for top players only
**Implementation:** [Code snippet]
**Outcome:** Reduced gas costs by 40%

[Continue for all challenges...]
```

---

## 🎥 Demo Video Script

### Video Structure (Max 5 minutes)

**Segment 1: Introduction (30 seconds)**
- Introduce DungeonFlip
- Mention Seedify Vibe Coins Hackathon
- Brief overview of game concept
- Highlight AI-assisted development (Vibe Coding)

**Segment 2: Architecture Overview (45 seconds)**
- Show project structure
- Explain smart contracts on Base
- Highlight key technologies used
- Show AI logs folder

**Segment 3: Live Demo (2 minutes)**
- Connect wallet (MetaMask or Coinbase)
- Mint Adventurer NFT (show stats)
- Enter dungeon (pay 0.00001 ETH)
- Play through a few rooms
- Show card flipping, combat, treasures
- Exit dungeon or show death
- View leaderboard

**Segment 4: AI-Assisted Development (1 minute)**
- Show prompts.md examples
- Demonstrate code generated by AI
- Explain iteration process
- Show challenges solved with AI

**Segment 5: Technical Highlights (45 seconds)**
- Contract verification on BaseScan
- Test results and coverage
- Deployment process
- Frontend responsive design

**Segment 6: Conclusion (30 seconds)**
- Summarize key features
- Revenue model and sustainability
- Future roadmap
- Call to action (try the game!)

---

## 📊 Success Metrics

### Technical Metrics
- [ ] Smart contract test coverage >90%
- [ ] All contracts deployed and verified on Base
- [ ] Frontend load time <2 seconds
- [ ] Mobile responsiveness score >95
- [ ] Zero critical security vulnerabilities
- [ ] Gas optimization (entry fee transaction <100k gas)

### Hackathon Submission Metrics
- [ ] All submission requirements met
- [ ] AI logs complete with 50+ documented prompts
- [ ] Demo video under 5 minutes
- [ ] Project description under 150 words
- [ ] Team info under 150 words
- [ ] Working prototype deployed
- [ ] Public GitHub repository with commit history

### User Experience Metrics
- [ ] Wallet connection success rate >95%
- [ ] Transaction success rate >98%
- [ ] Game completion rate (exit alive) >30%
- [ ] Average session time >5 minutes
- [ ] Mobile users >40%

---

## 🚧 Risk Management

### Technical Risks

**Risk 1: Smart Contract Vulnerabilities**
- **Mitigation:** Comprehensive testing, security review checklist, use of OpenZeppelin libraries
- **Contingency:** Have backup time for fixes, implement pause functionality

**Risk 2: Base Network Issues**
- **Mitigation:** Test extensively on testnet, monitor Base status
- **Contingency:** Deploy to Base Sepolia first, delay mainnet if needed

**Risk 3: Frontend Web3 Integration Issues**
- **Mitigation:** Use well-tested libraries (Wagmi, Viem), test with multiple wallets
- **Contingency:** Have fallback UI states, provide clear error messages

### Timeline Risks

**Risk 1: Scope Creep**
- **Mitigation:** Strict adherence to roadmap, prioritize core features
- **Contingency:** Mark optional features clearly, cut if necessary

**Risk 2: Technical Blockers**
- **Mitigation:** Leverage AI assistance for problem-solving, community support
- **Contingency:** Have alternative approaches documented

**Risk 3: Deployment Delays**
- **Mitigation:** Deploy to testnet early, practice deployment process
- **Contingency:** Extra buffer time in Phase 6

---

## 🎯 Hackathon Submission Checklist

### Public Code Repository ✅
- [ ] GitHub repository is public
- [ ] README.md is comprehensive
- [ ] Source code is well-organized
- [ ] `ai_logs/` folder exists with:
  - [ ] prompts.md (all AI prompts)
  - [ ] iteration_history.md (development iterations)
  - [ ] tools_used.md (AI tools documentation)
  - [ ] challenges.md (problems solved with AI)
- [ ] Commit history shows AI-assisted development
- [ ] Commits have descriptive messages (e.g., "AI-generated NFT contract")

### Working Prototype ✅
- [ ] Core features functional:
  - [ ] Wallet connection
  - [ ] NFT minting
  - [ ] Game entry with payment
  - [ ] Card-based gameplay
  - [ ] Combat system
  - [ ] Leaderboard
- [ ] Deployed on Base mainnet
- [ ] Frontend deployed (Vercel/Netlify)
- [ ] Deployment instructions in repo
- [ ] Web3 integration working
- [ ] Revenue model implemented
- [ ] Basic tests included
- [ ] Testing instructions provided

### Demo Video ✅
- [ ] Video uploaded to YouTube/Vimeo
- [ ] Video is under 5 minutes
- [ ] Video is in English
- [ ] Video shows:
  - [ ] Functionality walkthrough
  - [ ] User experience
  - [ ] "Vibe" explanation
  - [ ] AI-assisted development process
  - [ ] Challenges overcome with AI
- [ ] Video link works publicly
- [ ] Video link in HACKATHON_SUBMISSION.md

### Project Description ✅
- [ ] Written (max 150 words)
- [ ] Covers project vision
- [ ] Explains problem solved
- [ ] Describes target users
- [ ] Included in HACKATHON_SUBMISSION.md

### Team Info ✅
- [ ] Written (max 150 words)
- [ ] Team background explained
- [ ] Expertise highlighted
- [ ] Included in HACKATHON_SUBMISSION.md

### Bonus Points
- [ ] Revenue model is clear and feasible
- [ ] Product has growth potential
- [ ] Strong product-market fit demonstrated
- [ ] Unique value proposition
- [ ] Professional presentation

---

## 📞 Resources & References

### Base Network
- [Base Documentation](https://docs.base.org/)
- [Base Sepolia Testnet](https://sepolia.base.org/)
- [BaseScan Explorer](https://basescan.org/)
- [Base Discord](https://discord.gg/base)

### Development Tools
- [Hardhat Documentation](https://hardhat.org/docs)
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Wagmi v2 Documentation](https://wagmi.sh/)
- [RainbowKit Documentation](https://www.rainbowkit.com/)

### Solidity & Smart Contracts
- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Ethereum Gas Optimization Tips](https://github.com/iskdrews/awesome-solidity-gas-optimization)

### Hackathon
- [Seedify Vibe Coins Documentation](https://docs.seedify.fund/seedify-vibecoins/)
- [DoraHacks Platform](https://dorahacks.io/)
- [Submission Typeform](https://seedify.typeform.com/to/wDIrxYsW)

### AI Tools
- [GitHub Copilot](https://github.com/features/copilot)
- [Cursor](https://cursor.sh/)
- [Claude (Anthropic)](https://www.anthropic.com/claude)
- [ChatGPT](https://chat.openai.com/)

### Community
- [Base Twitter](https://twitter.com/base)
- [Seedify Twitter](https://twitter.com/SeedifyFund)
- [Ethereum Stack Exchange](https://ethereum.stackexchange.com/)

---

## 👥 Team Roles (Example - Update as Needed)

### Lead Developer
- **Responsibilities:** Smart contract development, architecture, deployment
- **Skills:** Solidity, Hardhat, Base network
- **AI Tools:** GitHub Copilot, Claude

### Frontend Developer
- **Responsibilities:** Next.js frontend, Web3 integration, UI/UX
- **Skills:** TypeScript, React, Wagmi, TailwindCSS
- **AI Tools:** GitHub Copilot, ChatGPT

### Designer/UX
- **Responsibilities:** UI design, user experience, game feel
- **Skills:** Figma, CSS, Game design
- **AI Tools:** Midjourney (for assets), ChatGPT

### Tester/QA
- **Responsibilities:** Testing, bug reports, documentation
- **Skills:** Manual testing, Test writing
- **AI Tools:** ChatGPT for test scenarios

*Note: Roles can be overlapping for small teams or solo developers*

---

## 🔄 Post-Hackathon Roadmap

### Phase 8: Community & Growth (Post-Launch)
- [ ] Gather user feedback
- [ ] Monitor contract activity
- [ ] Track leaderboard participation
- [ ] Analyze revenue and distribution
- [ ] Engage with Seedify community

### Phase 9: Iteration & Improvement
- [ ] Fix bugs based on user feedback
- [ ] Optimize gas costs further
- [ ] Add new card types or mechanics
- [ ] Improve UI/UX based on analytics
- [ ] Add more NFT trait variations

### Phase 10: Scaling & Features
- [ ] Implement NFT marketplace integration
- [ ] Add achievements/badges system
- [ ] Create seasonal events
- [ ] Add multiplayer features
- [ ] Explore cross-chain compatibility

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- **Seedify Fund** - For hosting the Vibe Coins Hackathon
- **Base Network** - For providing excellent L2 infrastructure
- **OpenZeppelin** - For secure smart contract libraries
- **GitHub Copilot** - For AI-assisted code generation
- **Claude (Anthropic)** - For architecture and problem-solving assistance
- **Original DungeonHack Team** - For the initial concept and inspiration

---

**Status:** 📝 Plan Complete - Ready for Development  
**Next Step:** Phase 1 - Project Setup & Foundation  
**Last Updated:** December 4, 2025

---

## Quick Reference Commands

### Contract Development
```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Check coverage
npx hardhat coverage

# Deploy to Base Sepolia
npx hardhat run scripts/deploy.ts --network baseSepolia

# Verify contract
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS>
```

### Frontend Development
```bash
# Install dependencies
cd frontend && npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel deploy --prod
```

### Git Workflow
```bash
# Initial commit
git init
git add .
git commit -m "Initial commit: Project setup with AI-assisted architecture"

# Feature commits
git add .
git commit -m "feat: AI-generated AventurerNFT contract with tests"

# Documentation commits
git add ai_logs/
git commit -m "docs: Updated AI prompts log with contract generation"
```

---

**End of Project Plan** 🚀
