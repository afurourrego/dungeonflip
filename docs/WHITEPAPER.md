# DungeonFlip Whitepaper

**Version 1.0 - December 2025**

---

## Executive Summary

DungeonFlip is a fully on-chain dungeon crawler game built on Base blockchain that combines roguelike gameplay mechanics with NFT ownership and competitive leaderboards. Players mint unique Aventurer NFTs with procedurally generated stats and compete in weekly seasons for ETH prizes.

**Key Features:**
- Fully on-chain gameplay - no off-chain dependencies
- Procedurally generated encounters using verifiable randomness
- Weekly competitive seasons with prize distribution
- Sustainable economic model with realistic rewards
- Built on Base L2 for low gas costs

---

## Vision & Mission

### Vision
Create a sustainable blockchain gaming ecosystem where skill, strategy, and luck combine to provide engaging competitive gameplay with meaningful rewards.

### Mission
Demonstrate that blockchain games can be:
- **Transparent**: All game logic verifiable on-chain
- **Fair**: Provably random outcomes
- **Sustainable**: Economic model scales with player volume
- **Accessible**: Low entry barriers ($0.00001 ETH per game)

---

## Problem Statement

Current blockchain gaming faces several challenges:

1. **Unsustainable Tokenomics**: Many games promise unrealistic APYs, leading to collapse
2. **Off-Chain Dependencies**: Game logic in centralized servers creates trust issues
3. **High Barriers to Entry**: Expensive NFTs and complex mechanics deter new players
4. **Lack of Competitive Depth**: Simple mechanics lead to short player retention

DungeonFlip addresses these by:
- Proportional rewards tied to player volume (no inflation)
- 100% on-chain game state and logic
- Low entry fee (0.00001 ETH = ~$0.04 USD)
- Roguelike depth with strategic decision-making

---

## Game Mechanics

### Core Gameplay Loop

1. **Mint Aventurer NFT** (free, gas only)
   - Unique stats: ATK (1-2), DEF (1-2), HP (4-6)
   - Stats determine survival chances

2. **Enter Dungeon** (0.00001 ETH entry fee)
   - Deposit NFT into game contract
   - Progress through rooms by choosing cards

3. **Choose Cards** (3 per room)
   - One revealed randomly each turn
   - Card types: Monster, Trap, Potion, Treasure
   - Strategic decisions affect survival

4. **Exit or Die**
   - Voluntary exit: Keep gems, earn score
   - Death: Lose gems, earn reduced score
   - Score determines leaderboard ranking

### Card Types & Probabilities

| Card Type | Probability | Effect |
|-----------|-------------|--------|
| Monster | 45% | Combat with random enemy (HP: 3-6, ATK: 1-4, DEF: 0-1) |
| Treasure | 30% | Gain 0-15 gems (60% none, 30% 5 gems, 8% 10 gems, 2% 15 gems) |
| Trap | 15% | Take 1-2 damage |
| Potion | 10% | Heal 1 HP or full restore |

### Combat System

**Turn-Based Combat** (max 6 rounds):
- Player hit chance: 80%
- Enemy hit chance: 70%
- Damage: ATK - DEF (minimum 1)
- First to 0 HP loses

**Example:**
- Hero: ATK 2, DEF 1, HP 5
- Monster: ATK 3, DEF 0, HP 4
- Result: Hero likely wins but takes ~2 damage

### Scoring System

```
Score = (Rooms Cleared * 100) + (Gems * 10) + (Max HP * 5)
```

**Examples:**
- 10 rooms, 25 gems, 6 HP = 1,280 points
- 20 rooms, 50 gems, 5 HP = 2,525 points

Score accumulates weekly for leaderboard ranking.

---

## Blockchain Integration

### Smart Contract Architecture

DungeonFlip consists of 5 interconnected contracts on Base Sepolia:

#### 1. AventurerNFT
- ERC-721 NFT with on-chain stats
- Free minting (gas only)
- Pausable for emergencies

#### 2. DungeonGame (Core Logic)
- Handles all gameplay state
- Verifiable randomness using block data
- Entry fee collection and distribution
- ~300-500k gas per game session

#### 3. FeeDistributor
- Splits entry fees: 70% rewards, 20% dev, 10% marketing
- Accumulates weekly prize pool
- Transparent fund tracking

#### 4. ProgressTracker
- Tracks player scores per week
- Maintains top 10 leaderboard
- Provides data for reward distribution

