'use client';

import Image from 'next/image';
import { useState, useEffect, type CSSProperties } from 'react';

// Card type constants from contract
// 0 = Monster, 1 = Trap, 2 = Potion +1, 3 = Full Heal, 4 = Treasure
const CARD_IMAGES: Record<number, string> = {
  0: '/cards/Enemy card.png',    // Monster
  1: '/cards/Trap card.png',     // Trap
  2: '/cards/Potion card.png',   // Potion +1
  3: '/cards/Potion card.png',   // Full Heal (same image)
  4: '/cards/Gem card.png',      // Treasure
};

const CARD_BACK = '/cards/Random card.png';

interface GameCardProps {
  index: number;
  label: string;
  disabled?: boolean;
  revealed?: boolean;
  revealedType?: number;
  onClick: () => void;
  isLoading?: boolean;
}

// Particle colors for each card type
const PARTICLE_COLORS: Record<number, string> = {
  0: '#ef4444', // Monster - red
  1: '#a855f7', // Trap - purple
  2: '#22c55e', // Potion +1 - green
  3: '#22c55e', // Full Heal - green
  4: '#3b82f6', // Treasure - blue
};

export function GameCard({
  index,
  label,
  disabled = false,
  revealed = false,
  revealedType,
  onClick,
  isLoading = false,
}: GameCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showFront, setShowFront] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  // We still disable pointer interaction during locks, but we don't want the
  // selected card to look "greyed out" while it's loading or revealed.
  const shouldDim = disabled && !isLoading && !revealed;

  // Reset flip state when revealed changes
  useEffect(() => {
    if (revealed && revealedType !== undefined) {
      setIsFlipped(true);
      // Delay showing front image until flip animation is halfway
      const timer = setTimeout(() => setShowFront(true), 150);
      // Show particles after card is flipped
      const particleTimer = setTimeout(() => setShowParticles(true), 300);
      // Hide particles after animation
      const hideParticleTimer = setTimeout(() => setShowParticles(false), 1500);
      return () => {
        clearTimeout(timer);
        clearTimeout(particleTimer);
        clearTimeout(hideParticleTimer);
      };
    } else {
      setIsFlipped(false);
      setShowFront(false);
      setShowParticles(false);
    }
  }, [revealed, revealedType]);

  const frontImage = revealedType !== undefined ? CARD_IMAGES[revealedType] : CARD_BACK;
  const particleColor = revealedType !== undefined ? PARTICLE_COLORS[revealedType] : '#ffffff';

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative aspect-[2/3] w-full rounded-xl overflow-hidden
        transition-all duration-200
        ${shouldDim ? 'opacity-40 cursor-not-allowed' : disabled ? 'cursor-not-allowed' : 'hover:scale-105 hover:shadow-lg hover:shadow-dungeon-accent-gold/30 cursor-pointer'}
        ${isLoading ? 'animate-pulse' : ''}
      `}
      style={{ perspective: '1000px' }}
    >
      {/* Card flip container */}
      <div
        className={`
          relative w-full h-full transition-transform duration-300 ease-in-out
          ${isFlipped ? '[transform:rotateY(180deg)]' : ''}
        `}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Card Back (face down) */}
        <div
          className="absolute inset-0 w-full h-full rounded-xl overflow-hidden border-2 border-dungeon-border-gold/40"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <Image
            src={CARD_BACK}
            alt={`Card ${index + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 45vw, 20vw"
            priority={index < 2}
          />
          {/* Label overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <span className="text-sm font-bold text-white drop-shadow-lg">{label}</span>
          </div>
        </div>

        {/* Card Front (revealed) */}
        <div
          className="absolute inset-0 w-full h-full rounded-xl overflow-hidden border-2 border-amber-500/60"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          {showFront && frontImage && (
            <Image
              src={frontImage}
              alt={`Revealed card: ${label}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 45vw, 20vw"
            />
          )}
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
          <div className="w-8 h-8 border-2 border-dungeon-accent-gold border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Particle effects when card is revealed */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * 360;
            const distance = 80 + Math.random() * 40;
            const size = 4 + Math.random() * 6;
            const duration = 0.8 + Math.random() * 0.4;
            return (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 rounded-full"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  backgroundColor: particleColor,
                  boxShadow: `0 0 10px ${particleColor}`,
                  animation: `particleBurst ${duration}s ease-out forwards`,
                  '--angle': `${angle}deg`,
                  '--distance': `${distance}px`,
                } as CSSProperties}
              />
            );
          })}
        </div>
      )}
    </button>
  );
}
