'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ship, Skull, Coins, Waves, RefreshCw, Play, ArrowUpCircle, Flame, Zap, Navigation } from 'lucide-react';
import { cn } from "@/lib/utils";

interface CrashProps {
  onResult: (newGold: number, result: 'win' | 'lose' | 'push') => void;
  gold: number;
}

export function CrashShipGame({ onResult, gold }: CrashProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'crashed' | 'cashed_out'>('betting');
  const [multiplier, setMultiplier] = useState(1.0);
  const [bet, setBet] = useState(100);
  const [cashOutValue, setCashOutValue] = useState<number | null>(null);
  const [shipClicks, setShipClicks] = useState(0);
  const [krakenMode, setKrakenMode] = useState(false);
  
  const crashPointRef = useRef<number>(0);
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRound = () => {
    if (gold < bet) return;
    
    const rand = Math.random();
    // Logic: crash point is calculated once at the start
    crashPointRef.current = Math.max(1, 0.99 / (1 - rand));
    if (Math.random() < 0.05) crashPointRef.current = 1.0;
    
    setGameState('playing');
    setMultiplier(1.0);
    setCashOutValue(null);

    let currentMult = 1.0;
    gameIntervalRef.current = setInterval(() => {
      // Multiplier grows exponentially
      currentMult += 0.01 * (currentMult * 0.35);
      setMultiplier(currentMult);

      if (currentMult >= crashPointRef.current) {
        clearInterval(gameIntervalRef.current!);
        setGameState('crashed');
        onResult(gold - bet, 'lose');
      }
    }, 100);
  };

  const handleShipClick = () => {
    if (gameState === 'playing') return;
    const newClicks = shipClicks + 1;
    setShipClicks(newClicks);
    if (newClicks >= 5) {
      setKrakenMode(!krakenMode);
      setShipClicks(0);
    }
  };

  const cashOut = () => {
    if (gameState !== 'playing') return;
    
    clearInterval(gameIntervalRef.current!);
    setCashOutValue(multiplier);
    setGameState('cashed_out');
    const winAmount = Math.floor(bet * multiplier);
    // Fix: Add only the profit (winAmount - bet)
    onResult(gold + (winAmount - bet), 'win');
  };

  useEffect(() => {
    return () => {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#f8f5f0] font-sans">
      <div className="absolute inset-0">
         <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 to-transparent" />
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20" />
         
         {/* Gentle Ocean Waves Animation */}
         <motion.div 
           animate={{ x: [0, -20, 0], y: [0, 10, 0] }}
           transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
           className="absolute bottom-0 left-0 right-0 h-64 opacity-10 pointer-events-none"
         >
            <Waves className="w-full h-full text-amber-400" />
         </motion.div>
      </div>
      
      <AnimatePresence mode="wait">
        {!isPlaying ? (
          <motion.div 
            key="start"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-12 z-10 p-8"
          >
            <div className="relative">
              <div className="absolute -inset-16 bg-amber-500/10 blur-[80px] rounded-full animate-pulse" />
              <div className="w-56 h-56 rounded-[3rem] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex items-center justify-center relative transform rotate-3 hover:rotate-0 transition-transform duration-500 border border-white">
                <Ship size={100} className={cn("transition-colors", krakenMode ? "text-emerald-600" : "text-amber-500")} />
              </div>
            </div>
            <div className="space-y-4 max-w-lg">
              <h3 className="text-6xl font-black uppercase tracking-tighter text-amber-950">Крэш-<span className={cn("transition-colors", krakenMode ? "text-emerald-600" : "text-amber-500")}>Корабль</span></h3>
              <p className="text-amber-900/60 font-serif italic text-2xl leading-relaxed">
                {krakenMode ? "«Кракен на твоей стороне! Теперь ты видишь глубину коварных мелей.»" : "«Твой фрегат ловит попутный ветер! Плыви как можно дольше, но берегись коварных мелей.»"}
              </p>
            </div>
            <button 
              onClick={() => setIsPlaying(true)}
              className={cn(
                "px-20 py-6 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center gap-4",
                krakenMode ? "bg-emerald-700 hover:bg-emerald-600" : "bg-amber-950 hover:bg-amber-900"
              )}
            >
              В Путь! <Navigation size={24} />
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col z-10 p-4 lg:p-10"
          >
            {/* Clean Game Arena */}
            <div className={cn(
              "flex-1 flex flex-col items-center justify-center relative bg-white/60 backdrop-blur-sm rounded-[3.5rem] border-4 shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden mb-8 transition-all duration-500",
              krakenMode ? "border-emerald-500/30" : "border-white"
            )}>
               <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
               
               <div className="relative z-10 flex flex-col items-center">
                  <motion.div
                    animate={gameState === 'playing' ? { 
                      scale: [1, 1.02, 1],
                    } : {}}
                    className={cn(
                      "text-[10rem] sm:text-[12rem] font-black tracking-tighter transition-all duration-300",
                      gameState === 'crashed' ? "text-red-500" : 
                      gameState === 'cashed_out' ? "text-emerald-500" : "text-amber-950"
                    )}
                  >
                    {multiplier.toFixed(2)}<span className="text-4xl sm:text-5xl ml-2">x</span>
                  </motion.div>
                  
                  {/* Kraken Mode: Show crash point */}
                  {krakenMode && gameState === 'playing' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -top-12 text-emerald-600 font-black text-xl uppercase tracking-widest bg-emerald-50 px-4 py-1 rounded-full border border-emerald-100">
                      Мель на: {crashPointRef.current.toFixed(2)}x
                    </motion.div>
                  )}
                  
                  <AnimatePresence mode="wait">
                    {gameState === 'crashed' && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-red-50 text-red-600 px-8 py-3 rounded-2xl font-black uppercase tracking-widest border-2 border-red-100 shadow-sm flex items-center gap-3">
                        <Skull size={24} /> Налетели на мель!
                      </motion.div>
                    )}
                    {gameState === 'cashed_out' && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-emerald-50 text-emerald-600 px-8 py-4 rounded-2xl font-black uppercase tracking-widest border-2 border-emerald-100 shadow-sm flex items-center gap-4">
                        <Zap size={24} className="fill-emerald-500" />
                        <div className="text-left">
                           <p className="text-[8px] opacity-60">Улов собран!</p>
                           <p className="text-2xl font-black">+{Math.floor(bet * (cashOutValue || 0))}G</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>

               {/* Vibrant Ship Animation */}
               {gameState === 'playing' && (
                 <motion.div 
                   className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center"
                   animate={{ 
                     y: [0, -15, 0],
                     rotate: [-3, 3, -3]
                   }}
                   transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                 >
                    <div className="relative">
                       <Ship size={120} className={cn("filter drop-shadow-[0_15px_30px_rgba(245,158,11,0.4)] transition-colors", krakenMode ? "text-emerald-500" : "text-amber-500")} />
                       <motion.div 
                         animate={{ width: [40, 80, 40], opacity: [0.3, 0, 0.3] }}
                         transition={{ repeat: Infinity, duration: 1 }}
                         className={cn("absolute -bottom-2 left-1/2 -translate-x-1/2 h-1 rounded-full blur-sm", krakenMode ? "bg-emerald-300" : "bg-amber-300")}
                       />
                    </div>
                 </motion.div>
               )}
            </div>

            {/* Site Style Controls */}
            <div className="bg-[#f0ece4] p-8 rounded-[3rem] border border-white shadow-xl flex flex-col lg:flex-row gap-6 items-center">
               <div className="flex-1 w-full grid grid-cols-4 gap-3 bg-white/40 p-2 rounded-2xl border border-white/50">
                  {[100, 200, 500, 1000].map(v => (
                    <button 
                      key={v}
                      onClick={() => setBet(v)}
                      disabled={gameState === 'playing'}
                      className={cn(
                        "py-4 rounded-xl text-xs font-black uppercase transition-all",
                        bet === v 
                          ? (krakenMode ? "bg-emerald-700 text-white shadow-md scale-105" : "bg-white text-amber-950 shadow-md scale-105")
                          : "text-amber-900/30 hover:bg-white/40"
                      )}
                    >
                      {v}G
                    </button>
                  ))}
               </div>

               {gameState === 'playing' ? (
                 <button 
                   onClick={cashOut}
                   className="w-full lg:w-80 py-6 bg-emerald-500 text-white rounded-3xl font-black uppercase tracking-widest shadow-[0_15px_30px_rgba(16,185,129,0.3)] hover:bg-emerald-400 active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 border-emerald-700"
                 >
                   Забрать куш! <ArrowUpCircle size={28} />
                 </button>
               ) : (
                 <div className="flex gap-4 w-full lg:w-80">
                   <button 
                     onClick={startRound}
                     disabled={gold < bet}
                     className={cn(
                       "flex-1 py-6 text-white rounded-3xl font-black uppercase tracking-widest shadow-[0_15px_30px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 disabled:opacity-50",
                       krakenMode ? "bg-emerald-600 hover:bg-emerald-500 border-emerald-800" : "bg-amber-600 hover:bg-amber-500 border-amber-800"
                     )}
                   >
                     Полный вперед! <Play size={28} />
                   </button>
                   <button 
                     onClick={handleShipClick}
                     className={cn(
                       "w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-lg border-b-4",
                       krakenMode ? "bg-emerald-100 text-emerald-600 border-emerald-300" : "bg-white text-amber-900/20 border-zinc-200"
                     )}
                   >
                     <Ship size={24} />
                   </button>
                 </div>
               )}

               {gameState !== 'playing' && gameState !== 'betting' && (
                 <button 
                   onClick={() => setGameState('betting')}
                   className="p-4 text-amber-900/20 hover:text-amber-900/40 transition-all"
                 >
                   <RefreshCw size={24} />
                 </button>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

