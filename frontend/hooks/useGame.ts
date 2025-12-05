import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACTS, GAME_CONFIG } from '@/lib/constants';
import DungeonGameABI from '@/lib/contracts/DungeonGame.json';

export interface GameSession {
  tokenId: bigint;
  levelsCompleted: bigint;
  scoreEarned: bigint;
  timestamp: bigint;
  active: boolean;
  currentRoom: number;
  currentHP: number;
  gemsCollected: number;
  lastCheckpointTime: bigint;
  seed: bigint;
}

export function useGame() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const startGame = async (tokenId: bigint) => {
    try {
      await writeContract({
        address: CONTRACTS.DUNGEON_GAME,
        abi: DungeonGameABI.abi,
        functionName: 'startGame',
        args: [tokenId],
        value: parseEther(GAME_CONFIG.ENTRY_FEE),
      });
    } catch (err) {
      console.error('Error in startGame:', err);
      throw err;
    }
  };

  const completeGame = async () => {
    try {
      await writeContract({
        address: CONTRACTS.DUNGEON_GAME,
        abi: DungeonGameABI.abi,
        functionName: 'completeGame',
      });
    } catch (err) {
      console.error('Error in completeGame:', err);
      throw err;
    }
  };


  const updateCheckpoint = async (currentRoom: number, currentHP: number, gemsCollected: number) => {
    try {
      await writeContract({
        address: CONTRACTS.DUNGEON_GAME,
        abi: DungeonGameABI.abi,
        functionName: 'updateCheckpoint',
        args: [currentRoom, currentHP, gemsCollected],
      });
    } catch (err) {
      console.error('Error in updateCheckpoint:', err);
      throw err;
    }
  };

  const recordDeath = async (roomNumber: number, finalGemsCollected: number) => {
    try {
      await writeContract({
        address: CONTRACTS.DUNGEON_GAME,
        abi: DungeonGameABI.abi,
        functionName: 'recordDeath',
        args: [roomNumber, finalGemsCollected],
      });
    } catch (err) {
      console.error('Error in recordDeath:', err);
      throw err;
    }
  };

  const logRoomCompletion = async (roomNumber: number, cardType: number, hpRemaining: number, gemsCollected: number) => {
    try {
      await writeContract({
        address: CONTRACTS.DUNGEON_GAME,
        abi: DungeonGameABI.abi,
        functionName: 'logRoomCompletion',
        args: [roomNumber, cardType, hpRemaining, gemsCollected],
      });
    } catch (err) {
      console.error('Error in logRoomCompletion:', err);
      throw err;
    }
  };

  return {
    startGame,
    completeGame,
    updateCheckpoint,
    recordDeath,
    logRoomCompletion,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  };
}

export function useActiveSession(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACTS.DUNGEON_GAME,
    abi: DungeonGameABI.abi,
    functionName: 'activeSessions',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  }) as { data: GameSession | undefined; isLoading: boolean; error: Error | null };
}

export function useLastPlayTime(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACTS.DUNGEON_GAME,
    abi: DungeonGameABI.abi,
    functionName: 'lastPlayTime',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useCurrentWeek() {
  return useReadContract({
    address: CONTRACTS.DUNGEON_GAME,
    abi: DungeonGameABI.abi,
    functionName: 'currentWeek',
  });
}

export function usePlayerSession(address?: `0x${string}`) {
  const result = useReadContract({
    address: CONTRACTS.DUNGEON_GAME,
    abi: DungeonGameABI.abi,
    functionName: 'getPlayerSession',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 10000, // Cache for 10 seconds
      refetchInterval: 15000, // Refetch every 15 seconds to detect changes
    },
  });

  // Transform the array result into a typed GameSession object
  const data = result.data as [bigint, bigint, bigint, bigint, boolean, number, number, number, bigint, bigint] | undefined;

  const session: GameSession | undefined = data ? {
    tokenId: data[0],
    levelsCompleted: data[1],
    scoreEarned: data[2],
    timestamp: data[3],
    active: data[4],
    currentRoom: data[5],
    currentHP: data[6],
    gemsCollected: data[7],
    lastCheckpointTime: data[8],
    seed: data[9],
  } : undefined;

  return {
    ...result,
    data: session,
  };
}

export function useCanStartGame(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACTS.DUNGEON_GAME,
    abi: DungeonGameABI.abi,
    functionName: 'canStartGame',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 5000, // Cache for 5 seconds
    },
  });
}

export function useEntryFee() {
  return useReadContract({
    address: CONTRACTS.DUNGEON_GAME,
    abi: DungeonGameABI.abi,
    functionName: 'ENTRY_FEE',
    query: {
      staleTime: Infinity, // Never refetch (constant value)
    },
  });
}

export function useGameCooldown() {
  return useReadContract({
    address: CONTRACTS.DUNGEON_GAME,
    abi: DungeonGameABI.abi,
    functionName: 'GAME_COOLDOWN',
    query: {
      staleTime: Infinity, // Never refetch (constant value)
    },
  });
}