#### 5. RewardsPool
- Manages weekly prize distribution
- Prize breakdown: 30%, 20%, 15%, 10%, 8%, 6%, 4%, 3%, 2%, 2%
- Minimum 6-day advance interval prevents abuse

### Randomness & Fairness

**Pseudo-Random Number Generation:**
```solidity
keccak256(abi.encodePacked(
    prevSeed,
    block.timestamp,
    block.prevrandao,
    player address,
    salt
))
```

**Properties:**
- Deterministic but unpredictable
- Cannot be manipulated by players
- Verifiable on-chain
- Good enough for game mechanics (not cryptographic security)

**Limitations:**
- Miners have slight influence (negligible on L2)
- Not suitable for high-stakes outcomes
- Future upgrade path to VRF if needed

---

## Economic Model

### Revenue Streams

**Primary: Entry Fees**
- 0.00001 ETH per game (~$0.04 USD at $4,000 ETH)
- Target: 1,000 games/week = 0.01 ETH revenue
- Scales linearly with player volume

**Future (Post-Hackathon):**
- Season passes
- Cosmetic NFT skins
- Tournament entry fees

### Prize Distribution

**Weekly Payouts:**
- 70% of entry fees → Prize pool
- Top 10 players split according to percentages
- Example: 1,000 games = 0.007 ETH prize pool
  - 1st place: 0.0021 ETH (~$8.40)
  - 2nd place: 0.0014 ETH (~$5.60)
  - 10th place: 0.00014 ETH (~$0.56)

**Sustainability:**
- No token minting/inflation
- Rewards proportional to player activity
- Dev fund (20%) supports ongoing development
- Marketing fund (10%) drives growth

### Economic Projections

| Weekly Players | Entry Fees | Prize Pool | 1st Place |
|----------------|-----------|------------|-----------|
| 100 | 0.001 ETH | 0.0007 ETH | $1.12 |
| 1,000 | 0.01 ETH | 0.007 ETH | $11.20 |
| 10,000 | 0.1 ETH | 0.07 ETH | $112.00 |

**Key Insight:** Rewards meaningful but realistic, avoiding Ponzi dynamics.

---

## Technology Stack

### Blockchain
- **Network**: Base (Ethereum L2)
- **Why Base**:
  - Low gas costs (~$0.01-0.05 per transaction)
  - Fast finality (~2 seconds)
  - Ethereum security guarantees
  - Growing DeFi ecosystem

### Smart Contracts
- **Language**: Solidity 0.8.20
- **Framework**: Hardhat
- **Testing**: 126+ tests (Chai, Ethers v6)
- **Security**: OpenZeppelin contracts (Ownable, Pausable, ReentrancyGuard)

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Wallet**: wagmi + viem
- **State**: React hooks, TanStack Query
- **Deployment**: Vercel

---

## Roadmap

### Phase 1: Foundation ✅ (Completed - Dec 2025)
- Smart contract development
- 200+ comprehensive tests
- Base Sepolia deployment
- Frontend MVP
- Weekly reward system

### Phase 2: Hackathon Launch 🔄 (In Progress - Q1 2026)
- UI polish and animations
- Combat result dialogs
- Adventure log improvements
- Documentation completion
- Testnet stress testing

### Phase 3: Mainnet Preparation (Q1 2026)
- Security audit
- Gas optimization review
- Mainnet deployment (Base)
- Marketing campaign launch
- Community building

### Phase 4: Growth & Features (Q2 2026)
- Leaderboard history page
- Player profile pages
- Achievement system
- Special events/tournaments
- Mobile optimization

### Phase 5: Expansion (Q3+ 2026)
- Multiple dungeon types
- Boss battles
- Guild system
- Item crafting
- Cross-chain bridging (if demand exists)

---

## Governance & Decentralization

### Current State (Centralized)
- Owner-controlled contracts (Ownable)
- Manual reward distribution
- Emergency pause functionality

**Rationale**: Allows rapid iteration during early development

### Future Plans (Decentralized)
- **Phase 3-4**: Migrate to multisig ownership
- **Phase 5+**: Consider DAO structure if community demands
  - Governance token? (TBD based on demand)
  - Voting on game parameters
  - Treasury management

**Philosophy**: Decentralize only when it adds value, not for ideology.

---

## Security Considerations

### Smart Contract Security

