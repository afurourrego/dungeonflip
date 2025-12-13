import Link from 'next/link';

interface DocsLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function DocsLayout({ title, children }: DocsLayoutProps) {
  return (
    <div className="min-h-screen bg-dungeon-bg text-white">
      {/* Header */}
      <header className="border-b border-amber-600/20 bg-dungeon-bg-darker/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-dungeon-accent-gold hover:text-amber-400 transition">
              🏰 DungeonFlip
            </Link>
            <div className="flex gap-4">
              <Link href="/introduction" className="hover:text-dungeon-accent-gold transition">
                Introduction
              </Link>
              <Link href="/whitepaper" className="hover:text-dungeon-accent-gold transition">
                Whitepaper
              </Link>
              <Link href="/roadmap" className="hover:text-dungeon-accent-gold transition">
                Roadmap
              </Link>
              <Link href="/game" className="px-4 py-2 bg-dungeon-accent-gold text-black rounded-lg hover:bg-amber-400 transition font-semibold">
                Play Now
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-dungeon-accent-gold">{title}</h1>
        <article className="prose prose-invert prose-amber prose-lg max-w-none">
          {children}
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-600/20 bg-dungeon-bg-darker/80 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-white/60">
          <p>Built with ❤️ for Seedify Vibe Coins Hackathon | December 2025</p>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/introduction" className="hover:text-dungeon-accent-gold transition">Introduction</Link>
            <Link href="/whitepaper" className="hover:text-dungeon-accent-gold transition">Whitepaper</Link>
            <Link href="/roadmap" className="hover:text-dungeon-accent-gold transition">Roadmap</Link>
            <a href="https://github.com" className="hover:text-dungeon-accent-gold transition">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
