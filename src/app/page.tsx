'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Bot, Settings, Play, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

export default function LandingPage() {
  const router = useRouter();
  const { 
    frashThreshold, setFrashThreshold, 
    playerCount, setPlayerCount,
    setIsVersusBots,
    initGame,
    processBotTurn
  } = useGameStore();
  const [showSettings, setShowSettings] = useState(false);

  const startVsBots = () => {
    setIsVersusBots(true);
    initGame('player1');
    router.push('/play');
    // If player1 is not the dealer, we need to trigger bot turn
    setTimeout(() => {
        const { currentPlayerIndex, players, myPlayerId } = useGameStore.getState();
        if (players[currentPlayerIndex].playerId !== myPlayerId) {
            processBotTurn();
        }
    }, 500);
  };

  const startOnline = () => {
    setIsVersusBots(false);
    initGame('player1');
    router.push('/play');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030712] overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="z-10 w-full max-w-4xl flex flex-col items-center text-center"
      >
        {/* Logo / Title */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="relative inline-block">
             <h1 className="text-8xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-500 select-none">
                RAMI
             </h1>
             <div className="absolute -bottom-2 right-0 bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full transform rotate-12">ONLINE</div>
          </div>
          <p className="text-gray-400 mt-4 text-lg font-medium tracking-wide max-w-md mx-auto">
            The ultimate Mediterranean card game experience. Beat your friends or master the bots.
          </p>
        </motion.div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <MenuButton 
            onClick={startOnline}
            icon={<Users className="w-8 h-8" />}
            title="Online Play"
            description="Create or join a room to play with friends"
            color="bg-emerald-600 hover:bg-emerald-500"
          />
          <MenuButton 
            onClick={startVsBots}
            icon={<Bot className="w-8 h-8" />}
            title="Versus Bots"
            description="Sharpen your skills against advanced AI"
            color="bg-blue-600 hover:bg-blue-500"
          />
        </div>

        {/* secondary actions */}
        <motion.div variants={itemVariants} className="mt-12 flex gap-4">
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all font-semibold"
          >
            <Settings className="w-5 h-5" />
            Game Settings
          </button>
        </motion.div>

        {/* Footer */}
        <motion.div variants={itemVariants} className="mt-20 text-white/20 text-xs font-bold tracking-widest uppercase">
          Crafted for competitive play
        </motion.div>
      </motion.div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#111827] w-full max-w-md rounded-3xl border border-white/10 p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Settings className="text-emerald-500" />
                  Settings
                </h2>
                <button onClick={() => setShowSettings(false)} className="text-white/40 hover:text-white capitalize text-sm font-bold">Close</button>
              </div>

              <div className="space-y-8">
                {/* Player Count Setting */}
                <div>
                  <label className="text-sm font-bold text-white/40 uppercase tracking-widest block mb-4">Number of Players</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[2, 3, 4].map(val => (
                      <button 
                        key={val}
                        onClick={() => setPlayerCount(val)}
                        className={`py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${playerCount === val ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 bg-white/5 text-white/40'}`}
                      >
                        <span className={`text-xl font-black ${playerCount === val ? 'text-white' : ''}`}>{val}</span>
                        <span className="text-[8px] font-bold uppercase opacity-50">Players</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Threshold Setting */}
                <div>
                  <label className="text-sm font-bold text-white/40 uppercase tracking-widest block mb-4">(فرش) Threshold</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[51, 71].map(val => (
                      <button 
                        key={val}
                        onClick={() => setFrashThreshold(val as any)}
                        className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${frashThreshold === val ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-white/5 text-white/40 hover:border-white/10'}`}
                      >
                        <span className={`text-2xl font-black ${frashThreshold === val ? 'text-white' : ''}`}>{val}</span>
                        <span className="text-[10px] font-bold uppercase opacity-50">Points</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Other simulated settings */}
                <div className="space-y-4">
                   <SettingToggle label="Fast Animations" active={true} />
                   <SettingToggle label="Sound Effects" active={false} />
                   <SettingToggle label="Dark Mode Table" active={true} />
                </div>
              </div>

              <button 
                onClick={() => setShowSettings(false)}
                className="w-full mt-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all shadow-lg active:scale-95"
              >
                Save Preferences
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuButton({ icon, title, description, color, onClick }: any) {
  return (
    <motion.button 
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
      }}
      onClick={onClick}
      className={`group flex items-center p-6 rounded-3xl transition-all shadow-xl text-left border border-white/5 ${color}`}
    >
      <div className="bg-white/20 p-4 rounded-2xl shadow-inner mr-5 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          {title}
          <Play className="w-3 h-3 fill-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </h3>
        <p className="text-white/60 text-sm leading-tight">{description}</p>
      </div>
    </motion.button>
  );
}

function SettingToggle({ label, active }: any) {
  return (
    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
      <span className="text-white/80 font-bold text-sm">{label}</span>
      <div className={`w-12 h-6 rounded-full relative transition-colors ${active ? 'bg-emerald-500' : 'bg-gray-800'}`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${active ? 'left-7' : 'left-1'}`} />
      </div>
    </div>
  );
}
