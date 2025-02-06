import React, { useState, useCallback } from 'react';
import GameControls, { GameControlsProps } from './GameControls.tsx';
import CardDeck from './CardDeck.ts';
import Card from './Card.tsx';
import { GameState, CardData } from './types.ts';
import styles from './FortunesTower.module.css';

const initialGameState: GameState = {
  deck: [],
  board: [],
  bet: 0,
  balance: 100,
  roundOver: true,
  status: 'INITIAL', // Possible statuses: INITIAL, BET_PLACED, IN_PROGRESS, ROUND_OVER
  currentMultiplier: 1,
};

const FortunesTower = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [cardDeck, setCardDeck] = useState<CardDeck>(new CardDeck());
  const [cards, setCards] = useState<CardData[][]>([]);
  const [topCard, setTopCard] = useState<CardData | null>(null);
  const [rowValue, setRowValue] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [knightActivated, setKnightActivated] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);

  // startGame requires that a bet has been placed.
  const startGame = useCallback(() => {
    if (gameState.status !== 'BET_PLACED') {
      alert("Please place a bet before starting the game.");
      return;
    }
    const newCardDeck = new CardDeck();
    setCardDeck(newCardDeck);
    // Do not clear the board here because the board should already have been cleared during bet placement.
    // Now, draw a new savior card.
    setTopCard(newCardDeck.drawCard());
    setGameState((prevState) => ({
      ...prevState,
      currentMultiplier: 1,
      roundOver: false,
      status: 'IN_PROGRESS',
    }));
    setGameOver(false);
  }, [gameState.status]);

  // placeBet now locks the bet once placed.
  // If the current status is ROUND_OVER, we trigger an animation to slide up the previous round’s cards.
  const placeBet = useCallback((betAmount: number) => {
    if (gameState.status === 'IN_PROGRESS' || gameState.status === 'BET_PLACED') {
      alert("Bet is already placed or round is active; cannot change bet now.");
      return;
    }
    if (gameState.status === 'ROUND_OVER') {
      // Animate clearing the board before accepting the new bet.
      setIsClearing(true);
      setTimeout(() => {
        // After the animation, clear the board and update the bet.
        setCards([]);
        setIsClearing(false);
        setGameState((prevState) => {
          if (prevState.balance >= betAmount) {
            return {
              ...prevState,
              bet: betAmount,
              balance: prevState.balance - betAmount,
              status: 'BET_PLACED',
            };
          } else {
            alert("Insufficient balance for the bet.");
            return prevState;
          }
        });
      }, 1000); // Duration of slide-up animation.
    } else {
      // For INITIAL status (i.e. fresh board), just set the bet.
      setGameState((prevState) => {
        if (prevState.balance >= betAmount) {
          return {
            ...prevState,
            bet: betAmount,
            balance: prevState.balance - betAmount,
            status: 'BET_PLACED',
          };
        } else {
          alert("Insufficient balance for the bet.");
          return prevState;
        }
      });
    }
  }, [gameState.status, gameState.balance]);

  // Every card in a row counts toward the bonus value.
  // The savior card (topCard) is not included in any row until used.
  const calculateRowValueAndMultiplier = (row: CardData[]): { rowValue: number; multiplier: number } => {
    const cardValues = row.map(card =>
      typeof card.value === 'number' ? card.value : 0
    );
    const nonZeroValues = cardValues.filter(v => v !== 0);
    const uniqueValues = [...new Set(nonZeroValues)];
    let multiplier = 1;
    if (uniqueValues.length === 1 && nonZeroValues.length > 0) {
      multiplier = row.length;
    }
    const rowValue = cardValues.reduce((sum, value) => sum + value, 0);
    return { rowValue, multiplier };
  };

  const drawNewRow = useCallback(() => {
    if (gameState.status !== 'IN_PROGRESS') {
      alert('Please start the game first!');
      return;
    }
    if (gameOver || cardDeck.deck.length === 0 || isAnimating) return;

    setIsAnimating(true);
    const newRow: CardData[] = [];
    const rowIndex = cards.length;

    // Draw rowIndex + 1 cards for this new row.
    for (let i = 0; i <= rowIndex; i++) {
      const card = cardDeck.drawCard();
      if (card !== null) {
        newRow.push(card);
      }
    }

    // Calculate the row's bonus value and multiplier.
    const { rowValue, multiplier } = calculateRowValueAndMultiplier(newRow);

    // Update state with the new row.
    setCards((prevCards) => {
      const updatedCards = [...prevCards, newRow];
      setRowValue(rowValue);
      setGameState((prevState) => ({
        ...prevState,
        currentMultiplier: Math.max(prevState.currentMultiplier, multiplier),
      }));
      return updatedCards;
    });

    // After the slide-in animation (1 second), perform validations.
    setTimeout(() => {
      if (rowIndex < 1) {
        setIsAnimating(false);
        return; // No previous row exists for the first row.
      }
      const previousRow = cards[cards.length - 1] || [];

      // If a knight is played, mark the entire row as knight-saved.
      if (newRow.some(card => card.value === 0)) {
        const knightRow = newRow.map(card => ({ ...card, knightSaved: true }));
        setCards(prevCards => {
          const newCards = [...prevCards];
          newCards[newCards.length - 1] = knightRow;
          return newCards;
        });
        setKnightActivated(true);
        setTimeout(() => setKnightActivated(false), 1000);
        setIsAnimating(false);
        return;
      }

      // Helper: Check for duplicates between touching cards in newRow and previousRow.
      const findDuplicate = (): { newRowIndex: number, prevRowIndex: number } | null => {
        for (let j = 0; j < newRow.length; j++) {
          let touchingIndices: number[] = [];
          if (j === 0) {
            touchingIndices.push(0);
          } else if (j === newRow.length - 1) {
            touchingIndices.push(previousRow.length - 1);
          } else {
            touchingIndices.push(j - 1, j);
          }
          for (let index of touchingIndices) {
            if (previousRow[index] && previousRow[index].value === newRow[j].value) {
              return { newRowIndex: j, prevRowIndex: index };
            }
          }
        }
        return null;
      };

      const initialDuplicate = findDuplicate();
      if (initialDuplicate !== null) {
        if (topCard) {
          // Replace the duplicate in the new row with the savior card,
          // and now include its face value.
          const replacedCard: CardData = { ...topCard, replaced: true };
          newRow[initialDuplicate.newRowIndex] = replacedCard;
          setTopCard(null);
          // Recalculate the row bonus value after adding the savior card.
          const { rowValue: newRowValue, multiplier: newMultiplier } = calculateRowValueAndMultiplier(newRow);
          setRowValue(newRowValue);
          setGameState(prevState => ({
            ...prevState,
            currentMultiplier: Math.max(prevState.currentMultiplier, newMultiplier),
          }));
          const duplicateAfterReplacement = findDuplicate();
          if (duplicateAfterReplacement !== null) {
            // If duplicate issues remain, mark the failing cards.
            newRow[duplicateAfterReplacement.newRowIndex] = { 
              ...newRow[duplicateAfterReplacement.newRowIndex], 
              failed: true 
            };
            previousRow[duplicateAfterReplacement.prevRowIndex] = { 
              ...previousRow[duplicateAfterReplacement.prevRowIndex], 
              failed: true 
            };
            setCards(prevCards => {
              const newCards = [...prevCards];
              if (newCards.length >= 2) {
                const updatedPrevRow = [...newCards[newCards.length - 2]];
                updatedPrevRow[duplicateAfterReplacement.prevRowIndex] = { 
                  ...updatedPrevRow[duplicateAfterReplacement.prevRowIndex], 
                  failed: true 
                };
                newCards[newCards.length - 2] = updatedPrevRow;
              }
              const updatedNewRow = [...newCards[newCards.length - 1]];
              updatedNewRow[duplicateAfterReplacement.newRowIndex] = { 
                ...updatedNewRow[duplicateAfterReplacement.newRowIndex], 
                failed: true 
              };
              newCards[newCards.length - 1] = updatedNewRow;
              return newCards;
            });
            setGameState((prevState) => ({
              ...prevState,
              roundOver: true,
              status: 'ROUND_OVER'
            }));
            setIsAnimating(false);
            return;
          }
        } else {
          newRow[initialDuplicate.newRowIndex] = { ...newRow[initialDuplicate.newRowIndex], failed: true };
          previousRow[initialDuplicate.prevRowIndex] = { ...previousRow[initialDuplicate.prevRowIndex], failed: true };
          setCards(prevCards => {
            const newCards = [...prevCards];
            if (newCards.length >= 2) {
              const updatedPrevRow = [...newCards[newCards.length - 2]];
              updatedPrevRow[initialDuplicate.prevRowIndex] = { 
                ...updatedPrevRow[initialDuplicate.prevRowIndex], 
                failed: true 
              };
              newCards[newCards.length - 2] = updatedPrevRow;
            }
            const updatedNewRow = [...newCards[newCards.length - 1]];
            updatedNewRow[initialDuplicate.newRowIndex] = { 
              ...updatedNewRow[initialDuplicate.newRowIndex], 
              failed: true 
            };
            newCards[newCards.length - 1] = updatedNewRow;
            return newCards;
          });
          setGameState((prevState) => ({
            ...prevState,
            roundOver: true,
            status: 'ROUND_OVER'
          }));
          setIsAnimating(false);
          return;
        }
      }
      // All validations passed.
      setIsAnimating(false);
    }, 1000);
  }, [gameState, gameOver, cardDeck, cards, topCard, isAnimating]);

  // Cash out: payout = bet * currentMultiplier + row bonus.
  // After cashing out, the status becomes 'ROUND_OVER' so a new bet may be placed.
  const cashOut = useCallback(() => {
    if (gameState.status !== 'IN_PROGRESS' || cards.length === 0) return;
    const totalWinnings = gameState.bet * gameState.currentMultiplier + rowValue;
    setGameState((prevState) => ({
      ...prevState,
      balance: prevState.balance + totalWinnings,
      bet: 0,
      board: [],
      roundOver: true,
      status: 'ROUND_OVER',
      currentMultiplier: 1,
    }));
  }, [gameState.bet, gameState.currentMultiplier, rowValue]);

  const gameControlsProps: GameControlsProps = {
    startGame,
    placeBet,
    cashOut,
    gameState,
  };

  return (
    <div className={styles.container}>
      {gameState.status === 'ROUND_OVER' && (
        <div className={styles.gameOverMessage}>Round Over!</div>
      )}
      {knightActivated && <div className={styles.knightEffect}>Knight Saved You!</div>}
      <div>
        <button 
          onClick={drawNewRow} 
          disabled={gameState.status !== 'IN_PROGRESS' || isAnimating}
        >
          Draw Row
        </button>
        <div>
          {gameState.currentMultiplier > 1 && <>Multiplier: {gameState.currentMultiplier}x</>}
          {rowValue > 0 && <> | Row Value: {rowValue}</>}
        </div>
        {`| Top Card: ${topCard?.value || 'None'}`}
      </div>
      
      <div className={`${styles.wrapper} ${isClearing ? styles.slideUp : ''}`}>
        {cards.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`${styles.row} ${
              rowIndex === cards.length - 1 && isAnimating ? styles.slideIn : ''
            }`}
          >
            {row.map((card, cardIndex) => (
              <Card 
                key={`${rowIndex}-${cardIndex}`} 
                card={card} 
                hidden={rowIndex === 0 && cardIndex === 0} 
              />
            ))}
          </div>
        ))}
      </div>
      
      <div className={styles.controls_wrapper}>
        <GameControls {...gameControlsProps} />
      </div>

      <div className={styles.debugPanel}>
        <h3>Debug Info</h3>
        <p>Status: {gameState.status}</p>
        <p>Round Over: {gameState.roundOver.toString()}</p>
        <p>Current Multiplier: {gameState.currentMultiplier}</p>
        <p>Row Value: {rowValue}</p>
        <p>Balance: {gameState.balance}</p>
        <p>Bet: {gameState.bet}</p>
      </div>
    </div>
  );
};

export default FortunesTower;
