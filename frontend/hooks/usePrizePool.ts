import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { CONTRACTS } from '@/lib/constants';
import FeeDistributorABI from '@/lib/contracts/FeeDistributor.json';
import RewardsPoolABI from '@/lib/contracts/RewardsPool.json';

const trimTrailingZeros = (value: string) => {
  if (!value.includes('.')) return value;
  return value.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
};

const formatEthDisplay = (valueWei: bigint, maxDecimals = 6) => {
  const raw = formatEther(valueWei);
  const [whole, frac = ''] = raw.split('.');
  if (!frac) return whole;
  const trimmedFrac = frac.slice(0, maxDecimals);
  return trimTrailingZeros(`${whole}.${trimmedFrac}`);
};

/**
 * Reads the weekly prize pool amount.
 *
 * Today, 70% of each entry fee sits inside FeeDistributor.rewardsPoolBalance
 * until RewardsPool.withdraws it during distribution. We read both sources.
 */
export function usePrizePool() {
  const feeDistributorRewards = useReadContract({
    address: CONTRACTS.FEE_DISTRIBUTOR,
    abi: FeeDistributorABI.abi,
    functionName: 'rewardsPoolBalance',
    query: {
      refetchInterval: 10_000,
      staleTime: 5_000,
    },
  });

  const rewardsPoolBalance = useReadContract({
    address: CONTRACTS.REWARDS_POOL,
    abi: RewardsPoolABI.abi,
    functionName: 'getCurrentPoolBalance',
    query: {
      refetchInterval: 10_000,
      staleTime: 5_000,
    },
  });

  const pending = (feeDistributorRewards.data as bigint | undefined) ?? BigInt(0);
  const pool = (rewardsPoolBalance.data as bigint | undefined) ?? BigInt(0);

  // Backwards/forwards compatible:
  // - Old RewardsPool.getCurrentPoolBalance() returns only RewardsPool.balance (usually 0)
  // - New versions may include pending FeeDistributor rewards already
  const totalWei = pool >= pending ? pool : pool + pending;

  return {
    totalWei,
    totalEth: formatEthDisplay(totalWei),
    pendingWei: pending,
    poolWei: pool,
    isLoading: feeDistributorRewards.isLoading || rewardsPoolBalance.isLoading,
    error: feeDistributorRewards.error ?? rewardsPoolBalance.error,
    refetch: () => {
      feeDistributorRewards.refetch();
      rewardsPoolBalance.refetch();
    },
  };
}
