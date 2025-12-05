# AI Prompts Used in DungeonFlip Development

**Project:** DungeonFlip - Web3 Dungeon Crawler Game  
**Hackathon:** Seedify Vibe Coins  
**Tools Used:** GitHub Copilot, Claude (Cursor), ChatGPT  
**Started:** December 4, 2025

---

## Project Initialization

### Prompt 1: Project Planning and Architecture Design
**Date:** 2025-12-04  
**Time:** Initial Setup  
**Tool:** Claude (Cursor)  
**Context:** Starting new hackathon project based on existing OneChain game

**Prompt:**
```
Necesito que leas y escanees este repositorio: https://github.com/afurourrego/dungeonhack

vamos a rehacer este proyecto para esta hackathon: [Seedify Vibe Coins details]

necesito que generes un plan de trabajo y una lista de tareas para que empieces a desarrollar la app paso a paso en un archivo .MD que puedas consultar tu y pueda compartirlo en otro hilo con otra IA y pueda conocer facilmente el proyecto.
```

**Response Summary:**
- Created comprehensive PROJECT_PLAN.md with 7 development phases
- Defined smart contract architecture (5 contracts for Base blockchain)
- Established technology stack (Hardhat, Next.js 14, Wagmi, etc.)
- Created detailed roadmap with 21-day timeline
- Included AI logs structure and hackathon requirements

**Iteration:** Initial  
**Outcome:** ✅ Complete project plan and roadmap created  
**Files Created:** PROJECT_PLAN.md

**Learning:**
- Project structure organization
- Hackathon submission requirements
- Base blockchain integration requirements
- Migration from Move (OneChain) to Solidity (Base)

---

### Prompt 2: Repository Structure Initialization
**Date:** 2025-12-04  
**Tool:** GitHub Copilot Chat  
**Context:** Setting up initial project structure

**Prompt:**
```
Create initial repository structure for DungeonFlip project with:
- .gitignore for Hardhat and Next.js
- README.md with project overview
- Basic folder structure (contracts, scripts, test, ai_logs, docs)
```

**Response Summary:**
- Generated comprehensive .gitignore covering Node.js, Hardhat, Next.js
- Created detailed README.md with badges, quick start, and documentation
- Created folder structure for organized development

**Iteration:** 1  
**Outcome:** ✅ Repository structure initialized  
**Files Created:**
- .gitignore
- README.md
- contracts/ (directory)
- scripts/ (directory)
- test/ (directory)
- ai_logs/ (directory)
- docs/ (directory)

**Learning:**
- Best practices for .gitignore in Web3 projects
- README structure for hackathon submissions
- Folder organization for smart contract projects

---

## Smart Contract Development

### Prompt 3: AventurerNFT Contract Development
**Date:** 2025-12-04  
**Tool:** GitHub Copilot  
**Context:** Creating ERC-721 NFT contract for player adventurers with randomized stats

**Prompt:**
```
Create AventurerNFT.sol contract:
- ERC-721 implementation with OpenZeppelin
- Free minting function with randomized stats (ATK: 1-2, DEF: 1-2, HP: 4-6)
- Pausable functionality
- Owner-controlled base URI for metadata
- Event emission for stats generation
```

**Response Summary:**
- Created complete ERC-721 contract with OpenZeppelin v5.0.0
- Implemented pseudo-random stat generation using block.timestamp and prevrandao
- Added pause/unpause, ownership, and metadata features
- Created comprehensive test suite with 34 test cases
- All tests passing with proper gas optimization

**Iteration:** 1  
**Outcome:** ✅ Complete with 34/34 tests passing  
**Files Created/Modified:**
- contracts/AventurerNFT.sol
- test/AventurerNFT.test.ts

**Learning:**
- Pseudo-randomness acceptable for non-critical game stats
- OpenZeppelin ERC721 best practices
- Gas-efficient struct storage for stats
- Importance of comprehensive event logging

---

