import { STAT_RANGES } from './constants';
import type { AventurerStats } from '@/hooks/useNFT';

export type AventurerClassKey =
  | 'guerrero'
  | 'caballero'
  | 'juggernaut'
  | 'enclenque'
  | 'paladin'
  | 'aventurero'
  | 'lancero'
  | 'coloso';

export const AVENTURER_CLASSES: Record<
  AventurerClassKey,
  { name: string; description: string; accent: string }
> = {
  guerrero: {
    name: 'Guerrero',
    description: 'Ataque al máximo, resto por debajo.',
    accent: 'from-red-500 to-amber-500',
  },
  caballero: {
    name: 'Caballero',
    description: 'Defensa al máximo, resto por debajo.',
    accent: 'from-blue-500 to-cyan-500',
  },
  juggernaut: {
    name: 'Juggernaut',
    description: 'Vida al máximo, resto por debajo.',
    accent: 'from-emerald-500 to-lime-500',
  },
  enclenque: {
    name: 'Enclenque',
    description: 'Ningún stat alcanzó su valor máximo.',
    accent: 'from-slate-500 to-gray-500',
  },
  paladin: {
    name: 'Paladín',
    description: 'Ataque, defensa y vida al máximo.',
    accent: 'from-amber-400 to-yellow-500',
  },
  aventurero: {
    name: 'Aventurero',
    description: 'Ataque y defensa al máximo, vida no.',
    accent: 'from-purple-500 to-pink-500',
  },
  lancero: {
    name: 'Lancero',
    description: 'Ataque y vida al máximo, defensa no.',
    accent: 'from-orange-500 to-red-500',
  },
  coloso: {
    name: 'Coloso',
    description: 'Defensa y vida al máximo, ataque no.',
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
  if (isAtkMax && isDefMax && !isHpMax) return { key: 'aventurero', ...AVENTURER_CLASSES.aventurero };
  if (isAtkMax && isHpMax && !isDefMax) return { key: 'lancero', ...AVENTURER_CLASSES.lancero };
  if (isDefMax && isHpMax && !isAtkMax) return { key: 'coloso', ...AVENTURER_CLASSES.coloso };
  if (isAtkMax && !isDefMax && !isHpMax) return { key: 'guerrero', ...AVENTURER_CLASSES.guerrero };
  if (isDefMax && !isAtkMax && !isHpMax) return { key: 'caballero', ...AVENTURER_CLASSES.caballero };
  if (isHpMax && !isAtkMax && !isDefMax) return { key: 'juggernaut', ...AVENTURER_CLASSES.juggernaut };
  if (!isAtkMax && !isDefMax && !isHpMax) return { key: 'enclenque', ...AVENTURER_CLASSES.enclenque };

  return null;
}
