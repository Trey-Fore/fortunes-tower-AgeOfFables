export enum Suit {
  Sword,
  Will,
  Gold,
  Knight,
}

  
  export interface CardData {
    value: number;
    suit: Suit;
  }
  
  export interface GameState {
    deck: CardData[];
    board: CardData[][];
    bet: number;
    balance: number;
    roundOver: boolean;
    status: string;
    currentMultiplier: number;
  }
  