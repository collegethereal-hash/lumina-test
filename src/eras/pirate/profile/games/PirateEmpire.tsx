'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins, Anchor, Ship, Skull, Gift, 
  Trophy, Landmark, Sparkles,
  Sword, Shield, Scroll,
  Zap, Target, Crown, Gavel,
  Scale, Heart, HandCoins, EyeOff,
  MapPin, Navigation, Compass, Star,
  Building, Waves, Mountain, Castle,
  ChevronRight, LayoutGrid, Info
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface PirateEmpireProps {
  onResult: (newGold: number, result: 'win' | 'lose' | 'push') => void;
  gold: number;
}

type AssetType = 'Land' | 'Ship' | 'Castle' | 'Port' | 'Relic';

interface Asset {
  id: number;
  name: string;
  type: AssetType;
  price: number;
  income: number;
  prestige: number;
  owned: boolean;
  color: string;
  icon: any;
  desc: string;
}

const INITIAL_ASSETS: Asset[] = [
  { id: 0, name: 'Тортуга', type: 'Port', price: 2000, income: 100, prestige: 50, owned: false, color: 'bg-amber-600', icon: Anchor, desc: 'Величайший пиратский порт Карибского моря. Центр торговли и развлечений.' },
  { id: 1, name: 'Черная Жемчужина', type: 'Ship', price: 5000, income: 250, prestige: 100, owned: false, color: 'bg-zinc-800', icon: Ship, desc: 'Легендарный корабль с черными парусами. Самый быстрый на горизонте.' },
  { id: 2, name: 'Замок Губернатора', type: 'Castle', price: 10000, income: 500, prestige: 250, owned: false, color: 'bg-slate-700', icon: Castle, desc: 'Роскошная резиденция на вершине холма. Символ абсолютной власти.' },
  { id: 3, name: 'Золотой Прииск', type: 'Land', price: 3500, income: 300, prestige: 30, owned: false, color: 'bg-yellow-600', icon: Mountain, desc: 'Тайная жила чистейшего золота в глубине джунглей.' },
  { id: 4, name: 'Риф Сирен', type: 'Land', price: 1500, income: 50, prestige: 80, owned: false, color: 'bg-amber-600', icon: Waves, desc: 'Мистическое место, где поют сирены. Скрывает редкие жемчужины.' },
  { id: 5, name: 'Летучий Голландец', type: 'Ship', price: 8000, income: 400, prestige: 200, owned: false, color: 'bg-emerald-900', icon: Skull, desc: 'Корабль-призрак, не знающий покоя. Наводит ужас на всех моряков.' },
  { id: 6, name: 'Королевский Форт', type: 'Castle', price: 7000, income: 200, prestige: 150, owned: false, color: 'bg-amber-800', icon: Shield, desc: 'Неприступная крепость, охраняющая вход в залив.' },
  { id: 7, name: 'Остров Сокровищ', type: 'Land', price: 4500, income: 150, prestige: 120, owned: false, color: 'bg-rose-700', icon: MapPin, desc: 'Легендарный остров из старых карт. Место, где сбываются мечты.' },
  { id: 8, name: 'Императорский Дворец', type: 'Castle', price: 25000, income: 1500, prestige: 500, owned: false, color: 'bg-orange-700', icon: Landmark, desc: 'Вершина архитектурного искусства и роскоши. Владение им — удел богов.' },
];

function getEmpireTitle(ownedCount: number): string {
  if (ownedCount === 0) return 'Скиталец';
  if (ownedCount < 3) return 'Мелкий Арендатор';
  if (ownedCount < 6) return 'Землевладелец';
  if (ownedCount < 9) return 'Хозяин Архипелага';
  return 'Властелин Морей';
}