### Prompt 4: FeeDistributor Contract Development
**Date:** 2025-12-04  
**Tool:** GitHub Copilot  
**Context:** Creating automatic ETH distribution contract (70% rewards, 20% dev, 10% marketing)

**Prompt:**
```
Create FeeDistributor.sol contract:
- Receive entry fees from game contract
- Automatic 70/20/10 split to rewards/dev/marketing
- Withdrawal functions for each pool
- Only rewards pool contract can withdraw rewards
- Owner can withdraw dev/marketing
- Pausable functionality
```

**Response Summary:**
- Created distribution contract with precise percentage calculations
- Implemented role-based withdrawal permissions
- Added rounding handling to prevent loss of funds
- Created 45 test cases covering all scenarios
- All tests passing with accurate distribution math

**Iteration:** 1  
**Outcome:** ✅ Complete with 45/45 tests passing  
**Files Created/Modified:**
- contracts/FeeDistributor.sol
- test/FeeDistributor.test.ts

**Learning:**
- Importance of handling wei rounding in percentage calculations
- Role-based access control patterns
- Modifier patterns for authorization
- Integration testing with mock contracts

---

### Prompt 5: RewardsPool Contract and Test Debugging
**Date:** 2025-12-04  
**Tool:** GitHub Copilot  
**Context:** Creating weekly prize distribution contract and fixing test failures

**Prompt:**
```
Create RewardsPool.sol contract:
- Weekly prize distribution to top 10 players
- Prize percentages: 30%, 20%, 15%, 10%, 8%, 6%, 4%, 3%, 2%, 2%
- Week advancement with 6-day minimum interval
- Integration with FeeDistributor via interface
- Dust handling (remainder goes to first place)
- Emergency pause and withdrawal functions

Fix failing tests caused by receive() function restrictions
```

**Response Summary:**
- Created complete RewardsPool contract with week management
- Implemented prize distribution with dust handling
- Debugged 3 failing tests related to receive() function security
- Fixed tests to respect contract security constraints
- Refactored tests to use proper ETH flow through FeeDistributor
- All 39 tests passing (118 total across all contracts)

**Iteration:** 3 (initial creation + 2 debugging iterations)  
**Outcome:** ✅ Complete with 39/39 tests passing  
**Files Created/Modified:**
- contracts/RewardsPool.sol
- test/RewardsPool.test.ts

**Learning:**
- Restrictive receive() functions require careful test design
- Week-based distribution logic with history tracking
- Integration between multiple contracts requires mock setup
- Test refactoring to match security constraints
- Emergency functions may have no balance in normal operation

---

## Frontend Development

### Prompt 4: Testnet Deployment Setup
**Date:** 2025-12-04  
**Tool:** GitHub Copilot  
**Context:** Deploy all smart contracts to Base Sepolia testnet and verify on BaseScan

**Prompt:**
```
necesito que generes un plan de trabajo y una lista de tareas para que empieces a desarrollar la app paso a paso
Inicia a trabajar
Continua
como hacemos el deploy a la testnet
crea el archivo .env y dejalo listo para yo ingresar los datos
ya llene los datos en el .env porfavor continua con el deploy
```

**Response Summary:**
- Created deployment guide (docs/DEPLOYMENT.md) in Spanish
- Generated .env template with all required variables
- Created deployment script (scripts/deploy.ts) with:
  - Sequential deployment of all 5 contracts
  - Automatic configuration of contract connections
  - Deployment summary with addresses and verification commands
- Updated hardhat.config.ts for Etherscan v2 API
- Successfully deployed and verified all contracts on Base Sepolia

**Iteration:** Multiple  
**Outcome:** ✅ Success - All contracts deployed and verified  
**Files Created/Modified:**
- docs/DEPLOYMENT.md
- .env
- scripts/deploy.ts
- hardhat.config.ts (updated etherscan config)

