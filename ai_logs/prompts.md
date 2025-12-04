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

**Total Prompts Documented:** 6 (5 detailed + 1 template)  
**Last Updated:** December 4, 2025  
**Status:** ✅ Frontend Complete - Ready for Testing & Deployment
