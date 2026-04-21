import { Card, PlayerHand } from './types';
import { generateDeck, shuffleDeck, drawCard } from './deck';

export class GameState {
  stockPile: Card[];
  discardPile: Card[];
  players: PlayerHand[];
  currentPlayerIndex: number;
  isFirstTurn: boolean;
  hasDrawn: boolean;
  winnerId: string | null = null;
  isGameOver: boolean = false;
  
  constructor(playerIds: string[]) {
    this.players = playerIds.map(id => ({ playerId: id, cards: [] }));
    this.stockPile = shuffleDeck(generateDeck());
    this.discardPile = [];
    this.currentPlayerIndex = 0;
    this.isFirstTurn = false;
    this.hasDrawn = false;
  }

  dealInitialCards(dealerIndex: number = 0) {
    if (this.players.length === 0) return;

    for (let p_idx = 0; p_idx < this.players.length; p_idx++) {
      let cardsToDeal = 14;
      if (p_idx === dealerIndex) cardsToDeal = 15;

      for (let i = 0; i < cardsToDeal; i++) {
        const { card, remainingDeck } = drawCard(this.stockPile);
        this.stockPile = remainingDeck;
        if (card) {
          this.players[p_idx].cards.push(card);
        }
      }
    }

    this.currentPlayerIndex = dealerIndex;
    this.isFirstTurn = true;
    this.hasDrawn = true;
  }

  drawFromStock(playerId: string) {
    if (this.isGameOver) throw new Error("Game is over");
    if (this.players[this.currentPlayerIndex].playerId !== playerId) {
      throw new Error("It's not your turn");
    }
    if (this.hasDrawn) {
      throw new Error("You have already drawn a card this turn.");
    }

    const { card, remainingDeck } = drawCard(this.stockPile);
    this.stockPile = remainingDeck;
    if (card) {
      this.players[this.currentPlayerIndex].cards.push(card);
      this.hasDrawn = true;
    }
  }

  drawFromDiscard(playerId: string) {
    if (this.isGameOver) throw new Error("Game is over");
    if (this.players[this.currentPlayerIndex].playerId !== playerId) {
      throw new Error("It's not your turn");
    }
    if (this.hasDrawn) {
      throw new Error("You have already drawn a card this turn.");
    }
    if (this.discardPile.length === 0) {
      throw new Error("Discard pile is empty");
    }

    const card = this.discardPile.pop();
    if (card) {
      this.players[this.currentPlayerIndex].cards.push(card);
      this.hasDrawn = true;
    }
  }

  discardCard(playerId: string, cardId: string) {
    if (this.isGameOver) throw new Error("Game is over");
    if (this.players[this.currentPlayerIndex].playerId !== playerId) {
      throw new Error("It's not your turn");
    }
    if (!this.hasDrawn) {
      throw new Error("You must draw a card before discarding.");
    }

    const player = this.players[this.currentPlayerIndex];
    const cardIndex = player.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      throw new Error("Card not found in hand");
    }

    const [cardToDiscard] = player.cards.splice(cardIndex, 1);
    this.discardPile.push(cardToDiscard);

    // Check for win
    if (player.cards.length === 0) {
      this.winnerId = player.playerId;
      this.isGameOver = true;
      return;
    }

    if (this.isFirstTurn) {
      this.isFirstTurn = false;
    }

    this.nextTurn();
  }

  nextTurn() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    this.hasDrawn = false;
  }
}
