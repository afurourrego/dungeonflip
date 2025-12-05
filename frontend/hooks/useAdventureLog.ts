import { usePublicClient } from 'wagmi';
import { useEffect, useState } from 'react';
import { CONTRACTS } from '@/lib/constants';
import DungeonGameABI from '@/lib/contracts/DungeonGame.json';

export interface AdventureLogEntry {
  type: 'checkpoint' | 'roomCompleted' | 'playerDied' | 'gameStarted' | 'gameEnded';
  blockNumber: bigint;
  timestamp: number;
  data: any;
}

export function useAdventureLog(address?: `0x${string}`, tokenId?: bigint) {
  const publicClient = usePublicClient();
  const [logs, setLogs] = useState<AdventureLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!publicClient || !address || !tokenId) return;

    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        // Get logs from the last 10000 blocks (approximately last hour)
        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock - BigInt(10000);

        // Fetch all relevant events
        const [
          checkpointLogs,
          roomCompletedLogs,
          playerDiedLogs,
          gameStartedLogs,
          gameEndedLogs,
        ] = await Promise.all([
          publicClient.getLogs({
            address: CONTRACTS.DUNGEON_GAME,
            event: DungeonGameABI.abi.find((e: any) => e.name === 'GameCheckpoint') as any,
            args: { player: address, tokenId },
            fromBlock,
            toBlock: 'latest',
          }),
          publicClient.getLogs({
            address: CONTRACTS.DUNGEON_GAME,
            event: DungeonGameABI.abi.find((e: any) => e.name === 'RoomCompleted') as any,
            args: { player: address, tokenId },
            fromBlock,
            toBlock: 'latest',
          }),
          publicClient.getLogs({
            address: CONTRACTS.DUNGEON_GAME,
            event: DungeonGameABI.abi.find((e: any) => e.name === 'PlayerDied') as any,
            args: { player: address, tokenId },
            fromBlock,
            toBlock: 'latest',
          }),
          publicClient.getLogs({
            address: CONTRACTS.DUNGEON_GAME,
            event: DungeonGameABI.abi.find((e: any) => e.name === 'GameStarted') as any,
            args: { player: address, tokenId },
            fromBlock,
            toBlock: 'latest',
          }),
          publicClient.getLogs({
            address: CONTRACTS.DUNGEON_GAME,
            event: DungeonGameABI.abi.find((e: any) => e.name === 'GameEnded') as any,
            args: { player: address, tokenId },
            fromBlock,
            toBlock: 'latest',
          }),
        ]);

        // Combine and sort by block number
        const allLogs: AdventureLogEntry[] = [];

        checkpointLogs.forEach((log: any) => {
          allLogs.push({
            type: 'checkpoint',
            blockNumber: log.blockNumber,
            timestamp: Date.now(), // Will be replaced with actual timestamp
            data: log.args,
          });
        });

        roomCompletedLogs.forEach((log: any) => {
          allLogs.push({
            type: 'roomCompleted',
            blockNumber: log.blockNumber,
            timestamp: Date.now(),
            data: log.args,
          });
        });

        playerDiedLogs.forEach((log: any) => {
          allLogs.push({
            type: 'playerDied',
            blockNumber: log.blockNumber,
            timestamp: Date.now(),
            data: log.args,
          });
        });


        gameStartedLogs.forEach((log: any) => {
          allLogs.push({
            type: 'gameStarted',
            blockNumber: log.blockNumber,
            timestamp: Date.now(),
            data: log.args,
          });
        });

        gameEndedLogs.forEach((log: any) => {
          allLogs.push({
            type: 'gameEnded',
            blockNumber: log.blockNumber,
            timestamp: Date.now(),
            data: log.args,
          });
        });

        // Sort by block number (oldest first)
        allLogs.sort((a, b) => Number(a.blockNumber - b.blockNumber));

        setLogs(allLogs);
      } catch (error) {
        console.error('Error fetching adventure logs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [publicClient, address, tokenId]);

  return { logs, isLoading };
}
