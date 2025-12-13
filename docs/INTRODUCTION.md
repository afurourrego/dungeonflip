# Welcome to DungeonFlip! ⚔️

**A Fully On-Chain Dungeon Crawler on Base**

---

## What is DungeonFlip?

DungeonFlip is a roguelike dungeon crawler game built entirely on the Base blockchain. Every decision, every card flip, every battle happens on-chain with complete transparency and provable fairness.

**In Simple Terms:**
1. Mint a unique Aventurer NFT with random stats
2. Pay a small entry fee (0.00001 ETH ≈ $0.04)
3. Choose from 3 cards each room to progress deeper
4. Collect gems, defeat monsters, avoid traps
5. Exit safely to earn score and compete for weekly prizes
6. Top 10 players split 70% of all entry fees

Think: **Slay the Spire meets Blockchain meets Weekly Prize Pool**

---

## Why DungeonFlip?

### For Gamers 🎮

**Real Gameplay, Not Just Trading:**
- Strategic decisions matter (which card to flip?)
- Roguelike depth (every run is different)
- Risk vs. reward (exit early for safe score, or push deeper?)
- Competitive leaderboards (prove your skill)

**Low Barrier to Entry:**
- Free NFT minting (just gas)
- Tiny entry fee ($0.04 per game)
- No complex tokenomics to understand
- Play immediately after minting

**Provably Fair:**
- All game logic on-chain
- Verifiable randomness
- No hidden mechanics
- Can't be rigged by developers

### For Crypto Enthusiasts 💎

**True Web3 Gaming:**
- 100% on-chain gameplay (no servers)
- Composable NFTs (your stats, your ownership)
- Transparent prize distribution
- Built on Base L2 (low gas, fast finality)

**Sustainable Economics:**
- No inflationary token
- Prizes come from player fees (zero-sum, no Ponzi)
- Realistic rewards scale with player volume
- Dev fund ensures ongoing development

**Educational:**
- See how on-chain games work
- Learn about verifiable randomness
- Understand smart contract interactions
- Study sustainable tokenomics

---

## How to Play (Quick Start)

### Step 1: Get Setup

**What You Need:**
- MetaMask or compatible wallet
- Base Sepolia testnet configured
- ~0.001 ETH for gas (get free from faucet)

