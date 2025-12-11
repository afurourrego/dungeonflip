'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

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

  // Reset flip state when revealed changes
  useEffect(() => {
    if (revealed && revealedType !== undefined) {
      setIsFlipped(true);
      // Delay showing front image until flip animation is halfway
      const timer = setTimeout(() => setShowFront(true), 150);
      return () => clearTimeout(timer);
    } else {
      setIsFlipped(false);
      setShowFront(false);
    }
  }, [revealed, revealedType]);

  const frontImage = revealedType !== undefined ? CARD_IMAGES[revealedType] : CARD_BACK;

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative aspect-[2/3] w-full rounded-xl overflow-hidden
        transition-all duration-200
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 cursor-pointer'}
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
          className="absolute inset-0 w-full h-full rounded-xl overflow-hidden border-2 border-purple-500/40"
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
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </button>
  );
}
