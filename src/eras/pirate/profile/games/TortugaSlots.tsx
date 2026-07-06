'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Anchor, Beer, Landmark, Skull, RefreshCw, Play, Trophy, Sparkles, Zap, ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";

interface SlotsProps {
  onResult: (newGold: number, result: 'win' | 'lose' | 'push') => void;
  gold: number;
}

const SYMBOLS = [
  { id: 'anchor', icon: <Anchor className="text-amber-500" />, value: 2 },
  { id: 'rum', icon: <Beer className="text-orange-500" />, value: 5 },
  { id: 'skull', icon: <Skull className="text-rose-500" />, value: 10 },
  { id: 'chest', icon: <Landmark className="text-yellow-500" />, value: 50 }
];

export function TortugaSlotsGame({ onResult, gold }: SlotsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [reels, setReels] = useState([0, 0, 0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [bet, setBet] = useState(100);
  const [lastWin, setLastWin] = useState(0);
  const [rumClicks, setRumClicks] = useState(0);
  const [drunkenMode, setDrunkenMode] = useState(false);

  const spin = () => {
    if (gold < bet || isSpinning) return;
    setIsSpinning(true);
    setLastWin(0);
    
    // Logic for symbols
    let newReels;
    if (drunkenMode) {
      // 40% chance for Rum, 20% for others
      newReels = reels.map(() => {
        const r = Math.random();
        if (r < 0.4) return 1; // Rum
        if (r < 0.6) return 0; // Anchor
        if (r < 0.8) return 2; // Skull
        return 3; // Chest
      });
    } else {
      newReels = reels.map(() => Math.floor(Math.random() * SYMBOLS.length));
    }

    setTimeout(() => {
      setReels(newReels);
      setIsSpinning(false);
      checkResult(newReels);
    }, 2000);
  };

  const handleRumClick = () => {
    const newClicks = rumClicks + 1;
    setRumClicks(newClicks);
    if (newClicks >= 5) {
      setDrunkenMode(!drunkenMode);
      setRumClicks(0);
    }
  };

  const checkResult = (finalReels: number[]) => {
    if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
      const winAmount = bet * SYMBOLS[finalReels[0]].value;
      setLastWin(winAmount);
      // Fix: Add only the profit (winAmount - bet)
      onResult(gold + (winAmount - bet), 'win');
    } else if (finalReels[0] === finalReels[1] || finalReels[1] === finalReels[2] || finalReels[0] === finalReels[2]) {
      const winAmount = Math.floor(bet * 1.2);
      setLastWin(winAmount);
      // Fix: Add only the profit (winAmount - bet)
      onResult(gold + (winAmount - bet), 'win');
    } else {
      onResult(gold - bet, 'lose');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#f8f5f0]">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-10" />
      
      <AnimatePresence mode="wait">
        {!isPlaying ? (
          <motion.div 
            key="start"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-12 z-10 p-8"
          >
            <div className="relative group">
              <div className="absolute -inset-16 bg-amber-500/10 blur-[80px] rounded-full animate-pulse" />
              <div className="w-56 h-56 rounded-[3rem] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.06)] flex items-center justify-center relative transform -rotate-3 hover:rotate-0 transition-transform duration-500 border border-white">
                <Sparkles size={100} className={cn("transition-colors", drunkenMode ? "text-orange-500" : "text-amber-500")} />
              </div>
            </div>
            <div className="space-y-4 max-w-lg">
              <h3 className="text-6xl font-black uppercase tracking-tighter text-amber-950">Слоты <span className={cn("transition-colors", drunkenMode ? "text-orange-500" : "text-amber-500")}>Тортуги</span></h3>
              <p className="text-amber-900/60 font-serif italic text-2xl leading-relaxed">
                {drunkenMode ? "«Ром льется рекой! Сегодня удача благоволит пьяным мастерам.»" : "«Элегантный азарт в белом стиле. Поймай три сундука удачи!»"}
              </p>
            </div>
            <button 
              onClick={() => setIsPlaying(true)}
              className={cn(
                "px-20 py-6 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center gap-4",
                drunkenMode ? "bg-orange-600 hover:bg-orange-500" : "bg-amber-950 hover:bg-amber-900"
              )}
            >
              К Автомату <Sparkles size={24} />
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="game"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-8 z-10 p-4"
          >
            {/* Elegant White Slot Machine */}
            <div className={cn(
              "bg-white p-10 rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.08)] border-4 relative transition-all duration-500",
              drunkenMode ? "border-orange-500/30" : "border-zinc-100"
            )}>
              <div className={cn(
                "absolute -top-4 left-1/2 -translate-x-1/2 text-white px-10 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.4em] shadow-lg transition-colors",
                drunkenMode ? "bg-orange-600" : "bg-amber-950"
              )}>
                 {drunkenMode ? "Drunken Master Mode" : "Premium Slots"}
              </div>

              <div className="flex gap-4 bg-[#fcfaf7] p-6 rounded-[3rem] border border-zinc-100 shadow-inner">
                {reels.map((symbolIdx, i) => (
                  <div key={i} className="relative w-28 h-40 sm:w-36 sm:h-48 bg-white rounded-[2rem] shadow-sm border border-zinc-100 flex items-center justify-center overflow-hidden">
                    <motion.div 
                      key={isSpinning ? 'spinning' : 'static'}
                      initial={isSpinning ? {} : { y: 0, opacity: 1, filter: 'blur(0px)' }}
                      animate={isSpinning ? { 
                        y: [0, -200, 200, 0],
                        opacity: [1, 0.5, 0.5, 1],
                        filter: ['blur(0px)', 'blur(10px)', 'blur(10px)', 'blur(0px)']
                      } : { y: 0, opacity: 1, filter: 'blur(0px)' }}
                      transition={isSpinning ? { 
                        repeat: Infinity, 
                        duration: 0.2, 
                        delay: i * 0.1 
                      } : { type: 'spring', stiffness: 300, damping: 20 }}
                      className="scale-[2.5] sm:scale-[3.5]"
                    >
                      {SYMBOLS[symbolIdx].icon}
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/20 pointer-events-none" />
                  </div>
                ))}
              </div>

              {/* Status Display */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-full flex justify-center">
                 <AnimatePresence>
                   {lastWin > 0 && (
                     <motion.div 
                       initial={{ y: 20, opacity: 0 }}
                       animate={{ y: 0, opacity: 1 }}
                       exit={{ y: -20, opacity: 0 }}
                       className="bg-emerald-500 text-white px-10 py-3 rounded-2xl font-black text-xl shadow-xl border-4 border-white flex items-center gap-3"
                     >
                       <Zap size={20} className="fill-white" /> +{lastWin}G!
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
            </div>

            {/* Clean Controls */}
            <div className="w-full max-w-xl space-y-6">
               <div className="flex gap-3 bg-white/60 backdrop-blur-md p-3 rounded-[2.5rem] border border-zinc-100 shadow-sm">
                  {[100, 200, 500, 1000].map(v => (
                    <button 
                      key={v} 
                      onClick={() => setBet(v)}
                      disabled={isSpinning}
                      className={cn(
                        "flex-1 py-4 rounded-2xl text-xs font-black transition-all",
                        bet === v ? (drunkenMode ? "bg-orange-600 text-white shadow-md scale-105" : "bg-amber-950 text-white shadow-md scale-105") : "text-amber-900/30 hover:bg-white"
                      )}
                    >
                      {v}G
                    </button>
                  ))}
               </div>

               <button 
                 onClick={spin}
                 disabled={isSpinning || gold < bet}
                 className={cn(
                   "w-full py-8 text-amber-950 rounded-[2.5rem] font-black uppercase text-2xl tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 border-b-8",
                   drunkenMode ? "bg-orange-500 hover:bg-orange-400 border-orange-600" : "bg-amber-500 hover:bg-amber-400 border-amber-600"
                 )}
               >
                 {isSpinning ? <RefreshCw className="animate-spin" size={32} /> : "Вращать!"}
               </button>
            </div>

            <div className="flex gap-8 opacity-20 hover:opacity-50 transition-opacity mt-12">
               {SYMBOLS.map((s, i) => (
                 <button key={i} onClick={s.id === 'rum' ? handleRumClick : undefined} className="flex items-center gap-2 focus:outline-none">
                    <div className={cn("scale-125 transition-transform", s.id === 'rum' && drunkenMode ? "scale-150 rotate-12" : "")}>{s.icon}</div>
                    <span className="text-[10px] font-black text-amber-950">x{s.value}</span>
                 </button>
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