**Contract Addresses (Base Sepolia):**
- AventurerNFT: 0xBD61aAEb1c8705889a25054cCcA61D2c06e1b25A
- FeeDistributor: 0x221de7B5A230a9d19B11a30d797e7cBdD2b4a880
- ProgressTracker: 0x9e26a0F842D963F29E5541745fb93b8F0BCB6919
- RewardsPool: 0x0a9767856c51A28176d90f840B8D3903B7cCfd02
- DungeonGame: 0xe601c341270404422f16829869d0a3AA296E5227

**Learning:**
- Base Sepolia RPC configuration
- BaseScan verification process
- Environment variable management
- Multi-contract deployment orchestration
- Etherscan v2 API migration

---

## Frontend Development

### Prompt 5: Complete Frontend Implementation
**Date:** 2025-12-04  
**Tool:** GitHub Copilot + Claude  
**Context:** Build complete Next.js frontend with Web3 integration for all game features

**Prompt:**
```
Desarrolla la frontend.
Necesitas actualizar el proyect_plan para el frontent?
```

**Response Summary:**
- Reviewed PROJECT_PLAN.md Phase 3 (Frontend Development)
- Initialized Next.js 14 project with App Router, TypeScript, TailwindCSS
- Installed Web3 dependencies (wagmi, viem, RainbowKit, zustand, @tanstack/react-query)
- Created complete Web3 integration layer:
  - Wagmi configuration with Base Sepolia & Mainnet
  - RainbowKit provider with dark theme
  - Custom hooks for all contract interactions
  - Contract ABIs extraction script
- Built 4 complete pages:
  - Landing page with wallet connection
  - NFT minting interface
  - Full game interface with card selection and combat
  - Leaderboard with top 10 players
- Implemented Zustand store for client-side game state
- Created responsive UI with purple/pink gradient theme

