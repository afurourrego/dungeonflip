'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useNFTBalance, useTotalSupply } from '@/hooks/useNFT';
import { GAME_CONFIG, PRIZE_DISTRIBUTION } from '@/lib/constants';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: nftBalance } = useNFTBalance(address);
  const { data: totalSupply } = useTotalSupply();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const hasNFT = nftBalance && Number(nftBalance) > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0b0018] to-[#05030a] text-white">
      <header className="border-b border-purple-500/30 backdrop-blur-md bg-black/60 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-6 flex-wrap">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-3xl font-bold">DF</span>
            <div>
              <h1 className="text-2xl font-bold">DungeonFlip</h1>
              <p className="text-xs text-purple-200/70">Base Sepolia</p>
            </div>
          </Link>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <div className="run-counter">
              <div className="text-[10px] uppercase tracking-[0.3em] text-purple-200/70">Total Aventurers</div>
              <div className="text-2xl font-bold dot-matrix text-amber-300">
                {totalSupply !== undefined && totalSupply !== null ? totalSupply.toString() : '0'}
              </div>
            </div>
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
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 space-y-10">
        <section className="bg-black/60 border border-purple-500/30 rounded-2xl p-6 md:p-10 shadow-2xl">
          <div className="flex flex-col xl:flex-row gap-8 items-start">
            <div className="flex-1 space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-purple-300">On-chain dungeon runs</p>
              <h2 className="text-4xl font-bold text-amber-200">Fight, flip, and claim the vault.</h2>
              <p className="text-purple-100/80">
                Mint a free Aventurer NFT, pay 0.00001 ETH to enter, flip through rooms, and climb the weekly leaderboard.
                All moves resolve in the contract; the dungeon remembers your run.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-purple-900/40 border border-purple-600/40 rounded-full text-xs">4 cards per room</span>
                <span className="px-3 py-1 bg-purple-900/40 border border-purple-600/40 rounded-full text-xs">Custodial runs</span>
                <span className="px-3 py-1 bg-purple-900/40 border border-purple-600/40 rounded-full text-xs">Weekly rewards</span>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Link
                  href="/game"
                  className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-6 py-3 rounded-lg transition"
                >
                  Enter the dungeon
                </Link>
                <Link
                  href="/nfts"
                  className="bg-purple-700 hover:bg-purple-600 text-white font-bold px-6 py-3 rounded-lg transition"
                >
                  Manage Aventurers
                </Link>
                <Link
                  href="/mint"
                  className="border border-purple-500/60 text-purple-100 hover:bg-purple-900/40 font-bold px-6 py-3 rounded-lg transition"
                >
                  Mint free NFT
                </Link>
              </div>
            </div>
            <div className="w-full max-w-sm bg-gradient-to-b from-purple-900/40 to-black/70 border border-purple-700/50 rounded-2xl p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-purple-200/80 mb-2">Next room awaits</p>
              <div className="dot-matrix text-5xl text-amber-300 mb-4">Room 1</div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-purple-100/80">
                  <span>Entry fee</span>
                  <span className="font-bold text-amber-200">{GAME_CONFIG.ENTRY_FEE} ETH</span>
                </div>
                <div className="flex justify-between text-sm text-purple-100/80">
                  <span>Prize share</span>
                  <span className="font-bold text-amber-200">Top 10 (70/20/10 split)</span>
                </div>
                <div className="flex justify-between text-sm text-purple-100/80">
                  <span>Custody</span>
                  <span className="font-bold text-amber-200">NFT locked during run</span>
                </div>
              </div>
              <div className="mt-6 text-xs text-purple-200/70">
                Subtle stone textures and purple glyphs nod to the castle theme—without shouting it.
              </div>
            </div>
          </div>
        </section>

        <section className="bg-black/60 border border-purple-500/20 rounded-2xl p-8 grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-purple-200/80 mb-2">1st</p>
            <div className="text-4xl font-bold text-amber-300 dot-matrix mb-1">{PRIZE_DISTRIBUTION[0]}%</div>
            <p className="text-purple-100/70 text-sm">Weekly rewards pool</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-purple-200/80 mb-2">2nd</p>
            <div className="text-4xl font-bold text-gray-200 dot-matrix mb-1">{PRIZE_DISTRIBUTION[1]}%</div>
            <p className="text-purple-100/70 text-sm">Still a solid bounty</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-purple-200/80 mb-2">3rd</p>
            <div className="text-4xl font-bold text-orange-300 dot-matrix mb-1">{PRIZE_DISTRIBUTION[2]}%</div>
            <p className="text-purple-100/70 text-sm">Bring gems, climb ranks</p>
          </div>
        </section>

        <section className="bg-black/50 border border-purple-500/10 rounded-2xl p-6 text-sm text-purple-100/70">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div>
              <p className="uppercase tracking-[0.25em] text-[11px] text-purple-300">Navigation</p>
              <p className="text-purple-100">Home • Game • Adventurers • Leaderboard</p>
            </div>
            <div className="flex gap-3">
              <Link href="/game" className="px-4 py-2 rounded-lg bg-purple-800/60 hover:bg-purple-700/60 border border-purple-600/40">
                Go to Game
              </Link>
              <Link href="/nfts" className="px-4 py-2 rounded-lg bg-purple-800/60 hover:bg-purple-700/60 border border-purple-600/40">
                Manage NFTs
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-purple-500/20 mt-10 py-6 text-center text-sm text-purple-200/70">
        Built for Base • Smart runs, on-chain RNG, and weekly prizes.
      </footer>
    </div>
  );
}
