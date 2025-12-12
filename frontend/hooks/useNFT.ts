import { useCallback, useEffect, useState, useRef } from 'react';
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
 * Priority order:
 * 1. Active token in dungeon (from contract)
 * 2. User-selected token (from localStorage)
 * 3. First owned token (fallback)
 */
export function useNFTOwnerTokens(address?: `0x${string}`, selectedTokenId?: bigint | null, ownedTokenIds?: bigint[], staticMode: boolean = false) {
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
      staleTime: staticMode ? Infinity : 2000, // In static mode, never refetch
      refetchInterval: staticMode ? false : 3000, // In static mode, disable auto-refetch
    },
  });

  const [internalOwnedTokens, setInternalOwnedTokens] = useState<bigint[]>([]);
  const [enumerationSupported, setEnumerationSupported] = useState(true);

  const [walletTokenId, setWalletTokenId] = useState<bigint | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // If activeToken > 0, that's the deposited token - use it immediately
  const activeTokenBigInt = activeToken as bigint | undefined;
  const hasActiveToken = activeTokenBigInt !== undefined && activeTokenBigInt > BigInt(0);

  // Use provided ownedTokenIds if available, otherwise use internal state
  const ownedTokens = ownedTokenIds && ownedTokenIds.length > 0 ? ownedTokenIds : internalOwnedTokens;

  // Try enumerating tokensOfOwner if supported (only if not provided externally)
  useEffect(() => {
    if (!address || !publicClient || hasActiveToken || (ownedTokenIds && ownedTokenIds.length > 0)) {
      return;
    }
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const tokens = (await publicClient.readContract({
          address: CONTRACTS.AVENTURER_NFT,
          abi: AventurerNFTABI.abi,
          functionName: 'tokensOfOwner',
          args: [address],
        })) as bigint[];
        if (cancelled) return;
        setEnumerationSupported(true);
        setInternalOwnedTokens(tokens);
      } catch (err) {
        if (cancelled) return;
        // tokensOfOwner not supported or reverted; fall back to scan
        setEnumerationSupported(false);
        setInternalOwnedTokens([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [address, publicClient, hasActiveToken, ownedTokenIds]);

  // If enumeration unsupported, fall back to limited scan
  useEffect(() => {
    if (hasActiveToken) {
      setWalletTokenId(undefined);
      setError(null);
      setIsLoading(false);
      return;
    }

    if (!enumerationSupported && address && publicClient && totalSupply !== undefined) {
      let cancelled = false;
      const scan = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const supply = Number(totalSupply);
          const maxTokens = Math.max(Math.min(supply, 50), 10);
          const normalized = address.toLowerCase();
          for (let i = 1; i <= maxTokens; i++) {
            if (cancelled) return;
            const owner = await publicClient
              .readContract({
                address: CONTRACTS.AVENTURER_NFT,
                abi: AventurerNFTABI.abi,
                functionName: 'ownerOf',
                args: [BigInt(i)],
              })
              .catch(() => null);
            if (typeof owner === 'string' && owner.toLowerCase() === normalized) {
              setWalletTokenId(BigInt(i));
              return;
            }
          }
          setWalletTokenId(undefined);
        } catch (err) {
          if (!cancelled) setError(err as Error);
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      };
      scan();
      return () => {
        cancelled = true;
      };
    }

    // If enumeration works, pick first owned token
    if (ownedTokens.length > 0) {
      setWalletTokenId(ownedTokens[0]);
      setError(null);
    } else {
      setWalletTokenId(undefined);
    }
  }, [hasActiveToken, enumerationSupported, ownedTokens, address, publicClient, totalSupply]);

  // Bubble up error only if both active and owned failed due to revert
  useEffect(() => {
    if (activeError && !(activeError as any).message?.includes('tokensOfOwner')) {
      setError(activeError as Error);
      return;
    }
  }, [activeError]);

  // Validate that selected token is actually owned
  const isSelectedValid =
    selectedTokenId &&
    selectedTokenId > BigInt(0) &&
    ownedTokens.length > 0 &&
    ownedTokens.includes(selectedTokenId);

  // Final tokenId priority: active token > selected token (if valid) > wallet token
  const tokenId = hasActiveToken
    ? activeTokenBigInt
    : isSelectedValid
      ? selectedTokenId
      : walletTokenId;

  const refetch = useCallback(async () => {
    const result = await refetchActiveToken();
    if (!result.data || (result.data as bigint) === BigInt(0)) {
      // Trigger re-load of owned tokens path
      setInternalOwnedTokens([]);
    }
  }, [refetchActiveToken]);

  return {
    data: tokenId,
    isLoading: isLoading || isFetchingActive,
    error,
    refetch,
  };
}

export function useAventurerStats(tokenId?: bigint, staticMode: boolean = false) {
  return useReadContract({
    address: CONTRACTS.AVENTURER_NFT,
    abi: AventurerNFTABI.abi,
    functionName: 'getAventurerStats',
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: tokenId !== undefined,
      staleTime: staticMode ? Infinity : 300000, // In static mode, never refetch
      refetchInterval: false, // Never auto-refetch (stats don't change)
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

  const [enumerationSupported, setEnumerationSupported] = useState(true);
  const ownedTokensRef = useRef<bigint[]>([]);
  const [shouldRefetch, setShouldRefetch] = useState(0);

  const fetchNFTs = useCallback(async () => {
    if (!address || !publicClient) {
      setData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let ownedTokenIds = ownedTokensRef.current;

      // If we don't have enumeration, fall back to a limited scan
      if (!enumerationSupported) {
        if (totalSupply === undefined) {
          setIsLoading(false);
          return;
        }
        const supply = Number(totalSupply);
        const maxTokens = Math.max(Math.min(supply, 50), 10);
        const normalized = address.toLowerCase();
        const found: bigint[] = [];
        for (let i = 1; i <= maxTokens; i++) {
          const owner = await publicClient
            .readContract({
              address: CONTRACTS.AVENTURER_NFT,
              abi: AventurerNFTABI.abi,
              functionName: 'ownerOf',
              args: [BigInt(i)],
            })
            .catch(() => null);
          if (typeof owner === 'string' && owner.toLowerCase() === normalized) {
            found.push(BigInt(i));
          }
        }
        ownedTokenIds = found;
      }

      if (!ownedTokenIds.length) {
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
  }, [address, publicClient, enumerationSupported, totalSupply]);

  // Load owned tokens via tokensOfOwner if supported
  useEffect(() => {
    if (!address || !publicClient) return;
    let cancelled = false;
    const load = async () => {
      try {
        const tokens = (await publicClient.readContract({
          address: CONTRACTS.AVENTURER_NFT,
          abi: AventurerNFTABI.abi,
          functionName: 'tokensOfOwner',
          args: [address],
        })) as bigint[];
        if (cancelled) return;
        setEnumerationSupported(true);
        ownedTokensRef.current = tokens;
        setShouldRefetch(prev => prev + 1);
      } catch (err) {
        if (cancelled) return;
        setEnumerationSupported(false);
        ownedTokensRef.current = [];
        setShouldRefetch(prev => prev + 1);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [address, publicClient]);

  useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs, shouldRefetch]);

  return {
    data,
    isLoading,
    error,
    refresh: async () => {
      setShouldRefetch(prev => prev + 1);
    },
  };
}
