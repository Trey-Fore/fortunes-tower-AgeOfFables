// Card.tsx
import React from 'react';
import { CardData } from './types.ts';
import styles from './Card.module.css';

export interface CardProps {
  card: CardData;
}

const Card: React.FC<CardProps> = ({ card }) => {
  const suitName = ['Sword', 'Will', 'Gold', 'Knight'][card.suit];

  return (
    <div className={`${styles.card} ${styles[`${suitName.toLowerCase()}-${card.value}`]}`}>
      <div className={styles.value}></div>
      <div className={styles.suit}></div>
    </div>
  );
};

export default Card;
