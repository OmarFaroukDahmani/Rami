import { Card, Meld } from './types';

export function identifyMeldType(cards: Card[]): 'sequence' | 'set' | 'invalid' {
  if (cards.length < 3) return 'invalid';

  const nonJokers = cards.filter(c => !c.isJoker);
  const jokers = cards.filter(c => c.isJoker);

  if (nonJokers.length === 0) {
    // Rare edge case: 3 or more jokers (though there are usually only 2 in play)
    return 'invalid';
  }

  // Check Set
  const isSet = () => {
    if (cards.length > 4) return false; // Max 4 suits
    const rank = nonJokers[0].rank;
    const suits = new Set();
    
    for (const card of nonJokers) {
      if (card.rank !== rank) return false;
      if (suits.has(card.suit)) return false; // No duplicate suits in a set
      suits.add(card.suit);
    }
    return true;
  };

  // Check Sequence
  const isSequence = () => {
    // Must be same suit
    const suit = nonJokers[0].suit;
    for (const card of nonJokers) {
      if (card.suit !== suit) return false;
    }

    const ranks = nonJokers.map(c => c.rank).sort((a, b) => a - b);
    
    // Check for duplicate ranks in a sequence (invalid)
    const uniqueRanks = new Set(ranks);
    if (uniqueRanks.size !== ranks.length) return false;

    // Calculate holes that need to be filled by jokers
    let neededJokers = 0;
    for (let i = 0; i < ranks.length - 1; i++) {
      const gap = ranks[i + 1] - ranks[i] - 1;
      neededJokers += gap;
    }

    if (neededJokers > jokers.length) return false;

    // Total sequence length cannot exceed 13 (A-K)
    // Ranks span + extra jokers at the ends
    const rankSpan = ranks[ranks.length - 1] - ranks[0] + 1;
    const unusedJokers = jokers.length - neededJokers;
    if (rankSpan + unusedJokers > 13) return false;

    return true;
  };

  if (isSet()) return 'set';
  if (isSequence()) return 'sequence';

  return 'invalid';
}

export function calculateMeldPoints(cards: Card[]): number {
  const type = identifyMeldType(cards);
  if (type === 'invalid') return 0;

  const nonJokers = cards.filter(c => !c.isJoker);
  const jokers = cards.filter(c => c.isJoker);

  if (type === 'set') {
    const rank = nonJokers[0].rank;
    const value = rank === 1 ? 11 : (rank >= 10 ? 10 : rank);
    return value * cards.length;
  }

  // Sequence
  // Points: Ace is 11, JQK are 10, others face value
  // This is a simplification for Joker points
  let pts = 0;
  for(const c of nonJokers) {
    pts += c.rank === 1 ? 11 : (c.rank >= 10 ? 10 : c.rank);
  }
  
  if (jokers.length > 0) {
    const avg = pts / nonJokers.length;
    pts += Math.round(avg) * jokers.length;
  }
  
  return pts;
}

export function isValidMeld(cards: Card[]): boolean {
  return identifyMeldType(cards) !== 'invalid';
}
