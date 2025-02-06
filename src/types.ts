export enum Suit {
  Sword,
  Will,
  Gold,
  Knight,
}

export type CardData = {
  value: number | 'knight';
  replaced?: boolean;
  failed?: boolean;
  knightSaved?: boolean;
};

export interface GameState {
  deck: CardData[];
  board: CardData[][];
  bet: number;
  balance: number;
  roundOver: boolean;
  status: string;
  currentMultiplier: number;
}
