'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Fish, Anchor, MessageCircle, Send, Trash2, 
  Volume2, VolumeX, Sparkles, Waves, Flame,
  Trophy, BookOpen, User, RefreshCw, X, Heart, Music,
  Compass, Map as MapIcon, Navigation
} from "lucide-react";
import FishingScene3D from '@/eras/pirate/components/FishingScene3D';
import Campfire3D from '@/eras/pirate/components/Campfire3D';
import Aquarium3D from '@/eras/pirate/components/Aquarium3D';
import { cn } from "@/lib/utils";

export default function PirateGallery() {
  const router = useRouter();
  const { moments } = useData();
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [scale, setScale] = useState(0.8); // Default zoomed out slightly
  
  // Gamification State
  const [gold, setGold] = useState(1500);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<'fishing' | 'collection' | 'aquarium'>('fishing');
  const [showFishingUI, setShowFishingUI] = useState(false);

  // Ship Classes
  const SHIP_CLASSES = [
    { type: 'Sloop', name: 'Торговая Шхуна', minStrength: 5, maxStrength: 15, minReward: 100, maxReward: 300, icon: 'ship' },
    { type: 'Brig', name: 'Пиратский Бриг', minStrength: 20, maxStrength: 40, minReward: 400, maxReward: 800, icon: 'ship' },
    { type: 'Frigate', name: 'Британский Фрегат', minStrength: 45, maxStrength: 70, minReward: 900, maxReward: 1800, icon: 'ship' },
    { type: 'Galleon', name: 'Испанский Галеон', minStrength: 75, maxStrength: 110, minReward: 2000, maxReward: 4000, icon: 'ship' },
    { type: 'ManOWar', name: 'Королевский Мановар', minStrength: 120, maxStrength: 200, minReward: 5000, maxReward: 10000, icon: 'crown' },
    { type: 'Ghost', name: 'Летучий Голландец', minStrength: 150, maxStrength: 300, minReward: 15000, maxReward: 30000, icon: 'skull' },
  ];

  const generateRandomEnemy = () => {
    const shipClass = SHIP_CLASSES[Math.floor(Math.random() * SHIP_CLASSES.length)];
    const strength = Math.floor(Math.random() * (shipClass.maxStrength - shipClass.minStrength + 1)) + shipClass.minStrength;
    const reward = Math.floor(Math.random() * (shipClass.maxReward - shipClass.minReward + 1)) + shipClass.minReward;
    
    return {
      id: `e-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
      strength,
      reward,
      name: shipClass.name,
      shipType: shipClass.type,
      defeated: false
    };
  };

  const initialEnemies = useMemo(() => [
     { id: 'e1', x: 25, y: 35, strength: 15, reward: 300, name: 'Испанский Галеон', shipType: 'Galleon', defeated: false },
     { id: 'e2', x: 75, y: 20, strength: 25, reward: 600, name: 'Британский Фрегат', shipType: 'Frigate', defeated: false },
     { id: 'e3', x: 60, y: 80, strength: 40, reward: 1200, name: 'Летучий Голландец', shipType: 'Ghost', defeated: false },
     { id: 'e4', x: 15, y: 70, strength: 5, reward: 100, name: 'Торговая Шхуна', shipType: 'Sloop', defeated: false },
     { id: 'e5', x: 85, y: 45, strength: 30, reward: 800, name: 'Пиратский Бриг', shipType: 'Brig', defeated: false },
     { id: 'e6', x: 45, y: 15, strength: 10, reward: 200, name: 'Рыболовецкая Шхуна', shipType: 'Sloop', defeated: false },
   ], []);

  const [liveEnemies, setLiveEnemies] = useState<any[]>([]);

  // Load and check battle results
  useEffect(() => {
    // 1. Load enemies from localStorage or initial
    const savedEnemies = localStorage.getItem('pirate_enemies');
    let currentEnemies = (savedEnemies && JSON.parse(savedEnemies).length > 0) 
      ? JSON.parse(savedEnemies) 
      : initialEnemies;

    // 2. Check if we just returned from a battle
    const battleResultStr = localStorage.getItem('last_battle_result');
    if (battleResultStr) {
      const result = JSON.parse(battleResultStr);
      localStorage.removeItem('last_battle_result');

        if (result.winner === 'player') {
          // Find the enemy we fought and replace them with a new random one
          currentEnemies = currentEnemies.map((e: any) => {
            if (e.id === result.enemyId) {
              return generateRandomEnemy();
            }
            return e;
          });
          
          // Update stats and gold using the ACTUAL value from battle result
          const oldSunk = parseInt(localStorage.getItem('pirate_sunk_ships') || '0', 10);
          const newSunk = oldSunk + 1;
          const oldGold = parseInt(localStorage.getItem('pirate_gold') || '1500', 10);
          const newGold = oldGold + (result.reward || 500);
          
          setGold(newGold);
          setSunkShips(newSunk);
          
          localStorage.setItem('pirate_gold', newGold.toString());
          localStorage.setItem('pirate_sunk_ships', newSunk.toString());
        } else if (result.winner === 'enemy') {
        // Loss handling: crew is already updated by LairPage
        alert("Поражение! Враг разгромил нас. Мы отступили с большими потерями...");
      }
    }

    setLiveEnemies(currentEnemies);
    localStorage.setItem('pirate_enemies', JSON.stringify(currentEnemies));

    // Load other stats
    const savedGold = localStorage.getItem('pirate_gold');
    const savedCrew = localStorage.getItem('pirate_crew');
    const savedSunk = localStorage.getItem('pirate_sunk_ships');
    
    if (savedGold) setGold(parseInt(savedGold, 10));
    if (savedCrew) setCrew(parseInt(savedCrew, 10));
    if (savedSunk) setSunkShips(parseInt(savedSunk, 10));
    
    const savedPos = localStorage.getItem('pirate_ship_pos');
    if (savedPos) setShipPos(JSON.parse(savedPos));
  }, []);

  // Save state helpers
  useEffect(() => {
    localStorage.setItem('pirate_gold', gold.toString());
    localStorage.setItem('pirate_crew', crew.toString());
    localStorage.setItem('pirate_enemies', JSON.stringify(liveEnemies));
  }, [gold, crew, liveEnemies]);

  const getDistance = (p1: { x: number, y: number }, p2: { x: number, y: number }) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  const isCloseEnough = activeEnemy ? getDistance(shipPos, activeEnemy) < 8 : false;

  // Chat State (Between US)
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<{ role: 'me' | 'her'; text: string; time: string }[]>([
    { role: 'her', text: 'Как улов, капитан?', time: '12:00' }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Audio elements
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // lore texts
  const fishingLore = "Говорят, что в этих водах водятся не только обычные окуни, но и легендарные существа, что видели еще первых пиратов. Главное — терпение и правильный настрой.";
  const campfireLore = "Тепло костра согревает душу после долгого плавания. Здесь, под звездным небом Тортуги, рождаются самые искренние признания и верные клятвы.";

  useEffect(() => {
    // Background Music
    if (!audioRef.current) {
      audioRef.current = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3');
      audioRef.current.loop = true;
    }

    if (!isMuted) {
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    } else {
      audioRef.current.pause();
    }

    return () => {
      audioRef.current?.pause();
    };
  }, [isMuted]);

  useEffect(() => {
    const savedInventory = localStorage.getItem('pirate_inventory');
    const savedGold = localStorage.getItem('pirate_gold');
    const savedChat = localStorage.getItem('pirate_us_chat');
    
    if (savedInventory) setInventory(JSON.parse(savedInventory));
    if (savedGold) setGold(parseInt(savedGold, 10));
    if (savedChat) setChat(JSON.parse(savedChat));
  }, []);

    useEffect(() => {
      if (mode === 'fire') {
        setActiveTab('fishing');
        setShowFishingUI(false);
      }
    }, [mode]);

  const saveInventory = (newInv: any[]) => {
    setInventory(newInv);
    localStorage.setItem('pirate_inventory', JSON.stringify(newInv));
  };

  const saveChat = (newChat: any[]) => {
    setChat(newChat);
    localStorage.setItem('pirate_us_chat', JSON.stringify(newChat));
  };

  const handleAttack = () => {
    if (!activeEnemy || !isCloseEnough) return;

    // Save battle context to localStorage
    localStorage.setItem('current_battle_enemy', JSON.stringify({
      id: activeEnemy.id,
      name: activeEnemy.name,
      strength: activeEnemy.strength,
      reward: activeEnemy.reward
    }));
    
    // Save current ship position to return here later
    localStorage.setItem('pirate_ship_pos', JSON.stringify(shipPos));

    // Navigate to Lair
    router.push('/lair');
  };

  const handleSend = () => {
    if (!message.trim()) return;
    const newChat = [...chat, { 
      role: 'me' as const, 
      text: message, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }];
    saveChat(newChat);
    setMessage('');
    setTimeout(() => {
      const herReplies = ["Ого, какая рыбка!", "Уютно тут у костра...", "Смотри, Кракен!", "Я тебя люблю <3"];
      const reply = [...newChat, { 
        role: 'her' as const, 
        text: herReplies[Math.floor(Math.random() * herReplies.length)], 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }];
      saveChat(reply);
    }, 2000);
  };

  return (
    <div className="relative w-full h-screen bg-[#020a17] text-amber-100 font-serif overflow-hidden select-none">
      
      {/* Fleet Stats (HUD) */}
      <div className="absolute top-6 w-full px-6 z-50 flex justify-between items-start pointer-events-none">
         <div className="flex items-center gap-2 bg-[#051329]/90 p-2 rounded-2xl border-2 border-sky-500/20 backdrop-blur-md pointer-events-auto shadow-[0_0_30px_rgba(14,165,233,0.2)]">
           <button onClick={() => setScale(s => Math.max(0.4, s - 0.2))} className="p-2 text-sky-400 hover:bg-sky-500/10 rounded-xl transition-colors">
             <ZoomOut size={20} />
           </button>
           <div className="px-4 border-x border-sky-500/20 text-sky-300 font-black uppercase tracking-widest text-[10px] whitespace-nowrap text-center leading-tight">
             Карта <br/>Архипелага
           </div>
           <button onClick={() => setScale(s => Math.min(1.5, s + 0.2))} className="p-2 text-sky-400 hover:bg-sky-500/10 rounded-xl transition-colors">
             <ZoomIn size={20} />
           </button>
         </div>

         <div className="flex flex-col md:flex-row gap-4 pointer-events-auto">
            <ResourceBadge icon={<Coins size={16} />} value={gold} label="Дублоны" color="text-amber-400" />
            <ResourceBadge icon={<Users size={16} />} value={crew} label="Команда" color="text-sky-400" />
            <ResourceBadge icon={<Crosshair size={16} />} value={sunkShips} label="Потоплено" color="text-red-400" />
         </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 min-h-screen flex flex-col gap-12 pb-48">
        {/* Header - WANTED POSTER STYLE */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-[#f2e2ba] border-[12px] border-[#3d2723]/10 p-10 rounded-[3rem] shadow-[20px_20px_60px_rgba(0,0,0,0.1)] relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40 pointer-events-none" />
          
          <div className="flex items-center gap-8 relative z-10">
             <motion.div 
               animate={{ rotate: mode === 'fishing' ? [0, 5, -5, 0] : [0, 10, -10, 0] }}
               transition={{ duration: 4, repeat: Infinity }}
               className="w-24 h-24 bg-amber-900/5 rounded-3xl flex items-center justify-center border-4 border-amber-900/10 shadow-inner backdrop-blur-md"
             >
                {mode === 'fishing' ? <Fish size={48} className="text-amber-900/40" /> : <Flame size={48} className="text-red-900/40" />}
             </motion.div>
             <div>
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-amber-950 drop-shadow-sm">
                  {mode === 'fishing' ? 'Тихая Заводь' : 'Уютный Костер'}
                </h1>
             </div>
          </div>

      {/* Draggable Map Container (The World) */}
      <motion.div 
        drag
        dragConstraints={{ left: -7500, right: 0, top: -7500, bottom: 0 }} // Correct constraints for 8000px map
        dragElastic={0.05}
        dragMomentum={false}
        initial={{ x: -2000, y: -2000 }}
        animate={{ scale: scale }}
        transition={{ scale: { type: 'spring', stiffness: 100, damping: 25 } }}
        className="absolute w-[8000px] h-[8000px] cursor-grab active:cursor-grabbing origin-center z-10"
      >
         {/* --- RICH MAP TEXTURE --- */}
         <div className="absolute inset-0 bg-[#061a38]/40 border-8 border-sky-900/30 overflow-hidden shadow-[inset_0_0_1000px_rgba(2,10,23,1)]">
            
            {/* Navigational Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.15)_2px,transparent_2px),linear-gradient(90deg,rgba(14,165,233,0.15)_2px,transparent_2px)] bg-[size:400px_400px]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.05)_1px,transparent_1px)] bg-[size:100px_100px]" />

            {/* Giant Rhumb Lines */}
            <div className="absolute top-[50%] left-[50%] w-[1px] h-[200%] bg-sky-400/20 -rotate-45 transform -translate-x-1/2 -translate-y-1/2 origin-top" />
            <div className="absolute top-[50%] left-[50%] w-[1px] h-[200%] bg-sky-400/20 rotate-45 transform -translate-x-1/2 -translate-y-1/2 origin-top" />

            {/* Map Decorative Compasses */}
            <div className="absolute top-[20%] left-[20%] opacity-[0.1] pointer-events-none">
               <Compass size={1500} className="text-sky-300" />
            </div>
            <div className="absolute bottom-[20%] right-[20%] opacity-[0.05] pointer-events-none">
               <Navigation size={2000} className="text-sky-300" />
            </div>

            {/* Generated Map Details (Islands, Coastlines, Whirlpools) to fill the void */}
            {decorations.map((dec, i) => (
              <div 
                key={dec.id} 
                className="absolute border border-sky-400/20 rounded-[40%_60%_70%_30%] mix-blend-overlay flex flex-col items-center justify-center"
                style={{ 
                  left: `${dec.x}%`, top: `${dec.y}%`, 
                  width: `${dec.size}px`, height: `${dec.size}px`, 
                  opacity: dec.opacity,
                  backgroundColor: 'rgba(14,165,233,0.05)'
                }}
              >
              </div>
            )}

            {/* Ambient Animated Ships (Beautiful) */}
            {[...Array(30)].map((_, i) => {
               const startX = (i * 137.5) % 100; // Deterministic random-ish distribution
               const startY = (i * 151.1) % 100;
               const duration = 20 + (i % 10) * 5;
               return (
                 <motion.div
                   key={`ambient-ship-${i}`}
                   className="absolute z-10 pointer-events-none flex flex-col items-center"
                   style={{ left: `${startX}%`, top: `${startY}%` }}
                   animate={{ 
                     x: [0, 150, 0, -150, 0],
                     y: [0, 80, 160, 80, 0],
                     rotate: [0, 10, 0, -10, 0]
                   }}
                   transition={{ duration, repeat: Infinity, ease: "easeInOut", delay: -(i * 2) }}
                 >
                   <div className="relative text-sky-200/10">
                     <Ship size={80} className="drop-shadow-[0_0_10px_rgba(14,165,233,0.1)]" />
                     {/* Wake effect */}
                     <motion.div 
                       className="absolute -bottom-1 right-4 w-16 h-3 bg-sky-400/20 blur-md rounded-full"
                       animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.1, 1] }}
                       transition={{ duration: 4, repeat: Infinity }}
                     />
                   </div>
                 </motion.div>
               );
            })}
         </div>

                                    <button
                                      onClick={castLine}
                                      className="px-24 py-10 bg-amber-500 text-slate-900 rounded-[3rem] font-black uppercase tracking-[0.3em] text-xl shadow-2xl hover:bg-amber-400 transition-all border-b-8 border-amber-700 active:border-b-0 active:translate-y-2"
                                    >
                                      Начать рыбалку
                                    </button>
                                  </motion.div>
                            ) : (
                              <motion.div 
                                key="fishing-scene"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0"
                              >
                                <FishingScene3D fishingState={fishingState} />
                                
                                {/* Mini Overlay for Status */}
                                {fishingState === 'waiting' && (
                                  <div className="absolute top-10 left-1/2 -translate-x-1/2 px-8 py-3 bg-black/40 backdrop-blur-md rounded-full border-2 border-white/10 flex items-center gap-4">
                                    <div className="flex gap-1">
                                      {[0, 1, 2].map(i => (
                                        <motion.div 
                                          key={i}
                                          animate={{ opacity: [0.3, 1, 0.3] }}
                                          transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                          className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                                        />
                                      ))}
                                    </div>
                                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Ждем клева...</span>
                                  </div>
                                )}

                                {/* Overlay Controls */}
                                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                                  <AnimatePresence mode="wait">
                                    {fishingState === 'waiting' && (
                                      <motion.button 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => {
                                          setFishingState('idle');
                                          setShowFishingUI(false);
                                        }}
                                        className="pointer-events-auto absolute bottom-12 px-10 py-4 bg-white/10 hover:bg-white/20 text-white/40 hover:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                                      >
                                        Смотать удочки
                                      </motion.button>
                                    )}

                                    {fishingState === 'bite' && (
                                      <motion.div 
                                        key="bite"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="pointer-events-auto flex flex-col items-center gap-10 w-full max-w-lg px-10"
                                      >
                                         <div className="w-full h-16 bg-[#3d2723] rounded-[2rem] border-8 border-amber-600/30 relative overflow-hidden shadow-2xl p-2">
                                            <div className="absolute inset-y-0 left-[40%] right-[40%] bg-emerald-500/40 border-x-4 border-emerald-400 animate-pulse" />
                                            <div className="absolute inset-y-1 left-1 bg-red-600 rounded-2xl transition-all duration-300 shadow-xl" style={{ width: `${catchProgress}%` }} />
                                            <motion.div 
                                              animate={{ x: [0, 10, -10, 0] }}
                                              transition={{ repeat: Infinity, duration: 0.2 }}
                                              className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                            >
                                              <p className="text-white font-black uppercase tracking-tighter text-xl italic drop-shadow-md">ТЯНИИИ!</p>
                                            </motion.div>
                                         </div>
                                         
                                         <button 
                                           onClick={reelIn} 
                                           className="px-20 py-10 bg-red-700 text-white rounded-[3rem] font-black uppercase tracking-[0.3em] text-5xl shadow-[0_30px_80px_rgba(239,68,68,0.6)] animate-bounce border-b-8 border-red-900 active:scale-90 transition-all"
                                         >
                                           ТЯНИ!
                                         </button>
                                      </motion.div>
                                    )}

         {/* 2. Enemy Ships */}
         {liveEnemies.map(enemy => {
           const isBoss = enemy.shipType === 'ManOWar' || enemy.shipType === 'Ghost';
           const isWeak = enemy.shipType === 'Sloop';
           
           return (
             <div
               key={enemy.id}
               className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-30 cursor-pointer"
               style={{ left: `${enemy.x}%`, top: `${enemy.y}%` }}
               onClick={() => !enemy.defeated && setActiveEnemy(enemy)}
             >
                <motion.div 
                  whileHover={!enemy.defeated ? { scale: 1.15 } : {}}
                  animate={!enemy.defeated ? { 
                    y: isBoss ? [-25, 25, -25] : [-15, 15, -15], 
                    rotate: isBoss ? [-5, 5, -5] : [-3, 3, -3] 
                  } : {}}
                  transition={{ duration: isBoss ? 4 : 6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative flex flex-col items-center"
                >
                   {enemy.defeated ? (
                     <div className="p-6 bg-red-900/10 rounded-full border-2 border-red-900/30 opacity-50">
                       <Skull size={48} className="text-red-900/40" />
                     </div>
                   ) : (
                     <>
                       <div className={cn(
                         "p-6 rounded-full border-4 flex items-center justify-center shadow-2xl transition-all",
                         isBoss 
                           ? "bg-purple-900/90 border-purple-500 shadow-[0_0_80px_rgba(168,85,247,0.6)] scale-125" 
                           : isWeak 
                             ? "bg-slate-800/90 border-slate-500 shadow-[0_0_30px_rgba(100,116,139,0.3)] scale-90"
                             : "bg-[#3a0a0a]/90 border-red-600 shadow-[0_0_60px_rgba(220,38,38,0.5)]"
                       )}>
                         {enemy.shipType === 'Ghost' ? (
                           <Skull size={isBoss ? 72 : 56} className="text-teal-400 drop-shadow-[0_0_15px_rgba(45,212,191,0.8)]" />
                         ) : enemy.shipType === 'ManOWar' ? (
                           <Crown size={72} className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
                         ) : (
                           <Ship size={isWeak ? 40 : 56} className={cn(
                             isWeak ? "text-slate-400" : "text-red-500",
                             "drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]"
                           )} />
                         )}
                       </div>
                       
                       {/* Label with dynamic color */}
                       <div className={cn(
                         "absolute -bottom-14 whitespace-nowrap px-4 py-2 bg-black/90 rounded-xl border flex items-center gap-2 drop-shadow-xl z-10",
                         isBoss ? "border-purple-500 text-purple-300" : isWeak ? "border-slate-500 text-slate-400" : "border-red-600 text-red-400"
                       )}>
                         {isBoss ? <Skull size={14} /> : isWeak ? <Anchor size={14} /> : <Sword size={14} />}
                         <span className="font-black uppercase tracking-widest text-[10px]">{enemy.name}</span>
                         <span className="ml-2 px-1.5 py-0.5 bg-white/10 rounded text-[9px] border border-white/5">lvl {enemy.strength}</span>
                       </div>
                     </>
                   )}
                </motion.div>
             </div>
           );
         })}

                                        <div className="text-center space-y-6 relative z-10">
                                          <div className="space-y-2">
                                             <p className={cn("text-sm font-black uppercase tracking-[0.5em]", caughtFish.color)}>{caughtFish.rarity}</p>
                                             <h3 className="text-6xl font-black text-stone-900 tracking-tighter uppercase">{caughtFish.name}</h3>
                                          </div>
                                          
                                          <p className="text-lg text-amber-900/70 italic font-serif max-w-sm leading-relaxed mx-auto">
                                            {caughtFish.rarity === 'legendary' ? '«Легенды не врали! Это существо видело еще первых пиратов Тортуги.»' : '«Прекрасный улов для твоей коллекции, капитан!»'}
                                          </p>

                                          <div className="flex gap-8 justify-center">
                                             <div className="bg-white/40 px-8 py-4 rounded-3xl border-2 border-amber-900/10 shadow-inner">
                                                <p className="text-[10px] font-black uppercase text-amber-900/40 mb-1">Вес</p>
                                                <p className="text-2xl font-black text-stone-800">{caughtFish.weight}</p>
                                             </div>
                                             <div className="bg-white/40 px-8 py-4 rounded-3xl border-2 border-amber-900/10 shadow-inner">
                                                <p className="text-[10px] font-black uppercase text-amber-900/40 mb-1">Ценность</p>
                                                <p className="text-2xl font-black text-amber-600">{caughtFish.price} 🪙</p>
                                             </div>
                                          </div>

                                          <button 
                                            onClick={() => {
                                              setFishingState('idle');
                                              setShowFishingUI(false);
                                            }} 
                                            className="w-full py-8 bg-[#3d2723] text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-stone-800 transition-colors"
                                          >
                                            В садок
                                          </button>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <div className="flex-1 relative">
                          <Campfire3D />
                        </div>
                      )}
                    </motion.div>
                  )}

                {activeTab === 'collection' && (
                  <motion.div key="collection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 p-16 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-10 scrollbar-thin scrollbar-thumb-amber-900/10">
                    {inventory.length === 0 ? (
                      <div className="col-span-full flex flex-col items-center justify-center opacity-20 py-48">
                         <div className="w-40 h-40 rounded-full border-8 border-dashed border-amber-900/20 flex items-center justify-center mb-8">
                            <Fish size={80} />
                         </div>
                         <p className="font-black uppercase tracking-[0.5em] text-lg text-amber-900">Твой садок пуст</p>
                      </div>
                    ) : (
                      inventory.map((item, i) => (
                        <motion.div 
                          key={i} 
                          whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? -2 : 2 }}
                          className="relative p-10 bg-[#f2e2ba] border-[10px] border-[#3e2723]/10 shadow-xl flex flex-col items-center gap-6 group overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40 pointer-events-none" />
                          <div className="text-8xl group-hover:scale-125 transition-transform drop-shadow-lg z-10">{item.icon}</div>
                          <div className="text-center relative z-10 space-y-2">
                            <p className={cn("text-lg font-black uppercase tracking-tighter", item.color)}>{item.name}</p>
                            <div className="space-y-1">
                               <p className="text-[10px] font-black text-amber-900/40 uppercase tracking-widest">{item.weight}</p>
                               <p className="text-xs font-black text-red-800">Цена: {item.price} 🪙</p>
                            </div>
                          </div>
                          {item.rarity === 'legendary' && <Sparkles size={24} className="absolute top-6 right-6 text-amber-600 animate-pulse" />}
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                )}

                {activeTab === 'aquarium' && (
                  <motion.div key="aquarium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
                    <Aquarium3D fishList={inventory} />
                    <div className="absolute inset-x-0 bottom-12 flex justify-center pointer-events-none">
                       <p className="text-xs font-black uppercase tracking-[1em] text-sky-700/40">Твой живой океан</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

          {/* RIGHT: Private Chat - WANTED POSTER STYLE */}
          <div className="lg:col-span-4 flex flex-col bg-[#f2e2ba] border-[12px] border-[#3e2723]/10 rounded-[4rem] overflow-hidden shadow-[20px_20px_60px_rgba(0,0,0,0.1)] relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40 pointer-events-none" />
            
            <div className="p-10 border-b-2 border-amber-900/10 flex items-center justify-between shrink-0 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-amber-500 border-4 border-amber-600 rounded-2xl flex items-center justify-center text-amber-950 shadow-lg">
                  <Heart size={28} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="text-lg font-black uppercase tracking-tight text-amber-950">Личная Почта</h4>
                  <p className="text-[10px] font-black text-emerald-700 flex items-center gap-2 uppercase tracking-widest">
                    <span className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" /> Мы на связи
                  </p>
                </div>
              </div>
              <button onClick={() => saveChat([])} className="p-3 text-amber-900/10 hover:text-red-700 transition-colors"><Trash2 size={24} /></button>
            </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                   <button 
                     onClick={() => handleSailTo(activeEnemy.x, activeEnemy.y)}
                     className="py-4 bg-emerald-600/20 text-emerald-400 border-2 border-emerald-500/50 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600/40 transition-colors flex items-center justify-center gap-2"
                   >
                     <Wind size={16} /> Плыть к ним
                   </button>
                   {isCloseEnough ? (
                     <button 
                      onClick={handleAttack}
                      className="py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:bg-red-500 transition-colors flex items-center justify-center gap-2"
                     >
                       <Crosshair size={18} /> ЗАЛП!
                     </button>
                   ) : (
                     <div className="py-4 bg-slate-800 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 border-2 border-slate-700 opacity-60">
                       Нужно подплыть ближе
                     </div>
                   )}
                </div>
             </div>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* Tavern Modal */}
      <AnimatePresence>
        {activeTavern && (
          <ModalOverlay onClose={() => setActiveTavern(null)}>
             <div className="text-center space-y-4">
                <div className="mx-auto w-32 h-32 bg-[#2a1a10] border-4 border-amber-600 rounded-full flex items-center justify-center text-amber-500 mb-6 shadow-[0_0_50px_rgba(217,119,6,0.5)]">
                   {activeTavern.id.includes('t4') || activeTavern.id.includes('t5') ? <Castle size={64} /> : <Beer size={64} />}
                </div>
                <h2 className="text-5xl font-black uppercase tracking-tighter text-amber-100">{activeTavern.name}</h2>
                <p className="text-sky-100/60 italic leading-relaxed">"Идеальное место, чтобы пополнить запасы и найти новых пиратов в команду."</p>
                
                <div className="bg-black/40 p-8 rounded-[2rem] border border-amber-600/30 flex flex-col items-center my-8 gap-6">
                   <div className="text-center">
                     <p className="text-xl font-bold text-amber-100">Нанять 5 матросов</p>
                     <p className="text-xs font-black uppercase tracking-widest text-amber-500/60 flex items-center justify-center gap-2 mt-2"><Coins size={14}/> Стоимость: 100 дублонов</p>
                   </div>
                   <button 
                    onClick={handleHire}
                    className="w-full py-4 bg-amber-500 text-slate-950 rounded-2xl font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-transform"
                   >
                     Оплатить ром (Нанять)
                   </button>
                </div>

                <button 
                  onClick={() => handleSailTo(activeTavern.x, activeTavern.y)}
                  className="w-full py-4 bg-emerald-600/20 text-emerald-400 border-2 border-emerald-500/50 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-emerald-600/40 transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl border-4 flex items-center justify-center text-lg shrink-0 shadow-lg",
                    msg.role === 'me' ? "bg-red-700 border-red-900 text-white" : "bg-[#3e2723] border-amber-600/30 text-amber-100"
                  )}>
                    {msg.role === 'me' ? <User size={18} /> : '❤️'}
                  </div>
                  <div className={cn(
                    "p-6 rounded-2xl font-bold leading-relaxed text-base font-serif relative shadow-md",
                    msg.role === 'me' ? "bg-amber-500 text-slate-950 rounded-tr-none border-b-4 border-amber-700" : "bg-white/60 text-stone-900 rounded-tl-none border-2 border-amber-900/5"
                  )}>
                    {msg.text}
                    <p className="text-[9px] mt-2 opacity-40 font-sans uppercase tracking-widest">{msg.time}</p>
                  </div>
                </motion.div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-10 border-t-2 border-amber-900/10 relative z-10">
              <div className="flex gap-4 items-center">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Весточка..."
                  className="flex-1 bg-white/60 border-2 border-amber-900/10 focus:border-amber-800 rounded-xl px-6 py-3 text-stone-900 placeholder:text-amber-900/20 focus:outline-none transition-all text-sm font-serif font-bold shadow-inner"
                />
                <button
                  onClick={handleSend}
                  className="p-5 bg-amber-500 text-slate-900 rounded-2xl shadow-xl hover:bg-amber-400 transition-all border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 flex items-center justify-center"
                >
                  <Send size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}
