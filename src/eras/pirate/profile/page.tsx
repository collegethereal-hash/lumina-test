'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Coins, Sword, 
  Dices, Volume2, VolumeX,
  ChevronLeft, Info, Trash2,
  MessageSquare, Skull, Zap,
  Map as MapIcon, X, Music, Waves,
  Beer, Trophy, Target,
  Compass, LayoutGrid, Ticket, Anchor, Shield, Scroll,
  Gift, Landmark, Flame, Sparkles, Gavel
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useEra } from "@/context/EraContext";

// Import components
import { StatCard } from './components/StatCard';
import { PirateChat } from './components/PirateChat';
import { GiftSystem } from './components/GiftSystem';
import { TreasureHuntGame } from './games/TreasureHunt';
import { TruthOrDareGame } from './games/TruthOrDare';
import { SunkenShipLotteryGame } from './games/SunkenShipLottery';
import { FortDefenseGame } from './games/FortDefense';
import { PirateEmpireGame } from './games/PirateEmpire';
import { TortugaSlotsGame } from './games/TortugaSlots';
import { CrashShipGame } from './games/CrashShip';
import { BlackjackGame } from './games/Blackjack';

// --- TYPES ---
type GameType = 'treasure_hunt' | 'truth_or_dare' | 'lottery' | 'fort_defense' | 'monopoly' | 'slots' | 'crash' | 'blackjack' | 'none';
type GameMode = 'ai' | 'local';
type PlayerId = 'me' | 'her';
type SidebarTab = 'stats' | 'chat';

const GAME_RULES: Record<string, { title: string, rules: string[] }> = {
  treasure_hunt: {
    title: "Охота за Золотом",
    rules: [
      "Выбери количество бомб перед началом игры (3, 5, 10 или 15).",
      "Чем больше бомб, тем выше множитель выигрыша!",
      "Нашел мину — игра окончена, текущий улов сгорает.",
      "После проигрыша ты увидишь, где были спрятаны остальные мины.",
      "Можешь забрать накопленное золото в любой момент кнопкой 'Забрать'."
    ]
  },
  truth_or_dare: {
    title: "Правда или Дело",
    rules: [
      "Старая пиратская традиция честности.",
      "Выбери 'Правду' — и ответь на каверзный вопрос.",
      "Выбери 'Дело' — и выполни безумное задание.",
      "Идеально для игры вдвоем за одной кружкой рома."
    ]
  },
  lottery: {
    title: "Лотерея Корабля",
    rules: [
      "Покупай билет за 200 золотых.",
      "Розыгрыш происходит автоматически в конце дня.",
      "Чем больше билетов, тем выше шанс на джекпот.",
      "Выигрыш зачисляется сразу после объявления номера."
    ]
  },
  fort_defense: {
    title: "Защита Форта",
    rules: [
      "Отражай волны нападающих пиратов.",
      "Кликай по врагам, чтобы стрелять из пушек.",
      "Не дай врагам добраться до стен форта.",
      "За каждого поверженного врага ты получаешь золото."
    ]
  },
  monopoly: {
    title: "Мои Владения",
    rules: [
      "Твоя личная коллекция активов в Архипелаге.",
      "Покупай уникальные Земли, Замки и Корабли за золото.",
      "Наводи на карточку, чтобы увидеть детальные характеристики и цену.",
      "Купленные активы навсегда остаются в твоем распоряжении.",
      "Собери полную коллекцию редчайших объектов Карибского моря!"
    ]
  },
  slots: {
    title: "Слоты Тортуги",
    rules: [
      "Крути барабаны в надежде на джекпот.",
      "Три одинаковых символа дают максимальный выигрыш.",
      "Два одинаковых символа возвращают ставку с бонусом.",
      "Якорь (x2), Ром (x5), Череп (x10), Сундук (x50)!"
    ]
  },
  crash: {
    title: "Крэш-Корабль",
    rules: [
      "Сделай ставку и наблюдай за ростом множителя.",
      "Множитель растет, пока корабль плывет.",
      "Успей нажать 'Прыгнуть!', пока Кракен не утащил корабль.",
      "Если корабль 'крэшнется' до твоего прыжка — ставка сгорит."
    ]
  },
  blackjack: {
    title: "Двадцать Одно",
    rules: [
      "Цель игры — набрать 21 очко или близко к этому, но не больше.",
      "Если набрал больше 21 — ты проиграл.",
      "Дилер (ИИ) останавливается на 17 очках.",
      "Туз здесь всегда дает 11 очков (упрощенные правила)."
    ]
  }
};

