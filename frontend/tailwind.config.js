/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './store/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dungeon: {
          // Rich gradient backgrounds (dark to slightly lighter)
          bg: {
            darkest: '#1a0f08',    // Deep brown
            darker: '#2d1b10',     // Rich dark brown
            dark: '#3d2415',       // Medium brown
            medium: '#4a2f1a',     // Lighter brown
            light: '#5a3b22',      // Card highlight
          },
          // Vibrant golden/amber accents
          accent: {
            gold: '#ffd700',       // Bright gold
            amber: '#ffb347',      // Vibrant amber
            orange: '#ff8c42',     // Bright orange
            bronze: '#cd7f32',     // Rich bronze
            copper: '#b87333',     // Deep copper
          },
          // Glowing golden borders
          border: {
            gold: '#d4af37',       // Golden border (main)
            light: '#e8c547',      // Light gold glow
            medium: '#b8860b',     // Dark goldenrod
            dark: '#8b6914',       // Darker gold
            shadow: '#6b5416',     // Deep shadow gold
          },
          // Legacy colors (keep for compatibility)
          dark: '#1a1625',
          purple: '#6b46c1',
          gold: '#fbbf24',
          red: '#dc2626',
          green: '#10b981',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'slide-down-center': 'slideDownCenter 0.4s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'flip-3d': 'flip-3d 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
        'shine': 'shine 2s ease-in-out infinite',
        'shake': 'shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        'glow-red': 'glow-red 1.5s ease-in-out infinite',
        'bubble': 'bubble 2s ease-in-out infinite',
        'particle-burst': 'particle-burst 0.8s ease-out forwards',
        'hover-float': 'hover-float 2s ease-in-out infinite',
        'energy-pulse': 'energy-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDownCenter: {
          '0%': { transform: 'translate(-50%, -20px)', opacity: '0' },
          '100%': { transform: 'translate(-50%, 0)', opacity: '1' },
        },
        'hover-float': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-8px) scale(1.03)' },
        },
      },
      fontFamily: {
        'press-start': ['var(--font-press-start)', 'monospace'],
        'share-tech': ['var(--font-share-tech)', 'monospace'],
      },
    },
  },
  plugins: [],
}
