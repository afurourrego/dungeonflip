'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { useWalletNFTs } from '@/hooks/useNFT';
import { BURN_ADDRESSES, CONTRACTS, CURRENT_NETWORK } from '@/lib/constants';
import AventurerNFTABI from '@/lib/contracts/AventurerNFT.json';

const formatDate = (timestamp?: bigint) => {
  if (!timestamp) return '—';
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString();
};

export default function NFTsPage() {
  const { address, isConnected, chain } = useAccount();
  const { data: nfts, isLoading, error, refresh } = useWalletNFTs(address);
  const { writeContract, data: hash, isPending, error: txError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const [selectedToken, setSelectedToken] = useState<bigint | null>(null);

  const burnAddress = BURN_ADDRESSES.BASE_SEPOLIA;
  const isWrongNetwork = chain && chain.id !== CURRENT_NETWORK.id;

  useEffect(() => {
    if (isSuccess) {
      setSelectedToken(null);
      refresh();
    }
  }, [isSuccess, refresh]);

  const handleSendToBurn = async (tokenId: bigint) => {
    if (!address) return;
    if (isWrongNetwork) {
      alert(`Por favor cambia a ${CURRENT_NETWORK.name} para quemar tus NFTs.`);
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
      console.error('Error enviando NFT a burn:', err);
      setSelectedToken(null);
    }
  };

  return (
    <div className="min-h-screen relative">
      <header className="border-b border-amber-700/30 backdrop-blur-md bg-gray-900/50 relative z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <Link href="/" className="flex items-center gap-2 justify-start">
              <span className="text-3xl drop-shadow-lg">💎</span>
              <div>
                <h1 className="text-2xl font-bold text-dungeon-gold">Dungeon Flip</h1>
                <div className="text-[10px] text-amber-400/60 -mt-1">NFT Vault</div>
              </div>
            </Link>

            <div className="text-center">
              <p className="text-xs text-amber-300/70 uppercase tracking-[0.3em]">Base Sepolia</p>
              <p className="text-dungeon-gold font-bold text-lg">NFT Collection</p>
            </div>

            <nav className="flex items-center gap-4 justify-end">
              <Link href="/game" className="text-amber-300/80 hover:text-dungeon-gold transition font-medium">
                ⚔️ Juego
              </Link>
              <Link href="/leaderboard" className="text-amber-300/80 hover:text-dungeon-gold transition font-medium">
                🏆 Leaderboard
              </Link>
              <ConnectButton />
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="royal-board p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
              <div>
                <h2 className="text-3xl font-bold text-dungeon-gold mb-2">Tus Aventureros</h2>
                <p className="text-amber-100/80 text-sm">
                  Visualiza todos los NFTs de tu wallet conectada y gestiona transferencias o quemados rápidos en Base
                  Sepolia.
                </p>
              </div>
              <div className="bg-gray-900/60 border border-amber-700/40 rounded-lg p-4 text-center">
                <p className="text-xs text-amber-300/70 uppercase tracking-widest mb-1">Burn Address</p>
                <p className="font-mono text-sm text-amber-100/90 break-all">{burnAddress}</p>
                <p className="text-[10px] text-amber-200/60 mt-1">Todos los envíos son irreversibles</p>
              </div>
            </div>

            {!isConnected ? (
              <div className="text-center py-12">
                <p className="text-amber-100/80 mb-4">Conecta tu wallet para ver tus Aventureros.</p>
                <ConnectButton />
              </div>
            ) : isWrongNetwork ? (
              <div className="bg-amber-900/40 border border-amber-700/60 rounded-lg p-6 text-center">
                <p className="text-amber-100/80 font-semibold mb-2">Red incorrecta</p>
                <p className="text-amber-100/70 text-sm">
                  Cambia a {CURRENT_NETWORK.name} para gestionar tus NFTs.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {isLoading && (
                  <div className="text-center text-amber-100/70">Cargando NFTs...</div>
                )}

                {error && (
                  <div className="bg-red-900/40 border border-red-700/60 rounded-lg p-4 text-center text-red-200">
                    Error al cargar tus NFTs: {error.message}
                  </div>
                )}

                {txError && (
                  <div className="bg-red-900/40 border border-red-700/60 rounded-lg p-4 text-center text-red-200">
                    Error en la transacción: {txError.message}
                  </div>
                )}

                {!isLoading && nfts.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-amber-100/80 mb-4">Aún no tienes Aventureros.</p>
                    <Link
                      href="/mint"
                      className="inline-block bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-8 rounded-lg transition transform hover:scale-105 shadow-lg"
                    >
                      🎨 Mint gratis
                    </Link>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {nfts.map((nft) => (
                    <div
                      key={nft.tokenId.toString()}
                      className="bg-gray-900/50 border border-amber-800/40 rounded-xl p-6 flex flex-col gap-4 shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-amber-200/70">Token ID</p>
                          <p className="text-2xl font-bold text-dungeon-gold">#{nft.tokenId.toString()}</p>
                        </div>
                        <Image src="/avatars/adventurer-idle.png" alt="Aventurer" width={64} height={64} />
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-gray-950/40 rounded-lg p-3">
                          <p className="text-xs text-amber-200/70">ATK</p>
                          <p className="text-2xl font-bold text-amber-100">{nft.stats.atk.toString()}</p>
                        </div>
                        <div className="bg-gray-950/40 rounded-lg p-3">
                          <p className="text-xs text-amber-200/70">DEF</p>
                          <p className="text-2xl font-bold text-amber-100">{nft.stats.def.toString()}</p>
                        </div>
                        <div className="bg-gray-950/40 rounded-lg p-3">
                          <p className="text-xs text-amber-200/70">HP</p>
                          <p className="text-2xl font-bold text-amber-100">{nft.stats.hp.toString()}</p>
                        </div>
                      </div>

                      <div className="text-xs text-amber-100/70">
                        Minted: {formatDate(nft.stats.mintedAt)}
                      </div>

                      <button
                        onClick={() => handleSendToBurn(nft.tokenId)}
                        disabled={isPending || isConfirming || selectedToken === nft.tokenId}
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition"
                      >
                        {selectedToken === nft.tokenId && (isPending || isConfirming)
                          ? '🔥 Enviando...'
                          : '🔥 Enviar a burn'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
