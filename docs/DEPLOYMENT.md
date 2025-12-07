# Deployment Guide – Base Sepolia Testnet

This guide explains how to deploy, verify, and smoke-test DungeonFlip on Base Sepolia. When you are ready for Base mainnet, repeat the same process with the `base` network flag.

---

## 1. Prerequisites

### Toolchain
- **Node.js 20 LTS** (Hardhat is unstable on Node 22+)
- npm 10+
- Git and a modern shell (PowerShell, bash, zsh)

Verify your Node version:

```bash
node -v   # should print v20.x.x
```

### Environment variables
Create `.env` in the repository root (copy from `.env.example`) and populate:

```bash
PRIVATE_KEY=your_private_key_without_0x
BASESCAN_API_KEY=your_basescan_api_key
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_MAINNET_RPC_URL=https://mainnet.base.org
```

### Testnet ETH
1. Request Ethereum Sepolia ETH from a faucet (Alchemy, Infura, QuickNode).
2. Bridge to Base Sepolia via https://bridge.base.org/ (Sepolia → Base Sepolia). ~0.02–0.05 ETH covers deployment + QA.

---

## 2. Build & Test

```bash
npm install          # run once
npm run compile      # hardhat compile
npm test             # optional but recommended
```

---

## 3. Deploy to Base Sepolia

```bash
npm run deploy:sepolia
# wraps: hardhat run scripts/deploy.ts --network baseSepolia
```

The script deploys: AventurerNFT → FeeDistributor → ProgressTracker → RewardsPool → DungeonGame, then wires their addresses together.

**Latest canonical deployment (Dec 7, 2025):**

```
AVENTURER_NFT_ADDRESS=0x23327A831E559549d7584218078538c547a10E67
FEE_DISTRIBUTOR_ADDRESS=0xAa26dBcd21D32af565Fb336031171F4967fB3ca4
PROGRESS_TRACKER_ADDRESS=0x7cA2D8Ab12fB9116Dd5c31bb80e40544c6375E7E
REWARDS_POOL_ADDRESS=0x5e7268E1Bc3419b3Dd5252673275FfE7AF51dDbb
DUNGEON_GAME_ADDRESS=0x9E4cD14a37959b6852951fcfbf495d838e9e36A8
```

Update `frontend/lib/constants.ts` plus `.env`/`.env.example` whenever these change.

---

## 4. Verify on BaseScan

```bash
npx hardhat verify --network baseSepolia 0x23327A831E559549d7584218078538c547a10E67
npx hardhat verify --network baseSepolia 0xAa26dBcd21D32af565Fb336031171F4967fB3ca4
npx hardhat verify --network baseSepolia 0x7cA2D8Ab12fB9116Dd5c31bb80e40544c6375E7E
npx hardhat verify --network baseSepolia 0x5e7268E1Bc3419b3Dd5252673275FfE7AF51dDbb

npx hardhat verify --network baseSepolia \
  0x9E4cD14a37959b6852951fcfbf495d838e9e36A8 \
  0x23327A831E559549d7584218078538c547a10E67 \
  0xAa26dBcd21D32af565Fb336031171F4967fB3ca4 \
  0x7cA2D8Ab12fB9116Dd5c31bb80e40544c6375E7E \
  0x5e7268E1Bc3419b3Dd5252673275FfE7AF51dDbb
```

If Hardhat reports "already verified" the explorer URL is still printed and you can move on.

---

## 5. Smoke Test the Deployment

```bash
npx hardhat console --network baseSepolia
```

```javascript
const nft = await ethers.getContractAt("AventurerNFT", "0x23327A831E559549d7584218078538c547a10E67");
const game = await ethers.getContractAt("DungeonGame", "0x9E4cD14a37959b6852951fcfbf495d838e9e36A8");

await nft.mintAventurer();
const tokenId = await nft.totalSupply();
await game.enterDungeon(tokenId, { value: ethers.parseEther("0.00001") });
await game.chooseCard(tokenId, 0);
await game.exitDungeon(tokenId);
```

Confirm on https://sepolia.basescan.org/ that `RunStarted`, `CardResolved`, and `RunExited` events fired, and that the NFT transferred into/out of `DungeonGame` as expected.

---

## 6. Troubleshooting

| Issue | Resolution |
| --- | --- |
| `insufficient funds` | Bridge more ETH to Base Sepolia (https://bridge.base.org/). |
| `already verified` | Safe to ignore; the contract is already published. |
| `nonce too high` | Wait for pending txs or run `npx hardhat clean` before redeploying. |
| `replacement transaction underpriced` | Increase the gas price or wait for the pending tx to confirm. |
| Hardhat libuv assertion | Ensure `node -v` reports 20.x.x and reinstall dependencies. |

---

## 7. Promoting to Base Mainnet

1. Fund the deployer wallet with Base mainnet ETH.
2. Update `.env` with a mainnet RPC URL.
3. Run `npx hardhat run scripts/deploy.ts --network base`.
4. Re-run the verification commands with `--network base`.
5. Update frontend constants and redeploy the UI.

---

## 8. Reference Links

- Base docs – https://docs.base.org/
- Base bridge – https://bridge.base.org/
- Base Sepolia explorer – https://sepolia.basescan.org/
- Hardhat docs – https://hardhat.org/docs

Need help? Inspect the Hardhat output, double-check `.env`, and make sure the wallet holds enough ETH for gas.
