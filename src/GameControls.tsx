import React, { useState } from 'react';
import { GameState } from './types.ts';
import styles from './GameControls.module.css';

export interface GameControlsProps {
  startGame: () => void;
  placeBet: (betAmount: number) => void;
  cashOut: () => void;
  gameState: GameState;
}

const GameControls: React.FC<GameControlsProps> = (props) => {
  const [betAmount, setBetAmount] = useState<number>(0);

  const handleBetAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBetAmount(Number(event.target.value));
  };

  const handlePlaceBet = () => {
    props.placeBet(betAmount);
  };

  return (
    <div className={styles.gameControls}>
    <div className={styles.container}>
      <button onClick={props.startGame} className={styles.button}>
        Start Game
      </button>
      <div className={styles.betInput}>
        <label htmlFor="bet-amount">Bet Amount:</label>
        <input
          id="bet-amount"
          type="number"
          min="0"
          value={betAmount}
          onChange={handleBetAmountChange}
        />
        <button onClick={handlePlaceBet} className={styles.button}>
          Place Bet
        </button>
      </div>
      <button onClick={props.cashOut} className={styles.button}>
        Cash Out
      </button>
      <div className={styles.gameState}>
        <h3>Game State:</h3>
        {/* Render game state details */}
        <p>Balance: {props.gameState.balance}</p>
        <p>Current Bet: {props.gameState.bet}</p>
      </div>
    </div>
    </div>
  );
};

export default GameControls;
