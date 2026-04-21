'use client';
import { Card } from '@/lib/engine/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

interface CardItemProps {
  card: Card;
  isDraggable?: boolean;
}

export default function CardItem({ card, isDraggable = true }: CardItemProps) {
  const { discardCard, myPlayerId, players, currentPlayerIndex, hasDrawn } = useGameStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, disabled: !isDraggable });

  const handleDoubleClick = () => {
    const isMyTurn = myPlayerId === players[currentPlayerIndex]?.playerId;
    if (isMyTurn && hasDrawn && isDraggable) {
      discardCard(card.id);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // We map rank & suit to visual representation.
  // Using simple unicode symbols since we don't have images setup yet.
  const getSuitSymbol = (suit: string | null) => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '★'; // Joker
    }
  };

  const getRankStr = (rank: number, isJoker: boolean) => {
    if (isJoker) return 'Joker';
    switch (rank) {
      case 1: return 'A';
      case 11: return 'J';
      case 12: return 'Q';
      case 13: return 'K';
      default: return rank.toString();
    }
  };

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onDoubleClick={handleDoubleClick}
      layout
      whileHover={isDraggable ? { scale: 1.05, y: -10 } : undefined}
      className={`relative w-20 h-28 sm:w-24 sm:h-36 bg-white rounded-xl shadow-md border border-gray-200 flex flex-col justify-between p-2 select-none cursor-grab
        ${isDragging ? 'opacity-50 z-50 shadow-2xl' : 'opacity-100 z-10'}
        ${isRed || card.isJoker ? 'text-red-600' : 'text-slate-900'}
      `}
    >
      <div className="text-left leading-none font-bold text-lg sm:text-xl">
        <div>{getRankStr(card.rank, card.isJoker)}</div>
        {!card.isJoker && <div className="text-xl sm:text-2xl mt-1">{getSuitSymbol(card.suit)}</div>}
      </div>
      
      {card.isJoker && (
        <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-20">
          🤡
        </div>
      )}

      <div className="text-right leading-none font-bold text-lg sm:text-xl rotate-180">
        <div>{getRankStr(card.rank, card.isJoker)}</div>
        {!card.isJoker && <div className="text-xl sm:text-2xl mt-1">{getSuitSymbol(card.suit)}</div>}
      </div>
    </motion.div>
  );
}
