'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState } from 'react';
import { useWeeklyRuns } from '@/hooks/useWeeklyRuns';

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { prizePoolBalance, isLoading } = useWeeklyRuns();

  // Format ETH balance (wei to ETH with 6 decimals)
  const formatEthBalance = (wei: bigint) => {
    try {
      if (!wei || wei === BigInt(0)) return '0.000000';
      const eth = Number(wei) / 1e18;
      if (isNaN(eth)) return '0.000000';
      return eth.toFixed(6);
    } catch (error) {
      console.error('Error formatting ETH balance:', error);
      return '0.000000';
    }
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Guild', href: '/guild' },
    { label: 'Game', href: '/game' },
    { label: 'Leaderboard', href: '/leaderboard' },
  ];

  const docsLinks = [
    { label: 'Introduction', href: '/introduction' },
    { label: 'Whitepaper', href: '/whitepaper' },
    { label: 'Roadmap', href: '/roadmap' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop & Mobile Header */}
      <header className="sticky top-0 z-50 w-full border-b border-amber-600/40 backdrop-blur-md bg-black/90">
        <nav className="container mx-auto px-4 overflow-visible">
          {/* Desktop Layout: Flexbox to avoid overlap */}
          <div className="hidden md:flex items-center justify-between gap-4 py-4">
            {/* Left: Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="text-3xl">⚔️</span>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-dungeon-accent-gold to-dungeon-accent-amber bg-clip-text text-transparent">
                  DungeonFlip
                </span>
                <span className="text-xs text-gray-400">Base Sepolia</span>
              </div>
            </Link>

            {/* Center: Prize Pool Counter */}
            <div className="flex justify-center shrink-0">
              <div className="run-counter">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-amber-300/70">Weekly Prize Pool</span>
                  <span className="text-lg font-bold text-dungeon-accent-gold">
                    {isLoading ? '...' : `${formatEthBalance(prizePoolBalance)} ETH`}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Navigation + Wallet */}
            <div className="flex items-center gap-4 shrink-0">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-dungeon-accent-gold whitespace-nowrap ${
                    isActive(link.href)
                      ? 'text-dungeon-accent-gold border-b-2 border-dungeon-accent-gold pb-1'
                      : 'text-gray-300'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Docs Dropdown */}
              <div className="relative group">
                <button className="text-sm font-medium text-gray-300 hover:text-dungeon-accent-gold whitespace-nowrap">
                  Docs ▾
                </button>
                <div className="absolute right-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
                  <div className="bg-dungeon-bg-darker border border-amber-600/40 rounded-lg shadow-xl py-3">
                    {docsLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block px-5 py-3 text-sm text-gray-300 hover:bg-amber-600/20 hover:text-dungeon-accent-gold transition-colors whitespace-nowrap"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <ConnectButton showBalance={false} />
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="flex md:hidden items-center justify-between py-4">
            {/* Left: Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">⚔️</span>
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-dungeon-accent-gold to-dungeon-accent-amber bg-clip-text text-transparent">
                  DungeonFlip
                </span>
                <span className="text-xs text-gray-400">Base Sepolia</span>
              </div>
            </Link>

            {/* Right: Hamburger + Wallet */}
            <div className="flex items-center gap-3">
              <ConnectButton showBalance={false} />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-300 hover:text-dungeon-accent-gold transition-colors"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile: Prize Pool Counter (below header) */}
          <div className="md:hidden pb-3">
            <div className="px-4 py-2 rounded-lg border border-amber-600/40 bg-dungeon-bg-darker/60">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-amber-300/70">Weekly Prize Pool:</span>
                <span className="text-sm font-bold text-dungeon-accent-gold">
                  {isLoading ? '...' : `${formatEthBalance(prizePoolBalance)} ETH`}
                </span>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-out Menu */}
          <div className="fixed top-0 right-0 h-full w-64 bg-gradient-to-b from-dungeon-bg-dark/95 to-black/95 backdrop-blur-md border-l border-amber-600/40 z-50 md:hidden shadow-2xl">
            {/* Close Button */}
            <div className="flex justify-end p-4">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-300 hover:text-dungeon-accent-gold transition-colors"
                aria-label="Close menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-2 px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-base font-medium transition-all ${
                    isActive(link.href)
                      ? 'bg-dungeon-accent-bronze/40 text-dungeon-accent-gold border border-amber-500/50'
                      : 'text-gray-300 hover:bg-dungeon-bg-darker/60 hover:text-dungeon-accent-gold'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Docs Section */}
              <div className="mt-4 pt-4 border-t border-amber-600/20">
                <p className="px-4 text-xs text-amber-300/70 uppercase tracking-wider mb-2">Documentation</p>
                {docsLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-dungeon-bg-darker/60 hover:text-dungeon-accent-gold transition-colors rounded-lg"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
