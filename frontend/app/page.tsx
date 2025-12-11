'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
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
    <div className="min-h-screen text-white relative">
      <header className="border-b border-purple-700/40 backdrop-blur-md bg-black/90 relative z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <Link href="/" className="flex items-center gap-2 justify-start">
              <span className="text-3xl drop-shadow-lg">⚔</span>
              <div>
                <h1 className="text-2xl font-bold text-white">DungeonFlip</h1>
                <div className="text-[10px] text-white/60 -mt-1">Base Sepolia</div>
              </div>
            </Link>

            <div className="flex justify-center">
              <div className="run-counter relative bg-[#18132f] border border-purple-500/70 shadow-lg">
                <div className="text-xs text-white/70 uppercase tracking-wider mb-1">Total Aventurers</div>
                <div className="text-3xl font-bold dot-matrix text-white">
                  {mounted ? (totalSupply ? totalSupply.toString() : '0') : '—'}
                </div>
              </div>
            </div>

            <nav className="flex items-center gap-4 justify-end">
              <Link href="/nfts" className="text-white/80 hover:text-white transition font-medium">
                NFTs
              </Link>
              <Link href="/leaderboard" className="text-white/80 hover:text-white transition font-medium">
                Leaderboard
              </Link>
            </nav>
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 relative z-10 space-y-10">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="bg-[#0e0b1f]/90 border border-purple-700/60 rounded-2xl p-8 shadow-2xl space-y-4">
            <p className="text-sm text-white/70 uppercase tracking-[0.25em]">Web3 Dungeon Crawler</p>
            <h2 className="text-4xl font-bold text-white leading-tight">Welcome to Dungeon Flip</h2>
            <p className="text-white/80 text-lg">
              Battle through on-chain rooms, flip risky cards, and compete for weekly treasure on Base.
              Your Aventurer NFT decides your fate.
            </p>

            <div className="grid sm:grid-cols-3 gap-3 pt-2">
              {[
                { label: 'Total NFTs', value: mounted ? (totalSupply ? totalSupply.toString() : '0') : '—' },
                { label: 'Entry Fee', value: `${GAME_CONFIG.ENTRY_FEE} ETH` },
                { label: 'Prize Split', value: '70% players' },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#16122c] border border-purple-700/60 rounded-lg p-3">
                  <p className="text-[11px] uppercase text-white/60">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              {!mounted ? (
                <div className="text-white/70">Loading...</div>
              ) : !isConnected ? (
                <ConnectButton />
              ) : hasNFT ? (
                <Link
                  href="/game"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-center transition shadow-lg"
                >
                  Start Playing
                </Link>
              ) : (
                <Link
                  href="/mint"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg text-center transition shadow-lg"
                >
                  Mint Aventurer (free + gas)
                </Link>
              )}
              <Link
                href="/nfts"
                className="bg-[#16122c] border border-purple-700/60 text-white font-semibold py-3 px-6 rounded-lg transition hover:border-white"
              >
                View NFTs
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#0e0b1f]/90 border border-purple-700/60 rounded-2xl p-6 shadow-2xl">
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { title: 'Flip Cards', copy: 'Choose between 4 cards each room.' },
                  { title: 'Battle Monsters', copy: 'Your ATK/DEF/HP decide if you survive.' },
                  { title: 'Earn Rewards', copy: 'Collect gems and climb the weekly leaderboard.' },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="p-4 text-center rounded-lg border border-purple-700/60 bg-[#16122c]"
                  >
                    <h3 className="font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-xs text-white/70">{item.copy}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0e0b1f]/90 border border-purple-700/60 rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl text-white">➤</span>
                <h3 className="text-xl font-bold text-white">How it works</h3>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                {[
                  { title: '1) Mint an Aventurer', copy: 'Random stats within fixed ranges.' },
                  { title: '2) Enter the dungeon', copy: 'Deposit the NFT, pay the fee, and start the run.' },
                  { title: '3) Claim the loot', copy: 'Top 10 is paid automatically every Friday.' },
                ].map((step) => (
                  <div key={step.title} className="bg-[#16122c] border border-purple-700/60 rounded-lg p-3">
                    <p className="text-white font-semibold mb-1">{step.title}</p>
                    <p className="text-white/75">{step.copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0e0b1f]/90 border border-purple-700/60 rounded-2xl p-8 text-center shadow-2xl">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-4xl animate-bounce-slow">💰</span>
            <h3 className="text-3xl font-bold text-white">Weekly Treasure Pool</h3>
          </div>
          <div className="h-px w-40 mx-auto bg-gradient-to-r from-transparent via-purple-500/70 to-transparent mb-6" />

          <div className="bg-[#16122c] rounded-lg p-6 mb-6 border border-purple-700/60">
            <div className="text-sm text-white/70 mb-2">Current Prize Pool</div>
            <div className="text-5xl font-bold text-white dot-matrix mb-2">ETH {GAME_CONFIG.ENTRY_FEE}</div>
            <div className="text-xs text-white/60">70% of all entry fees</div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🥇</div>
              <div className="text-2xl font-bold text-white dot-matrix">{PRIZE_DISTRIBUTION[0]}%</div>
              <div className="text-xs text-white/60">1st Place</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🥈</div>
              <div className="text-2xl font-bold text-white dot-matrix">{PRIZE_DISTRIBUTION[1]}%</div>
              <div className="text-xs text-white/60">2nd Place</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🥉</div>
              <div className="text-2xl font-bold text-white dot-matrix">{PRIZE_DISTRIBUTION[2]}%</div>
              <div className="text-xs text-white/60">3rd Place</div>
            </div>
          </div>

          <p className="text-white/70 text-sm">
            Top 10 players win prizes every week. Rewards are sent automatically every Friday.
          </p>
        </div>
      </main>

      <footer className="border-t border-purple-700/40 mt-20 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/60 text-sm">© 2025 DungeonFlip · Built on Base · Play to Earn</p>
        </div>
      </footer>
    </div>
  );
}
