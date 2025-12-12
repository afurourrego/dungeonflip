import { usePublicClient, useReadContract } from 'wagmi';
import { useEffect, useState } from 'react';
import { CONTRACTS } from '@/lib/constants';
import ProgressTrackerABI from '@/lib/contracts/ProgressTracker.json';
import RewardsPoolABI from '@/lib/contracts/RewardsPool.json';
import DungeonGameABI from '@/lib/contracts/DungeonGame.json';

/**
 * Hook to fetch weekly runs count and week info
 * Fetches from ProgressTracker and RewardsPool contracts
 */
export function useWeeklyRuns() {
  const publicClient = usePublicClient();
  const [weeklyRuns, setWeeklyRuns] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Get current week from ProgressTracker contract
  const { data: currentWeek } = useReadContract({
    address: CONTRACTS.PROGRESS_TRACKER,
    abi: ProgressTrackerABI.abi,
    functionName: 'currentWeek',
  });

  // Get time until next week from RewardsPool contract
  const { data: timeUntilNextWeek } = useReadContract({
    address: CONTRACTS.REWARDS_POOL,
    abi: RewardsPoolABI.abi,
    functionName: 'timeUntilNextWeek',
  });

  useEffect(() => {
    if (!publicClient || !currentWeek) return;

    const fetchWeeklyRuns = async () => {
      setIsLoading(true);
      try {
        // Get logs from last 10000 blocks (approximately last day on Base)
        const currentBlock = await publicClient.getBlockNumber();
        const windowSize = BigInt(10000);
        const fromBlock = currentBlock > windowSize ? currentBlock - windowSize : BigInt(0);

        // Find RunStarted event ABI
        const runStartedEvent = DungeonGameABI.abi.find(
          (entry: any) => entry.type === 'event' && entry.name === 'RunStarted'
        ) as any;

        if (!runStartedEvent) {
          console.warn('RunStarted event not found in ABI');
          setWeeklyRuns(0);
          setIsLoading(false);
          return;
        }

        // Fetch all RunStarted events from recent blocks
        const eventLogs = await publicClient.getLogs({
          address: CONTRACTS.DUNGEON_GAME,
          event: runStartedEvent,
          fromBlock,
          toBlock: 'latest',
        });

        // Count all runs (approximation of weekly runs from recent blocks)
        setWeeklyRuns(eventLogs.length);
      } catch (error) {
        console.error('Error fetching weekly runs:', error);
        setWeeklyRuns(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeeklyRuns();

    // Refresh every 30 seconds
    const interval = setInterval(fetchWeeklyRuns, 30000);

    return () => clearInterval(interval);
  }, [publicClient, currentWeek]);

  return {
    weeklyRuns,
    currentWeek: currentWeek ? Number(currentWeek) : 1,
    timeUntilNextWeek: timeUntilNextWeek ? Number(timeUntilNextWeek) : 0,
    isLoading,
  };
}
