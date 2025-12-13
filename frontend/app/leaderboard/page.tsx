'use client';

import Link from 'next/link';
import { useAccount } from 'wagmi';
import { usePlayerProgress, usePlayerRank, useTopPlayers } from '@/hooks/useLeaderboard';
import { PRIZE_DISTRIBUTION } from '@/lib/constants';
import { Header } from '@/components/Header';
import { useRewardsHistory } from '@/hooks/useRewardsHistory';
import { formatEther } from 'viem';

export default function LeaderboardPage() {
  const { address } = useAccount();
  const { data: topPlayers, isLoading } = useTopPlayers();
  const { data: playerProgress } = usePlayerProgress(address);
  const { data: playerRank } = usePlayerRank(address);
  const { distributions, isLoading: isLoadingHistory } = useRewardsHistory();

  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    }).format(new Date(timestamp * 1000));
  };

  return (
    <div className="min-h-screen relative">
      <Header />

      <main className="container mx-auto px-4 py-12 space-y-10">
        <h2 className="text-4xl font-bold text-center">
          <span className="text-white">Leaderboard</span>
        </h2>

        {address && playerProgress && (
          <div className="max-w-4xl mx-auto card rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-white">Your Stats</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-dungeon-bg-darker rounded-lg p-4 text-center border border-amber-600/60">
                <div className="text-2xl font-bold text-white">
                  {playerRank !== undefined && playerRank !== null ? `#${playerRank.toString()}` : 'Unranked'}
                </div>
                <div className="text-sm text-white/60">Rank</div>
              </div>
              <div className="bg-dungeon-bg-darker rounded-lg p-4 text-center border border-amber-600/60">
                <div className="text-2xl font-bold text-white">
                  {playerProgress?.weeklyScore?.toString() || '0'}
                </div>
                <div className="text-sm text-white/60">Weekly Score</div>
              </div>
              <div className="bg-dungeon-bg-darker rounded-lg p-4 text-center border border-amber-600/60">
                <div className="text-2xl font-bold text-white">
                  {playerProgress?.totalScore?.toString() || '0'}
                </div>
                <div className="text-sm text-white/60">Total Score</div>
              </div>
              <div className="bg-dungeon-bg-darker rounded-lg p-4 text-center border border-amber-600/60">
                <div className="text-2xl font-bold text-white">
                  {playerProgress?.gamesPlayed?.toString() || '0'}
                </div>
                <div className="text-sm text-white/60">Games Played</div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-8">
          <div className="card rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-dungeon-bg-darker p-4 border-b border-amber-600/60">
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
              <div className="divide-y divide-amber-600/50">
                {topPlayers.map((entry, index) => {
                  const rank = index + 1;
                  const prizePercentage = PRIZE_DISTRIBUTION[index] || 0;
                  const isCurrentUser = address && entry.player.toLowerCase() === address.toLowerCase();

                  return (
                    <div
                      key={entry.player}
                      className={`p-4 flex items-center gap-4 ${
                        isCurrentUser ? 'bg-amber-700/20' : 'hover:bg-dungeon-bg-darker'
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
                            <span className="ml-2 text-xs bg-dungeon-accent-bronze px-2 py-1 rounded">YOU</span>
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

          <div className="card rounded-2xl p-6 shadow-2xl">
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

          {/* Rewards History Section */}
          <div className="card rounded-2xl p-6 shadow-2xl">
            <h4 className="text-lg font-bold mb-4 text-center text-white">🏆 Rewards History</h4>

            {isLoadingHistory ? (
              <div className="text-center text-white/60 py-8">Loading history...</div>
            ) : distributions.length === 0 ? (
              <div className="text-center text-white/60 py-8">
                <p>No rewards distributed yet.</p>
                <p className="text-sm mt-2">First distribution happens at the end of the first week!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {distributions.map((distribution) => (
                  <div key={distribution.week} className="bg-dungeon-bg-darker rounded-lg p-4 border border-amber-600/40">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <span className="font-bold text-dungeon-accent-gold">Week {distribution.week}</span>
                        <span className="text-xs text-white/50 ml-3">{formatDate(distribution.timestamp)}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-dungeon-accent-amber">
                          {formatEther(distribution.totalDistributed)} ETH
                        </div>
                        <div className="text-xs text-white/50">Total Distributed</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                      {distribution.winners.slice(0, 10).map((winner, index) => (
                        <div key={index} className="bg-black/30 rounded px-2 py-1 flex justify-between items-center">
                          <span className="text-white/70">#{index + 1}</span>
                          <span className="text-dungeon-accent-gold font-mono">
                            {shortenAddress(winner)}
                          </span>
                          <span className="text-white/60">
                            {formatEther(distribution.amounts[index]).substring(0, 6)} ETH
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="royal-board p-6 text-center">
            <p className="text-sm text-white/70 mb-3">
              Flip, survive and climb. Every run increases your chance to claim the treasure pool.
            </p>
            <Link
              href="/game"
              className="inline-block bg-gradient-to-r from-dungeon-accent-gold to-dungeon-accent-amber hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3 px-8 rounded-lg transition transform hover:scale-105"
            >
              ⚔️ Play Now and Climb the Ranks!
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
