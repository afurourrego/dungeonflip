import { STAT_RANGES } from './constants';
import type { AventurerStats } from '@/hooks/useNFT';

export type AventurerClassKey =
  | 'warrior'
  | 'knight'
  | 'juggernaut'
  | 'scrawny'
  | 'paladin'
  | 'adventurer'
  | 'lancer'
  | 'colossus';

export type AventurerCardVariant = 'card' | 'battle' | 'trap' | 'potion' | 'gem';

const HERO_CARD_BASE_PATH = '/cards/Adventurers%20cards';

const AVENTURER_CARD_VARIANTS: Record<AventurerClassKey, Record<AventurerCardVariant, string>> = {
  warrior: {
    card: `${HERO_CARD_BASE_PATH}/Warrior/Warrior%20card.png`,
    battle: `${HERO_CARD_BASE_PATH}/Warrior/Warrior%20battle.png`,
    trap: `${HERO_CARD_BASE_PATH}/Warrior/Warrior%20trap.png`,
    potion: `${HERO_CARD_BASE_PATH}/Warrior/Warrior%20potion.png`,
    gem: `${HERO_CARD_BASE_PATH}/Warrior/Warrior%20Gem.png`,
  },
  knight: {
    card: `${HERO_CARD_BASE_PATH}/Knight/Knight%20card.png`,
    battle: `${HERO_CARD_BASE_PATH}/Knight/Knight%20card.png`, // Battle art missing, use base card
    trap: `${HERO_CARD_BASE_PATH}/Knight/Knight%20trap.png`,
    potion: `${HERO_CARD_BASE_PATH}/Knight/Knight%20potion.png`,
    gem: `${HERO_CARD_BASE_PATH}/Knight/Knight%20Gem.png`,
  },
  juggernaut: {
    card: `${HERO_CARD_BASE_PATH}/Juggernaut/juggernaut%20card.png`,
    battle: `${HERO_CARD_BASE_PATH}/Juggernaut/Juggernaut%20battle.png`,
    trap: `${HERO_CARD_BASE_PATH}/Juggernaut/juggernaut%20trap.png`,
    potion: `${HERO_CARD_BASE_PATH}/Juggernaut/Juggernaut%20potion.png`,
    gem: `${HERO_CARD_BASE_PATH}/Juggernaut/juggernaut%20gem.png`,
  },
  scrawny: {
    card: `${HERO_CARD_BASE_PATH}/Scrawny/Scrawny%20card.png`,
    battle: `${HERO_CARD_BASE_PATH}/Scrawny/Scrawny%20battle.png`,
    trap: `${HERO_CARD_BASE_PATH}/Scrawny/scrawny%20trap.png`,
    potion: `${HERO_CARD_BASE_PATH}/Scrawny/Scrawny%20Potion.png`,
    gem: `${HERO_CARD_BASE_PATH}/Scrawny/Scrawny%20Gem.png`,
  },
  paladin: {
    card: `${HERO_CARD_BASE_PATH}/Paladin/Paladin%20card.png`,
    battle: `${HERO_CARD_BASE_PATH}/Paladin/Paladin%20battle.png`,
    trap: `${HERO_CARD_BASE_PATH}/Paladin/paladin%20trap.png`,
    potion: `${HERO_CARD_BASE_PATH}/Paladin/Paladin%20potion.png`,
    gem: `${HERO_CARD_BASE_PATH}/Paladin/Paladin%20Gem.png`,
  },
  adventurer: {
    card: `${HERO_CARD_BASE_PATH}/Adventurer/Adventurer%20card.png`,
    battle: `${HERO_CARD_BASE_PATH}/Adventurer/Adventurer%20card.png`, // Battle art missing, use base card
    trap: `${HERO_CARD_BASE_PATH}/Adventurer/Adventurer%20trap.png`,
    potion: `${HERO_CARD_BASE_PATH}/Adventurer/Adventurer%20potion.png`,
    gem: `${HERO_CARD_BASE_PATH}/Adventurer/Adventurer%20gem.png`,
  },
  lancer: {
    card: `${HERO_CARD_BASE_PATH}/Lancer/Lancer%20card.png`,
    battle: `${HERO_CARD_BASE_PATH}/Lancer/Lancer%20battle.png`,
    trap: `${HERO_CARD_BASE_PATH}/Lancer/Lancer%20trap.png`,
    potion: `${HERO_CARD_BASE_PATH}/Lancer/Lancer%20potion.png`,
    gem: `${HERO_CARD_BASE_PATH}/Lancer/Lancer%20Gem.png`,
  },
  colossus: {
    card: `${HERO_CARD_BASE_PATH}/Colossus/Colossus%20card.png`,
    battle: `${HERO_CARD_BASE_PATH}/Colossus/Colossus%20battle.png`,
    trap: `${HERO_CARD_BASE_PATH}/Colossus/Colossus%20trap.png`,
    potion: `${HERO_CARD_BASE_PATH}/Colossus/Colossus%20potion.png`,
    gem: `${HERO_CARD_BASE_PATH}/Colossus/Colossus%20gem.png`,
  },
};

