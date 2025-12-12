'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAccount, usePublicClient, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { AventurerStats, WalletNFT, useWalletNFTs } from '@/hooks/useNFT';
import { getAventurerClass } from '@/lib/aventurer';
import { BURN_ADDRESSES, CONTRACTS, CURRENT_NETWORK, NETWORKS } from '@/lib/constants';
import AventurerNFTABI from '@/lib/contracts/AventurerNFT.json';
import DungeonGameABI from '@/lib/contracts/DungeonGame.json';
import { Header } from '@/components/Header';
import { ConnectButton } from '@rainbow-me/rainbowkit';

type SortKey = keyof Pick<AventurerStats, 'atk' | 'def' | 'hp' | 'mintedAt'>;
type SortDir = 'asc' | 'desc';

const formatDate = (timestamp?: bigint) => {
  if (!timestamp || timestamp === BigInt(0)) return '--';
  const date = new Date(Number(timestamp) * 1000);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(date);
};

export default function NFTsPage() {
  const { address, isConnected, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: nfts = [], isLoading, error, refresh } = useWalletNFTs(address);

  const [sortKey, setSortKey] = useState<SortKey>('atk');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'idle'>('all');
  const [mounted, setMounted] = useState(false);
  const [selectedToken, setSelectedToken] = useState<bigint | null>(null);
  const [activeNFT, setActiveNFT] = useState<WalletNFT | null>(null);

  const burnAddress =
    chain?.id === NETWORKS.BASE_MAINNET.id ? BURN_ADDRESSES.BASE_MAINNET : BURN_ADDRESSES.BASE_SEPOLIA;
  const isWrongNetwork = chain?.id !== undefined && chain.id !== CURRENT_NETWORK.id;

  const { data: activeToken } = useReadContract({
    address: CONTRACTS.DUNGEON_GAME,
    abi: DungeonGameABI.abi,
    functionName: 'activeTokenByWallet',
    args: address ? [address] : undefined,
    query: { enabled: !!address, staleTime: 3000, refetchInterval: 5000 },
  });
  const activeTokenId = (activeToken as bigint | undefined) ?? BigInt(0);

  const { writeContractAsync, data: txHash, isPending, error: txError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => setMounted(true), []);

  // If the active token is in custody (not in tokensOfOwner), fetch its stats so it appears in the list
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!publicClient || activeTokenId === BigInt(0)) {
        setActiveNFT(null);
        return;
      }
      const ownedList = nfts ?? [];
      if (ownedList.some((nft) => nft.tokenId === activeTokenId)) {
        setActiveNFT(null);
        return;
      }
      try {
        const stats = (await publicClient.readContract({
          address: CONTRACTS.AVENTURER_NFT,
          abi: AventurerNFTABI.abi,
          functionName: 'getAventurerStats',
          args: [activeTokenId],
        })) as AventurerStats;
        if (!cancelled) {
          setActiveNFT({ tokenId: activeTokenId, stats });
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch active NFT stats', err);
          setActiveNFT(null);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [publicClient, activeTokenId, nfts]);

  const sorted = useMemo(() => {
    const baseList = [...(nfts ?? [])];
    if (activeNFT && !baseList.some((nft) => nft.tokenId === activeNFT.tokenId)) {
      baseList.push(activeNFT);
    }
    return baseList.sort((a, b) => {
      const aVal = Number(a.stats[sortKey]);
      const bVal = Number(b.stats[sortKey]);
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [nfts, sortKey, sortDir, activeNFT]);

  const displayList = useMemo(
    () =>
      sorted.filter((nft) => {
        const isActiveToken = activeTokenId !== BigInt(0) && nft.tokenId === activeTokenId;
        if (statusFilter === 'active') return isActiveToken;
        if (statusFilter === 'idle') return !isActiveToken;
        return true;
      }),
    [sorted, statusFilter, activeTokenId]
  );

  useEffect(() => {
    if (isSuccess) {
      setSelectedToken(null);
      refresh();
    }
  }, [isSuccess, refresh]);

  const handleSendToBurn = async (tokenId: bigint) => {
    if (!address) return;
    if (isWrongNetwork) {
      alert(`Switch to ${CURRENT_NETWORK.name} to burn your NFTs.`);
      return;
    }

    setSelectedToken(tokenId);

    try {
      await writeContractAsync({
        address: CONTRACTS.AVENTURER_NFT,
        abi: AventurerNFTABI.abi,
        functionName: 'safeTransferFrom',
        args: [address, burnAddress, tokenId],
      });
    } catch (err) {
      console.error('Error sending NFT to burn:', err);
      setSelectedToken(null);
    }
  };

  const txErrorMessage = txError ? (txError instanceof Error ? txError.message : String(txError)) : null;

  return (
    <div className="min-h-screen relative text-white">
      <Header />

      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="bg-[#0e0b1f]/90 border border-purple-700/60 rounded-2xl p-8 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Your Aventurers</h2>
                <p className="text-white/70 text-sm">View every NFT in your connected wallet and handle quick burns.</p>
              </div>
              <div className="bg-[#16122c] border border-purple-700/60 rounded-lg p-4 text-center">
                <p className="text-xs text-white/70 uppercase tracking-widest mb-1">Burn address</p>
                <p className="font-mono text-sm text-white break-all">{burnAddress}</p>
                <p className="text-[10px] text-white/50 mt-1">Transfers to burn are irreversible</p>
              </div>
            </div>

            {!mounted ? (
              <div className="text-center py-12">
                <p className="text-white/70">Loading...</p>
              </div>
            ) : !isConnected ? (
              <div className="text-center py-12">
                <p className="text-white/80 mb-4">Connect your wallet to see your Aventurers.</p>
                <ConnectButton />
              </div>
            ) : isWrongNetwork ? (
              <div className="bg-purple-900/40 border border-purple-700/60 rounded-lg p-6 text-center">
                <p className="text-white font-semibold mb-2">Wrong network</p>
                <p className="text-white/70 text-sm">Switch to {CURRENT_NETWORK.name} to manage your NFTs.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-white/70">Sort by</label>
                    <select
                      value={sortKey}
                      onChange={(e) => setSortKey(e.target.value as SortKey)}
                      className="bg-[#16122c] border border-purple-700/60 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="atk">ATK</option>
                      <option value="def">DEF</option>
                      <option value="hp">HP</option>
                      <option value="mintedAt">Minted</option>
                    </select>
                    <button
                      onClick={() => setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))}
                      className="bg-[#16122c] border border-purple-700/60 rounded-lg px-3 py-2 text-sm"
                    >
                      {sortDir === 'asc' ? 'Asc' : 'Desc'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {(['all', 'active', 'idle'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setStatusFilter(filter)}
                        className={`px-3 py-2 rounded-lg text-sm border ${
                          statusFilter === filter ? 'bg-purple-700/60 border-purple-500' : 'bg-[#16122c] border-purple-700/60'
                        }`}
                      >
                        {filter === 'all' ? 'All' : filter === 'active' ? 'In dungeon' : 'In wallet'}
                      </button>
                    ))}
                  </div>
                </div>

                {isLoading && <div className="text-center text-white/70">Loading NFTs...</div>}

                {error && (
                  <div className="bg-red-900/40 border border-red-700/60 rounded-lg p-4 text-center text-red-200">
                    Failed to load your NFTs: {error.message}
                  </div>
                )}

                {txErrorMessage && (
                  <div className="bg-red-900/40 border border-red-700/60 rounded-lg p-4 text-center text-red-200">
                    Transaction error: {txErrorMessage}
                  </div>
                )}

                {!isLoading && displayList.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-white/80 mb-4">You do not own any Aventurers yet.</p>
                    <Link
                      href="/mint"
                      className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition shadow-lg"
                    >
                      Free mint
                    </Link>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {displayList.map((nft) => {
                    const nftClass = getAventurerClass(nft.stats);
                    const isActiveToken = activeTokenId !== BigInt(0) && nft.tokenId === activeTokenId;
                    return (
                      <div
                        key={nft.tokenId.toString()}
                        className="bg-[#16122c] border border-purple-700/60 rounded-xl p-6 flex flex-col gap-4 shadow-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-white/70">Token ID</p>
                            <div className="flex items-center gap-2">
                              <p className="text-2xl font-bold text-white">#{nft.tokenId.toString()}</p>
                              {isActiveToken && (
                                <span className="text-[10px] px-2 py-1 rounded-full bg-green-600/30 border border-green-400/60 text-green-100">
                                  In dungeon
                                </span>
                              )}
                            </div>
                            {nftClass && (
                              <span
                                className={`inline-flex items-center gap-1 mt-1 px-3 py-1 rounded-full text-xs font-semibold text-black bg-gradient-to-r ${nftClass.accent}`}
                              >
                                {nftClass.name}
                              </span>
                            )}
                          </div>
                          <Image src="/avatars/adventurer-idle.png" alt="Aventurer" width={64} height={64} />
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="bg-[#1a1633] rounded-lg p-3">
                            <p className="text-xs text-white/70">ATK</p>
                            <p className="text-2xl font-bold text-white">{nft.stats.atk.toString()}</p>
                          </div>
                          <div className="bg-[#1a1633] rounded-lg p-3">
                            <p className="text-xs text-white/70">DEF</p>
                            <p className="text-2xl font-bold text-white">{nft.stats.def.toString()}</p>
                          </div>
                          <div className="bg-[#1a1633] rounded-lg p-3">
                            <p className="text-xs text-white/70">HP</p>
                            <p className="text-2xl font-bold text-white">{nft.stats.hp.toString()}</p>
                          </div>
                        </div>

                        <div className="text-xs text-white/70">
                          Minted: {formatDate(nft.stats.mintedAt)}
                          {nftClass && <span className="ml-2 text-white/80 font-semibold">Class {nftClass.name}</span>}
                        </div>

                        <button
                          onClick={() => handleSendToBurn(nft.tokenId)}
                          disabled={isPending || isConfirming || selectedToken === nft.tokenId}
                          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition"
                        >
                          {selectedToken === nft.tokenId && (isPending || isConfirming)
                            ? 'Sending...'
                            : 'Send to burn'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
