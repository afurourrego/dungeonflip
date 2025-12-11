import { useCallback, useEffect, useState } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { CONTRACTS } from '@/lib/constants';
import AventurerNFTABI from '@/lib/contracts/AventurerNFT.json';
import DungeonGameABI from '@/lib/contracts/DungeonGame.json';

export interface AventurerStats {
  atk: bigint;
  def: bigint;
  hp: bigint;
  mintedAt: bigint;
}

export interface WalletNFT {
  tokenId: bigint;
  stats: AventurerStats;
}

export function useDungeonApproval(owner?: `0x${string}`) {
  const approvalQuery = useReadContract({
    address: CONTRACTS.AVENTURER_NFT,
    abi: AventurerNFTABI.abi,
    functionName: 'isApprovedForAll',
    args: owner ? [owner, CONTRACTS.DUNGEON_GAME] : undefined,
    query: {
      enabled: !!owner,
      staleTime: 60000,
    },
  });

  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const { refetch: refetchApproval } = approvalQuery;

  useEffect(() => {
    if (!hash || isConfirming) return;
    refetchApproval();
  }, [hash, isConfirming, refetchApproval]);

  const requestApproval = async () => {
    if (!owner) throw new Error('Wallet not connected');
    return writeContractAsync({
      address: CONTRACTS.AVENTURER_NFT,
      abi: AventurerNFTABI.abi,
      functionName: 'setApprovalForAll',
      args: [CONTRACTS.DUNGEON_GAME, true],
    });
  };

  return {
    isApproved: Boolean(approvalQuery.data),
    refetchApproval,
    requestApproval,
    isApproving: isPending || isConfirming,
    approvalError: error,
  };
}

export function useNFT() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
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
    receipt,
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

/**
 * Hook to find the active tokenId for a wallet.
 * Uses the new activeTokenByWallet mapping in the contract for instant lookup.
 * Falls back to scanning wallet ownership if no active token.
 */
export function useNFTOwnerTokens(address?: `0x${string}`) {
  const publicClient = usePublicClient();
  const { data: totalSupply } = useTotalSupply();
  
  // PRIORITY 1: Read activeTokenByWallet from contract (instant, no scanning)
  const { data: activeToken, refetch: refetchActiveToken, isFetching: isFetchingActive, error: activeError } = useReadContract({
    address: CONTRACTS.DUNGEON_GAME,
    abi: DungeonGameABI.abi,
    functionName: 'activeTokenByWallet',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 2000, // Refresh very frequently
      refetchInterval: 3000, // Auto-refetch every 3 seconds
    },
  });

  const [walletTokenId, setWalletTokenId] = useState<bigint | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // If activeToken > 0, that's the deposited token - use it immediately
  const activeTokenBigInt = activeToken as bigint | undefined;
  const hasActiveToken = activeTokenBigInt !== undefined && activeTokenBigInt > BigInt(0);

  // Scan wallet for owned tokens (only if no active token in game)
  useEffect(() => {
    if (!address || !publicClient || hasActiveToken) {
      if (hasActiveToken) {
        setWalletTokenId(undefined); // Clear wallet token since we have an active one
      }
      return;
    }

    let cancelled = false;

    const scanWallet = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const supply = totalSupply !== undefined ? Number(totalSupply) : 0;
        const maxTokens = Math.max(Math.min(supply, 100), 10);
        const lowercased = address.toLowerCase();

        for (let id = 1; id <= maxTokens; id++) {
          if (cancelled) return;
          const owner = await publicClient
            .readContract({
              address: CONTRACTS.AVENTURER_NFT,
              abi: AventurerNFTABI.abi,
              functionName: 'ownerOf',
              args: [BigInt(id)],
            })
            .catch(() => null);

          if (typeof owner === 'string' && owner.toLowerCase() === lowercased) {
            if (!cancelled) {
              setWalletTokenId(BigInt(id));
            }
            return;
          }
        }

        if (!cancelled) {
          setWalletTokenId(undefined);
        }
      } catch (err) {
        console.error('Error scanning wallet NFTs', err);
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Scan failed'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    scanWallet();
    return () => { cancelled = true; };
  }, [address, publicClient, totalSupply, hasActiveToken]);

  // Final tokenId: prefer active token, fallback to wallet token
  const tokenId = hasActiveToken ? activeTokenBigInt : walletTokenId;

  const refetch = useCallback(async () => {
    const result = await refetchActiveToken();
    // Force re-scan wallet if no active token found
    if (!result.data || (result.data as bigint) === BigInt(0)) {
      setWalletTokenId(undefined);
    }
  }, [refetchActiveToken]);

  return {
    data: tokenId,
    isLoading: isLoading || isFetchingActive,
    error,
    refetch,
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

export function useWalletNFTs(address?: `0x${string}`) {
  const publicClient = usePublicClient();
  const { data: totalSupply } = useTotalSupply();
  const [data, setData] = useState<WalletNFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchNFTs = useCallback(async () => {
    if (!address || !publicClient) {
      setData([]);
      setIsLoading(false);
      return;
    }

    if (totalSupply === undefined) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const maxTokens = Math.min(Number(totalSupply), 50);

      if (maxTokens <= 0) {
        setData([]);
        return;
      }

      const tokenIds = Array.from({ length: maxTokens }, (_, index) => BigInt(index + 1));
      const owners = await Promise.all(
        tokenIds.map((tokenId) =>
          publicClient
            .readContract({
              address: CONTRACTS.AVENTURER_NFT,
              abi: AventurerNFTABI.abi,
              functionName: 'ownerOf',
              args: [tokenId],
            })
            .catch((err) => {
              console.warn('ownerOf failed for token', tokenId.toString(), err);
              return null;
            })
        )
      );

      const normalizedAddress = address.toLowerCase();
      const ownedTokenIds = tokenIds.filter((tokenId, index) => {
        const owner = owners[index];
        return typeof owner === 'string' && owner.toLowerCase() === normalizedAddress;
      });

      if (ownedTokenIds.length === 0) {
        setData([]);
        return;
      }

      const statsResults = await Promise.all(
        ownedTokenIds.map((tokenId) =>
          publicClient.readContract({
            address: CONTRACTS.AVENTURER_NFT,
            abi: AventurerNFTABI.abi,
            functionName: 'getAventurerStats',
            args: [tokenId],
          })
        )
      );

      const formatted: WalletNFT[] = ownedTokenIds.map((tokenId, index) => ({
        tokenId,
        stats: statsResults[index] as AventurerStats,
      }));

      setData(formatted);
    } catch (err) {
      console.error('Error fetching wallet NFTs:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching NFTs'));
    } finally {
      setIsLoading(false);
    }
  }, [address, publicClient, totalSupply]);

  useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchNFTs,
  };
}
