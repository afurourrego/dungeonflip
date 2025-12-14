# DungeonFlip - Compiled Prompts

Generated: 2025-12-13 23:31:48
Sources: `ai_logs/prompts.md`, `ai_logs/challenges.md`
Note: Only prompts that are written in this repo are included.

Total prompts: 20

## 1. Project Architecture Design for Base Blockchain
Date: 2025-12-04 | Tool: Claude (Cursor) | Source: ai_logs\challenges.md:32

```
I need to rebuild a game from OneChain (Move) to Base (Solidity). The game has:
- NFT adventurers with stats
- Entry fee system (0.00001 ETH)
- Fee distribution (70% rewards, 20% dev, 10% marketing)
- Weekly leaderboard with prizes
- Progress tracking

Design a smart contract architecture that's gas-efficient and secure.
```

## 2. Hackathon Submission Requirements Documentation
Date: 2025-12-04 | Tool: Claude (Cursor) + GitHub Copilot | Source: ai_logs\challenges.md:97

```
The hackathon requires:
- A dedicated folder (ai_logs/) documenting AI prompts, tools used, and iteration history
- Demo video (max 5 minutes)
- Project description (max 150 words)
- Team info (max 150 words)

Help me create templates for these documents.
```

## 3. TypeScript Type Casting with Ethers.js v6
Date: 2025-12-04 | Tool: GitHub Copilot | Source: ai_logs\challenges.md:155

```
// How to properly cast deployed contract to TypeChain type?
const AventurerNFT = await ethers.getContractFactory("AventurerNFT");
const nft = await AventurerNFT.deploy(); // Type: Contract, need: AventurerNFT
```

## 4. BigInt Arithmetic in Test Assertions
Date: 2025-12-04 | Tool: GitHub Copilot | Source: ai_logs\challenges.md:220

```
// This fails: const total = balance + gasUsed (both BigInt)
// How to do BigInt arithmetic in test assertions?
```

## 5. Test Design for Restrictive receive() Functions
Date: 2025-12-04 | Tool: GitHub Copilot (with 3 iterations) | Source: ai_logs\challenges.md:281

```
RewardsPool tests failing. receive() only accepts from feeDistributor.
How to build balance in RewardsPool for testing expected prizes and emergency withdrawal?
```

## 6. Project Planning and Architecture Design
Date: 2025-12-04 | Tool: Claude (Cursor) | Source: ai_logs\prompts.md:18

```
Necesito que leas y escanees este repositorio: https://github.com/afurourrego/dungeonhack

vamos a rehacer este proyecto para esta hackathon: [Seedify Vibe Coins details]

necesito que generes un plan de trabajo y una lista de tareas para que empieces a desarrollar la app paso a paso en un archivo .MD que puedas consultar tu y pueda compartirlo en otro hilo con otra IA y pueda conocer facilmente el proyecto.
```

## 7. Repository Structure Initialization
Date: 2025-12-04 | Tool: GitHub Copilot Chat | Source: ai_logs\prompts.md:51

```
Create initial repository structure for DungeonFlip project with:
- .gitignore for Hardhat and Next.js
- README.md with project overview
- Basic folder structure (contracts, scripts, test, ai_logs, docs)
```

## 8. AventurerNFT Contract Development
Date: 2025-12-04 | Tool: GitHub Copilot | Source: ai_logs\prompts.md:89

```
Create AventurerNFT.sol contract:
- ERC-721 implementation with OpenZeppelin
- Free minting function with randomized stats (ATK: 1-2, DEF: 1-2, HP: 4-6)
- Pausable functionality
- Owner-controlled base URI for metadata
- Event emission for stats generation
```

## 9. FeeDistributor Contract Development
Date: 2025-12-04 | Tool: GitHub Copilot | Source: ai_logs\prompts.md:125

```
Create FeeDistributor.sol contract:
- Receive entry fees from game contract
- Automatic 70/20/10 split to rewards/dev/marketing
- Withdrawal functions for each pool
- Only rewards pool contract can withdraw rewards
- Owner can withdraw dev/marketing
- Pausable functionality
```

## 10. RewardsPool Contract and Test Debugging
Date: 2025-12-04 | Tool: GitHub Copilot | Source: ai_logs\prompts.md:162

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

