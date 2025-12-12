'use client';

import Link from 'next/link';
import { useAccount } from 'wagmi';
import { usePlayerProgress, usePlayerRank, useTopPlayers } from '@/hooks/useLeaderboard';
import { PRIZE_DISTRIBUTION } from '@/lib/constants';
import { Header } from '@/components/Header';

export default function LeaderboardPage() {
  const { address } = useAccount();
  const { data: topPlayers, isLoading } = useTopPlayers();
  const { data: playerProgress } = usePlayerProgress(address);
  const { data: playerRank } = usePlayerRank(address);

  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="min-h-screen relative">
      <Header />

      <main className="container mx-auto px-4 py-12 space-y-10">
        <h2 className="text-4xl font-bold text-center">
          <span className="text-white">Leaderboard</span>
        </h2>

        {address && playerProgress && (
          <div className="max-w-4xl mx-auto bg-[#0e0b1f]/90 border border-purple-700/60 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-white">Your Stats</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-[#16122c] rounded-lg p-4 text-center border border-purple-700/60">
                <div className="text-2xl font-bold text-white">
                  {playerRank !== undefined && playerRank !== null ? `#${playerRank.toString()}` : 'Unranked'}
                </div>
                <div className="text-sm text-white/60">Rank</div>
              </div>
              <div className="bg-[#16122c] rounded-lg p-4 text-center border border-purple-700/60">
                <div className="text-2xl font-bold text-white">
                  {playerProgress?.weeklyScore?.toString() || '0'}
                </div>
                <div className="text-sm text-white/60">Weekly Score</div>
              </div>
              <div className="bg-[#16122c] rounded-lg p-4 text-center border border-purple-700/60">
                <div className="text-2xl font-bold text-white">
                  {playerProgress?.totalScore?.toString() || '0'}
                </div>
                <div className="text-sm text-white/60">Total Score</div>
              </div>
              <div className="bg-[#16122c] rounded-lg p-4 text-center border border-purple-700/60">
                <div className="text-2xl font-bold text-white">
                  {playerProgress?.gamesPlayed?.toString() || '0'}
                </div>
                <div className="text-sm text-white/60">Games Played</div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-[#0e0b1f]/90 border border-purple-700/60 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-[#16122c] p-4 border-b border-purple-700/60">
              <h3 className="text-xl font-bold text-center">Weekly Top 10 Players</h3>
              <p className="text-sm text-center text-white/70 mt-1">
                Winners share 70% of entry fees · Prizes distributed every Friday
              </p>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-white/60">
                <div className="animate-spin text-4xl mb-4">⏳</div>
                <p>Loading leaderboard...</p>
              </div>
            ) : !topPlayers || topPlayers.length === 0 ? (
              <div className="p-12 text-center text-white/60">
                <p className="text-4xl mb-4">🏆</p>
                <p>No players yet. Be the first to play!</p>
              </div>
            ) : (
              <div className="divide-y divide-purple-700/50">
                {topPlayers.map((entry, index) => {
                  const rank = index + 1;
                  const prizePercentage = PRIZE_DISTRIBUTION[index] || 0;
                  const isCurrentUser = address && entry.player.toLowerCase() === address.toLowerCase();

                  return (
                    <div
                      key={entry.player}
                      className={`p-4 flex items-center gap-4 ${
                        isCurrentUser ? 'bg-purple-700/20' : 'hover:bg-[#16122c]'
                      } transition`}
                    >
                      <div className="w-16 text-center">
                        {rank === 1 && <span className="text-4xl">🥇</span>}
                        {rank === 2 && <span className="text-4xl">🥈</span>}
                        {rank === 3 && <span className="text-4xl">🥉</span>}
                        {rank > 3 && <span className="text-2xl font-bold text-gray-400">#{rank}</span>}
                      </div>

                      <div className="flex-1">
                        <div className="font-mono text-lg">
                          {shortenAddress(entry.player)}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs bg-purple-600 px-2 py-1 rounded">YOU</span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                          {entry.score.toString()} pts
                        </div>
                        <div className="text-sm text-white/70">{prizePercentage}% of pool</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-[#0e0b1f]/90 border border-purple-700/60 rounded-2xl p-6 shadow-2xl">
            <h4 className="text-lg font-bold mb-4 text-center text-white">Prize Distribution</h4>
            <div className="grid grid-cols-5 gap-3 text-sm">
              {PRIZE_DISTRIBUTION.map((percentage, index) => (
                <div key={index} className="text-center">
                  <div className="font-bold text-white">#{index + 1}</div>
                  <div className="text-white/80">{percentage}%</div>
                </div>
              ))}
            </div>
            <p className="text-center text-white/70 text-sm mt-4">
              Prizes are automatically distributed every week to the top 10 players
            </p>
          </div>

          <div className="royal-board p-6 text-center">
            <p className="text-sm text-white/70 mb-3">
              Flip, survive and climb. Every run increases your chance to claim the treasure pool.
            </p>
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
