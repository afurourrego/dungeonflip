# DungeonFlip Frontend

Next.js 16 frontend for the DungeonFlip Web3 dungeon crawler game.

## Tech Stack

- **Framework:** Next.js 16 (React 19, App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Web3:** Wagmi v3 + Viem v2
- **Wallet:** RainbowKit 2.x (MetaMask, Coinbase Wallet)
- **State:** React hooks + Zustand

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── game/page.tsx      # Main game interface
│   ├── mint/page.tsx      # NFT minting page
│   ├── leaderboard/page.tsx # Leaderboard display
│   └── nfts/page.tsx      # User NFT gallery
├── components/             # React components
│   ├── Web3Provider.tsx   # Wagmi + RainbowKit setup
│   ├── AdventureLog.tsx   # Game event log display
│   └── ResumeGameDialog.tsx # Resume paused game modal
├── hooks/                  # Custom React hooks
│   ├── useGame.ts         # Game state and actions
│   ├── useNFT.ts          # NFT ownership detection
│   ├── useLeaderboard.ts  # Leaderboard data
│   └── useAdventureLog.ts # Event log fetching
├── lib/                    # Utilities and constants
│   ├── constants.ts       # Contract addresses
│   ├── wagmi.ts           # Wagmi configuration
│   └── contracts/         # Contract ABIs
└── public/                 # Static assets
    ├── audio/             # Sound effects
    ├── avatars/           # Character images
    ├── cards/             # Card artwork
    └── background/        # UI backgrounds
```

## Environment Variables

Create a `.env.local` file:

```bash
# Optional: Override default RPC
NEXT_PUBLIC_ALCHEMY_API_KEY=your_key
```

## Contract Addresses (Base Sepolia)

The frontend connects to these contracts (configured in `lib/constants.ts`):

| Contract | Address |
| --- | --- |
| AventurerNFT | `0x23327A831E559549d7584218078538c547a10E67` |
| DungeonGame | `0x9E4cD14a37959b6852951fcfbf495d838e9e36A8` |
| FeeDistributor | `0xAa26dBcd21D32af565Fb336031171F4967fB3ca4` |
| ProgressTracker | `0x7cA2D8Ab12fB9116Dd5c31bb80e40544c6375E7E` |
| RewardsPool | `0x5e7268E1Bc3419b3Dd5252673275FfE7AF51dDbb` |

## Pages

- **/** - Landing page with game overview and CTAs
- **/mint** - Free NFT minting (gas only)
- **/game** - Main gameplay interface with card selection
- **/leaderboard** - Weekly rankings and prize pool info
- **/nfts** - View owned adventurer NFTs

## Development Notes

- Uses custodial NFT pattern: NFT transfers to DungeonGame contract during gameplay
- `activeTokenByWallet` mapping provides instant O(1) lookup for deposited NFTs
- Contract events (`RunStarted`, `CardResolved`, etc.) drive the Adventure Log
- Refetch intervals keep UI in sync with on-chain state

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh)
- [RainbowKit Documentation](https://rainbowkit.com/docs)
- [Base Network](https://docs.base.org)
