'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWatchContractEvent, usePublicClient } from 'wagmi';
import { decodeEventLog } from 'viem';
import { useNFTBalance, useNFTOwnerTokens, useAventurerStats, useDungeonApproval, useWalletNFTs } from '@/hooks/useNFT';
import { useSelectedToken } from '@/hooks/useSelectedToken';
import { useGameContract, useRunState, RunStatus, useEntryFee } from '@/hooks/useGame';
import { AdventureLog } from '@/components/AdventureLog';
import { GameCard } from '@/components/GameCard';
import { CombatResultDialog, CombatSummary } from '@/components/CombatResultDialog';
import { CURRENT_NETWORK, CONTRACTS, GAME_CONFIG } from '@/lib/constants';
import { getAventurerClassWithCard } from '@/lib/aventurer';
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

type CombatSnapshot = {
  cardIndex: number;
  roomBefore: number;
  hpBefore: number;
  gemsBefore: number;
  heroAttack: number;
  heroDefense: number;
  heroMaxHP: number;
};

export default function GamePage() {
  const { address, isConnected, chain } = useAccount();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: nftBalance } = useNFTBalance(address);
  const { data: allNfts = [], isLoading: isLoadingNfts } = useWalletNFTs(address);

  // Get owned token IDs for validation
  const ownedTokenIds = useMemo(() => allNfts.map((nft) => nft.tokenId), [allNfts]);

  // Get selected token from localStorage - skip validation to keep selection even during active runs
  const { selectedTokenId } = useSelectedToken(address, ownedTokenIds, true);

  const {
    data: tokenId,
    isLoading: isLoadingTokenId,
    error: tokenError,
    refetch: refetchTokenId,
  } = useNFTOwnerTokens(address, selectedTokenId, ownedTokenIds, true); // Enable static mode

  const { data: stats, isLoading: isLoadingStats } = useAventurerStats(tokenId, true); // Enable static mode

  // Keep preview visible during refetches to avoid UI flicker after on-chain actions
  const [hasLoadedNfts, setHasLoadedNfts] = useState(false);
  const [hasLoadedToken, setHasLoadedToken] = useState(false);
  const [hasLoadedStats, setHasLoadedStats] = useState(false);

  useEffect(() => {
    if (!isLoadingNfts) {
      setHasLoadedNfts(true);
    }
  }, [isLoadingNfts]);

  useEffect(() => {
    setHasLoadedNfts(false);
  }, [address]);

  useEffect(() => {
    if (!isLoadingTokenId || tokenId) {
      setHasLoadedToken(true);
    }
  }, [isLoadingTokenId, tokenId]);

  useEffect(() => {
    if (!isLoadingStats || stats) {
      setHasLoadedStats(true);
    }
  }, [isLoadingStats, stats]);

  useEffect(() => {
    setHasLoadedToken(false);
    setHasLoadedStats(false);
  }, [tokenId]);

  const showPreview = !!stats && !!tokenId;
  const isInitialDataLoading =
    !showPreview &&
    ((isLoadingNfts && !hasLoadedNfts) ||
      (isLoadingTokenId && !hasLoadedToken) ||
      (isLoadingStats && !hasLoadedStats));
  const heroProfile = useMemo(
    () => getAventurerClassWithCard(stats),
    [stats?.atk, stats?.def, stats?.hp, stats?.mintedAt]
  );
  const statsTiles = stats ? (
    <>
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
    </>
  ) : null;
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

  const [cardFeed, setCardFeed] = useState<CardFeedItem[]>([]);
  const [cardError, setCardError] = useState<string | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [revealedCards, setRevealedCards] = useState<Record<number, number>>({}); // index -> cardType
  const [isChoosingCard, setIsChoosingCard] = useState(false);
  const [txErrorMessage, setTxErrorMessage] = useState<string | null>(null);

  const describeFriendlyError = useCallback((message: string) => {
    const lower = message.toLowerCase();
    if (lower.includes('user rejected') || lower.includes('denied')) {
      return 'Signature was cancelled in your wallet. No transaction was sent.';
    }
    if (lower.includes('insufficient') || lower.includes('not enough')) {
      return 'Not enough funds to send the transaction.';
    }
    if (lower.includes('network') || lower.includes('rpc') || lower.includes('timeout')) {
      return 'The network took too long to respond. Please try again.';
    }
    return 'We could not complete the transaction. Please try again in a moment.';
  }, []);

  const showTransactionError = useCallback(
    (message: string) => {
      const friendly = describeFriendlyError(message);
      setTxErrorMessage(friendly);
    },
    [describeFriendlyError]
  );

  useEffect(() => {
    if (!hash) return;
    if (!isConfirming) {
      // Skip multiple refetches during card reveal animations to prevent flickering
      // The card reveal logic already handles the refetch after animation completes
      if (isChoosingCard || selectedCardIndex !== null) {
        return;
      }

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
  }, [hash, isConfirming, refetchRun, refetchTokenId, isChoosingCard, selectedCardIndex]);
  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | null>(null);
  const [combatSummary, setCombatSummary] = useState<CombatSummary | null>(null);
  const selectedCardIndexRef = useRef<number | null>(null);
  const adventureLogRefetchRef = useRef<(() => void) | null>(null);
  const combatSnapshotRef = useRef<CombatSnapshot | null>(null);
  const processedResolutionsRef = useRef<Set<string>>(new Set());
  const publicClient = usePublicClient();

  // Keep ref in sync with state
  useEffect(() => {
    selectedCardIndexRef.current = selectedCardIndex;
  }, [selectedCardIndex]);

  const toNumber = (value?: bigint | number) => {
    if (typeof value === 'bigint') return Number(value);
    if (typeof value === 'number') return value;
    return 0;
  };

  const processCardResolution = useCallback(
    (entry: CardFeedItem) => {
      const resolutionKey = `${entry.txHash}-${entry.cardType}-${entry.room}`;
      const processedSet = processedResolutionsRef.current;
      if (processedSet.has(resolutionKey)) {
        return;
      }

      processedSet.add(resolutionKey);
      if (processedSet.size > 50) {
        const firstKey = processedSet.values().next().value as string | undefined;
        if (firstKey) {
          processedSet.delete(firstKey);
        }
      }

      const currentIndex = selectedCardIndexRef.current;
      if (currentIndex !== null) {
        setRevealedCards((prev) => ({
          ...prev,
          [currentIndex]: entry.cardType,
        }));
      }

      setIsChoosingCard(false);
      setPendingTxHash(null);

      setCardFeed((prev) => {
        const combined = [entry, ...prev];
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

      if (adventureLogRefetchRef.current) {
        setTimeout(() => {
          adventureLogRefetchRef.current?.();
        }, 500);
      }

      if (entry.cardType === 0) {
        const snapshot = combatSnapshotRef.current;
        const hpBefore = snapshot?.hpBefore ?? toNumber(runState?.currentHP ?? stats?.hp);
        const gemsBefore = snapshot?.gemsBefore ?? (runState?.gems ?? entry.gems);
        const heroAttack = snapshot?.heroAttack ?? (runState?.atk ?? toNumber(stats?.atk));
        const heroDefense = snapshot?.heroDefense ?? (runState?.def ?? toNumber(stats?.def));
        const heroMaxHP = snapshot?.heroMaxHP ?? (runState?.maxHP ?? toNumber(stats?.hp));
        const damageTaken = Math.max(0, hpBefore - entry.hp);
        const gemsDelta = entry.gems - gemsBefore;

        setCombatSummary({
          room: entry.room,
          damageTaken,
          heroHPBefore: hpBefore,
          heroHPAfter: entry.hp,
          heroAttack,
          heroDefense,
          heroMaxHP,
          heroDied: entry.hp <= 0,
          gemsBefore,
          gemsAfter: entry.gems,
          gemsDelta,
          heroName: heroProfile?.name ?? 'Adventurer',
          heroCardImage: heroProfile?.cardImage,
          cardLabel: CARD_LABELS[entry.cardType] ?? 'Monster',
          cardEmoji: CARD_EMOJIS[entry.cardType] ?? '👹',
        });
      }

      combatSnapshotRef.current = null;

      setTimeout(() => {
        setRevealedCards({});
        setSelectedCardIndex(null);
        refetchRun();
      }, 3000);
    },
    [heroProfile, refetchRun, runState, stats]
  );

  const handleCloseCombatSummary = useCallback(() => {
    setCombatSummary(null);
  }, []);

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
            const roomValue = args.room;
            const hpValue = args.hp;
            const gemsValue = args.gems;

            const newEntry: CardFeedItem = {
              txHash,
              cardType,
              room: typeof roomValue === 'bigint' || typeof roomValue === 'number' ? Number(roomValue) : 0,
              hp: typeof hpValue === 'bigint' || typeof hpValue === 'number' ? Number(hpValue) : 0,
              gems: typeof gemsValue === 'bigint' || typeof gemsValue === 'number' ? Number(gemsValue) : 0,
            };

            processCardResolution(newEntry);
            return;
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
  }, [processCardResolution, publicClient, refetchRun]);

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
        entries.forEach((entry) => processCardResolution(entry));
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

  const showAdventurerSkeleton =
    isInitialDataLoading &&
    mounted &&
    isConnected &&
    !isWrongNetwork &&
    hasNFT &&
    !!tokenId;

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
        label: '',
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
    
    setCombatSummary(null);
    combatSnapshotRef.current = {
      cardIndex,
      roomBefore: runState?.currentRoom ?? 0,
      hpBefore: toNumber(runState?.currentHP ?? stats?.hp),
      gemsBefore: runState?.gems ?? 0,
      heroAttack: runState?.atk ?? toNumber(stats?.atk),
      heroDefense: runState?.def ?? toNumber(stats?.def),
      heroMaxHP: runState?.maxHP ?? toNumber(stats?.hp),
    };
    
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
      setCardError('Could not simulate the move. Please review and try again.');
      showTransactionError(message);
      setSelectedCardIndex(null);
      setIsChoosingCard(false);
      combatSnapshotRef.current = null;
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
      setCardError('Could not send the transaction. Please review and try again.');
      showTransactionError(message);
      setSelectedCardIndex(null);
      setIsChoosingCard(false);
      combatSnapshotRef.current = null;
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
      {txErrorMessage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl border border-red-500/60 bg-gradient-to-b from-dungeon-bg-darker to-dungeon-bg-medium shadow-2xl shadow-black/60 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl text-red-300">⚠️</span>
              <h3 className="text-lg font-bold text-red-200">Transaction could not be completed</h3>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-200 leading-relaxed">{txErrorMessage}</p>
              <p className="text-xs text-gray-400">
                If you cancelled the signature in your wallet, you can try again whenever you’re ready.
              </p>
            </div>
            <button
              onClick={() => {
                setTxErrorMessage(null);
                window.location.reload();
              }}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      ) : null}

      {combatSummary ? (
        <CombatResultDialog summary={combatSummary} onClose={handleCloseCombatSummary} />
      ) : null}
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-5 gap-6">
          <section className="lg:col-span-3 space-y-6">
            {/* Pick a Card Section - Independent Card */}
            {mounted && isConnected && !isWrongNetwork && hasNFT && tokenId && (
              <div className="card p-6">
                <h3 className="text-xl font-bold mb-4 text-dungeon-accent-gold">Pick a card</h3>
                <p className="text-sm text-gray-400 mb-6">
                  Every selection creates an on-chain transaction. Cards resolve inside the contract, not in your browser.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {cardButtons.map(({ index, label }) => (
                    <GameCard
                      key={index}
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
            )}

            <div className="card p-6">
              <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <div>
                  <p className="text-sm text-gray-400">Run Status</p>
                  <p className="text-2xl font-bold text-dungeon-accent-gold">{statusCopy}</p>
                  {runState?.currentRoom ? (
                    <p className="text-xs text-dungeon-accent-orange/80 mt-1">Current room: {runState.currentRoom}</p>
                  ) : null}
                </div>
                <div className="text-sm text-gray-400">
                  Entry fee: <span className="text-dungeon-accent-gold font-semibold">{entryFeeDisplay.toFixed(5)} ETH</span>
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
                    className="inline-block bg-gradient-to-r from-dungeon-accent-bronze to-dungeon-accent-copper hover:from-dungeon-accent-gold hover:to-dungeon-accent-orange px-6 py-3 rounded-lg font-bold transition-all shadow-lg"
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
                  {/* Adventure Log - Moved from sidebar */}
                  <AdventureLog
                    address={address}
                    tokenId={tokenId}
                    currentRunStartBlock={BigInt(1)}
                    onRefetch={(refetchFn) => {
                      // Store refetch function in ref
                      adventureLogRefetchRef.current = refetchFn;
                    }}
                  />

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
                </div>
              )}
            </div>
          </section>

          <section className="lg:col-span-2 space-y-6">
            {/* Loading State for Adventurer */}
            {showAdventurerSkeleton && (
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">⚔️</span>
                  <h3 className="text-lg font-bold text-dungeon-accent-gold">Loading Adventurer...</h3>
                </div>
                <div className="flex flex-col gap-6">
                  {/* Card Image Skeleton */}
                  <div className="flex justify-center">
                    <div className="w-[120px] h-[192px] rounded-lg border-2 border-dungeon-border-medium/50 bg-dungeon-bg-medium/20 animate-pulse" />
                  </div>
                  {/* Stats Skeleton */}
                  <div className="space-y-3">
                    <div className="h-6 bg-dungeon-bg-medium/20 rounded animate-pulse w-32 mx-auto" />
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-dungeon-bg-darker rounded-lg p-3 h-20 animate-pulse" />
                      <div className="bg-dungeon-bg-darker rounded-lg p-3 h-20 animate-pulse" />
                      <div className="bg-dungeon-bg-darker rounded-lg p-3 h-20 animate-pulse" />
                    </div>
                    <div className="h-4 bg-dungeon-bg-medium/20 rounded animate-pulse w-full" />
                  </div>
                </div>
              </div>
            )}

            {/* Selected Adventurer Preview */}
            {showPreview && heroProfile && mounted && isConnected && !isWrongNetwork && hasNFT && tokenId && (
              <div className="card p-6 border-dungeon-accent-gold shadow-2xl shadow-black/60">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">⚔️</span>
                  <h3 className="text-lg font-bold text-dungeon-accent-gold">Selected Adventurer</h3>
                </div>
                <div className="flex gap-4">
                  {/* Card Image - Left - LARGER */}
                  <div className="flex-shrink-0">
                    <Image
                      src={heroProfile.cardImage ?? '/avatars/adventurer-idle.png'}
                      alt={heroProfile.name ?? 'Adventurer'}
                      width={140}
                      height={224}
                      className="rounded-lg border-2 border-dungeon-border-gold/50 shadow-lg"
                    />
                  </div>
                  {/* Stats and Info - Right */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col gap-2">
                      <div>
                        <p className="text-xs text-dungeon-accent-bronze">Token ID</p>
                        <p className="text-lg font-bold text-dungeon-accent-gold">#{tokenId.toString()}</p>
                      </div>
                      {heroProfile && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold text-black bg-gradient-to-r ${heroProfile.accent} w-fit`}>
                          {heroProfile.name}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="bg-dungeon-bg-darker border border-dungeon-border-dark rounded-lg px-2 py-1.5 text-center">
                        <p className="text-[10px] text-dungeon-accent-bronze">ATK</p>
                        <p className="text-lg font-bold text-red-300">{stats.atk.toString()}</p>
                      </div>
                      <div className="bg-dungeon-bg-darker border border-dungeon-border-dark rounded-lg px-2 py-1.5 text-center">
                        <p className="text-[10px] text-dungeon-accent-bronze">DEF</p>
                        <p className="text-lg font-bold text-blue-300">{stats.def.toString()}</p>
                      </div>
                      <div className="bg-dungeon-bg-darker border border-dungeon-border-dark rounded-lg px-2 py-1.5 text-center">
                        <p className="text-[10px] text-dungeon-accent-bronze">HP</p>
                        <p className="text-lg font-bold text-green-300">{stats.hp.toString()}</p>
                      </div>
                    </div>
                    {heroProfile.description && (
                      <p className="text-[11px] text-gray-400 italic">{heroProfile.description}</p>
                    )}
                    <div>
                      {isDeposited ? (
                        <p className="text-xs text-gray-400 italic">
                          Cannot change adventurer while in dungeon
                        </p>
                      ) : (
                        <Link
                          href="/nfts"
                          className="inline-block text-xs text-dungeon-accent-orange hover:text-dungeon-accent-gold transition-colors"
                        >
                          Change adventurer →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Run Stats Card */}
            {mounted && isConnected && !isWrongNetwork && hasNFT && tokenId && runState && (
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">📊</span>
                  <h3 className="text-lg font-bold text-dungeon-accent-gold">Current Run</h3>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-dungeon-bg-darker border border-dungeon-border-medium p-3">
                    <p className="text-xs text-dungeon-accent-bronze">Room</p>
                    <p className="text-2xl font-bold text-dungeon-accent-gold">{runState.currentRoom ?? 0}</p>
                  </div>
                  <div className="rounded-lg bg-dungeon-bg-darker border border-dungeon-border-medium p-3">
                    <p className="text-xs text-dungeon-accent-bronze">HP</p>
                    <p className="text-2xl font-bold text-red-300">
                      {runState.currentHP ?? stats?.hp?.toString() ?? 0}/{runState.maxHP ?? stats?.hp?.toString() ?? 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-dungeon-bg-darker border border-dungeon-border-medium p-3">
                    <p className="text-xs text-dungeon-accent-bronze">Gems</p>
                    <p className="text-2xl font-bold text-dungeon-accent-gold">{runState.gems ?? 0}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons Card */}
            {mounted && isConnected && !isWrongNetwork && hasNFT && tokenId && (
              <div className="card p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🎮</span>
                  <h3 className="text-lg font-bold text-dungeon-accent-gold">Dungeon Actions</h3>
                </div>

                {needsApproval && (
                  <div className="bg-dungeon-accent-orange/20 border border-dungeon-accent-orange/40 rounded-lg p-4">
                    <p className="text-xs text-dungeon-accent-gold mb-3">
                      Authorize the DungeonFlip contract to hold your NFT while you explore. This is a one-time approval.
                    </p>
                    <button
                      onClick={handleApprove}
                      disabled={isApprovingApproval}
                      className="w-full bg-gradient-to-r from-dungeon-accent-gold to-dungeon-accent-orange disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed py-3 rounded-lg font-bold text-sm text-dungeon-bg-darkest shadow-lg"
                    >
                      {isApprovingApproval ? '⏳ Approving...' : '✅ Enable Dungeon access'}
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={handleEnter}
                    disabled={actionDisabled || (!canEnter && !canResume)}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed py-3 rounded-lg font-bold text-sm shadow-lg"
                  >
                    {canResume ? '🔁 Resume run (free)' : '⚔️ Enter the dungeon'}
                  </button>
                  <button
                    onClick={handleExitDungeon}
                    disabled={!canExit || actionDisabled}
                    className="w-full bg-gradient-to-r from-dungeon-accent-gold to-dungeon-accent-orange disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed py-3 rounded-lg font-bold text-sm text-dungeon-bg-darkest shadow-lg"
                  >
                    🛡️ Exit victorious
                  </button>
                  <button
                    onClick={handlePause}
                    disabled={!canPause || actionDisabled}
                    className="w-full bg-dungeon-accent-bronze/70 hover:bg-dungeon-accent-bronze disabled:bg-gray-800 disabled:cursor-not-allowed py-3 rounded-lg font-bold text-sm shadow-lg"
                  >
                    ⏸️ Pause & withdraw NFT
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleClaimDeath}
                      disabled={!canClaimAfterDeath || actionDisabled}
                      className="w-full bg-red-700/70 hover:bg-red-600 disabled:bg-gray-800 disabled:cursor-not-allowed py-3 rounded-lg font-bold text-xs shadow-lg"
                    >
                      💀 Claim after death
                    </button>
                    <button
                      onClick={handleForceWithdraw}
                      disabled={!canForceWithdraw || actionDisabled}
                      className="w-full bg-dungeon-border-dark/70 hover:bg-dungeon-border-medium disabled:bg-gray-900 disabled:cursor-not-allowed py-3 rounded-lg font-bold text-xs shadow-lg"
                    >
                      🔓 Force withdraw
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-gray-400 text-center">
                  {needsApproval
                    ? 'Approve DungeonFlip to hold your NFT before entering.'
                    : isDeposited
                    ? 'NFT held in the contract. You can only manage one adventure at a time.'
                    : 'NFT in your wallet. Only one Adventurer can explore at a time.'}
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
