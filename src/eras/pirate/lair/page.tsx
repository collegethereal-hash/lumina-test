'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Skull, Anchor, Sword, Crosshair, Bomb, 
  Shield, Users, Flame, Target, Trophy, 
  Settings, Scroll, ChevronRight, X, Info, Sparkles,
  Zap, Wind, LifeBuoy, RefreshCw, Compass
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface Zone {
  id: string;
  name: string;
  desc: string;
  maxCrew: number;
  x: string;
  y: string;
}

type Fighter = {
  id: string;
  side: 'player' | 'enemy';
  zoneY: number; // Y% of their initial zone (15, 45, 75)
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
  jitterX: number[];
  jitterY: number[];
  duration: number;
  isDead?: boolean;
};

const getOffset = (i: number) => {
  const c = 4.2;
  const r = c * Math.sqrt(i + 0.5);
  const theta = i * 2.399963;
  const dx = r * Math.cos(theta);
  const dy = r * Math.sin(theta);
  return { dx, dy };
};

export default function LairPage() {
  const router = useRouter();
  const [battleLog, setBattleLog] = useState<string[]>([
    "Подготовка к бою...",
    "Ожидание приказа капитана!"
  ]);
  
  // Crew distribution for Player
  const [playerCrew, setPlayerCrew] = useState<Record<string, number>>({
    helm: 16,
    cannons: 17,
    deck: 17
  });

  // Crew distribution for Enemy
  const [enemyCrew, setEnemyCrew] = useState<Record<string, number>>({
    helm: 20,
    cannons: 20,
    deck: 20
  });

  const [enemyInfo, setEnemyInfo] = useState<any>(null);

  useEffect(() => {
    const savedEnemy = localStorage.getItem('current_battle_enemy');
    if (savedEnemy) {
      const enemy = JSON.parse(savedEnemy);
      setEnemyInfo(enemy);
      
      // Scale enemy crew based on strength (strength is total, split it into zones)
      const total = enemy.strength || 60;
      const base = Math.floor(total / 3);
      setEnemyCrew({
        helm: base,
        cannons: base,
        deck: total - (base * 2)
      });
      
      addLog(`🏴‍☠️ Мы атакуем корабль: ${enemy.name}!`);
      
      setBattleLog([
        `Капитан! Корабль "${enemy.name}" подошел на расстояние выстрела!`,
        "Прикажите начать абордаж или открыть огонь!"
      ]);
    }

    const savedPlayerCrew = localStorage.getItem('pirate_crew');
    if (savedPlayerCrew) {
      const total = parseInt(savedPlayerCrew, 10);
      const base = Math.floor(total / 3);
      setPlayerCrew({
        helm: base,
        cannons: base,
        deck: total - (base * 2)
      });
    }
  }, []);

  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [isAttacking, setIsAttacking] = useState(false);
  const [battlePhase, setBattlePhase] = useState<'idle' | 'gathering' | 'moving_to_bridge' | 'fighting' | 'returning'>('idle');
  const [activeFighters, setActiveFighters] = useState<Fighter[]>([]);

  // States for the premium victory/defeat stats popup
  const [battleResult, setBattleResult] = useState<{
    winner: 'player' | 'enemy' | 'draw';
    playerInitial: number;
    enemyInitial: number;
    playerLosses: number;
    enemyLosses: number;
    enemyId?: string;
    reward?: number;
    capturedCrew?: number;
    goldEarned?: number;
  } | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  const initialCrewRef = useRef<{ player: number; enemy: number }>({ player: 50, enemy: 60 });

  const playerZones: Zone[] = [
    { id: 'helm', name: 'Штурвал', desc: 'Маневр', maxCrew: 20, x: '50%', y: '15%' },
    { id: 'cannons', name: 'Пушки', desc: 'Огонь', maxCrew: 20, x: '50%', y: '45%' },
    { id: 'deck', name: 'Палуба', desc: 'Резерв', maxCrew: 50, x: '50%', y: '75%' },
  ];

  const enemyZones: Zone[] = [
    { id: 'helm', name: 'Мостик', desc: 'Управление', maxCrew: 20, x: '50%', y: '15%' },
    { id: 'cannons', name: 'Батарея', desc: 'Огонь', maxCrew: 20, x: '50%', y: '45%' },
    { id: 'deck', name: 'Каюты', desc: 'Защита', maxCrew: 50, x: '50%', y: '75%' },
  ];

  const addLog = (msg: string) => {
    setBattleLog(prev => [...prev, msg]);
  };

  const startBoarding = () => {
    const totalPlayer = playerCrew.helm + playerCrew.cannons + playerCrew.deck;
    if (totalPlayer < 5) {
      addLog("❌ Слишком мало людей для абордажа!");
      return;
    }
    if (isAttacking) return;

    setIsAttacking(true);
    addLog("⚔️ АБОРДАЖ! Вся команда срывается на мост!");

    const totalPlayerStart = playerCrew.helm + playerCrew.cannons + playerCrew.deck;
    const totalEnemyStart = enemyCrew.helm + enemyCrew.cannons + enemyCrew.deck;
    initialCrewRef.current = { player: totalPlayerStart, enemy: totalEnemyStart };
    setBattleResult(null);
    setShowResultModal(false);

    const generateJitter = (range: number) => {
      const arr = [0];
      for (let k = 0; k < 8; k++) arr.push(Math.random() * range - range / 2);
      arr.push(0);
      return arr;
    };

    const pFighters: Fighter[] = [];
    ['helm', 'cannons', 'deck'].forEach(zoneId => {
       const count = playerCrew[zoneId];
       const startY = zoneId === 'helm' ? 15 : zoneId === 'cannons' ? 45 : 75;
       for (let i = 0; i < count; i++) {
          const { dx, dy } = getOffset(i);
          pFighters.push({
             id: `p-${zoneId}-${Date.now()}-${i}`,
             side: 'player',
             zoneY: startY,
             startX: dx,
             startY: dy,
             offsetX: Math.random() * 40 - 20, // Небольшой разброс на мосту (Y)
             offsetY: Math.random() * 20 - 10,
             jitterX: generateJitter(12), // Малый горизонтальный дергун — не уходят за мост!
             jitterY: generateJitter(20), // Вертикальный дергун для хаоса
             duration: 6 + Math.random() * 4,
          });
       }
    });

    const eFighters: Fighter[] = [];
    ['helm', 'cannons', 'deck'].forEach(zoneId => {
       const count = enemyCrew[zoneId];
       const startY = zoneId === 'helm' ? 15 : zoneId === 'cannons' ? 45 : 75;
       for (let i = 0; i < count; i++) {
          const { dx, dy } = getOffset(i);
          eFighters.push({
             id: `e-${zoneId}-${Date.now()}-${i}`,
             side: 'enemy',
             zoneY: startY,
             startX: dx,
             startY: dy,
             offsetX: Math.random() * 40 - 20,
             offsetY: Math.random() * 20 - 10,
             jitterX: generateJitter(12),
             jitterY: generateJitter(20),
             duration: 6 + Math.random() * 4,
          });
       }
    });

    setPlayerCrew({ helm: 0, cannons: 0, deck: 0 });
    setEnemyCrew({ helm: 0, cannons: 0, deck: 0 });

    setActiveFighters([...pFighters, ...eFighters]);
    setBattlePhase('gathering'); // Сначала собираются у входа на мост
  };

  useEffect(() => {
    const logMsg = (msg: string) => setBattleLog(prev => [...prev, msg]);

    if (battlePhase === 'gathering') {
      const t = setTimeout(() => {
        setBattlePhase('moving_to_bridge');
      }, 4000); // 4 секунды на ооочень медленный спуск к мосту
      return () => clearTimeout(t);
    }

    if (battlePhase === 'moving_to_bridge') {
      const t = setTimeout(() => {
        setBattlePhase('fighting');
        logMsg("💥 Бой кипит по всему мосту!");
      }, 10000); // 10 секунд на продвижение (чтобы точно дошли друг до друга)
      return () => clearTimeout(t);
    }

    // Коллизии — работают с самого начала абордажа
    const currentPhase = battlePhase as string;
    if (currentPhase === 'gathering' || currentPhase === 'moving_to_bridge' || currentPhase === 'fighting') {
      const t = setInterval(() => {
        setActiveFighters(prev => {
          const next = prev.map(f => ({...f}));
          
          const players = next.filter(f => !f.isDead && f.side === 'player');
          const enemies = next.filter(f => !f.isDead && f.side === 'enemy');

          if (players.length === 0 || enemies.length === 0) {
             clearInterval(t);
             
             const playerSurvivors = players.length;
             const enemySurvivors = enemies.length;
             const winner: 'player' | 'enemy' | 'draw' = playerSurvivors > enemySurvivors ? 'player' : (enemySurvivors > playerSurvivors ? 'enemy' : 'draw');
             const capturedCrew = winner === 'player' ? Math.floor(enemySurvivors / 2) : 0;
             const goldEarned = winner === 'player' ? (enemyInfo?.reward || 500) : 0;

             const battleResultData = {
               winner,
               enemyId: enemyInfo?.id,
               reward: goldEarned,
               capturedCrew: capturedCrew,
               playerLosses: initialCrewRef.current.player - playerSurvivors,
               enemyLosses: initialCrewRef.current.enemy - enemySurvivors,
               playerInitial: initialCrewRef.current.player,
               enemyInitial: initialCrewRef.current.enemy,
               goldEarned: goldEarned
             };

             // Save results immediately
             localStorage.setItem('last_battle_result', JSON.stringify(battleResultData));
             localStorage.setItem('pirate_crew', (playerSurvivors + capturedCrew).toString());

             setBattleResult(battleResultData);
             
             setTimeout(() => {
                setBattlePhase('returning');
                const winnerStr = winner === 'player' ? "Мы захватили судно!" : (winner === 'enemy' ? "Враг отбил атаку!" : "Ничья!");
                logMsg(`🏴‍☠️ Бой окончен. ${winnerStr}`);
                setShowResultModal(true);
             }, 1000);

             return next.filter(f => !f.isDead);
          }

          // Проверяем каждую пару — убиваем СРАЗУ при касании (50px радиус)
          const dead = new Set<string>();
          for (const f1 of players) {
             if (dead.has(f1.id)) continue;
             const el1 = document.getElementById(f1.id);
             if (!el1) continue;
             const r1 = el1.getBoundingClientRect();

             for (const f2 of enemies) {
                if (dead.has(f2.id)) continue;
                const el2 = document.getElementById(f2.id);
                if (!el2) continue;
                const r2 = el2.getBoundingClientRect();

                const dist = Math.hypot(r1.x - r2.x, r1.y - r2.y);
                if (dist < 50) { // 50px — касание = смерть одного!
                   // Случайно один из двух умирает
                   dead.add(Math.random() > 0.5 ? f1.id : f2.id);
                   break; // Этот игрок уже сразился
                }
             }
          }

          if (dead.size > 0) {
             return next.filter(f => !dead.has(f.id));
          }
          return prev;
        });
      }, 200);
      return () => clearInterval(t);
    }

    if (battlePhase === 'returning') {
      const t = setTimeout(() => {
        const aliveP = activeFighters.filter(f => f.side === 'player');
        const aliveE = activeFighters.filter(f => f.side === 'enemy');
        
        const newPlayerCrew = { helm: 0, cannons: 0, deck: 0 };
        aliveP.forEach(f => {
           if (f.zoneY === 15) newPlayerCrew.helm++;
           else if (f.zoneY === 45) newPlayerCrew.cannons++;
           else newPlayerCrew.deck++;
        });

        const newEnemyCrew = { helm: 0, cannons: 0, deck: 0 };
        aliveE.forEach(f => {
           if (f.zoneY === 15) newEnemyCrew.helm++;
           else if (f.zoneY === 45) newEnemyCrew.cannons++;
           else newEnemyCrew.deck++;
        });
        
        setPlayerCrew(newPlayerCrew);
        setEnemyCrew(newEnemyCrew);
        setActiveFighters([]);
        
        setBattlePhase('idle');
        setIsAttacking(false);
        
        // Modal is already shown in the setInterval logic
        // But we keep the automatic return logic here
        const returnTimer = setTimeout(() => {
          router.push('/gallery');
        }, 5000);
        
        return () => clearTimeout(returnTimer);
      }, 8000); // Возвращаются очень медленно
      return () => clearTimeout(t);
    }
  }, [battlePhase, enemyInfo, activeFighters, router]);

  const resetBattle = () => {
    const savedEnemy = localStorage.getItem('current_battle_enemy');
    const enemyName = savedEnemy ? JSON.parse(savedEnemy).name : "Вражеский галеон";
    
    setPlayerCrew({ helm: 16, cannons: 17, deck: 17 });
    setEnemyCrew({ helm: 20, cannons: 20, deck: 20 });
    setBattleResult(null);
    setShowResultModal(false);
    setBattlePhase('idle');
    setIsAttacking(false);
    setActiveFighters([]);
    setBattleLog([
      `Капитан! Корабль "${enemyName}" подошел на расстояние выстрела!`,
      "Прикажите начать абордаж или открыть огонь!"
    ]);
  };

  const renderCrewDots = (count: number, color: string) => {
    const dots = [];
    for (let i = 0; i < count; i++) {
      const { dx, dy } = getOffset(i);
      
      dots.push(
        <div
          key={i}
          className={cn("w-2 h-2 rounded-full absolute", color)}
          style={{ transform: `translate(${dx}px, ${dy}px)` }}
        />
      );
    }
    return dots;
  };

  return (
    <div className="relative min-h-screen bg-[#030303] text-amber-100 font-serif overflow-x-hidden p-6 md:p-12">
      
      {/* Huge Glowing Orbs for brightness */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto space-y-8 pb-40">
         
         {/* Header */}
         <div className="flex justify-between items-center border-b-2 border-amber-500/30 pb-4">
            <div>
               <p className="text-[12px] font-black uppercase tracking-[0.5em] text-amber-500">Симуляция Сражения</p>
               <h1 className="text-6xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-400 to-red-600 drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)]">Абордаж</h1>
            </div>
            <button 
               onClick={startBoarding}
               disabled={isAttacking}
               className={cn(
                 "px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl font-black uppercase text-sm tracking-wider transition-all hover:scale-105 shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center gap-2",
                 isAttacking ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
               )}
            >
               <Sword size={18} />
               Начать Абордаж
            </button>
         </div>

         {/* Two Ships Container */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Ships Arena */}
            <div className="lg:col-span-9 bg-gradient-to-b from-[#110a03] to-black p-8 rounded-[3rem] border-2 border-amber-500/20 relative h-[650px] overflow-hidden flex justify-around items-center">
               
               {/* Grid background */}
               <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]" />
               
               {/* Арена бойцов (Общий слой поверх всего) */}
               <div className="absolute inset-0 pointer-events-none z-50">
                  <AnimatePresence>
                     {activeFighters.map(fighter => {
                        // Единый формат для обеих команд: calc(50% + Npx)
                        // Игрок: отрицательный N (левее центра), Враг: положительный N (правее центра)
                        const dir = fighter.side === 'player' ? -1 : 1;

                        // Старт = внутри своего корабля у моста
                        const gatherX = dir * 145;
                        // Цель = центр моста
                        const fightX = dir * (8 + Math.abs(fighter.offsetX) * 0.2);

                        let leftPx: number;
                        let phaseDuration = 4;

                        if (battlePhase === 'gathering') {
                           leftPx = gatherX;
                           phaseDuration = 4;
                        } else if (battlePhase === 'moving_to_bridge' || battlePhase === 'fighting') {
                           leftPx = fightX;
                           phaseDuration = 12;
                        } else {
                           // returning — идут назад к своему кораблю
                           leftPx = gatherX;
                           phaseDuration = 8;
                        }

                        const left = `calc(50% + ${leftPx}px)`;
                        const top = `calc(0% + ${404 + fighter.offsetY}px)`;
                        const isActive = battlePhase !== 'idle' && battlePhase !== 'returning';

                        // Стартовая позиция через style — без initial, без телепортации
                        return (
                           <motion.div
                              key={fighter.id}
                              id={fighter.id}
                              style={{ left: `calc(50% + ${gatherX}px)`, top }}
                              animate={{ 
                                 left, 
                                 top,
                                 x: isActive ? fighter.jitterX : 0,
                                 y: isActive ? fighter.jitterY : 0,
                              }}
                              transition={{
                                 left: { duration: phaseDuration, ease: "linear" },
                                 top: { duration: phaseDuration, ease: "linear" },
                                 x: { duration: fighter.duration, repeat: isActive ? Infinity : 0, ease: "easeInOut" },
                                 y: { duration: fighter.duration, repeat: isActive ? Infinity : 0, ease: "easeInOut" },
                              }}
                              exit={{ opacity: 0, scale: 0, transition: { duration: 0.3 } }}
                              className={cn(
                                 "w-3 h-3 rounded-full absolute z-50 -translate-x-1/2 -translate-y-1/2",
                                 fighter.side === 'player' ? "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                              )}
                           />
                        );
                     })}
                  </AnimatePresence>
               </div>

               {/* PLAYER SHIP (Left) */}
               <div className="relative z-20 w-[250px] h-[450px] border-4 border-cyan-500/30 rounded-[80px] bg-cyan-900/10 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                  <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 bg-cyan-500 text-black px-4 py-1 text-xs font-black uppercase rounded-full">Твой Корабль</div>
                  
                  {/* Bow */}
                  <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[125px] border-r-[125px] border-t-[60px] border-l-transparent border-r-transparent border-t-cyan-500/20" />
                  
                  {/* Zones */}
                  {playerZones.map(zone => (
                     <div key={zone.id} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: zone.x, top: zone.y }}>
                        <div className="w-16 h-16 bg-black/80 border-2 border-cyan-500/50 rounded-full flex items-center justify-center relative">
                           {renderCrewDots(playerCrew[zone.id], "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]")}
                        </div>
                        {/* LARGER TEXT */}
                        <p className="text-lg font-black text-white mt-2 drop-shadow-lg">{zone.name}</p>
                        <p className="text-xs font-bold text-cyan-400">{playerCrew[zone.id]}</p>
                     </div>
                  ))}

               </div>

               {/* Beautiful Wooden Suspension Bridge */}
               <div className="absolute left-[calc(25%+125px)] right-[calc(25%+125px)] top-[380px] h-12 z-0 pointer-events-none select-none flex items-center justify-center">
                  {/* Underlay shadow for depth */}
                  <div className="absolute inset-x-0 h-6 bg-black/40 blur-md translate-y-3 rounded-full" />

                  {/* Main Rope Rails */}
                  <div className="absolute inset-x-0 -top-1 h-[2px] bg-gradient-to-r from-amber-900 via-amber-700 to-amber-900 shadow-sm border-t border-amber-950/50" />
                  <div className="absolute inset-x-0 -bottom-1 h-[2px] bg-gradient-to-r from-amber-900 via-amber-700 to-amber-900 shadow-sm border-b border-amber-950/50" />

                  {/* Dynamic Planks Container */}
                  <div className="absolute inset-0 flex justify-around items-center px-1 overflow-hidden">
                     {Array.from({ length: 18 }).map((_, i) => (
                        <div
                           key={i}
                           className="h-full w-[10px] bg-gradient-to-b from-[#4a2f1b] via-[#634229] to-[#2b190c] border border-[#1e1007] rounded-[1px] shadow-lg flex flex-col justify-between py-[3px] relative shrink-0"
                           style={{
                              transform: `rotate(${(i % 3 - 1) * 1.5}deg) translateY(${i % 2 === 0 ? 1 : 0}px)`,
                           }}
                        >
                           {/* Top nail */}
                           <div className="w-[3px] h-[3px] rounded-full bg-zinc-500/80 mx-auto shadow-inner" />
                           {/* Bottom nail */}
                           <div className="w-[3px] h-[3px] rounded-full bg-zinc-500/80 mx-auto shadow-inner" />
                        </div>
                     ))}
                  </div>

                  {/* Left Lantern (Player Ship entrance) */}
                  <div className="absolute -left-3 top-[-10px] w-5 h-8 flex flex-col items-center">
                     {/* Lantern post */}
                     <div className="w-1 h-3 bg-amber-900 border-x border-amber-950" />
                     {/* Lantern glass and glow */}
                     <div className="w-4 h-5 bg-[#1a110a] border border-amber-500/50 rounded-md relative flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                        <motion.div 
                           animate={{ 
                              scale: [0.9, 1.1, 0.9],
                              opacity: [0.7, 1, 0.7]
                           }}
                           transition={{
                              repeat: Infinity,
                              duration: 1.5,
                              ease: "easeInOut"
                           }}
                           className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-300 to-red-500 blur-[2px]"
                        />
                     </div>
                  </div>

                  {/* Right Lantern (Enemy Ship entrance) */}
                  <div className="absolute -right-3 top-[-10px] w-5 h-8 flex flex-col items-center">
                     {/* Lantern post */}
                     <div className="w-1 h-3 bg-amber-900 border-x border-amber-950" />
                     {/* Lantern glass and glow */}
                     <div className="w-4 h-5 bg-[#1a110a] border border-amber-500/50 rounded-md relative flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                        <motion.div 
                           animate={{ 
                              scale: [1, 0.8, 1],
                              opacity: [1, 0.6, 1]
                           }}
                           transition={{
                              repeat: Infinity,
                              duration: 1.8,
                              ease: "easeInOut"
                           }}
                           className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-300 to-red-500 blur-[2px]"
                        />
                     </div>
                  </div>
               </div>

               {/* ENEMY SHIP (Right) */}
               <div className="relative z-20 w-[250px] h-[450px] border-4 border-red-500/30 rounded-[80px] bg-red-900/10 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                  <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-1 text-xs font-black uppercase rounded-full">Галеон Врага</div>
                  
                  {/* Bow */}
                  <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[125px] border-r-[125px] border-t-[60px] border-l-transparent border-r-transparent border-t-red-500/20" />
                  
                  {/* Zones */}
                  {enemyZones.map(zone => (
                     <div key={zone.id} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: zone.x, top: zone.y }}>
                        <div className="w-16 h-16 bg-black/80 border-2 border-red-500/50 rounded-full flex items-center justify-center relative">
                           {renderCrewDots(enemyCrew[zone.id], "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]")}
                        </div>
                        {/* LARGER TEXT */}
                        <p className="text-lg font-black text-white mt-2 drop-shadow-lg">{zone.name}</p>
                        <p className="text-xs font-bold text-red-400">{enemyCrew[zone.id]}</p>
                     </div>
                  ))}

               </div>

            </div>

            {/* Right: NEW JOURNAL (Beautiful and not "стремно") */}
            <div className="lg:col-span-3 h-[650px] flex flex-col">
               <div className="bg-gradient-to-br from-[#1a0f00] to-[#0a0501] p-6 rounded-[2rem] border-2 border-amber-500/30 flex-1 flex flex-col shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                  <div className="flex items-center gap-2 border-b border-amber-500/20 pb-4 mb-4">
                     <Scroll size={20} className="text-amber-500" />
                     <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-amber-500">Судовой Журнал</h4>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-4 text-sm text-amber-100/90 font-sans leading-relaxed">
                     {battleLog.map((log, i) => (
                        <div key={i} className="border-b border-amber-900/10 pb-2 flex gap-2">
                           <span className="text-amber-500 font-black">&gt;</span>
                           <p>{log}</p>
                        </div>
                     ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-amber-500/20 text-[10px] font-black uppercase text-amber-500/40 text-center">
                     Записи ведутся в реальном времени
                  </div>
               </div>
            </div>
         </div>

      </div>

      {/* Premium Battle Result Modal */}
      <AnimatePresence>
        {showResultModal && battleResult && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             {/* Backdrop overlay */}
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowResultModal(false)}
               className="absolute inset-0 bg-black/85 backdrop-blur-md"
             />

             {/* Modal Card */}
             <motion.div
               initial={{ opacity: 0, scale: 0.9, y: 30 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 30 }}
               transition={{ type: "spring", damping: 25, stiffness: 350 }}
               className={cn(
                 "relative z-10 w-full max-w-md bg-gradient-to-b from-[#1c120c] to-[#070301] border-2 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden text-center",
                 battleResult.winner === 'player' 
                   ? "border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.2)]" 
                   : battleResult.winner === 'enemy'
                     ? "border-red-600/50 shadow-[0_0_40px_rgba(220,38,38,0.2)]"
                     : "border-zinc-500/50 shadow-[0_0_40px_rgba(113,113,122,0.2)]"
               )}
             >
               {/* Ambient Glow */}
               <div className={cn(
                 "absolute -top-32 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-40",
                 battleResult.winner === 'player' ? "bg-amber-500" : battleResult.winner === 'enemy' ? "bg-red-600" : "bg-zinc-500"
               )} />

               {/* Result Icon */}
               <motion.div 
                 initial={{ scale: 0, rotate: -30 }}
                 animate={{ scale: 1, rotate: 0 }}
                 transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                 className={cn(
                   "w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 relative border-2",
                   battleResult.winner === 'player' 
                     ? "bg-amber-500/10 border-amber-500 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]" 
                     : battleResult.winner === 'enemy'
                       ? "bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                       : "bg-zinc-500/10 border-zinc-500 text-zinc-400"
                 )}
               >
                 {battleResult.winner === 'player' ? (
                   <Trophy size={40} className="animate-bounce" />
                 ) : battleResult.winner === 'enemy' ? (
                   <Skull size={40} className="animate-pulse" />
                 ) : (
                   <Compass size={40} />
                 )}
               </motion.div>

               {/* Title */}
               <h2 className={cn(
                 "text-4xl font-black uppercase tracking-wide mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]",
                 battleResult.winner === 'player' 
                   ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200" 
                   : battleResult.winner === 'enemy'
                     ? "text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-orange-500"
                     : "text-zinc-300"
               )}>
                 {battleResult.winner === 'player' ? "ПОБЕДА!" : battleResult.winner === 'enemy' ? "ПОРАЖЕНИЕ" : "НИЧЬЯ!"}
               </h2>

               {/* Subtitle */}
               <p className="text-amber-100/70 text-sm font-sans italic mb-6 px-4">
                 {battleResult.winner === 'player' 
                   ? "«Вражеский галеон взят на абордаж! Море поет о нашей славной победе!»" 
                   : battleResult.winner === 'enemy'
                     ? "«Сундук Дэви Джонса забрал наших храбрецов... Но мы вернемся за реваншем!»"
                     : "«Пороховой дым рассеялся. Ни один корабль не смог подчинить себе другого.»"}
               </p>

               {/* Casualties Card */}
               <div className="bg-black/40 border border-amber-500/10 rounded-2xl p-4 mb-6 space-y-4 font-sans text-xs">
                  <div className="flex justify-between items-center text-amber-500/60 font-black uppercase tracking-wider text-[10px] pb-2 border-b border-amber-500/5">
                     <span>Характеристика</span>
                     <span className="w-16 text-center">Твой флот</span>
                     <span className="w-16 text-center">Враг</span>
                  </div>
                  
                  {/* Total Initial */}
                  <div className="flex justify-between items-center text-amber-100/80">
                     <span className="flex items-center gap-1.5"><Users size={12} className="text-amber-500/50" /> Экипаж на старте:</span>
                     <span className="w-16 font-bold text-center">{battleResult.playerInitial}</span>
                     <span className="w-16 font-bold text-center">{battleResult.enemyInitial}</span>
                  </div>

                  {/* Survivors */}
                  <div className="flex justify-between items-center text-amber-100/80">
                     <span className="flex items-center gap-1.5"><Shield size={12} className="text-cyan-500/50" /> Выжившие:</span>
                     <span className="w-16 font-bold text-cyan-400 text-center">{battleResult.playerInitial - battleResult.playerLosses}</span>
                     <span className="w-16 font-bold text-red-400 text-center">{battleResult.enemyInitial - battleResult.enemyLosses}</span>
                  </div>

                  {/* Losses */}
                  <div className="flex justify-between items-center text-amber-100/80">
                     <span className="flex items-center gap-1.5"><Flame size={12} className="text-red-500/50" /> Потери:</span>
                     <span className="w-16 font-bold text-red-500 text-center">-{battleResult.playerLosses}</span>
                     <span className="w-16 font-bold text-red-500 text-center">-{battleResult.enemyLosses}</span>
                  </div>

                  {(battleResult as any).capturedCrew > 0 && (
                    <div className="flex justify-between items-center text-emerald-400 pt-2 border-t border-amber-500/5">
                       <span className="flex items-center gap-1.5 font-black uppercase text-[10px]"><Users size={12} /> Взято в плен:</span>
                       <span className="w-16 font-bold text-center">+{(battleResult as any).capturedCrew}</span>
                       <span className="w-16" />
                    </div>
                  )}

                  {(battleResult as any).goldEarned > 0 && (
                    <div className="flex justify-between items-center text-amber-400">
                       <span className="flex items-center gap-1.5 font-black uppercase text-[10px]"><Trophy size={12} /> Награбленное золото:</span>
                       <span className="w-16 font-bold text-center">+{(battleResult as any).goldEarned}</span>
                       <span className="w-16" />
                    </div>
                  )}

                  {/* Visual ratio bar */}
                  <div className="pt-2 border-t border-amber-500/5">
                     <div className="flex justify-between text-[10px] text-amber-500/40 mb-1 uppercase font-black">
                        <span>Соотношение сил выживших</span>
                     </div>
                     <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden flex">
                        <div 
                           className="bg-cyan-500 h-full transition-all duration-1000" 
                           style={{ 
                              width: `${
                                 (battleResult.playerInitial - battleResult.playerLosses) + (battleResult.enemyInitial - battleResult.enemyLosses) === 0
                                 ? 50
                                 : ((battleResult.playerInitial - battleResult.playerLosses) / ((battleResult.playerInitial - battleResult.playerLosses) + (battleResult.enemyInitial - battleResult.enemyLosses))) * 100
                              }%` 
                           }} 
                        />
                        <div className="bg-red-600 h-full flex-1" />
                     </div>
                  </div>
               </div>

               {/* Buttons */}
               <div className="space-y-4">
                 <button
                   onClick={() => router.push('/gallery')}
                   className={cn(
                     "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.03] shadow-lg flex items-center justify-center gap-2 text-black",
                     battleResult.winner === 'player' ? "bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]" : "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                   )}
                 >
                   {battleResult.winner === 'player' ? <Anchor size={16}/> : <RefreshCw size={16}/>}
                   Вернуться на Карту
                 </button>
                 <p className="text-[9px] font-black uppercase text-amber-500/40 tracking-[0.2em] animate-pulse">
                    Автоматический переход через 5 секунд...
                 </p>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