**Iteration:** 1  
**Outcome:** ✅ Success - Frontend fully functional and running  
**Files Created:**
- frontend/package.json
- frontend/lib/wagmi.ts
- frontend/lib/constants.ts
- frontend/lib/contracts/*.json (5 ABIs)
- frontend/components/Web3Provider.tsx
- frontend/hooks/useNFT.ts
- frontend/hooks/useGame.ts
- frontend/hooks/useLeaderboard.ts
- frontend/store/gameStore.ts
- frontend/app/page.tsx
- frontend/app/mint/page.tsx
- frontend/app/game/page.tsx
- frontend/app/leaderboard/page.tsx
- extract-abis.js

**Files Modified:**
- frontend/app/layout.tsx

**Learning:**
- Next.js 14 App Router best practices
- Wagmi v2 + Viem v2 integration patterns
- RainbowKit configuration and theming
- Zustand store patterns for game state
- TypeScript types for contract interactions
- Responsive design with TailwindCSS
- Handling optional dependencies in monorepos
- Client-side vs blockchain state management

**Challenges Solved:**
1. **Optional Dependencies:** Removed optional wallet connectors to avoid build errors
2. **Module Resolution:** Simplified to only injected connector
3. **TypeScript Types:** Added proper type assertions for contract hooks
4. **Template Cleanup:** Removed Next.js starter code completely
5. **Monorepo Lockfiles:** Accepted warning as non-blocking

---

## Testing & Optimization

### Prompt 6: [To be documented during testing phase]
**Date:** TBD  
**Tool:** TBD  
**Context:** TBD

---

## Template for New Prompts

When adding new prompts, use this template:

```markdown
### Prompt X: [Brief Title]
**Date:** YYYY-MM-DD  
**Time:** [Optional specific time]  
**Tool:** [GitHub Copilot / Claude / ChatGPT / Other]  
**Context:** [What you were trying to accomplish]

**Prompt:**
```
[Exact prompt text]
```

**Response Summary:**
[Brief summary of AI response]

**Iteration:** [Initial / 1 / 2 / etc.]  
**Outcome:** [✅ Success / ⚠️ Partial / ❌ Failed]  
**Files Created/Modified:** [List of files]

**Learning:**
- [Key takeaway 1]
- [Key takeaway 2]
```

---

**Total Prompts Documented:** 7 (6 detailed + 1 template)  
**Last Updated:** December 4, 2025  
**Status:** ✅ Frontend Complete with Enhanced Visuals - Ready for Testing & Deployment

---

### Prompt 7: Enhanced Visual Design Implementation
**Date:** 2025-12-04  
**Tool:** Claude (Cursor)  
**Context:** Apply professional visual design from dungeonhack reference project to improve UI/UX

**Prompt:**
```
Necesito que leas y escanees este repositorio: https://github.com/afurourrego/dungeonhack

Necesito que te enfoques en la parte estetica el css, los colores y todo lo demas, necesito que lo apliques a este proyecto
```

**Response Summary:**
- Analyzed dungeonhack repository's visual design system
- Enhanced globals.css with premium styling components:
  - `.royal-board` - Premium container with complex gradients and borders
  - `.royal-dot` and `.royal-divider` - Decorative elements
  - `.run-counter` - Animated counter display with shine effect
  - `.dot-matrix` - Digital font styling for stats
  - Leaderboard scroll styling
- Updated tailwind.config.js with hover-float animation keyframe
- Applied new styles across all main pages:
  - Leaderboard: Royal-board containers, dot-matrix stats, amber/gold theme
  - Mint: Enhanced NFT minting UI with decorative elements
  - Home: Improved feature cards with animations and glows
- Maintained all existing animations (flip-3d, shine, shake, glow-red, bubble, particle-burst, energy-pulse)
- Successfully compiled with no TypeScript errors

**Iteration:** 1  
**Outcome:** ✅ Success - Enhanced visual design applied throughout  
**Files Modified:**
- frontend/app/globals.css
- frontend/tailwind.config.js
- frontend/app/leaderboard/page.tsx
- frontend/app/mint/page.tsx
- frontend/app/page.tsx

**Visual Enhancements:**
- 🎨 Amber/Gold color scheme (dungeonhack inspired)
- ✨ Premium "royal-board" styling with multi-layer shadows
- 🔢 Dot-matrix font for digital displays
- 🌟 Enhanced animations (shine, glow, float, bounce)
- 💫 Improved hover states and transitions
- 📊 Better stat box designs with glass-morphism
- 🏆 Professional leaderboard presentation

**Learning:**
- CSS layering techniques for depth effects
- Custom animation integration
- Component-specific styling patterns
- Maintaining functionality while enhancing visuals
- Reference project analysis for design inspiration

---

## 🚀 ONBOARDING PROMPT FOR NEW TEAM MEMBERS

**Copy the following prompt to share with teammates starting a new chat session:**

---

### DUNGEONFLIP PROJECT ONBOARDING PROMPT

Hi! I'm joining the DungeonFlip development team for the Seedify Vibe Coins Hackathon. Here's the complete context:

**PROJECT OVERVIEW:**
DungeonFlip is a Web3 dungeon crawler game on Base blockchain where players mint NFT adventurers, battle monsters, collect gems, and compete for weekly ETH prizes. It's based on the dungeonhack game (OneChain/Move) but rebuilt for Base/Ethereum using Solidity.

**REPOSITORY:**
- GitHub: https://github.com/afurourrego/dungeonflip
- Reference Project: https://github.com/afurourrego/dungeonhack (for visual design inspiration)

**CURRENT STATUS:**
✅ Smart Contracts: 5 contracts deployed and verified on Base Sepolia
✅ Frontend: Complete Next.js 14 app with Web3 integration
✅ Visual Design: Enhanced with premium styling from dungeonhack
✅ Testing: All contract tests passing (118 tests total)
⏳ Pending: Testing, optimization, mainnet deployment, hackathon submission

**DEPLOYED CONTRACTS (Base Sepolia):**
- AventurerNFT: 0xBD61aAEb1c8705889a25054cCcA61D2c06e1b25A
- FeeDistributor: 0x221de7B5A230a9d19B11a30d797e7cBdD2b4a880
- ProgressTracker: 0x9e26a0F842D963F29E5541745fb93b8F0BCB6919
- RewardsPool: 0x0a9767856c51A28176d90f840B8D3903B7cCfd02
- DungeonGame: 0xe601c341270404422f16829869d0a3AA296E5227

**KEY DOCUMENTATION:**
1. `PROJECT_PLAN.md` - Complete development roadmap and architecture
2. `PROJECT_STATUS.md` - Current state and deployment details
3. `ai_logs/prompts.md` - All AI interactions and learnings
4. `ai_logs/iteration_history.md` - Development timeline
5. `docs/DEPLOYMENT.md` - Deployment guide (Spanish)
6. `README.md` - Project overview and quick start

**TECH STACK:**
- Smart Contracts: Solidity 0.8.28, Hardhat, OpenZeppelin v5.0.0
- Frontend: Next.js 14, React 18, TypeScript, TailwindCSS
- Web3: Wagmi v2, Viem v2, RainbowKit, Zustand
- Blockchain: Base Sepolia (testnet), Base Mainnet (production target)

**GAME MECHANICS:**
- Free NFT minting with randomized stats (ATK: 1-2, DEF: 1-2, HP: 4-6)
- Entry fee: 0.001 ETH per run
- 4 cards per room: Monster (45%), Treasure (30%), Trap (15%), Potion (10%)
- Weekly prizes: Top 10 share 70% of fees (30%, 20%, 15%... distribution)
- 6 rooms per run with increasing difficulty

**VISUAL DESIGN SYSTEM:**
- Color Scheme: Amber/Gold (#fbbf24), Purple (#6b46c1), Dark (#1a1625)
- Premium Components: royal-board, dot-matrix, stat-box
- Animations: shine, flip-3d, shake, glow-red, bubble, particle-burst, energy-pulse, hover-float
- Theme: Dark fantasy dungeon with gold accents

**HACKATHON REQUIREMENTS (Seedify Vibe Coins):**
- Blockchain: Base (Ethereum L2)
- Theme: Gaming/Entertainment
- Submission: Video demo, GitHub repo, live deployment
- Deadline: [Check hackathon page]
- Categories: Best Overall, Most Innovative, Best UX

**WHAT I NEED HELP WITH:**
[Specify your area: testing, optimization, features, deployment, documentation, etc.]

**IMPORTANT FILES TO READ FIRST:**
1. Read `PROJECT_PLAN.md` for overall architecture
2. Read `PROJECT_STATUS.md` for current state
3. Check `ai_logs/prompts.md` for development context
4. Review deployed contracts on BaseScan

**DEVELOPMENT COMMANDS:**
```bash
# Smart Contracts
cd A:\GitHub\dungeonflip
npm install
npx hardhat compile
npx hardhat test

# Frontend
cd frontend
npm install
npm run dev          # Development server (localhost:3000)
npm run build        # Production build

# Deployment
npx hardhat run scripts/deploy.ts --network baseSepolia
```

**QUESTIONS TO ASK:**
- Where are we in the development timeline?
- What tasks are pending from PROJECT_PLAN.md?
- Any known bugs or issues?
- What's the priority for the next sprint?

Please help me understand the current state and guide me on what to work on next. I've read the documentation and I'm ready to contribute!

---

**END OF ONBOARDING PROMPT**

**Usage Instructions for Team:**
1. Copy the entire "DUNGEONFLIP PROJECT ONBOARDING PROMPT" section above
2. Paste it into a new chat session with your AI assistant (Claude, ChatGPT, Copilot, etc.)
3. Add your specific question or task at the end
4. The AI will have full context to help you effectively

**Total Prompts Documented:** 7 (6 detailed + 1 template + 1 onboarding)  
**Last Updated:** December 4, 2025  
**Status:** ✅ Frontend Complete with Enhanced Visuals - Ready for Testing & Deployment
