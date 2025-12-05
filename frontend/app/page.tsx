'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import Image from 'next/image';
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
      <header className="border-b border-amber-700/30 backdrop-blur-md bg-gray-900/50 relative z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            {/* Left: Logo */}
            <Link href="/" className="flex items-center gap-2 justify-start">
              <span className="text-3xl drop-shadow-lg">⚔️</span>
              <div>
                <h1 className="text-2xl font-bold text-dungeon-gold">
                  Dungeon Flip
                </h1>
                <div className="text-[10px] text-amber-400/60 -mt-1">Powered by Base</div>
              </div>
            </Link>

            {/* Center: Run Counter */}
            <div className="flex justify-center">
              <div className="run-counter">
                <div className="text-xs text-amber-400/80 uppercase tracking-wider mb-1">Total Aventurers</div>
                <div className="text-3xl font-bold dot-matrix text-dungeon-gold">
                  {totalSupply !== undefined && totalSupply !== null ? totalSupply.toString() : '0'}
                </div>
              </div>
            </div>

            {/* Right: Nav + Wallet */}
            <nav className="flex items-center gap-4 justify-end">
              <Link 
                href="/nfts" 
                className="text-amber-300/80 hover:text-dungeon-gold transition font-medium"
              >
                💎 NFTs
              </Link>
              <Link 
                href="/leaderboard" 
                className="text-amber-300/80 hover:text-dungeon-gold transition font-medium"
              >
                🏆 Leaderboard
              </Link>
              <ConnectButton />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Card */}
          <div className="royal-board p-8 mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-4xl animate-bounce-slow">⚔️</span>
              <h2 className="text-4xl font-bold text-dungeon-gold">Welcome to Dungeon Flip!</h2>
            </div>
            <div className="royal-divider mx-auto mb-6" />
            <p className="text-xl text-amber-100/80 mb-8">
              A Web3 dungeon crawler on Base blockchain. Battle monsters, collect gems, and compete for weekly prizes!
            </p>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-gray-900/50 rounded-lg border border-amber-800/30">
                <Image 
                  src="/cards/reverse.png" 
                  alt="Flip Cards" 
                  width={80} 
                  height={100}
                  className="mx-auto mb-3"
                />
                <h3 className="font-bold text-amber-300 mb-2">Flip Cards</h3>
                <p className="text-sm text-amber-100/70">Choose wisely from 4 face-down cards each room</p>
              </div>
              
              <div className="text-center p-6 bg-gray-900/50 rounded-lg border border-amber-800/30">
                <Image 
                  src="/cards/monster.png" 
                  alt="Battle Monsters" 
                  width={80} 
                  height={100}
                  className="mx-auto mb-3"
                />
                <h3 className="font-bold text-amber-300 mb-2">Battle Monsters</h3>
                <p className="text-sm text-amber-100/70">Fight enemies with your aventurer's unique stats</p>
              </div>
              
              <div className="text-center p-6 bg-gray-900/50 rounded-lg border border-amber-800/30">
                <Image 
                  src="/cards/gem.png" 
                  alt="Earn Rewards" 
                  width={80} 
                  height={100}
                  className="mx-auto mb-3"
                />
                <h3 className="font-bold text-amber-300 mb-2">Earn Rewards</h3>
                <p className="text-sm text-amber-100/70">Collect gems and climb the leaderboard for prizes</p>
              </div>
            </div>

            {/* CTA Buttons */}
            {!mounted ? (
              <div className="text-center py-4">
                <p className="text-amber-100/70">Loading...</p>
              </div>
            ) : !isConnected ? (
              <div className="text-center">
                <p className="text-amber-100/80 mb-4">Connect your wallet to start playing</p>
                <ConnectButton />
              </div>
            ) : !hasNFT ? (
              <div className="text-center">
                <p className="text-amber-100/80 mb-4">
                  You need an Aventurer NFT to play. Mint one for free (just gas)!
                </p>
                <Link
                  href="/mint"
                  className="inline-block bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-8 rounded-lg transition transform hover:scale-105 shadow-lg"
                >
                  🎨 Mint Aventurer NFT
                </Link>
              </div>
            ) : (
              <div className="text-center">
                <Link
                  href="/game"
                  className="inline-block bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-12 rounded-lg text-xl transition transform hover:scale-105 shadow-lg"
                >
                  ⚔️ Start Playing
                </Link>
              </div>
            )}
          </div>

          {/* Weekly Treasure Pool */}
          <div className="royal-board p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-4xl animate-bounce-slow">💰</span>
              <h3 className="text-3xl font-bold text-dungeon-gold">Weekly Treasure Pool</h3>
            </div>
            <div className="royal-divider mx-auto mb-6" />
            
            <div className="bg-gradient-to-b from-amber-900/40 to-gray-900/60 rounded-lg p-6 mb-6 border-2 border-amber-600/50">
              <div className="text-sm text-amber-300/80 mb-2">Current Prize Pool</div>
              <div className="text-5xl font-bold text-dungeon-gold dot-matrix mb-2 animate-shine">
                ETH {GAME_CONFIG.ENTRY_FEE}
              </div>
              <div className="text-xs text-amber-100/60">70% of all entry fees</div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-4xl mb-2 animate-bounce-slow">🥇</div>
                <div className="text-2xl font-bold text-yellow-400 dot-matrix">{PRIZE_DISTRIBUTION[0]}%</div>
                <div className="text-xs text-amber-100/60">1st Place</div>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🥈</div>
                <div className="text-2xl font-bold text-gray-400 dot-matrix">{PRIZE_DISTRIBUTION[1]}%</div>
                <div className="text-xs text-amber-100/60">2nd Place</div>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🥉</div>
                <div className="text-2xl font-bold text-orange-400 dot-matrix">{PRIZE_DISTRIBUTION[2]}%</div>
                <div className="text-xs text-amber-100/60">3rd Place</div>
              </div>
            </div>

            <p className="text-amber-100/70 text-sm">
              Top 10 players win prizes every week • Distributed automatically every Friday
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-700/30 mt-20 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-amber-100/60 text-sm">
            © 2025 DungeonFlip • Built on Base • Play to Earn
          </p>
        </div>
      </footer>
    </div>
  );
}
