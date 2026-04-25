'use client';
import { useGameStore } from '@/store/gameStore';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import CardItem from './CardItem';
import { SortAsc, Hammer, RotateCcw } from 'lucide-react';

export default function PlayerHand() {
  const { players, myPlayerId, autoSortHand, isBuilding, setIsBuilding, requestRedesbuit } = useGameStore();
  const myPlayer = players.find(p => p.playerId === myPlayerId);
  const handCards = myPlayer?.cards || [];

  const { setNodeRef } = useDroppable({
    id: 'player-hand',
  });

  if (!myPlayer) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-4 w-11/12 max-w-7xl z-50">
      {/* Scrollable Hand Area */}
      <div 
        ref={setNodeRef}
        className="flex-1 flex justify-center bg-black/20 backdrop-blur-xl px-2 sm:px-6 py-4 rounded-[2.5rem] border border-white/5 overflow-x-auto hide-scrollbar shadow-2xl"
      >
        <SortableContext items={handCards.map(c => c.id)} strategy={horizontalListSortingStrategy}>
          <div className="flex -space-x-8 sm:-space-x-10 hover:-space-x-4 transition-all duration-300 items-end min-h-[144px] pb-2">
            {handCards.map(card => (
              <CardItem key={card.id} card={card} />
            ))}
          </div>
        </SortableContext>
      </div>

      {/* Action Buttons Panel (Fixed side) */}
      <div className="flex flex-col gap-2 p-2 bg-black/40 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl">
        <button 
          onClick={autoSortHand}
          title="Rataf l'Aawra9"
          className="p-3 bg-white/5 hover:bg-white/20 rounded-2xl border border-white/10 text-white/40 hover:text-white transition-all group flex flex-col items-center gap-1"
        >
          <SortAsc className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="text-[7px] font-black uppercase tracking-widest">Rataf</span>
        </button>

        <button 
          onClick={() => setIsBuilding(!isBuilding)}
          title="Ebni l'Frash"
          className={`p-3 rounded-2xl border transition-all group flex flex-col items-center gap-1 min-w-[54px]
            ${isBuilding 
              ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
              : 'bg-white/5 hover:bg-white/20 border-white/10 text-white/40 hover:text-white'}
          `}
        >
          <Hammer className={`w-5 h-5 ${isBuilding ? 'scale-110' : ''}`} />
          <span className="text-[7px] font-black uppercase tracking-widest">{isBuilding ? 'Kamelt' : 'Ebni'}</span>
        </button>

        <button 
          onClick={requestRedesbuit}
          title="Aawel l'Mortha"
          className="p-3 bg-white/5 hover:bg-orange-500/20 rounded-2xl border border-white/10 text-white/40 hover:text-orange-400 transition-all group flex flex-col items-center gap-1"
        >
          <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          <span className="text-[7px] font-black uppercase tracking-widest">Frich</span>
        </button>
      </div>
    </div>
  );
}
