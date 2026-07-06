'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Skull, X } from 'lucide-react';
import { cn } from "@/lib/utils";

interface BlackjackProps {
  gold: number;
  onResult: (newGold: number, result: 'win' | 'lose' | 'push', winnerId?: 'me' | 'her') => void;
  mode: 'ai' | 'local';
}

type CardValue = {
  label: string;
  value: number;
};

const getCard = (): CardValue => {
  const cards = [
    { label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 },
    { label: '5', value: 5 }, { label: '6', value: 6 }, { label: '7', value: 7 },
    { label: '8', value: 8 }, { label: '9', value: 9 }, { label: '10', value: 10 },
    { label: 'J', value: 10 }, { label: 'Q', value: 10 }, { label: 'K', value: 10 },
    { label: 'A', value: 11 }
  ];
  return cards[Math.floor(Math.random() * cards.length)];
};

const calculateTotal = (hand: CardValue[]) => {
  let total = hand.reduce((acc, card) => acc + card.value, 0);
  let aces = hand.filter(card => card.label === 'A').length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
};

export function BlackjackGame({ gold, onResult, mode }: BlackjackProps) {
  const [p1Hand, setP1Hand] = useState<CardValue[]>([]);
  const [p2Hand, setP2Hand] = useState<CardValue[]>([]);
  const [gameState, setGameState] = useState<'idle' | 'p1_turn' | 'p2_turn' | 'end'>('idle');
  const [bet, setBet] = useState(100);
  const [result, setResult] = useState<'p1_win' | 'p2_win' | 'push' | null>(null);

  const startGame = () => {
    if (gold < bet) return alert('Недостаточно дублонов!');
    const initialP1 = [getCard(), getCard()];
    const initialP2 = [getCard()];
    setP1Hand(initialP1);
    setP2Hand(initialP2);
    setGameState('p1_turn');
    setResult(null);

    // Check for natural 21
    if (calculateTotal(initialP1) === 21) {
       // Automatic stand
       setTimeout(() => standInternal(initialP1, initialP2), 1000);
    }
  };

  const hit = () => {
    const newCard = getCard();
    const newHand = [...p1Hand, newCard];
    setP1Hand(newHand);
    if (calculateTotal(newHand) > 21) {
      setGameState('end');
      setResult('p2_win');
      onResult(gold - bet, 'lose', 'me');
    }
  };

  const stand = () => {
    standInternal(p1Hand, p2Hand);
  };

  const standInternal = (currentP1Hand: CardValue[], currentP2Hand: CardValue[]) => {
    setGameState('p2_turn');
    let tempP2Hand = [...currentP2Hand];
    
    const playP2 = () => {
      const sum = calculateTotal(tempP2Hand);
      if (sum < 17) {
        tempP2Hand.push(getCard());
        setP2Hand([...tempP2Hand]);
        setTimeout(playP2, 600);
      } else {
        const p1Sum = calculateTotal(currentP1Hand);
        const p2Sum = calculateTotal(tempP2Hand);
        setGameState('end');
        if (p2Sum > 21 || p1Sum > p2Sum) {
          setResult('p1_win');
          onResult(gold + bet, 'win', 'me');
        } else if (p2Sum > p1Sum) {
          setResult('p2_win');
          onResult(gold - bet, 'lose', 'me');
        } else {
          setResult('push');
          onResult(gold, 'push');
        }
      }
    };
    playP2();
  };

  return (
    <div className="flex-1 flex flex-col justify-between h-full relative overflow-hidden p-12">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 pointer-events-none" />
      
      <div className="flex-1 flex flex-col justify-around py-10">
         {gameState === 'idle' ? (
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-12">
              <div className="flex gap-8">
                 <div className="w-40 h-56 bg-white rounded-3xl border-8 border-zinc-100 shadow-2xl flex items-center justify-center relative rotate-[-10deg]">
                    <div className="absolute top-4 left-4 text-amber-900 font-black text-3xl">A</div>
                    <Skull size={64} className="text-amber-900/10" />
                 </div>
                 <div className="w-40 h-56 bg-amber-950 rounded-3xl border-8 border-amber-900 shadow-2xl flex items-center justify-center relative rotate-[10deg]">
                    <Skull size={64} className="text-amber-500/10" />
                 </div>
              </div>
              <div className="space-y-4 text-center">
                 <h3 className="text-5xl font-black text-amber-900 uppercase tracking-tighter text-center">Двадцать Одно</h3>
                 <p className="text-amber-900/40 font-serif italic text-xl">«Ставки сделаны, господа пираты...»</p>
              </div>
              <div className="flex gap-4 bg-white/40 p-4 rounded-[2.5rem] border-2 border-amber-900/10 shadow-inner">
                {[50, 100, 200, 500].map(v => (
                  <button 
                    key={v} 
                    onClick={() => setBet(v)}
                    className={cn(
                      "px-8 py-4 rounded-2xl text-sm font-black transition-all flex items-center gap-3",
                      bet === v ? "bg-amber-500 text-slate-900 shadow-lg scale-110" : "text-amber-900/40 hover:bg-white/40"
                    )}
                  >
                    <Coins size={20} />
                    {v}
                  </button>
                ))}
              </div>
           </motion.div>
         ) : (
           <>
             <div className="space-y-4 w-full">
                <p className="text-center font-black uppercase text-amber-900/40 tracking-widest text-xs">Рука Противника</p>
                <div className="flex justify-center gap-6">
                   {p2Hand.map((card, i) => <Card key={i} card={card} />)}
                   {gameState === 'p1_turn' && <Card isHidden />}
                </div>
             </div>

             <div className="flex flex-col items-center gap-6 h-24">
                <AnimatePresence>
                   {gameState === 'end' && (
                     <motion.div 
                       initial={{ scale: 0, rotate: -20 }} 
                       animate={{ scale: 1, rotate: 0 }} 
                       className={cn(
                         "px-20 py-10 rounded-[4rem] border-8 font-black uppercase text-5xl shadow-2xl z-20", 
                         result === 'p1_win' ? "bg-emerald-500 border-emerald-400 text-slate-900" : 
                         result === 'push' ? "bg-amber-500 border-amber-400 text-slate-900" : "bg-red-600 border-red-500 text-white"
                       )}
                     >
                       {result === 'p1_win' ? 'ПОБЕДА!' : result === 'push' ? 'НИЧЬЯ' : 'ПРОИГРЫШ'}
                     </motion.div>
                   )}
                </AnimatePresence>
             </div>

             <div className="space-y-6 w-full">
                <div className="flex justify-center gap-6">
                   {p1Hand.map((card, i) => <Card key={i} card={card} />)}
                </div>
                <div className="flex flex-col items-center gap-4">
                   <p className="text-center font-black uppercase text-amber-900/40 tracking-widest text-xs">Твои Очки</p>
                   <div className="px-10 py-4 bg-amber-500 text-slate-950 rounded-[2rem] font-black text-3xl shadow-xl border-b-8 border-amber-700">
                      {calculateTotal(p1Hand)}
                   </div>
                </div>
             </div>
           </>
         )}
      </div>

      <div className="flex flex-col items-center pb-10">
         {gameState === 'idle' ? (
           <button 
             onClick={startGame} 
             className="px-24 py-8 bg-amber-500 text-slate-900 rounded-[2.5rem] font-black uppercase tracking-widest text-2xl shadow-[0_12px_0_rgb(120,63,4)] active:translate-y-2 active:shadow-none transition-all"
           >
             Начать Раздачу
           </button>
         ) : gameState === 'p1_turn' ? (
           <div className="flex gap-12">
              <button 
                onClick={hit} 
                className="px-20 py-8 bg-amber-500 text-slate-900 rounded-[2.5rem] font-black uppercase tracking-widest text-xl shadow-[0_10px_0_rgb(120,63,4)] active:translate-y-2 active:shadow-none transition-all"
              >
                Еще
              </button>
              <button 
                onClick={stand} 
                className="px-20 py-8 bg-white text-slate-900 rounded-[2.5rem] font-black uppercase tracking-widest text-xl shadow-[0_10px_0_rgb(180,180,180)] active:translate-y-2 active:shadow-none transition-all border-4 border-zinc-100"
              >
                Хватит
              </button>
           </div>
         ) : (
           <button 
             onClick={() => setGameState('idle')} 
             className="px-20 py-8 bg-amber-500 text-slate-900 rounded-[2.5rem] font-black uppercase tracking-widest text-xl shadow-[0_10px_0_rgb(120,63,4)] active:translate-y-2 active:shadow-none transition-all"
           >
             Играть Снова
           </button>
         )}
      </div>
    </div>
  );
}

function Card({ card, isHidden }: { card?: CardValue, isHidden?: boolean }) {
  return (
    <motion.div 
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      className={cn(
        "w-28 h-40 rounded-2xl border-4 flex flex-col items-center justify-center relative shadow-xl overflow-hidden",
        isHidden ? "bg-amber-950 border-amber-600" : "bg-white border-zinc-100"
      )}
    >
      {isHidden ? (
        <Skull size={48} className="text-amber-600/20" />
      ) : (
        <>
           <div className="absolute top-3 left-3 font-black text-amber-900 text-2xl">{card?.label}</div>
           <Skull size={48} className="text-amber-900/10" />
           <div className="absolute bottom-3 right-3 font-black text-amber-900 text-2xl rotate-180">{card?.label}</div>
        </>
      )}
    </motion.div>
  );
}