export const AVENTURER_CARD_IMAGES: Record<AventurerClassKey, string> = Object.fromEntries(
  Object.entries(AVENTURER_CARD_VARIANTS).map(([key, variants]) => [key, variants.card])
) as Record<AventurerClassKey, string>;

export function getAventurerCardVariant(
  classKey: AventurerClassKey,
  variant: AventurerCardVariant = 'card'
) {
  const variants = AVENTURER_CARD_VARIANTS[classKey];
  return variants[variant] ?? variants.card;
}

export const AVENTURER_CLASSES: Record<
  AventurerClassKey,
  { name: string; description: string; accent: string }
> = {
  warrior: {
    name: 'Warrior',
    description: 'Attack reached its maximum; other stats are below the peak.',
    accent: 'from-red-500 to-amber-500',
  },
  knight: {
    name: 'Knight',
    description: 'Defense reached its maximum; other stats are below the peak.',
    accent: 'from-blue-500 to-cyan-500',
  },
  juggernaut: {
    name: 'Juggernaut',
    description: 'Health reached its maximum; other stats are below the peak.',
    accent: 'from-emerald-500 to-lime-500',
  },
  scrawny: {
    name: 'Scrawny',
    description: 'No stat reached its maximum value.',
    accent: 'from-slate-500 to-gray-500',
  },
  paladin: {
    name: 'Paladin',
    description: 'Attack, defense, and health all reached their maximums.',
    accent: 'from-amber-400 to-yellow-500',
  },
  adventurer: {
    name: 'Adventurer',
    description: 'Attack and defense reached their maximums; health did not.',
    accent: 'from-purple-500 to-pink-500',
  },
  lancer: {
    name: 'Lancer',
    description: 'Attack and health reached their maximums; defense did not.',
    accent: 'from-orange-500 to-red-500',
  },
  colossus: {
    name: 'Colossus',
    description: 'Defense and health reached their maximums; attack did not.',
    accent: 'from-cyan-400 to-teal-500',
  },
};

export function getAventurerClass(stats?: Pick<AventurerStats, 'atk' | 'def' | 'hp'>) {
  if (!stats) return null;

  const atk = Number(stats.atk);
  const def = Number(stats.def);
  const hp = Number(stats.hp);

  const isAtkMax = atk === STAT_RANGES.ATK.max;
  const isDefMax = def === STAT_RANGES.DEF.max;
  const isHpMax = hp === STAT_RANGES.HP.max;

  if (isAtkMax && isDefMax && isHpMax) return { key: 'paladin', ...AVENTURER_CLASSES.paladin };
  if (isAtkMax && isDefMax && !isHpMax) return { key: 'adventurer', ...AVENTURER_CLASSES.adventurer };
  if (isAtkMax && isHpMax && !isDefMax) return { key: 'lancer', ...AVENTURER_CLASSES.lancer };
  if (isDefMax && isHpMax && !isAtkMax) return { key: 'colossus', ...AVENTURER_CLASSES.colossus };
  if (isAtkMax && !isDefMax && !isHpMax) return { key: 'warrior', ...AVENTURER_CLASSES.warrior };
  if (isDefMax && !isAtkMax && !isHpMax) return { key: 'knight', ...AVENTURER_CLASSES.knight };
  if (isHpMax && !isAtkMax && !isDefMax) return { key: 'juggernaut', ...AVENTURER_CLASSES.juggernaut };
  if (!isAtkMax && !isDefMax && !isHpMax) return { key: 'scrawny', ...AVENTURER_CLASSES.scrawny };

  return null;
}

export function getAventurerClassWithCard(
  stats?: Pick<AventurerStats, 'atk' | 'def' | 'hp'>,
  variant: AventurerCardVariant = 'card'
) {
  const baseClass = getAventurerClass(stats);
  if (!baseClass) return null;

  const cardImage = getAventurerCardVariant(baseClass.key as AventurerClassKey, variant);
  return {
    ...baseClass,
    cardImage,
  };
}
