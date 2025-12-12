'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAccount, usePublicClient, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { AventurerStats, WalletNFT, useWalletNFTs } from '@/hooks/useNFT';
import { useSelectedToken } from '@/hooks/useSelectedToken';
import { getAventurerClassWithCard } from '@/lib/aventurer';
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

  // Get owned token IDs for validation
  const ownedTokenIds = useMemo(() => nfts.map((nft) => nft.tokenId), [nfts]);

  // Manage selected token for gameplay
  const { selectedTokenId, selectToken } = useSelectedToken(address, ownedTokenIds);

  const [sortKey, setSortKey] = useState<SortKey>('atk');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'idle'>('all');
  const [mounted, setMounted] = useState(false);
  const [burnToken, setBurnToken] = useState<bigint | null>(null);
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
      setBurnToken(null);
      refresh();
    }
  }, [isSuccess, refresh]);

  const handleSendToBurn = async (tokenId: bigint) => {
    if (!address) return;
    if (isWrongNetwork) {
      alert(`Switch to ${CURRENT_NETWORK.name} to burn your NFTs.`);
      return;
    }

    setBurnToken(tokenId);

    try {
      await writeContractAsync({
        address: CONTRACTS.AVENTURER_NFT,
        abi: AventurerNFTABI.abi,
        functionName: 'safeTransferFrom',
        args: [address, burnAddress, tokenId],
      });
    } catch (err) {
      console.error('Error sending NFT to burn:', err);
      setBurnToken(null);
    }
  };

  const txErrorMessage = txError ? (txError instanceof Error ? txError.message : String(txError)) : null;

  return (
    <div className="min-h-screen relative text-white">
      <Header />

      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="card rounded-2xl p-8 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Your Aventurers</h2>
                <p className="text-white/70 text-sm">Select an adventurer for your next dungeon run, view stats, and manage your NFTs.</p>
              </div>
              <div className="bg-dungeon-bg-darker border border-amber-600/60 rounded-lg p-4 text-center">
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
              <div className="bg-amber-900/40 border border-amber-600/60 rounded-lg p-6 text-center">
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
                      className="bg-dungeon-bg-darker border border-amber-600/60 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="atk">ATK</option>
                      <option value="def">DEF</option>
                      <option value="hp">HP</option>
                      <option value="mintedAt">Minted</option>
                    </select>
                    <button
                      onClick={() => setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))}
                      className="bg-dungeon-bg-darker border border-amber-600/60 rounded-lg px-3 py-2 text-sm"
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
                          statusFilter === filter ? 'bg-dungeon-accent-bronze border-dungeon-accent-gold' : 'bg-dungeon-bg-darker border-amber-600/60'
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
                      className="inline-block bg-gradient-to-r from-dungeon-accent-gold to-dungeon-accent-amber hover:bg-dungeon-accent-gold text-white font-bold py-3 px-8 rounded-lg transition shadow-lg"
                    >
                      Free mint
                    </Link>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {displayList.map((nft) => {
                    const nftClass = getAventurerClassWithCard(nft.stats);
                    const isActiveToken = activeTokenId !== BigInt(0) && nft.tokenId === activeTokenId;
                    const isSelected = selectedTokenId === nft.tokenId;
                    return (
                      <div
                        key={nft.tokenId.toString()}
                        className={`bg-dungeon-bg-darker rounded-xl p-6 flex flex-col gap-4 shadow-lg transition-all ${
                          isSelected
                            ? 'border-2 border-amber-400 shadow-amber-500/50'
                            : 'border border-amber-600/60'
                        }`}
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
                              {isSelected && !isActiveToken && (
                                <span className="text-[10px] px-2 py-1 rounded-full bg-amber-600/30 border border-amber-400/60 text-amber-100">
                                  Selected
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
                          <Image
                            src={nftClass?.cardImage ?? '/avatars/adventurer-idle.png'}
                            alt={nftClass ? `${nftClass.name} card art` : 'Aventurer'}
                            width={80}
                            height={128}
                            className="rounded-md border border-amber-600/40"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="bg-dungeon-bg-deeper rounded-lg p-3">
                            <p className="text-xs text-white/70">ATK</p>
                            <p className="text-2xl font-bold text-white">{nft.stats.atk.toString()}</p>
                          </div>
                          <div className="bg-dungeon-bg-deeper rounded-lg p-3">
                            <p className="text-xs text-white/70">DEF</p>
                            <p className="text-2xl font-bold text-white">{nft.stats.def.toString()}</p>
                          </div>
                          <div className="bg-dungeon-bg-deeper rounded-lg p-3">
                            <p className="text-xs text-white/70">HP</p>
                            <p className="text-2xl font-bold text-white">{nft.stats.hp.toString()}</p>
                          </div>
                        </div>

                        <div className="text-xs text-white/70">
                          Minted: {formatDate(nft.stats.mintedAt)}
                          {nftClass && <span className="ml-2 text-white/80 font-semibold">Class {nftClass.name}</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => selectToken(isSelected ? null : nft.tokenId)}
                            disabled={isActiveToken}
                            className={`w-full font-bold py-3 px-4 rounded-lg transition ${
                              isSelected
                                ? 'bg-dungeon-accent-bronze hover:bg-dungeon-accent-gold text-white'
                                : 'bg-gradient-to-r from-dungeon-accent-gold to-dungeon-accent-amber hover:bg-dungeon-accent-gold text-white'
                            } disabled:bg-gray-700 disabled:cursor-not-allowed`}
                          >
                            {isSelected ? 'Selected ✓' : 'Select for Game'}
                          </button>
                          <button
                            onClick={() => handleSendToBurn(nft.tokenId)}
                            disabled={isPending || isConfirming || burnToken === nft.tokenId}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition"
                          >
                            {burnToken === nft.tokenId && (isPending || isConfirming) ? 'Sending...' : 'Burn'}
                          </button>
                        </div>
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
