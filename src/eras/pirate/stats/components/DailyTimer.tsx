import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Anchor, Compass, Timer } from 'lucide-react';

export const DailyTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ h: '00', m: '00', s: '00' });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      
      setTimeLeft({
        h: Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0'),
        m: Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, '0'),
        s: Math.floor(diff / 1000 % 60).toString().padStart(2, '0')
      });
    };

    const timer = setInterval(update, 1000);
    update();
    return () => clearInterval(timer);
  }, []);

  const TimeSegment = ({ value, label }: { value: string, label: string }) => (
    <div className="flex flex-col items-center">
       <div className="bg-white/40 backdrop-blur-sm rounded-xl px-3 py-2 border-2 border-amber-900/10 shadow-inner min-w-[48px] flex items-center justify-center group-hover:border-amber-500/30 transition-colors">
          <span className="text-2xl font-black tabular-nums text-amber-950 tracking-tighter leading-none drop-shadow-sm">{value}</span>
       </div>
       <span className="text-[9px] font-black uppercase tracking-widest text-amber-900/40 mt-2 font-serif">{label}</span>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-[#f2e2ba] rounded-[2.5rem] p-6 pl-8 border-[10px] border-[#3e2723]/10 flex items-center gap-10 relative overflow-hidden group"
    >
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40 pointer-events-none" />
       
       <div className="flex items-center gap-6 relative z-10">
          <div className="relative">
             <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center text-white group-hover:rotate-12 transition-all duration-500 border-4 border-[#3e2723]/10 relative overflow-hidden">
                <Timer size={32} strokeWidth={2.5} className="relative z-10" />
             </div>
          </div>
          
          <div className="flex flex-col">
             <span className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-600 leading-none mb-2">Новый улов</span>
             <span className="text-base font-serif italic text-amber-900/40 leading-none">через время:</span>
          </div>
       </div>

       <div className="flex items-center gap-3 relative z-10 pr-4">
          <TimeSegment value={timeLeft.h} label="час" />
          <span className="text-2xl font-black text-amber-900/10 mb-5">:</span>
          <TimeSegment value={timeLeft.m} label="мин" />
          <span className="text-2xl font-black text-amber-900/10 mb-5">:</span>
          <TimeSegment value={timeLeft.s} label="сек" />
       </div>
       
       {/* Decorative anchor */}
       <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity rotate-12 pointer-events-none">
          <Anchor size={100} className="text-amber-900" />
       </div>
    </motion.div>
  );
};
