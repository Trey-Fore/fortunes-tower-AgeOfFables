import { CardData, Suit } from './types.ts';

function fisherYatesShuffle<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  
export default class CardDeck {
  private deck: CardData[];

  constructor() {
    this.deck = this.generateDeck();
    this.shuffleDeck();
  }

  generateDeck(): CardData[] {
    const deck: CardData[] = []; // Explicitly specify the type of the array
    for (let suit = 0; suit < 3; suit++) {
      for (let value = 1; value <= 10; value++) {
        deck.push({ value, suit: suit as Suit });
      }
    }
    // Add four Knight cards
    for (let i = 0; i < 4; i++) {
      deck.push({ value: 0, suit: Suit.Knight });
    }
    return deck;
  }

  shuffleDeck(): void {
    fisherYatesShuffle(this.deck);
  }

  drawCard(): CardData | null {
    return this.deck.length > 0 ? this.deck.pop() : null;
  }
}
