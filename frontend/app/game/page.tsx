'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { useNFTBalance, useNFTOwnerTokens, useAventurerStats } from '@/hooks/useNFT';
import { useGame, usePlayerSession, useCanStartGame, useEntryFee } from '@/hooks/useGame';
import { useGameStore } from '@/store/gameStore';
import { useEffect, useState, useCallback, useRef } from 'react';
import { CARD_TYPES, GAME_CONFIG } from '@/lib/constants';
import { ResumeGameDialog } from '@/components/ResumeGameDialog';
import { AdventureLog } from '@/components/AdventureLog';

export default function GamePage() {
  const { address, isConnected, chain } = useAccount();
  const { data: nftBalance } = useNFTBalance(address);
  const { data: playerSession } = usePlayerSession(address);

  // Use tokenId from session if available (faster), otherwise fetch it
  const sessionTokenId = playerSession?.tokenId && playerSession.tokenId > BigInt(0) ? playerSession.tokenId : undefined;
  const { data: fetchedTokenId, isLoading: isLoadingTokenId, error: tokenIdError } = useNFTOwnerTokens(address);
  const tokenId = sessionTokenId || fetchedTokenId;

  const { data: stats } = useAventurerStats(tokenId);
  
  const {
    startGame: startGameContract,
    completeGame: completeGameContract,
    updateCheckpoint: updateCheckpointContract,
    recordDeath: recordDeathContract,
    logRoomCompletion: logRoomCompletionContract,
    isPending,
    isConfirming,
    error: txError
  } = useGame();
  const { data: canStartGame } = useCanStartGame(address);
  const { data: contractEntryFee } = useEntryFee();

  // State for Resume dialog
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  
  // Debug effect
  useEffect(() => {
    if (address) {
      console.log('Debug NFT Info:', {
        address,
        nftBalance: nftBalance?.toString(),
        tokenId: tokenId?.toString(),
        isLoadingTokenId,
        tokenIdError: tokenIdError?.message,
        stats: stats ? { atk: stats.atk.toString(), def: stats.def.toString(), hp: stats.hp.toString() } : null,
        playerSession: playerSession ? {
          tokenId: (playerSession as any).tokenId?.toString(),
          active: (playerSession as any).active,
          startTime: (playerSession as any).startTime?.toString(),
        } : null,
        canStartGame,
        contractEntryFee: contractEntryFee?.toString(),
        configEntryFee: GAME_CONFIG.ENTRY_FEE,
      });
    }
  }, [address, nftBalance, tokenId, isLoadingTokenId, tokenIdError, stats, playerSession, canStartGame, contractEntryFee]);
  
  const {
    isPlaying,
    currentRoom,
    playerHP,
    maxHP,
    gemsCollected,
    cards,
    inCombat,
    currentMonster,
    monsterHP,
    combatLog,
    playerATK,
    playerDEF,
    startNewGame,
    resumeGame,
    selectCard,
    exitDungeon,
    attack,
    resetGame,
    setCallbacks,
  } = useGameStore();

  const [gameStarted, setGameStarted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [playerDied, setPlayerDied] = useState(false);
  const [isConfirmingDeath, setIsConfirmingDeath] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect active session on page load
  useEffect(() => {
    if (mounted && playerSession && playerSession.active && !isPlaying) {
      console.log('Active session detected:', playerSession);
      setShowResumeDialog(true);
    }
  }, [mounted, playerSession, isPlaying]);

  // Detect when player dies (HP reaches 0 and game ends)
  useEffect(() => {
    if (mounted && !isPlaying && gameStarted && currentRoom > 0 && playerHP === 0 && !playerDied) {
      console.log('Player died! HP reached 0');
      setPlayerDied(true);
    }
  }, [mounted, isPlaying, gameStarted, currentRoom, playerHP, playerDied]);

  // Use refs to store the latest contract functions without causing re-renders
  const updateCheckpointRef = useRef(updateCheckpointContract);
  const recordDeathRef = useRef(recordDeathContract);
  const logRoomCompletionRef = useRef(logRoomCompletionContract);

  // Keep refs updated
  useEffect(() => {
    updateCheckpointRef.current = updateCheckpointContract;
    recordDeathRef.current = recordDeathContract;
    logRoomCompletionRef.current = logRoomCompletionContract;
  }, [updateCheckpointContract, recordDeathContract, logRoomCompletionContract]);

  // Stable callback functions that use refs (won't change between renders)
  // These will call blockchain transactions during gameplay
  const handleCheckpoint = useCallback(async (currentRoom: number, currentHP: number, gemsCollected: number) => {
    console.log(`🔖 Auto-checkpoint at room ${currentRoom} with ${currentHP} HP and ${gemsCollected} gems`);
    try {
      await updateCheckpointRef.current(currentRoom, currentHP, gemsCollected);
      console.log('Checkpoint saved successfully');
    } catch (error) {
      console.error('Error saving checkpoint:', error);
      // Don't block game if checkpoint fails
    }
  }, []);

  const handleDeath = useCallback(async (roomNumber: number, finalGemsCollected: number) => {
    console.log(`💀 Player died at room ${roomNumber} with ${finalGemsCollected} gems`);
    setPlayerDied(true);
    // Death will be recorded when user clicks "Confirm Death" button
  }, []);

  const handleRoomCompleted = useCallback(async (roomNumber: number, cardType: number, hpRemaining: number, gemsCollected: number) => {
    console.log(`✅ Room ${roomNumber} completed - Type: ${cardType}, HP: ${hpRemaining}, Gems: ${gemsCollected}`);
    try {
      await logRoomCompletionRef.current(roomNumber, cardType, hpRemaining, gemsCollected);
      console.log('Room completion logged successfully');
    } catch (error) {
      console.error('Error logging room completion:', error);
      // Don't block game if logging fails
    }
  }, []);

  // Register blockchain callbacks only once on mount
  useEffect(() => {
    setCallbacks({
      onCheckpoint: handleCheckpoint,
      onDeath: handleDeath,
      onRoomCompleted: handleRoomCompleted
    });
  }, [handleCheckpoint, handleDeath, handleRoomCompleted, setCallbacks]);

  const hasNFT = mounted && nftBalance && Number(nftBalance) > 0;

  const handleResumeGame = () => {
    if (playerSession && stats) {
      console.log('Resuming game from checkpoint:', playerSession);
      // Resume game with checkpoint data - restore HP, room, and gems
      resumeGame(
        Number(stats.atk),
        Number(stats.def),
        Number(stats.hp), // maxHP
        playerSession.currentRoom,
        playerSession.currentHP,
        playerSession.gemsCollected
      );
      setShowResumeDialog(false);
    }
  };


  const handleStartGame = async () => {
    console.log('=== HANDLE START GAME CLICKED ===');
    console.log('Connected:', isConnected);
    console.log('Address:', address);
    console.log('Chain:', chain?.name, 'ID:', chain?.id);
    console.log('NFT Balance:', nftBalance?.toString());
    console.log('Token ID raw:', tokenId);
    console.log('Token ID type:', typeof tokenId);
    console.log('Token ID toString:', tokenId?.toString());
    console.log('Has Stats:', !!stats);
    console.log('Is Loading TokenId:', isLoadingTokenId);
    console.log('Player Session:', playerSession);
    console.log('Can Start Game:', canStartGame);
    
    if (!isConnected) {
      alert('Por favor conecta tu wallet primero.');
      return;
    }
    
    if (chain?.id !== 84532) { // Base Sepolia
      alert('Por favor cambia a la red Base Sepolia.');
      return;
    }
    
    if (!hasNFT) {
      alert('No tienes ningún NFT de aventurero. Por favor mintea uno primero en la página /mint.');
      return;
    }
    
    if (isLoadingTokenId) {
      alert('Cargando información del NFT... Por favor espera un momento.');
      return;
    }
    
    if (!tokenId || tokenId === null || tokenId === undefined) {
      console.error('No tokenId found despite having NFT balance:', nftBalance?.toString());
      alert('Error: No se pudo obtener el ID del token. Balance de NFT: ' + nftBalance?.toString() + '. Por favor recarga la página.');
      return;
    }
    
    // Check if player can start game
    if (canStartGame === false) {
      alert('No puedes iniciar un nuevo juego en este momento. Puede que tengas un juego activo o necesites esperar el cooldown de 30 segundos.');
      return;
    }
    
    // Check if player has active session
    if (playerSession && (playerSession as any).active === true) {
      alert('Ya tienes un juego activo. Por favor completa el juego actual primero.');
      return;
    }
    
    console.log('Starting game with tokenId:', tokenId);
    console.log('Entry fee from config:', GAME_CONFIG.ENTRY_FEE, 'ETH');
    console.log('Entry fee from contract:', contractEntryFee?.toString(), 'wei');
    
    // Check if contract entry fee matches our config
    if (contractEntryFee) {
      const contractFeeInEth = Number(contractEntryFee) / 1e18;
      const configFeeInEth = Number(GAME_CONFIG.ENTRY_FEE);
      
      if (Math.abs(contractFeeInEth - configFeeInEth) > 0.000001) {
        alert(`⚠️ ADVERTENCIA: El entry fee del contrato (${contractFeeInEth} ETH) no coincide con el configurado (${configFeeInEth} ETH).\n\nEl contrato desplegado requiere ${contractFeeInEth} ETH.\n\nDebes redesplegar los contratos con el nuevo valor o actualizar la configuración.`);
        console.error('Entry fee mismatch:', {
          contractFee: contractFeeInEth,
          configFee: configFeeInEth,
          contractFeeWei: contractEntryFee.toString(),
        });
        return;
      }
    }
    
    try {
      // Start game on blockchain
      await startGameContract(tokenId as bigint);
      console.log('Game started successfully');
      setGameStarted(true);
    } catch (error) {
      console.error('Error starting game:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al iniciar el juego: ${errorMessage}\n\nRevisa la consola para más detalles.`);
    }
  };

  useEffect(() => {
    // When blockchain transaction confirms and we have stats, start the local game
    if (gameStarted && stats && !isPlaying && !isPending && !isConfirming) {
      startNewGame(
        Number(stats.atk),
        Number(stats.def),
        Number(stats.hp)
      );
    }
  }, [gameStarted, stats, isPlaying, isPending, isConfirming, startNewGame]);

  const handleConfirmDeath = async () => {
    const currentState = useGameStore.getState();
    setIsConfirmingDeath(true);

    try {
      console.log('Recording death on blockchain...');
      await recordDeathContract(
        currentState.currentRoom,
        currentState.gemsCollected
      );

      console.log('Death recorded successfully!');

      // Reset local state after successful blockchain confirmation
      setTimeout(() => {
        resetGame();
        setGameStarted(false);
        setPlayerDied(false);
        setIsConfirmingDeath(false);
      }, 2000);
    } catch (error) {
      console.error('Error recording death:', error);
      alert('Error al confirmar la muerte. Por favor intenta de nuevo.');
      setIsConfirmingDeath(false);
    }
  };

  const handleExitDungeon = async () => {
    // Get current game state before exiting
    const currentState = useGameStore.getState();

    try {
      // Save final checkpoint before exiting (this will open wallet)
      console.log('Saving final checkpoint before exit...');
      await updateCheckpointContract(
        currentState.currentRoom,
        currentState.playerHP,
        currentState.gemsCollected
      );

      // Complete game on blockchain
      console.log('Completing game on blockchain...');
      await completeGameContract();

      console.log('Game completed successfully!');
    } catch (error) {
      console.error('Error completing game:', error);
      alert('Error al salir del dungeon. Por favor intenta de nuevo.');
      return; // Don't reset if there was an error
    }

    // Update local state
    exitDungeon();

    setTimeout(() => {
      resetGame();
      setGameStarted(false);
    }, 3000);
  };

  const handleCardClick = (cardId: string) => {
    if (inCombat) return;
    selectCard(cardId);
  };

  const getCardImage = (type: number) => {
    switch (type) {
      case CARD_TYPES.MONSTER:
        return '/cards/monster.png';
      case CARD_TYPES.TREASURE:
        return '/cards/gem.png';
      case CARD_TYPES.TRAP:
        return '/cards/trap.png';
      case CARD_TYPES.POTION:
        return '/cards/potion.png';
      default:
        return '/cards/reverse.png';
    }
  };

  const getCardEmoji = (type: number) => {
    switch (type) {
      case CARD_TYPES.MONSTER:
        return '👹';
      case CARD_TYPES.TREASURE:
        return '💎';
      case CARD_TYPES.TRAP:
        return '🕸️';
      case CARD_TYPES.POTION:
        return '🧪';
      default:
        return '❓';
    }
  };

  const getCardName = (type: number) => {
    switch (type) {
      case CARD_TYPES.MONSTER:
        return 'Monster';
      case CARD_TYPES.TREASURE:
        return 'Treasure';
      case CARD_TYPES.TRAP:
        return 'Trap';
      case CARD_TYPES.POTION:
        return 'Potion';
      default:
        return 'Unknown';
    }
  };

  const getAventurerImage = (type: number) => {
    switch (type) {
      case CARD_TYPES.MONSTER:
        return '/avatars/adventurer-monster.png';
      case CARD_TYPES.TREASURE:
        return '/avatars/adventurer-gem.png';
      case CARD_TYPES.TRAP:
        return '/avatars/adventurer-trap.png';
      case CARD_TYPES.POTION:
        return '/avatars/adventurer-potion.png';
      default:
        return '/avatars/adventurer-idle.png';
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl">⏳ Loading...</div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Connect Wallet to Play</h2>
          <ConnectButton />
        </div>
      </div>
    );
  }

  if (!hasNFT) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-bold mb-4">No Aventurer NFT Found</h2>
          <p className="text-gray-300 mb-6">You need an Aventurer NFT to play DungeonFlip</p>
          <Link
            href="/mint"
            className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-lg transition"
          >
            🎨 Mint Aventurer NFT
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      {/* Resume Dialog */}
      {showResumeDialog && playerSession && playerSession.active && (
        <ResumeGameDialog
          session={playerSession}
          onResume={handleResumeGame}
        />
      )}

      {/* Death Confirmation Dialog */}
      {playerDied && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-red-900 to-red-950 border-2 border-red-500 rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">💀 You Died!</h2>

            <div className="bg-black/40 rounded-lg p-4 mb-6">
              <p className="text-gray-300 mb-3">
                Your adventure has come to an end...
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Room Reached:</p>
                  <p className="text-white font-bold">{currentRoom}</p>
                </div>
                <div>
                  <p className="text-gray-400">Gems Collected:</p>
                  <p className="text-blue-400 font-bold">{gemsCollected} 💎</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirmDeath}
              disabled={isConfirmingDeath}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-red-500/50"
            >
              {isConfirmingDeath ? '⏳ Confirming...' : '☠️ Confirm Death & Record on Chain'}
            </button>

            <p className="text-xs text-gray-400 mt-4 text-center">
              This will record your death on the blockchain and end your game session.
            </p>
          </div>
        </div>
      )}

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

      <main className="container mx-auto px-4 py-8">
        {!isPlaying ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-8 text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to Enter the Dungeon?</h2>
              
              {stats && tokenId !== undefined && tokenId !== null && (
                <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold mb-4">Your Aventurer Stats (Token #{(tokenId as bigint).toString()})</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-red-400">⚔️ {stats.atk.toString()}</div>
                      <div className="text-sm text-gray-400">Attack</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-400">🛡️ {stats.def.toString()}</div>
                      <div className="text-sm text-gray-400">Defense</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-400">❤️ {stats.hp.toString()}</div>
                      <div className="text-sm text-gray-400">Health</div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleStartGame}
                disabled={isPending || isConfirming}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-lg text-xl transition transform hover:scale-105 disabled:transform-none"
              >
                {isPending ? '⏳ Confirm in Wallet...' : isConfirming ? '⏳ Starting Game...' : '⚔️ Start Game (0.00001 ETH)'}
              </button>

              <p className="text-gray-400 text-sm mt-4">
                Entry fee: 0.00001 ETH • 70% goes to weekly prize pool
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* Stats Bar */}
            <div className="bg-gray-800/50 border border-purple-500/30 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-5 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-400">Room</div>
                  <div className="text-2xl font-bold text-purple-400">{currentRoom}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">HP</div>
                  <div className="text-2xl font-bold text-green-400">{playerHP}/{maxHP}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">ATK</div>
                  <div className="text-2xl font-bold text-red-400">⚔️ {playerATK}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">DEF</div>
                  <div className="text-2xl font-bold text-blue-400">🛡️ {playerDEF}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Gems</div>
                  <div className="text-2xl font-bold text-yellow-400">💎 {gemsCollected}</div>
                </div>
              </div>
            </div>

            {/* Combat or Card Selection */}
            {inCombat && currentMonster ? (
              <div className="relative mb-6">
                {/* Combat Overlay */}
                <div className="combat-overlay absolute inset-0 -z-10 rounded-xl" />
                
                <div className="royal-board p-8">
                  <div className="text-center mb-6">
                    <div className="inline-block bg-red-900/40 border border-red-500/60 rounded-lg px-6 py-2 mb-4">
                      <div className="text-lg font-bold text-red-300">⚔️ Your Turn!</div>
                    </div>
                    <h3 className="text-3xl font-bold text-red-400">
                      Combat: {currentMonster.name}
                    </h3>
                  </div>
                  
                  <div className="flex justify-around items-center mb-8">
                    <div className="character-card">
                      <Image 
                        src={getAventurerImage(CARD_TYPES.MONSTER)} 
                        alt="Aventurer" 
                        width={120} 
                        height={120}
                        className="mb-3 mx-auto"
                      />
                      <div className="text-xl font-bold text-amber-100">You</div>
                      <div className="mt-3 space-y-1">
                        <div className="text-green-400 dot-matrix">❤️ HP: {playerHP}/{maxHP}</div>
                        <div className="text-red-400 dot-matrix">⚔️ ATK: {playerATK}</div>
                        <div className="text-blue-400 dot-matrix">🛡️ DEF: {playerDEF}</div>
                      </div>
                    </div>
                    
                    <div className="text-5xl animate-pulse">⚔️</div>
                    
                    <div className="character-card border-red-500/50 bg-red-900/20">
                      <Image 
                        src="/cards/monster.png" 
                        alt={currentMonster.name} 
                        width={120} 
                        height={120}
                        className="mb-3 mx-auto"
                      />
                      <div className="text-xl font-bold text-red-300">{currentMonster.name}</div>
                      <div className="mt-3 space-y-1">
                        <div className="text-red-400 dot-matrix">❤️ HP: {monsterHP}/{currentMonster.hp}</div>
                        <div className="text-orange-400 dot-matrix">💥 DMG: {currentMonster.atk - playerDEF > 0 ? currentMonster.atk - playerDEF : 1}-{currentMonster.atk}</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={attack}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-8 rounded-lg text-xl transition transform hover:scale-105 shadow-lg"
                  >
                    ⚔️ Attack!
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <h3 className="text-3xl font-bold text-center mb-6 text-dungeon-gold">
                  🏰 Room {currentRoom} - Choose Your Fate
                </h3>
                <div className="grid grid-cols-4 gap-4 mb-8">
                  {cards.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => handleCardClick(card.id)}
                      className="game-card group"
                    >
                      <div className="relative z-10">
                        <Image 
                          src={getCardImage(card.type)} 
                          alt={getCardName(card.type)} 
                          width={150} 
                          height={200}
                          className="mb-3 mx-auto"
                        />
                        <div className="font-bold text-lg text-amber-100">{getCardName(card.type)}</div>
                        {card.monster && (
                          <div className="text-sm text-amber-300/80 mt-2">
                            {card.monster.name}
                          </div>
                        )}
                        {card.gemValue && (
                          <div className="text-lg text-yellow-400 mt-2 dot-matrix">
                            +{card.gemValue} 💎
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Section: Character Card + Adventure Log */}
            <div className="grid grid-cols-3 gap-6 mb-6">
              {/* Character Card - Left */}
              <div className="character-card">
                <div className="text-center mb-4">
                  <Image 
                    src="/avatars/adventurer-idle.png" 
                    alt="Your Aventurer" 
                    width={120} 
                    height={120}
                    className="mx-auto mb-2"
                  />
                  <div className="text-xl font-bold text-amber-100">Your Aventurer</div>
                  {tokenId !== undefined && tokenId !== null && (
                    <div className="text-xs text-amber-300/70">Token #{(tokenId as bigint).toString()}</div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="stat-box">
                    <div className="text-xs text-gray-400">Room</div>
                    <div className="text-2xl font-bold text-purple-400 dot-matrix">{currentRoom}</div>
                  </div>
                  <div className="stat-box">
                    <div className="text-xs text-gray-400">Health</div>
                    <div className="text-2xl font-bold text-green-400 dot-matrix">❤️ {playerHP}/{maxHP}</div>
                  </div>
                  <div className="stat-box">
                    <div className="text-xs text-gray-400">Attack</div>
                    <div className="text-2xl font-bold text-red-400 dot-matrix">⚔️ {playerATK}</div>
                  </div>
                  <div className="stat-box">
                    <div className="text-xs text-gray-400">Defense</div>
                    <div className="text-2xl font-bold text-blue-400 dot-matrix">🛡️ {playerDEF}</div>
                  </div>
                  <div className="stat-box">
                    <div className="text-xs text-gray-400">Gems</div>
                    <div className="text-2xl font-bold text-yellow-400 dot-matrix">💎 {gemsCollected}</div>
                  </div>
                </div>
                
                {/* Exit Button inside Character Card */}
                <button
                  onClick={handleExitDungeon}
                  disabled={inCombat}
                  className="w-full mt-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition shadow-lg"
                >
                  {inCombat ? '⚔️ In Combat!' : `🚪 Exit (Save ${gemsCollected} 💎)`}
                </button>
              </div>

              {/* Adventure Log - Right (spans 2 columns) */}
              <div className="col-span-2">
                <AdventureLog address={address} tokenId={tokenId} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
