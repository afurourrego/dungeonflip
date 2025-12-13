import Link from 'next/link';
import { Header } from '@/components/Header';

export default function WhitepaperPage() {
  return (
    <div className="min-h-screen bg-dungeon-bg text-white">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-dungeon-accent-gold">Whitepaper</h1>
      <div className="space-y-8">
        <p className="text-lg text-white/80 italic">
          Version 1.0 - December 2025
        </p>

        <section className="royal-board p-6">
          <h2 className="text-2xl font-bold mb-4 text-dungeon-accent-gold">Executive Summary</h2>
          <p className="text-white/80">
            DungeonFlip is a fully on-chain dungeon crawler game built on Base blockchain that combines roguelike gameplay
            mechanics with NFT ownership and competitive leaderboards. Players mint unique Aventurer NFTs with procedurally
            generated stats and compete in weekly seasons for ETH prizes.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-dungeon-accent-gold">Vision & Mission</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="royal-board p-6">
              <h3 className="text-xl font-semibold mb-3 text-dungeon-accent-gold">Vision</h3>
              <p className="text-white/70">
                Create a sustainable blockchain gaming ecosystem where skill, strategy, and luck combine to provide
                engaging competitive gameplay with meaningful rewards.
              </p>
            </div>

            <div className="royal-board p-6">
              <h3 className="text-xl font-semibold mb-3 text-dungeon-accent-gold">Mission</h3>
              <p className="text-white/70">
                Demonstrate that blockchain games can be transparent, fair, sustainable, and accessible - with all game
                logic verifiable on-chain and low entry barriers.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-dungeon-accent-gold">Technology Stack</h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="royal-board p-4">
              <h4 className="font-semibold text-dungeon-accent-gold mb-2">Blockchain</h4>
              <ul className="text-sm text-white/70 space-y-1">
                <li>• Base (Ethereum L2)</li>
                <li>• Low gas costs (~$0.01-0.05)</li>
                <li>• Fast finality (~2s)</li>
                <li>• Ethereum security</li>
              </ul>
            </div>

            <div className="royal-board p-4">
              <h4 className="font-semibold text-dungeon-accent-gold mb-2">Smart Contracts</h4>
              <ul className="text-sm text-white/70 space-y-1">
                <li>• Solidity 0.8.20</li>
                <li>• Hardhat framework</li>
                <li>• 126+ tests</li>
                <li>• OpenZeppelin contracts</li>
              </ul>
            </div>

            <div className="royal-board p-4">
              <h4 className="font-semibold text-dungeon-accent-gold mb-2">Frontend</h4>
              <ul className="text-sm text-white/70 space-y-1">
                <li>• Next.js 14</li>
                <li>• Tailwind CSS</li>
                <li>• wagmi + viem</li>
                <li>• RainbowKit</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-dungeon-accent-gold">Smart Contract Architecture</h2>

          <div className="space-y-4">
            {[
              {
                name: 'AventurerNFT',
                desc: 'ERC-721 NFT with on-chain stats (ATK 1-2, DEF 1-2, HP 4-6)',
              },
              {
                name: 'DungeonGame',
                desc: 'Core gameplay logic, handles all state, verifiable randomness',
              },
              {
                name: 'FeeDistributor',
                desc: 'Splits entry fees: 70% rewards, 20% dev, 10% marketing',
              },
              {
                name: 'ProgressTracker',
                desc: 'Tracks player scores per week, maintains top 10 leaderboard',
              },
              {
                name: 'RewardsPool',
                desc: 'Manages weekly prize distribution to top 10 players',
              },
            ].map((contract) => (
              <div key={contract.name} className="royal-board p-4">
                <h4 className="font-semibold text-dungeon-accent-gold">{contract.name}</h4>
                <p className="text-sm text-white/70 mt-1">{contract.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-amber-600/10 border border-amber-600/30 rounded-lg">
            <p className="text-sm font-semibold text-amber-300 mb-2">Contract Addresses (Base Sepolia):</p>
            <div className="grid grid-cols-1 gap-1 text-xs text-white/60 font-mono">
              <div>AventurerNFT: 0x07753598E13Bce7388bD66F1016155684cc3293B</div>
              <div>DungeonGame: 0x066d926eA2b3Fd48BC44e0eE8b5EA14474c40746</div>
              <div>FeeDistributor: 0xD00c128486dE1C13074769922BEBe735F378A290</div>
              <div>ProgressTracker: 0x623435ECC6b3B418d79EE396298aF59710632595</div>
              <div>RewardsPool: 0x9A19912DDb7e71b4dccC9036f9395D88979A4F17</div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-dungeon-accent-gold">Economic Model</h2>

          <div className="royal-board p-6">
            <h3 className="text-xl font-semibold mb-4 text-dungeon-accent-gold">Revenue & Distribution</h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-2">Entry Fee Split:</h4>
                <ul className="space-y-1 text-white/70">
                  <li>• 70% → Prize pool</li>
                  <li>• 20% → Development fund</li>
                  <li>• 10% → Marketing fund</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Prize Distribution (Top 10):</h4>
                <ul className="space-y-1 text-white/70">
                  <li>• 1st: 30% | 2nd: 20% | 3rd: 15%</li>
                  <li>• 4th: 10% | 5th: 8% | 6th: 6%</li>
                  <li>• 7th: 4% | 8th: 3% | 9th-10th: 2%</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-dungeon-accent-gold">
                  <tr className="border-b border-amber-600/30">
                    <th className="text-left py-2">Weekly Players</th>
                    <th className="text-left py-2">Entry Fees</th>
                    <th className="text-left py-2">Prize Pool</th>
                    <th className="text-left py-2">1st Place</th>
                  </tr>
                </thead>
                <tbody className="text-white/70">
                  <tr className="border-b border-white/10">
                    <td className="py-2">100</td>
                    <td>0.001 ETH</td>
                    <td>0.0007 ETH</td>
                    <td>$1.12</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2">1,000</td>
                    <td>0.01 ETH</td>
                    <td>0.007 ETH</td>
                    <td>$11.20</td>
                  </tr>
                  <tr>
                    <td className="py-2">10,000</td>
                    <td>0.1 ETH</td>
                    <td>0.07 ETH</td>
                    <td>$112.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-sm text-white/60 mt-4">
              💡 Key Insight: Rewards are meaningful but realistic, avoiding Ponzi dynamics. Prizes grow proportionally with player volume.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-dungeon-accent-gold">Randomness & Fairness</h2>

          <div className="royal-board p-6">
            <p className="text-white/80 mb-4">
              DungeonFlip uses pseudo-random number generation based on block data:
            </p>

            <div className="bg-black/30 p-4 rounded-lg font-mono text-xs text-green-400 mb-4 overflow-x-auto">
              keccak256(prevSeed, block.timestamp, block.prevrandao, player address, salt)
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-green-300 mb-2">✅ Properties:</h4>
                <ul className="space-y-1 text-sm text-white/70">
                  <li>• Deterministic but unpredictable</li>
                  <li>• Cannot be manipulated by players</li>
                  <li>• Verifiable on-chain</li>
                  <li>• Good for game mechanics</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-yellow-300 mb-2">⚠️ Limitations:</h4>
                <ul className="space-y-1 text-sm text-white/70">
                  <li>• Miners have slight influence (negligible on L2)</li>
                  <li>• Not cryptographically secure</li>
                  <li>• Future upgrade to VRF if needed</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-dungeon-accent-gold">Security Considerations</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="royal-board p-6">
              <h3 className="text-xl font-semibold mb-3 text-green-300">✅ Implemented Protections</h3>
              <ul className="space-y-2 text-white/70">
                <li>• ReentrancyGuard on all state changes</li>
                <li>• Pausable for emergency stops</li>
                <li>• Input validation (require statements)</li>
                <li>• No delegatecall or complex proxies</li>
                <li>• 126+ comprehensive tests</li>
              </ul>
            </div>

            <div className="royal-board p-6">
              <h3 className="text-xl font-semibold mb-3 text-yellow-300">⚠️ Known Limitations</h3>
              <ul className="space-y-2 text-white/70">
                <li>• Pseudo-random (not VRF)</li>
                <li>• Owner privileges (centralized)</li>
                <li>• Gas griefing possible (mitigated)</li>
                <li>• TODO: Professional audit before mainnet</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4 text-dungeon-accent-gold">Risk Disclosure</h2>

          <div className="royal-board p-6 bg-red-900/10 border-red-600/30">
            <h3 className="text-xl font-semibold mb-4 text-red-300">⚠️ Important Disclaimer</h3>

            <div className="space-y-4 text-white/70">
              <div>
                <h4 className="font-semibold text-white mb-1">Player Risks:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Loss of entry fee (no refunds if you die)</li>
                  <li>Gas costs (minimal on Base but not zero)</li>
                  <li>Smart contract risk (bugs or exploits possible)</li>
                  <li>Regulatory risk (gaming laws vary)</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-red-600/20">
                <p className="font-semibold text-red-300 mb-2">NOT AN INVESTMENT:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>DungeonFlip is entertainment, not investment</li>
                  <li>No token sale or ICO</li>
                  <li>No promises of profit</li>
                  <li>Rewards are gaming prizes, not investment returns</li>
                </ul>
                <p className="mt-4 text-sm font-semibold">
                  Play responsibly. Never spend more than you can afford to lose.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-amber-900/20 to-amber-800/10 border border-amber-600/30 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-dungeon-accent-gold">Learn More</h2>
          <div className="flex justify-center gap-4">
            <Link href="/introduction" className="px-6 py-3 bg-white/10 border border-white/30 rounded-lg hover:bg-white/20 transition font-semibold">
              Introduction
            </Link>
            <Link href="/roadmap" className="px-6 py-3 bg-white/10 border border-white/30 rounded-lg hover:bg-white/20 transition font-semibold">
              Roadmap
            </Link>
            <Link href="/game" className="px-6 py-3 bg-dungeon-accent-gold text-black rounded-lg hover:bg-amber-400 transition font-semibold">
              Play Now
            </Link>
          </div>
        </section>

        <section className="text-center text-white/60">
          <p className="text-sm">
            Document Version: 1.0 | Last Updated: December 13, 2025
          </p>
          <p className="text-xs mt-2">
            License: MIT (code), CC BY 4.0 (documentation)
          </p>
        </section>
      </div>
      </main>
    </div>
  );
}
