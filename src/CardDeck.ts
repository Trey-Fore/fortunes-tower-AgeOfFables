// deck.ts

import { CardData } from './types.ts';

function fisherYatesShuffle<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const CARD_VALUES = [1, 2, 3, 4, 5, 6, 7];
const KNIGHT_COUNT = 4;

export default class CardDeck {
  public deck: CardData[];

  constructor() {
    this.deck = this.generateDeck();
    this.shuffleDeck();
  }

  generateDeck(): CardData[] {
    const deck: CardData[] = [];
    for (let i = 0; i < 10; i++) {
      for (const value of CARD_VALUES) {
        deck.push({ value });
      }
    }
    // Add four Knight cards
    for (let i = 0; i < KNIGHT_COUNT; i++) {
      deck.push({ value: 0 });
    }
    return deck;
  }

  shuffleDeck(): void {
    fisherYatesShuffle(this.deck);
  }

  

  drawCard(): CardData {
    if (this.deck.length === 0) {
      return { value: 0 };
    }
    return this.deck.pop()!;
  }
  
}
