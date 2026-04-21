'use client';
import { useGameStore } from '@/store/gameStore';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import CardItem from './CardItem';
import { SortAsc } from 'lucide-react';

export default function PlayerHand() {
  const { players, myPlayerId, proposedMelds, autoSortHand } = useGameStore();
  const myPlayer = players.find(p => p.playerId === myPlayerId);
  const proposedCardIds = new Set(proposedMelds.flat().map(c => c.id));
  const handCards = myPlayer?.cards.filter(c => !proposedCardIds.has(c.id)) || [];

  const { setNodeRef } = useDroppable({
    id: 'player-hand',
  });

  if (!myPlayer) return null;

  return (
    <div 
      ref={setNodeRef}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 flex justify-center items-end bg-black/20 backdrop-blur-md px-6 py-4 rounded-3xl z-10 overflow-x-auto w-11/12 max-w-5xl hide-scrollbar"
    >
      <SortableContext items={handCards.map(c => c.id)} strategy={horizontalListSortingStrategy}>
        <div className="flex -space-x-8 sm:-space-x-10 hover:-space-x-4 transition-all duration-300 items-end min-h-[144px]">
          {handCards.map(card => (
            <CardItem key={card.id} card={card} />
          ))}
        </div>
      </SortableContext>

      <button 
        onClick={autoSortHand}
        className="ml-6 p-3 bg-white/5 hover:bg-white/20 rounded-2xl border border-white/10 text-white/40 hover:text-white transition-all group flex flex-col items-center gap-1"
      >
        <SortAsc className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        <span className="text-[8px] font-bold uppercase tracking-widest">Sort</span>
      </button>
    </div>
  );
}
