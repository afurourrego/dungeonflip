'use client';

import { useAdventureLog, AdventureLogEntry, AdventureLogEntryType } from '@/hooks/useAdventureLog';
import { useEffect, useRef, useState } from 'react';

interface AdventureLogProps {
  address?: `0x${string}`;
  tokenId?: bigint;
  currentRunStartBlock?: bigint;
  onRefetch?: (refetchFn: () => void) => void;
}

function getEventIcon(type: AdventureLogEntryType): string {
  switch (type) {
    case 'runStarted':
      return '🎮';
    case 'cardResolved':
      return '🃏';
    case 'runPaused':
      return '⏸️';
    case 'runDied':
      return '💀';
    case 'runExited':
      return '🏆';
    default:
      return '📝';
  }
}

function getEventColor(type: AdventureLogEntryType, cardType?: number): string {
  switch (type) {
    case 'runStarted':
      return 'text-green-400';
    case 'cardResolved':
      // Color by card type: Monster=red, Trap=purple, Potion=green, Treasure=blue
      if (cardType !== undefined) {
        switch (cardType) {
          case 0: return 'text-red-400';      // Monster
          case 1: return 'text-purple-400';   // Trap
          case 2: return 'text-green-400';    // Potion +1
          case 3: return 'text-green-300';    // Full Heal (brighter green)
          case 4: return 'text-blue-400';     // Treasure
          default: return 'text-gray-400';
        }
      }
      return 'text-blue-400';
    case 'runPaused':
      return 'text-yellow-400';
    case 'runDied':
      return 'text-red-400';
    case 'runExited':
      return 'text-amber-300';
    default:
      return 'text-gray-400';
  }
}

function formatEventMessage(entry: AdventureLogEntry): string {
  switch (entry.type) {
    case 'runStarted':
      return entry.data.resumed
        ? `🚪 Adventurer returned to the dungeon, continuing from room ${entry.data.room}...`
        : `⚔️ Adventurer enters the dungeon, ready to face the unknown!`;
    case 'cardResolved': {
      const cardType = Number(entry.data.cardType);
      const room = entry.data.room;
      const hp = entry.data.hp;
      const gems = entry.data.gems;

      // 0 = Monster, 1 = Trap, 2 = Potion +1, 3 = Full Heal, 4 = Treasure
      let narrative = '';
      switch (cardType) {
        case 0: // Monster
          narrative = `⚔️ A monster appeared in room ${room}! After a fierce battle, you survived`;
          break;
        case 1: // Trap
          narrative = `💀 You triggered a trap in room ${room}! The walls closed in`;
          break;
        case 2: // Potion +1
          narrative = `🧪 You found a small healing potion in room ${room}! Restored 1 HP`;
          break;
        case 3: // Full Heal
          narrative = `✨ You discovered a mystical fountain in room ${room}! Fully restored your health`;
          break;
        case 4: // Treasure
          narrative = `💎 Treasure chest discovered in room ${room}! Gems collected`;
          break;
        default:
          narrative = `Room ${room} explored`;
      }
      return `${narrative} • HP: ${hp} • Gems: ${gems}`;
    }
    case 'runPaused':
      return `⏸️ Adventurer takes a rest at room ${entry.data.room} • HP: ${entry.data.hp} • Gems: ${entry.data.gems}`;
    case 'runDied':
      return `💀 The adventurer has fallen in room ${entry.data.room}... Their tale ends here • Final gems: ${entry.data.gems}`;
    case 'runExited':
      return `🏆 Victory! The adventurer escaped the dungeon alive! • ${entry.data.roomsCleared} rooms cleared • ${entry.data.gems} gems • Score: ${entry.data.score}`;
    default:
      return 'Unknown event';
  }
}

export function AdventureLog({ address, tokenId, currentRunStartBlock, onRefetch }: AdventureLogProps) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  const { logs, isLoading, refetch } = useAdventureLog(address, tokenId, currentRunStartBlock);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Expose refetch to parent via callback
  useEffect(() => {
    if (onRefetch) {
      onRefetch(refetch);
    }
  }, [onRefetch, refetch]);

  // Keep the newest entry visible (we render newest-first).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = 0;
  }, [logs.length]);

  if (!isClient) {
    return (
      <div className="adventure-log p-4 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📜</span>
          <h3 className="text-xl font-bold text-dungeon-accent-gold">Adventure Log</h3>
        </div>
        <p className="text-gray-500 text-sm">Preparing log...</p>
      </div>
    );
  }

  if (!address || !tokenId) {
    return (
      <div className="adventure-log p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📜</span>
          <h3 className="text-xl font-bold text-dungeon-accent-gold">Adventure Log</h3>
        </div>
        <p className="text-gray-400 text-sm">No active game session</p>
      </div>
    );
  }

  return (
    <div className="adventure-log p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📜</span>
        <h3 className="text-xl font-bold text-dungeon-accent-gold">Adventure Log</h3>
        {isLoading && (
          <span className="ml-auto text-xs text-gray-400 animate-pulse">Loading...</span>
        )}
      </div>

      <div ref={scrollRef} className="h-[300px] overflow-y-auto pr-4">
        {logs.length === 0 ? (
          <p className="text-gray-400 text-sm italic">No events recorded yet</p>
        ) : (
          <div className="space-y-2">
            {logs.map((entry, index) => {
              const cardType = entry.type === 'cardResolved' ? Number(entry.data.cardType) : undefined;
              return (
                <div
                  key={`${entry.type}-${entry.blockNumber}-${index}`}
                  className="flex items-start gap-2 p-2 rounded bg-dungeon-bg-darker/60 border border-dungeon-border-dark/40 hover:bg-dungeon-bg-darker transition-colors"
                >
                  <span className="text-xl flex-shrink-0">{getEventIcon(entry.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${getEventColor(entry.type, cardType)}`}>
                      {formatEventMessage(entry)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Block #{entry.blockNumber.toString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {logs.length > 0 && (
        <div className="mt-3 pt-3 border-t border-dungeon-border-medium/30">
          <p className="text-xs text-gray-400">
            Total events: {logs.length} | Latest block: {logs[logs.length - 1]?.blockNumber.toString()}
          </p>
        </div>
      )}
    </div>
  );
}
