// Game constants
export const GAME_CONFIG = {
  ENTRY_FEE: '0.00001', // ETH
  GAME_COOLDOWN: 30, // seconds
  MIN_ADVANCE_INTERVAL: 6 * 24 * 60 * 60, // 6 days in seconds
} as const;

// Card types
export const CARD_TYPES = {
  MONSTER: 0,
  TREASURE: 1,
  TRAP: 2,
  POTION: 3,
} as const;

// Card distribution probabilities (must sum to 100)
export const CARD_PROBABILITIES = {
  MONSTER: 45,
  TREASURE: 30,
  TRAP: 15,
  POTION: 10,
} as const;

// Stat ranges for NFTs
export const STAT_RANGES = {
  ATK: { min: 1, max: 2 },
  DEF: { min: 1, max: 2 },
  HP: { min: 4, max: 6 },
} as const;

// Combat constants
export const COMBAT = {
  HIT_CHANCE: 0.8, // 80%
} as const;

// Fee distribution percentages
export const FEE_DISTRIBUTION = {
  REWARDS_POOL: 70,
  DEV_TREASURY: 20,
  MARKETING: 10,
} as const;

// Prize distribution for top 10 (percentages)
export const PRIZE_DISTRIBUTION = [30, 20, 15, 10, 8, 6, 4, 3, 2, 2] as const;

// Network config
export const NETWORKS = {
  BASE_SEPOLIA: {
    id: 84532,
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
  },
  BASE_MAINNET: {
    id: 8453,
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
  },
} as const;

// Current network (change to BASE_MAINNET for production)
export const CURRENT_NETWORK = NETWORKS.BASE_SEPOLIA;

// Contract addresses (env-overridable).
// After redeploy, set the `NEXT_PUBLIC_*_ADDRESS(_SEPOLIA)` vars and restart the frontend.
const envAddress = (value: string | undefined, fallback: `0x${string}`) =>
  (value && value.startsWith('0x') ? (value as `0x${string}`) : fallback);

const isSepolia = CURRENT_NETWORK.id === NETWORKS.BASE_SEPOLIA.id;

export const CONTRACTS = {
  AVENTURER_NFT: envAddress(
    isSepolia ? process.env.NEXT_PUBLIC_AVENTURER_NFT_ADDRESS_SEPOLIA : process.env.NEXT_PUBLIC_AVENTURER_NFT_ADDRESS,
    '0x07753598E13Bce7388bD66F1016155684cc3293B'
  ),
  FEE_DISTRIBUTOR: envAddress(
    isSepolia ? process.env.NEXT_PUBLIC_FEE_DISTRIBUTOR_ADDRESS_SEPOLIA : process.env.NEXT_PUBLIC_FEE_DISTRIBUTOR_ADDRESS,
    '0xD00c128486dE1C13074769922BEBe735F378A290'
  ),
  PROGRESS_TRACKER: envAddress(
    isSepolia ? process.env.NEXT_PUBLIC_PROGRESS_TRACKER_ADDRESS_SEPOLIA : process.env.NEXT_PUBLIC_PROGRESS_TRACKER_ADDRESS,
    '0x623435ECC6b3B418d79EE396298aF59710632595'
  ),
  REWARDS_POOL: envAddress(
    isSepolia ? process.env.NEXT_PUBLIC_REWARDS_POOL_ADDRESS_SEPOLIA : process.env.NEXT_PUBLIC_REWARDS_POOL_ADDRESS,
    '0x9A19912DDb7e71b4dccC9036f9395D88979A4F17'
  ),
  DUNGEON_GAME: envAddress(
    isSepolia ? process.env.NEXT_PUBLIC_DUNGEON_GAME_ADDRESS_SEPOLIA : process.env.NEXT_PUBLIC_DUNGEON_GAME_ADDRESS,
    '0x066d926eA2b3Fd48BC44e0eE8b5EA14474c40746'
  ),
} as const;

// Common burn destinations
export const BURN_ADDRESSES = {
  BASE_SEPOLIA: '0x000000000000000000000000000000000000dEaD' as `0x${string}`,
  BASE_MAINNET: '0x000000000000000000000000000000000000dEaD' as `0x${string}`,
} as const;
