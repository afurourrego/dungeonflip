'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useTopPlayers, usePlayerProgress, usePlayerRank } from '@/hooks/useLeaderboard';
import { PRIZE_DISTRIBUTION } from '@/lib/constants';
import { formatEther } from 'viem';

export default function LeaderboardPage() {
  const { address } = useAccount();
  const { data: topPlayers, isLoading } = useTopPlayers();
  const { data: playerProgress } = usePlayerProgress(address);
  const { data: playerRank } = usePlayerRank(address);

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

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

            {/* Center: Trophy Icon */}
            <div className="flex justify-center">
              <div className="text-6xl animate-bounce-slow drop-shadow-lg">🏆</div>
            </div>

            {/* Right: Nav + Wallet */}
            <nav className="flex items-center gap-4 justify-end">
              <Link 
                href="/game" 
                className="text-amber-300/80 hover:text-dungeon-gold transition font-medium"
              >
                🎮 Play Game
              </Link>
              <ConnectButton />
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-dungeon-gold mb-2">
            Weekly Leaderboard
          </h2>
          <p className="text-amber-100/70">Compete for weekly prizes • Reset every Friday</p>
        </div>

        {/* Player's Stats */}
        {address && playerProgress && (
          <div className="max-w-4xl mx-auto mb-8 royal-board p-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="royal-dot" />
              <h3 className="text-xl font-bold text-amber-300">Your Stats</h3>
              <div className="royal-dot" />
            </div>
            <div className="royal-divider mx-auto mb-4" />
            <div className="grid md:grid-cols-4 gap-4">
              <div className="stat-box">
                <div className="text-xs text-gray-400">Rank</div>
                <div className="text-2xl font-bold text-dungeon-gold dot-matrix">
                  {playerRank !== undefined && playerRank !== null ? `#${playerRank.toString()}` : 'N/A'}
                </div>
              </div>
              <div className="stat-box">
                <div className="text-xs text-gray-400">Weekly Score</div>
                <div className="text-2xl font-bold text-purple-400 dot-matrix">
                  {playerProgress?.weeklyScore?.toString() || '0'}
                </div>
              </div>
              <div className="stat-box">
                <div className="text-xs text-gray-400">Total Score</div>
                <div className="text-2xl font-bold text-green-400 dot-matrix">
                  {playerProgress?.totalScore?.toString() || '0'}
                </div>
              </div>
              <div className="stat-box">
                <div className="text-xs text-gray-400">Games Played</div>
                <div className="text-2xl font-bold text-amber-400 dot-matrix">
                  {playerProgress?.gamesPlayed?.toString() || '0'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top 10 Players */}
        <div className="max-w-4xl mx-auto">
          <div className="royal-board overflow-hidden">
            <div className="bg-gradient-to-r from-amber-900/40 via-yellow-900/30 to-amber-900/40 border-b border-amber-500/40 p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="royal-dot" />
                <h3 className="text-xl font-bold text-center text-amber-300">Weekly Top 10 Players</h3>
                <div className="royal-dot" />
              </div>
              <p className="text-sm text-center text-amber-100/70 mt-1">
                Winners share 70% of entry fees • Prizes distributed every Friday
              </p>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-gray-400">
                <div className="animate-spin text-4xl mb-4">⏳</div>
                <p>Loading leaderboard...</p>
              </div>
            ) : !topPlayers || topPlayers.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <p className="text-4xl mb-4">🏆</p>
                <p>No players yet. Be the first to play!</p>
              </div>
            ) : (
              <div className="divide-y divide-amber-800/30">
                {topPlayers.map((entry, index) => {
                  const rank = index + 1;
                  const prizePercentage = PRIZE_DISTRIBUTION[index] || 0;
                  const isCurrentUser = address && entry.player.toLowerCase() === address.toLowerCase();

                  return (
                    <div
                      key={entry.player}
                      className={`p-4 flex items-center gap-4 transition-all duration-300 ${
                        isCurrentUser 
                          ? 'bg-gradient-to-r from-amber-600/30 to-transparent border-l-2 border-l-amber-500' 
                          : 'hover:bg-gradient-to-r hover:from-amber-900/20 hover:to-transparent'
                      }`}
                    >
                      {/* Rank */}
                      <div className="w-16 text-center">
                        {rank === 1 && <span className="text-4xl animate-bounce-slow">🥇</span>}
                        {rank === 2 && <span className="text-4xl">🥈</span>}
                        {rank === 3 && <span className="text-4xl">🥉</span>}
                        {rank > 3 && (
                          <span className="text-2xl font-bold text-amber-400 dot-matrix">#{rank}</span>
                        )}
                      </div>

                      {/* Player Address */}
                      <div className="flex-1">
                        <div className="font-mono text-lg text-amber-100">
                          {shortenAddress(entry.player)}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs bg-amber-500 text-gray-900 px-2 py-1 rounded font-bold">YOU</span>
                          )}
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-dungeon-gold dot-matrix animate-shine">
                          {entry.score.toString()} 💎
                        </div>
                        <div className="text-sm text-amber-300/60">
                          {prizePercentage}% of pool
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Prize Distribution Info */}
          <div className="mt-8 royal-board p-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-2xl animate-bounce-slow">💰</span>
              <h4 className="text-lg font-bold text-amber-300">Prize Distribution</h4>
              <span className="text-2xl animate-bounce-slow">💰</span>
            </div>
            <div className="royal-divider mx-auto mb-4" />
            <div className="grid grid-cols-5 gap-3 text-sm">
              {PRIZE_DISTRIBUTION.map((percentage, index) => (
                <div key={index} className="text-center stat-box">
                  <div className="font-bold text-dungeon-gold dot-matrix">#{index + 1}</div>
                  <div className="text-amber-300/70">{percentage}%</div>
                </div>
              ))}
            </div>
            <p className="text-center text-amber-100/70 text-sm mt-4">
              Prizes are automatically distributed every week to the top 10 players
            </p>
          </div>

          {/* Call to Action */}
          <div className="mt-8 text-center">
            <Link
              href="/game"
              className="inline-block bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-10 rounded-lg transition transform hover:scale-105 shadow-lg"
            >
              ⚔️ Play Now and Climb the Ranks!
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-700/30 mt-20 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-amber-100/60 text-sm">
            © 2024 DungeonFlip • Built on Base • Play to Earn
          </p>
        </div>
      </footer>
    </div>
  );
}
