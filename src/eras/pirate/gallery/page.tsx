'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

// --- FISH DATABASE ---
const FISH_TYPES = [
  { id: 'f1', name: 'Небесный Окунь', rarity: 'common', price: 10, icon: '🐟', weight: '0.5-1.5 кг', color: 'text-blue-600' },
  { id: 'f2', name: 'Радужный Карась', rarity: 'common', price: 8, icon: '🐠', weight: '0.3-0.8 кг', color: 'text-orange-600' },
  { id: 'f3', name: 'Серебряная Плотва', rarity: 'common', price: 5, icon: '🐡', weight: '0.2-0.4 кг', color: 'text-stone-500' },
  { id: 'f4', name: 'Изумрудная Щука', rarity: 'rare', price: 50, icon: '🦈', weight: '2-5 кг', color: 'text-emerald-700' },
  { id: 'f5', name: 'Королевский Сом', rarity: 'rare', price: 75, icon: '🐋', weight: '5-15 кг', color: 'text-indigo-700' },
  { id: 'f6', name: 'Огненный Лосось', rarity: 'rare', price: 100, icon: '🐟', weight: '3-7 кг', color: 'text-red-700' },
  { id: 'f7', name: 'Золотая Рыбка', rarity: 'epic', price: 500, icon: '✨', weight: '0.1 кг', color: 'text-amber-600' },
  { id: 'f8', name: 'Лунный Марлин', rarity: 'epic', price: 1000, icon: '🐬', weight: '50-100 кг', color: 'text-sky-600' },
  { id: 'f9', name: 'Мини-Кракен', rarity: 'legendary', price: 5000, icon: '🦑', weight: '200+ кг', color: 'text-purple-700' },
];

