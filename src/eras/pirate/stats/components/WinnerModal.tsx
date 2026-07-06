import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Anchor, Heart, X, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";

interface WinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  gScore: number;
  cScore: number;
  p1Name: string;
  p2Name: string;
  islandTitle: string;
}

export const WinnerModal = ({ isOpen, onClose, gScore, cScore, p1Name, p2Name, islandTitle }: WinnerModalProps) => {
  const isDraw = gScore === cScore;
  const winner = gScore > cScore ? p1Name : p2Name;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-amber-950/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 2 }}
            className="relative w-full max-w-xl bg-[#f4ebd0] rounded-[3rem] p-1 border-8 border-amber-900/20 shadow-[0_50px_100px_rgba(0,0,0,0.4)]"
          >
            {/* Папирусная текстура */}
            <div className="relative bg-[#f4ebd0] rounded-[2.5rem] p-12 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/papyrus.png')] opacity-60 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900/5 via-transparent to-amber-900/10 pointer-events-none" />

                <button 
                onClick={onClose}
                className="absolute top-8 right-8 text-amber-900/20 hover:text-amber-900 transition-colors z-20"
                >
                <X size={32} strokeWidth={3} />
                </button>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <motion.div
                        animate={{ 
                            y: [0, -10, 0],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="w-28 h-28 bg-amber-500 rounded-full flex items-center justify-center shadow-2xl mb-8 relative"
                    >
                        <Trophy size={56} className="text-white" strokeWidth={2.5} />
                        <motion.div 
                            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -top-2 -right-2 text-amber-300"
                        >
                            <Sparkles size={32} />
                        </motion.div>
                    </motion.div>

                    <div className="space-y-2 mb-10">
                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.5em]">Экспедиция завершена</span>
                        <h3 className="text-5xl font-black text-amber-950 uppercase tracking-tighter leading-none italic">
                            {islandTitle}
                        </h3>
                    </div>

                    <div className="flex items-center justify-center gap-12 mb-12 relative">
                        <div className="flex flex-col items-center relative z-10">
                            <div className="text-7xl font-black text-emerald-600 tabular-nums drop-shadow-sm">{gScore}</div>
                            <div className="text-[10px] font-black text-amber-900/40 uppercase tracking-widest mt-3">{p1Name}</div>
                        </div>
                        
                        <div className="text-amber-900/10 text-5xl font-black italic">vs</div>
                        
                        <div className="flex flex-col items-center relative z-10">
                            <div className="text-7xl font-black text-rose-500 tabular-nums drop-shadow-sm">{cScore}</div>
                            <div className="text-[10px] font-black text-amber-900/40 uppercase tracking-widest mt-3">{p2Name}</div>
                        </div>
                    </div>

                    <div className="bg-amber-900/5 border-2 border-amber-900/10 rounded-[2rem] p-8 w-full mb-10 relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#f4ebd0] px-4">
                            <Heart size={24} className="text-rose-500 fill-rose-500" />
                        </div>
                        <p className="text-amber-950 text-xl font-black uppercase tracking-tight leading-tight">
                            {isDraw 
                                ? "Ничья! Ваши сердца бьются в унисон, как одна команда!" 
                                : `Капитан ${winner} забирает сокровища этого острова!`}
                        </p>
                        <p className="text-amber-900/60 font-serif italic mt-4">
                            Ваша связь стала крепче на этом пути.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-6 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black text-lg uppercase tracking-[0.2em] transition-all shadow-[0_10px_30px_rgba(217,119,6,0.3)] border-b-8 border-amber-800 active:border-b-0 active:translate-y-2"
                    >
                        Продолжить путь
                    </button>
                </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
