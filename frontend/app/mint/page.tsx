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

            {/* Center: Run Counter (shows balance for mint page) */}
            <div className="flex justify-center">
              <div className="run-counter">
                <div className="text-xs text-amber-400/80 uppercase tracking-wider mb-1">Your NFTs</div>
                <div className="text-3xl font-bold dot-matrix text-dungeon-gold">
                  {nftBalance !== undefined ? Number(nftBalance).toString() : '0'}
                </div>
              </div>
            </div>

            {/* Right: Nav + Wallet */}
            <nav className="flex items-center gap-4 justify-end">
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
            <div className="royal-board p-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-3xl">✅</span>
                <h3 className="text-2xl font-bold text-green-400">You already have an Aventurer!</h3>
              </div>
              <div className="royal-divider mx-auto mb-6" />
              
              {stats && firstTokenId !== undefined && (
                <div className="bg-gray-900/70 backdrop-blur-sm rounded-lg p-6 mb-6 border border-amber-800/40">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="royal-dot" />
                    <h4 className="text-lg font-bold text-amber-300">
                      Your Aventurer Stats (Token #{firstTokenId.toString()})
                    </h4>
                    <div className="royal-dot" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="stat-box">
                      <div className="text-xs text-gray-400">Attack</div>
                      <div className="text-3xl font-bold text-red-400 dot-matrix">⚔️ {stats.atk.toString()}</div>
                    </div>
                    <div className="stat-box">
                      <div className="text-xs text-gray-400">Defense</div>
                      <div className="text-3xl font-bold text-blue-400 dot-matrix">🛡️ {stats.def.toString()}</div>
                    </div>
                    <div className="stat-box">
                      <div className="text-xs text-gray-400">Health</div>
                      <div className="text-3xl font-bold text-green-400 dot-matrix">❤️ {stats.hp.toString()}</div>
                    </div>
                  </div>
                </div>
              )}

              <Link
                href="/game"
                className="block w-full bg-gradient-to-r from-dungeon-purple to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-bold py-3 px-8 rounded-lg text-center transition transform hover:scale-105 shadow-lg hover:shadow-purple-500/50"
              >
                ⚔️ Start Playing
              </Link>
            </div>
          ) : (
            <div className="royal-board p-8">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4 animate-bounce-slow">🧙‍♂️</div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="royal-dot" />
                  <h3 className="text-2xl font-bold text-amber-300">Free Aventurer NFT</h3>
                  <div className="royal-dot" />
                </div>
                <div className="royal-divider mx-auto mb-4" />
                <p className="text-amber-100/80 mb-6">
                  Each Aventurer has unique randomized stats: Attack (ATK), Defense (DEF), and Health Points (HP).
                  These stats will determine your success in the dungeon!
                </p>
                
                <div className="bg-gray-900/70 backdrop-blur-sm rounded-lg p-4 mb-6 border border-amber-800/40">
                  <h4 className="font-bold mb-3 text-amber-300">Possible Stats Ranges:</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="stat-box">
                      <div className="text-red-400 font-bold">⚔️ ATK</div>
                      <div className="text-amber-300/70 dot-matrix">1-2</div>
                    </div>
                    <div className="stat-box">
                      <div className="text-blue-400 font-bold">🛡️ DEF</div>
                      <div className="text-amber-300/70 dot-matrix">1-2</div>
                    </div>
                    <div className="stat-box">
                      <div className="text-green-400 font-bold">❤️ HP</div>
                      <div className="text-amber-300/70 dot-matrix">4-6</div>
                    </div>
                  </div>
                </div>

                {showSuccess && isConfirmed && (
                  <div className="bg-green-900/30 border-2 border-green-500 rounded-lg p-6 mb-6 shadow-lg shadow-green-500/30">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-2xl animate-bounce-slow">🎉</span>
                      <h4 className="text-xl font-bold text-green-400">Minting Successful!</h4>
                      <span className="text-2xl animate-bounce-slow">🎉</span>
                    </div>
                    <p className="text-amber-100/80 mb-4 text-center">Your Aventurer NFT has been minted!</p>
                    {stats && firstTokenId !== undefined && (
                      <div className="bg-gray-900/70 backdrop-blur-sm rounded-lg p-4 mb-4 border border-amber-800/40">
                        <h5 className="font-bold mb-3 text-amber-300 text-center">
                          Your Aventurer Stats (Token #{firstTokenId.toString()})
                        </h5>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="stat-box">
                            <div className="text-xs text-gray-400">Attack</div>
                            <div className="text-2xl font-bold text-red-400 dot-matrix">⚔️ {stats.atk.toString()}</div>
                          </div>
                          <div className="stat-box">
                            <div className="text-xs text-gray-400">Defense</div>
                            <div className="text-2xl font-bold text-blue-400 dot-matrix">🛡️ {stats.def.toString()}</div>
                          </div>
                          <div className="stat-box">
                            <div className="text-xs text-gray-400">Health</div>
                            <div className="text-2xl font-bold text-green-400 dot-matrix">❤️ {stats.hp.toString()}</div>
                          </div>
                        </div>
                      </div>
                    )}
                    <Link
                      href="/game"
                      className="block w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-8 rounded-lg text-center transition transform hover:scale-105 shadow-lg hover:shadow-green-500/50"
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

              <div className="border-t border-amber-700/30 pt-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="royal-dot" />
                  <h4 className="font-bold text-center text-amber-300">Why do I need an Aventurer?</h4>
                  <div className="royal-dot" />
                </div>
                <ul className="text-sm text-amber-100/70 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-dungeon-gold">⚔️</span>
                    <span>Required to play DungeonFlip</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-dungeon-gold">📊</span>
                    <span>Unique stats affect your dungeon performance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-dungeon-gold">💎</span>
                    <span>Higher stats = better chance to survive and collect gems</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-dungeon-gold">🆓</span>
                    <span>Completely free (just pay gas fees)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-dungeon-gold">👤</span>
                    <span>One per wallet is enough to play</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
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