**Implemented Protections:**
- ReentrancyGuard on all state-changing functions
- Pausable for emergency stops
- Input validation (require statements)
- Pull-over-push for payments (where applicable)
- No delegatecall or complex proxy patterns

**Auditing Status:**
- Internal review completed
- Testnet deployed and tested
- **TODO**: Professional audit before mainnet

### Known Limitations

1. **Randomness**: Pseudo-random, not VRF
   - Acceptable risk for low-stakes gameplay
   - Upgrade path exists if needed

2. **Centralization**: Owner privileges
   - Necessary for early development
   - Transition plan to multisig/DAO

3. **Gas Griefing**: Top 10 distribution costs gas
   - Mitigated: Max 10 recipients, reasonable gas limits
   - Future: Batch optimization possible

---

## Competitive Analysis

### Similar Projects

| Project | Type | Chain | Key Difference |
|---------|------|-------|----------------|
| Dark Forest | Strategy | Ethereum | Fully on-chain but complex |
| Loot (For Adventurers) | Loot NFTs | Ethereum | No gameplay, just NFTs |
| Axie Infinity | Battle | Ronin | Off-chain gameplay |
| Wolf Game | Risk game | Ethereum | Ponzi-nomics risk |

### DungeonFlip Advantages

1. **Fully On-Chain**: Unlike Axie, no trust required
2. **Sustainable Economics**: Unlike Wolf Game, no inflation
3. **Accessible**: Unlike Dark Forest, simple mechanics
4. **Actual Gameplay**: Unlike Loot, playable game

---

## Team & Development

### Development Process
- Built with AI assistance (GitHub Copilot, Claude Code)
- Iterative development documented in `ai_logs/`
- Open-source codebase
- Community-driven improvements

### Built For
**Seedify Vibe Coins Hackathon** (December 2025)

### Contact & Links
- GitHub: [github.com/username/DungeonFlip](https://github.com)
- Twitter: [@DungeonFlipGame](https://twitter.com) (TBD)
- Discord: [discord.gg/dungeonflip](https://discord.com) (TBD)

---

## Risk Disclosure

### Player Risks

1. **Loss of Entry Fee**: No refunds if you die in dungeon
2. **Gas Costs**: Blockchain transactions require gas (minimal on Base)
3. **Smart Contract Risk**: Bugs or exploits possible (mitigated by testing)
4. **Regulatory Risk**: Gaming laws vary by jurisdiction

### Investment Disclaimer

**NOT AN INVESTMENT**:
- DungeonFlip is entertainment, not investment
- No token sale or ICO
- No promises of profit
- Rewards are gaming prizes, not investment returns

Play responsibly. Never spend more than you can afford to lose.

---

## Conclusion

DungeonFlip demonstrates that blockchain gaming can be:
- **Transparent**: All logic verifiable on-chain
- **Fair**: Provably random mechanics
- **Sustainable**: Realistic economic model
- **Fun**: Engaging roguelike gameplay

By focusing on gameplay first and tokenomics second, DungeonFlip aims to attract genuine gamers rather than speculators.

Join us in the dungeon. Will you survive?

---

## Appendix: Technical Specifications

### Contract Addresses (Base Sepolia Testnet)

```
AventurerNFT:     0x07753598E13Bce7388bD66F1016155684cc3293B
DungeonGame:      0x066d926eA2b3Fd48BC44e0eE8b5EA14474c40746
FeeDistributor:   0xD00c128486dE1C13074769922BEBe735F378A290
ProgressTracker:  0x623435ECC6b3B418d79EE396298aF59710632595
RewardsPool:      0x9A19912DDb7e71b4dccC9036f9395D88979A4F17
```

### Gas Costs (Estimated)

| Operation | Gas | Cost (@1 gwei, $4k ETH) |
|-----------|-----|-------------------------|
| Mint NFT | ~100k | $0.40 |
| Enter Dungeon | ~180k | $0.72 |
| Choose Card | ~120k | $0.48 |
| Exit Dungeon | ~100k | $0.40 |
| **Full Game** | **~500k** | **~$2.00** |

**Note**: Base typically has <0.1 gwei gas, making costs 10x lower.

### Code Statistics

- **Contracts**: 5 files, ~1,500 lines
- **Tests**: 126+ passing tests
- **Frontend**: ~50 components, ~8,000 lines
- **Documentation**: This whitepaper + README + inline comments

---

**Document Version**: 1.0
**Last Updated**: December 13, 2025
**License**: MIT (code), CC BY 4.0 (documentation)
