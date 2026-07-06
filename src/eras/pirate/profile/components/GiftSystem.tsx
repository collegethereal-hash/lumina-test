'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Coins, X, Heart, Sparkles, User, ArrowRight } from 'lucide-react';
import { cn } from "@/lib/utils";

interface GiftSystemProps {
  gold: number;
  onGiftSent: (amount: number, type: 'gold' | 'skin', skinName?: string) => void;
  onClose: () => void;
}

const SKINS = [
  { id: 'gold_koko', name: 'Золотой Коко', price: 1000, desc: 'Легендарный скин, сияющий как солнце Тортуги' },
  { id: 'pirate_king', name: 'Король Пиратов', price: 2500, desc: 'Корона и мантия для самого грозного капитана' },
  { id: 'ghost_parrot', name: 'Призрачный Коко', price: 1500, desc: 'Светится в темноте загробным светом' },
  { id: 'chef_koko', name: 'Шеф-повар', price: 500, desc: 'Колпак и фартук для мастера камбуза' }
];

export function GiftSystem({ gold, onGiftSent, onClose }: GiftSystemProps) {
  const [tab, setTab] = useState<'gold' | 'skin'>('gold');
  const [goldAmount, setGoldAmount] = useState(100);
  const [selectedSkin, setSelectedSkin] = useState<typeof SKINS[0] | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSendGold = () => {
    if (gold < goldAmount) return alert('Недостаточно золота!');
    setIsSending(true);
    setTimeout(() => {
      onGiftSent(goldAmount, 'gold');
      setIsSending(false);
      setShowSuccess(true);
    }, 1500);
  };

  const handleSendSkin = () => {
    if (!selectedSkin) return;
    if (gold < selectedSkin.price) return alert('Недостаточно золота!');
    setIsSending(true);
    setTimeout(() => {
      onGiftSent(selectedSkin.price, 'skin', selectedSkin.name);
      setIsSending(false);
      setShowSuccess(true);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-12">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-[#f2e2ba] border-[12px] border-[#3e2723]/10 rounded-[4rem] w-full max-w-2xl relative overflow-hidden shadow-2xl z-10"
      >
        {/* Background Decor */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/10 blur-[100px] rounded-full" />
        
        <button onClick={onClose} className="absolute top-10 right-10 p-3 text-amber-900/40 hover:text-red-700 transition-colors z-20"><X size={32} /></button>

        <div className="p-8 sm:p-14 space-y-10 relative z-10">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-amber-600 rounded-3xl flex items-center justify-center mx-auto shadow-[0_15px_35px_rgba(217,119,6,0.3)] border-4 border-white/20 transform rotate-3">
              <Gift size={40} className="text-white" />
            </div>
            <div className="space-y-1">
              <p className="text-amber-500 font-black uppercase tracking-[0.4em] text-[10px]">Королевский жест</p>
              <h3 className="text-4xl font-black text-amber-950 uppercase tracking-tighter">Подарок Партнеру</h3>
            </div>
            <p className="text-amber-900/60 font-serif italic text-xl">«Золото — это пыль, а внимание — это всё!»</p>
          </div>

          <div className="flex p-1 bg-white/40 rounded-[2rem] border-2 border-amber-900/5">
            <button onClick={() => setTab('gold')} className={cn("flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all", tab === 'gold' ? "bg-amber-600 text-white shadow-lg" : "text-amber-900/40 hover:text-amber-900")}>Дублоны</button>
            <button onClick={() => setTab('skin')} className={cn("flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all", tab === 'skin' ? "bg-amber-600 text-white shadow-lg" : "text-amber-900/40 hover:text-amber-900")}>Скины Коко</button>
          </div>

          <AnimatePresence mode="wait">
            {showSuccess ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-8"
              >
                <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(245,158,11,0.5)]">
                  <Heart size={48} className="text-white animate-pulse" />
                </div>
                <div className="space-y-3">
                  <h4 className="text-3xl font-black text-amber-950 uppercase tracking-tight">Отправлено!</h4>
                  <p className="text-amber-900/60 font-serif italic text-lg">Твой подарок уже летит к партнеру на крыльях попугая Коко.</p>
                </div>
                <button onClick={onClose} className="px-16 py-5 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 border-b-4 border-amber-800">Великолепно</button>
              </motion.div>
            ) : (
              <motion.div key={tab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                {tab === 'gold' ? (
                  <div className="space-y-8">
                    <div className="bg-white/60 p-10 rounded-[3rem] border-4 border-amber-900/5 text-center space-y-6 shadow-inner">
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Сумма подарка</p>
                      <div className="flex items-center justify-center gap-6">
                        <Coins size={48} className="text-amber-500" />
                        <input 
                          type="text" 
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={goldAmount} 
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setGoldAmount(parseInt(val) || 0);
                          }}
                          className="w-48 bg-transparent text-6xl font-black text-amber-950 text-center focus:outline-none placeholder-amber-900/10 appearance-none"
                          style={{ MozAppearance: 'textfield' }}
                        />
                      </div>
                      <div className="pt-4">
                        <p className="text-[10px] font-black text-amber-900/30 uppercase tracking-widest">Твой баланс: <span className="text-amber-950">{gold}</span> золотых</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleSendGold}
                      disabled={isSending || goldAmount <= 0}
                      className="w-full py-8 bg-amber-600 hover:bg-amber-500 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-[0_15px_35px_rgba(217,119,6,0.2)] transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 border-b-8 border-amber-800"
                    >
                      {isSending ? <RefreshCw className="animate-spin" /> : <Gift />} Отправить Золото
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-h-[350px] overflow-y-auto pr-3 custom-scrollbar">
                      {SKINS.map((skin) => (
                        <button 
                          key={skin.id}
                          onClick={() => setSelectedSkin(skin)}
                          className={cn(
                            "p-6 rounded-[2.5rem] border-4 transition-all relative overflow-hidden group text-left",
                            selectedSkin?.id === skin.id ? "bg-amber-600 border-amber-400 shadow-xl" : "bg-white/40 border-amber-900/5 hover:bg-white/60"
                          )}
                        >
                          <div className="flex justify-between items-start mb-4">
                             <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors", selectedSkin?.id === skin.id ? "bg-white/20 text-white" : "bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white")}>
                                <Sparkles size={24} />
                             </div>
                             <div className={cn("flex items-center gap-1.5 font-black", selectedSkin?.id === skin.id ? "text-white" : "text-amber-600")}>
                                {skin.price} <Coins size={14} />
                             </div>
                          </div>
                          <h5 className={cn("text-lg font-black uppercase tracking-tight mb-2", selectedSkin?.id === skin.id ? "text-white" : "text-amber-950")}>{skin.name}</h5>
                          <p className={cn("text-xs font-serif italic", selectedSkin?.id === skin.id ? "text-amber-100/70" : "text-amber-900/40")}>{skin.desc}</p>
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={handleSendSkin}
                      disabled={isSending || !selectedSkin}
                      className="w-full py-8 bg-amber-600 hover:bg-amber-500 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-[0_15px_35px_rgba(217,119,6,0.2)] transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 border-b-8 border-amber-800"
                    >
                      {isSending ? <RefreshCw className="animate-spin" /> : <Gift />} Подарить Скин
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function RefreshCw({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
      <path d="M16 16h5v5"/>
    </svg>
  );
}
