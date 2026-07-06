'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Skull, X } from 'lucide-react';
import { cn } from "@/lib/utils";

interface TreasureHuntProps {
  gold: number;
  onResult: (newGold: number, result: 'win' | 'lose' | 'push', winnerId?: 'me' | 'her') => void;
}

export function TreasureHuntGame({ gold, onResult }: TreasureHuntProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [grid, setGrid] = useState<{ type: 'gold' | 'mine', revealed: boolean }[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [bombCount, setBombCount] = useState(5);
  const [bet, setBet] = useState(100);
  const [gameStarted, setGameStarted] = useState(false);
  const [cheatActive, setCheatActive] = useState(false);
  const [skullClicks, setSkullClicks] = useState(0);

  // Multiplier logic: more bombs = higher reward per click
  // 3 bombs -> 1.1x, 5 bombs -> 1.25x, 10 bombs -> 1.8x, 15 bombs -> 3.0x
  const getMultiplier = () => {
    if (bombCount === 3) return 1.1;
    if (bombCount === 5) return 1.25;
    if (bombCount === 10) return 1.8;
    if (bombCount === 15) return 3.0;
    return 1 + (bombCount / 10);
  };

  const multiplier = getMultiplier();

  const handleSkullClick = () => {
    const newClicks = skullClicks + 1;
    setSkullClicks(newClicks);
    if (newClicks >= 7) {
      setCheatActive(!cheatActive);
      setSkullClicks(0);
    }
  };

  const initGrid = () => {
    const newGrid = Array(25).fill(null).map(() => ({ type: 'gold' as 'gold' | 'mine', revealed: false }));
    let minesPlaced = 0;
    while (minesPlaced < bombCount) {
      const idx = Math.floor(Math.random() * 25);
      if (newGrid[idx].type === 'gold') {
        newGrid[idx].type = 'mine';
        minesPlaced++;
      }
    }
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    setIsWon(false);
    setGameStarted(false);
  };

  useEffect(() => { initGrid(); }, [bombCount]);

  const startGame = () => {
    if (gold < bet) return alert('Недостаточно дублонов!');
    setGameStarted(true);
    setScore(bet);
  };

  const revealCell = (i: number) => {
    if (!gameStarted || gameOver || grid[i].revealed) return;
    
    const newGrid = [...grid];
    newGrid[i].revealed = true;
    setGrid(newGrid);

    if (newGrid[i].type === 'mine') {
      setGameOver(true);
      const finalGrid = newGrid.map(cell => cell.type === 'mine' ? { ...cell, revealed: true } : cell);
      setGrid(finalGrid);
      onResult(gold - bet, 'lose', 'me');
    } else {
      const newScore = Math.floor(score * multiplier);
      setScore(newScore);
      
      if (newGrid.filter(c => c.type === 'gold' && !c.revealed).length === 0) {
        setIsWon(true);
        setGameOver(true);
        // Fix: Add only the profit (newScore - bet)
        onResult(gold + (newScore - bet), 'win', 'me');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#f8f5f0] font-sans">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-10 pointer-events-none" />
      
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
                <div className="grid grid-cols-2 gap-4">
                   <Coins size={48} className="text-amber-500" />
                   <Skull size={48} className="text-amber-500/20" />
                   <Skull size={48} className="text-amber-500/20" />
                   <Coins size={48} className="text-amber-500" />
                </div>
              </div>
            </div>
            <div className="space-y-4 max-w-lg">
              <h3 className="text-6xl font-black uppercase tracking-tighter text-amber-950">Охота за <span className="text-amber-500">Золотом</span></h3>
              <p className="text-amber-900/60 font-serif italic text-2xl leading-relaxed">«Поле полное опасностей. Один неверный шаг — и твой улов пойдет на дно!»</p>
            </div>
            <button 
              onClick={() => setIsPlaying(true)}
              className="px-20 py-6 bg-amber-950 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-amber-900 transition-all active:scale-95 flex items-center gap-4"
            >
              К Поискам! <Coins size={24} />
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="game"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col h-full p-6 lg:p-10"
          >
            {/* Game Board - Much Larger Now */}
            <div className="flex-1 flex items-center justify-center -mt-4">
              <div className="grid grid-cols-5 gap-4 w-full max-w-xl aspect-square bg-white/40 backdrop-blur-md p-8 rounded-[3.5rem] border border-white shadow-xl">
                {grid.map((cell, i) => (
                  <button
                    key={i}
                    onClick={() => revealCell(i)}
                    disabled={!gameStarted || gameOver}
                    className={cn(
                      "rounded-2xl border-4 transition-all flex items-center justify-center text-4xl relative overflow-hidden",
                      !gameStarted ? "bg-amber-900/5 border-amber-900/5 cursor-not-allowed" :
                      !cell.revealed ? "bg-white border-amber-900/10 hover:bg-amber-50 hover:scale-105 active:scale-95 shadow-sm" : 
                      cell.type === 'mine' ? 
                        (gameOver && !isWon && !new Set(grid.map((c,idx)=>c.type==='mine'&&c.revealed?idx:null)).has(i) ? "bg-red-600/20 border-red-500/20 text-white" : "bg-red-600 border-red-500 text-white shadow-inner") : 
                        "bg-amber-400 border-amber-300 text-amber-950 shadow-inner"
                    )}
                  >
                    {!gameStarted ? (
                       <div className="w-2 h-2 bg-amber-900/10 rounded-full" />
                    ) : cell.revealed ? (
                      cell.type === 'mine' ? (
                        <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}>
                          <Skull size={32} />
                        </motion.div>
                      ) : (
                        <motion.div initial={{ scale: 0, y: 10 }} animate={{ scale: 1, y: 0 }}>
                          <Coins size={32} />
                        </motion.div>
                      )
                    ) : (
                      cheatActive && cell.type === 'mine' ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.15 }}>
                          <Skull size={24} className="text-red-500" />
                        </motion.div>
                      ) : (
                        <div className="w-2 h-2 bg-amber-950/20 rounded-full animate-pulse" />
                      )
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Control Panel - More Compact & Buttons at Bottom */}
            <div className="flex gap-6 max-w-5xl mx-auto w-full pb-6 h-64">
              {/* Bet Card */}
              <div className="flex-1 bg-white p-8 rounded-[3rem] border border-white shadow-xl relative overflow-hidden group flex flex-col">
                <div className="relative z-10 flex flex-col h-full">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-amber-900/5 pb-2">
                      <p className="text-[10px] font-black uppercase text-amber-900/40 tracking-[0.2em]">Ставка</p>
                      <Coins size={18} className="text-amber-500 group-hover:rotate-12 transition-transform" />
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2">
                      {[100, 200, 500, 1000].map(v => (
                        <button 
                          key={v} 
                          onClick={() => setBet(v)}
                          disabled={gameStarted}
                          className={cn(
                            "py-3 rounded-xl font-black text-xs transition-all",
                            bet === v ? "bg-amber-950 text-white shadow-md scale-105" : "text-amber-900/30 hover:bg-zinc-50"
                          )}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto pt-4">
                    {gameOver ? (
                      <button 
                        onClick={initGrid}
                        className="w-full py-5 bg-amber-500 text-amber-950 rounded-2xl font-black uppercase tracking-widest text-lg shadow-xl hover:bg-amber-400 active:translate-y-1 transition-all border-b-4 border-amber-600"
                      >
                        Заново
                      </button>
                    ) : !gameStarted ? (
                      <button 
                        onClick={startGame}
                        className="w-full py-5 bg-amber-600 text-white rounded-2xl font-black uppercase tracking-widest text-lg shadow-xl hover:bg-amber-500 active:translate-y-1 transition-all border-b-4 border-amber-800"
                      >
                        Играть
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          // Fix: Add only the profit (score - bet)
                          onResult(gold + (score - bet), 'win', 'me');
                          initGrid();
                        }}
                        disabled={score <= bet}
                        className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-lg shadow-xl hover:bg-emerald-400 active:translate-y-1 transition-all disabled:opacity-30 border-b-4 border-emerald-700"
                      >
                        Забрать
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Danger & Info Card */}
              <div className="flex-1 bg-white p-8 rounded-[3rem] border border-white shadow-xl relative overflow-hidden group flex flex-col">
                <div className="relative z-10 flex flex-col h-full">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-amber-900/5 pb-2">
                      <p className="text-[10px] font-black uppercase text-amber-900/40 tracking-[0.2em]">Мины</p>
                      <button onClick={handleSkullClick} className="focus:outline-none">
                        <Skull size={18} className={cn("transition-all", cheatActive ? "text-emerald-500 scale-125" : "text-red-500 group-hover:animate-bounce")} />
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {[3, 5, 10, 15].map(n => (
                        <button 
                          key={n} 
                          onClick={() => setBombCount(n)}
                          disabled={gameStarted}
                          className={cn(
                            "py-3 rounded-xl font-black text-xs transition-all",
                            bombCount === n ? "bg-red-500 text-white shadow-md scale-105" : "text-amber-900/30 hover:bg-zinc-50"
                          )}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto pt-4 flex gap-3">
                    <div className="flex-1 flex flex-col items-center justify-center gap-1 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest leading-none">Множитель</p>
                      <div className="text-3xl font-black text-emerald-600 tracking-tighter">x{multiplier.toFixed(2)}</div>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center gap-1 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                      <p className="text-[10px] font-black uppercase text-amber-900/30 tracking-widest leading-none">Результат</p>
                      <div className="text-3xl font-black text-amber-950 tracking-tighter flex items-center gap-2">
                         {gameOver ? (
                           <span className={isWon ? "text-emerald-600" : "text-red-600"}>
                              {isWon ? `+${score}` : `-${bet}`}
                           </span>
                         ) : (
                           <>
                             <Coins className="text-amber-500" size={24} />
                             {score}
                           </>
                         )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