export function PirateEmpireGame({ onResult, gold }: PirateEmpireProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [currentGold, setCurrentGold] = useState(gold);
  const [message, setMessage] = useState('Добро пожаловать в твою Империю. Выбери актив для просмотра!');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [sidebarMode, setSidebarMode] = useState<'stats' | 'card'>('stats');

  useEffect(() => {
    // For testing: reset assets if a special flag is set in localStorage
    if (localStorage.getItem('reset_empire_assets') === 'true') {
      localStorage.removeItem('pirate_owned_assets');
      localStorage.removeItem('reset_empire_assets');
      setAssets(INITIAL_ASSETS);
    } else {
      const saved = localStorage.getItem('pirate_owned_assets');
      if (saved) {
        const ownedIds = JSON.parse(saved);
        setAssets(prev => prev.map(a => ownedIds.includes(a.id) ? { ...a, owned: true } : a));
      }
    }
  }, []);

  // Passive Income Logic
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const currentOwned = assets.filter(a => a.owned);
      if (currentOwned.length === 0) return;

      const incomePerTick = currentOwned.reduce((acc, curr) => acc + curr.income, 0);
      const newGold = currentGold + incomePerTick;
      
      setCurrentGold(newGold);
      onResult(newGold, 'push');
      
      // Visual feedback or message could be added here
      console.log(`Passive income received: ${incomePerTick}G`);
    }, 60000); // Every 1 minute

    return () => clearInterval(interval);
  }, [isPlaying, assets, currentGold, onResult]);

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset);
    setSidebarMode('card');
  };

  const buyAsset = (assetId: number) => {
    const asset = assets[assetId];
    if (asset.owned) return;

    if (currentGold < asset.price) {
      setMessage('Недостаточно золота для приобретения этого владения!');
      return;
    }

    const newGold = currentGold - asset.price;
    setCurrentGold(newGold);
    
    const nextAssets = [...assets];
    nextAssets[assetId] = { ...asset, owned: true };
    setAssets(nextAssets);
    
    // Update selected asset reference to show "Owned" status immediately
    setSelectedAsset(nextAssets[assetId]);
    
    const ownedIds = nextAssets.filter(a => a.owned).map(a => a.id);
    localStorage.setItem('pirate_owned_assets', JSON.stringify(ownedIds));
    
    setMessage(`Поздравляем! ${asset.name} теперь в вашей собственности.`);
    onResult(newGold, 'push');
  };

  const totalIncome = assets.filter(a => a.owned).reduce((acc, curr) => acc + curr.income, 0);
  const totalWorth = assets.filter(a => a.owned).reduce((acc, curr) => acc + curr.price, 0);
  const ownedCount = assets.filter(a => a.owned).length;

  const categories = [
    { title: 'Флот', type: 'Ship', icon: Ship },
    { title: 'Земли', type: 'Land', icon: Mountain },
    { title: 'Цитадели', type: 'Castle', icon: Castle },
  ];

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
              <div className="w-56 h-56 rounded-[3rem] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex items-center justify-center relative transform rotate-3 hover:rotate-0 transition-transform duration-500 border border-white mx-auto">
                <Landmark size={100} className="text-amber-500" />
              </div>
            </div>
            <div className="space-y-4 max-w-lg">
              <h3 className="text-6xl font-black uppercase tracking-tighter text-amber-950">Мои <span className="text-amber-500">Владения</span></h3>
              <p className="text-amber-900/60 font-serif italic text-2xl leading-relaxed">«Твоя личная империя в Карибском море. Покупай земли, замки и корабли, чтобы стать самым влиятельным капитаном!»</p>
            </div>
            <button 
              onClick={() => setIsPlaying(true)}
              className="px-20 py-6 bg-amber-950 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-amber-900 transition-all active:scale-95 flex items-center gap-4 mx-auto"
            >
              К Управлению! <Navigation size={24} />
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col lg:flex-row gap-6 z-10 p-6 lg:p-8 h-full overflow-hidden"
          >
            {/* Left Side - Website Style Gallery */}
            <div className="flex-1 flex flex-col relative bg-white rounded-[3.5rem] shadow-xl border border-white/50 overflow-hidden">
              <div className="h-full w-full p-8 grid grid-cols-3 gap-5 relative z-10 overflow-y-auto custom-scrollbar">
                {assets.map((asset) => (
                  <WebsiteStyleMiniCard 
                    key={asset.id} 
                    asset={asset} 
                    isSelected={selectedAsset?.id === asset.id}
                    onClick={() => handleAssetClick(asset)}
                  />
                ))}
              </div>
            </div>

            {/* Sidebar UI - The Right Part */}
            <div className="w-full lg:w-[520px] flex flex-col relative">
               <div className="h-full flex flex-col justify-center max-h-[900px]">
                  
                  <AnimatePresence mode="wait">
                    {sidebarMode === 'stats' || !selectedAsset ? (
                      <motion.div 
                        key="stats"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="h-full bg-white p-10 rounded-[3.5rem] shadow-xl border border-white/50 space-y-8 relative overflow-hidden flex flex-col"
                      >
                         <div className="flex items-center gap-6 relative z-10">
                            <div className="w-20 h-20 bg-amber-950 rounded-[2rem] flex items-center justify-center text-white shadow-xl relative">
                               <Crown size={40} className="text-amber-500" />
                            </div>
                            <div>
                               <h2 className="text-3xl font-black text-amber-950 uppercase tracking-tighter leading-none">Ваша Империя</h2>
                               <div className="mt-2">
                                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[9px] font-black uppercase tracking-widest">
                                     {getEmpireTitle(ownedCount)}
                                  </span>
                               </div>
                            </div>
                         </div>

                         <div className="grid grid-cols-1 gap-6 relative z-10 flex-1">
                            <div className="p-8 rounded-[2.5rem] bg-[#fdfaf6] border border-amber-900/5 relative overflow-hidden group">
                               <p className="text-[10px] font-black uppercase tracking-widest text-amber-900/30 mb-2">Пассивный доход</p>
                               <p className="text-5xl font-black text-amber-950 tracking-tighter">{totalIncome}G</p>
                            </div>

                            <div className="p-8 rounded-[2.5rem] bg-[#fdfaf6] border border-amber-900/5 relative overflow-hidden group">
                               <p className="text-[10px] font-black uppercase tracking-widest text-amber-900/30 mb-2">Ценность владений</p>
                               <p className="text-5xl font-black text-amber-950 tracking-tighter">{totalWorth}G</p>
                            </div>

                            <div className="p-8 rounded-[2.5rem] bg-[#fdfaf6] border border-amber-900/5 relative z-10">
                               <p className="text-[10px] font-black uppercase tracking-widest text-amber-900/30 mb-4">Ваш Флот и Земли</p>
                               <div className="flex gap-3">
                                  {assets.filter(a => a.owned).length > 0 ? (
                                    assets.filter(a => a.owned).slice(0, 5).map((a, i) => (
                                      <div key={i} className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", a.color)}>
                                         <a.icon size={20} />
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-xs font-serif italic text-amber-900/30">У вас пока нет владений...</p>
                                  )}
                               </div>
                            </div>
                         </div>

                         <div className="pt-6 relative z-10 mt-auto">
                            <div className="flex justify-between items-center mb-3">
                               <p className="text-[9px] font-black uppercase tracking-widest text-amber-900/40">Прогресс Коллекции</p>
                               <p className="text-xs font-black text-amber-950">{ownedCount} / {assets.length}</p>
                            </div>
                            <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${(ownedCount / assets.length) * 100}%` }}
                                 className="h-full bg-amber-500 rounded-full"
                               />
                            </div>
                         </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="h-full bg-white rounded-[3.5rem] shadow-xl border border-white/50 overflow-hidden relative flex flex-col"
                      >
                        <div className={cn("h-72 flex items-center justify-center text-white relative shrink-0", selectedAsset.color)}>
                           <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
                           <motion.div animate={{ scale: [1, 1.05, 1], rotate: [0, 2, 0] }} transition={{ duration: 6, repeat: Infinity }}>
                              <selectedAsset.icon size={140} strokeWidth={1} />
                           </motion.div>
                        </div>
                        
                        <div className="p-8 lg:p-12 space-y-8 flex-1 flex flex-col relative overflow-hidden">
                           <div className="text-center relative z-10 px-4">
                              <h4 className="text-4xl lg:text-5xl font-black uppercase text-amber-950 tracking-tighter leading-tight break-words">
                                {selectedAsset.name}
                              </h4>
                              <div className="flex items-center justify-center gap-4 mt-4">
                                 <div className="h-px w-10 bg-amber-900/10" />
                                 <p className="text-[14px] font-black text-amber-900/40 uppercase tracking-[0.6em]">{selectedAsset.type}</p>
                                 <div className="h-px w-10 bg-amber-900/10" />
                              </div>
                           </div>
                           
                           <p className="text-xl lg:text-2xl text-amber-900/60 italic font-serif leading-relaxed text-center px-6 relative z-10">
                              "{selectedAsset.desc}"
                           </p>
                           
                           <div className="grid grid-cols-2 gap-6 mt-auto relative z-10">
                              <div className="bg-[#fdfaf6] p-6 rounded-[2.5rem] text-center border border-amber-900/5 flex flex-col justify-center items-center shadow-sm">
                                 <p className="text-[10px] font-black text-amber-900/40 uppercase mb-2 tracking-widest">Ежедневный доход</p>
                                 <div className="flex items-center justify-center gap-2 font-black text-amber-950 text-2xl">
                                    <Coins size={20} className="text-amber-500" /> {selectedAsset.income}G
                                 </div>
                              </div>
                              <div className="bg-white p-6 rounded-[2.5rem] text-center border-4 border-amber-500/10 flex flex-col justify-center items-center overflow-hidden relative group/btn shadow-sm">
                                 <p className="text-[10px] font-black text-amber-900/40 uppercase mb-2 tracking-widest relative z-10">Статус владения</p>
                                 {selectedAsset.owned ? (
                                   <div className="flex flex-col items-center gap-1 relative z-10">
                                      <div className="font-black text-2xl uppercase text-emerald-600 tracking-tighter">Владеете</div>
                                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                   </div>
                                 ) : (
                                   <button 
                                     onClick={() => buyAsset(selectedAsset.id)}
                                     className="w-full bg-amber-500 text-white py-3 rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-black transition-all transform hover:-translate-y-1 shadow-2xl relative z-10"
                                   >
                                      Купить за {selectedAsset.price}G
                                   </button>
                                 )}
                              </div>
                           </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WebsiteStyleMiniCard({ asset, onClick, isSelected }: { asset: Asset, onClick: () => void, isSelected: boolean }) {
  const Icon = asset.icon;

  return (
    <motion.button 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "relative aspect-[3/4] rounded-[2.5rem] transition-all duration-300 overflow-hidden flex flex-col group",
        isSelected 
          ? "ring-4 ring-amber-500 shadow-2xl scale-105 z-10" 
          : "shadow-lg border-4 border-transparent",
        asset.owned && !isSelected ? "border-emerald-400" : ""
      )}
    >
      {/* Top Colored Section */}
      <div className={cn("h-[55%] w-full flex items-center justify-center text-white relative", asset.color)}>
         <Icon size={44} strokeWidth={1.5} />
         <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      
      {/* Bottom Info Section */}
      <div className="flex-1 bg-white w-full p-6 flex flex-col justify-center text-left">
         <h5 className="text-[12px] font-black uppercase text-amber-950 tracking-tighter leading-tight">
           {asset.name}
         </h5>
         
         {asset.owned ? (
           <div className="flex items-center gap-1 mt-1.5 text-emerald-500">
              <Crown size={12} fill="currentColor" className="opacity-80" />
              <span className="text-[9px] font-black uppercase tracking-widest">Владелец</span>
           </div>
         ) : (
           <div className="flex items-center gap-1 mt-1.5 text-amber-900/30">
              <span className="text-[9px] font-black uppercase tracking-widest">{asset.price}G</span>
           </div>
         )}
      </div>

      {/* Selected Indicator Glow */}
      {isSelected && (
        <div className="absolute inset-0 bg-amber-500/5 pointer-events-none" />
      )}
    </motion.button>
  );
}

