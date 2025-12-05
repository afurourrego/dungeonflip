'use client';

import { useAdventureLog, AdventureLogEntry } from '@/hooks/useAdventureLog';

interface AdventureLogProps {
  address?: `0x${string}`;
  tokenId?: bigint;
}

function getEventIcon(type: AdventureLogEntry['type']): string {
  switch (type) {
    case 'gameStarted':
      return '🎮';
    case 'roomCompleted':
      return '✅';
    case 'checkpoint':
      return '💾';
    case 'playerDied':
      return '💀';
    case 'gameEnded':
      return '🏆';
    default:
      return '📝';
  }
}

function getEventColor(type: AdventureLogEntry['type']): string {
  switch (type) {
    case 'gameStarted':
      return 'text-green-400';
    case 'roomCompleted':
      return 'text-blue-400';
    case 'checkpoint':
      return 'text-purple-400';
    case 'playerDied':
      return 'text-red-400';
    case 'gameEnded':
      return 'text-gold-400';
    default:
      return 'text-gray-400';
  }
}

function formatEventMessage(entry: AdventureLogEntry): string {
  switch (entry.type) {
    case 'gameStarted':
      return `Game started with Token #${entry.data.tokenId}`;
    case 'roomCompleted':
      return `Room ${entry.data.roomNumber} completed | HP: ${entry.data.hpRemaining} | Gems: ${entry.data.gemsCollected}`;
    case 'checkpoint':
      return `Checkpoint saved at Room ${entry.data.currentRoom} | HP: ${entry.data.currentHP} | Gems: ${entry.data.gemsCollected}`;
    case 'playerDied':
      return `Player died in Room ${entry.data.roomNumber} | Gems collected: ${entry.data.gemsCollected}`;
    case 'gameEnded':
      return `Game completed! Score: ${entry.data.scoreEarned} | Gems: ${entry.data.gemsCollected}`;
    default:
      return 'Unknown event';
  }
}

export function AdventureLog({ address, tokenId }: AdventureLogProps) {
  const { logs, isLoading } = useAdventureLog(address, tokenId);

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
