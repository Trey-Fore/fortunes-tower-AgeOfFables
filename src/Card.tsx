import React from 'react';
import { CardData } from './types.ts';
import styles from './Card.module.css';

export interface CardProps {
  card: CardData;
  className?: string;
  hidden?: boolean;
}

const Card: React.FC<CardProps> = ({ card, hidden }) => {
  let cardStyle;
  if (hidden) {
    cardStyle = styles.cardBack;
  } else if (card.failed) {
    cardStyle = styles.failed; // New style for failed cards (red background)
  } else if (card.replaced) {
    cardStyle = styles.replaced;  // Style for a replaced card (e.g. blue background)
  } else if (card.knightSaved && card.value !== 0) {
    cardStyle = styles.knightSaved;  // Style for knight-saved cards (gold glowing border)
  } else {
    const cardClassName = card.value === 0 ? "knight" : `number-${card.value}`;
    cardStyle = styles[cardClassName];
  }

  return (
    <div className={`${styles.card} ${cardStyle}`}>
      {!hidden && <div className={styles.value}>{card.value === 0 ? 'Knight' : card.value}</div>}
      <div className={styles.suit}></div>
    </div>
  );
};

export default Card;
