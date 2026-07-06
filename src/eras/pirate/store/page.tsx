'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coins, Users, Sword, Ship, Anchor, Shield, Navigation, 
  Beer, Crosshair, Wind, Flame, Skull, Settings, Hammer, Gem, Sparkles,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import Chest3D from "@/eras/pirate/components/Chest3D";

export default function PirateStore() {
  const [gold, setGold] = useState(1500);
  const [crew, setCrew] = useState(25);
  const [inventory, setInventory] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'crew' | 'shipyard' | 'blacksmith'>('crew');
  const [notification, setNotification] = useState<string | null>(null);
  const [isChestOpen, setIsChestOpen] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedGold = localStorage.getItem('pirate_gold');
    const savedCrew = localStorage.getItem('pirate_crew');
    const savedInv = localStorage.getItem('pirate_inventory');
    if (savedGold) setGold(parseInt(savedGold, 10));
    if (savedCrew) setCrew(parseInt(savedCrew, 10));
    if (savedInv) setInventory(JSON.parse(savedInv));
    
    // Auto-open chest after a short delay for effect
    const timer = setTimeout(() => setIsChestOpen(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('pirate_gold', gold.toString());
    localStorage.setItem('pirate_crew', crew.toString());
    localStorage.setItem('pirate_inventory', JSON.stringify(inventory));
  }, [gold, crew, inventory]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleBuyItem = (item: any) => {
    if (gold >= item.price) {
      setGold(prev => prev - item.price);
      if (item.type === 'crew') {
        setCrew(prev => prev + item.value);
        showNotification(`Нанято: ${item.name} (+${item.value} к команде)`);
      } else {
        if (!inventory.includes(item.id)) {
          setInventory(prev => [...prev, item.id]);
          showNotification(`Приобретено: ${item.name}`);
        } else {
          showNotification(`У вас уже есть ${item.name}!`);
          setGold(prev => prev + item.price); // Refund
        }
      }
      // Play some visual feedback (could be a sound if we had a sound manager)
    } else {
      showNotification('Не хватает дублонов!');
      setIsChestOpen(false); // Close chest if poor
      setTimeout(() => setIsChestOpen(true), 1000); // Re-open as a "taunt"
    }
  };

  const storeItems = {
    crew: [
      { id: 'c1', name: 'Пьяный Матрос', desc: 'Еле стоит на ногах, но швабру держать может.', price: 10, value: 1, type: 'crew', icon: <Beer size={32} className="text-amber-600" /> },
      { id: 'c2', name: 'Отбросы Тортуги', desc: 'Грязные, злые и готовые на всё ради золота.', price: 45, value: 5, type: 'crew', icon: <Users size={32} className="text-slate-500" /> },
      { id: 'c3', name: 'Опытный Канонир', desc: 'Знает толк во взрывчатке. Редко промахивается.', price: 100, value: 12, type: 'crew', icon: <Flame size={32} className="text-red-500" /> },
      { id: 'c4', name: 'Морской Дьявол', desc: 'Легендарный пират, чье имя боятся произносить.', price: 500, value: 50, type: 'crew', icon: <Skull size={32} className="text-purple-500" /> },
    ],
    shipyard: [
      { id: 's1', name: 'Рыбацкая Лодка', desc: 'Лучше, чем плавать на бочке.', price: 200, type: 'item', icon: <Anchor size={32} className="text-amber-700" /> },
      { id: 's2', name: 'Шхуна "Морской Волк"', desc: 'Быстрая и маневренная.', price: 1500, type: 'item', icon: <Ship size={32} className="text-emerald-500" /> },
      { id: 's3', name: 'Испанский Галеон', desc: 'Огромный трюм для сокровищ и мощная броня.', price: 5000, type: 'item', icon: <Ship size={32} className="text-amber-400" /> },
      { id: 's4', name: 'Летучий Голландец', desc: 'Корабль призраков. Покупается лишь раз в жизни.', price: 25000, type: 'item', icon: <Ship size={32} className="text-teal-400" /> },
    ],
    blacksmith: [
      { id: 'b1', name: 'Клинки из Толедо', desc: 'Лучшие абордажные сабли.', price: 300, type: 'item', icon: <Sword size={32} className="text-slate-300" /> },
      { id: 'b2', name: 'Укрепленный Корпус', desc: 'Ваш корабль сможет выдержать любой залп.', price: 800, type: 'item', icon: <Shield size={32} className="text-amber-800" /> },
      { id: 'b3', name: 'Бронзовые Пушки', desc: 'Разрывают врагов в щепки.', price: 1200, type: 'item', icon: <Crosshair size={32} className="text-red-700" /> },
      { id: 'b4', name: 'Черные Паруса', desc: 'Плюс 100 к устрашению.', price: 2000, type: 'item', icon: <Wind size={32} className="text-slate-900" /> },
    ]
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-amber-100 font-serif overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10" />
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-red-950/20 to-transparent" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(245,158,11,0.05)_0%,transparent_50%)]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-12 pb-40 space-y-12">
        
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="text-center md:text-left space-y-2">
              <h1 className="text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-amber-200 via-amber-500 to-amber-700 drop-shadow-lg">
                Королевская Казна
              </h1>
              <p className="text-amber-500/50 italic tracking-widest text-lg">"Золото не имеет запаха, пока ты не купишь на него ром!"</p>
           </div>

           <div className="flex items-center gap-4 bg-slate-900/80 p-4 rounded-3xl border-2 border-amber-500/20 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-4 px-6 border-r border-amber-500/20">
                 <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20">
                   <Coins size={24} />
                 </div>
                 <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/40">Золото</p>
                   <AnimatePresence mode="wait">
                     <motion.p 
                       key={gold}
                       initial={{ y: 10, opacity: 0 }}
                       animate={{ y: 0, opacity: 1 }}
                       className="text-3xl font-bold text-amber-400 leading-none"
                     >
                       {gold}
                     </motion.p>
                   </AnimatePresence>
                 </div>
              </div>
              <div className="flex items-center gap-4 px-6">
                 <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 border border-blue-500/20">
                   <Users size={24} />
                 </div>
                 <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-blue-500/40">Команда</p>
                   <p className="text-3xl font-bold text-blue-400 leading-none">{crew}</p>
                 </div>
              </div>
           </div>
        </div>

        {/* 3D Chest Section */}
        <div className="relative w-full h-80 bg-gradient-to-b from-transparent via-amber-900/5 to-transparent rounded-[3rem] overflow-hidden group cursor-pointer"
             onClick={() => setIsChestOpen(!isChestOpen)}>
           <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-full h-full max-w-md">
                <Chest3D isOpen={isChestOpen} goldAmount={gold} />
             </div>
           </div>
           
           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center pointer-events-none">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/40 group-hover:text-amber-500/80 transition-colors">
                {isChestOpen ? "Кликни, чтобы закрыть" : "Кликни, чтобы открыть"}
              </p>
           </div>
        </div>

        {/* Store Tabs */}
        <div className="flex items-center justify-center gap-4">
           {[
             { id: 'crew', label: 'Таверна (Найм)', icon: <Beer size={20} /> },
             { id: 'shipyard', label: 'Верфь', icon: <Anchor size={20} /> },
             { id: 'blacksmith', label: 'Кузня', icon: <Hammer size={20} /> },
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={cn(
                 "flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all",
                 activeTab === tab.id 
                  ? "bg-amber-500 text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.4)] scale-105" 
                  : "bg-slate-900/50 text-amber-500/50 border border-amber-500/10 hover:bg-slate-800 hover:text-amber-400"
               )}
             >
               {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
             </button>
           ))}
        </div>

        {/* Store Grid */}
        <AnimatePresence mode="wait">
           <motion.div 
             key={activeTab}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             transition={{ duration: 0.3 }}
             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
           >
              {storeItems[activeTab].map((item) => {
                const isOwned = inventory.includes(item.id);
                const canAfford = gold >= item.price;

                return (
                  <div 
                    key={item.id}
                    className={cn(
                      "relative p-6 rounded-[2.5rem] border-4 flex flex-col justify-between transition-all group overflow-hidden pirate-wood",
                      isOwned ? "border-emerald-500/30 opacity-70" : "border-amber-900/40 hover:border-amber-500/50"
                    )}
                  >
                     <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                     
                     <div className="relative z-10 space-y-6">
                        <div className="w-20 h-20 bg-[#1a1a1a] rounded-full border-4 border-amber-900/50 flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform">
                          {item.icon}
                        </div>
                        
                        <div className="text-center space-y-2">
                           <h3 className="text-xl font-bold uppercase tracking-tight text-amber-100 leading-tight">{item.name}</h3>
                           <p className="text-xs text-amber-100/40 italic leading-relaxed h-10">"{item.desc}"</p>
                        </div>

                         {item.type === 'crew' && 'value' in item && (
                           <div className="flex justify-center">
                              <div className="px-4 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-xs font-black uppercase tracking-widest">
                                +{(item as any).value} Матросов
                              </div>
                           </div>
                         )}
                     </div>

                     <div className="relative z-10 mt-8 pt-6 border-t border-amber-500/10">
                        {isOwned ? (
                           <div className="w-full py-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl font-black uppercase tracking-widest text-xs text-center">
                             Приобретено
                           </div>
                        ) : (
                           <button 
                             onClick={() => handleBuyItem(item)}
                             disabled={!canAfford}
                             className={cn(
                               "w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2",
                               canAfford 
                                ? "bg-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95" 
                                : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                             )}
                           >
                             <Coins size={16} /> {item.price}
                           </button>
                        )}
                     </div>
                  </div>
                );
              })}
           </motion.div>
        </AnimatePresence>

      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 bg-emerald-950/90 border-2 border-emerald-500/50 rounded-full shadow-[0_0_40px_rgba(16,185,129,0.3)] backdrop-blur-xl flex items-center gap-4"
          >
             <Sparkles size={20} className="text-emerald-400" />
             <p className="text-emerald-100 font-bold uppercase tracking-widest text-sm">{notification}</p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
