'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useNFT, useNFTBalance, useNFTOwnerTokens, useAventurerStats } from '@/hooks/useNFT';
import { useState, useEffect } from 'react';

export default function MintPage() {
  const { address, isConnected } = useAccount();
  const { mintAventurer, isPending, isConfirming, isConfirmed, error } = useNFT();
  const { data: nftBalance, refetch: refetchBalance } = useNFTBalance(address);
  const { data: firstTokenId } = useNFTOwnerTokens(address);
  const { data: stats } = useAventurerStats(firstTokenId);
  
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isConfirmed) {
      setShowSuccess(true);
      // Refetch data after minting
      setTimeout(() => {
        refetchBalance();
        // Stats will auto-refetch when firstTokenId changes
      }, 2000);
    }
  }, [isConfirmed, refetchBalance]);

  const hasNFT = nftBalance && Number(nftBalance) > 0;

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
            <Link href="/leaderboard" className="hover:text-purple-400 transition">
              🏆 Leaderboard
            </Link>
            <ConnectButton />
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-8">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Mint Your Aventurer
            </span>
          </h2>

          {!isConnected ? (
            <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-8 text-center">
              <p className="text-gray-300 mb-4">Connect your wallet to mint an Aventurer NFT</p>
              <ConnectButton />
            </div>
          ) : hasNFT && !showSuccess ? (
            <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-green-400 mb-4">✅ You already have an Aventurer!</h3>
              
              {stats && firstTokenId !== undefined && (
                <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
                  <h4 className="text-lg font-bold mb-4">Your Aventurer Stats (Token #{firstTokenId.toString()})</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-400">⚔️ {stats.atk.toString()}</div>
                      <div className="text-sm text-gray-400">Attack</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400">🛡️ {stats.def.toString()}</div>
                      <div className="text-sm text-gray-400">Defense</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400">❤️ {stats.hp.toString()}</div>
                      <div className="text-sm text-gray-400">Health</div>
                    </div>
                  </div>
                </div>
              )}

              <Link
                href="/game"
                className="block w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-lg text-center transition"
              >
                ⚔️ Start Playing
              </Link>
            </div>
          ) : (
            <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-8">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🧙‍♂️</div>
                <h3 className="text-2xl font-bold mb-4">Free Aventurer NFT</h3>
                <p className="text-gray-300 mb-6">
                  Each Aventurer has unique randomized stats: Attack (ATK), Defense (DEF), and Health Points (HP).
                  These stats will determine your success in the dungeon!
                </p>
                
                <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                  <h4 className="font-bold mb-3">Possible Stats Ranges:</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-red-400 font-bold">⚔️ ATK</div>
                      <div className="text-gray-400">1-2</div>
                    </div>
                    <div>
                      <div className="text-blue-400 font-bold">🛡️ DEF</div>
                      <div className="text-gray-400">1-2</div>
                    </div>
                    <div>
                      <div className="text-green-400 font-bold">❤️ HP</div>
                      <div className="text-gray-400">4-6</div>
                    </div>
                  </div>
                </div>

                {showSuccess && isConfirmed && (
                  <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-6 mb-6">
                    <h4 className="text-xl font-bold text-green-400 mb-2">🎉 Minting Successful!</h4>
                    <p className="text-gray-300 mb-4">Your Aventurer NFT has been minted!</p>
                    {stats && firstTokenId !== undefined && (
                      <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                        <h5 className="font-bold mb-3">Your Aventurer Stats (Token #{firstTokenId.toString()})</h5>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-400">⚔️ {stats.atk.toString()}</div>
                            <div className="text-xs text-gray-400">Attack</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-400">🛡️ {stats.def.toString()}</div>
                            <div className="text-xs text-gray-400">Defense</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-400">❤️ {stats.hp.toString()}</div>
                            <div className="text-xs text-gray-400">Health</div>
                          </div>
                        </div>
                      </div>
                    )}
                    <Link
                      href="/game"
                      className="block w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-lg text-center transition"
                    >
                      ⚔️ Start Playing
                    </Link>
                  </div>
                )}

                {!showSuccess && (
                  <button
                    onClick={() => mintAventurer()}
                    disabled={isPending || isConfirming}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-lg text-xl transition transform hover:scale-105 disabled:transform-none"
                  >
                    {isPending ? '⏳ Confirm in Wallet...' : isConfirming ? '⏳ Minting...' : '🎨 Mint Aventurer (Free + Gas)'}
                  </button>
                )}

                {error && (
                  <div className="mt-4 bg-red-900/30 border border-red-500/50 rounded-lg p-4">
                    <p className="text-red-400 text-sm">
                      Error: {error.message}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-purple-500/30 pt-6">
                <h4 className="font-bold mb-3 text-center">Why do I need an Aventurer?</h4>
                <ul className="text-sm text-gray-400 space-y-2">
                  <li>✅ Required to play DungeonFlip</li>
                  <li>✅ Unique stats affect your dungeon performance</li>
                  <li>✅ Higher stats = better chance to survive and collect gems</li>
                  <li>✅ Completely free (just pay gas fees)</li>
                  <li>✅ One per wallet is enough to play</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
