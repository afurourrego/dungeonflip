'use client';

import { useAdventureLog, AdventureLogEntry, AdventureLogEntryType } from '@/hooks/useAdventureLog';
import { useEffect, useState } from 'react';

interface AdventureLogProps {
  address?: `0x${string}`;
  tokenId?: bigint;
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

function getEventColor(type: AdventureLogEntryType): string {
  switch (type) {
    case 'runStarted':
      return 'text-green-400';
    case 'cardResolved':
      return 'text-blue-400';
    case 'runPaused':
      return 'text-purple-400';
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
      return `Run ${entry.data.resumed ? 'resumed' : 'started'} at room ${entry.data.room}`;
    case 'cardResolved':
      return `Card resolved • Room ${entry.data.room} • HP ${entry.data.hp} • Gems ${entry.data.gems}`;
    case 'runPaused':
      return `Run paused at room ${entry.data.room} • HP ${entry.data.hp} • Gems ${entry.data.gems}`;
    case 'runDied':
      return `Adventurer fell in room ${entry.data.room} • Gems ${entry.data.gems}`;
    case 'runExited':
      return `Victory! Rooms ${entry.data.roomsCleared} • Gems ${entry.data.gems} • Score ${entry.data.score}`;
    default:
      return 'Unknown event';
  }
}

export function AdventureLog({ address, tokenId }: AdventureLogProps) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  const { logs, isLoading } = useAdventureLog(address, tokenId);

  if (!isClient) {
    return (
      <div className="p-4 bg-black/60 border border-amber-700/30 rounded-lg animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📜</span>
          <h3 className="text-xl font-bold text-amber-200">Adventure Log</h3>
        </div>
        <p className="text-gray-500 text-sm">Preparing log...</p>
      </div>
    );
  }

  if (!address || !tokenId) {
    return (
      <div className="p-4 bg-black/60 border border-amber-700/30 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📜</span>
          <h3 className="text-xl font-bold text-amber-200">Adventure Log</h3>
        </div>
        <p className="text-gray-400 text-sm">No active game session</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-black/60 border border-amber-700/30 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📜</span>
        <h3 className="text-xl font-bold text-amber-200">Adventure Log</h3>
        {isLoading && (
          <span className="ml-auto text-xs text-gray-400 animate-pulse">Loading...</span>
        )}
      </div>

      <div className="h-[300px] overflow-y-auto pr-4">
        {logs.length === 0 ? (
          <p className="text-gray-400 text-sm italic">No events recorded yet</p>
        ) : (
          <div className="space-y-2">
            {logs.map((entry, index) => (
              <div
                key={`${entry.type}-${entry.blockNumber}-${index}`}
                className="flex items-start gap-2 p-2 rounded bg-black/40 hover:bg-black/60 transition-colors"
              >
                <span className="text-xl flex-shrink-0">{getEventIcon(entry.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${getEventColor(entry.type)}`}>
                    {formatEventMessage(entry)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Block #{entry.blockNumber.toString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {logs.length > 0 && (
        <div className="mt-3 pt-3 border-t border-amber-700/30">
          <p className="text-xs text-gray-400">
            Total events: {logs.length} | Latest block: {logs[logs.length - 1]?.blockNumber.toString()}
          </p>
        </div>
      )}
    </div>
  );
}
