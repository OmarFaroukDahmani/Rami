'use client';
import { useGameStore } from '@/store/gameStore';

export default function OpponentHand() {
  const { players, myPlayerId, currentPlayerIndex } = useGameStore();
  const myIndex = players.findIndex(p => p.playerId === myPlayerId);
  if (myIndex === -1) return null;

  // Calculate relative positions for other players
  const getSeatPosition = (idx: number) => {
    const total = players.length;
    const relativePos = (idx - myIndex + total) % total;

    if (total === 2) {
      if (relativePos === 1) return 'top';
    } else if (total === 3) {
      if (relativePos === 1) return 'left';
      if (relativePos === 2) return 'right';
    } else if (total === 4) {
      if (relativePos === 1) return 'left';
      if (relativePos === 2) return 'top';
      if (relativePos === 3) return 'right';
    }
    return null;
  };

  return (
    <>
      {players.map((player, idx) => {
        const seat = getSeatPosition(idx);
        if (!seat) return null;

        const isTurn = currentPlayerIndex === idx;

        const seatStyles = {
          top: "top-8 left-1/2 -translate-x-1/2 flex-col",
          left: "left-8 top-1/2 -translate-y-1/2 flex-row",
          right: "right-8 top-1/2 -translate-y-1/2 flex-row-reverse",
        }[seat];

        const cardStyles = {
          top: "flex -space-x-4",
          left: "flex flex-col -space-y-12",
          right: "flex flex-col -space-y-12",
        }[seat];

        return (
          <div key={player.playerId} className={`absolute ${seatStyles} flex items-center gap-4 transition-all duration-500 z-30`}>
            {/* Player Info Badge */}
            <div className={`flex flex-col items-center gap-1 p-2 rounded-2xl border backdrop-blur-md transition-all
              ${isTurn ? 'bg-amber-500/20 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-110' : 'bg-black/40 border-white/10'}
            `}>
              <div className="text-[10px] uppercase font-black tracking-tighter text-white/40">
                {isTurn ? 'Mchi l\'Loub' : `Player ${idx + 1}`}
              </div>
              <div className="text-sm font-bold text-white">
                {player.cards.length} <span className="text-[10px] opacity-50">Warka</span>
              </div>
            </div>

            {/* Visual Hand (Backs) */}
            <div className={cardStyles}>
              {Array.from({ length: Math.min(player.cards.length, 7) }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-10 h-14 sm:w-12 sm:h-16 bg-gradient-to-br from-indigo-800 to-slate-900 rounded-lg border border-white/20 shadow-xl
                    ${seat === 'top' ? 'rotate-0' : seat === 'left' ? 'rotate-90' : '-rotate-90'}
                  `} 
                />
              ))}
              {player.cards.length > 7 && (
                <div className="w-12 h-16 flex items-center justify-center text-white font-bold text-xs bg-black/40 rounded-lg border border-white/10">
                  +{player.cards.length - 7}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
