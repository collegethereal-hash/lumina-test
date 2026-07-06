'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Skull, Coins, Gem, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";

interface WheelOfFortuneProps {
  gold: number;
  onResult: (newGold: number, result: 'win' | 'lose' | 'push', winnerId?: 'me' | 'her') => void;
}

export function WheelOfFortuneGame({ gold, onResult }: WheelOfFortuneProps) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing'>('idle');

  const sectors = [
    { label: '500 ЗОЛОТА', color: 'bg-yellow-400', value: 500, icon: <Coins size={14} /> },
    { label: 'СКИН ПОПУГАЯ', color: 'bg-purple-500', value: 'skin', icon: <Sparkles size={14} /> },
    { label: 'КРАКЕН', color: 'bg-slate-900', value: -1000, icon: <Skull size={14} /> },
    { label: 'АЛМАЗ', color: 'bg-amber-400', value: 2000, icon: <Gem size={14} /> },
    { label: 'ПУСТО', color: 'bg-stone-400', value: 0, icon: <XIcon /> },
    { label: '1000 ЗОЛОТА', color: 'bg-amber-500', value: 1000, icon: <Coins size={14} /> },
    { label: 'ТЮРЬМА', color: 'bg-zinc-800', value: -500, icon: <Skull size={14} /> },
    { label: 'УДВОЕНИЕ', color: 'bg-emerald-500', value: 'x2', icon: <Sparkles size={14} /> },
  ];

  useEffect(() => {
    const lastSpin = localStorage.getItem('last_spin_time');
    if (lastSpin) {
      const diff = Date.now() - parseInt(lastSpin);
      const dayInMs = 24 * 60 * 60 * 1000;
      if (diff < dayInMs) {
        setTimeLeft(dayInMs - diff);
      }
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev && prev > 1000) return prev - 1000;
        return null;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}ч ${mins}м ${secs}с`;
  };

  const spin = () => {
    if (spinning || timeLeft) return;
    
    setSpinning(true);
    const extraRots = 5 + Math.random() * 5;
    const newRot = rotation + extraRots * 360;
    setRotation(newRot);

    setTimeout(() => {
      setSpinning(false);
      const actualRot = newRot % 360;
      const sectorIndex = Math.floor((360 - actualRot) / (360 / sectors.length)) % sectors.length;
      const sector = sectors[sectorIndex];
      setResult(sector);
      
      localStorage.setItem('last_spin_time', Date.now().toString());
      setTimeLeft(24 * 60 * 60 * 1000);

      if (typeof sector.value === 'number') {
        onResult(gold + sector.value, sector.value > 0 ? 'win' : 'lose', 'me');
      } else if (sector.value === 'x2') {
        onResult(gold * 2, 'win', 'me');
      } else if (sector.value === 'skin') {
        // Handle skin unlock
        onResult(gold, 'win', 'me');
      }
    }, 4000);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 pointer-events-none" />
      
      <AnimatePresence mode="wait">
        {gameState === 'idle' ? (
          <motion.div 
            key="idle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center gap-12 text-center"
          >
            <div className="relative">
              <div className="absolute -inset-10 bg-amber-500/20 blur-[60px] rounded-full animate-pulse" />
              <div className="w-64 h-64 rounded-full border-[12px] border-amber-900/10 flex items-center justify-center bg-white/40 backdrop-blur-md shadow-2xl relative z-10">
                <Compass size={120} className="text-amber-600 animate-[spin_10s_linear_infinite]" />
              </div>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-6xl font-black text-amber-900 uppercase tracking-tighter">Колесо Удачи</h3>
              <p className="text-amber-900/40 font-serif italic text-2xl max-w-lg">
                «Испытай судьбу раз в сутки. Кракен забирает всё, Алмаз дарит величие!»
              </p>
            </div>

            <button 
              onClick={() => setGameState('playing')}
              className="px-24 py-8 bg-amber-500 text-slate-900 rounded-[2.5rem] font-black uppercase tracking-widest text-2xl shadow-[0_12px_0_rgb(120,63,4)] active:translate-y-2 active:shadow-none transition-all"
            >
              К штурвалу!
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="playing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center space-y-12"
          >
            <div className="relative w-[30rem] h-[30rem]">
              {/* Pointer */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-10 h-14 bg-red-600 z-50 shadow-2xl" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
              
              <motion.div 
                animate={{ rotate: rotation }}
                transition={{ duration: 4, ease: "circOut" }}
                className="w-full h-full rounded-full border-[16px] border-amber-900/30 relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]"
              >
                {sectors.map((s, i) => (
                  <div 
                    key={i}
                    className={cn("absolute top-0 left-1/2 w-1/2 h-1/2 origin-bottom-left flex items-center justify-center", s.color)}
                    style={{ transform: `rotate(${i * (360 / sectors.length)}deg)` }}
                  >
                    <div className="flex flex-col items-center gap-2 -rotate-45 translate-x-8 -translate-y-8">
                      <span className="text-[10px] font-black text-white uppercase tracking-tighter text-center max-w-[60px] leading-none">
                        {s.label}
                      </span>
                      <div className="text-white/40">{s.icon}</div>
                    </div>
                  </div>
                ))}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-20" />
              </motion.div>
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-amber-900 rounded-full border-8 border-amber-500 shadow-2xl z-10 flex items-center justify-center">
                 <Compass size={40} className="text-amber-500" />
              </div>
            </div>

            <div className="space-y-8 text-center bg-white/40 p-8 rounded-[3rem] border-2 border-amber-900/10 backdrop-blur-md shadow-inner max-w-xl w-full">
              {timeLeft ? (
                <div className="space-y-4">
                  <h3 className="text-xl font-black text-amber-900 uppercase">Следующий шанс через:</h3>
                  <p className="text-4xl font-black text-amber-600 tracking-tighter tabular-nums">{formatTime(timeLeft)}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <button 
                    onClick={spin} 
                    disabled={spinning}
                    className="w-full py-8 bg-amber-500 text-slate-900 rounded-[2rem] font-black uppercase tracking-widest text-xl shadow-[0_12px_0_rgb(120,63,4)] active:translate-y-2 active:shadow-none transition-all disabled:opacity-50"
                  >
                    {spinning ? 'Крутим...' : 'Испытать Удачу!'}
                  </button>
                </div>
              )}
              
              {result && !spinning && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-4 p-4 bg-amber-500/20 rounded-2xl border-2 border-amber-500/40">
                  <p className="text-xl font-black text-amber-950 uppercase">Выпало: {result.label}!</p>
                </motion.div>
              )}
            </div>
            
            <button 
              onClick={() => setGameState('idle')}
              className="text-amber-900/40 font-black uppercase tracking-widest text-[10px] hover:text-amber-900 transition-colors"
            >
              ← Назад в меню
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  );
}
