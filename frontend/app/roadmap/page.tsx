import Link from 'next/link';
import { Header } from '@/components/Header';

export default function RoadmapPage() {
  const phases = [
    {
      phase: 'Phase 1: Foundation',
      timeline: 'Sep - Dec 2025',
      status: '✅ Completed',
      statusColor: 'text-green-400',
      achievements: [
        'All 5 smart contracts deployed',
        '126+ comprehensive tests',
        'Frontend with animations',
        'Wallet integration',
        'Weekly leaderboard system',
      ],
    },
    {
      phase: 'Phase 2: Hackathon Polish',
      timeline: 'Dec 2025',
      status: '🔄 80% Complete',
      statusColor: 'text-yellow-400',
      achievements: [
        'Combat result dialogs',
        'Color-coded adventure log',
        'Card flip animations',
        'Whitepaper & documentation',
        'Rewards distribution script',
      ],
    },
    {
      phase: 'Phase 3: Testnet Refinement',
      timeline: 'Q1 2026',
      status: '⏳ Not Started',
      statusColor: 'text-white/60',
      achievements: [
        'Player profile pages',
        'Past seasons archive',
        'Community bug bounty',
        'Gas optimizations',
        'Security audit preparation',
      ],
    },
    {
      phase: 'Phase 4: Mainnet Launch',
      timeline: 'Q2 2026',
      status: '⏳ Not Started',
      statusColor: 'text-white/60',
      achievements: [
        'Security audit completion',
        'Mainnet deployment',
        'Marketing campaign',
        'Partnership announcements',
        'Community events',
      ],
    },
    {
      phase: 'Phase 5: Feature Expansion',
      timeline: 'Q3 2026',
      status: '⏳ Not Started',
      statusColor: 'text-white/60',
      achievements: [
        'Multiple dungeon types',
        'Boss battles',
        'Guild system',
        'Tournament mode',
        'Cosmetic NFT skins',
      ],
    },
    {
      phase: 'Phase 6: Ecosystem Growth',
      timeline: 'Q4 2026+',
      status: '⏳ Not Started',
      statusColor: 'text-white/60',
      achievements: [
        'Cross-chain expansion',
        'DAO governance',
        'Community treasury',
        'Strategic partnerships',
        'Long-term sustainability',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-dungeon-bg text-white">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-dungeon-accent-gold">Roadmap</h1>
      <div className="space-y-8">
        <p className="text-lg text-white/80">
          This roadmap outlines DungeonFlip's development journey from hackathon prototype to full production game.
          Our focus is on sustainable growth, community feedback, and maintaining fair, on-chain gameplay.
        </p>

        <section>
          <h2 className="text-2xl font-bold mb-6 text-dungeon-accent-gold">Development Phases</h2>

          <div className="space-y-6">
            {phases.map((phase, idx) => (
              <div key={idx} className="royal-board p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-dungeon-accent-gold">{phase.phase}</h3>
                    <p className="text-sm text-white/60">{phase.timeline}</p>
                  </div>
                  <span className={`text-sm font-semibold ${phase.statusColor}`}>{phase.status}</span>
                </div>

                <div className="grid md:grid-cols-2 gap-2">
                  {phase.achievements.map((achievement, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-dungeon-accent-gold mt-0.5">•</span>
                      <span>{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6 text-dungeon-accent-gold">Current Status (December 2025)</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="royal-board p-6 bg-green-900/10 border-green-600/30">
              <div className="text-3xl mb-2">✅</div>
              <h3 className="font-semibold text-green-300 mb-2">Complete</h3>
              <ul className="text-sm text-white/70 space-y-1">
                <li>• Smart contracts deployed</li>
                <li>• Frontend functional</li>
                <li>• Documentation written</li>
                <li>• Rewards system ready</li>
              </ul>
            </div>

            <div className="royal-board p-6 bg-yellow-900/10 border-yellow-600/30">
              <div className="text-3xl mb-2">🔄</div>
              <h3 className="font-semibold text-yellow-300 mb-2">In Progress</h3>
              <ul className="text-sm text-white/70 space-y-1">
                <li>• Final UI polish</li>
                <li>• Documentation pages</li>
                <li>• Vercel deployment</li>
                <li>• Hackathon submission</li>
              </ul>
            </div>

            <div className="royal-board p-6 bg-blue-900/10 border-blue-600/30">
              <div className="text-3xl mb-2">⏳</div>
              <h3 className="font-semibold text-blue-300 mb-2">Upcoming</h3>
              <ul className="text-sm text-white/70 space-y-1">
                <li>• Testnet testing</li>
                <li>• Community building</li>
                <li>• Security audit</li>
                <li>• Mainnet launch</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6 text-dungeon-accent-gold">Success Metrics</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="royal-board p-6">
              <h3 className="font-semibold text-dungeon-accent-gold mb-3">Phase 3 Goals (Q1 2026)</h3>
              <ul className="text-sm text-white/70 space-y-2">
                <li>• 500+ unique players on testnet</li>
                <li>• 5,000+ games played</li>
                <li>• &lt;5 critical bugs found</li>
                <li>• 95%+ uptime</li>
              </ul>
            </div>

            <div className="royal-board p-6">
              <h3 className="font-semibold text-dungeon-accent-gold mb-3">Phase 4 Goals (Q2 2026)</h3>
              <ul className="text-sm text-white/70 space-y-2">
                <li>• 2,000+ unique players (Month 1)</li>
                <li>• 10,000+ games played</li>
                <li>• 100+ ETH in total prize pool</li>
                <li>• 4.0+ star community rating</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6 text-dungeon-accent-gold">Long-Term Vision</h2>

          <div className="space-y-4">
            <div className="royal-board p-6">
              <h3 className="font-semibold text-dungeon-accent-gold mb-2">Year 2 (2027)</h3>
              <p className="text-white/70">
                50,000+ registered players | $100k+ monthly prize pool | Self-sustaining economic model | Community-driven development
              </p>
            </div>

            <div className="royal-board p-6">
              <h3 className="font-semibold text-dungeon-accent-gold mb-2">Year 3 (2028)</h3>
              <p className="text-white/70">
                200,000+ players | Multi-chain presence | Recognized brand in blockchain gaming | Positive cash flow
              </p>
            </div>

            <div className="royal-board p-6">
              <h3 className="font-semibold text-dungeon-accent-gold mb-2">Year 5 (2030)</h3>
              <p className="text-white/70">
                1M+ players | Decentralized governance | Industry-leading on-chain game | Case study for sustainable Web3 gaming
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6 text-dungeon-accent-gold">Development Philosophy</h2>

          <div className="royal-board p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-dungeon-accent-gold mb-3">Our Principles:</h3>
                <ul className="space-y-2 text-white/70">
                  <li>• <strong>Gameplay First:</strong> Fun beats tokenomics</li>
                  <li>• <strong>Sustainable Economics:</strong> No Ponzi schemes</li>
                  <li>• <strong>Community-Driven:</strong> Listen and iterate</li>
                  <li>• <strong>Transparent Development:</strong> Open-source</li>
                  <li>• <strong>Security Over Speed:</strong> Audit before mainnet</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-dungeon-accent-gold mb-3">Release Cadence:</h3>
                <ul className="space-y-2 text-white/70">
                  <li>• <strong>Major releases:</strong> Quarterly</li>
                  <li>• <strong>Minor updates:</strong> Monthly</li>
                  <li>• <strong>Hotfixes:</strong> As needed</li>
                  <li>• <strong>Community updates:</strong> Weekly</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6 text-dungeon-accent-gold">Deferred Features</h2>

          <div className="royal-board p-6">
            <p className="text-white/80 mb-4">
              These features are under consideration but not on the immediate roadmap:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-yellow-300 mb-2">Gameplay:</h4>
                <ul className="text-sm text-white/70 space-y-1">
                  <li>• PvP duels</li>
                  <li>• Cooperative dungeons</li>
                  <li>• Story mode</li>
                  <li>• NFT breeding</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-yellow-300 mb-2">Technical:</h4>
                <ul className="text-sm text-white/70 space-y-1">
                  <li>• Layer 3 deployment</li>
                  <li>• Zero-knowledge proofs</li>
                  <li>• Chainlink VRF</li>
                  <li>• Account abstraction</li>
                </ul>
              </div>
            </div>

            <p className="text-sm text-white/60 mt-4">
              💡 We'll revisit these based on community feedback and market demand. Focus first on excelling at core gameplay!
            </p>
          </div>
        </section>

        <section className="bg-gradient-to-r from-amber-900/20 to-amber-800/10 border border-amber-600/30 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4 text-dungeon-accent-gold text-center">Stay Updated</h2>
          <p className="text-white/80 text-center mb-6">
            Follow our progress and join the community!
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/introduction" className="px-6 py-3 bg-white/10 border border-white/30 rounded-lg hover:bg-white/20 transition font-semibold">
              Introduction
            </Link>
            <Link href="/whitepaper" className="px-6 py-3 bg-white/10 border border-white/30 rounded-lg hover:bg-white/20 transition font-semibold">
              Whitepaper
            </Link>
            <Link href="/game" className="px-6 py-3 bg-dungeon-accent-gold text-black rounded-lg hover:bg-amber-400 transition font-semibold">
              Play Now
            </Link>
          </div>

          <p className="text-sm text-white/50 text-center mt-6">
            Roadmaps are living documents. This plan will evolve based on community needs, technical constraints, and market conditions.
          </p>
        </section>

        <section className="text-center text-white/60">
          <p className="text-sm">
            Last Updated: December 13, 2025
          </p>
          <p className="text-xs mt-2">
            Let's build the future of on-chain gaming together! 🎮⚔️
          </p>
        </section>
      </div>
      </main>
    </div>
  );
}
