import { usePublicClient } from 'wagmi';
import { useEffect, useState } from 'react';
import { CONTRACTS } from '@/lib/constants';
import DungeonGameABI from '@/lib/contracts/DungeonGame.json';

export type AdventureLogEntryType =
  | 'runStarted'
  | 'cardResolved'
  | 'runPaused'
  | 'runExited'
  | 'runDied';

export interface AdventureLogEntry {
  type: AdventureLogEntryType;
  blockNumber: bigint;
  data: any;
}

const EVENT_MAP: { name: string; type: AdventureLogEntryType }[] = [
  { name: 'RunStarted', type: 'runStarted' },
  { name: 'CardResolved', type: 'cardResolved' },
  { name: 'RunPaused', type: 'runPaused' },
  { name: 'RunExited', type: 'runExited' },
  { name: 'RunDied', type: 'runDied' },
];

export function useAdventureLog(address?: `0x${string}`, tokenId?: bigint) {
  const publicClient = usePublicClient();
  const [logs, setLogs] = useState<AdventureLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!publicClient || !tokenId) return;

    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const currentBlock = await publicClient.getBlockNumber();
        const windowSize = BigInt(10000);
        const fromBlock = currentBlock > windowSize ? currentBlock - windowSize : BigInt(0);

        const eventPromises = EVENT_MAP.map(async ({ name, type }) => {
          const eventAbi = DungeonGameABI.abi.find(
            (entry: any) => entry.type === 'event' && entry.name === name
          ) as any;
          if (!eventAbi) return [];

          const eventLogs = await publicClient.getLogs({
            address: CONTRACTS.DUNGEON_GAME,
            event: eventAbi,
            args: { tokenId },
            fromBlock,
            toBlock: 'latest',
          });

          return eventLogs.map((log) => {
            const args = (log as unknown as { args?: any }).args;
            return {
              type,
              blockNumber: log.blockNumber,
              data: args,
            };
          });
        });

        const resolved = (await Promise.all(eventPromises)).flat();
        resolved.sort((a, b) => Number(a.blockNumber - b.blockNumber));
        setLogs(resolved);
      } catch (error) {
        console.error('Error fetching adventure logs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [publicClient, tokenId]);

  return { logs, isLoading };
}
