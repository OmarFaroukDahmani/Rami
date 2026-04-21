export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export interface Card {
  id: string; // e.g. "heart-10-b"
  suit: Suit | null; // null for Jokers
  rank: number; // 1-13 (1 = Ace, 11 = Jack, 12 = Queen, 13 = King), 0 for Jokers
  isJoker: boolean;
  image: string;
}

export interface Meld {
  id: string;
  cards: Card[];
  type: 'sequence' | 'set';
}

export interface PlayerHand {
  playerId: string;
  cards: Card[];
}
