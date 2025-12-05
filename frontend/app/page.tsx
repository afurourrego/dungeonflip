'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useNFTBalance, useTotalSupply } from '@/hooks/useNFT';
import { GAME_CONFIG, FEE_DISTRIBUTION, PRIZE_DISTRIBUTION } from '@/lib/constants';
import { useState, useEffect } from 'react';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: nftBalance } = useNFTBalance(address);
  const { data: totalSupply } = useTotalSupply();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasNFT = nftBalance && Number(nftBalance) > 0;

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="border-b border-amber-800/30 bg-gray-900/50 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="block">
                <h1 className="text-2xl font-bold text-dungeon-gold text-glow mb-0.5">
                  Dungeon Flip
                </h1>
                <p className="text-[10px] text-amber-300/60 uppercase tracking-wider">
                  Powered by Base
                </p>
              </Link>
            </div>

            {/* Center - Total Runs Counter */}
            <div className="flex-1 flex justify-center">
              <div className="run-counter">
                <div className="run-counter-shine" />
                <div className="relative z-10">
                  <div className="text-[10px] text-amber-300/70 uppercase tracking-widest mb-0.5">
                    Total Executed Runs
                  </div>
                  <div className="text-3xl font-bold text-dungeon-gold dot-matrix">
                    {totalSupply !== undefined && totalSupply !== null ? totalSupply.toString() : '0'}
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Wallet and Nav */}
            <div className="flex-shrink-0 flex items-center gap-3">
              <Link 
                href="/leaderboard" 
                className="text-amber-300 hover:text-amber-200 transition-colors text-sm hidden md:block"
              >
                🏆 Leaderboard
              </Link>
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Welcome Card */}
          <div className="royal-board p-8 text-center">
            <div className="text-5xl mb-4 font-bold text-dungeon-gold drop-shadow-lg">
              Welcome to Dungeon Flip!
            </div>
            <div className="royal-divider mx-auto mb-4" />
            <p className="text-amber-100/90 text-lg mb-6 leading-relaxed">
              A Web3 game built for Base. Connect your wallet to mint your Aventurer NFT and start exploring the dungeon!
            </p>

            {/* Feature Grid */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-amber-800/30">
                <div className="text-3xl mb-2">🃏</div>
                <h3 className="font-bold text-amber-300 mb-1">Flip Cards</h3>
                <p className="text-xs text-amber-100/70">
                  Reveal 4 mysterious cards each run
                </p>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-amber-800/30">
                <div className="text-3xl mb-2">⚔️</div>
                <h3 className="font-bold text-amber-300 mb-1">Battle Monsters</h3>
                <p className="text-xs text-amber-100/70">
                  Defeat enemies with your ATK stat
                </p>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-amber-800/30">
                <div className="text-3xl mb-2">💎</div>
                <h3 className="font-bold text-amber-300 mb-1">Earn Rewards</h3>
                <p className="text-xs text-amber-100/70">
                  Claim Soul Fragment tokens on-chain
                </p>
              </div>
            </div>

            {/* CTA */}
            {!mounted ? (
              <div className="text-amber-300/80">Loading...</div>
            ) : !isConnected ? (
              <div>
                <p className="text-amber-100/80 mb-4">Connect your wallet to start playing</p>
                <ConnectButton />
              </div>
            ) : !hasNFT ? (
              <Link
                href="/mint"
                className="inline-block bg-gradient-to-r from-dungeon-gold to-amber-600 hover:from-amber-500 hover:to-amber-700 text-gray-900 font-bold py-3 px-8 rounded-lg transition transform hover:scale-105 shadow-xl hover:shadow-amber-500/50"
              >
                🎨 Mint Aventurer NFT
              </Link>
            ) : (
              <Link
                href="/game"
                className="inline-block bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-12 rounded-lg text-xl transition transform hover:scale-105 shadow-xl hover:shadow-green-500/50"
              >
                ⚔️ Enter the Dungeon
              </Link>
            )}
          </div>

          {/* Weekly Treasure Pool */}
          <div className="royal-board p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-3xl animate-bounce-slow">💰</span>
                <h2 className="text-3xl font-bold text-dungeon-gold">
                  Weekly Treasure Pool
                </h2>
                <span className="text-3xl animate-bounce-slow">💰</span>
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="royal-dot" />
                <p className="text-amber-300/80 text-sm uppercase tracking-wider">
                  Week 1
                </p>
                <div className="royal-dot" />
              </div>
            </div>

            {/* Prize Pool Display */}
            <div className="relative mb-6 p-6 rounded-xl bg-gradient-to-br from-amber-900/40 via-yellow-900/30 to-amber-900/40 border-2 border-amber-500/60 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-amber-600/10 rounded-xl pointer-events-none animate-pulse" />
              
              <div className="relative text-center">
                <div className="text-xs text-amber-300/70 uppercase tracking-widest mb-2">
                  Current Prize Pool
                </div>
                <div className="text-5xl font-bold text-dungeon-gold dot-matrix mb-2 drop-shadow-lg">
                  0.0 ETH
                </div>
                <div className="text-sm text-amber-100/60">
                  ≈ $0.00 USD
                </div>
              </div>
            </div>

            {/* Top 3 Prizes */}
            <div className="space-y-3 mb-4">
              <div className="text-center text-sm text-amber-300/80 uppercase tracking-wider mb-3">
                Top 3 Prizes
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-amber-900/30 to-transparent border border-amber-700/40 hover:border-amber-600/60 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="text-2xl w-10 h-10 flex items-center justify-center rounded-full bg-yellow-500/20 text-yellow-400">
                    🥇
                  </div>
                  <div>
                    <div className="font-bold text-white">1st Place</div>
                    <div className="text-xs text-amber-300/60">{PRIZE_DISTRIBUTION[0]}% of pool</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-dungeon-gold dot-matrix">
                    0.00 ETH
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-amber-900/30 to-transparent border border-amber-700/40 hover:border-amber-600/60 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="text-2xl w-10 h-10 flex items-center justify-center rounded-full bg-gray-400/20 text-gray-300">
                    🥈
                  </div>
                  <div>
                    <div className="font-bold text-white">2nd Place</div>
                    <div className="text-xs text-amber-300/60">{PRIZE_DISTRIBUTION[1]}% of pool</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-dungeon-gold dot-matrix">
                    0.00 ETH
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-amber-900/30 to-transparent border border-amber-700/40 hover:border-amber-600/60 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="text-2xl w-10 h-10 flex items-center justify-center rounded-full bg-amber-700/20 text-amber-500">
                    🥉
                  </div>
                  <div>
                    <div className="font-bold text-white">3rd Place</div>
                    <div className="text-xs text-amber-300/60">{PRIZE_DISTRIBUTION[2]}% of pool</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-dungeon-gold dot-matrix">
                    0.00 ETH
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Info */}
            <div className="text-center text-xs text-amber-100/60 border-t border-amber-800/40 pt-4">
              <p className="mb-1">
                💎 Pool grows with every {GAME_CONFIG.ENTRY_FEE} ETH entry fee
              </p>
              <p>
                🏆 Top 10 players share {FEE_DISTRIBUTION.REWARDS_POOL}% • Prizes distributed automatically
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-800/30 bg-gray-900/50 backdrop-blur-sm py-6 relative z-10">
        <div className="container mx-auto px-4 text-center text-sm text-amber-100/60">
          <p className="mb-1">
            Built on Base blockchain 🔵
          </p>
          <p>
            Submitted for Seedify Vibe Coins Hackathon
          </p>
        </div>
      </footer>
    </div>
  );
}
