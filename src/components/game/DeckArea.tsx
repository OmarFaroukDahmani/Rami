'use client';
import { useGameStore } from '@/store/gameStore';
import { useDroppable } from '@dnd-kit/core';
import CardItem from './CardItem';
export default function DeckArea() {
  const { stockPile, discardPile, drawFromStock } = useGameStore();
  
  // Droppable zone for discarding cards
  const { setNodeRef } = useDroppable({
    id: 'discard-pile',
  });

  const topDiscard = discardPile[discardPile.length - 1];

  return (
    <div className="flex gap-8 justify-center items-center p-6 bg-emerald-900/40 rounded-2xl border border-emerald-500/20 backdrop-blur-sm">
      {/* Stock Pile */}
      <div 
        className="relative w-24 h-36 bg-gradient-to-br from-blue-800 to-indigo-900 rounded-xl shadow-2xl border-2 border-slate-300 flex items-center justify-center cursor-pointer hover:-translate-y-2 transition-transform"
        onClick={() => drawFromStock()}
      >
        <div className="absolute inset-2 border-2 border-dashed border-white/30 rounded-lg"></div>
        <span className="text-white font-bold opacity-50">Stock ({stockPile.length})</span>
      </div>

      {/* Discard Pile */}
      <div 
        ref={setNodeRef}
        className="relative w-24 h-36 bg-emerald-950/50 rounded-xl border-2 border-dashed border-emerald-500/30 flex items-center justify-center transition-all"
      >
        {topDiscard ? (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <CardItem card={topDiscard} isDraggable={false} />
          </div>
        ) : (
          <span className="text-emerald-500/50 font-bold text-center p-2">Discard</span>
        )}
      </div>
    </div>
  );
}
