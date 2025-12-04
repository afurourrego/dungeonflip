// Contract addresses on Base Sepolia (Deployed Dec 4, 2025 with ENTRY_FEE 0.00001 ETH)
export const CONTRACTS = {
  AVENTURER_NFT: '0x0c2E1ab7187F1Eb04628cFfb32ae55757C568cbb' as `0x${string}`,
  FEE_DISTRIBUTOR: '0xc11256E2889E162456adCFA97bB0D18e094DFCf9' as `0x${string}`,
  PROGRESS_TRACKER: '0x6e637BfB86217F30Bf95D8aD11dB9a63985b3bbE' as `0x${string}`,
  REWARDS_POOL: '0x4C7Fe76e2C62b1cC4d98306C44258D309b7c1492' as `0x${string}`,
  DUNGEON_GAME: '0xb4AD3C00FB9f77bf6c18CF6765Fe6F95d84f3042' as `0x${string}`,
} as const;

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
  MAX_ROOMS: 10, // Maximum rooms per run
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
