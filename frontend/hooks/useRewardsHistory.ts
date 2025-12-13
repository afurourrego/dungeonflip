import { usePublicClient } from 'wagmi';
import { useEffect, useState } from 'react';
import { decodeEventLog } from 'viem';
import { CONTRACTS } from '@/lib/constants';
import RewardsPoolABI from '@/lib/contracts/RewardsPool.json';

export interface RewardDistribution {
  week: number;
  winners: string[];
  amounts: bigint[];
  totalDistributed: bigint;
  blockNumber: bigint;
  timestamp: number;
}

export interface PlayerReward {
  week: number;
  rank: number;
  amount: bigint;
  timestamp: number;
}

/**
 * Hook to fetch historical rewards distributions from RewardsPool contract
 */
export function useRewardsHistory() {
  const publicClient = usePublicClient();
  const [distributions, setDistributions] = useState<RewardDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicClient) return;

    const fetchRewardsHistory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Find RewardsDistributed event ABI
        const rewardsDistributedEvent = RewardsPoolABI.abi.find(
          (entry: any) => entry.type === 'event' && entry.name === 'RewardsDistributed'
        ) as any;

        if (!rewardsDistributedEvent) {
          console.warn('RewardsDistributed event not found in ABI');
          setDistributions([]);
          setIsLoading(false);
          return;
        }

        // Fetch all RewardsDistributed events from contract deployment
        // Use smaller block range to avoid RPC limits (10k blocks = ~5 hours on Base)
        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock > BigInt(10000) ? currentBlock - BigInt(10000) : BigInt(0);

        const eventLogs = await publicClient.getLogs({
          address: CONTRACTS.REWARDS_POOL,
          event: rewardsDistributedEvent,
          fromBlock,
          toBlock: 'latest',
        });

        // Process events into distributions
        const processedDistributions: RewardDistribution[] = [];

        for (const log of eventLogs) {
          // Decode the log manually since getLogs doesn't automatically decode
          const decoded = decodeEventLog({
            abi: RewardsPoolABI.abi,
            data: log.data,
            topics: log.topics,
          });

          const { week, winners, amounts } = decoded.args as unknown as {
            week: bigint;
            winners: string[];
            amounts: bigint[];
          };

          // Get block to fetch timestamp
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber });

          const totalDistributed = amounts.reduce((sum, amount) => sum + amount, BigInt(0));

          processedDistributions.push({
            week: Number(week),
            winners,
            amounts,
            totalDistributed,
            blockNumber: log.blockNumber,
            timestamp: Number(block.timestamp),
          });
        }

        // Sort by week descending (most recent first)
        processedDistributions.sort((a, b) => b.week - a.week);

        setDistributions(processedDistributions);
      } catch (err) {
        console.error('Error fetching rewards history:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setDistributions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRewardsHistory();

    // Refresh every 5 minutes
    const interval = setInterval(fetchRewardsHistory, 300000);

    return () => clearInterval(interval);
  }, [publicClient]);

  return {
    distributions,
    isLoading,
    error,
  };
}

/**
 * Hook to get rewards history for a specific player
 */
export function usePlayerRewardsHistory(playerAddress?: string) {
  const { distributions, isLoading, error } = useRewardsHistory();
  const [playerRewards, setPlayerRewards] = useState<PlayerReward[]>([]);

  useEffect(() => {
    if (!playerAddress || !distributions.length) {
      setPlayerRewards([]);
      return;
    }

    const rewards: PlayerReward[] = [];

    for (const distribution of distributions) {
      const winnerIndex = distribution.winners.findIndex(
        (winner) => winner.toLowerCase() === playerAddress.toLowerCase()
      );

      if (winnerIndex !== -1) {
        rewards.push({
          week: distribution.week,
          rank: winnerIndex + 1, // Rank is 1-indexed
          amount: distribution.amounts[winnerIndex],
          timestamp: distribution.timestamp,
        });
      }
    }

    setPlayerRewards(rewards);
  }, [playerAddress, distributions]);

  return {
    playerRewards,
    isLoading,
    error,
  };
}
