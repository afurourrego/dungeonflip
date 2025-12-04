import { useReadContract } from 'wagmi';
import { CONTRACTS } from '@/lib/constants';
import ProgressTrackerABI from '@/lib/contracts/ProgressTracker.json';

export interface PlayerProgress {
  totalScore: bigint;
  weeklyScore: bigint;
  gamesPlayed: bigint;
  lastPlayedWeek: bigint;
}

export interface LeaderboardEntry {
  player: `0x${string}`;
  score: bigint;
}

export function usePlayerProgress(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACTS.PROGRESS_TRACKER,
    abi: ProgressTrackerABI.abi,
    functionName: 'getPlayerProgress',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  }) as { data: PlayerProgress | undefined; isLoading: boolean; error: Error | null };
}

export function useTopPlayers(count: bigint = BigInt(10)) {
  return useReadContract({
    address: CONTRACTS.PROGRESS_TRACKER,
    abi: ProgressTrackerABI.abi,
    functionName: 'getTopPlayers',
    args: [count],
  }) as { data: LeaderboardEntry[] | undefined; isLoading: boolean; error: Error | null };
}

export function usePlayerRank(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACTS.PROGRESS_TRACKER,
    abi: ProgressTrackerABI.abi,
    functionName: 'getPlayerRank',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}
