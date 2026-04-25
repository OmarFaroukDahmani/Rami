'use client';
import { useGameStore } from '@/store/gameStore';
import CardItem from './CardItem';
import DeckArea from './DeckArea';
import { calculateMeldPoints, identifyMeldType } from '@/lib/engine/meld';
import { motion } from 'framer-motion';

export default function MeldArea() {
  const { melds, proposedMelds, submitFrash, frashThreshold, hasDrawn, myPlayerId, players, currentPlayerIndex, cancelProposed, isBuilding } = useGameStore();
  
  const isMyTurn = myPlayerId === players[currentPlayerIndex]?.playerId;
  const totalProposedPoints = proposedMelds.reduce((sum, m) => sum + calculateMeldPoints(m), 0);
  const hasSequence = proposedMelds.some(m => identifyMeldType(m) === 'sequence');

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 min-h-[300px]">
      <div className="flex flex-col items-center mb-6 gap-4">
        <div className="text-white/20 text-sm font-bold uppercase tracking-[0.3em]">
          {isBuilding ? '🚧 Rak 9a3ed Tebni 🚧' : 'Tawla l\'Moushtaraka'}
        </div>

        <DeckArea />
        
        {isMyTurn && !isBuilding && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`px-6 py-2 rounded-2xl border font-black text-sm uppercase tracking-widest shadow-lg
              ${!hasDrawn 
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-400 animate-pulse' 
                : 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400'}
            `}
          >
            {!hasDrawn ? '👆 Ejbed Warka' : '👇 Clicking martine bech Tytach'}
          </motion.div>
        )}
      </div>

      <div className="flex flex-wrap gap-8 justify-center items-start w-full max-w-6xl">
        {/* Existing Melds (Always show) */}
        {melds.map(meld => (
          <div key={meld.id} className="flex bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-sm -space-x-12 shadow-lg">
            {meld.cards.map(c => (
              <CardItem key={c.id} card={c} isDraggable={false} />
            ))}
          </div>
        ))}

        {/* Proposed Melds (Only show if building or if they exist) */}
        {(isBuilding || proposedMelds.length > 0) && (
          <>
            {proposedMelds.map((m, idx) => (
              <MeldGroup key={idx} index={idx} cards={m} />
            ))}
            
            {/* Slot for new group - only in build mode */}
            {isBuilding && (
               <MeldGroup index={proposedMelds.length} cards={[]} />
            )}
          </>
        )}
      </div>

      {/* Floating Action Bar for Frashing */}
      {isBuilding && proposedMelds.length > 0 && (
        <div className="fixed top-1/2 right-8 -translate-y-1/2 flex flex-col gap-4 bg-black/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl z-50 animate-in fade-in slide-in-from-right-10 duration-500">
           <div className="flex flex-col gap-1">
             <span className="text-white/40 text-[10px] uppercase font-bold tracking-tighter">Points mte3ek</span>
             <span className={`text-2xl font-black ${totalProposedPoints >= frashThreshold ? 'text-emerald-400' : 'text-amber-400'}`}>
                {totalProposedPoints} <span className="text-sm opacity-50 font-medium">/ {frashThreshold}</span>
             </span>
           </div>
           
           <div className="flex flex-col gap-2">
              <StatusItem label="Groups S7a7" check={proposedMelds.every(m => identifyMeldType(m) !== 'invalid')} />
              <StatusItem label="Lezem Sequence" check={hasSequence} />
           </div>

           <div className="flex flex-col gap-2 pt-2">
             <button 
                onClick={submitFrash}
                className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${
                  totalProposedPoints >= frashThreshold && hasSequence && proposedMelds.every(m => identifyMeldType(m) !== 'invalid')
                  ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
             >
               Kamelt l'Frash
             </button>
             
             <button 
                onClick={cancelProposed}
                className="w-full py-2 rounded-xl font-bold text-xs text-white/40 hover:text-white/80 hover:bg-white/5 transition-all"
             >
               Batel l'Koll
             </button>
           </div>
        </div>
      )}
    </div>
  );
}

function StatusItem({ label, check }: { label: string, check: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs font-medium">
      <div className={`w-3 h-3 rounded-full ${check ? 'bg-emerald-500' : 'bg-red-500/50'}`} />
      <span className={check ? 'text-emerald-200' : 'text-white/30'}>{label}</span>
    </div>
  );
}

function MeldGroup({ index, cards }: { index: number, cards: any[] }) {
  const pts = calculateMeldPoints(cards);
  const type = identifyMeldType(cards);

  return (
    <div 
      className={`relative min-w-[140px] min-h-[180px] p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center
        ${cards.length > 0 ? (type === 'invalid' ? 'border-red-500/30 bg-red-500/5' : 'border-emerald-500/30 bg-emerald-500/5 shadow-lg') : 'border-dashed border-white/5 bg-transparent'}
      `}
    >
      {cards.length > 0 ? (
        <>
          <div className="absolute -top-3 px-2 bg-emerald-600 rounded text-[10px] font-bold text-white z-20">
            {type.toUpperCase()} • {pts} PTS
          </div>
          <div className="flex -space-x-12">
            {cards.map(c => (
              <CardItem key={c.id} card={c} />
            ))}
          </div>
        </>
      ) : (
        <span className="text-white/5 text-[10px] uppercase font-bold text-center">Groupa {index + 1}</span>
      )}
    </div>
  );
}

