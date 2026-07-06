'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Heart, RefreshCw, Zap, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { supabase } from '@/lib/supabase';

const DEFAULT_START_DATE = new Date('2026-03-17T00:00:00');

type TimerMode = 'classic' | 'beats' | 'breath' | 'kiss';

export const RelationshipTimer = () => {
  const [mode, setMode] = useState<TimerMode>('classic');
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0
  });
  const [startDate, setStartDate] = useState<Date>(DEFAULT_START_DATE);

  useEffect(() => {
    const fetchStartDate = async () => {
      const { data, error } = await supabase
        .from('global_state')
        .select('value')
        .eq('key', 'start_date')
        .single();

      if (data) {
        setStartDate(new Date(data.value as string));
      }
    };
    fetchStartDate();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = now.getTime() - startDate.getTime();

      const totalSeconds = Math.floor(difference / 1000);
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, totalSeconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getAlternativeStats = () => {
    switch (mode) {
      case 'beats':
        return { value: (timeLeft.totalSeconds * 1.2).toLocaleString(undefined, { maximumFractionDigits: 0 }), label: 'Ударов сердца' };
      case 'breath':
        return { value: (timeLeft.totalSeconds / 4).toLocaleString(undefined, { maximumFractionDigits: 0 }), label: 'Общих вдохов' };
      case 'kiss':
        return { value: (timeLeft.totalSeconds * 0.05).toLocaleString(undefined, { maximumFractionDigits: 0 }), label: 'Поцелуев (в теории)' };
      default:
        return null;
    }
  };

  const altStats = getAlternativeStats();

  return (
    <div className="relative flex flex-col items-center justify-center gap-6 text-center h-full py-10 px-8 bg-[#fdfaf3] border-[12px] border-[#e6d5bc]/30 shadow-[20px_20px_60px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden group">
      {/* Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
      
      <button 
        onClick={() => {
          const modes: TimerMode[] = ['classic', 'beats', 'breath', 'kiss'];
          const nextIndex = (modes.indexOf(mode) + 1) % modes.length;
          setMode(modes[nextIndex]);
        }}
        className="absolute top-6 right-6 p-3 rounded-2xl bg-[#e6d5bc]/30 text-[#8b7355] hover:bg-[#e6d5bc]/50 transition-all opacity-0 group-hover:opacity-100 z-10"
      >
        <RefreshCw size={20} className={mode !== 'classic' ? 'animate-spin-slow' : ''} />
      </button>

      <motion.div
        animate={mode === 'beats' ? { scale: [1, 1.2, 1] } : { scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: mode === 'beats' ? 0.8 : 2 }}
        className="text-[#8b7355] relative z-10"
      >
        {mode === 'classic' && <Heart fill="currentColor" size={72} />}
        {mode === 'beats' && <Zap fill="currentColor" size={72} className="text-pink-500" />}
        {mode === 'breath' && <Sun fill="currentColor" size={72} className="text-amber-400" />}
        {mode === 'kiss' && <Heart fill="currentColor" size={72} className="text-red-400" />}
      </motion.div>
      
      <div className="space-y-2 relative z-10">
        <h2 className="text-4xl font-serif font-bold text-[#5c4a33]">Мы вместе уже</h2>
        <p className="text-[11px] text-[#8b7355]/50 uppercase tracking-[0.3em] font-black">
          {mode === 'classic' ? 'Обычное время' : 'Оригинальный счет'}
        </p>
      </div>
      
      <div className="w-full h-24 flex items-center justify-center relative z-10">
        <AnimatePresence mode="wait">
          {mode === 'classic' ? (
            <motion.div 
              key="classic"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-4 gap-6 w-full"
            >
              {[
                { label: 'Дней', value: timeLeft.days },
                { label: 'Часов', value: timeLeft.hours },
                { label: 'Минут', value: timeLeft.minutes },
                { label: 'Секунд', value: timeLeft.seconds },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center group/item">
                  <div className="relative">
                    <span className="text-5xl font-black tracking-tighter text-[#5c4a33] leading-none">
                      {item.value}
                    </span>
                    <motion.div 
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      className="absolute -bottom-1 left-0 right-0 h-1 bg-[#e6d5bc] origin-left transition-transform"
                    />
                  </div>
                  <span className="text-[10px] uppercase font-black tracking-[0.25em] text-[#8b7355]/40 mt-3 group-hover/item:text-[#8b7355]/70 transition-colors">
                    {item.label}
                  </span>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="alt"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center"
            >
              <span className="text-5xl font-black text-[#5c4a33]">
                {altStats?.value}
              </span>
              <span className="text-[11px] uppercase tracking-[0.25em] font-black text-[#8b7355]/50 mt-2">
                {altStats?.label}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
