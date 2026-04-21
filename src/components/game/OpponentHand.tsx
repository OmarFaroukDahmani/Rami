'use client';
import { useGameStore } from '@/store/gameStore';

export default function OpponentHand() {
  const { players, myPlayerId } = useGameStore();
  const opponents = players.filter(p => p.playerId !== myPlayerId);

  return (
    <div className="absolute top-4 left-0 right-0 flex justify-center pointer-events-none">
      {opponents.map((opp, idx) => (
        <div key={opp.playerId} className="flex flex-col items-center mx-4">
          <div className="text-white/70 font-semibold mb-2 bg-black/40 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
            Player {idx + 1} ({opp.cards.length} cards)
          </div>
          <div className="flex -space-x-4">
            {Array.from({ length: opp.cards.length }).map((_, i) => (
              <div 
                key={i} 
                className="w-12 h-16 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-lg border border-white/20 shadow-md" 
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
