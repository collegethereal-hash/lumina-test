'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Anchor, Lock, ArrowRight, Ship, Sword, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/components/DataProvider';

type Character = 'grinch' | 'cindy';

interface AuthProps {
  onComplete: (user: Character) => void;
}

export const PirateAuth = ({ onComplete }: AuthProps) => {
  const { spaceConfig } = useData();
  const [step, setStep] = useState<'character' | 'password'>('character');
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleCharSelect = (char: Character) => {
    setSelectedChar(char);
    setStep('password');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaceConfig) return;

    const correctPassword = selectedChar === 'grinch' ? spaceConfig.password_p1 : spaceConfig.password_p2;
    
    if (password === correctPassword) {
      if (selectedChar) {
        console.log('Login Success for:', selectedChar);
        // Устанавливаем куку для middleware
        document.cookie = `lumina_auth=${selectedChar}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
        onComplete(selectedChar);
      }
    } else {
      console.log('Login Failed: Incorrect password');
      setError(true);
      setTimeout(() => setError(false), 500);
      setPassword('');
    }
  };

  const p1Name = spaceConfig?.partner1_name || 'Гринч';
  const p2Name = spaceConfig?.partner2_name || 'Синди Лу';


  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#020617] overflow-hidden font-serif">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#0f172a_0%,#020617_100%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/waves.png')] repeat" />
        
        {/* Animated Lightning */}
        <motion.div
          animate={{ opacity: [0, 0, 0.1, 0, 0.05, 0] }}
          transition={{ duration: 5, repeat: Infinity, repeatDelay: 8 }}
          className="absolute inset-0 bg-white"
        />
      </div>

      <AnimatePresence mode="wait">
        {step === 'character' ? (
          <motion.div
            key="char-select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 w-full max-w-4xl px-4 text-center space-y-12"
          >
            <div className="space-y-4">
               <motion.div
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="inline-block p-4 bg-amber-400/10 rounded-full border-2 border-amber-400/20 shadow-2xl"
               >
                 <Skull size={48} className="text-amber-400" />
               </motion.div>
               <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-700">
                 Кто на борту?
               </h1>
               <p className="text-amber-200/40 italic text-xl">"Выбери своего пирата, чтобы войти в бухту"</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 max-w-4xl mx-auto">
               <PirateCharCard 
                 name={p2Name} 
                 title="Яростная Бестия"
                 onClick={() => handleCharSelect('cindy')}
                 emoji="🏴‍☠️"
               />
               <PirateCharCard 
                 name={p1Name} 
                 title="Кровавый Капитан"
                 onClick={() => handleCharSelect('grinch')}
                 emoji="🍏"
               />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="password"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="relative z-10 w-full max-w-md px-6 text-center space-y-8"
          >
            <button 
              onClick={() => setStep('character')}
              className="absolute -top-16 left-6 text-amber-500/40 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:text-amber-400 transition-colors"
            >
              ← Назад к команде
            </button>

            <div className="space-y-6">
               <div className="w-32 h-32 mx-auto pirate-wood rounded-[2.5rem] border-4 border-amber-500/20 flex items-center justify-center text-6xl shadow-2xl relative">
                  {selectedChar === 'grinch' ? '🍏' : '🏴‍☠️'}
                  <div className="absolute -bottom-2 -right-2 p-2 bg-red-600 rounded-full text-white shadow-lg">
                    <Lock size={16} />
                  </div>
               </div>
               <div className="space-y-1">
                 <h2 className="text-3xl font-bold text-amber-100 uppercase tracking-widest">Пароль Капитана</h2>
                 <p className="text-amber-500/40 text-xs font-black uppercase tracking-[0.2em]">Только для своих</p>
               </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
               <motion.div animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}>
                 <input 
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="••••••••"
                   className={cn(
                     "w-full bg-black/40 border-4 border-amber-500/10 rounded-2xl px-4 py-5 text-center text-2xl tracking-[0.5em] focus:ring-0 focus:border-amber-400/40 text-amber-100 font-bold transition-all",
                     error && "border-red-500 text-red-500"
                   )}
                 />
               </motion.div>
               <button 
                type="submit"
                className="w-full py-5 bg-amber-400 text-slate-900 rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
               >
                 Войти в Бухту
                 <ArrowRight size={20} />
               </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PirateCharCard = ({ name, title, onClick, emoji }: any) => (
  <motion.button
    whileHover={{ y: -10, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="group relative w-full"
  >
    <div className="pirate-wood rounded-[3.5rem] border-4 border-amber-500/10 p-10 space-y-6 shadow-2xl transition-all group-hover:border-amber-400/40 relative overflow-hidden">
       <div className="absolute inset-0 bg-gradient-to-br from-amber-400/0 to-amber-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
       
       <div className="w-40 h-40 mx-auto rounded-[2.5rem] bg-black/40 border-4 border-amber-500/10 flex items-center justify-center text-8xl shadow-inner group-hover:rotate-12 transition-transform duration-500">
         {emoji}
       </div>
       <div className="space-y-2">
         <h3 className="text-4xl font-black uppercase tracking-tighter text-amber-100">{name}</h3>
         <p className="text-amber-500/40 text-[10px] font-black uppercase tracking-[0.4em]">{title}</p>
       </div>
       
       <div className="w-12 h-12 mx-auto rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
         <Anchor size={24} />
       </div>
    </div>
  </motion.button>
);
