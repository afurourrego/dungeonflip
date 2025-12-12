'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState } from 'react';
import { useWeeklyRuns } from '@/hooks/useWeeklyRuns';

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { weeklyRuns, isLoading } = useWeeklyRuns();

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'NFTs', href: '/nfts' },
    { label: 'Game', href: '/game' },
    { label: 'Leaderboard', href: '/leaderboard' },
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
      <header className="sticky top-0 z-50 w-full border-b border-purple-700/40 backdrop-blur-md bg-black/90">
        <nav className="container mx-auto px-4">
          {/* Desktop Layout: Flexbox to avoid overlap */}
          <div className="hidden md:flex items-center justify-between gap-4 py-4">
            {/* Left: Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="text-3xl">⚔️</span>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                  DungeonFlip
                </span>
                <span className="text-xs text-gray-400">Base Sepolia</span>
              </div>
            </Link>

            {/* Center: Weekly Runs Counter */}
            <div className="flex justify-center shrink-0">
              <div className="px-6 py-2 rounded-lg border border-purple-600/40 bg-purple-900/20">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-400">Runs This Week</span>
                  <span className="text-lg font-bold text-purple-300">
                    {isLoading ? '...' : weeklyRuns}
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
                  className={`text-sm font-medium transition-colors hover:text-purple-400 whitespace-nowrap ${
                    isActive(link.href)
                      ? 'text-purple-400 border-b-2 border-purple-400 pb-1'
                      : 'text-gray-300'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <ConnectButton />
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="flex md:hidden items-center justify-between py-4">
            {/* Left: Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">⚔️</span>
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                  DungeonFlip
                </span>
                <span className="text-xs text-gray-400">Base Sepolia</span>
              </div>
            </Link>

            {/* Right: Hamburger + Wallet */}
            <div className="flex items-center gap-3">
              <ConnectButton />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-300 hover:text-purple-400 transition-colors"
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

          {/* Mobile: Weekly Runs Counter (below header) */}
          <div className="md:hidden pb-3">
            <div className="px-4 py-2 rounded-lg border border-purple-600/40 bg-purple-900/20">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-gray-400">Runs This Week:</span>
                <span className="text-sm font-bold text-purple-300">
                  {isLoading ? '...' : weeklyRuns}
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
          <div className="fixed top-0 right-0 h-full w-64 bg-gradient-to-b from-purple-900/95 to-black/95 backdrop-blur-md border-l border-purple-700/40 z-50 md:hidden shadow-2xl">
            {/* Close Button */}
            <div className="flex justify-end p-4">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-300 hover:text-purple-400 transition-colors"
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
                      ? 'bg-purple-600/40 text-purple-300 border border-purple-500/50'
                      : 'text-gray-300 hover:bg-purple-900/30 hover:text-purple-400'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
