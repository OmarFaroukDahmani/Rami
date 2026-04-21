import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';
import { Card, Meld, PlayerHand } from '@/lib/engine/types';
import { GameState as EngineGameState } from '@/lib/engine/game';
import { toast } from 'react-hot-toast';
import { isValidMeld, calculateMeldPoints, identifyMeldType } from '@/lib/engine/meld';

interface GameStore {
  stockPile: Card[];
  discardPile: Card[];
  players: PlayerHand[];
  currentPlayerIndex: number;
  isFirstTurn: boolean;
  hasDrawn: boolean;
  melds: Meld[];
  proposedMelds: Card[][];
  frashThreshold: 51 | 71;
  playerCount: number;
  isVersusBots: boolean;
  isGameOver: boolean;
  winnerId: string | null;
  myPlayerId: string | null;
  engine: EngineGameState | null;

  initGame: (myPlayerId: string) => void;
  drawFromStock: () => void;
  drawFromDiscard: () => void;
  discardCard: (cardId: string) => void;
  reorderHand: (oldIndex: number, newIndex: number) => void;
  autoSortHand: () => void;
  setFrashThreshold: (val: 51 | 71) => void;
  setPlayerCount: (val: number) => void;
  setIsVersusBots: (val: boolean) => void;
  addToProposedMeld: (cardId: string, meldIndex: number) => void;
  removeFromProposedMeld: (cardId: string) => void;
  submitFrash: () => void;
  cancelProposed: () => void;
  processBotTurn: () => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  stockPile: [],
  discardPile: [],
  players: [],
  currentPlayerIndex: 0,
  isFirstTurn: false,
  hasDrawn: false,
  melds: [],
  proposedMelds: [],
  frashThreshold: 51,
  playerCount: 3,
  isVersusBots: true,
  myPlayerId: null,
  engine: null,

  setPlayerCount: (val) => set({ playerCount: val }),
  setIsVersusBots: (val) => set({ isVersusBots: val }),
  setFrashThreshold: (val) => set({ frashThreshold: val }),

  initGame: (myPlayerId) => {
    const { playerCount } = get();
    const playerIds = Array.from({ length: playerCount }).map((_, i) => `player${i + 1}`);
    const engine = new EngineGameState(playerIds);
    engine.dealInitialCards();

    set({
      engine,
      myPlayerId,
      stockPile: [...engine.stockPile],
      discardPile: [...engine.discardPile],
      players: [...engine.players],
      currentPlayerIndex: engine.currentPlayerIndex,
      isFirstTurn: engine.isFirstTurn,
      hasDrawn: engine.hasDrawn,
      isGameOver: false,
      winnerId: null,
      melds: [],
      proposedMelds: []
    });
  },

  drawFromStock: () => {
    const { engine, myPlayerId, players, currentPlayerIndex } = get();
    if (!engine || !myPlayerId) return;
    if (players[currentPlayerIndex].playerId !== myPlayerId) return;
    
    try {
      engine.drawFromStock(myPlayerId);
      set({
        stockPile: [...engine.stockPile],
        players: [...engine.players],
        hasDrawn: engine.hasDrawn
      });
    } catch (e: any) {
      toast.error(e.message);
    }
  },

  drawFromDiscard: () => {
    const { engine, myPlayerId, players, currentPlayerIndex } = get();
    if (!engine || !myPlayerId) return;
    if (players[currentPlayerIndex].playerId !== myPlayerId) return;

    try {
      engine.drawFromDiscard(myPlayerId);
      set({
        discardPile: [...engine.discardPile],
        players: [...engine.players],
        hasDrawn: engine.hasDrawn
      });
    } catch (e: any) {
      toast.error(e.message);
    }
  },

