import React, { useState, useCallback } from 'react';
import GameControls, { GameControlsProps } from './GameControls.tsx';
import CardDeck from './CardDeck.ts';
import Card from './Card.tsx';
import { GameState, CardData } from './types.ts';
import styles from './FortunesTower.module.css';

// Define the initial game state here
const initialGameState: GameState = {
  deck: [],
  board: [],
  bet: 0,
  balance: 100,
  roundOver: true,
  status: 'INITIAL',
  currentMultiplier: 1,
};


const FortunesTower = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [cardDeck, setCardDeck] = useState<CardDeck>(new CardDeck());
  const [cards, setCards] = useState<CardData[][]>([]);

  // ... other state and logic

  const startGame = useCallback(() => {
    // Implement the start game logic here
    const newCardDeck = new CardDeck();
    setCardDeck(newCardDeck);
    setCards([]);
  }, []);

  const placeBet = useCallback((betAmount: number) => {
    // Implement the bet placing logic here
    setGameState((prevState) => {
      if (prevState.balance >= betAmount) {
        return {
          ...prevState,
          bet: betAmount,
          balance: prevState.balance - betAmount,
        };
      } else {
        console.log("Insufficient balance for the bet.");
        return prevState;
      }
    });
  }, []);

  const cashOut = useCallback(() => {
    // Implement the cash out logic here
    const totalWinnings = gameState.bet * gameState.currentMultiplier;
    setGameState((prevState) => ({
      ...prevState,
      balance: prevState.balance + totalWinnings,
      bet: 0,
      board: [],
      roundOver: true,
      currentMultiplier: 1, // Reset the multiplier after cashing out
    }));
  }, [gameState.bet, gameState.currentMultiplier]);
  


  const drawNewRow = useCallback(() => {
    const newRow: CardData[] = [];
    const rowIndex = cards.length;
  
    let newRowTotalValue = 0; // Store the total value of the new row
  
    for (let i = 0; i <= rowIndex; i++) {
      const card = cardDeck.drawCard();
      if (card !== null) {
        newRow.push(card);
        newRowTotalValue += card.value; // Add the card value to the newRowTotalValue
      }
    }
  
    setCards((prevCards) => [...prevCards, newRow]);
  
    // Update the currentMultiplier
    setGameState((prevState) => ({
      ...prevState,
      currentMultiplier: newRowTotalValue, // Set multiplier to total value of new row
    }));
  }, [cardDeck, cards]);
  

  // ... other event handlers and gameControlsProps
  const gameControlsProps: GameControlsProps = {
    startGame,
    placeBet,
    cashOut,
    gameState,
  };

  

  return (
    <div className={styles.container}>
      <div>
      {/* Add a button to draw a new row of cards */}
      <button onClick={drawNewRow}>Draw Row</button>
        {/* Display the current multiplier */}
        <div>Current Multiplier: {gameState.currentMultiplier}x</div>
      </div>
      <div className="wrapper">
        {/* Render the cards */}
  <div>
    {cards.map((row, rowIndex) => (
      <div key={rowIndex} className={styles.row}>
        {row.map((card, cardIndex) => (
          <Card key={`${rowIndex}-${cardIndex}`} card={card} className={styles.card} />
        ))}
      </div>
    ))}
        </div>
      </div>
      {/* Game controls */}
      <div className={styles.controls_wrapper}>
        <GameControls {...gameControlsProps} />

      </div>
    </div>
  );
};  

export default FortunesTower;
