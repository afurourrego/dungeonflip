import { create } from 'zustand';
import { CARD_TYPES, CARD_PROBABILITIES } from '@/lib/constants';

export interface Monster {
  name: string;
  atk: number;
  hp: number;
  image: string;
}

export interface Card {
  id: string;
  type: number;
  monster?: Monster;
  gemValue?: number;
}

export interface GameState {
  // Game session
  isPlaying: boolean;
  currentRoom: number;
  playerHP: number;
  maxHP: number;
  gemsCollected: number;
  cards: Card[];
  
  // Combat state
  inCombat: boolean;
  currentMonster: Monster | null;
  monsterHP: number;
  combatLog: string[];
  
  // Player stats (from NFT)
  playerATK: number;
  playerDEF: number;
  
  // Actions
  startNewGame: (atk: number, def: number, hp: number) => void;
  generateCards: () => void;
  selectCard: (cardId: string) => void;
  exitDungeon: () => void;
  attack: () => void;
  resetGame: () => void;
  addCombatLog: (message: string) => void;
}

// Monster templates
const MONSTERS: Omit<Monster, 'image'>[] = [
  { name: 'Goblin', atk: 1, hp: 2 },
  { name: 'Skeleton', atk: 1, hp: 3 },
  { name: 'Orc', atk: 2, hp: 3 },
  { name: 'Troll', atk: 2, hp: 4 },
  { name: 'Dragon', atk: 3, hp: 5 },
];

function generateRandomCard(): Card {
  const random = Math.random() * 100;
  let cumulative = 0;
  
  for (const [type, probability] of Object.entries(CARD_PROBABILITIES)) {
    cumulative += probability;
    if (random < cumulative) {
      const cardType = CARD_TYPES[type as keyof typeof CARD_TYPES];
      const card: Card = {
        id: Math.random().toString(36).substr(2, 9),
        type: cardType,
      };
      
      if (cardType === CARD_TYPES.MONSTER) {
        const monsterTemplate = MONSTERS[Math.floor(Math.random() * MONSTERS.length)];
        card.monster = {
          ...monsterTemplate,
          image: `/monsters/${monsterTemplate.name.toLowerCase()}.png`,
        };
      } else if (cardType === CARD_TYPES.TREASURE) {
        card.gemValue = Math.floor(Math.random() * 3) + 1; // 1-3 gems
      }
      
      return card;
    }
  }
  
  // Fallback to monster
  return {
    id: Math.random().toString(36).substr(2, 9),
    type: CARD_TYPES.MONSTER,
    monster: { ...MONSTERS[0], image: '/monsters/goblin.png' },
  };
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  isPlaying: false,
  currentRoom: 0,
  playerHP: 0,
  maxHP: 0,
  gemsCollected: 0,
  cards: [],
  inCombat: false,
  currentMonster: null,
  monsterHP: 0,
  combatLog: [],
  playerATK: 0,
  playerDEF: 0,
  
  startNewGame: (atk, def, hp) => {
    set({
      isPlaying: true,
      currentRoom: 1,
      playerHP: hp,
      maxHP: hp,
      gemsCollected: 0,
      playerATK: atk,
      playerDEF: def,
      inCombat: false,
      currentMonster: null,
      monsterHP: 0,
      combatLog: [],
    });
    get().generateCards();
  },
  
  generateCards: () => {
    const cards = Array.from({ length: 4 }, () => generateRandomCard());
    set({ cards });
  },
  
  selectCard: (cardId) => {
    const { cards, playerHP, maxHP, gemsCollected } = get();
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;
    
    switch (card.type) {
      case CARD_TYPES.MONSTER:
        if (card.monster) {
          set({
            inCombat: true,
            currentMonster: card.monster,
            monsterHP: card.monster.hp,
            combatLog: [`You encountered a ${card.monster.name}!`],
          });
        }
        break;
        
      case CARD_TYPES.TREASURE:
        const gems = card.gemValue || 1;
        set({
          gemsCollected: gemsCollected + gems,
          combatLog: [`You found ${gems} gem${gems > 1 ? 's' : ''}!`],
        });
        setTimeout(() => {
          const state = get();
          set({
            currentRoom: state.currentRoom + 1,
            combatLog: [],
          });
          get().generateCards();
        }, 1500);
        break;
        
      case CARD_TYPES.TRAP:
        const newHP = Math.max(0, playerHP - 1);
        set({
          playerHP: newHP,
          combatLog: ['You triggered a trap and lost 1 HP!'],
        });
        if (newHP === 0) {
          setTimeout(() => {
            set({
              isPlaying: false,
              combatLog: ['Game Over! Your HP reached 0.'],
            });
          }, 1500);
        } else {
          setTimeout(() => {
            const state = get();
            set({
              currentRoom: state.currentRoom + 1,
              combatLog: [],
            });
            get().generateCards();
          }, 1500);
        }
        break;
        
      case CARD_TYPES.POTION:
        const healedHP = Math.min(maxHP, playerHP + 2);
        set({
          playerHP: healedHP,
          combatLog: [`You drank a potion and restored ${healedHP - playerHP} HP!`],
        });
        setTimeout(() => {
          const state = get();
          set({
            currentRoom: state.currentRoom + 1,
            combatLog: [],
          });
          get().generateCards();
        }, 1500);
        break;
    }
  },
  
  attack: () => {
    const { playerATK, playerDEF, playerHP, monsterHP, currentMonster, combatLog } = get();
    if (!currentMonster) return;
    
    const newLog = [...combatLog];
    
    // Player attacks (80% hit chance)
    const playerHits = Math.random() < 0.8;
    if (playerHits) {
      const newMonsterHP = monsterHP - playerATK;
      newLog.push(`You hit the ${currentMonster.name} for ${playerATK} damage!`);
      
      if (newMonsterHP <= 0) {
        newLog.push(`${currentMonster.name} defeated!`);
        set({
          inCombat: false,
          currentMonster: null,
          monsterHP: 0,
          combatLog: newLog,
        });
        
        setTimeout(() => {
          const state = get();
          set({
            currentRoom: state.currentRoom + 1,
            combatLog: [],
          });
          get().generateCards();
        }, 1500);
        return;
      }
      
      set({ monsterHP: newMonsterHP });
    } else {
      newLog.push('Your attack missed!');
    }
    
    // Monster counter-attacks
    const damage = Math.max(0, currentMonster.atk - playerDEF);
    if (damage > 0) {
      const newPlayerHP = Math.max(0, playerHP - damage);
      newLog.push(`${currentMonster.name} hits you for ${damage} damage!`);
      set({ playerHP: newPlayerHP });
      
      if (newPlayerHP === 0) {
        newLog.push('Game Over! Your HP reached 0.');
        set({
          isPlaying: false,
          inCombat: false,
          combatLog: newLog,
        });
        return;
      }
    } else {
      newLog.push(`${currentMonster.name} attacks but you blocked it!`);
    }
    
    set({ combatLog: newLog });
  },
  
  exitDungeon: () => {
    set({
      isPlaying: false,
      combatLog: ['You safely exited the dungeon!'],
    });
  },
  
  resetGame: () => {
    set({
      isPlaying: false,
      currentRoom: 0,
      playerHP: 0,
      maxHP: 0,
      gemsCollected: 0,
      cards: [],
      inCombat: false,
      currentMonster: null,
      monsterHP: 0,
      combatLog: [],
      playerATK: 0,
      playerDEF: 0,
    });
  },
  
  addCombatLog: (message) => {
    set((state) => ({
      combatLog: [...state.combatLog, message],
    }));
  },
}));
