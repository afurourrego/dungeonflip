'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { useWalletNFTs } from '@/hooks/useNFT';
import { BURN_ADDRESSES, CONTRACTS, CURRENT_NETWORK } from '@/lib/constants';
import AventurerNFTABI from '@/lib/contracts/AventurerNFT.json';
import { getAventurerClass } from '@/lib/aventurer';

const formatDate = (timestamp?: bigint) => {
  if (!timestamp) return 'ƒ?"';
  const date = new Date(Number(timestamp) * 1000);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(date);
};

export default function NFTsPage() {
  const { address, isConnected, chain } = useAccount();
  const { data: nfts, isLoading, error, refresh } = useWalletNFTs(address);
  const { writeContract, data: hash, isPending, error: txError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const [selectedToken, setSelectedToken] = useState<bigint | null>(null);
  const [mounted, setMounted] = useState(false);

  const burnAddress = BURN_ADDRESSES.BASE_SEPOLIA;
  const isWrongNetwork = chain && chain.id !== CURRENT_NETWORK.id;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isSuccess) {
      setSelectedToken(null);
      refresh();
    }
  }, [isSuccess, refresh]);

  const handleSendToBurn = async (tokenId: bigint) => {
    if (!address) return;
    if (isWrongNetwork) {
      alert(`Switch to ${CURRENT_NETWORK.name} to burn your NFTs.`);
      return;
    }

    setSelectedToken(tokenId);

    try {
      await writeContract({
        address: CONTRACTS.AVENTURER_NFT,
        abi: AventurerNFTABI.abi,
        functionName: 'safeTransferFrom',
        args: [address, burnAddress, tokenId],
      });
    } catch (err) {
      console.error('Error sending NFT to burn:', err);
      setSelectedToken(null);
    }
  };

  return (
    <div className="min-h-screen relative">
      <header className="border-b border-purple-700/40 backdrop-blur-md bg-black/80 relative z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <Link href="/" className="flex items-center gap-2 justify-start">
              <span className="text-3xl drop-shadow-lg">⚔</span>
              <div>
                <h1 className="text-2xl font-bold text-white">DungeonFlip</h1>
                <div className="text-[10px] text-white/60 -mt-1">NFT Vault</div>
              </div>
            </Link>

            <div className="text-center">
              <p className="text-xs text-white/60 uppercase tracking-[0.3em]">Base Sepolia</p>
              <p className="text-white font-bold text-lg">NFT Collection</p>
            </div>

            <nav className="flex items-center gap-4 justify-end">
              <Link href="/game" className="text-white/80 hover:text-dungeon-gold transition font-medium">
                Game
              </Link>
              <Link href="/leaderboard" className="text-white/80 hover:text-dungeon-gold transition font-medium">
                Leaderboard
              </Link>
              <ConnectButton />
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="bg-[#0e0b1f]/90 border border-purple-700/60 rounded-2xl p-8 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Your Aventurers</h2>
                <p className="text-white/70 text-sm">
                  View every NFT in your connected wallet and handle quick transfers or burns.
                </p>
              </div>
              <div className="bg-[#16122c] border border-purple-700/60 rounded-lg p-4 text-center">
                <p className="text-xs text-white/70 uppercase tracking-widest mb-1">Burn Address</p>
                <p className="font-mono text-sm text-white break-all">{burnAddress}</p>
                <p className="text-[10px] text-white/50 mt-1">All transfers are irreversible</p>
              </div>
            </div>

            {!mounted ? (
              <div className="text-center py-12">
                <p className="text-white/70">Loading...</p>
              </div>
            ) : !isConnected ? (
              <div className="text-center py-12">
                <p className="text-white/80 mb-4">Connect your wallet to see your Aventurers.</p>
                <ConnectButton />
              </div>
            ) : isWrongNetwork ? (
              <div className="bg-purple-900/40 border border-purple-700/60 rounded-lg p-6 text-center">
                <p className="text-white font-semibold mb-2">Wrong network</p>
                <p className="text-white/70 text-sm">Switch to {CURRENT_NETWORK.name} to manage your NFTs.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {isLoading && <div className="text-center text-white/70">Loading NFTs...</div>}

                {error && (
                  <div className="bg-red-900/40 border border-red-700/60 rounded-lg p-4 text-center text-red-200">
                    Failed to load your NFTs: {error.message}
                  </div>
                )}

                {txError && (
                  <div className="bg-red-900/40 border border-red-700/60 rounded-lg p-4 text-center text-red-200">
                    Transaction error: {txError.message}
                  </div>
                )}

                {!isLoading && nfts.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-white/80 mb-4">You do not own any Aventurers yet.</p>
                    <Link
                      href="/mint"
                      className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition shadow-lg"
                    >
                      Free mint
                    </Link>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {nfts.map((nft) => {
                    const nftClass = getAventurerClass(nft.stats);
                    return (
                      <div
                        key={nft.tokenId.toString()}
                        className="bg-[#16122c] border border-purple-700/60 rounded-xl p-6 flex flex-col gap-4 shadow-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-white/70">Token ID</p>
                            <p className="text-2xl font-bold text-white">#{nft.tokenId.toString()}</p>
                            {nftClass && (
                              <span
                                className={`inline-flex items-center gap-1 mt-1 px-3 py-1 rounded-full text-xs font-semibold text-black bg-gradient-to-r ${nftClass.accent}`}
                              >
                                {nftClass.name}
                              </span>
                            )}
                          </div>
                          <Image src="/avatars/adventurer-idle.png" alt="Aventurer" width={64} height={64} />
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="bg-[#1a1633] rounded-lg p-3">
                            <p className="text-xs text-white/70">ATK</p>
                            <p className="text-2xl font-bold text-white">{nft.stats.atk.toString()}</p>
                          </div>
                          <div className="bg-[#1a1633] rounded-lg p-3">
                            <p className="text-xs text-white/70">DEF</p>
                            <p className="text-2xl font-bold text-white">{nft.stats.def.toString()}</p>
                          </div>
                          <div className="bg-[#1a1633] rounded-lg p-3">
                            <p className="text-xs text-white/70">HP</p>
                            <p className="text-2xl font-bold text-white">{nft.stats.hp.toString()}</p>
                          </div>
                        </div>

                        <div className="text-xs text-white/70">
                          Minted: {formatDate(nft.stats.mintedAt)}
                          {nftClass && (
                            <span className="ml-2 text-white/80 font-semibold">· Clase {nftClass.name}</span>
                          )}
                        </div>

                        <button
                          onClick={() => handleSendToBurn(nft.tokenId)}
                          disabled={isPending || isConfirming || selectedToken === nft.tokenId}
                          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition"
                        >
                          {selectedToken === nft.tokenId && (isPending || isConfirming)
                            ? 'Sending...'
                            : 'Send to burn'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
