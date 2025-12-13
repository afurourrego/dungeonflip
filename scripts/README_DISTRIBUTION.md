# Weekly Rewards Distribution

This directory contains scripts for managing weekly reward distributions in DungeonFlip.

## Scripts

### `distribute-rewards.ts`

Manually trigger weekly reward distribution to top 10 players.

**What it does:**
1. Checks if enough time has passed (6+ days since last distribution)
2. Verifies there's a prize pool available
3. Advances the week in RewardsPool contract
4. Gets top 10 players from ProgressTracker
5. Distributes prizes according to ranking (30%, 20%, 15%, etc.)

**Usage:**

```bash
# Testnet (Base Sepolia)
npx hardhat run scripts/distribute-rewards.ts --network baseSepolia

# Mainnet (when ready)
npx hardhat run scripts/distribute-rewards.ts --network baseMainnet
```

**Environment Variables:**

```bash
# Optional - defaults to latest deployed addresses
REWARDS_POOL_ADDRESS=0x9A19912DDb7e71b4dccC9036f9395D88979A4F17
PROGRESS_TRACKER_ADDRESS=0x623435ECC6b3B418d79EE396298aF59710632595
```

**When to run:**

- Every **Friday at 16:20 UTC** (or any consistent weekly schedule)
- Minimum 6 days must pass between distributions
- Can check eligibility anytime - script will report time remaining if too early

**Automation Options:**

### Option A: Cron Job (Linux/Mac)

Edit crontab:
```bash
crontab -e
```

Add line (runs every Friday at 16:20 UTC):
```cron
20 16 * * 5 cd /path/to/DungeonFlip && npx hardhat run scripts/distribute-rewards.ts --network baseSepolia >> logs/distribution.log 2>&1
```

### Option B: GitHub Actions (Recommended)

Create `.github/workflows/weekly-distribution.yml`:

```yaml
name: Weekly Rewards Distribution

on:
  schedule:
    # Every Friday at 16:20 UTC
    - cron: '20 16 * * 5'
  workflow_dispatch: # Allow manual trigger

jobs:
  distribute:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npx hardhat run scripts/distribute-rewards.ts --network baseSepolia
        env:
          PRIVATE_KEY: ${{ secrets.DEPLOYER_PRIVATE_KEY }}
```

### Option C: Chainlink Automation (Future)

For fully decentralized automation, integrate with Chainlink Keepers:

1. Deploy custom Upkeep contract
2. Register with Chainlink Automation
3. Fund with LINK tokens
4. Chainlink nodes will automatically call distribution weekly

**Note:** Not implemented yet - requires LINK tokens and additional contract logic.

## Prize Distribution

Current percentages (can be changed in RewardsPool contract):

| Rank | Percentage | Example (0.1 ETH pool) |
|------|-----------|----------------------|
| 1st  | 30%       | 0.03 ETH            |
| 2nd  | 20%       | 0.02 ETH            |
| 3rd  | 15%       | 0.015 ETH           |
| 4th  | 10%       | 0.01 ETH            |
| 5th  | 8%        | 0.008 ETH           |
| 6th  | 6%        | 0.006 ETH           |
| 7th  | 4%        | 0.004 ETH           |
| 8th  | 3%        | 0.003 ETH           |
| 9th  | 2%        | 0.002 ETH           |
| 10th | 2%        | 0.002 ETH           |

**Total:** 100% of accumulated fees (70% of entry fees)

## Troubleshooting

### "Too early to advance week"

Wait until 6 days have passed since the last distribution. Check time remaining:

```typescript
const timeUntil = await rewardsPool.timeUntilNextWeek();
console.log(`Hours remaining: ${Number(timeUntil) / 3600}`);
```

### "Must provide exactly 10 players"

The current contract requires exactly 10 players. If fewer players, the script pads with zero addresses. However, if RewardsPool rejects zero addresses, you'll need to either:
- Wait for 10 active players
- Update contract to accept fewer players
- Manually handle edge case

### "No prize pool available"

No entry fees were collected this week. The script will advance the week without distributing prizes.

### "Prize transfer failed"

One or more winner addresses rejected the ETH transfer. This could happen if:
- Winner is a contract without payable receive/fallback
- Winner contract has logic that reverts

**Solution:** Update RewardsPool to use pull-payment pattern for edge cases.

## Testing

Test on testnet before mainnet:

```bash
# Dry run - check without executing
npx hardhat run scripts/distribute-rewards.ts --network baseSepolia

# Check current state
npx hardhat console --network baseSepolia
> const pool = await ethers.getContractAt("RewardsPool", "0x9A19912DDb7e71b4dccC9036f9395D88979A4F17")
> await pool.canAdvanceWeek()
> await pool.getCurrentPoolBalance()
> await pool.timeUntilNextWeek()
```

## Security Considerations

1. **Private Key Security:** Never commit `.env` file with PRIVATE_KEY
2. **Access Control:** Only contract owner can call some functions
3. **Re-entrancy:** RewardsPool uses proper patterns to prevent attacks
4. **Gas Limits:** Distribution costs ~500k-800k gas for 10 players

## Manual Emergency Distribution

If script fails, you can distribute manually via Hardhat console:

```typescript
npx hardhat console --network baseSepolia

const pool = await ethers.getContractAt("RewardsPool", "ADDRESS");
const tracker = await ethers.getContractAt("ProgressTracker", "ADDRESS");

// Advance week
await pool.advanceWeek();

// Get top players
const [players, scores] = await tracker.getTopPlayers(WEEK_NUMBER);

// Distribute (must be exactly 10 addresses)
await pool.distributeRewards(players.slice(0, 10));
```

## Monitoring

Recommended monitoring setup:

1. **Transaction Monitoring:** Watch RewardsPool address on BaseScan
2. **Event Alerts:** Subscribe to `RewardsDistributed` events
3. **Balance Tracking:** Monitor pool balance doesn't grow too large
4. **Failed Distribution Alerts:** Set up alerts if script exits with error

## Support

For issues or questions:
- Check contract events on BaseScan
- Review `iteration_history.md` in `ai_logs/`
- See main project README for contract architecture
