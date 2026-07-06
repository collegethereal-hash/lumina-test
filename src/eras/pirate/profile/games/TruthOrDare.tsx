'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Sword, Scroll, User, ShieldCheck, Timer, AlertCircle, Coins, History as HistoryIcon, Send, Zap, X, Lock, Heart } from 'lucide-react';
import { cn } from "@/lib/utils";

interface TruthOrDareProps {
  gold: number;
  onResult: (newGold: number, result: 'win' | 'lose' | 'push', winnerId?: 'me' | 'her') => void;
}

export function TruthOrDareGame({ gold, onResult }: TruthOrDareProps) {
  const [activeTab, setActiveTab] = useState<'idle' | 'selection' | 'question'>('idle');
  const [type, setType] = useState<'truth' | 'dare' | null>(null);
  const [content, setContent] = useState('');
  const [currentPlayer, setCurrentPlayer] = useState<'me' | 'her'>('me');
  const [truthCount, setTruthCount] = useState(0); // Tracks consecutive truths
  const [gameHistory, setGameHistory] = useState<{player: string, type: string, content: string}[]>([]);
  const [answerValue, setAnswerValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const truths = [
    "Какое самое безумное дело ты совершил ради любви?",
    "Твое самое первое впечатление о партнере?",
    "Если бы ты мог стать пиратом на один день, что бы ты сделал первым?",
    "Твой самый большой страх в отношениях?",
    "Что в партнере тебя раздражает больше всего, но ты молчишь?",
    "О каком поступке в жизни ты жалеешь больше всего?",
    "Если бы у нас был миллион дублонов, на что бы мы его потратили?",
    "Твое самое яркое воспоминание, связанное со мной?",
    "Что ты больше всего ценишь в наших отношениях?",
  ];

  const dares = [
    "Станцуй пиратский танец под музыку таверны!",
    "Признайся в любви партнеру голосом грозного капитана.",
    "Сделай партнеру массаж плеч в течение 2 минут.",
    "Изобрази тонущую крысу максимально правдоподобно.",
    "Спой любую пиратскую песню (или придумай на ходу).",
    "Поцелуй партнера так, будто вы не виделись десять лет в море.",
    "Принеси партнеру кружку рома (или любого напитка) прямо сейчас.",
    "Напиши партнеру 5 комплиментов прямо сейчас.",
  ];

  // Truth or Dare rules: Max 2 truths, then mandatory dare
  const MUST_DARE = truthCount >= 2;

  // Sync game state across "sessions" (mock multiplayer)
  useEffect(() => {
    const saved = localStorage.getItem('pirate_truth_dare_state');
    if (saved) {
      const state = JSON.parse(saved);
      setCurrentPlayer(state.currentPlayer);
      setTruthCount(state.truthCount);
      setGameHistory(state.history || []);
    }
  }, []);

  const saveState = (newPlayer: 'me' | 'her', newCount: number, newHistory: any[]) => {
    const state = { currentPlayer: newPlayer, truthCount: newCount, history: newHistory };
    localStorage.setItem('pirate_truth_dare_state', JSON.stringify(state));
  };

  const sendToChat = (t: string, msg: string, status: 'pick' | 'answer' | 'done' = 'pick', answer?: string) => {
    const chatData = localStorage.getItem('pirate_live_chat') || '[]';
    const messages = JSON.parse(chatData);
    
    const playerName = currentPlayer === 'me' ? 'Карим' : 'Полина';
    const typeLabel = t === 'truth' ? 'ПРАВДУ' : 'ДЕЛО';
    
    const newMessages = [...messages];

    if (status === 'pick') {
      // 1. System notification about selection
      newMessages.push({
        id: `sys-pick-${Date.now()}`,
        sender: currentPlayer === 'me' ? 'me' : 'partner',
        text: `${playerName} выбрал ${typeLabel}: "${msg}"`,
        timestamp: new Date(),
        isSystem: true
      });
    } else if (status === 'answer' && answer) {
      // 2. Player's actual answer as a message
      newMessages.push({
        id: `msg-ans-${Date.now()}`,
        sender: currentPlayer === 'me' ? 'me' : 'partner',
        text: `ОТВЕТ: ${answer}`,
        timestamp: new Date(),
        isSystem: false
      });
    } else if (status === 'done') {
      // 3. Status "Done" for Dare
      newMessages.push({
        id: `sys-done-${Date.now()}`,
        sender: currentPlayer === 'me' ? 'me' : 'partner',
        text: `✅ ${playerName} ВЫПОЛНИЛ ДЕЛО!`,
        timestamp: new Date(),
        isSystem: true
      });
    }
    
    localStorage.setItem('pirate_live_chat', JSON.stringify(newMessages));
    
    // Sync triggers
    window.dispatchEvent(new Event('storage')); 
    const syncEvent = new Event('storage_sync') as any;
    syncEvent.key = 'pirate_live_chat';
    syncEvent.newValue = JSON.stringify(newMessages);
    window.dispatchEvent(syncEvent);
  };

  const pick = (t: 'truth' | 'dare') => {
    if (t === 'truth' && MUST_DARE) return;

    setType(t);
    const list = t === 'truth' ? truths : dares;
    const randomContent = list[Math.floor(Math.random() * list.length)];
    setContent(randomContent);
    sendToChat(t, randomContent);
    setActiveTab('question');
    setAnswerValue('');
  };

  const complete = () => {
    if (type === 'truth' && !answerValue.trim()) return;

    const newCount = type === 'truth' ? truthCount + 1 : 0;
    const nextPlayer = currentPlayer === 'me' ? 'her' : 'me';
    
    if (type === 'truth') {
      sendToChat('truth', content, 'answer', answerValue);
    } else {
      sendToChat('dare', content, 'done');
    }

    const newHistory = [{
      player: currentPlayer === 'me' ? 'Карим' : 'Полина',
      type: type === 'truth' ? 'Правда' : 'Дело',
      content: type === 'truth' ? `${content} (Ответ: ${answerValue})` : content
    }, ...gameHistory];

    setTruthCount(newCount);
    setGameHistory(newHistory);
    setCurrentPlayer(nextPlayer);
    
    onResult(gold + 100, 'win', currentPlayer);
    saveState(nextPlayer, newCount, newHistory);
    setActiveTab('selection');
    setAnswerValue('');
  };

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#fdfaf5] font-sans">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 pointer-events-none" />
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 blur-[120px] rounded-full" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-500/5 blur-[120px] rounded-full" />
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'idle' ? (
          <motion.div 
            key="start"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-12 z-10 p-8"
          >
            <div className="relative group">
              <div className="absolute -inset-16 bg-amber-500/10 blur-[80px] rounded-full animate-pulse" />
              <div className="w-64 h-64 rounded-[4rem] bg-white shadow-2xl flex items-center justify-center relative transform rotate-3 group-hover:rotate-0 transition-transform duration-700 border border-white">
                  <motion.div 
                    animate={{ y: [0, -10, 0] }} 
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="absolute -top-12 -left-12 bg-amber-500 p-6 rounded-3xl shadow-xl border-4 border-white"
                  >
                    <MessageSquare size={48} className="text-white" />
                  </motion.div>
                  <motion.div 
                    animate={{ y: [0, 10, 0] }} 
                    transition={{ repeat: Infinity, duration: 3, delay: 1 }}
                    className="absolute -bottom-12 -right-12 bg-red-600 p-6 rounded-3xl shadow-xl border-4 border-white"
                  >
                    <Sword size={48} className="text-white" />
                  </motion.div>
                  <Scroll size={120} className="text-amber-950" />
              </div>
            </div>
            <div className="space-y-4 max-w-lg">
              <h3 className="text-7xl font-black uppercase tracking-tighter text-amber-950">Правда или <span className="text-amber-500">Дело</span></h3>
              <p className="text-amber-900/60 font-serif italic text-2xl leading-relaxed">«Старая пиратская традиция. Честность — золото, а смелость — твоя репутация!»</p>
            </div>
            <button 
              onClick={() => setActiveTab('selection')}
              className="px-24 py-8 bg-amber-950 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-amber-900 transition-all active:scale-95 flex items-center gap-4 group"
            >
              Вступить в игру <Sword size={28} className="group-hover:rotate-45 transition-transform" />
            </button>
          </motion.div>
        ) : activeTab === 'selection' ? (
          <motion.div 
            key="sel" 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95 }} 
            className="flex-1 flex flex-col items-center justify-center gap-8 w-full max-w-6xl mx-auto p-6 z-10"
          >
            {/* Header / Player Info - Enhanced & Shrunk */}
            <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-6 bg-white/60 backdrop-blur-2xl px-10 py-6 rounded-[3rem] border-4 border-white shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
               
               <div className="flex items-center gap-6 relative z-10">
                  <motion.div 
                    animate={currentPlayer === 'me' ? { rotate: [0, -5, 5, 0] } : { scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className={cn(
                      "w-16 h-16 rounded-[1.25rem] flex items-center justify-center shadow-2xl transition-all duration-500 border-4",
                      currentPlayer === 'me' 
                        ? "bg-amber-950 text-white border-amber-500/50 rotate-3" 
                        : "bg-rose-600 text-white border-rose-300/50 -rotate-3"
                    )}
                  >
                    {currentPlayer === 'me' ? <User size={32} /> : <Heart size={32} fill="currentColor" />}
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                       <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                       <p className="text-[9px] font-black uppercase tracking-[0.4em] text-amber-900/40">Штурвал держит</p>
                    </div>
                    <h4 className={cn(
                       "text-2xl font-black uppercase tracking-tighter transition-colors duration-500",
                       currentPlayer === 'me' ? "text-amber-950" : "text-rose-900"
                    )}>
                       {currentPlayer === 'me' ? 'Гринч' : 'Полина'}
                    </h4>
                  </div>
               </div>

               <div className="flex items-center gap-4 relative z-10">
                  <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-inner border border-amber-900/5 flex flex-col items-center gap-1">
                     <p className="text-[8px] font-black text-amber-900/30 uppercase tracking-widest">Честность</p>
                     <div className="flex gap-1.5">
                        {[1, 2].map(i => (
                          <div key={i} className={cn(
                            "w-8 h-2 rounded-full transition-all duration-500",
                            truthCount >= i ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-zinc-200"
                          )} />
                        ))}
                     </div>
                  </div>
                  {MUST_DARE && (
                    <motion.div 
                      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                      className="bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border-b-4 border-red-800"
                    >
                       <Zap size={18} className="animate-pulse" fill="currentColor" />
                       <span className="font-black uppercase tracking-widest text-[10px]">Только ДЕЛО!</span>
                    </motion.div>
                  )}
               </div>
            </div>
            
            {/* Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-4xl">
              <button 
                onClick={() => pick('truth')} 
                disabled={MUST_DARE}
                className={cn(
                  "group relative h-64 rounded-[3rem] border-8 flex flex-col items-center justify-center gap-4 transition-all duration-500 overflow-hidden",
                  MUST_DARE 
                    ? "bg-zinc-200 border-zinc-300 cursor-not-allowed" 
                    : "bg-gradient-to-br from-amber-400 to-amber-600 border-amber-300 shadow-[0_15px_40px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95"
                )}
              >
                {MUST_DARE ? (
                  <div className="absolute inset-0 bg-black/5 backdrop-blur-[2px] flex flex-col items-center justify-center gap-4 z-20">
                     <div className="w-20 h-20 bg-zinc-300 rounded-2xl flex items-center justify-center shadow-inner">
                        <Lock size={40} className="text-zinc-500" />
                     </div>
                     <div className="text-center">
                        <span className="block text-xl font-black uppercase tracking-widest text-zinc-500">Заблокировано</span>
                        <span className="text-[9px] font-black uppercase tracking-tighter text-zinc-400">Слишком много правды</span>
                     </div>
                  </div>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md mb-2">
                       <MessageSquare size={40} className="text-white" />
                    </div>
                    <div className="text-center">
                      <span className="block text-2xl font-black uppercase tracking-[0.2em] text-white">Правда</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Открой тайны</span>
                    </div>
                  </>
                )}
              </button>

              <button 
                onClick={() => pick('dare')} 
                className="group relative h-64 rounded-[3rem] border-8 bg-gradient-to-br from-red-500 to-red-700 border-red-400 text-white flex flex-col items-center justify-center gap-4 shadow-[0_15px_40px_rgba(239,68,68,0.3)] hover:scale-105 active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md mb-2">
                   <Sword size={40} className="text-white" />
                </div>
                <div className="text-center">
                  <span className="block text-2xl font-black uppercase tracking-[0.2em] text-white">Дело</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Покажи храбрость</span>
                </div>
              </button>
            </div>

            {/* History / Feed */}
            <div className="w-full max-w-6xl mt-6">
               <div className="flex items-center justify-between mb-6 px-4">
                  <h5 className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-900/40 flex items-center gap-3">
                     <HistoryIcon size={16} /> Журнал Испытаний
                  </h5>
                  <div className="h-px flex-1 mx-8 bg-amber-900/10" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-900/20">{gameHistory.length} записей</span>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {gameHistory.length > 0 ? gameHistory.map((h, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }}
                        key={`${h.player}-${i}`} 
                        className={cn(
                          "group relative bg-white/40 backdrop-blur-sm p-6 rounded-[2rem] border-4 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden",
                          h.player === 'Карим' ? "border-amber-500/30" : "border-rose-400/40"
                        )}
                      >
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 pointer-events-none" />
                         
                         {/* Type Badge */}
                         <div className="flex justify-between items-start mb-4 relative z-10">
                            <span className={cn(
                              "px-3 py-1 rounded-full font-black text-[8px] uppercase tracking-widest text-white shadow-md",
                              h.type === 'Правда' ? "bg-amber-500" : "bg-red-600"
                            )}>{h.type}</span>
                            <ShieldCheck size={18} className="text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
                         </div>

                         {/* Content */}
                         <div className="space-y-3 relative z-10">
                            <p className="text-sm font-serif italic text-amber-950 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all break-all whitespace-pre-wrap">
                               "{h.content}"
                            </p>
                            <div className="pt-3 border-t border-amber-900/5 flex items-center gap-2">
                               <div className="w-6 h-6 rounded-full bg-amber-900/10 flex items-center justify-center">
                                  <User size={12} className="text-amber-900/40" />
                                </div>
                               <span className="text-[10px] font-black text-amber-950 uppercase tracking-tighter">{h.player}</span>
                            </div>
                         </div>

                         {/* Decorative Element */}
                         <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform rotate-12">
                            {h.type === 'Правда' ? <MessageSquare size={80} /> : <Sword size={80} />}
                         </div>
                      </motion.div>
                    )) : (
                      <div className="col-span-full py-16 text-center bg-white/20 rounded-[3rem] border-4 border-dashed border-amber-900/5">
                        <p className="text-amber-900/20 font-serif italic text-xl">Журнал пока пуст, капитан...</p>
                      </div>
                    )}
                  </AnimatePresence>
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="ques" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex-1 flex flex-col items-center justify-center p-6 z-10"
          >
            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
               {/* Left: The Task Card */}
               <motion.div 
                 initial={{ x: -50, opacity: 0 }}
                 animate={{ x: 0, opacity: 1 }}
                 className="relative bg-white p-10 lg:p-16 rounded-[4rem] shadow-2xl flex flex-col justify-between overflow-hidden border-4 border-white"
               >
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-30 pointer-events-none" />
                  
                  <div className="space-y-8 relative z-10">
                     <div className={cn(
                        "inline-flex items-center gap-3 px-6 py-2 rounded-full text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-lg",
                        type === 'truth' ? "bg-amber-500" : "bg-red-600"
                     )}>
                        {type === 'truth' ? <MessageSquare size={14} /> : <Sword size={14} />}
                        {type === 'truth' ? 'Вопрос Чести' : 'Испытание'}
                     </div>

                     <h3 className="text-4xl lg:text-5xl font-serif italic text-amber-950 leading-tight">
                        "{content}"
                     </h3>
                  </div>

                  <div className="mt-12 pt-8 border-t-2 border-amber-900/5 relative z-10">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-900/5 flex items-center justify-center text-amber-900/40">
                           <Timer size={24} />
                        </div>
                        <p className="text-sm font-serif italic text-amber-900/50 leading-tight">
                           {type === 'truth' ? 'Напиши свой честный ответ в поле справа.' : 'Выполни действие и нажми кнопку подтверждения.'}
                        </p>
                     </div>
                  </div>
               </motion.div>

               {/* Right: The Action Area */}
               <motion.div 
                 initial={{ x: 50, opacity: 0 }}
                 animate={{ x: 0, opacity: 1 }}
                 transition={{ delay: 0.2 }}
                 className="flex flex-col gap-6"
               >
                  <div className="flex-1 bg-amber-950/80 backdrop-blur-xl p-10 lg:p-12 rounded-[4rem] shadow-2xl border-2 border-white/10 flex flex-col justify-center space-y-10 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-12 opacity-5 text-white pointer-events-none">
                        {type === 'truth' ? <Quill size={160} /> : <Zap size={160} />}
                     </div>

                     <div className="space-y-2 relative z-10">
                        <p className="text-amber-400 font-black uppercase tracking-[0.3em] text-[10px]">Действие игрока</p>
                        <h4 className="text-3xl font-black text-white uppercase tracking-tighter">
                           {currentPlayer === 'me' ? 'Ваш черед, Капитан' : 'Слово Полины'}
                        </h4>
                     </div>

                     {type === 'truth' ? (
                        <div className="space-y-4 relative z-10">
                           <textarea 
                              value={answerValue}
                              onChange={(e) => setAnswerValue(e.target.value)}
                              placeholder="Твой ответ здесь..."
                              maxLength={500}
                              className="w-full h-48 bg-black/40 border-4 border-white/10 rounded-[2.5rem] p-8 focus:border-amber-400/40 transition-all text-xl italic text-white placeholder:text-white/10 resize-none shadow-inner"
                           />
                           <div className="flex justify-end px-4">
                              <span className={cn(
                                 "text-[10px] font-black uppercase tracking-widest",
                                 answerValue.length >= 450 ? "text-amber-400" : "text-white/20"
                              )}>
                                 {answerValue.length} / 500
                              </span>
                           </div>
                           <button 
                              onClick={complete}
                              disabled={!answerValue.trim()}
                              className="w-full py-8 bg-amber-400 text-slate-950 rounded-3xl font-black uppercase tracking-[0.3em] text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-4"
                           >
                              Отправить ответ <Send size={20} />
                           </button>
                        </div>
                     ) : (
                        <div className="space-y-6 relative z-10 flex-1 flex flex-col justify-center">
                           <div className="p-8 rounded-[3rem] border-4 border-dashed border-white/10 bg-white/5 text-center">
                              <p className="text-white/60 font-serif italic text-xl">
                                 "Действие должно быть выполнено в реальности или показано по видеосвязи"
                              </p>
                           </div>
                           <button 
                              onClick={complete}
                              className="w-full py-10 bg-red-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-lg shadow-2xl hover:bg-red-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                           >
                              Готово, я сделал! <Zap size={24} fill="currentColor" />
                           </button>
                        </div>
                     )}
                  </div>

                  <button 
                    onClick={() => setActiveTab('selection')}
                    className="py-5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 border border-white/5"
                  >
                     <X size={14} /> Отменить выбор
                  </button>
               </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Quill(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
      <line x1="16" y1="8" x2="2" y2="22" />
      <line x1="17.5" y1="15" x2="9" y2="15" />
    </svg>
  );
}