export default function PirateGamesPage() {
  const { setIsUIHidden } = useEra();
  const [activeGame, setActiveGame] = useState<GameType>('none');
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('stats');
  const [gold, setGold] = useState(10000);
  const [isMuted, setIsMuted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<Record<PlayerId, { wins: number, losses: number }>>({
    me: { wins: 0, losses: 0 },
    her: { wins: 0, losses: 0 }
  });

  const clearStats = () => {
    const emptyStats = {
      me: { wins: 0, losses: 0 },
      her: { wins: 0, losses: 0 }
    };
    setStats(emptyStats);
    localStorage.setItem('pirate_game_stats_v2', JSON.stringify(emptyStats));
  };

  useEffect(() => {
    const savedGold = localStorage.getItem('pirate_gold');
    if (savedGold) {
      setGold(parseInt(savedGold));
    } else {
      // Начальный капитал, если в localStorage еще ничего нет
      const initialGold = 10000;
      setGold(initialGold);
      localStorage.setItem('pirate_gold', initialGold.toString());
    }

    const savedStats = localStorage.getItem('pirate_game_stats_v2');
    if (savedStats) setStats(JSON.parse(savedStats));
  }, []);

  useEffect(() => {
    setIsUIHidden(activeGame !== 'none');
    return () => setIsUIHidden(false);
  }, [activeGame, setIsUIHidden]);

  const saveStats = (newGold: number, result: 'win' | 'lose' | 'push', winnerId?: PlayerId) => {
    setGold(newGold);
    localStorage.setItem('pirate_gold', newGold.toString());
    if (result === 'push') return;
    const newStats = { ...stats };
    if (gameMode === 'ai') {
      if (result === 'win') newStats.me.wins += 1;
      else newStats.me.losses += 1;
    } else if (winnerId) {
      newStats[winnerId].wins += 1;
      newStats[winnerId === 'me' ? 'her' : 'me'].losses += 1;
    }
    setStats(newStats);
    localStorage.setItem('pirate_game_stats_v2', JSON.stringify(newStats));
  };

  const handleGiftSent = (amount: number, type: 'gold' | 'skin', skinName?: string) => {
    const newGold = gold - amount;
    setGold(newGold);
    localStorage.setItem('pirate_gold', newGold.toString());
    
    // Add notification or log for gift sending
    console.log(`Sent gift: ${type === 'gold' ? amount + ' gold' : 'skin ' + skinName}`);
  };

  const games = [
    { id: 'monopoly', title: 'Мои Владения', desc: 'Твоя империя', icon: <Landmark />, color: 'bg-amber-900' },
    { id: 'treasure_hunt', title: 'Охота за Золотом', desc: 'Поле опасностей', icon: <MapIcon />, color: 'bg-emerald-900' },
    { id: 'slots', title: 'Слоты Тортуги', desc: 'Джекпот в таверне', icon: <Sparkles />, color: 'bg-yellow-900' },
    { id: 'crash', title: 'Крэш-корабль', desc: 'Успей выпрыгнуть!', icon: <Flame />, color: 'bg-rose-900' },
    { id: 'truth_or_dare', title: 'Правда или Дело', desc: 'Кодекс чести', icon: <MessageSquare />, color: 'bg-amber-900' },
    { id: 'lottery', title: 'Лотерея', desc: 'Джекпот на дне', icon: <Ticket />, color: 'bg-orange-900' },
    { id: 'blackjack', title: 'Двадцать Одно', desc: 'Пиратский азарт', icon: <Dices />, color: 'bg-zinc-900' },
    /* { id: 'fort_defense', title: 'Защита Форта', desc: 'Пушки к бою!', icon: <Shield />, color: 'bg-zinc-800' }, // TODO: Archive or delete later */
  ];

  return (
    <div className="relative min-h-screen bg-[#020a17] text-amber-100 font-serif">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10" />
        <div className="absolute top-0 right-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.1)_0%,transparent_50%)]" />
        <div className="absolute bottom-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_bottom_left,rgba(245,158,11,0.05)_0%,transparent_50%)]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-16 pb-32 space-y-20">
        
        {/* Mobile Navigation Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-[#f2e2ba] border-b-4 border-[#3e2723]/10 relative z-[60]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-950 rounded-xl flex items-center justify-center text-amber-500 shadow-lg">
              <Anchor size={20} />
            </div>
            <h1 className="text-lg font-black text-amber-950 uppercase tracking-tighter">Порт</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white/40 px-3 py-1.5 rounded-full border-2 border-amber-900/5">
              <span className="text-sm font-black text-amber-950">{gold}</span>
              <Coins size={14} className="text-amber-500" />
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 bg-amber-950 text-amber-500 rounded-xl shadow-lg"
            >
              {isMobileMenuOpen ? <X size={20} /> : <LayoutGrid size={20} />}
            </button>
          </div>
        </div>

        {/* Left Sidebar (Desktop and Mobile Overlay) */}
        <div className={cn(
          "fixed inset-0 md:relative md:flex w-full md:w-80 border-r-4 border-[#3e2723]/5 bg-[#f2e2ba]/95 md:bg-[#f2e2ba]/40 backdrop-blur-xl flex flex-col z-[55] transition-transform duration-500 md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar pt-20 md:pt-6">
               <div className="hidden md:flex items-center gap-4 mb-10">
                  <div className="w-14 h-14 bg-amber-950 rounded-2xl flex items-center justify-center text-amber-500 shadow-xl border-2 border-white/20">
                     <Anchor size={28} />
                  </div>
                  <div>
                     <h1 className="text-xl font-black text-amber-950 uppercase leading-none tracking-tighter">Порт каюты</h1>
                     <p className="text-[9px] font-black uppercase text-amber-900/40 tracking-widest">Список всех развлечений</p>
                  </div>
               </div>

            <div className="grid grid-cols-1 gap-3">
              {games.map((game, index) => (
                <div key={game.id} className="contents">
                  <button 
                    onClick={() => {
                      setActiveGame(game.id as GameType);
                      setIsMobileMenuOpen(false);
                    }} 
                    className={cn(
                      "group p-4 rounded-[2rem] text-left transition-all relative overflow-hidden border-2", 
                      activeGame === game.id ? "bg-white border-amber-500 shadow-xl -translate-y-1" : "bg-white/20 border-transparent hover:bg-white/40 hover:border-white/50"
                    )}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md", game.color)}>{game.icon}</div>
                      <div>
                        <h4 className={cn("font-black text-xs uppercase tracking-widest", activeGame === game.id ? "text-slate-900" : "text-amber-950/70")}>{game.title}</h4>
                        <p className={cn("text-[8px] font-black uppercase tracking-tighter", activeGame === game.id ? "text-amber-500" : "text-amber-900/30")}>{game.desc}</p>
                      </div>
                      {activeGame === game.id && (
                        <motion.div layoutId="active" className="absolute -right-2 w-1 h-6 bg-amber-500 rounded-full" />
                      )}
                    </div>
                  </button>
                  {(game.id === 'monopoly' || game.id === 'crash') && index < games.length - 1 && (
                    <div className="my-2 px-6">
                      <div className="h-px bg-amber-950/10 w-full" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 mb-20 md:mb-0">
             <div className="bg-white/40 backdrop-blur-md p-6 rounded-[2.5rem] shadow-sm border-2 border-amber-900/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-10 pointer-events-none" />
                
                <div className="flex items-center gap-4 relative z-10">
                   <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center text-white shadow-md border border-white/20 shadow-amber-500/20">
                      <Coins size={24} />
                   </div>
                   <div className="flex-1">
                      <p className="text-[8px] font-black uppercase text-amber-900/40 leading-none mb-1 tracking-[0.2em]">Ваш кошелек</p>
                      <div className="flex items-center gap-2">
                         <p className="text-2xl font-black text-amber-950 tracking-tighter">{gold}</p>
                         <Coins size={14} className="text-amber-500 animate-pulse" />
                      </div>
                   </div>
                   <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowGiftModal(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-lg border border-white/10"
                   >
                      <Gift size={18} />
                   </button>
                </div>
             </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative bg-white/20 min-h-0">
          {activeGame === 'none' ? (
            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden p-6">
              {/* Background Decor */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-amber-500/10 blur-[60px] md:blur-[120px] rounded-full animate-pulse" />
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="text-center relative z-10 space-y-6 md:space-y-10"
              >
                <div className="relative inline-block">
                  <div className="absolute -inset-10 bg-amber-500/10 blur-3xl rounded-full" />
                  <div className="w-32 h-32 md:w-56 md:h-56 bg-white rounded-[2rem] md:rounded-[4rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] flex items-center justify-center relative border border-white transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <Dices className="w-16 h-16 md:w-24 md:h-24 text-amber-600" />
                  </div>
                </div>

                <div className="space-y-2 md:space-y-4 max-w-xl mx-auto">
                  <div className="space-y-1">
                     <p className="text-amber-500 font-black uppercase tracking-[0.4em] text-[8px] md:text-[10px]">Королевская гавань</p>
                     <h2 className="text-4xl md:text-7xl font-black text-amber-950 uppercase tracking-tighter leading-tight">
                       Игорный <span className="text-amber-600">Квартал</span>
                     </h2>
                  </div>
                  <p className="text-amber-900/40 font-serif italic text-lg md:text-2xl leading-relaxed">
                    «Золото любит смелых, а море — удачливых. Выбери стол, капитан!»
                  </p>
                </div>

                {/* Mobile Stats Toggle (Visible only on mobile when no game is active) */}
                <div className="md:hidden flex gap-3 justify-center">
                  <button 
                    onClick={() => setSidebarTab('stats')}
                    className={cn(
                      "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                      sidebarTab === 'stats' ? "bg-[#3e2723] text-white border-[#3e2723]" : "bg-white text-amber-900/40 border-amber-900/5"
                    )}
                  >
                    Журнал
                  </button>
                  <button 
                    onClick={() => setSidebarTab('chat')}
                    className={cn(
                      "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                      sidebarTab === 'chat' ? "bg-[#3e2723] text-white border-[#3e2723]" : "bg-white text-amber-900/40 border-amber-900/5"
                    )}
                  >
                    Чат
                  </button>
                </div>

                {/* Mobile Stats/Chat Display */}
                <div className="md:hidden w-full max-w-sm mx-auto mt-6">
                   <AnimatePresence mode="wait">
                      {sidebarTab === 'stats' ? (
                        <motion.div 
                          key="mobile-stats" 
                          initial={{ opacity: 0, y: 10 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          exit={{ opacity: 0, y: 10 }}
                          className="grid grid-cols-2 gap-2"
                        >
                           <StatCard label="Побед" value={stats.me.wins} color="emerald" icon={<Trophy size={14} />} />
                           <StatCard label="Бед" value={stats.me.losses} color="red" icon={<Skull size={14} />} />
                        </motion.div>
                      ) : (
                        <motion.div key="mobile-chat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="h-[200px]">
                          <PirateChat />
                        </motion.div>
                      )}
                   </AnimatePresence>
                </div>
              </motion.div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col relative z-10 overflow-hidden">
              {activeGame === 'treasure_hunt' && <TreasureHuntGame gold={gold} onResult={saveStats} />}
              {activeGame === 'truth_or_dare' && <TruthOrDareGame gold={gold} onResult={saveStats} />}
              {activeGame === 'lottery' && <SunkenShipLotteryGame gold={gold} onResult={saveStats} />}
              {activeGame === 'fort_defense' && <FortDefenseGame gold={gold} onResult={saveStats} />}
              {activeGame === 'monopoly' && <PirateEmpireGame gold={gold} onResult={saveStats} />}
              {activeGame === 'slots' && <TortugaSlotsGame gold={gold} onResult={saveStats} />}
              {activeGame === 'blackjack' && <BlackjackGame gold={gold} onResult={saveStats} mode={gameMode} />}
              {activeGame === 'crash' && <CrashShipGame gold={gold} onResult={saveStats} />}
              
              <div className="absolute top-4 md:top-8 left-4 md:left-8 right-4 md:right-8 flex justify-between items-center z-50 pointer-events-none">
                <button onClick={() => setActiveGame('none')} className="pointer-events-auto p-3 md:p-4 bg-white text-amber-900 rounded-xl md:rounded-2xl border-2 md:border-4 border-amber-900/10 shadow-xl hover:bg-amber-50 transition-all"><ChevronLeft size={20} className="md:w-6 md:h-6" /></button>
                <button onClick={() => setShowInfo(true)} className="pointer-events-auto p-3 md:p-4 bg-white text-amber-900 rounded-xl md:rounded-2xl border-2 md:border-4 border-amber-900/10 shadow-xl hover:bg-amber-50 transition-all"><Info size={20} className="md:w-6 md:h-6" /></button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Sidebar (Desktop only) */}
        <div className="hidden md:flex w-96 border-l-8 border-[#3e2723]/10 bg-[#3e2723]/5 p-8 flex-col relative z-20">
          <div className="flex p-1 bg-white/40 rounded-2xl border-2 border-amber-900/5 mb-8 relative">
              <button onClick={() => setSidebarTab('stats')} className={cn("flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all", sidebarTab === 'stats' ? "bg-[#3e2723] text-white shadow-lg" : "text-amber-900/40")}><LayoutGrid size={14} />Журнал</button>
              <button onClick={() => setSidebarTab('chat')} className={cn("flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all", sidebarTab === 'chat' ? "bg-[#3e2723] text-white shadow-lg" : "text-amber-900/40")}><MessageSquare size={14} />Чат</button>
              
              {sidebarTab === 'stats' && (
                <button 
                  onClick={clearStats}
                  className="absolute -top-10 right-0 p-2 text-rose-900/30 hover:text-rose-600 transition-colors"
                  title="Очистить журнал"
                >
                  <Trash2 size={16} />
                </button>
              )}
          </div>

          <div className="flex-1 flex flex-col justify-center min-h-0 py-4">
            <AnimatePresence mode="wait">
              {sidebarTab === 'stats' ? (
                <motion.div 
                  key="stats" 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.95 }} 
                  className="w-full h-full flex flex-col justify-center"
                >
                   <div className="grid grid-cols-1 gap-4 px-2">
                      <StatCard label="Побед" value={stats.me.wins} color="emerald" icon={<Trophy size={20} />} />
                      <StatCard label="Поражений" value={stats.me.losses} color="red" icon={<Skull size={20} />} />
                      <StatCard 
                        label="Винрейт" 
                        value={`${stats.me.wins + stats.me.losses === 0 ? 0 : Math.round((stats.me.wins / (stats.me.wins + stats.me.losses)) * 100)}%`} 
                        color="sky" 
                        icon={<Target size={20} />} 
                      />
                      <StatCard 
                        label="Удача" 
                        value={`${stats.me.wins + stats.me.losses === 0 ? '??' : Math.min(99, Math.max(1, Math.round((stats.me.wins / (stats.me.wins + stats.me.losses)) * 110)))}%`} 
                        color="amber" 
                        icon={<Sparkles size={20} />} 
                      />
                   </div>
                </motion.div>
              ) : (
                <motion.div key="chat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full flex flex-col">
                  <PirateChat />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Info Modal */}
        <AnimatePresence>
          {showGiftModal && (
            <GiftSystem 
              gold={gold} 
              onGiftSent={handleGiftSent} 
              onClose={() => setShowGiftModal(false)} 
            />
          )}

          {showInfo && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-amber-950/20 backdrop-blur-xl z-[200] flex items-center justify-center p-4 md:p-6 lg:p-12"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} 
                animate={{ scale: 1, y: 0 }} 
                className="bg-[#f2e2ba] border-4 md:border-[12px] border-[#3e2723]/10 rounded-[2rem] md:rounded-[4rem] p-6 md:p-8 lg:p-14 max-w-2xl w-full relative overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
              >
                {/* Background Decor */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40 pointer-events-none" />
                
                <button 
                  onClick={() => setShowInfo(false)} 
                  className="absolute top-4 md:top-10 right-4 md:right-10 p-2 md:p-3 text-amber-900/40 hover:text-red-700 transition-colors z-20"
                >
                  <X size={24} className="md:w-8 md:h-8" />
                </button>

                <div className="relative z-10 space-y-6 md:space-y-10 overflow-y-auto custom-scrollbar pr-2">
                  <div className="space-y-1 md:space-y-2">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-6 md:w-10 h-1 bg-amber-500 rounded-full" />
                      <p className="text-amber-500 font-black uppercase tracking-[0.3em] text-[8px] md:text-[10px]">Информация о игре</p>
                    </div>
                    <h3 className="text-3xl md:text-5xl font-black text-amber-950 uppercase tracking-tighter">
                      {GAME_RULES[activeGame]?.title || 'Правила'}
                    </h3>
                  </div>

                  <div className="space-y-3 md:space-y-4 text-amber-900/60 font-serif italic text-base md:text-lg leading-relaxed">
                    {GAME_RULES[activeGame]?.rules.map((rule, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex gap-3 md:gap-5 items-start bg-white/40 p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] border-2 border-amber-900/5 hover:bg-white/60 transition-colors group shadow-inner"
                      >
                        <span className="shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 font-black text-xs group-hover:bg-amber-500 group-hover:text-white transition-all">
                          {i + 1}
                        </span>
                        <p className="flex-1 text-sm md:text-base">{rule}</p>
                      </motion.div>
                    ))}
                  </div>

                  <button 
                    onClick={() => setShowInfo(false)} 
                    className="w-full py-4 md:py-8 bg-amber-600 hover:bg-amber-500 text-white rounded-[1.5rem] md:rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-[0_15px_35px_rgba(217,119,6,0.2)] transition-all active:scale-95 border-b-4 md:border-b-8 border-amber-800 text-xs md:text-base"
                  >
                    Принято, капитан!
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
