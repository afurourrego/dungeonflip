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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-purple-500/40 bg-[#120d24] p-6 shadow-2xl shadow-purple-900/40">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-purple-500/40 bg-black/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-purple-200 hover:bg-purple-800/40"
        >
          Close
        </button>

        <div className="mb-6 flex items-center gap-3">
          <span className="text-3xl" aria-hidden>{cardEmoji}</span>
          <div>
            <p className="text-sm text-purple-200/80">Room {room}</p>
            <h3 className="text-2xl font-bold text-white">Combat resolved: {cardLabel}</h3>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="rounded-xl border border-purple-500/20 bg-black/30 p-4 text-center">
            <p className="mb-3 text-sm font-semibold text-purple-200">{heroName}</p>
            <div className="relative mx-auto h-40 w-28 overflow-hidden rounded-lg border border-purple-500/40">
              <Image
                src={heroCardImage ?? '/avatars/adventurer-idle.png'}
                alt={`${heroName} card art`}
                fill
                className="object-cover"
              />
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-purple-100">
              <div className="rounded-lg bg-purple-900/20 px-2 py-1">
                <dt className="text-[10px] uppercase tracking-widest text-purple-300/90">Attack</dt>
                <dd className="font-semibold text-white">{heroAttack}</dd>
              </div>
              <div className="rounded-lg bg-purple-900/20 px-2 py-1">
                <dt className="text-[10px] uppercase tracking-widest text-purple-300/90">Defense</dt>
                <dd className="font-semibold text-white">{heroDefense}</dd>
              </div>
              <div className="rounded-lg bg-purple-900/20 px-2 py-1">
                <dt className="text-[10px] uppercase tracking-widest text-purple-300/90">Max HP</dt>
                <dd className="font-semibold text-white">{heroMaxHP}</dd>
              </div>
            </dl>
          </div>

          <div className="hidden h-10 w-10 items-center justify-center rounded-full border border-purple-500/40 bg-purple-800/50 text-lg font-bold text-white md:flex">
            VS
          </div>

          <div className="rounded-xl border border-red-500/30 bg-black/30 p-4 text-center">
            <p className="mb-3 text-sm font-semibold text-red-200">Enemy</p>
            <div className="relative mx-auto h-40 w-28 overflow-hidden rounded-lg border border-red-500/40">
              <Image src={ENEMY_IMAGE} alt="Enemy card art" fill className="object-cover" />
            </div>
            <p className="mt-4 text-sm text-red-200/80">{cardLabel}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-purple-500/20 bg-black/40 p-3">
            <p className="text-[10px] uppercase tracking-widest text-purple-300/90">HP change</p>
            <p className="text-lg font-semibold text-white">
              {heroHPBefore} → {heroHPAfter}
            </p>
            <p className="text-xs text-purple-200/70">{damageLine}</p>
          </div>
          <div className="rounded-lg border border-purple-500/20 bg-black/40 p-3">
            <p className="text-[10px] uppercase tracking-widest text-purple-300/90">Gems</p>
            <p className="text-lg font-semibold text-white">
              {gemsBefore} → {gemsAfter}
            </p>
            <p className="text-xs text-purple-200/70">{lootLine}</p>
          </div>
          <div className="rounded-lg border border-purple-500/20 bg-black/40 p-3">
            <p className="text-[10px] uppercase tracking-widest text-purple-300/90">Outcome</p>
            <p className={`text-lg font-semibold ${heroDied ? 'text-red-300' : 'text-green-300'}`}>{heroDied ? 'Defeat' : 'Victory'}</p>
            <p className="text-xs text-purple-200/70">{survivalLine}</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-purple-500/20 bg-black/30 p-4 text-sm text-purple-100">
          <p className="font-semibold uppercase tracking-widest text-purple-300/90">Battle breakdown</p>
          <ul className="mt-3 space-y-2 text-xs text-purple-100/90">
            <li>Attack value applied: {heroAttack}</li>
            <li>Defense reduced incoming damage to {damageTaken}</li>
            <li>Remaining vitality: {heroHPAfter}/{heroMaxHP}</li>
            <li>{lootLine}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
