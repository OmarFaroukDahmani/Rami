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

    const checkRanks = (rs: number[]) => {
      let neededJokers = 0;
      for (let i = 0; i < rs.length - 1; i++) {
        const gap = rs[i + 1] - rs[i] - 1;
        neededJokers += gap;
      }
      return neededJokers <= jokers.length;
    };

    const ranks = nonJokers.map(c => c.rank).sort((a, b) => a - b);
    
    // Check for duplicate ranks in a sequence (invalid)
    const uniqueRanks = new Set(ranks);
    if (uniqueRanks.size !== ranks.length) return false;

    // Normal check (Ace as low: 1)
    if (checkRanks(ranks)) return true;

    // Check with Ace as high (14)
    if (ranks.includes(1)) {
      const highRanks = ranks.map(r => r === 1 ? 14 : r).sort((a, b) => a - b);
      if (checkRanks(highRanks)) return true;
    }

    return false;
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
    const value = rank === 1 ? 10 : (rank >= 10 ? 10 : rank);
    return value * cards.length;
  }

  // Sequence
  // Points: Ace is 10 if high (Q-K-A), 1 if low (A-2-3). JQK are 10, others face value.
  let pts = 0;
  const ranks = nonJokers.map(c => c.rank).sort((a, b) => a - b);
  const isHighAce = ranks.includes(1) && ranks.some(r => r > 10);

  for(const c of nonJokers) {
    if (c.rank === 1) {
        pts += isHighAce ? 10 : 1;
    } else {
        pts += c.rank >= 10 ? 10 : c.rank;
    }
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

export function canBuildMeld(hand: Card[], card: Card): boolean {
  // Check if the card can form a valid 3-card meld with any 2 cards from the hand
  for (let i = 0; i < hand.length; i++) {
    for (let j = i + 1; j < hand.length; j++) {
      if (isValidMeld([hand[i], hand[j], card])) return true;
    }
  }
  return false;
}

/**
 * Checks if a card "fits" into a prospective meld group (smart placement)
 */
export function fitsInMeld(meld: Card[], card: Card): boolean {
  if (meld.length === 0) return false;
  if (card.isJoker) return true; // Joker fits anywhere

  const nonJokers = meld.filter(c => !c.isJoker);
  if (nonJokers.length === 0) return true; // Group is only Jokers

  const type = identifyMeldType(meld);
  
  if (type === 'set' || (meld.length < 3 && nonJokers.every(c => c.rank === nonJokers[0].rank))) {
    return card.rank === nonJokers[0].rank;
  }

  if (type === 'sequence' || (meld.length < 3 && nonJokers.every(c => c.suit === nonJokers[0].suit))) {
    if (card.suit !== nonJokers[0].suit) return false;
    
    // Sequence fits if rank is adjacent to any rank in the meld
    const ranks = nonJokers.map(c => [c.rank, c.rank === 1 ? 14 : c.rank]).flat();
    const cardRanks = [card.rank, card.rank === 1 ? 14 : card.rank];
    
    return cardRanks.some(cr => ranks.some(r => Math.abs(r - cr) === 1));
  }

  return false;
}
