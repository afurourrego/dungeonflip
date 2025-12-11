'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, usePublicClient } from 'wagmi';
import { useWalletNFTs } from '@/hooks/useNFT';
import { CONTRACTS, CURRENT_NETWORK } from '@/lib/constants';
import DungeonGameABI from '@/lib/contracts/DungeonGame.json';

type SortKey = 'atk' | 'def' | 'hp';
type SortDir = 'asc' | 'desc';

function StatChip({ label, value, color, max }: { label: string; value: number; color: string; max: number }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="bg-purple-950/40 border border-purple-700/50 rounded-lg p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-purple-100/80">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          {label}
        </span>
        <span className="font-bold text-amber-200">{value}</span>
      </div>
      <div className="h-8 relative overflow-hidden rounded bg-black/60 border border-purple-800/50">
        <div
          className="h-full transition-all"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, #1a1228)`,
            opacity: 0.9,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-purple-100/60 tracking-wide">
          power
        </div>
      </div>
    </div>
  );
}

export default function NFTsPage() {
  const { address, isConnected, chain } = useAccount();
  const { data: nfts, isLoading, error, refresh } = useWalletNFTs(address);
  const publicClient = usePublicClient();
  const [sortKey, setSortKey] = useState<SortKey>('atk');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [showInDungeon, setShowInDungeon] = useState<'all' | 'active' | 'idle'>('all');
  const [mounted, setMounted] = useState(false);
  const [activeNFT, setActiveNFT] = useState<{ tokenId: bigint; stats: { atk: bigint; def: bigint; hp: bigint; mintedAt: bigint } } | null>(null);

  const { data: activeToken } = useReadContract({
    address: CONTRACTS.DUNGEON_GAME,
    abi: DungeonGameABI.abi,
    functionName: 'activeTokenByWallet',
    args: address ? [address] : undefined,
    query: { enabled: !!address, staleTime: 3000, refetchInterval: 5000 },
  });

  useEffect(() => setMounted(true), []);

  // If the active token is in custody (not in tokensOfOwner), fetch its stats so it appears in the list
  const activeTokenId = (activeToken as bigint | undefined) ?? BigInt(0);

  const sorted = useMemo(() => {
    const baseList = activeNFT ? [...nfts, activeNFT] : [...nfts];
    const list = [...baseList];
    list.sort((a, b) => {
      const aVal = Number(a.stats[sortKey]);
      const bVal = Number(b.stats[sortKey]);
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return list;
  }, [nfts, sortKey, sortDir, activeNFT]);

  const filtered = useMemo(() => {
    if (showInDungeon === 'all') return sorted;
    const isActive = (id: bigint) => activeTokenId > BigInt(0) && activeTokenId === id;
    return sorted.filter((nft) => (showInDungeon === 'active' ? isActive(nft.tokenId) : !isActive(nft.tokenId)));
  }, [sorted, showInDungeon, activeTokenId]);

  const isWrongNetwork = chain && chain.id !== CURRENT_NETWORK.id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0b0018] to-[#05030a] text-white">
      <header className="border-b border-purple-500/30 backdrop-blur-md bg-black/60 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-6 flex-wrap">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-3xl font-bold">DF</span>
            <div>
              <h1 className="text-2xl font-bold">DungeonFlip</h1>
              <p className="text-xs text-purple-200/70">Adventurers</p>
            </div>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/game" className="hover:text-amber-300 transition">
              Game
            </Link>
            <Link href="/nfts" className="hover:text-amber-300 transition">
              Adventurers
            </Link>
            <Link href="/leaderboard" className="hover:text-amber-300 transition">
              Leaderboard
            </Link>
          </nav>
          <ConnectButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 space-y-8">
        <section className="bg-black/60 border border-purple-500/30 rounded-2xl p-6 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-purple-300">Adventurer roster</p>
              <h2 className="text-3xl font-bold text-amber-200">Your heroes</h2>
              <p className="text-purple-200/70 text-sm">
                Subtle castle glyphs hide in the gradients; focus on the stats, not the stone.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link
                href="/game"
                className="px-4 py-2 rounded-lg bg-amber-400 text-black font-bold hover:bg-amber-300 transition"
              >
                Go to Game
              </Link>
              <Link
                href="/mint"
                className="px-4 py-2 rounded-lg border border-purple-500/60 text-purple-100 hover:bg-purple-900/40 transition"
              >
                Mint free NFT
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-4 text-sm">
            <label className="flex items-center gap-2">
              Sort by
              <select
                className="bg-purple-900/40 border border-purple-600/40 rounded px-2 py-1 text-white"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
              >
                <option value="atk">ATK</option>
                <option value="def">DEF</option>
                <option value="hp">HP</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              Direction
              <select
                className="bg-purple-900/40 border border-purple-600/40 rounded px-2 py-1 text-white"
                value={sortDir}
                onChange={(e) => setSortDir(e.target.value as SortDir)}
              >
                <option value="desc">High → Low</option>
                <option value="asc">Low → High</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              Dungeon state
              <select
                className="bg-purple-900/40 border border-purple-600/40 rounded px-2 py-1 text-white"
                value={showInDungeon}
                onChange={(e) => setShowInDungeon(e.target.value as 'all' | 'active' | 'idle')}
              >
                <option value="all">All</option>
                <option value="active">In dungeon</option>
                <option value="idle">Idle</option>
              </select>
            </label>
            <button
              onClick={() => refresh()}
              className="px-3 py-1 rounded bg-purple-700/60 hover:bg-purple-600/60 border border-purple-500/40"
            >
              Refresh
            </button>
          </div>

          {!mounted ? (
            <p className="text-purple-200/80">Loading...</p>
          ) : !isConnected ? (
            <div className="text-center py-10">
              <p className="text-purple-200/80 mb-3">Connect your wallet to view your Aventurers.</p>
              <ConnectButton />
            </div>
          ) : isWrongNetwork ? (
            <div className="bg-red-900/40 border border-red-700/50 rounded-lg p-4 text-center text-red-100">
              Switch to {CURRENT_NETWORK.name} to manage your NFTs.
            </div>
          ) : (
            <>
              {isLoading && <p className="text-purple-200/80">Loading NFTs...</p>}
              {error && (
                <div className="bg-red-900/40 border border-red-700/50 rounded-lg p-4 text-red-100">
                  Failed to load NFTs: {error.message}
                </div>
              )}
              {!isLoading && filtered.length === 0 && (
                <p className="text-purple-200/70">No Aventurers found with the current filter.</p>
              )}

              <div className="grid md:grid-cols-2 gap-6 mt-4">
                {filtered.map((nft) => {
                  const atk = Number(nft.stats.atk);
                  const def = Number(nft.stats.def);
                  const hp = Number(nft.stats.hp);
                  const isActive = activeTokenId > BigInt(0) && activeTokenId === nft.tokenId;
                  const radarSize = 160;
                  const maxGauge = 6;
                  const norm = (v: number, max: number) => (Math.max(0, Math.min(v, max)) / max) * 60 + 20;
                  const points = () => {
                    // Simple 3-axis radar (ATK at top, DEF bottom-left, HP bottom-right)
                    const a = norm(atk, maxGauge);
                    const d = norm(def, maxGauge);
                    const h = norm(hp, maxGauge);
                    const cx = radarSize / 2;
                    const cy = radarSize / 2;
                    const p1 = `${cx},${cy - a}`;
                    const p2 = `${cx - d * 0.86},${cy + d * 0.5}`;
                    const p3 = `${cx + h * 0.86},${cy + h * 0.5}`;
                    return `${p1} ${p2} ${p3}`;
                  };
                  const grid = (r: number) => {
                    const cx = radarSize / 2;
                    const cy = radarSize / 2;
                    const p1 = `${cx},${cy - r}`;
                    const p2 = `${cx - r * 0.86},${cy + r * 0.5}`;
                    const p3 = `${cx + r * 0.86},${cy + r * 0.5}`;
                    return `${p1} ${p2} ${p3}`;
                  };
                  return (
                    <div
                      key={nft.tokenId.toString()}
                      className="bg-gradient-to-b from-purple-950/60 to-black/60 border border-purple-700/50 rounded-xl p-5 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-purple-200/70">Token</p>
                          <p className="text-2xl font-bold text-amber-200">#{nft.tokenId.toString()}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            isActive ? 'bg-amber-400 text-black' : 'bg-purple-800/60 text-purple-100'
                          }`}
                        >
                          {isActive ? 'In dungeon' : 'Idle'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <StatChip label="ATK" value={atk} color="#f97316" max={maxGauge} />
                        <StatChip label="DEF" value={def} color="#22d3ee" max={maxGauge} />
                        <StatChip label="HP" value={hp} color="#a3e635" max={maxGauge} />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Link
                          href="/game"
                          className="text-center px-4 py-2 rounded-lg bg-amber-400 text-black font-bold hover:bg-amber-300 transition"
                        >
                          {isActive ? 'Continue run' : 'Start run'}
                        </Link>
                        <Link
                          href="/mint"
                          className="text-center px-4 py-2 rounded-lg border border-purple-500/60 text-purple-100 hover:bg-purple-900/40 transition"
                        >
                          View stats
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
