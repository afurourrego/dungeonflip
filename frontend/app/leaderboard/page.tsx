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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="border-b border-purple-500/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">⚔️</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              DungeonFlip
            </h1>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/game" className="hover:text-purple-400 transition">
              🎮 Play
            </Link>
            <ConnectButton />
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-center mb-12">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            🏆 Leaderboard
          </span>
        </h2>

        {/* Player's Stats */}
        {address && playerProgress && (
          <div className="max-w-4xl mx-auto mb-8 bg-purple-900/30 border border-purple-500/50 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Your Stats</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {playerRank !== undefined && playerRank !== null ? `#${playerRank.toString()}` : 'Unranked'}
                </div>
                <div className="text-sm text-gray-400">Rank</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {playerProgress?.weeklyScore?.toString() || '0'}
                </div>
                <div className="text-sm text-gray-400">Weekly Score</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {playerProgress?.totalScore?.toString() || '0'}
                </div>
                <div className="text-sm text-gray-400">Total Score</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {playerProgress?.gamesPlayed?.toString() || '0'}
                </div>
                <div className="text-sm text-gray-400">Games Played</div>
              </div>
            </div>
          </div>
        )}

        {/* Top 10 Players */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-4">
              <h3 className="text-xl font-bold text-center">Weekly Top 10 Players</h3>
              <p className="text-sm text-center text-yellow-100 mt-1">
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
              <div className="divide-y divide-purple-500/30">
                {topPlayers.map((entry, index) => {
                  const rank = index + 1;
                  const prizePercentage = PRIZE_DISTRIBUTION[index] || 0;
                  const isCurrentUser = address && entry.player.toLowerCase() === address.toLowerCase();

                  return (
                    <div
                      key={entry.player}
                      className={`p-4 flex items-center gap-4 ${
                        isCurrentUser ? 'bg-purple-700/30' : 'hover:bg-gray-800/30'
                      } transition`}
                    >
                      {/* Rank */}
                      <div className="w-16 text-center">
                        {rank === 1 && <span className="text-4xl">🥇</span>}
                        {rank === 2 && <span className="text-4xl">🥈</span>}
                        {rank === 3 && <span className="text-4xl">🥉</span>}
                        {rank > 3 && (
                          <span className="text-2xl font-bold text-gray-400">#{rank}</span>
                        )}
                      </div>

                      {/* Player Address */}
                      <div className="flex-1">
                        <div className="font-mono text-lg">
                          {shortenAddress(entry.player)}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs bg-purple-500 px-2 py-1 rounded">YOU</span>
                          )}
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-400">
                          {entry.score.toString()} 💎
                        </div>
                        <div className="text-sm text-gray-400">
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
          <div className="mt-8 bg-gray-800/50 border border-purple-500/30 rounded-lg p-6">
            <h4 className="text-lg font-bold mb-4 text-center">💰 Prize Distribution</h4>
            <div className="grid grid-cols-5 gap-3 text-sm">
              {PRIZE_DISTRIBUTION.map((percentage, index) => (
                <div key={index} className="text-center">
                  <div className="font-bold text-purple-400">#{index + 1}</div>
                  <div className="text-gray-400">{percentage}%</div>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-400 text-sm mt-4">
              Prizes are automatically distributed every week to the top 10 players
            </p>
          </div>

          {/* Call to Action */}
          <div className="mt-8 text-center">
            <Link
              href="/game"
              className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-lg transition transform hover:scale-105"
            >
              ⚔️ Play Now and Climb the Ranks!
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
