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
    },
  });
}

export function useNFTOwnerTokens(address?: `0x${string}`) {
  const { data: balance } = useNFTBalance(address);
  
  // Check token IDs 1, 2, and 3 (most common case for testing)
  const token1 = useReadContract({
    address: CONTRACTS.AVENTURER_NFT,
    abi: AventurerNFTABI.abi,
    functionName: 'ownerOf',
    args: [BigInt(1)],
    query: {
      enabled: !!address && !!balance && Number(balance) > 0,
    },
  });
  
  const token2 = useReadContract({
    address: CONTRACTS.AVENTURER_NFT,
    abi: AventurerNFTABI.abi,
    functionName: 'ownerOf',
    args: [BigInt(2)],
    query: {
      enabled: !!address && !!balance && Number(balance) > 0,
    },
  });
  
  const token3 = useReadContract({
    address: CONTRACTS.AVENTURER_NFT,
    abi: AventurerNFTABI.abi,
    functionName: 'ownerOf',
    args: [BigInt(3)],
    query: {
      enabled: !!address && !!balance && Number(balance) > 0,
    },
  });
  
  // Determine which token belongs to this address
  let tokenId: bigint | undefined;
  if (token1.data === address) tokenId = BigInt(1);
  else if (token2.data === address) tokenId = BigInt(2);
  else if (token3.data === address) tokenId = BigInt(3);
  
  return {
    data: tokenId,
    isLoading: token1.isLoading || token2.isLoading || token3.isLoading,
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
    },
  }) as { data: AventurerStats | undefined; isLoading: boolean; error: Error | null };
}

export function useTotalSupply() {
  return useReadContract({
    address: CONTRACTS.AVENTURER_NFT,
    abi: AventurerNFTABI.abi,
    functionName: 'totalSupply',
  });
}
