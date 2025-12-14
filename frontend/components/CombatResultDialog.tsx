import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export type CombatSummary = {
  room: number;
  damageTaken: number;
  heroHPBefore: number;
  heroHPAfter: number;
  heroAttack: number;
  heroDefense: number;
  heroMaxHP: number;
  heroDied: boolean;
  enemyHP?: number;
  enemyAttackMin?: number;
  enemyAttackMax?: number;
  enemyDefense?: number;
  battleTurns?: string[];
  gemsBefore: number;
  gemsAfter: number;
  gemsDelta: number;
  heroName: string;
  heroCardImage?: string;
  cardLabel: string;
  cardEmoji: string;
};

interface CombatResultDialogProps {
  summary: CombatSummary;
  onClose: () => void;
}

const ENEMY_IMAGE = '/cards/Enemy card.png';
const ENEMY_STAT_FALLBACK = {
  attack: '1–3',
  defense: '0',
  hp: '3–6',
} as const;

export function CombatResultDialog({ summary, onClose }: CombatResultDialogProps) {
  const {
    room,
    damageTaken,
    heroHPBefore,
    heroHPAfter,
    heroAttack,
    heroDefense,
    heroMaxHP,
    heroDied,
    enemyHP,
    enemyAttackMin,
    enemyAttackMax,
    enemyDefense,
    battleTurns,
    gemsBefore,
    gemsAfter,
    gemsDelta,
    heroName,
    heroCardImage,
    cardLabel,
    cardEmoji,
  } = summary;

  const damageLine = damageTaken > 0 ? `${damageTaken} damage taken` : 'No damage taken';
  const survivalLine = heroDied
    ? 'Your adventurer fell in battle.'
    : `Survived the encounter with ${heroHPAfter}/${heroMaxHP} HP.`;
  const lootLine = gemsDelta > 0 ? `Looted ${gemsDelta} gem${gemsDelta === 1 ? '' : 's'}.` : 'No gems recovered.';

  const [visibleTurnCount, setVisibleTurnCount] = useState(0);
  const hasTurns = Array.isArray(battleTurns) && battleTurns.length > 0;
  const logScrollRef = useRef<HTMLDivElement | null>(null);
  const isReplayComplete = !hasTurns || visibleTurnCount >= (battleTurns?.length ?? 0);

  useEffect(() => {
    if (!hasTurns) {
      setVisibleTurnCount(0);
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    if (prefersReducedMotion) {
      setVisibleTurnCount(battleTurns.length);
      return;
    }

    setVisibleTurnCount(0);
    const stepMs = 700;
    const id = window.setInterval(() => {
      setVisibleTurnCount((prev) => {
        const next = prev + 1;
        if (next >= battleTurns.length) {
          window.clearInterval(id);
          return battleTurns.length;
        }
        return next;
      });
    }, stepMs);

    return () => window.clearInterval(id);
  }, [battleTurns, hasTurns]);

  useEffect(() => {
    if (!hasTurns) return;
    // We render newest-first; keep the newest line visible at the top.
    const el = logScrollRef.current;
    if (!el) return;
    el.scrollTop = 0;
  }, [hasTurns, visibleTurnCount]);

  const visibleTurns = hasTurns ? battleTurns!.slice(0, visibleTurnCount) : [];
  const newestFirstTurns = hasTurns ? [...visibleTurns].reverse() : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="relative w-full max-w-2xl royal-board p-6" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 pointer-events-auto rounded-full border border-amber-600/60 bg-dungeon-bg-darker/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/90 hover:border-white hover:text-white transition"
        >
          Close
        </button>

        <div className="mb-6 flex items-center gap-3">
          <span className="text-3xl" aria-hidden>
            {cardEmoji}
          </span>
          <div>
            <p className="text-sm text-white/70 uppercase tracking-[0.25em]">Room {room}</p>
            <h3 className="text-2xl font-bold text-dungeon-accent-gold">Combat resolved: {cardLabel}</h3>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
          <div className="h-full rounded-xl border border-amber-600/60 bg-dungeon-bg-darker/60 p-4 text-center flex flex-col">
            <p className="mb-3 text-sm font-semibold text-white">{heroName}</p>
            <div className="relative mx-auto h-40 w-28 overflow-hidden rounded-lg border border-amber-600/60">
              <Image
                src={heroCardImage ?? '/avatars/adventurer-idle.png'}
                alt={`${heroName} card art`}
                fill
                className="object-cover"
              />
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-white/90">
              <div className="rounded-lg bg-dungeon-bg-darker border border-amber-600/40 px-2 py-1">
                <dt className="text-[10px] uppercase tracking-[0.25em] text-white/60">ATK</dt>
                <dd className="font-semibold text-white">{heroAttack}</dd>
              </div>
              <div className="rounded-lg bg-dungeon-bg-darker border border-amber-600/40 px-2 py-1">
                <dt className="text-[10px] uppercase tracking-[0.25em] text-white/60">DEF</dt>
                <dd className="font-semibold text-white">{heroDefense}</dd>
              </div>
              <div className="rounded-lg bg-dungeon-bg-darker border border-amber-600/40 px-2 py-1">
                <dt className="text-[10px] uppercase tracking-[0.25em] text-white/60">HP</dt>
                <dd className="font-semibold text-white">{heroMaxHP}</dd>
              </div>
            </dl>
          </div>

          <div className="hidden h-10 w-10 self-center items-center justify-center rounded-full border border-amber-600/60 bg-dungeon-bg-darker/70 text-lg font-bold text-dungeon-accent-gold md:flex">
            VS
          </div>

          <div className="h-full rounded-xl border border-amber-600/60 bg-dungeon-bg-darker/60 p-4 text-center flex flex-col">
            <p className="mb-3 text-sm font-semibold text-white">Enemy</p>
            <div className="relative mx-auto h-40 w-28 overflow-hidden rounded-lg border border-amber-600/60">
              <Image src={ENEMY_IMAGE} alt="Enemy card art" fill className="object-cover" />
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-white/90">
              <div className="rounded-lg bg-dungeon-bg-darker border border-amber-600/40 px-2 py-1">
                <dt className="text-[10px] uppercase tracking-[0.25em] text-white/60">ATK</dt>
                <dd className="font-semibold text-white">
                  {typeof enemyAttackMin === 'number' && typeof enemyAttackMax === 'number'
                    ? `${enemyAttackMin}–${enemyAttackMax}`
                    : ENEMY_STAT_FALLBACK.attack}
                </dd>
              </div>
              <div className="rounded-lg bg-dungeon-bg-darker border border-amber-600/40 px-2 py-1">
                <dt className="text-[10px] uppercase tracking-[0.25em] text-white/60">DEF</dt>
                <dd className="font-semibold text-white">{typeof enemyDefense === 'number' ? enemyDefense : ENEMY_STAT_FALLBACK.defense}</dd>
              </div>
              <div className="rounded-lg bg-dungeon-bg-darker border border-amber-600/40 px-2 py-1">
                <dt className="text-[10px] uppercase tracking-[0.25em] text-white/60">HP</dt>
                <dd className="font-semibold text-white">{enemyHP ?? '?'}</dd>
              </div>
            </dl>
          </div>
        </div>

        {isReplayComplete && (
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-amber-600/60 bg-dungeon-bg-darker/60 p-3">
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/60">HP change</p>
              <p className="text-lg font-semibold text-white">
                {heroHPBefore} → {heroHPAfter}
              </p>
              <p className="text-xs text-white/70">{damageLine}</p>
            </div>
            <div className="rounded-lg border border-amber-600/60 bg-dungeon-bg-darker/60 p-3">
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/60">Gems</p>
              <p className="text-lg font-semibold text-white">
                {gemsBefore} → {gemsAfter}
              </p>
              <p className="text-xs text-white/70">{lootLine}</p>
            </div>
            <div className="rounded-lg border border-amber-600/60 bg-dungeon-bg-darker/60 p-3">
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/60">Outcome</p>
              <p className={`text-lg font-semibold ${heroDied ? 'text-red-300' : 'text-green-300'}`}>{heroDied ? 'Defeat' : 'Victory'}</p>
              <p className="text-xs text-white/70">{survivalLine}</p>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-xl border border-amber-600/60 bg-dungeon-bg-darker/60 p-4 text-sm text-white/90">
          <p className="font-semibold uppercase tracking-[0.25em] text-white/70">Battle log</p>
          {hasTurns ? (
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-white/70">Replaying combat...</p>
                {!isReplayComplete && (
                  <button
                    type="button"
                    className="text-xs font-semibold uppercase tracking-[0.25em] text-dungeon-accent-gold hover:text-white transition"
                    onClick={() => setVisibleTurnCount(battleTurns!.length)}
                  >
                    Skip
                  </button>
                )}
              </div>
              <div ref={logScrollRef} className="h-56 overflow-y-auto rounded-lg border border-amber-600/30 bg-black/20 p-3">
                <ul className="space-y-2 text-xs text-white/80">
                  {newestFirstTurns.map((line, idx) => (
                    <li key={`${visibleTurnCount - 1 - idx}-${line}`}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <ul className="mt-3 space-y-2 text-xs text-white/80">
              <li>Hero attack stat: {heroAttack}</li>
              <li>
                Enemy attack {typeof enemyAttackMin === 'number' && typeof enemyAttackMax === 'number'
                  ? `${enemyAttackMin}–${enemyAttackMax}`
                  : ENEMY_STAT_FALLBACK.attack}{' '}
                vs hero defense {heroDefense}
              </li>
              <li>Total damage taken: {damageTaken}</li>
              <li>Remaining vitality: {heroHPAfter}/{heroMaxHP}</li>
              <li>{lootLine}</li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
