'use client';
import { useEffect, useState } from 'react';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { useGameStore } from '@/store/gameStore';
import PlayerHand from './PlayerHand';
import OpponentHand from './OpponentHand';
import DeckArea from './DeckArea';
import MeldArea from './MeldArea';
import Link from 'next/link';
import { LogOut, Trophy, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GameRoom() {
  const { initGame, discardCard, myPlayerId, players, currentPlayerIndex, isFirstTurn, reorderHand, isGameOver, winnerId, isBuilding } = useGameStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Only init if we haven't already from the Landing page
    const state = useGameStore.getState();
    if (!state.engine) {
        initGame('player1');
    }
  }, [initGame]);

  // Configure sensors for mobile support
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (overId === 'discard-pile') {
      if (isBuilding) {
        toast.error("Finish or Cancel your build before discarding!");
        return;
      }
      discardCard(activeId);
    } else if (overId === 'meld-area' || overId.startsWith('meld-')) {
      if (!isBuilding) {
        toast.error("Click 'Build' to start organizing groups!");
        return;
      }
      const meldIndex = overId.startsWith('meld-') ? parseInt(overId.split('-')[1]) : 0;
      useGameStore.getState().addToProposedMeld(activeId, meldIndex);
    } else if (overId === 'player-hand') {
       useGameStore.getState().removeFromProposedMeld(activeId);
    } else {
      // Sort within hand
      const myPlayer = players.find(p => p.playerId === myPlayerId);
      if (myPlayer) {
        const activeIndex = myPlayer.cards.findIndex(c => c.id === activeId);
        const overIndex = myPlayer.cards.findIndex(c => c.id === overId);
        
        if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
          reorderHand(activeIndex, overIndex);
        }
      }
    }
  };

  if (!isMounted) return <div className="h-screen w-screen bg-emerald-950" />;

  return (
    <div className={`relative w-screen h-[100dvh] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-800 via-emerald-950 to-black overflow-hidden flex flex-col transition-all duration-1000 ${isBuilding ? 'ring-[20px] ring-emerald-500/10 ring-inset' : ''}`}>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        {/* Build Mode Pulse */}
        <AnimatePresence>
          {isBuilding && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none z-[60] shadow-[inset_0_0_100px_rgba(16,185,129,0.2)] animate-pulse"
            />
          )}
        </AnimatePresence>

        <OpponentHand />

        {/* Quit Button */}
        <div className="absolute top-4 left-4 z-30">
          <Link 
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-red-500/20 text-white/60 hover:text-red-400 rounded-xl border border-white/10 transition-all font-bold text-xs"
          >
            <LogOut className="w-4 h-4" />
            YOKHREJ
          </Link>
        </div>
        
        {/* Turn Indicator */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 flex flex-col items-center">
            <span className="text-emerald-400 font-bold tracking-widest text-xs uppercase">
              {myPlayerId === players[currentPlayerIndex]?.playerId ? "DOUREK" : `DOUR EL ${currentPlayerIndex + 1}`}
            </span>
            {isFirstTurn && (
              <span className="text-amber-400 text-[10px] font-medium italic mt-0.5">
                Aawel Dour: Tyach Barka
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-48 overflow-y-auto select-none hide-scrollbar">
          <MeldArea />
        </div>

        <PlayerHand />
      </DndContext>

      {/* Winner Overlay */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-gradient-to-b from-white/10 to-white/5 border border-white/20 p-12 rounded-[3rem] shadow-2xl flex flex-col items-center max-w-md w-full text-center"
            >
              <div className="relative mb-8">
                <motion.div 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Trophy className={`w-24 h-24 ${winnerId === myPlayerId ? 'text-yellow-400' : 'text-slate-400'}`} />
                </motion.div>
                {winnerId === myPlayerId && (
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="absolute -top-2 -right-2 bg-yellow-500 text-black text-[10px] font-black px-2 py-1 rounded-full"
                  >
                    RBAHT
                  </motion.div>
                )}
              </div>

              <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">
                {winnerId === myPlayerId ? "SA7IT YA M3ALEM!" : "MARRA OKHRA NCHALLAH"}
              </h2>
              <p className="text-white/40 font-medium mb-12">
                {winnerId === myPlayerId ? "Wfawlek l'Aawra9!" : `Tfol ${players.findIndex(p => p.playerId === winnerId) + 1} Sabe9ek.`}
              </p>

              <div className="flex flex-col gap-4 w-full">
                <button 
                  onClick={() => initGame(myPlayerId!)}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                >
                  <RotateCcw className="w-5 h-5" />
                  Aawed Elaab
                </button>
                <Link 
                  href="/"
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-white/60 rounded-2xl font-bold transition-all"
                >
                  Arjaa lel Menu
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