export default function FishingPage() {
  const [isUnderDevelopment] = useState(false); // Switch to false to restore fishing

  if (isUnderDevelopment) {
    return (
      <div className="relative min-h-screen bg-[#f4ebd0] text-stone-900 font-serif flex flex-col items-center justify-center overflow-hidden">
        {/* Background Decor - Old Map style */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/papyrus.png')] opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/5 via-transparent to-amber-900/10" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center space-y-4"
        >
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
            <span className="text-amber-950">В</span> <span className="text-amber-600">разработке</span>
          </h1>
          <p className="text-xl md:text-2xl text-amber-900/40 italic font-serif">
            Скоро здесь будет что-то интересное...
          </p>
        </motion.div>
      </div>
    );
  }

  const [fishingState, setFishingState] = useState<'idle' | 'waiting' | 'bite' | 'caught'>('idle');
  const [mode, setMode] = useState<'fishing' | 'fire'>('fishing');
  const [caughtFish, setCaughtFish] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [gold, setGold] = useState(1500);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<'fishing' | 'collection' | 'aquarium'>('fishing');
  const [showFishingUI, setShowFishingUI] = useState(false);

  // Mini-game State
  const [timing, setTiming] = useState(50);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [catchProgress, setCatchProgress] = useState(0);

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const castLine = () => {
    setShowFishingUI(true);
    setFishingState('waiting');
    const waitTime = 3000 + Math.random() * 5000;
    setTimeout(() => setFishingState('bite'), waitTime);
  };

  useEffect(() => {
    let timer: any;
    if (fishingState === 'bite') {
      timer = setInterval(() => {
        setTiming(prev => {
          if (prev >= 95) setDirection('left');
          if (prev <= 5) setDirection('right');
          return direction === 'right' ? prev + 5 : prev - 5;
        });
      }, 50);
    }
    return () => clearInterval(timer);
  }, [fishingState, direction]);

  const reelIn = () => {
    if (fishingState !== 'bite') return;
    if (timing > 35 && timing < 65) {
      const newProgress = catchProgress + 25;
      setCatchProgress(newProgress);
      if (newProgress >= 100) {
        const random = Math.random();
        let fish;
        if (random > 0.98) fish = FISH_TYPES[8];
        else if (random > 0.9) fish = FISH_TYPES[6];
        else if (random > 0.6) fish = FISH_TYPES[Math.floor(Math.random() * 3) + 3];
        else fish = FISH_TYPES[Math.floor(Math.random() * 3)];
        setCaughtFish(fish);
        setFishingState('caught');
        saveInventory([...inventory, { ...fish, date: new Date().toISOString() }]);
        setCatchProgress(0);
      }
    } else {
      setCatchProgress(prev => Math.max(0, prev - 10));
    }
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
    <div className="relative min-h-screen bg-[#f4ebd0] text-stone-900 font-serif overflow-y-auto overflow-x-hidden scrollbar-hide">
      {/* Background Decor - Old Map style */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/papyrus.png')] opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/5 via-transparent to-amber-900/10" />
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-amber-700/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-700/5 rounded-full blur-[100px]" />
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

          <div className="flex items-center justify-center w-full md:w-auto relative z-10">
            <button 
              onClick={() => setMode(mode === 'fishing' ? 'fire' : 'fishing')}
              className="px-12 py-5 bg-amber-500 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-amber-400 transition-all shadow-xl border-b-8 border-amber-700 active:border-b-0 active:translate-y-2 flex items-center justify-center gap-4"
            >
              {mode === 'fishing' ? <Flame size={20} /> : <Fish size={20} />}
              {mode === 'fishing' ? 'К костру' : 'На рыбалку'}
            </button>
          </div>
        </header>

        {/* Main Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT: Gameplay */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            {/* Tabs - Wooden Buttons */}
            {mode === 'fishing' && (
              <div className="flex justify-center">
                <div className="flex flex-wrap gap-4 p-3 bg-white/40 border-4 border-amber-900/10 rounded-[2.5rem] w-fit shadow-2xl backdrop-blur-md">
                  {[
                    { id: 'fishing', label: 'Действие', icon: mode === 'fishing' ? <Fish size={18} /> : <Flame size={18} />, show: true },
                    { id: 'collection', label: 'Мой Садок', icon: <BookOpen size={18} />, show: mode === 'fishing' },
                    { id: 'aquarium', label: 'Аквариум', icon: <Waves size={18} />, show: mode === 'fishing' }
                  ].filter(tab => tab.show).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "flex items-center gap-3 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all",
                        activeTab === tab.id 
                          ? "bg-amber-500 text-slate-950 shadow-xl scale-105" 
                          : "bg-amber-900/10 text-amber-900/60 hover:bg-amber-900/20 hover:text-amber-900"
                      )}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Content Stage - Map Style */}
            <div className={cn(
              "flex-1 bg-[#f2e2ba] border-[16px] border-[#3e2723]/10 rounded-[4rem] relative overflow-hidden shadow-[20px_20px_60px_rgba(0,0,0,0.1)] min-h-[650px]",
              mode === 'fire' && "h-full"
            )}>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40 pointer-events-none" />
              
              <div className="absolute inset-0 overflow-hidden scrollbar-hide">
                <AnimatePresence mode="wait">
                  {activeTab === 'fishing' && (
                    <motion.div key="action" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col">
                      {mode === 'fishing' ? (
                        <div className="flex-1 relative">
                          <AnimatePresence mode="wait">
                            {!showFishingUI ? (
                              <motion.div 
                                    key="lore"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    className="absolute inset-0 p-20 flex flex-col items-center justify-center text-center space-y-12"
                                  >
                                    <div className="space-y-6">
                                      <p className="text-2xl text-amber-900/70 leading-relaxed font-serif italic px-12 max-w-3xl mx-auto">
                                        {fishingLore}
                                      </p>
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

                                    {fishingState === 'caught' && caughtFish && (
                                      <motion.div 
                                        key="caught"
                                        initial={{ y: 100, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="pointer-events-auto bg-[#fdf6e3] p-16 rounded-[4rem] border-[12px] border-[#3d2723]/10 shadow-[0_40px_100px_rgba(0,0,0,0.2)] max-w-lg w-full relative overflow-hidden"
                                      >
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40" />
                                        <div className="relative">
                                          <div className="text-[12rem] drop-shadow-[20px_20px_40px_rgba(0,0,0,0.2)] animate-float text-center">{caughtFish.icon}</div>
                                        </div>

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

            <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-thin scrollbar-thumb-amber-900/10 relative z-10">
              {chat.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: msg.role === 'me' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex gap-4 max-w-[90%] items-start text-left",
                    msg.role === 'me' ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
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
