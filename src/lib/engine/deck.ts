import { Card, Suit } from './types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

// In Rami, cards are typically 1 (Ace) to 13 (King)
export function generateDeck(): Card[] {
  const newDeck: Card[] = [];

  // 2 decks of 52
  for (let deckIndex = 0; deckIndex < 2; deckIndex++) {
    const deckSuffix = deckIndex === 0 ? 'a' : 'b';
    
    for (const suit of SUITS) {
      for (let rank = 1; rank <= 13; rank++) {
        newDeck.push({
          id: `${suit}-${rank}-${deckSuffix}`,
          suit,
          rank,
          isJoker: false,
          image: `/cards/${rank}_of_${suit}.png`
        });
      }
    }
  }

  // 2 Jokers
  newDeck.push({
    id: `joker-1`,
    suit: null,
    rank: 0,
    isJoker: true,
    image: `/cards/joker_1.png`
  });
  newDeck.push({
    id: `joker-2`,
    suit: null,
    rank: 0,
    isJoker: true,
    image: `/cards/joker_2.png`
  });

  return newDeck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function drawCard(deck: Card[]): { card: Card | null; remainingDeck: Card[] } {
  if (deck.length === 0) {
    return { card: null, remainingDeck: deck };
  }
  const newDeck = [...deck];
  const card = newDeck.pop() || null;
  return { card, remainingDeck: newDeck };
}