**Get Testnet ETH:**
1. Visit [base-sepolia faucet](https://www.coinbase.com/faucets/base-sepolia-faucet)
2. Connect wallet
3. Claim 0.05 ETH (free, once per day)

**Add Base Sepolia to Wallet:**
- Network: Base Sepolia
- RPC: https://sepolia.base.org
- Chain ID: 84532
- Currency: ETH
- Explorer: https://sepolia.basescan.org

### Step 2: Mint Your Aventurer NFT

1. Go to DungeonFlip website
2. Click "Mint Aventurer"
3. Confirm transaction (gas only, ~$0.40)
4. Wait for confirmation
5. Your NFT has unique stats:
   - **ATK** (Attack): 1-2
   - **DEF** (Defense): 1-2
   - **HP** (Health Points): 4-6

**Pro Tip**: Higher HP = longer survival. ATK and DEF help in combat.

### Step 3: Enter the Dungeon

1. Click "Enter Dungeon"
2. Pay entry fee (0.00001 ETH + gas)
3. Your NFT is locked in the game contract
4. Game begins at Room 1

### Step 4: Choose Cards

Each room, you see **3 face-down cards**:
- Click one to reveal it
- Card resolves automatically
- Continue to next room

**Card Types:**
- 🐉 **Monster** (45%): Fight a random enemy
- 💎 **Treasure** (30%): Gain 0-15 gems
- 💀 **Trap** (15%): Take 1-2 damage
- 🧪 **Potion** (10%): Heal 1 HP or fully restore

### Step 5: Combat (When You Hit a Monster)

**Turn-Based Battle** (automatic):
- You attack (80% hit chance)
- Enemy attacks (70% hit chance)
- Damage = ATK - DEF (minimum 1)
- First to 0 HP loses

**Example:**
```
Your Aventurer: ATK 2, DEF 1, HP 5
Monster: ATK 3, DEF 0, HP 4

Round 1: You hit for 2 damage (Monster HP: 2)
Round 2: Monster hits for 2 damage (Your HP: 3)
Round 3: You hit for 2 damage (Monster HP: 0)
Result: Victory! Continue playing
```

### Step 6: Exit or Die

**Option A: Voluntary Exit**
- Click "Exit Dungeon" anytime
- Keep all gems collected
- NFT returned to wallet
- Score calculated: `(Rooms * 100) + (Gems * 10) + (HP * 5)`

**Option B: Death**
- HP reaches 0 in combat
- Lose all gems
- Score reduced (rooms cleared only)
- NFT still returned safely

**Leaderboard:**
Your score adds to your weekly total. Top 10 win prizes!

---

## Game Mechanics Deep Dive

### Stats Explained

**ATK (Attack):**
- Determines damage dealt in combat
- Range: 1-2
- Higher = monsters die faster

**DEF (Defense):**
- Reduces incoming damage
- Range: 1-2
- Higher = take less damage per hit

**HP (Health Points):**
- Your life total
- Range: 4-6 (at mint)
- Reaches 0 = death

**Gems:**
- Collected from Treasure cards
- Each gem = 10 score points
- Lost on death

### Card Probabilities

| Card | Chance | Good/Bad |
|------|--------|----------|
| Monster | 45% | ⚠️ Risky |
| Treasure | 30% | ✅ Good |
| Trap | 15% | ❌ Bad |
| Potion | 10% | ✅ Good |

### Treasure Rewards

When you flip Treasure:
- 60% chance: No gems
- 30% chance: 5 gems
- 8% chance: 10 gems
- 2% chance: 15 gems (lucky!)

### Monster Stats (Random Each Fight)

- **HP**: 3-6
- **ATK**: 1-4
- **DEF**: 0-1

**Strategy Tip**: Early rooms have easier monsters. As you go deeper, luck matters more!

### Scoring Formula

```
Score = (Rooms Cleared × 100) + (Gems × 10) + (Max HP × 5)
```

**Examples:**
- 10 rooms, 20 gems, 6 HP = 1,230 points
- 25 rooms, 50 gems, 5 HP = 3,025 points (top 10 material!)

### Weekly Seasons

- **Duration**: 7 days (Monday to Monday)
- **Reset**: Scores reset each week
- **Prize Pool**: 70% of all entry fees collected
- **Distribution**: Top 10 split prizes
- **Advance**: Automatic (every 6+ days)

---

## Prize Distribution

### How It Works

1. Every game costs 0.00001 ETH
2. Fees split automatically:
   - 70% → Prize pool
   - 20% → Development fund
   - 10% → Marketing fund

3. Each week, top 10 players split prize pool:
   - 1st: 30%
   - 2nd: 20%
   - 3rd: 15%
   - 4th: 10%
   - 5th: 8%
   - 6th: 6%
   - 7th: 4%
   - 8th: 3%
   - 9th: 2%
   - 10th: 2%

### Prize Examples

**Scenario: 1,000 games played this week**

- Total fees: 0.01 ETH
- Prize pool: 0.007 ETH (~$28 at $4k ETH)

| Rank | Prize | USD Value |
|------|-------|-----------|
| 1st | 0.0021 ETH | $8.40 |
| 2nd | 0.0014 ETH | $5.60 |
| 3rd | 0.00105 ETH | $4.20 |
| 10th | 0.00014 ETH | $0.56 |

**Scenario: 10,000 games played**

- Total fees: 0.1 ETH
- Prize pool: 0.07 ETH (~$280)

| Rank | Prize | USD Value |
|------|-------|-----------|
| 1st | 0.021 ETH | $84.00 |
| 2nd | 0.014 ETH | $56.00 |
| 3rd | 0.0105 ETH | $42.00 |
| 10th | 0.0014 ETH | $5.60 |

**Key Point**: Prizes grow with player activity. More players = bigger prizes!

---

## Strategy Tips

### For Beginners

1. **Play Conservatively First**: Learn mechanics, don't risk too much
2. **Exit Early**: 10-15 rooms is a safe goal initially
3. **Watch Your HP**: Below 3 HP? Consider exiting
4. **Don't Chase Gems**: Score comes mostly from rooms cleared
5. **Study the Leaderboard**: See what scores are competitive

### For Advanced Players

1. **Push High HP**: 6 HP lets you take 2-3 hits safely
2. **Calculate Risk**: ATK 2 + DEF 2 = safer deep runs
3. **Gem Multiplier**: Late-game treasures give big score boosts
4. **End-of-Week Timing**: Play Sunday night for less competition
5. **Multiple Attempts**: Each NFT can play unlimited times per week

### Common Mistakes

❌ **Greedy Playing**: Going too deep with low HP
❌ **Ignoring Stats**: Not considering your NFT's strengths
❌ **Panic Exiting**: Exiting too early out of fear
❌ **One-Shot Runs**: Not playing enough games to refine strategy
❌ **Ignoring Leaderboard**: Not knowing competitive scores

---

## FAQ

### General

**Q: Is this real money?**
A: On testnet, no. On mainnet (coming Q2 2026), yes - but with small amounts ($0.04 entry).

**Q: Can I lose my NFT?**
A: No! Your NFT is always returned, even if you die.

**Q: What if I disconnect mid-game?**
A: Your game state is saved on-chain. Reconnect and resume anytime.

**Q: How often can I play?**
A: Unlimited! But your score accumulates weekly for leaderboard.

### Technical

**Q: What's "on-chain" mean?**
A: All game logic runs on blockchain smart contracts, not a company's server.

**Q: Is the randomness fair?**
A: Yes, it uses block data that cannot be predicted or manipulated by players.

**Q: Can developers cheat?**
A: No, all code is public and auditable. We can't change outcomes.

**Q: What if there's a bug?**
A: Contracts have emergency pause functionality. We'll fix and redeploy if needed.

### Economic

**Q: Is this gambling?**
A: It's a skill game with random elements (like poker). Laws vary by region.

**Q: Can I make money?**
A: Top players can win prizes, but it's entertainment, not investment.

**Q: What if no one plays?**
A: Prize pool would be tiny. Game is fun regardless, but rewards need player volume.

**Q: Why such a small entry fee?**
A: Accessibility! We want gamers, not just whales.

---

## Community

### Get Involved

**Discord** (TBD):
- Chat with players
- Find teammates
- Report bugs
- Suggest features

**Twitter** [@DungeonFlipGame](https://twitter.com) (TBD):
- Follow for updates
- Share your wins
- Meme contests

**GitHub**:
- Report issues
- Contribute code
- Review documentation

### Content Creation

**We Love Community Content!**
- Stream your runs on Twitch
- Make YouTube tutorials
- Write strategy guides
- Create memes and art

**Rewards**: Top content creators get featured and may receive prizes/NFTs.

---

## Troubleshooting

### Common Issues

**Problem**: "Transaction failed" when minting
- **Solution**: Increase gas limit in MetaMask settings

**Problem**: "Not enough gas"
- **Solution**: Get more testnet ETH from faucet

**Problem**: "NFT not showing"
- **Solution**: Wait 30 seconds, refresh page. Check wallet on BaseScan.

**Problem**: Game stuck loading
- **Solution**: Clear browser cache, reconnect wallet

**Problem**: Wrong network
- **Solution**: Switch to Base Sepolia in wallet

### Need Help?

1. Check GitHub Issues for known bugs
2. Ask in Discord #support channel
3. Tag @support on Twitter
4. Email: support@dungeonflip.game (TBD)

---

## What's Next?

### Immediate (This Month)
- Finish hackathon submission
- Deploy frontend to production URL
- Begin community building

### Short-Term (Q1 2026)
- Player profiles and history
- Past seasons archive
- Mobile optimizations
- Community events

### Long-Term (2026+)
- Mainnet launch on Base
- Multiple dungeon types
- Boss battles
- Guild system
- See full [Roadmap](./ROADMAP.md)

---

## Ready to Play?

🎮 **[Play Now on Testnet →](#)** (Link TBD)

📖 **Learn More:**
- [Whitepaper](./WHITEPAPER.md) - Deep dive into mechanics and economics
- [Roadmap](./ROADMAP.md) - Future plans and features
- [Smart Contracts](../contracts/) - Read the source code

---

**Welcome to the dungeon, adventurer. Will you survive?** ⚔️💎

*Built with ❤️ for the Seedify Vibe Coins Hackathon*
