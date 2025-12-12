'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { Hex, decodeEventLog } from 'viem';
import {
  AventurerStats,
  useAventurerStats,
  useNFT,
  useNFTBalance,
  useNFTOwnerTokens,
} from '@/hooks/useNFT';
import { getAventurerClass } from '@/lib/aventurer';
import { STAT_RANGES } from '@/lib/constants';
import AventurerNFTABI from '@/lib/contracts/AventurerNFT.json';
import { Header } from '@/components/Header';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function MintPage() {
  const { address, isConnected } = useAccount();
  const { mintAventurer, isPending, isConfirming, isConfirmed, error, receipt } = useNFT();
  const { data: nftBalance, refetch: refetchBalance } = useNFTBalance(address);
  const { data: firstTokenId, refetch: refetchTokenId } = useNFTOwnerTokens(address);
  const { data: stats } = useAventurerStats(firstTokenId);

  const [mounted, setMounted] = useState(false);
  const [mintedNFT, setMintedNFT] = useState<{ tokenId: bigint; stats: AventurerStats } | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!receipt && !isConfirmed) return;

    if (receipt) {
      const mintedLog = receipt.logs
        ?.map((log) => {
          try {
            return decodeEventLog({
              abi: AventurerNFTABI.abi,
              data: log.data,
              topics: (log.topics ?? []) as [`0x${string}`, ...`0x${string}`[]],
            });
          } catch {
            return null;
          }
        })
        .find((log) => log?.eventName === 'AventurerMinted');

      if (mintedLog && mintedLog.args) {
        const args = mintedLog.args as unknown as {
          owner: `0x${string}`;
          tokenId: bigint;
          atk: bigint;
          def: bigint;
          hp: bigint;
          timestamp: bigint;
        };

        setMintedNFT({
          tokenId: args.tokenId,
          stats: {
            atk: args.atk,
            def: args.def,
            hp: args.hp,
            mintedAt: args.timestamp,
          },
        });
        setShowSuccess(true);
        setToastOpen(true);
        refetchBalance();
        refetchTokenId?.();
        return;
      }
    }

    if (isConfirmed) {
      setShowSuccess(true);
    }
  }, [receipt, isConfirmed, refetchBalance, refetchTokenId]);

  const mintedCount = nftBalance ? Number(nftBalance) : 0;
  const hasNFT = mintedCount > 0;
  const mintedClass = useMemo(() => getAventurerClass(mintedNFT?.stats ?? stats), [mintedNFT, stats]);
  const isMinting = isPending || isConfirming;

  return (
    <div className="min-h-screen relative">
      <Header />

      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#0e0b1f]/90 border border-purple-700/60 rounded-2xl p-8 shadow-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-xs text-white/70 uppercase tracking-[0.2em]">Unlimited minting</p>
                <h2 className="text-3xl font-bold text-white">Forge Adventurers</h2>
                <p className="text-white/75 text-sm">
                  Unlimited minting is temporarily enabled: create as many cards as you want while the window stays open.
                </p>
              </div>
              <Image
                src="/avatars/adventurer-idle.png"
                alt="Aventurer"
                width={120}
                height={120}
                className="mx-auto md:mx-0 animate-bounce-slow"
              />
            </div>

            <div className="h-px w-32 bg-gradient-to-r from-transparent via-purple-500/70 to-transparent my-6" />

            {!mounted ? (
              <div className="text-center text-white/70 py-10">Loading...</div>
            ) : !isConnected ? (
              <div className="text-center py-10">
                <p className="text-white/80 mb-4">Connect your wallet to mint Adventurers.</p>
                <ConnectButton />
              </div>
            ) : (
              <div className="space-y-6">
                {showSuccess && (
                  <div className="bg-[#1b2f1b] border border-green-500/50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-gradient-to-br from-green-500/30 to-emerald-500/40 border border-green-500/50 px-3 py-2 text-sm font-bold text-white">
                        Mint complete
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white/80">
                          Adventurer generated. You can keep minting or jump straight into the game.
                        </p>
                        {mintedNFT && (
                          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                            <div className="rounded-lg bg-[#16122c] border border-purple-700/60 p-2">
                              <p className="text-[10px] text-white/70 uppercase">Token</p>
                              <p className="text-xl font-bold text-white">#{mintedNFT.tokenId.toString()}</p>
                            </div>
                            <div className="rounded-lg bg-[#16122c] border border-purple-700/60 p-2">
                              <p className="text-[10px] text-white/70 uppercase">ATK</p>
                              <p className="text-xl font-bold text-white">{mintedNFT.stats.atk.toString()}</p>
                            </div>
                            <div className="rounded-lg bg-[#16122c] border border-purple-700/60 p-2">
                              <p className="text-[10px] text-white/70 uppercase">DEF</p>
                              <p className="text-xl font-bold text-white">{mintedNFT.stats.def.toString()}</p>
                            </div>
                            <div className="rounded-lg bg-[#16122c] border border-purple-700/60 p-2">
                              <p className="text-[10px] text-white/70 uppercase">HP</p>
                              <p className="text-xl font-bold text-white">{mintedNFT.stats.hp.toString()}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 grid sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => mintAventurer()}
                        disabled={isMinting}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition"
                      >
                        {isPending ? 'Confirm in wallet...' : isConfirming ? 'Minting...' : 'Mint another'}
                      </button>
                      <Link
                        href="/game"
                        className="w-full inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition"
                      >
                        Play now
                      </Link>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-[#16122c] border border-purple-700/60 rounded-lg p-4">
                    <h4 className="font-bold text-white mb-3">Stat ranges</h4>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="text-center">
                        <div className="text-white font-bold">ATK</div>
                        <div className="text-white/70">
                          {STAT_RANGES.ATK.min}-{STAT_RANGES.ATK.max}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-bold">DEF</div>
                        <div className="text-white/70">
                          {STAT_RANGES.DEF.min}-{STAT_RANGES.DEF.max}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-bold">HP</div>
                        <div className="text-white/70">
                          {STAT_RANGES.HP.min}-{STAT_RANGES.HP.max}
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-white/60 mt-3">
                      Each card rolls random stats within these ranges.
                    </p>
                  </div>

                  {hasNFT && stats && firstTokenId !== undefined && (
                    <div className="bg-[#16122c] border border-purple-700/60 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-white">Your active Adventurer</h4>
                        <span className="text-sm text-white font-semibold">#{firstTokenId.toString()}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="stat-box">
                          <p className="text-[10px] text-white/70 uppercase">ATK</p>
                          <p className="text-xl font-bold text-white">{stats.atk.toString()}</p>
                        </div>
                        <div className="stat-box">
                          <p className="text-[10px] text-white/70 uppercase">DEF</p>
                          <p className="text-xl font-bold text-white">{stats.def.toString()}</p>
                        </div>
                        <div className="stat-box">
                          <p className="text-[10px] text-white/70 uppercase">HP</p>
                          <p className="text-xl font-bold text-white">{stats.hp.toString()}</p>
                        </div>
                      </div>
                      {mintedClass && (
                        <div className="mt-3 text-xs text-white/70">
                          Class: <span className="font-semibold text-white">{mintedClass.name}</span> ·{' '}
                          {mintedClass.description}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-[#16122c] border border-purple-700/60 rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="text-sm text-white/80 mb-1">
                        Each mint is free (gas only). Unlimited minting is temporarily enabled.
                      </p>
                      <p className="text-[11px] text-white/60">
                        You will receive a floating message with the Adventurer class after every mint.
                      </p>
                    </div>
                    <button
                      onClick={() => mintAventurer()}
                      disabled={isMinting}
                      className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition"
                    >
                      {isPending ? 'Confirm in wallet...' : isConfirming ? 'Minting...' : 'Mint Adventurer'}
                    </button>
                  </div>
                  {error && (
                    <div className="mt-3 bg-red-900/30 border border-red-500/40 rounded-md p-3 text-sm text-red-200">
                      Error: {error.message}
                    </div>
                  )}
                </div>

                {!hasNFT && (
                  <div className="text-center text-sm text-white/70">
                    You do not have any Adventurers yet. Take advantage of unlimited minting to try different builds.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {mintedNFT && toastOpen && (
        <div
          className="fixed bottom-6 right-6 max-w-md w-[90vw] sm:w-96 bg-[#0f0c1f] border-2 border-purple-700/70 rounded-xl shadow-2xl z-30"
          style={{ animation: 'slideUp 0.25s ease-out' }}
        >
          <div className="p-4 flex gap-3">
            <div className="min-w-[64px] h-16 rounded-lg bg-[#16122c] border border-purple-700/70 flex items-center justify-center text-xl font-bold text-white">
              #{mintedNFT.tokenId.toString()}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-[11px] text-white/70 uppercase tracking-wide">New Adventurer</p>
              <h4 className="text-xl font-bold text-white">{mintedClass?.name ?? 'Adventurer'}</h4>
              <p className="text-xs text-white/70">
                {mintedClass?.description ?? 'Check the stats to learn the class.'}
              </p>
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="bg-[#16122c] border border-purple-700/70 rounded-md p-2">
                  <p className="text-[10px] text-white/70 uppercase">ATK</p>
                  <p className="text-lg font-bold text-white">{mintedNFT.stats.atk.toString()}</p>
                </div>
                <div className="bg-[#16122c] border border-purple-700/70 rounded-md p-2">
                  <p className="text-[10px] text-white/70 uppercase">DEF</p>
                  <p className="text-lg font-bold text-white">{mintedNFT.stats.def.toString()}</p>
                </div>
                <div className="bg-[#16122c] border border-purple-700/70 rounded-md p-2">
                  <p className="text-[10px] text-white/70 uppercase">HP</p>
                  <p className="text-lg font-bold text-white">{mintedNFT.stats.hp.toString()}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-purple-700/70 px-4 py-3 flex justify-end">
            <button
              onClick={() => setToastOpen(false)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-lg shadow-inner"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
