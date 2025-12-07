// Contract addresses on Base Sepolia (Redeployed Dec 6, 2025 with resume fix)
// Sync this file whenever scripts/deploy.ts runs successfully
export const CONTRACTS = {
  AVENTURER_NFT: '0x869316eE5E2df6EC73d6bC63fdA59Cce9643336d' as `0x${string}`,
  FEE_DISTRIBUTOR: '0x6F45110Ee06b35Aca2Eb7b8b62843709afEFDCb6' as `0x${string}`,
  PROGRESS_TRACKER: '0x5B1807BEbD8a2FcD497fa9159437D84D1F35eA37' as `0x${string}`,
  REWARDS_POOL: '0x4d6bdD23F6F903BFBE5f6e95373EDE11fe7B0689' as `0x${string}`,
  DUNGEON_GAME: '0x7b564B6c67b1e87fB098176aca82d2e243C1c016' as `0x${string}`,
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

// Common burn destinations
export const BURN_ADDRESSES = {
  BASE_SEPOLIA: '0x000000000000000000000000000000000000dEaD' as `0x${string}`,
  BASE_MAINNET: '0x000000000000000000000000000000000000dEaD' as `0x${string}`,
} as const;
