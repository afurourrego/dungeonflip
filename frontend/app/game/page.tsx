'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWatchContractEvent, usePublicClient } from 'wagmi';
import { decodeEventLog } from 'viem';
import { useNFTBalance, useNFTOwnerTokens, useAventurerStats, useDungeonApproval } from '@/hooks/useNFT';
import { useGameContract, useRunState, RunStatus, useEntryFee } from '@/hooks/useGame';
import { AdventureLog } from '@/components/AdventureLog';
import { GameCard } from '@/components/GameCard';
import { CURRENT_NETWORK, CONTRACTS, GAME_CONFIG } from '@/lib/constants';
import DungeonGameABI from '@/lib/contracts/DungeonGame.json';
import { Header } from '@/components/Header';

const STATUS_COPY: Record<RunStatus, string> = {
  [RunStatus.Idle]: 'Idle',
  [RunStatus.Active]: 'Exploring',
  [RunStatus.Paused]: 'Paused (NFT in wallet)',
  [RunStatus.Dead]: 'Fallen hero',
  [RunStatus.Completed]: 'Completed',
};

const CARD_LABELS = ['Monster', 'Trap', 'Potion +1', 'Full Heal', 'Treasure'];
const CARD_EMOJIS = ['👹', '🕸️', '🧪', '💖', '💎'];

type CardFeedItem = {
  txHash: string;
  cardType: number;
  room: number;
  hp: number;
  gems: number;
};

