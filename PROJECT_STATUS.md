## 📊 DungeonFlip – Project Status Report

**Date:** December 7, 2025  
**Scope:** Custodial DungeonGame build (Base Sepolia)  
**Latest Update:** Contracts redeployed with `activeTokenByWallet` mapping for instant NFT lookup

---

## ✅ Smart-Contract Status

### Base Sepolia Deployments

| Contract | Address | Status |
| --- | --- | --- |
| AventurerNFT | `0x23327A831E559549d7584218078538c547a10E67` | ✅ Deployed & verified |
| FeeDistributor | `0xAa26dBcd21D32af565Fb336031171F4967fB3ca4` | ✅ Deployed & verified |
| ProgressTracker | `0x7cA2D8Ab12fB9116Dd5c31bb80e40544c6375E7E` | ✅ Deployed & verified |
| RewardsPool | `0x5e7268E1Bc3419b3Dd5252673275FfE7AF51dDbb` | ✅ Deployed & verified |
| DungeonGame | `0x9E4cD14a37959b6852951fcfbf495d838e9e36A8` | ✅ Deployed & verified |

**Config snapshot**
- `ENTRY_FEE`: 0.00001 ETH
- `GAME_COOLDOWN`: 30 seconds
- Custody: NFT must stay in DungeonGame while the run is active
- Fee split: 70% rewards / 20% dev treasury / 10% marketing

**Testing summary**
- Hardhat unit tests: 201 (100% passing)
- Coverage: Critical contracts fully covered (AventurerNFT, DungeonGame, FeeDistributor, ProgressTracker, RewardsPool)
- Node requirement: v20.18.1 LTS (Hardhat crashes on newer releases)

---

## ✅ Frontend Status

- Framework: Next.js 16.0.7 (React 19) with webpack
- Web3 stack: wagmi 3.1.0 + viem 2.41.2 + RainbowKit 2.2.9
- Build status: `npm run build` succeeds (warnings only for dual lockfiles)
- Dev server: `npm run dev -- --hostname 0.0.0.0 --port 3000` (default http://localhost:3000)

| Page | Route | Status | Notes |
| --- | --- | --- | --- |
| Landing | `/` | ✅ | Promo copy + CTAs |
| Mint | `/mint` | ✅ | Free Aventurer minting wired to new contract |
| Game | `/game` | ✅ | Uses custodial flow (`useRunState`, card actions on-chain) |
| Leaderboard | `/leaderboard` | ✅ | Reads ProgressTracker stats |

Recent fixes:
1. Wagmi `useWatchContractEvent` updated to new API (`onLogs`)
2. Adventure log hook rewritten to fetch `CardResolved`, `RunStarted`, etc.
3. Resume dialog decoupled from removed Zustand store
4. BigInt literals replaced with `BigInt()` helpers to satisfy TS target
5. Build now enforces webpack mode to avoid Turbopack warnings

---

## 🔧 Known Issues / Technical Debt

1. **Dual package-lock files** – Next.js issues a warning because both the root and `frontend/` keep independent lockfiles. Functionally harmless but noisy; consider moving to pnpm workspaces or a single lockfile.
2. **Optional wagmi dependency warning** – `porto/internal` is optional; webpack logs a warning but runtime is unaffected.
3. **Token scan utility** – `useNFTOwnerTokens` still brute-forces the first few token IDs. Adequate for QA but needs either ERC721Enumerable or an indexer before launch.

---

## 🧪 Pending QA Checklist

- [x] Mint at least two NFTs per wallet using the new AventurerNFT
- [x] Enter a dungeon run (fresh deposit) and verify entry-fee routing via FeeDistributor balances
- [x] Execute multiple `chooseCard` actions and confirm `CardResolved` events update the UI
- [ ] Pause a run to withdraw the NFT, then resume (no entry fee) and finish the dungeon
- [ ] Trigger a death scenario and use `claimAfterDeath` to recover the NFT
- [ ] Exit a victorious run and confirm ProgressTracker score increases + leaderboard refreshes
- [ ] Validate RewardsPool can withdraw funds from FeeDistributor (dry-run distribution with mock addresses)

---

## 📚 Documentation State

- `README.md` – ✅ Updated (Node 20 requirement, live addresses)
- `docs/DEPLOYMENT.md` – ✅ English + reflects Dec 5 redeploy
- `PROJECT_PLAN.md` – ✅ Original roadmap (kept for history)
- `PROJECT_STATUS.md` – ✅ This file
- `ai_logs/` – ✅ Includes prompts, iterations, tools, and challenges

---

## 🔗 Reference Links

- Base Sepolia Explorer: https://sepolia.basescan.org/
- Bridge to Base Sepolia: https://bridge.base.org/
- Verified contracts:
   - AventurerNFT – https://sepolia.basescan.org/address/0x23327A831E559549d7584218078538c547a10E67#code
   - FeeDistributor – https://sepolia.basescan.org/address/0xAa26dBcd21D32af565Fb336031171F4967fB3ca4#code
   - ProgressTracker – https://sepolia.basescan.org/address/0x7cA2D8Ab12fB9116Dd5c31bb80e40544c6375E7E#code
   - RewardsPool – https://sepolia.basescan.org/address/0x5e7268E1Bc3419b3Dd5252673275FfE7AF51dDbb#code
   - DungeonGame – https://sepolia.basescan.org/address/0x9E4cD14a37959b6852951fcfbf495d838e9e36A8#code

---

## 📈 Development Metrics

- Solidity LOC: ~1,500
- TypeScript LOC (frontend): ~2,100
- TypeScript LOC (tests): ~1,200
- Hardhat tests: 201
- Frontend build: 7–9s on Windows 11 / Node 20.18.1
- AI tooling: GitHub Copilot + Cursor/Claude for architecture + docs

---

## ✅ Readiness Summary

DungeonFlip is feature-complete on Base Sepolia with verified contracts, refreshed ABIs, and a custodial game loop that enforces on-chain randomness + NFT custody. Remaining work is QA (multi-wallet testing, stress runs) and optional polish (indexer, UI enhancements) before considering a Base mainnet launch.
