import { useEffect, useState } from 'react';

/**
 * Hook to manage the user's selected token ID for gameplay
 * Stores selection in localStorage and provides methods to change it
 * Automatically clears invalid selections (tokens no longer owned)
 */
export function useSelectedToken(address?: `0x${string}`, ownedTokens?: bigint[], skipValidation?: boolean) {
  const [selectedTokenId, setSelectedTokenId] = useState<bigint | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    if (!address) {
      setSelectedTokenId(null);
      return;
    }

    const storageKey = `selectedToken_${address.toLowerCase()}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      try {
        const tokenId = BigInt(stored);
        setSelectedTokenId(tokenId);
      } catch {
        // Invalid stored value, clear it
        localStorage.removeItem(storageKey);
        setSelectedTokenId(null);
      }
    }
  }, [address]);

  // Validate selected token against owned tokens (skip if in active game)
  useEffect(() => {
    if (!selectedTokenId || !ownedTokens || ownedTokens.length === 0 || skipValidation) return;

    // Check if selected token is still owned
    const isValid = ownedTokens.some((tokenId) => tokenId === selectedTokenId);

    if (!isValid) {
      // Token no longer owned AND not in active game, clear selection
      selectToken(null);
      console.log(`Selected token #${selectedTokenId} is no longer owned, clearing selection`);
    }
  }, [selectedTokenId, ownedTokens, skipValidation]);

  // Save to localStorage when selection changes
  const selectToken = (tokenId: bigint | null) => {
    setSelectedTokenId(tokenId);

    if (!address) return;

    const storageKey = `selectedToken_${address.toLowerCase()}`;
    if (tokenId === null) {
      localStorage.removeItem(storageKey);
    } else {
      localStorage.setItem(storageKey, tokenId.toString());
    }
  };

  return {
    selectedTokenId,
    selectToken,
  };
}
