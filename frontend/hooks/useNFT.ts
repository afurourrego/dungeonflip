import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '@/lib/constants';
import AventurerNFTABI from '@/lib/contracts/AventurerNFT.json';

export interface AventurerStats {
  atk: bigint;
  def: bigint;
  hp: bigint;
}

export function useNFT() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const mintAventurer = () => {
    writeContract({
      address: CONTRACTS.AVENTURER_NFT,
      abi: AventurerNFTABI.abi,
      functionName: 'mintAventurer',
    });
  };

  return {
    mintAventurer,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  };
}

export function useNFTBalance(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACTS.AVENTURER_NFT,
    abi: AventurerNFTABI.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 30000, // Cache for 30 seconds
    },
  });
}

export function useNFTOwnerTokens(address?: `0x${string}`) {
  const { data: balance } = useNFTBalance(address);
  const { data: totalSupply } = useTotalSupply();

  // Try to get cached tokenId from localStorage
  const getCachedTokenId = (): bigint | undefined => {
    if (typeof window === 'undefined' || !address) return undefined;
    const cached = localStorage.getItem(`nft_token_${address}`);
    return cached ? BigInt(cached) : undefined;
  };

  const cachedTokenId = getCachedTokenId();

  // Check token IDs dynamically based on totalSupply (max 10 for performance)
  const maxTokensToCheck = totalSupply ? Math.min(Number(totalSupply), 10) : 3;

  // Only check if we don't have a cached value
  const shouldCheck = !!address && !!balance && Number(balance) > 0 && !cachedTokenId;

  const token1 = useReadContract({
    address: CONTRACTS.AVENTURER_NFT,
    abi: AventurerNFTABI.abi,
    functionName: 'ownerOf',
    args: [BigInt(1)],
    query: {
      enabled: shouldCheck && maxTokensToCheck >= 1,
      staleTime: 60000, // Cache for 1 minute
    },
  });

  const token2 = useReadContract({
    address: CONTRACTS.AVENTURER_NFT,
    abi: AventurerNFTABI.abi,
    functionName: 'ownerOf',
    args: [BigInt(2)],
    query: {
      enabled: shouldCheck && maxTokensToCheck >= 2,
      staleTime: 60000,
    },
  });

  const token3 = useReadContract({
    address: CONTRACTS.AVENTURER_NFT,
    abi: AventurerNFTABI.abi,
    functionName: 'ownerOf',
    args: [BigInt(3)],
    query: {
      enabled: shouldCheck && maxTokensToCheck >= 3,
      staleTime: 60000,
    },
  });

  // Determine which token belongs to this address
  let tokenId: bigint | undefined = cachedTokenId;

  if (!tokenId) {
    if (token1.data === address) tokenId = BigInt(1);
    else if (token2.data === address) tokenId = BigInt(2);
    else if (token3.data === address) tokenId = BigInt(3);

    // Cache the result
    if (tokenId && typeof window !== 'undefined' && address) {
      localStorage.setItem(`nft_token_${address}`, tokenId.toString());
    }
  }

  return {
    data: tokenId,
    isLoading: !cachedTokenId && (token1.isLoading || token2.isLoading || token3.isLoading),
    error: token1.error || token2.error || token3.error,
  };
}

export function useAventurerStats(tokenId?: bigint) {
  return useReadContract({
    address: CONTRACTS.AVENTURER_NFT,
    abi: AventurerNFTABI.abi,
    functionName: 'getAventurerStats',
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: tokenId !== undefined,
      staleTime: 300000, // Cache for 5 minutes (stats don't change)
    },
  }) as { data: AventurerStats | undefined; isLoading: boolean; error: Error | null };
}

export function useTotalSupply() {
  return useReadContract({
    address: CONTRACTS.AVENTURER_NFT,
    abi: AventurerNFTABI.abi,
    functionName: 'totalSupply',
    query: {
      staleTime: 60000, // Cache for 1 minute
    },
  });
}
