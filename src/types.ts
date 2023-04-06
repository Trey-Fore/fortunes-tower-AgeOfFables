export enum Suit {
    Sword,
    Will,
    Gold,
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
  }
  