## 11. Testnet Deployment Setup
Date: 2025-12-04 | Tool: GitHub Copilot | Source: ai_logs\prompts.md:205

```
necesito que generes un plan de trabajo y una lista de tareas para que empieces a desarrollar la app paso a paso
Inicia a trabajar
Continua
como hacemos el deploy a la testnet
crea el archivo .env y dejalo listo para yo ingresar los datos
ya llene los datos en el .env porfavor continua con el deploy
```

## 12. Complete Frontend Implementation
Date: 2025-12-04 | Tool: GitHub Copilot + Claude | Source: ai_logs\prompts.md:256

```
Desarrolla la frontend.
Necesitas actualizar el proyect_plan para el frontent?
```

## 13. Enhanced Visual Design Implementation
Date: 2025-12-04 | Tool: Claude (Cursor) | Source: ai_logs\prompts.md:369

```
Necesito que leas y escanees este repositorio: https://github.com/afurourrego/dungeonhack

Necesito que te enfoques en la parte estetica el css, los colores y todo lo demas, necesito que lo apliques a este proyecto
```

## 14. Border Color Issues - Purple and Bright Yellow
Date: 2025-12-12 | Tool: Claude Code | Source: ai_logs\prompts.md:536

```
por cierto, cuando el aventurero carda, aun tiene unos brdes amarillos laros feos, y en la card de tarjetas, las tarjetas tienen un contorno morado
```

## 15. Grey Stone Theme Experimentation
Date: 2025-12-12 | Tool: Claude Code | Source: ai_logs\prompts.md:566

```
sabes que, me gustaria que cambiaras los tonos a grises y negros como si fuera piedra, para elegir
```

## 16. Site-Wide Color Palette Application
Date: 2025-12-12 | Tool: Claude Code + Task agents (parallel execution) | Source: ai_logs\prompts.md:599

```
listo, actualiza toda la paleta de colores del resto de paginas dle sitio web, no olvides el header y cuando termines actualiza los ai_logs que hace mucho no lo haces
```

## 17. Color-Coded Adventure Log & Flickering Fixes
Date: 2025-12-12 | Tool: Claude Code | Source: ai_logs\prompts.md:645

```
[User reported error screenshot showing "Cannot access 'isChoosingCard' before initialization"]

User: "parpadea varias veces mientras sucede la animacion" (it flickers multiple times during the animation)

User: "pero sigues mostrando logs de run anteriores" (but you're still showing logs from previous runs)
```

## 18. Battle Log Fidelity (Avoid Client-Side Combat Reconstruction)
Date: 2025-12-14 | Tool: GitHub Copilot (VS Code) | Source: ai_logs\challenges.md:359

```
Make combat logs 100% real and faithful to on-chain combat.
Add enemy ATK range (1–3) with per-turn roll.
Damage = atkRoll - heroDef, only subtract HP if > 0.
Rename battle breakdown -> battle log.
Newest-first.
```

## 19. Authoritative On-Chain Battle Log (Combat Improvements)
Date: 2025-12-14 | Tool: GitHub Copilot (VS Code) | Source: ai_logs\prompts.md:687

```
Enemy ATK must be a range (1–3) with a per-turn roll.
Rename “Battle breakdown” → “Battle log”.
Log must show newest-first.
Logs must be 100% faithful to on-chain combat (no client reconstruction).
Damage rule: enemyDamage = atkRoll âˆ’ heroDef, and only subtract HP if result > 0.

Also: regenerate ABI, redeploy only DungeonGame on Base Sepolia, and point the frontend to the new address.
```

## 20. Cooldown UX + Monster DEF=0 + UI Unlock + Redeploy
Date: 2025-12-13 | Tool: GitHub Copilot (VS Code) | Source: ai_logs\prompts.md:758

```
After using “Exit victorious”, clicking “Enter the dungeon” creates a tx that later shows no changes.
BaseScan shows: fail with error “cooldown active”.

Requirements:
- Handle cooldown clearly in the UI (don’t send tx that will revert; show countdown).
- Sometimes after choosing a card, the tx is confirmed but the screen gets stuck until refresh.
- Make all enemies always have DEF = 0 (never higher at any moment).
- Redeploy only DungeonGame on Base Sepolia and point the frontend to the new address.
```


