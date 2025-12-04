import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACTS, GAME_CONFIG } from '@/lib/constants';
import DungeonGameABI from '@/lib/contracts/DungeonGame.json';

export interface GameSession {
  player: `0x${string}`;
  tokenId: bigint;
  startTime: bigint;
  isActive: boolean;
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

  return {
    startGame,
    completeGame,
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
  return useReadContract({
    address: CONTRACTS.DUNGEON_GAME,
    abi: DungeonGameABI.abi,
    functionName: 'playerSessions',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useCanStartGame(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACTS.DUNGEON_GAME,
    abi: DungeonGameABI.abi,
    functionName: 'canStartGame',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useEntryFee() {
  return useReadContract({
    address: CONTRACTS.DUNGEON_GAME,
    abi: DungeonGameABI.abi,
    functionName: 'ENTRY_FEE',
  });
}

export function useGameCooldown() {
  return useReadContract({
    address: CONTRACTS.DUNGEON_GAME,
    abi: DungeonGameABI.abi,
    functionName: 'ENTRY_FEE',
  });
}
