import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACTS, GAME_CONFIG } from '@/lib/constants';
import DungeonGameABI from '@/lib/contracts/DungeonGame.json';

const ABI = DungeonGameABI.abi;
const DEFAULT_GAS_LIMIT = BigInt(350_000);

export enum RunStatus {
  Idle = 0,
  Active = 1,
  Paused = 2,
  Dead = 3,
  Completed = 4,
}

export interface RunState {
  owner: `0x${string}`;
  status: RunStatus;
  nftDeposited: boolean;
  currentRoom: number;
  currentHP: number;
  maxHP: number;
  atk: number;
  def: number;
  gems: number;
  lastSeed: bigint;
  lastAction: bigint;
}

const defaultState: RunState = {
  owner: '0x0000000000000000000000000000000000000000',
  status: RunStatus.Idle,
  nftDeposited: false,
  currentRoom: 0,
  currentHP: 0,
  maxHP: 0,
  atk: 0,
  def: 0,
  gems: 0,
  lastSeed: BigInt(0),
  lastAction: BigInt(0),
};

const safeNumber = (value?: bigint | number) => {
  if (typeof value === 'bigint') return Number(value);
  if (typeof value === 'number') return value;
  return 0;
};

export function useRunState(tokenId?: bigint) {
  const result = useReadContract({
    address: CONTRACTS.DUNGEON_GAME,
    abi: ABI,
    functionName: 'tokenRuns',
    args: tokenId ? [tokenId] : undefined,
    query: {
      enabled: tokenId !== undefined,
      refetchInterval: 3000, // Faster refresh
      staleTime: 2000,
    },
  });

  // Contract returns an array, not an object with named properties
  // Order: [lastKnownOwner, status, nftDeposited, currentRoom, currentHP, maxHP, atk, def, gems, lastSeed, lastAction]
  const rawArray = result.data as undefined | readonly [
    `0x${string}`,  // [0] lastKnownOwner
    number,         // [1] status
    boolean,        // [2] nftDeposited
    bigint,         // [3] currentRoom
    bigint,         // [4] currentHP
    bigint,         // [5] maxHP
    bigint,         // [6] atk
    bigint,         // [7] def
    bigint,         // [8] gems
    bigint,         // [9] lastSeed
    bigint,         // [10] lastAction
  ];

  const parsed: RunState | undefined = rawArray
    ? {
        owner: rawArray[0],
        status: Number(rawArray[1]) as RunStatus,
        nftDeposited: rawArray[2],
        currentRoom: safeNumber(rawArray[3]),
        currentHP: safeNumber(rawArray[4]),
        maxHP: safeNumber(rawArray[5]),
        atk: safeNumber(rawArray[6]),
        def: safeNumber(rawArray[7]),
        gems: safeNumber(rawArray[8]),
        lastSeed: rawArray[9],
        lastAction: rawArray[10],
      }
    : tokenId
    ? defaultState
    : undefined;

  return {
    ...result,
    data: parsed,
  };
}

export function useGameContract() {
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const enterDungeon = async (tokenId: bigint, { payEntryFee }: { payEntryFee: boolean }) => {
    return writeContractAsync({
      address: CONTRACTS.DUNGEON_GAME,
      abi: ABI,
      functionName: 'enterDungeon',
      args: [tokenId],
      value: payEntryFee ? parseEther(GAME_CONFIG.ENTRY_FEE) : BigInt(0),
      gas: DEFAULT_GAS_LIMIT,
    });
  };

  const chooseCard = async (tokenId: bigint, cardIndex: number) => {
    return writeContractAsync({
      address: CONTRACTS.DUNGEON_GAME,
      abi: ABI,
      functionName: 'chooseCard',
      args: [tokenId, cardIndex],
    });
  };

  const exitDungeon = async (tokenId: bigint) => {
    return writeContractAsync({
      address: CONTRACTS.DUNGEON_GAME,
      abi: ABI,
      functionName: 'exitDungeon',
      args: [tokenId],
    });
  };

  const pauseRun = async (tokenId: bigint) => {
    return writeContractAsync({
      address: CONTRACTS.DUNGEON_GAME,
      abi: ABI,
      functionName: 'pauseRun',
      args: [tokenId],
    });
  };

  const claimAfterDeath = async (tokenId: bigint) => {
    return writeContractAsync({
      address: CONTRACTS.DUNGEON_GAME,
      abi: ABI,
      functionName: 'claimAfterDeath',
      args: [tokenId],
    });
  };

  const forceWithdraw = async (tokenId: bigint) => {
    return writeContractAsync({
      address: CONTRACTS.DUNGEON_GAME,
      abi: ABI,
      functionName: 'forceWithdraw',
      args: [tokenId],
    });
  };

  return {
    enterDungeon,
    chooseCard,
    exitDungeon,
    pauseRun,
    claimAfterDeath,
    forceWithdraw,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  };
}

export function useEntryFee() {
  return useReadContract({
    address: CONTRACTS.DUNGEON_GAME,
    abi: ABI,
    functionName: 'ENTRY_FEE',
    query: {
      staleTime: Infinity,
    },
  });
}

export function useLastEntryTime(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACTS.DUNGEON_GAME,
    abi: ABI,
    functionName: 'lastEntryTime',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
      refetchInterval: 10_000,
      staleTime: 5_000,
    },
  });
}
