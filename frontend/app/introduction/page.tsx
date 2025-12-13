import Link from 'next/link';
import { Header } from '@/components/Header';

export default function IntroductionPage() {
  return (
    <div className="min-h-screen bg-dungeon-bg text-white">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-dungeon-accent-gold">Welcome to DungeonFlip! ⚔️</h1>
      <div className="space-y-8">
        <section>
          <p className="text-xl text-white/90 leading-relaxed">
            DungeonFlip is a roguelike dungeon crawler built entirely on the Base blockchain.
            Every decision, every card flip, every battle happens on-chain with complete transparency and provable fairness.
          </p>
        </section>

        <section className="royal-board p-6">
          <h2 className="text-2xl font-bold mb-4 text-dungeon-accent-gold">🎮 In Simple Terms</h2>
          <ol className="space-y-2 list-decimal list-inside text-white/80">
            <li>Mint a unique Aventurer NFT with random stats</li>
            <li>Pay a small entry fee (0.00001 ETH ≈ $0.04)</li>
            <li>Choose from 3 cards each room to progress deeper</li>
            <li>Collect gems, defeat monsters, avoid traps</li>
            <li>Exit safely to earn score and compete for weekly prizes</li>
            <li>Top 10 players split 70% of all entry fees</li>
          </ol>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-dungeon-accent-gold">🚀 Quick Start</h2>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="royal-board p-6">
              <h3 className="text-xl font-semibold mb-3 text-dungeon-accent-gold">Step 1: Setup</h3>
              <ul className="space-y-2 text-white/80">
                <li>• MetaMask wallet installed</li>
                <li>• Base Sepolia testnet added</li>
                <li>• ~0.001 ETH for gas (free from faucet)</li>
              </ul>
              <a
                href="https://www.coinbase.com/faucets/base-sepolia-faucet"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 px-4 py-2 bg-amber-600/20 border border-amber-600/40 rounded-lg hover:bg-amber-600/30 transition"
              >
                Get Testnet ETH →
              </a>
            </div>

            <div className="royal-board p-6">
              <h3 className="text-xl font-semibold mb-3 text-dungeon-accent-gold">Step 2: Mint NFT</h3>
              <ul className="space-y-2 text-white/80">
                <li>• Free minting (gas only)</li>
                <li>• Unique stats: ATK, DEF, HP</li>
                <li>• Higher HP = longer survival</li>
              </ul>
              <Link
                href="/mint"
                className="inline-block mt-4 px-4 py-2 bg-dungeon-accent-gold text-black rounded-lg hover:bg-amber-400 transition font-semibold"
              >
                Mint Now →
              </Link>
            </div>

            <div className="royal-board p-6">
              <h3 className="text-xl font-semibold mb-3 text-dungeon-accent-gold">Step 3: Enter Dungeon</h3>
              <ul className="space-y-2 text-white/80">
                <li>• Pay 0.00001 ETH entry fee</li>
                <li>• NFT locked in game contract</li>
                <li>• Start at Room 1</li>
              </ul>
            </div>

            <div className="royal-board p-6">
              <h3 className="text-xl font-semibold mb-3 text-dungeon-accent-gold">Step 4: Choose Cards</h3>
              <ul className="space-y-2 text-white/80">
                <li>• 3 face-down cards per room</li>
                <li>• Click one to reveal it</li>
                <li>• Card resolves automatically</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-dungeon-accent-gold">🎴 Card Types</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-900/20 border border-red-600/40 rounded-lg">
              <span className="text-3xl">🐉</span>
              <h4 className="text-lg font-semibold mt-2 text-red-300">Monster (45%)</h4>
              <p className="text-white/70 text-sm">Fight a random enemy. Win or die trying!</p>
            </div>

            <div className="p-4 bg-blue-900/20 border border-blue-600/40 rounded-lg">
              <span className="text-3xl">💎</span>
              <h4 className="text-lg font-semibold mt-2 text-blue-300">Treasure (30%)</h4>
              <p className="text-white/70 text-sm">Gain 0-15 gems for more score points.</p>
            </div>

            <div className="p-4 bg-purple-900/20 border border-purple-600/40 rounded-lg">
              <span className="text-3xl">💀</span>
              <h4 className="text-lg font-semibold mt-2 text-purple-300">Trap (15%)</h4>
              <p className="text-white/70 text-sm">Take 1-2 damage. Ouch!</p>
            </div>

            <div className="p-4 bg-green-900/20 border border-green-600/40 rounded-lg">
              <span className="text-3xl">🧪</span>
              <h4 className="text-lg font-semibold mt-2 text-green-300">Potion (10%)</h4>
              <p className="text-white/70 text-sm">Heal 1 HP or fully restore health.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-dungeon-accent-gold">⚔️ Combat System</h2>

          <div className="royal-board p-6">
            <p className="text-white/80 mb-4">Turn-based battles are automatic:</p>
            <ul className="space-y-2 text-white/70">
              <li>• You attack (80% hit chance)</li>
              <li>• Enemy attacks (70% hit chance)</li>
              <li>• Damage = ATK - DEF (minimum 1)</li>
              <li>• First to 0 HP loses</li>
            </ul>

            <div className="mt-6 p-4 bg-amber-600/10 border border-amber-600/30 rounded-lg">
              <p className="text-sm font-semibold text-amber-300 mb-2">Example Combat:</p>
              <p className="text-sm text-white/70">
                Your Aventurer: ATK 2, DEF 1, HP 5<br/>
                Monster: ATK 3, DEF 0, HP 4
              </p>
              <p className="text-sm text-green-300 mt-2">
                Round 1: You hit for 2 damage (Monster HP: 2)<br/>
                Round 2: Monster hits for 2 damage (Your HP: 3)<br/>
                Round 3: You hit for 2 damage (Monster HP: 0)<br/>
                <strong>Result: Victory!</strong>
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-dungeon-accent-gold">🏆 Weekly Prizes</h2>

          <div className="royal-board p-6">
            <p className="text-white/80 mb-4">
              70% of all entry fees go to the prize pool. Top 10 players split it each week!
            </p>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <h4 className="font-semibold text-dungeon-accent-gold mb-2">Prize Distribution:</h4>
                <ul className="space-y-1 text-sm text-white/70">
                  <li>1st place: 30%</li>
                  <li>2nd place: 20%</li>
                  <li>3rd place: 15%</li>
                  <li>4th place: 10%</li>
                  <li>5th place: 8%</li>
                  <li>6-10th: 6%, 4%, 3%, 2%, 2%</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-dungeon-accent-gold mb-2">Example (1,000 games):</h4>
                <ul className="space-y-1 text-sm text-white/70">
                  <li>Total fees: 0.01 ETH</li>
                  <li>Prize pool: 0.007 ETH (~$28)</li>
                  <li>1st place: $8.40</li>
                  <li>2nd place: $5.60</li>
                  <li>10th place: $0.56</li>
                </ul>
              </div>
            </div>

            <p className="text-sm text-white/60 mt-4">
              💡 More players = bigger prizes! Prizes grow with player activity.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-dungeon-accent-gold">💡 Strategy Tips</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="royal-board p-4">
              <h4 className="font-semibold text-green-300 mb-2">✅ Do:</h4>
              <ul className="space-y-1 text-sm text-white/70">
                <li>• Start conservative (10-15 rooms)</li>
                <li>• Exit when HP is low (&lt;3)</li>
                <li>• Play multiple times per week</li>
                <li>• Study the leaderboard</li>
              </ul>
            </div>

            <div className="royal-board p-4">
              <h4 className="font-semibold text-red-300 mb-2">❌ Don't:</h4>
              <ul className="space-y-1 text-sm text-white/70">
                <li>• Be too greedy with low HP</li>
                <li>• Ignore your NFT's stats</li>
                <li>• Exit too early out of fear</li>
                <li>• Give up after one bad run</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-amber-900/20 to-amber-800/10 border border-amber-600/30 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-dungeon-accent-gold">Ready to Play?</h2>
          <p className="text-white/80 mb-6">
            Mint your Aventurer NFT and start exploring the dungeon today!
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/mint"
              className="px-6 py-3 bg-dungeon-accent-gold text-black rounded-lg hover:bg-amber-400 transition font-semibold text-lg"
            >
              Mint NFT →
            </Link>
            <Link
              href="/game"
              className="px-6 py-3 bg-white/10 border border-white/30 rounded-lg hover:bg-white/20 transition font-semibold text-lg"
            >
              Enter Dungeon →
            </Link>
          </div>
          <p className="text-sm text-white/50 mt-4">
            Currently on Base Sepolia testnet • Mainnet launch Q2 2026
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-dungeon-accent-gold">📚 Learn More</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/whitepaper" className="royal-board p-4 hover:border-dungeon-accent-gold/60 transition">
              <h3 className="font-semibold text-dungeon-accent-gold mb-2">📖 Whitepaper</h3>
              <p className="text-sm text-white/70">Deep dive into mechanics and economics</p>
            </Link>
            <Link href="/roadmap" className="royal-board p-4 hover:border-dungeon-accent-gold/60 transition">
              <h3 className="font-semibold text-dungeon-accent-gold mb-2">🗺️ Roadmap</h3>
              <p className="text-sm text-white/70">Future plans and features</p>
            </Link>
            <Link href="/leaderboard" className="royal-board p-4 hover:border-dungeon-accent-gold/60 transition">
              <h3 className="font-semibold text-dungeon-accent-gold mb-2">🏆 Leaderboard</h3>
              <p className="text-sm text-white/70">See who's dominating the dungeon</p>
            </Link>
          </div>
        </section>
      </div>
      </main>
    </div>
  );
}