export default function GamePage() {
  const { address, isConnected, chain } = useAccount();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: nftBalance } = useNFTBalance(address);
  const {
    data: tokenId,
    isLoading: isLoadingTokenId,
    error: tokenError,
    refetch: refetchTokenId,
  } = useNFTOwnerTokens(address);

  const { data: stats } = useAventurerStats(tokenId);
  const {
    data: runState,
    refetch: refetchRun,
    isFetching: isFetchingRun,
  } = useRunState(tokenId);
  const { data: entryFee } = useEntryFee();
  const { isApproved, requestApproval, isApproving: isApprovingApproval } = useDungeonApproval(address);

  const {
    enterDungeon,
    chooseCard,
    exitDungeon,
    pauseRun,
    claimAfterDeath,
    forceWithdraw,
    isPending,
    isConfirming,
    hash,
  } = useGameContract();

  useEffect(() => {
    if (!hash) return;
    if (!isConfirming) {
      // Refetch multiple times to handle RPC indexing delays
      const doRefetch = async () => {
        refetchRun();
        refetchTokenId?.();
        // Retry after delays to catch slow indexing
        setTimeout(() => { refetchRun(); refetchTokenId?.(); }, 1000);
        setTimeout(() => { refetchRun(); refetchTokenId?.(); }, 2500);
        setTimeout(() => { refetchRun(); refetchTokenId?.(); }, 5000);
      };
      doRefetch();
    }
  }, [hash, isConfirming, refetchRun, refetchTokenId]);

  const [cardFeed, setCardFeed] = useState<CardFeedItem[]>([]);
  const [cardError, setCardError] = useState<string | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [revealedCards, setRevealedCards] = useState<Record<number, number>>({}); // index -> cardType
  const [isChoosingCard, setIsChoosingCard] = useState(false);
  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | null>(null);
  const selectedCardIndexRef = useRef<number | null>(null);
  const publicClient = usePublicClient();

  // Keep ref in sync with state
  useEffect(() => {
    selectedCardIndexRef.current = selectedCardIndex;
  }, [selectedCardIndex]);

  // Function to reveal card from transaction receipt
  const revealCardFromTx = useCallback(async (txHash: `0x${string}`) => {
    if (!publicClient) return;
    
    console.log('Waiting for tx receipt:', txHash);
    
    try {
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log('Got receipt, logs:', receipt.logs.length);
      
      // Parse CardResolved event from logs using viem's decodeEventLog
      for (const log of receipt.logs) {
        try {
          // Try to decode as CardResolved event
          const decoded = decodeEventLog({
            abi: DungeonGameABI.abi,
            data: log.data,
            topics: log.topics,
          });
          
          console.log('Decoded event:', decoded.eventName, decoded.args);
          
          if (
            decoded.eventName === 'CardResolved' &&
            decoded.args &&
            !Array.isArray(decoded.args) &&
            'cardType' in decoded.args
          ) {
            const args = decoded.args as Record<string, unknown>;
            const cardTypeValue = args.cardType;
            if (cardTypeValue === undefined) {
              continue;
            }

            const cardType = Number(cardTypeValue);
            
            const currentIndex = selectedCardIndexRef.current;
            console.log('CardResolved! cardType:', cardType, 'selectedIndex:', currentIndex);
            
            if (currentIndex !== null) {
              setRevealedCards((prev) => ({
                ...prev,
                [currentIndex]: cardType,
              }));
              setIsChoosingCard(false);
              setPendingTxHash(null);
              
              // Add to feed
              const roomValue = args.room;
              const hpValue = args.hp;
              const gemsValue = args.gems;

              const newEntry: CardFeedItem = {
                txHash: txHash,
                cardType: cardType,
                room: typeof roomValue === 'bigint' || typeof roomValue === 'number' ? Number(roomValue) : 0,
                hp: typeof hpValue === 'bigint' || typeof hpValue === 'number' ? Number(hpValue) : 0,
                gems: typeof gemsValue === 'bigint' || typeof gemsValue === 'number' ? Number(gemsValue) : 0,
              };
              
              setCardFeed((prev) => [newEntry, ...prev].slice(0, 8));
              
              // Auto-reset after 3 seconds
              setTimeout(() => {
                setRevealedCards({});
                setSelectedCardIndex(null);
              }, 3000);
              
              refetchRun();
              return;
            }
          }
        } catch {
          // Not a CardResolved event or wrong contract, continue
        }
      }
      
      // If we get here, no CardResolved event was found - still reset state
      console.log('No CardResolved event found in logs');
      setIsChoosingCard(false);
      setPendingTxHash(null);
      refetchRun();
      
    } catch (err) {
      console.error('Error getting tx receipt:', err);
      setIsChoosingCard(false);
      setPendingTxHash(null);
    }
  }, [publicClient, refetchRun]);

  // Watch for pending tx to complete
  useEffect(() => {
    if (pendingTxHash && publicClient) {
      revealCardFromTx(pendingTxHash);
    }
  }, [pendingTxHash, publicClient, revealCardFromTx]);

  useWatchContractEvent({
    address: CONTRACTS.DUNGEON_GAME,
    abi: DungeonGameABI.abi,
    eventName: 'CardResolved',
    args: tokenId ? { tokenId } : undefined,
    onLogs: (logs) => {
      const entries = logs
        .map((log) => {
          const args = (log as unknown as {
            args: {
              cardType: bigint;
              room: bigint;
              hp: bigint;
              gems: bigint;
            };
          }).args;
          return {
            txHash: log.transactionHash || Math.random().toString(36),
            cardType: Number(args.cardType),
            room: Number(args.room),
            hp: Number(args.hp),
            gems: Number(args.gems),
          } satisfies CardFeedItem;
        })
        .reverse();
      if (entries.length) {
        // Reveal the selected card with the resolved type
        const latestEntry = entries[0];
        const currentSelectedIndex = selectedCardIndexRef.current;
        
        if (currentSelectedIndex !== null) {
          setRevealedCards((prev) => ({
            ...prev,
            [currentSelectedIndex]: latestEntry.cardType,
          }));
          setIsChoosingCard(false);
          // Auto-reset cards after showing the result for 3 seconds
          setTimeout(() => {
            setRevealedCards({});
            setSelectedCardIndex(null);
          }, 3000);
        }

        setCardFeed((prev) => {
          const combined = [...entries, ...prev];
          const seen = new Set<string>();
          const deduped: CardFeedItem[] = [];
          for (const item of combined) {
            const key = `${item.txHash}-${item.cardType}-${item.room}`;
            if (seen.has(key)) continue;
            seen.add(key);
            deduped.push(item);
            if (deduped.length >= 8) break;
          }
          return deduped;
        });
        refetchRun();
      }
    },
  });

  const ownsInWallet = typeof nftBalance === 'bigint' ? nftBalance > BigInt(0) : false;
  // Consider having NFT if: owns in wallet, OR has tokenId, OR runState shows deposited
  const hasNFT = mounted && (ownsInWallet || Boolean(tokenId) || Boolean(runState?.nftDeposited));
  const status = runState?.status ?? RunStatus.Idle;
  const isActive = status === RunStatus.Active;
  const isPaused = status === RunStatus.Paused;
  const isDead = status === RunStatus.Dead;
  const isDeposited = Boolean(runState?.nftDeposited);
  const isWrongNetwork = chain?.id !== undefined && chain.id !== CURRENT_NETWORK.id;
  const entryFeeDisplay = entryFee ? Number(entryFee) / 1e18 : Number(GAME_CONFIG.ENTRY_FEE);

  // Entry fee is only required for a fresh entry; resumes are free
  const requiresEntryFee = runState?.status !== RunStatus.Paused;
  const needsApproval = Boolean(address && tokenId && !isApproved);
  const actionDisabled = !tokenId || isPending || isConfirming || isApprovingApproval || needsApproval;
  const cardDisabled = actionDisabled || !isActive || !isDeposited;

  const statusCopy = STATUS_COPY[status];

  const canEnter = Boolean(hasNFT && tokenId && !isActive && !isPaused && !isDead);
  const canResume = Boolean(tokenId && isPaused && !isDeposited);
  const canExit = Boolean(isActive && isDeposited);
  const canPause = canExit;
  const canClaimAfterDeath = Boolean(isDead && isDeposited);
  const canForceWithdraw = Boolean(!isActive && isDeposited && !isDead);

  const cardButtons = useMemo(
    () =>
      Array.from({ length: 4 }).map((_, index) => ({
        index,
        label: `Card ${index + 1}`,
      })),
    []
  );

  const handleEnter = async () => {
    if (!tokenId) return;
    if (needsApproval) {
      alert('Approve DungeonFlip to use your NFT before entering.');
      return;
    }
    try {
      await enterDungeon(tokenId, { payEntryFee: requiresEntryFee });
      refetchRun();
    } catch (err) {
      console.error('enterDungeon error', err);
      const message = err instanceof Error ? err.message : String(err);
      if (message.toLowerCase().includes('user rejected')) {
        alert('Transaction cancelled in wallet. You can try again anytime.');
        return;
      }
      alert('Could not enter the dungeon. Check the console for details.');
    }
  };

  const handleApprove = async () => {
    try {
      await requestApproval();
    } catch (err) {
      console.error('setApprovalForAll error', err);
      const message = err instanceof Error ? err.message : String(err);
      if (message.toLowerCase().includes('user rejected')) {
        alert('Approval transaction cancelled. The game still needs permission to hold your NFT.');
        return;
      }
      alert('Could not approve the game contract. Check the console for details.');
    }
  };

  const handleChooseCard = async (cardIndex: number) => {
    if (!tokenId) return;
    setCardError(null);
    if (!isActive || !isDeposited) {
      setCardError('Run is not active or NFT not deposited.');
      return;
    }
    if (runState?.currentHP === 0) {
      setCardError('HP is zero, cannot continue.');
      return;
    }
    
    // Set loading state for the selected card
    setSelectedCardIndex(cardIndex);
    setIsChoosingCard(true);
    
    // Simulate to catch reverts before sending a tx
    try {
      await publicClient?.simulateContract({
        address: CONTRACTS.DUNGEON_GAME,
        abi: DungeonGameABI.abi,
        functionName: 'chooseCard',
        args: [tokenId, cardIndex],
        account: address,
      });
    } catch (err) {
      console.error('chooseCard simulation error', err);
      const message = err instanceof Error ? err.message : String(err);
      setCardError(message);
      setSelectedCardIndex(null);
      setIsChoosingCard(false);
      return;
    }
    try {
      const txHash = await chooseCard(tokenId, cardIndex);
      // Set the pending tx hash to trigger receipt watching
      if (txHash) {
        setPendingTxHash(txHash);
      }
      refetchRun();
      setTimeout(() => refetchRun(), 1200);
      setTimeout(() => refetchRun(), 2500);
    } catch (err) {
      console.error('chooseCard error', err);
      const message = err instanceof Error ? err.message : String(err);
      setCardError(message);
      setSelectedCardIndex(null);
      setIsChoosingCard(false);
    }
  };

  const handleExitDungeon = async () => {
    if (!tokenId) return;
    try {
      await exitDungeon(tokenId);
      refetchRun();
    } catch (err) {
      console.error('exitDungeon error', err);
      alert('Failed to exit the dungeon.');
    }
  };

  const handlePause = async () => {
    if (!tokenId) return;
    try {
      await pauseRun(tokenId);
      refetchRun();
    } catch (err) {
      console.error('pauseRun error', err);
      alert('Failed to pause the run.');
    }
  };

  const handleClaimDeath = async () => {
    if (!tokenId) return;
    try {
      await claimAfterDeath(tokenId);
      refetchRun();
    } catch (err) {
      console.error('claimAfterDeath error', err);
      alert('Could not claim the NFT after death.');
    }
  };

  const handleForceWithdraw = async () => {
    if (!tokenId) return;
    try {
      await forceWithdraw(tokenId);
      refetchRun();
    } catch (err) {
      console.error('forceWithdraw error', err);
      alert('Could not force the withdrawal.');
    }
  };

  return (
    <div className="min-h-screen text-white">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-6">
            <div className="bg-black/40 border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <div>
                  <p className="text-sm text-gray-400">Run Status</p>
                  <p className="text-2xl font-bold text-purple-300">{statusCopy}</p>
                  {runState?.currentRoom ? (
                    <p className="text-xs text-purple-200/80 mt-1">Current room: {runState.currentRoom}</p>
                  ) : null}
                </div>
                <div className="text-sm text-gray-400">
                  Entry fee: <span className="text-white font-semibold">{entryFeeDisplay.toFixed(5)} ETH</span>
                </div>
              </div>

              {!mounted ? (
                <p className="text-gray-400">Loading...</p>
              ) : !isConnected ? (
                <div className="text-center">
                  <p className="text-gray-300 mb-4">Connect your wallet to get started.</p>
                  <ConnectButton />
                </div>
              ) : isWrongNetwork ? (
                <p className="text-red-300 font-semibold">
                  Switch to {CURRENT_NETWORK.name} to play.
                </p>
              ) : !hasNFT ? (
                <div className="text-center">
                  <p className="text-gray-300 mb-4">You need an Aventurer NFT to play.</p>
                  <Link
                    href="/mint"
                    className="inline-block bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-lg font-bold"
                  >
                    Mint NFT
                  </Link>
                </div>
              ) : tokenError ? (
                <p className="text-red-300">Error loading your NFT: {tokenError.message}</p>
              ) : isLoadingTokenId && !tokenId ? (
                <p className="text-gray-400">Searching for your Adventurer NFT...</p>
              ) : !tokenId ? (
                <p className="text-gray-400">No playable Adventurer found. Mint one or complete your current adventure.</p>
              ) : (
                <div className="space-y-6">
                  {needsApproval && (
                    <div className="bg-yellow-900/30 border border-yellow-500/40 rounded-lg p-4">
                      <p className="text-sm text-yellow-100 mb-3">
                        Authorize the DungeonFlip contract to hold your NFT while you explore. This is a one-time approval.
                      </p>
                      <button
                        onClick={handleApprove}
                        disabled={isApprovingApproval}
                        className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed py-3 rounded-lg font-bold"
                      >
                        {isApprovingApproval ? '⏳ Approving...' : '✅ Enable Dungeon access'}
                      </button>
                    </div>
                  )}
                  <div className="grid md:grid-cols-4 gap-4 text-center">
                    <div className="rounded-lg bg-purple-900/20 border border-purple-500/40 p-3">
                      <p className="text-xs text-gray-400">Token</p>
                      <p className="text-2xl font-bold">#{tokenId.toString()}</p>
                    </div>
                    <div className="rounded-lg bg-purple-900/20 border border-purple-500/40 p-3">
                      <p className="text-xs text-gray-400">Room</p>
                      <p className="text-2xl font-bold">{runState?.currentRoom ?? 0}</p>
                    </div>
                    <div className="rounded-lg bg-purple-900/20 border border-purple-500/40 p-3">
                      <p className="text-xs text-gray-400">HP</p>
                      <p className="text-2xl font-bold text-red-300">
                        {runState?.currentHP ?? stats?.hp?.toString() ?? 0}/{runState?.maxHP ?? stats?.hp?.toString() ?? 0}
                      </p>
                    </div>
                    <div className="rounded-lg bg-purple-900/20 border border-purple-500/40 p-3">
                      <p className="text-xs text-gray-400">Gems</p>
                      <p className="text-2xl font-bold text-yellow-300">{runState?.gems ?? 0}</p>
                    </div>
                  </div>

                  {stats && (
                    <div className="grid md:grid-cols-3 gap-4 text-center">
                      <div className="bg-black/30 border border-purple-500/30 rounded-lg p-3">
                        <p className="text-xs text-gray-400">ATK</p>
                        <p className="text-2xl font-bold text-red-300">{stats.atk.toString()}</p>
                      </div>
                      <div className="bg-black/30 border border-purple-500/30 rounded-lg p-3">
                        <p className="text-xs text-gray-400">DEF</p>
                        <p className="text-2xl font-bold text-blue-300">{stats.def.toString()}</p>
                      </div>
                      <div className="bg-black/30 border border-purple-500/30 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Max HP</p>
                        <p className="text-2xl font-bold text-green-300">{stats.hp.toString()}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={handleEnter}
                      disabled={actionDisabled || (!canEnter && !canResume)}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed py-3 rounded-lg font-bold"
                    >
                      {canResume ? '🔁 Resume run (free)' : '⚔️ Enter the dungeon'}
                    </button>
                    <button
                      onClick={handleExitDungeon}
                      disabled={!canExit || actionDisabled}
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed py-3 rounded-lg font-bold"
                    >
                      🛡️ Exit victorious
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={handlePause}
                      disabled={!canPause || actionDisabled}
                      className="w-full bg-purple-700/70 hover:bg-purple-600 disabled:bg-gray-800 disabled:cursor-not-allowed py-3 rounded-lg font-bold"
                    >
                      ⏸️ Pause & withdraw NFT
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={handleClaimDeath}
                        disabled={!canClaimAfterDeath || actionDisabled}
                        className="flex-1 bg-red-700/70 hover:bg-red-600 disabled:bg-gray-800 disabled:cursor-not-allowed py-3 rounded-lg font-bold"
                      >
                        💀 Claim after death
                      </button>
                      <button
                        onClick={handleForceWithdraw}
                        disabled={!canForceWithdraw || actionDisabled}
                        className="flex-1 bg-gray-700/70 hover:bg-gray-600 disabled:bg-gray-900 disabled:cursor-not-allowed py-3 rounded-lg font-bold"
                      >
                        🔓 Force withdraw
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400">
                    {isFetchingRun
                      ? 'Syncing run state...'
                      : needsApproval
                      ? 'Approve DungeonFlip to hold your NFT before entering.'
                      : isDeposited
                      ? 'NFT held in the contract. You can only manage one adventure at a time.'
                      : 'NFT in your wallet. Only one Adventurer can explore at a time.'}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-black/40 border border-purple-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Pick a card</h3>
              <p className="text-sm text-gray-400 mb-6">
                Every selection creates an on-chain transaction. Cards resolve inside the contract, not in your browser.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cardButtons.map(({ index, label }) => (
                  <GameCard
                    key={label}
                    index={index}
                    label={label}
                    disabled={cardDisabled || isChoosingCard}
                    revealed={revealedCards[index] !== undefined}
                    revealedType={revealedCards[index]}
                    onClick={() => handleChooseCard(index)}
                    isLoading={isChoosingCard && selectedCardIndex === index}
                  />
                ))}
              </div>
              {cardError && <p className="text-xs text-red-400 mt-3 break-words">{cardError}</p>}
              {!isActive && (
                <p className="text-xs text-gray-500 mt-4">
                  You must be inside the dungeon with your NFT deposited to reveal cards.
                </p>
              )}
            </div>

            <div className="bg-black/40 border border-purple-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Recent resolutions</h3>
              {cardFeed.length === 0 ? (
                <p className="text-gray-400 text-sm">Play a few cards to populate the history.</p>
              ) : (
                <div className="space-y-3">
                  {cardFeed.map((event, idx) => (
                    <div
                      key={`${event.txHash}-${idx}`}
                      className="flex items-center justify-between bg-black/30 border border-purple-500/20 rounded-lg p-3 text-sm"
                    >
                      <div>
                        <p className="font-semibold">
                          {CARD_EMOJIS[event.cardType] ?? '❓'} {CARD_LABELS[event.cardType] ?? 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-400">Room {event.room} • HP {event.hp} • Gems {event.gems}</p>
                      </div>
                      <span className="text-[10px] text-gray-500">{event.txHash.slice(0, 10)}...</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <AdventureLog address={address} tokenId={tokenId} />
          </section>
        </div>
      </main>
    </div>
  );
}
