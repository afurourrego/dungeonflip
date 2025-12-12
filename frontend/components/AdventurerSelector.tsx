'use client';

import { WalletNFT } from '@/hooks/useNFT';
import { getAventurerClassWithCard } from '@/lib/aventurer';
import Image from 'next/image';

interface AdventurerSelectorProps {
  nfts: WalletNFT[];
  selectedTokenId: bigint | null;
  activeTokenId: bigint;
  onSelect: (tokenId: bigint) => void;
}

export function AdventurerSelector({
  nfts,
  selectedTokenId,
  activeTokenId,
  onSelect,
}: AdventurerSelectorProps) {
  if (nfts.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#0e0b1f]/90 border border-purple-700/60 rounded-2xl p-6 shadow-2xl">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2">Select Your Adventurer</h3>
        <p className="text-sm text-white/70">
          Choose which adventurer you want to use for your next dungeon run
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {nfts.map((nft) => {
          const nftClass = getAventurerClassWithCard(nft.stats);
          const isSelected = selectedTokenId === nft.tokenId;
          const isActive = activeTokenId !== BigInt(0) && nft.tokenId === activeTokenId;

          return (
            <button
              key={nft.tokenId.toString()}
              onClick={() => onSelect(nft.tokenId)}
              disabled={isActive}
              className={`relative bg-[#16122c] border-2 rounded-xl p-4 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                isSelected
                  ? 'border-purple-400 shadow-lg shadow-purple-500/50'
                  : 'border-purple-700/60 hover:border-purple-500'
              }`}
            >
              {/* Selected badge */}
              {isSelected && !isActive && (
                <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-purple-400">
                  Selected
                </div>
              )}

              {/* In dungeon badge */}
              {isActive && (
                <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-green-400">
                  In Dungeon
                </div>
              )}

              {/* Token ID */}
              <div className="text-center mb-2">
                <p className="text-xs text-white/70">#{nft.tokenId.toString()}</p>
              </div>

              {/* Card Image */}
              <div className="flex justify-center mb-3">
                <Image
                  src={nftClass?.cardImage ?? '/avatars/adventurer-idle.png'}
                  alt={nftClass?.name ?? 'Adventurer'}
                  width={60}
                  height={96}
                  className="rounded-md border border-purple-700/40"
                />
              </div>

              {/* Class name */}
              {nftClass && (
                <div className="text-center mb-2">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-[10px] font-semibold text-black bg-gradient-to-r ${nftClass.accent}`}
                  >
                    {nftClass.name}
                  </span>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-1 text-[10px]">
                <div className="bg-[#1a1633] rounded p-1">
                  <p className="text-white/70">ATK</p>
                  <p className="text-white font-bold">{nft.stats.atk.toString()}</p>
                </div>
                <div className="bg-[#1a1633] rounded p-1">
                  <p className="text-white/70">DEF</p>
                  <p className="text-white font-bold">{nft.stats.def.toString()}</p>
                </div>
                <div className="bg-[#1a1633] rounded p-1">
                  <p className="text-white/70">HP</p>
                  <p className="text-white font-bold">{nft.stats.hp.toString()}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
