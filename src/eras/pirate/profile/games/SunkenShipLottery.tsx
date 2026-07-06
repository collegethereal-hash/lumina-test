'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coins, Ticket, Clock, Ship, Trophy, History, 
  Sparkles, Star, Anchor, Skull, RefreshCw, 
  CheckCircle2, XCircle, Gift, Landmark
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface SunkenShipLotteryProps {
  gold: number;
  onResult: (newGold: number, result: 'win' | 'lose' | 'push', winnerId?: 'me' | 'her') => void;
}

export function SunkenShipLotteryGame({ gold, onResult }: SunkenShipLotteryProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tickets, setTickets] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showResult, setShowResult] = useState<'win' | 'lose' | null>(null);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [prize, setPrize] = useState(0);
  const [luckClicks, setLuckClicks] = useState(0);
  const [luckyMode, setLuckyMode] = useState(false);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
  const [dynamicJackpot, setDynamicJackpot] = useState(0);
  
  const totalTicketsRef = useRef(totalTickets);
  const ticketsLengthRef = useRef(tickets.length);

  useEffect(() => {
    totalTicketsRef.current = totalTickets;
  }, [totalTickets]);

  useEffect(() => {
    ticketsLengthRef.current = tickets.length;
  }, [tickets.length]);

  const TICKET_PRICE = 100;

  useEffect(() => {
    const savedTickets = localStorage.getItem('pirate_lottery_tickets');
    if (savedTickets) setTickets(JSON.parse(savedTickets));

    const savedJackpot = localStorage.getItem('pirate_lottery_jackpot');
    if (savedJackpot) setDynamicJackpot(parseInt(savedJackpot));

    const savedParticipants = localStorage.getItem('pirate_lottery_participants');
    if (savedParticipants) setTotalParticipants(parseInt(savedParticipants));

    const savedTotalTickets = localStorage.getItem('pirate_lottery_total_tickets');
    if (savedTotalTickets) setTotalTickets(parseInt(savedTotalTickets));

    const interval = setInterval(() => {
      const chance = Math.random();
      if (chance > 0.6) {
        const newTicketsCount = Math.floor(Math.random() * 5) + 1;
        
        // Logical fix: If tickets are being bought, there must be participants.
        // We'll add a participant more frequently if there are many tickets but few people.
        setTotalParticipants(prev => {
          const currentOthersTickets = totalTicketsRef.current - ticketsLengthRef.current;
          const needsMoreParticipants = currentOthersTickets > (prev * 10); // 1 person shouldn't have too many tickets
          const newParticipant = (Math.random() > 0.7 || needsMoreParticipants || prev === 0) ? 1 : 0;
          
          const next = prev + newParticipant;
          localStorage.setItem('pirate_lottery_participants', next.toString());
          return next;
        });

        setTotalTickets(prev => {
          const next = prev + newTicketsCount;
          localStorage.setItem('pirate_lottery_total_tickets', next.toString());
          return next;
        });

        setDynamicJackpot(prev => {
          const next = prev + (newTicketsCount * TICKET_PRICE);
          localStorage.setItem('pirate_lottery_jackpot', next.toString());
          return next;
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const displayParticipants = Math.max(totalParticipants, (totalTickets > tickets.length ? 2 : (tickets.length > 0 ? 1 : 0)));

  const buyTicket = () => {
    if (gold < TICKET_PRICE) return alert('Недостаточно дублонов!');
    const newNumber = Math.floor(Math.random() * 9000) + 1000;
    const newTickets = [...tickets, newNumber];
    
    // If it's our first ticket in this round, we become a participant
    const isFirstTicket = tickets.length === 0;

    setTickets(newTickets);
    
    setTotalTickets(prev => {
      const next = prev + 1;
      localStorage.setItem('pirate_lottery_total_tickets', next.toString());
      return next;
    });

    if (isFirstTicket) {
      setTotalParticipants(prev => {
        const next = prev + 1;
        localStorage.setItem('pirate_lottery_participants', next.toString());
        return next;
      });
    }

    setDynamicJackpot(prev => {
      const next = prev + TICKET_PRICE;
      localStorage.setItem('pirate_lottery_jackpot', next.toString());
      return next;
    });

    localStorage.setItem('pirate_lottery_tickets', JSON.stringify(newTickets));
    onResult(gold - TICKET_PRICE, 'push');
  };

  const calculateWinChance = () => {
    if (tickets.length === 0 || totalTickets === 0) return '0%';
    const chance = (tickets.length / totalTickets) * 100;
    return `${chance.toFixed(1)}%`;
  };

  const startDraw = () => {
    if (tickets.length === 0) return;
    setIsDrawing(true);
    
    setTimeout(() => {
      // Calculate win probability based on tickets owned
      const winChance = tickets.length / totalTickets;
      const isWinner = Math.random() < winChance;
      
      let winNum;
      if (isWinner) {
        // Pick one of user's tickets as the winning one
        winNum = tickets[Math.floor(Math.random() * tickets.length)];
      } else {
        // Pick a random number that is NOT in user's tickets
        do {
          winNum = Math.floor(Math.random() * 9000) + 1000;
        } while (tickets.includes(winNum));
      }
      
      setWinningNumber(winNum);
      
      if (isWinner) {
        const winPrize = Math.floor(dynamicJackpot);
        setPrize(winPrize);
        setShowResult('win');
        onResult(gold + winPrize, 'win');
      } else {
        setShowResult('lose');
        onResult(gold, 'lose');
      }
      
      // Reset lottery completely
      setTickets([]);
      setTotalParticipants(0);
      setTotalTickets(0);
      setDynamicJackpot(0);
      localStorage.removeItem('pirate_lottery_tickets');
      localStorage.setItem('pirate_lottery_participants', '0');
      localStorage.setItem('pirate_lottery_total_tickets', '0');
      localStorage.setItem('pirate_lottery_jackpot', '0');
      setIsDrawing(false);
    }, 3000);
  };

  const handleTitleClick = () => {
    const newClicks = luckClicks + 1;
    setLuckClicks(newClicks);
    if (newClicks >= 5) {
      setLuckyMode(!luckyMode);
      setLuckClicks(0);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#fdfaf5] font-sans">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20" />
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-amber-500/5 to-transparent" />
        
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: '110%', x: `${Math.random() * 100}%`, opacity: 0 }}
            animate={{ 
              y: '-10%', 
              opacity: [0, 0.3, 0],
              x: `${(Math.random() * 100) + (Math.sin(i) * 5)}%` 
            }}
            transition={{ 
              duration: 5 + Math.random() * 10, 
              repeat: Infinity, 
              delay: Math.random() * 10 
            }}
            className="w-2 h-2 bg-amber-900/10 rounded-full blur-[1px]"
          />
        ))}

        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-600/5 blur-[120px] rounded-full" />
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
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
              <div className="w-56 h-56 rounded-[3rem] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex items-center justify-center relative transform rotate-3 hover:rotate-0 transition-transform duration-500 border border-white group">
                <Landmark size={100} className="text-amber-500 group-hover:scale-110 transition-transform duration-500" />
                <motion.div 
                  animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-8 -right-8 w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white"
                >
                  <Ticket size={32} className="text-white" />
                </motion.div>
              </div>
            </div>
            <div className="space-y-4 max-w-lg">
              <h3 className="text-7xl font-black uppercase tracking-tighter text-amber-950">Морская <span className="text-amber-500">Удача</span></h3>
              <p className="text-amber-900/60 font-serif italic text-2xl leading-relaxed">«Твой счастливый билет может лежать на самом дне. Рискнешь дублонами?»</p>
            </div>
            <button 
              onClick={() => setIsPlaying(true)}
              className="px-24 py-7 bg-amber-950 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(62,39,35,0.2)] hover:bg-amber-900 hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
            >
              К Розыгрышу <Anchor size={28} />
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center z-10 w-full h-full p-6 lg:p-12 overflow-y-auto custom-scrollbar"
          >
            <div className="w-full max-w-6xl flex flex-col gap-10">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="space-y-2 text-center md:text-left">
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <div className="w-10 h-1 bg-amber-500 rounded-full" />
                    <p className="text-amber-500 font-black uppercase tracking-[0.4em] text-[10px]">Королевская лотерея</p>
                  </div>
                  <h2 
                    onClick={handleTitleClick}
                    className={cn(
                      "text-5xl font-black text-amber-950 uppercase tracking-tighter cursor-pointer select-none transition-colors whitespace-nowrap",
                      luckyMode ? "text-emerald-600" : ""
                    )}
                  >
                    Затонувший <span className={luckyMode ? "text-emerald-700" : "text-amber-500"}>Фрегат</span>
                  </h2>
                </div>

                <div className="bg-white/60 backdrop-blur-xl px-10 py-6 rounded-[2.5rem] border-4 border-white flex items-center gap-8 shadow-2xl relative">
                  <div className="text-center">
                     <p className="text-[10px] font-black uppercase text-amber-900/40 tracking-widest mb-1">Участников</p>
                     <p className="text-3xl font-black text-amber-950">{displayParticipants}</p>
                  </div>
                  <div className="h-10 w-px bg-amber-900/10" />
                  <div className="text-center">
                     <p className="text-[10px] font-black uppercase text-amber-900/40 tracking-widest mb-1">Билетов в игре</p>
                     <p className="text-3xl font-black text-amber-950">{totalTickets}</p>
                  </div>
                  <div className="h-10 w-px bg-amber-900/10" />
                  <div className="text-center">
                      <p className="text-[10px] font-black uppercase text-amber-900/40 tracking-widest mb-1">Джекпот</p>
                      <div className="flex items-center gap-2 text-3xl font-black text-amber-600">
                        {Math.floor(dynamicJackpot)} <Coins size={24} />
                      </div>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Buy Section */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[3rem] border-4 border-white shadow-2xl flex flex-col items-center text-center space-y-7 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-30 pointer-events-none" />
                    
                    <div className="w-18 h-18 bg-amber-500/10 rounded-[1.5rem] flex items-center justify-center relative z-10">
                      <Ticket size={36} className="text-amber-600" />
                    </div>
                    
                    <div className="space-y-1.5 relative z-10">
                      <h3 className="text-xl font-black text-amber-950 uppercase tracking-tighter">Новый билет</h3>
                      <p className="text-[13px] text-amber-900/40 font-serif italic">«Один золотой билет может изменить всё...»</p>
                    </div>

                    <div className="w-full bg-amber-900/5 p-5 rounded-[1.5rem] border border-amber-900/5 relative z-10">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase text-amber-900/40 tracking-widest">Цена за вход</span>
                        <span className="flex items-center gap-1 font-black text-amber-950 text-sm">{TICKET_PRICE} <Coins size={14} className="text-amber-500" /></span>
                      </div>
                    </div>

                    <button 
                      onClick={buyTicket}
                      className="w-full py-5 bg-amber-500 text-blue-950 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-amber-400 transition-all active:scale-95 flex items-center justify-center gap-3 relative z-10"
                    >
                      <Gift size={18} /> Купить сейчас
                    </button>
                  </div>

                  <button 
                    onClick={startDraw}
                    disabled={tickets.length === 0 || isDrawing}
                    className="w-full py-7 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm shadow-xl hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-4"
                  >
                    {isDrawing ? <RefreshCw className="animate-spin" size={22} /> : <Trophy size={22} />}
                    Проверить билеты
                  </button>
                </div>

                {/* Inventory Section */}
                <div className="lg:col-span-8 bg-white/40 backdrop-blur-xl p-8 rounded-[3rem] border-4 border-white shadow-2xl relative overflow-hidden flex flex-col h-full">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-30 pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-7 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-amber-950 text-white flex items-center justify-center">
                        <History size={18} />
                      </div>
                      <h3 className="text-xl font-black text-amber-950 uppercase tracking-tighter">Твой инвентарь</h3>
                    </div>
                    <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                       <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{tickets.length} активно</span>
                    </div>
                  </div>

                  <div className="max-h-[360px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                    {tickets.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <AnimatePresence>
                          {tickets.map((num, idx) => (
                            <motion.div
                              key={`${num}-${idx}`}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="bg-white/60 p-5 rounded-3xl border-2 border-white shadow-md flex flex-col items-center justify-center gap-2 group hover:border-amber-500/30 transition-all h-[110px]"
                            >
                               <span className="text-[8px] font-black text-amber-900/20 uppercase tracking-widest">Билет</span>
                               <span className="text-xl font-black text-amber-950 tracking-tighter group-hover:text-amber-600 transition-colors">#{num}</span>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                         <Ticket size={70} className="text-amber-950" />
                         <div>
                            <p className="text-2xl font-black text-amber-950 uppercase tracking-tighter">Пусто в карманах</p>
                            <p className="text-sm font-serif italic text-amber-900">Купи билет, чтобы испытать свою судьбу...</p>
                         </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Stats - NO LAST TRIUMPH */}
              <div className="bg-amber-950/5 backdrop-blur-md p-6 rounded-[2.5rem] border-2 border-amber-900/5 flex flex-col md:flex-row items-center justify-center gap-8">
                <div className="flex gap-8">
                   <div className="bg-white/80 backdrop-blur-xl px-10 py-4 rounded-3xl border-4 border-white text-center shadow-xl">
                      <p className="text-[9px] font-black text-amber-900/30 uppercase tracking-[0.2em] mb-1">Твой шанс на победу</p>
                      <p className="text-2xl font-black text-amber-950 tracking-tighter">{calculateWinChance()}</p>
                   </div>
                   <div className="bg-white/80 backdrop-blur-xl px-10 py-4 rounded-3xl border-4 border-white text-center shadow-xl">
                      <p className="text-[9px] font-black text-amber-900/30 uppercase tracking-[0.2em] mb-1">Всего билетов в море</p>
                      <p className="text-2xl font-black text-emerald-600 tracking-tighter">{totalTickets}</p>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDrawing && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#fdfaf5]/90 backdrop-blur-xl flex flex-col items-center justify-center space-y-8"
          >
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 pointer-events-none" />
             <motion.div 
               animate={{ 
                 rotate: [0, 10, -10, 0],
                 scale: [1, 1.1, 1]
               }}
               transition={{ repeat: Infinity, duration: 2 }}
               className="w-32 h-32 bg-amber-500 rounded-[2.5rem] flex items-center justify-center shadow-2xl border-4 border-white"
             >
                <Trophy size={64} className="text-white" />
             </motion.div>
             <div className="text-center space-y-4 relative z-10">
                <h3 className="text-5xl font-black text-amber-950 uppercase tracking-tighter">Розыгрыш идет...</h3>
                <div className="flex gap-2 justify-center">
                   {[0, 1, 2].map(i => (
                     <motion.div 
                       key={i}
                       animate={{ opacity: [0.3, 1, 0.3] }}
                       transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                       className="w-3 h-3 bg-amber-500 rounded-full"
                     />
                   ))}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showResult && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-[100] bg-[#fdfaf5]/95 backdrop-blur-md flex items-center justify-center p-6"
          >
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-30 pointer-events-none" />
             
             <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               className={cn(
                 "relative w-full max-w-md p-12 rounded-[4rem] border-[12px] shadow-2xl text-center space-y-8 overflow-hidden",
                 showResult === 'win' ? "bg-emerald-50 border-emerald-500/20" : "bg-rose-50 border-rose-500/20"
               )}
             >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-10 pointer-events-none" />
                
                <div className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-inner relative z-10",
                  showResult === 'win' ? "bg-emerald-500" : "bg-rose-500"
                )}>
                   {showResult === 'win' ? <Trophy size={48} className="text-white" /> : <Skull size={48} className="text-white" />}
                </div>

                <div className="space-y-2 relative z-10">
                   <h3 className={cn(
                     "text-5xl font-black uppercase tracking-tighter",
                     showResult === 'win' ? "text-emerald-900" : "text-rose-900"
                   )}>
                      {showResult === 'win' ? 'Твой куш!' : 'Пролет...'}
                   </h3>
                   <p className="text-amber-900/60 font-serif italic text-lg leading-snug">
                      {showResult === 'win' 
                        ? '«Морские боги сегодня на твоей стороне, капитан!»' 
                        : '«Сегодня удача ускользнула сквозь пальцы, как вода...»'}
                   </p>
                </div>

                <div className="bg-white/60 p-6 rounded-3xl border-2 border-white shadow-inner flex justify-between items-center relative z-10">
                   <div className="text-left">
                      <p className="text-[10px] font-black text-amber-900/30 uppercase tracking-widest">Счастливый номер</p>
                      <p className="text-2xl font-black text-amber-950">#{winningNumber}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-amber-900/30 uppercase tracking-widest">Твой выигрыш</p>
                      <p className={cn(
                        "text-2xl font-black flex items-center gap-2 justify-end",
                        showResult === 'win' ? "text-emerald-600" : "text-amber-950"
                      )}>
                        {showResult === 'win' ? prize : 0} <Coins size={20} />
                      </p>
                   </div>
                </div>

                <button 
                  onClick={() => setShowResult(null)}
                  className={cn(
                    "w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all relative z-10",
                    showResult === 'win' ? "bg-emerald-600 text-white hover:bg-emerald-500" : "bg-amber-950 text-white hover:bg-amber-900"
                  )}
                >
                  {showResult === 'win' ? 'Забрать дублоны' : 'Попробовать снова'}
                </button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
