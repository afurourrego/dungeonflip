import { useReadContract, usePublicClient } from 'wagmi';
import { useEffect, useState } from 'react';
import { CONTRACTS } from '@/lib/constants';
import ProgressTrackerABI from '@/lib/contracts/ProgressTracker.json';

export interface PlayerProgress {
  totalScore: bigint;
  weeklyScore: bigint;
  gamesPlayed: bigint;
  lastPlayedWeek: bigint;
  isActive: boolean;
}

export interface LeaderboardEntry {
  player: `0x${string}`;
  score: bigint;
}

/**
 * Get player progress from ProgressTracker contract
 */
export function usePlayerProgress(address?: `0x${string}`) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACTS.PROGRESS_TRACKER,
    abi: ProgressTrackerABI.abi,
    functionName: 'getPlayerProgress',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Transform the data to match our interface
  const playerProgress = data ? {
    totalScore: (data as any)[0] as bigint,
    weeklyScore: (data as any)[1] as bigint,
    gamesPlayed: (data as any)[2] as bigint,
    lastPlayedWeek: (data as any)[3] as bigint,
    isActive: (data as any)[4] as boolean,
  } : undefined;

  return { data: playerProgress, isLoading, error };
}

/**
 * Get top players for current week
 * Note: This requires calling from RewardsPool contract, not ProgressTracker
 */
export function useTopPlayers() {
  const publicClient = usePublicClient();
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get current week first
  const { data: currentWeek } = useReadContract({
    address: CONTRACTS.PROGRESS_TRACKER,
    abi: ProgressTrackerABI.abi,
    functionName: 'currentWeek',
  });

  useEffect(() => {
    if (!publicClient || !currentWeek) return;

    const fetchTopPlayers = async () => {
      setIsLoading(true);
      try {
        // Get all active players for current week
        const players = await publicClient.readContract({
          address: CONTRACTS.PROGRESS_TRACKER,
          abi: ProgressTrackerABI.abi,
          functionName: 'getCurrentWeekPlayers',
        }) as `0x${string}`[];

        // Get progress for each player
        const playersWithScores = await Promise.all(
          players.map(async (player) => {
            const progress = await publicClient.readContract({
              address: CONTRACTS.PROGRESS_TRACKER,
              abi: ProgressTrackerABI.abi,
              functionName: 'getPlayerProgress',
              args: [player],
            }) as [bigint, bigint, bigint, bigint, boolean];

            return {
              player,
              score: progress[1], // weeklyScore is at index 1
            };
          })
        );

        // Sort by score descending and take top 10
        const sorted = playersWithScores
          .filter(p => p.score > BigInt(0))
          .sort((a, b) => Number(b.score - a.score))
          .slice(0, 10);

        setTopPlayers(sorted);
      } catch (error) {
        console.error('Error fetching top players:', error);
        setTopPlayers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopPlayers();
  }, [publicClient, currentWeek]);

  return { data: topPlayers, isLoading };
}

/**
 * Get player rank based on weekly score
 */
export function usePlayerRank(address?: `0x${string}`) {
  const { data: topPlayers } = useTopPlayers();
  const [rank, setRank] = useState<number | null>(null);

  useEffect(() => {
    if (!address || !topPlayers || topPlayers.length === 0) {
      setRank(null);
      return;
    }

    const playerIndex = topPlayers.findIndex(
      (entry) => entry.player.toLowerCase() === address.toLowerCase()
    );

    setRank(playerIndex >= 0 ? playerIndex + 1 : null);
  }, [address, topPlayers]);

  return { data: rank, isLoading: false };
}
