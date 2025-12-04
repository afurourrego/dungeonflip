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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="border-b border-purple-500/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl">⚔️</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              DungeonFlip
            </h1>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/leaderboard" className="hover:text-purple-400 transition">
              🏆 Leaderboard
            </Link>
            <ConnectButton />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-6xl font-bold mb-6">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Explore. Battle. Earn.
          </span>
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          A Web3 dungeon crawler on Base blockchain. Battle monsters, collect gems, and compete for weekly prizes!
        </p>

{!mounted ? (
          <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-8 max-w-md mx-auto">
            <p className="text-gray-300 mb-4">Loading...</p>
          </div>
        ) : !isConnected ? (
          <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-8 max-w-md mx-auto">
            <p className="text-gray-300 mb-4">Connect your wallet to start playing</p>
            <ConnectButton />
          </div>
        ) : !hasNFT ? (
          <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-8 max-w-md mx-auto">
            <p className="text-gray-300 mb-4">
              You need an Aventurer NFT to play. Mint one for free (just gas)!
            </p>
            <Link
              href="/mint"
              className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-lg transition"
            >
              🎨 Mint Aventurer NFT
            </Link>
          </div>
        ) : (
          <Link
            href="/game"
            className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-12 rounded-lg text-xl transition transform hover:scale-105"
          >
            ⚔️ Start Playing
          </Link>
        )}

        {totalSupply !== undefined && totalSupply !== null && (
          <p className="mt-4 text-gray-400">
            {totalSupply.toString()} Aventurers minted
          </p>
        )}
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800/50 border border-purple-500/30 rounded-lg p-6">
            <div className="text-4xl mb-4">🎮</div>
            <h3 className="text-xl font-bold mb-2">Dungeon Crawler Gameplay</h3>
            <p className="text-gray-400">
              Navigate through rooms, battle monsters, collect treasures, and avoid traps. Each run is unique!
            </p>
          </div>

          <div className="bg-gray-800/50 border border-purple-500/30 rounded-lg p-6">
            <div className="text-4xl mb-4">💎</div>
            <h3 className="text-xl font-bold mb-2">Collect Gems</h3>
            <p className="text-gray-400">
              Gather gems during your dungeon runs. The more gems you collect, the higher you rank on the leaderboard!
            </p>
          </div>

          <div className="bg-gray-800/50 border border-purple-500/30 rounded-lg p-6">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold mb-2">Weekly Prizes</h3>
            <p className="text-gray-400">
              Top 10 players share {FEE_DISTRIBUTION.REWARDS_POOL}% of entry fees every week. First place gets {PRIZE_DISTRIBUTION[0]}% of the prize pool!
            </p>
          </div>
        </div>
      </section>

      {/* How to Play */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">How to Play</h3>
        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              1
            </div>
            <h4 className="font-bold mb-2">Mint NFT</h4>
            <p className="text-sm text-gray-400">Get your Aventurer NFT with unique stats (ATK, DEF, HP)</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              2
            </div>
            <h4 className="font-bold mb-2">Pay Entry Fee</h4>
            <p className="text-sm text-gray-400">Pay {GAME_CONFIG.ENTRY_FEE} ETH to start a dungeon run</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              3
            </div>
            <h4 className="font-bold mb-2">Explore Dungeon</h4>
            <p className="text-sm text-gray-400">Choose cards, battle monsters, collect gems, and survive</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              4
            </div>
            <h4 className="font-bold mb-2">Win Prizes</h4>
            <p className="text-sm text-gray-400">Rank in top 10 to win weekly ETH prizes</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gray-800/50 border border-purple-500/30 rounded-lg p-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">Game Economics</h3>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-purple-400">{FEE_DISTRIBUTION.REWARDS_POOL}%</p>
              <p className="text-gray-400 mt-2">Weekly Rewards Pool</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-400">{GAME_CONFIG.ENTRY_FEE} ETH</p>
              <p className="text-gray-400 mt-2">Entry Fee per Run</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-400">Top 10</p>
              <p className="text-gray-400 mt-2">Winners Every Week</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/30 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-gray-400">
          <p className="mb-2">Built on Base blockchain 🔵</p>
          <p className="text-sm">
            Submitted for Seedify Vibe Coins Hackathon
          </p>
        </div>
      </footer>
    </div>
  );
}