  discardCard: (cardId) => {
    const { engine, myPlayerId, players, currentPlayerIndex, isVersusBots, processBotTurn } = get();
    if (!engine || !myPlayerId) return;
    if (players[currentPlayerIndex].playerId !== myPlayerId) return;

    try {
      engine.discardCard(myPlayerId, cardId);
      set({
        discardPile: [...engine.discardPile],
        players: [...engine.players],
        currentPlayerIndex: engine.currentPlayerIndex,
        isFirstTurn: engine.isFirstTurn,
        hasDrawn: engine.hasDrawn,
        isGameOver: engine.isGameOver,
        winnerId: engine.winnerId
      });

      if (engine.isGameOver) {
        toast.success("Game Over! You win!", { duration: 5000 });
        return;
      }

      if (isVersusBots) {
        processBotTurn();
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  },

  processBotTurn: async () => {
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    while (true) {
        const { engine, myPlayerId, players, currentPlayerIndex, isVersusBots } = get();
        if (!engine || !isVersusBots || engine.isGameOver) break;
        const currentPlayer = players[currentPlayerIndex];
        if (currentPlayer.playerId === myPlayerId) break;

        await sleep(1500);

        try {
            if (!engine.hasDrawn) {
                const topDiscard = engine.discardPile[engine.discardPile.length - 1];
                if (topDiscard?.isJoker) {
                    engine.drawFromDiscard(currentPlayer.playerId);
                } else {
                    engine.drawFromStock(currentPlayer.playerId);
                }
                set({ stockPile: [...engine.stockPile], discardPile: [...engine.discardPile], players: [...engine.players], hasDrawn: true });
                await sleep(1000);
            }

            const cards = currentPlayer.cards;
            const randomCard = cards[Math.floor(Math.random() * cards.length)];
            engine.discardCard(currentPlayer.playerId, randomCard.id);

            set({
                discardPile: [...engine.discardPile],
                players: [...engine.players],
                currentPlayerIndex: engine.currentPlayerIndex,
                isFirstTurn: engine.isFirstTurn,
                hasDrawn: engine.hasDrawn,
                isGameOver: engine.isGameOver,
                winnerId: engine.winnerId
            });

            if (engine.isGameOver) {
                toast.error(`Game Over! ${currentPlayer.playerId} wins!`, { duration: 5000 });
                break;
            }
        } catch (e) {
            console.error("Bot Turn Error:", e);
            engine.nextTurn();
            set({ currentPlayerIndex: engine.currentPlayerIndex, hasDrawn: false });
        }
    }
  },

  reorderHand: (oldIndex, newIndex) => {
    const { players, myPlayerId, engine } = get();
    const playerIdx = players.findIndex(p => p.playerId === myPlayerId);
    if (playerIdx === -1) return;

    const newPlayers = [...players];
    const newCards = arrayMove(newPlayers[playerIdx].cards, oldIndex, newIndex);
    newPlayers[playerIdx] = { ...newPlayers[playerIdx], cards: newCards };
    
    // Sync with engine to preserve order during draws
    if (engine) {
      const enginePlayerIdx = engine.players.findIndex(p => p.playerId === myPlayerId);
      if (enginePlayerIdx !== -1) {
        engine.players[enginePlayerIdx].cards = [...newCards];
      }
    }

    set({ players: newPlayers });
  },

  autoSortHand: () => {
    const { players, myPlayerId } = get();
    const playerIdx = players.findIndex(p => p.playerId === myPlayerId);
    if (playerIdx === -1) return;

    const newPlayers = [...players];
    const cards = [...newPlayers[playerIdx].cards];
    
    cards.sort((a, b) => {
      // Jokers at the end
      if (a.isJoker && !b.isJoker) return 1;
      if (!a.isJoker && b.isJoker) return -1;
      if (a.isJoker && b.isJoker) return 0;
      
      const suitOrder = ['hearts', 'diamonds', 'clubs', 'spades'];
      const suitA = suitOrder.indexOf(a.suit!);
      const suitB = suitOrder.indexOf(b.suit!);
      if (suitA !== suitB) return suitA - suitB;
      return a.rank - b.rank;
    });

    newPlayers[playerIdx].cards = cards;

    // Sync with engine to preserve order during draws
    const { engine } = get();
    if (engine) {
      const enginePlayerIdx = engine.players.findIndex(p => p.playerId === myPlayerId);
      if (enginePlayerIdx !== -1) {
        engine.players[enginePlayerIdx].cards = [...cards];
      }
    }

    set({ players: newPlayers });
    toast.success("Hand sorted by suit and rank!");
  },

  addToProposedMeld: (cardId, meldIndex) => {
    if (isNaN(meldIndex)) meldIndex = 0;
    const { players, myPlayerId, proposedMelds } = get();
    const player = players.find(p => p.playerId === myPlayerId);
    if (!player) return;
    const card = player.cards.find(c => c.id === cardId);
    if (!card) return;
    
    // Deep copy to avoid reference issues
    const newProposed = proposedMelds.map(m => [...m]);
    
    // Ensure the slot exists
    while (newProposed.length <= meldIndex) {
      newProposed.push([]);
    }

    // Remove card from any existing group first
    newProposed.forEach((m, i) => {
      newProposed[i] = m.filter(c => c.id !== cardId);
    });

    // Add to the new group
    newProposed[meldIndex].push(card);
    
    // Clean up empty groups except maybe the one we are building? 
    // Actually, store should keep them for UI slots.
    set({ proposedMelds: newProposed });
  },

  removeFromProposedMeld: (cardId) => {
    const { proposedMelds } = get();
    const newProposed = proposedMelds.map(m => m.filter(c => c.id !== cardId));
    set({ proposedMelds: newProposed.filter(m => m.length > 0) });
  },

  submitFrash: () => {
    const { proposedMelds, frashThreshold, myPlayerId, engine, melds, players } = get();
    if (!myPlayerId || !engine) return;
    if (proposedMelds.length === 0) { toast.error("No cards selected for فرش!"); return; }
    for (const group of proposedMelds) if (!isValidMeld(group)) { toast.error("One of your groups is not a valid meld!"); return; }
    const hasSequence = proposedMelds.some(group => identifyMeldType(group) === 'sequence');
    if (!hasSequence) { toast.error("You must have at least one sequence (e.g. 1-2-3) to فرش!"); return; }
    const totalPoints = proposedMelds.reduce((sum, group) => sum + calculateMeldPoints(group), 0);
    if (totalPoints < frashThreshold) { toast.error(`Total points (${totalPoints}) must be at least ${frashThreshold}!`); return; }
    const cardIdsToRemove = proposedMelds.flat().map(c => c.id);
    const playerIdx = players.findIndex(p => p.playerId === myPlayerId);
    if (playerIdx === -1) return;
    const newPlayers = [...players];
    newPlayers[playerIdx].cards = newPlayers[playerIdx].cards.filter(c => !cardIdsToRemove.includes(c.id));
    const newMelds = [...melds];
    proposedMelds.forEach(m => newMelds.push({ id: Math.random().toString(36), cards: m, type: identifyMeldType(m) as any }));
    set({ players: newPlayers, melds: newMelds, proposedMelds: [] });
    toast.success(`Successful فرش! (${totalPoints} points)`);
  },

  cancelProposed: () => {
    set({ proposedMelds: [] });
    toast("Meld stacking canceled. Cards returned to hand.", { icon: '↩️' });
  }
}));
