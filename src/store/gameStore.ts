import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';
import { Card, Meld, PlayerHand } from '@/lib/engine/types';
import { GameState as EngineGameState } from '@/lib/engine/game';
import { toast } from 'react-hot-toast';
import { isValidMeld, calculateMeldPoints, identifyMeldType, canBuildMeld, fitsInMeld } from '@/lib/engine/meld';

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
  isBuilding: boolean;
  setIsBuilding: (val: boolean) => void;

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
  toggleProposedMeld: (cardId: string) => void;
  submitFrash: () => void;
  cancelProposed: () => void;
  requestRedesbuit: () => Promise<void>;
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
  isBuilding: false,
  setIsBuilding: (val) => set({ isBuilding: val }),

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
    const { engine, myPlayerId, players, currentPlayerIndex, discardPile } = get();
    if (!engine || !myPlayerId) return;
    const player = players[currentPlayerIndex];
    if (player.playerId !== myPlayerId) return;

    const topDiscard = discardPile[discardPile.length - 1];
    if (topDiscard && !canBuildMeld(player.cards, topDiscard)) {
        toast.error("You can only take from discard if you can build a meld with it!");
        return;
    }

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
      const player = players.find(p => p.playerId === myPlayerId);
      const card = player?.cards.find(c => c.id === cardId);
      if (card?.isJoker) {
        toast.error("You cannot discard a Joker!");
        return;
      }

      engine.discardCard(myPlayerId, cardId);
      set({
        discardPile: [...engine.discardPile],
        players: [...engine.players],
        currentPlayerIndex: engine.currentPlayerIndex,
        isFirstTurn: engine.isFirstTurn,
        hasDrawn: engine.hasDrawn,
        isGameOver: engine.isGameOver,
        winnerId: engine.winnerId,
        isBuilding: false
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
                if (topDiscard && (topDiscard.isJoker || canBuildMeld(currentPlayer.cards, topDiscard))) {
                    engine.drawFromDiscard(currentPlayer.playerId);
                } else {
                    engine.drawFromStock(currentPlayer.playerId);
                }
                set({ stockPile: [...engine.stockPile], discardPile: [...engine.discardPile], players: [...engine.players], hasDrawn: true });
                await sleep(1000);
            }

            const cards = currentPlayer.cards;
            const nonJokerCards = cards.filter(c => !c.isJoker);
            const cardToDiscard = nonJokerCards.length > 0 
                ? nonJokerCards[Math.floor(Math.random() * nonJokerCards.length)]
                : cards[Math.floor(Math.random() * cards.length)]; // Fallback if somehow only jokers left (shouldn't happen)
            
            engine.discardCard(currentPlayer.playerId, cardToDiscard.id);

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

    // Remove from hand and add to proposed
    const playerIdx = players.findIndex(p => p.playerId === myPlayerId);
    if (playerIdx === -1) return;

    const newPlayers = [...players];
    const playerHand = [...newPlayers[playerIdx].cards];
    const cardIdx = playerHand.findIndex(c => c.id === cardId);
    if (cardIdx === -1) return; // Might be in another meld already
    
    const [card] = playerHand.splice(cardIdx, 1);
    newPlayers[playerIdx] = { ...newPlayers[playerIdx], cards: playerHand };

    // Deep copy proposed to avoid reference issues
    const newProposed = proposedMelds.map(m => [...m]);
    
    // Ensure the slot exists
    while (newProposed.length <= meldIndex) {
      newProposed.push([]);
    }

    // Add to the new group
    newProposed[meldIndex].push(card);
    
    set({ proposedMelds: newProposed, players: newPlayers });
  },

  removeFromProposedMeld: (cardId) => {
    const { proposedMelds, players, myPlayerId } = get();
    const playerIdx = players.findIndex(p => p.playerId === myPlayerId);
    if (playerIdx === -1) return;

    let removedCard: Card | null = null;
    const newProposed = proposedMelds.map(m => {
        const idx = m.findIndex(c => c.id === cardId);
        if (idx !== -1) {
            [removedCard] = m.splice(idx, 1);
        }
        return m;
    }).filter(m => m.length > 0 || proposedMelds.length === 1); // Keep at least one empty slot if it was the only one? No, filter is fine.

    if (removedCard) {
        const newPlayers = [...players];
        newPlayers[playerIdx] = { 
            ...newPlayers[playerIdx], 
            cards: [...newPlayers[playerIdx].cards, removedCard] 
        };
        set({ proposedMelds: newProposed.filter(m => m.length > 0), players: newPlayers });
    }
  },

  toggleProposedMeld: (cardId) => {
    const { proposedMelds, addToProposedMeld, removeFromProposedMeld } = get();
    const isProposed = proposedMelds.some(m => m.some(c => c.id === cardId));
    
    if (isProposed) {
      removeFromProposedMeld(cardId);
    } else {
      // SMART PLACEMENT
      const { players, myPlayerId } = get();
      const player = players.find(p => p.playerId === myPlayerId);
      const card = player?.cards.find(c => c.id === cardId);
      
      let targetIndex = 0;
      if (card) {
        // 1. Try to find a group it fits into
        const fitIdx = proposedMelds.findIndex(m => fitsInMeld(m, card));
        if (fitIdx !== -1) {
            targetIndex = fitIdx;
        } else {
            // 2. Try an empty group
            const emptyIdx = proposedMelds.findIndex(m => m.length === 0);
            targetIndex = emptyIdx !== -1 ? emptyIdx : proposedMelds.length;
        }
      }
      
      addToProposedMeld(cardId, targetIndex);
    }
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
    const playerIdx = players.findIndex(p => p.playerId === myPlayerId);
    if (playerIdx === -1) return;
    const newPlayers = [...players];
    const newMelds = [...melds];
    proposedMelds.forEach(m => newMelds.push({ id: Math.random().toString(36), cards: m, type: identifyMeldType(m) as any }));
    set({ players: newPlayers, melds: newMelds, proposedMelds: [], isBuilding: false });
    toast.success(`Successful فرش! (${totalPoints} points)`);
  },

  cancelProposed: () => {
    const { proposedMelds, players, myPlayerId } = get();
    if (proposedMelds.flat().length === 0) return;
    
    const playerIdx = players.findIndex(p => p.playerId === myPlayerId);
    if (playerIdx === -1) return;

    const newPlayers = [...players];
    newPlayers[playerIdx] = { 
        ...newPlayers[playerIdx], 
        cards: [...newPlayers[playerIdx].cards, ...proposedMelds.flat()] 
    };

    set({ proposedMelds: [], players: newPlayers });
    toast("Meld stacking canceled. Cards returned to hand.", { icon: '↩️' });
  },

  requestRedesbuit: async () => {
    const { initGame, myPlayerId } = get();
    toast.loading("Requesting Redesbuit (Frich)...", { id: 'frich' });
    
    // Simulate voting
    await new Promise(r => setTimeout(r, 2000));
    
    const accepted = Math.random() > 0.2; // 80% chance bots agree
    
    if (accepted && myPlayerId) {
        toast.success("Redesbuit accepted! Restarting round...", { id: 'frich' });
        initGame(myPlayerId);
    } else {
        toast.error("Redesbuit rejected by other players.", { id: 'frich' });
    }
  }
}));
