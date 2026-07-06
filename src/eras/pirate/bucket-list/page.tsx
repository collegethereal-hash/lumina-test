'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Anchor, Sword, Scroll, Skull, Bomb, Shield, Crown, Feather, Coins, MapPin, Clock, Target, Eye, Gem, X, Check, Map, Compass, Navigation, Info, Trash2, ArrowLeft,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useData } from '@/components/DataProvider';
import { supabase } from '@/lib/supabase';

export default function PirateBucketList() {
  const { currentUser, spaceConfig, quests, refreshQuests, isLoading, isQuestsLoading, profiles, refreshProfiles } = useData();
  const [activeTab, setActiveTab] = useState<'code'>('code');
  const [selectedQuest, setSelectedQuest] = useState<any>(null);
  const [signed, setSigned] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'reset' | 'view' | 'delete' | 'seal', id?: string } | null>(null);
  const [viewingArchiveId, setViewingArchiveId] = useState<string | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [contractTitle, setContractTitle] = useState("Закон Тортуги");
  const [dice, setDice] = useState({ d1: 1, d2: 1, rolling: false });
  
  // Use laws from bucket_list table where category is 'Law'
  const laws = quests.filter(q => q.category === 'Law').map(q => ({
    id: q.id,
    title: q.title,
    desc: q.description,
    completed: q.completed
  })).sort((a, b) => a.title.localeCompare(b.title));

  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Archive will be completed laws
  const archive = quests.filter(q => q.category === 'Law' && q.completed);

  const PIRATE_QUOTES = [
    "«Даже в самый сильный шторм, твои объятия — мой самый надежный якорь»",
    "«Любовь — это единственное сокровище, которое не нужно прятать в сундук»",
    "«Наш курс проложен по звездам нежности и меридианам заботы»",
    "«В океане жизни мы — два капитана одного непотопляемого корабля»",
    "«Честь пирата — в его слове, а счастье — в улыбке его помощника»",
    "«Лучшая добыча за день — это время, проведенное вместе в тихой гавани»",
  ];

  const [randomQuote, setRandomQuote] = useState("");

  useEffect(() => {
    setRandomQuote(PIRATE_QUOTES[Math.floor(Math.random() * PIRATE_QUOTES.length)]);
    const savedTitle = localStorage.getItem('pirate_contract_title');
    if (savedTitle) setContractTitle(savedTitle);
  }, []);

  useEffect(() => {
    // Auto-resize all textareas when laws change
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    });
  }, [laws, viewingArchiveId]);

  const saveToArchive = async () => {
    if (!signed) return;
    
    // Mark all current laws as completed to archive them
    for (const law of laws) {
      await supabase
        .from('bucket_list')
        .update({ is_completed: true })
        .eq('id', law.id);
    }

    setSigned(false);
    setViewingArchiveId(null);
    setConfirmAction(null);
    refreshQuests();
  };

  const deleteFromArchive = async (id: string) => {
    const { error } = await supabase
      .from('bucket_list')
      .delete()
      .eq('id', id);

    if (!error) {
      refreshQuests();
      if (viewingArchiveId === id) {
        setViewingArchiveId(null);
        setContractTitle("Закон Тортуги");
      }
    }
    setConfirmAction(null);
  };

  const viewArchive = (id: string) => {
    const entry = archive.find(e => e.id === id);
    if (entry) {
      setViewingArchiveId(id);
    }
    setConfirmAction(null);
  };

  const resetToTemplate = () => {
    setViewingArchiveId(null);
    setConfirmAction(null);
  };

  const updateLaw = async (id: string, field: 'title' | 'desc', value: string) => {
    if (viewingArchiveId) return; // Cannot edit archived laws
    
    const updateData = field === 'title' ? { title: value } : { description: value };
    
    await supabase
      .from('bucket_list')
      .update(updateData)
      .eq('id', id);
    
    refreshQuests();
  };

  const sendCallNotification = () => {
    if (isCalling) return;
    setIsCalling(true);
    
    const savedRole = localStorage.getItem('pirate_user_role');
    const userName = savedRole === 'Polina' ? 'Полина' : 'Карим';
    const partnerName = savedRole === 'Polina' ? 'Карима' : 'Полину';

    const chatData = localStorage.getItem('pirate_live_chat') || '[]';
    const messages = JSON.parse(chatData);
    
    messages.push({
      id: `sys-call-${Date.now()}`,
      sender: 'system',
      text: `📢 ${userName} вызывает ${partnerName} в Кодекс чести!`,
      timestamp: new Date(),
      isSystem: true
    });
    
    localStorage.setItem('pirate_live_chat', JSON.stringify(messages));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('storage_sync'));

    setTimeout(() => setIsCalling(false), 5000);
  };

  return (
    <div className="relative min-h-screen bg-[#1c120c] text-stone-800 font-serif overflow-hidden selection:bg-amber-800/30">
      
      {/* Background Decor: Wooden Table / Map Vibe */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/papyrus.png')] opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/5 via-transparent to-amber-900/10" />
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-amber-700/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-700/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-16 pb-32 space-y-12">
        
        {/* Header */}
        <header className="text-center space-y-4 relative">
          <motion.div
            initial={{ rotate: -10, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            className="inline-block"
          >
             <div className="p-4 bg-amber-900/20 rounded-full border-2 border-amber-900/30 shadow-2xl">
                <Scroll size={64} className="text-amber-600" />
             </div>
          </motion.div>
          <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-400 to-amber-700 drop-shadow-lg">
            Доска Поручений
          </h1>
          <p className="text-amber-200/40 font-black uppercase tracking-[0.4em] text-xs flex items-center justify-center gap-4">
             <Sword size={14} /> Капитанский стол <Sword size={14} />
          </p>
        </header>

        {/* 3D INTERACTIVE AREA - Styled like BayScene container */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
           
           {/* Left Column: Huge Scroll Diorama */}
           <div 
             className="lg:col-span-8 flex flex-col gap-6 w-full group/archive"
           >
              <div className="h-[300px] md:h-[450px] rounded-[2rem] md:rounded-[3rem] border-[8px] md:border-[12px] border-[#3e2723]/10 overflow-hidden relative shadow-[20px_20px_60px_rgba(0,0,0,0.1)] bg-[#f2e2ba]">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40" />
                 
                 <div className="w-full h-full flex flex-col items-center justify-center relative z-10 p-6 md:p-12 transition-transform duration-500">
                    <div className="relative w-40 h-40 md:w-64 md:h-64 mb-4 md:mb-8">
                       <div className="absolute -inset-10 bg-amber-500/10 rounded-full blur-3xl transition-all" />
                       <div className="absolute inset-0 bg-white/40 rounded-[2rem] md:rounded-[3rem] border-4 md:border-8 border-amber-600/30 flex items-center justify-center shadow-inner overflow-hidden transition-all">
                          <Scroll className="w-16 h-16 md:w-[120px] md:h-[120px] text-amber-700 transition-transform duration-500" />
                       </div>
                       <div className="absolute -bottom-2 -right-2 md:-bottom-4 md:-right-4 bg-amber-500 text-slate-900 p-2 md:p-4 rounded-xl md:rounded-2xl shadow-xl transform -rotate-12 border-2 md:border-4 border-amber-700">
                          <Feather className="w-6 h-6 md:w-8 md:h-8" />
                       </div>
                    </div>
                    
                    <div className="text-center space-y-2 md:space-y-4">
                       <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-amber-950">Архив Обязательств</h2>
                       <div className="flex flex-col items-center gap-2">
                          <div className="flex items-center gap-2 md:gap-4 px-6 md:px-8 py-2 md:py-3 bg-white/60 rounded-full border-2 border-amber-500/20 shadow-sm transition-all">
                             <span className="text-xs md:text-[14px] font-black uppercase text-amber-900 tracking-widest">
                                Скреплено обетов: <span className="text-amber-600 text-lg md:text-xl ml-1">{archive.length}</span>
                             </span>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Decorative Corner Screws */}
                 <div className="absolute top-4 left-4 w-3 h-3 md:w-4 md:h-4 bg-amber-900/10 rounded-full shadow-inner" />
                 <div className="absolute top-4 right-4 w-3 h-3 md:w-4 md:h-4 bg-amber-900/10 rounded-full shadow-inner" />
                 <div className="absolute bottom-4 left-4 w-3 h-3 md:w-4 md:h-4 bg-amber-900/10 rounded-full shadow-inner" />
                 <div className="absolute bottom-4 right-4 w-3 h-3 md:w-4 md:h-4 bg-amber-900/10 rounded-full shadow-inner" />
              </div>
           </div>

           {/* Right Column: Lore / Info Container */}
           <div className="lg:col-span-4 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 bg-[#f2e2ba] border-[8px] md:border-[12px] border-[#3e2723]/10 relative shadow-[20px_20px_60px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col justify-between group/lore">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40 pointer-events-none" />
              
              <div className="space-y-8 text-left relative z-10">
                 <div className="border-b-2 border-amber-900/10 pb-6">
                    <span className="text-[10px] font-black uppercase text-amber-900/40 tracking-[0.25em] block">Пиратский Вестник</span>
                    <h2 className="text-3xl font-black text-amber-950 uppercase tracking-tight mt-1">Кодекс Чести</h2>
                 </div>

                 <div className="min-h-[120px] flex flex-col justify-center">
                    <p className="text-lg text-amber-900/70 leading-relaxed italic font-serif">
                       {randomQuote}
                    </p>
                 </div>

                 <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={sendCallNotification}
                    disabled={isCalling}
                    className={cn(
                      "w-full py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-xl border-b-8 transition-all flex items-center justify-center gap-2 mb-10",
                      isCalling 
                        ? "bg-emerald-500 text-white border-emerald-700 opacity-80" 
                        : "bg-amber-500 text-slate-900 border-amber-700"
                    )}
                 >
                    {isCalling ? (
                      <>
                        <Check size={16} />
                        Сигнал отправлен!
                      </>
                    ) : (
                      <>
                        <Bell size={16} className="animate-bounce" />
                        Позвать Капитана
                      </>
                    )}
                 </motion.button>
                 
                 <div className="text-center w-full mb-4">
                    <p className="text-[11px] text-amber-900/30 uppercase tracking-[0.3em] font-black italic">
                       «Честь дороже золота!»
                    </p>
                 </div>
              </div>

              <div className="pt-8 border-t-2 border-amber-900/10 text-center relative z-10 w-full opacity-50">
                 {/* This line is now pushed to the very bottom */}
              </div>
           </div>
        </section>

        {/* DYNAMIC CONTENT AREA - Filters & Main Content */}
        <div className="space-y-8 md:space-y-12">
           <AnimatePresence mode="wait">
              <motion.div
                 key="code"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10"
              >
                 {/* Left: The Laws - Paper Style */}
                 <div className="lg:col-span-8 space-y-0">
                    <div className="p-6 md:p-16 bg-[#f2e2ba] border-[8px] md:border-[12px] border-[#3e2723]/10 rounded-[2rem] md:rounded-[3rem] shadow-[20px_20px_60px_rgba(0,0,0,0.1)] relative overflow-hidden group mt-0 md:-mt-16">
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40" />
                       
                       {viewingArchiveId && (
                          <motion.button 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => setConfirmAction({ type: 'reset' })}
                            className="absolute top-0 right-0 z-50 px-3 md:px-5 py-2 md:py-2.5 bg-amber-500 text-amber-950 rounded-bl-xl md:rounded-bl-2xl font-black uppercase text-[8px] md:text-[9px] tracking-wider shadow-xl border-l-[4px] md:border-l-[6px] border-b-[4px] md:border-b-[6px] border-[#3e2723]/10 hover:bg-amber-400 active:scale-95 flex items-center gap-1.5 md:gap-2 transition-all"
                          >
                            <ArrowLeft size={10} className="md:w-3 md:h-3" />
                            Вернуться к текущему
                          </motion.button>
                        )}

                       <div className="relative z-10 space-y-8 md:space-y-12">
                          <div className="text-center border-b-2 md:border-b-4 border-amber-900/10 pb-6 md:pb-8 relative">
                             <input 
                                value={contractTitle}
                                onChange={(e) => {
                                   if (!viewingArchiveId) {
                                      setContractTitle(e.target.value);
                                      localStorage.setItem('pirate_contract_title', e.target.value);
                                   }
                                }}
                                disabled={!!viewingArchiveId}
                                className={cn(
                                   "w-full bg-transparent text-center font-black uppercase tracking-tighter text-amber-950 text-3xl md:text-5xl focus:outline-none transition-all placeholder:text-amber-900/20",
                                   !viewingArchiveId && "hover:bg-white/20 rounded-xl"
                                )}
                             />
                             <p className="text-[10px] md:text-xs font-black text-red-800 uppercase tracking-[0.2em] md:tracking-[0.3em] mt-2 px-2">
                                {viewingArchiveId ? `Архив от ${archive.find(a => a.id === viewingArchiveId)?.date}` : "Свод нерушимых обязательств"}
                             </p>
                          </div>

                          <div className="space-y-6 md:space-y-10">
                             {laws.length > 0 ? laws.map((law, index) => (
                                <div key={law.id} className="flex gap-3 md:gap-6 items-start border-b-2 border-amber-900/5 pb-6 md:pb-8 last:border-0 group/law">
                                   <span className="font-black text-amber-900/40 text-2xl md:text-4xl leading-none mt-1 md:mt-0">{index + 1}.</span>
                                   <div className="space-y-1 md:space-y-2 flex-1">
                                      <div className="relative group/edit">
                                        <input 
                                          value={law.title} 
                                          onChange={(e) => updateLaw(law.id, 'title', e.target.value)}
                                          placeholder="Заголовок правила..."
                                          disabled={!!viewingArchiveId}
                                          className={cn(
                                            "w-full bg-transparent border-b-2 border-transparent font-black uppercase tracking-tight text-amber-950 text-xl md:text-2xl focus:outline-none transition-all placeholder:text-amber-900/20 px-2 md:px-4 -mx-2 md:-mx-4 py-1",
                                            !viewingArchiveId && "hover:bg-white/30 hover:border-amber-500/30 focus:bg-white/20 focus:border-amber-500 rounded-xl"
                                          )}
                                        />
                                        <textarea 
                                          value={law.desc} 
                                          onChange={(e) => updateLaw(law.id, 'desc', e.target.value)}
                                          placeholder="Описание обязанности..."
                                          disabled={!!viewingArchiveId}
                                          rows={1}
                                          className={cn(
                                            "w-full bg-transparent border-b-2 border-transparent italic font-serif text-amber-900/70 text-base md:text-lg leading-relaxed focus:outline-none resize-none transition-all placeholder:text-amber-900/20 overflow-hidden px-2 md:px-4 -mx-2 md:-mx-4 py-1 md:py-2 mt-1",
                                            !viewingArchiveId && "hover:bg-white/30 hover:border-amber-500/30 focus:bg-white/20 focus:border-amber-500 rounded-xl"
                                          )}
                                        />
                                      </div>
                                   </div>
                                </div>
                             )) : (
                                <div className="text-center py-10 md:py-20 opacity-20 italic">
                                   <p className="text-xl md:text-2xl">Кодекс пока чист...</p>
                                   <button 
                                     onClick={async () => {
                                       if (!spaceConfig?.id) return;
                                       await supabase.from('bucket_list').insert([
                                         { title: 'Закон Честности', description: 'Мы всегда говорим правду...', category: 'Law', proposed_by: currentUser || 'Grinch', approved_by_partner: true, space_id: spaceConfig.id },
                                         { title: 'Кодекс Поддержки', description: 'Если один из нас устал...', category: 'Law', proposed_by: currentUser || 'Grinch', approved_by_partner: true, space_id: spaceConfig.id }
                                       ]);
                                       refreshQuests();
                                     }}
                                     className="mt-4 text-[10px] md:text-xs font-black uppercase tracking-widest text-amber-900/40 hover:text-amber-900 transition-colors"
                                   >
                                     Добавить начальные законы
                                   </button>
                                </div>
                             )}
                          </div>

                          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 md:pt-10 border-t-2 md:border-t-4 border-amber-900/10">
                             <div className="space-y-1 text-center md:text-left w-full md:w-auto">
                                <p className="font-serif italic text-xs md:text-sm text-amber-900/50">Скреплено клятвой здоровьем девочек</p>
                                <p className="font-black text-amber-950 uppercase tracking-widest text-base md:text-lg">Кошечкой и ее котиком</p>
                             </div>
                             
                             {!viewingArchiveId ? (
                               <motion.div 
                                  onClick={() => signed && setConfirmAction({ type: 'seal' })}
                                  whileHover={signed ? { scale: 1.05 } : {}}
                                  whileTap={signed ? { scale: 0.95 } : {}}
                                  className={cn(
                                     "px-6 md:px-10 py-4 md:py-5 w-full md:w-auto justify-center rounded-[1.5rem] md:rounded-[2rem] border-[4px] md:border-[6px] font-black text-[10px] md:text-[11px] uppercase transition-all cursor-pointer shadow-xl flex items-center gap-2 md:gap-3 relative overflow-hidden",
                                     signed 
                                        ? "bg-amber-500 border-[#3e2723]/20 text-slate-900 hover:bg-amber-400" 
                                        : "bg-stone-200 border-stone-300 text-stone-400 opacity-50 cursor-not-allowed"
                                  )}
                               >
                                  {signed && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 pointer-events-none" />}
                                  <Scroll className="w-4 h-4 md:w-5 md:h-5 relative z-10" />
                                  <span className="relative z-10">{signed ? "Запечатать Обет" : "Ожидает Подписи"}</span>
                               </motion.div>
                             ) : (
                               <div className="px-6 md:px-10 py-4 md:py-5 w-full md:w-auto justify-center rounded-[1.5rem] md:rounded-[2rem] border-[4px] md:border-[6px] border-[#3e2723]/10 bg-amber-500 text-amber-950 font-black text-[10px] md:text-[11px] uppercase shadow-inner flex items-center gap-2 md:gap-3 relative overflow-hidden">
                                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 pointer-events-none" />
                                  <Check className="w-4 h-4 md:w-5 md:h-5 relative z-10" />
                                  <span className="relative z-10">Обет Запечатан</span>
                               </div>
                             )}
                          </div>
                       </div>
                    </div>


                 </div>

                 {/* Right: Interactive elements - Styled like site cards */}
                 <div className="lg:col-span-4 flex flex-col gap-6 md:gap-8 h-fit">
                    {/* Sign Button Card */}
                    <div className="p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-[#f2e2ba] border-[8px] md:border-[12px] border-[#3e2723]/10 shadow-[20px_20px_60px_rgba(0,0,0,0.1)] relative overflow-hidden flex flex-col items-center text-center">
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40 pointer-events-none" />
                       
                       <div className="relative z-10 space-y-6 md:space-y-8 w-full">
                          <div className="w-16 h-16 md:w-24 md:h-24 bg-white/40 border-4 border-amber-900/10 rounded-2xl md:rounded-3xl flex items-center justify-center text-amber-700 mx-auto shadow-inner">
                             <Feather className="w-8 h-8 md:w-12 md:h-12" />
                          </div>
                          <div className="space-y-2 md:space-y-3">
                             <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-amber-950 leading-none">Подписать</h3>
                             <p className="text-xs md:text-sm text-amber-900/60 leading-relaxed font-serif italic">Подтверди верность законам Тортуги</p>
                          </div>
                          <button
                             onClick={() => setSigned(true)}
                             className={cn(
                                "w-full py-4 md:py-6 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase tracking-widest text-[10px] md:text-[11px] transition-all border-[6px] md:border-[8px] shadow-xl flex items-center justify-center gap-2 md:gap-3 relative overflow-hidden",
                                (signed || viewingArchiveId) 
                                   ? "bg-amber-500 border-[#3e2723]/10 text-amber-950 cursor-default shadow-inner" 
                                   : "bg-amber-500 border-[#3e2723]/10 text-slate-900 hover:bg-amber-400 active:scale-[0.98]"
                             )}
                          >
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 pointer-events-none" />
                             {(signed || viewingArchiveId) ? (
                                <>
                                   <Check className="w-4 h-4 md:w-5 md:h-5 relative z-10" />
                                   <span className="relative z-10">{viewingArchiveId ? "Обет Запечатан" : "Договор Скреплен"}</span>
                                </>
                             ) : (
                                <>
                                   <Feather className="w-4 h-4 md:w-5 md:h-5 relative z-10" />
                                   <span className="relative z-10">Поставить Подпись</span>
                                </>
                             )}
                          </button>
                          
                          {!viewingArchiveId && (
                            <button 
                              onClick={() => setConfirmAction({ type: 'reset' })}
                              className="text-[8px] md:text-[9px] font-black uppercase text-amber-900/40 hover:text-red-800 transition-colors"
                            >
                              Сбросить до шаблона
                            </button>
                          )}
                       </div>
                    </div>

                    {/* Pirate Dice Box */}
                    <div className="p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-[#f2e2ba] border-[8px] md:border-[12px] border-[#3e2723]/10 shadow-[20px_20px_60px_rgba(0,0,0,0.1)] relative overflow-hidden flex flex-col justify-center items-center text-center min-h-[400px] md:min-h-[520px]">
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40 pointer-events-none" />
                       
                       <div className="relative z-10 space-y-6 md:space-y-8 w-full flex flex-col items-center justify-center">
                          <div className="w-16 h-16 md:w-24 md:h-24 bg-white/40 border-4 border-amber-900/10 rounded-2xl md:rounded-3xl flex items-center justify-center text-amber-700 mx-auto shadow-inner shrink-0">
                             <Skull className="w-8 h-8 md:w-12 md:h-12" />
                          </div>
                          <div className="space-y-2 md:space-y-4 shrink-0">
                             <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-amber-950 leading-none">Кости Судьбы</h3>
                             <p className="text-sm md:text-base text-amber-900/60 leading-relaxed font-serif italic px-2 md:px-4">Для решения жарких споров</p>
                          </div>
                          
                          <div className="flex justify-center gap-6 md:gap-8 py-4 md:py-6 shrink-0">
                             <motion.div 
                                animate={dice.rolling ? { rotate: [0, 720, 0], scale: [1, 1.3, 1], y: [0, -30, 0] } : {}}
                                transition={{ duration: 0.8 }}
                                className="w-16 h-16 md:w-24 md:h-24 bg-white/60 text-amber-950 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-3xl md:text-5xl font-black shadow-inner border-2 md:border-4 border-amber-900/10"
                             >
                                {dice.d1}
                             </motion.div>
                             <motion.div 
                                animate={dice.rolling ? { rotate: [0, -720, 0], scale: [1, 1.3, 1], y: [0, -30, 0] } : {}}
                                transition={{ duration: 0.8 }}
                                className="w-16 h-16 md:w-24 md:h-24 bg-white/60 text-amber-950 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-3xl md:text-5xl font-black shadow-inner border-2 md:border-4 border-amber-900/10"
                             >
                                {dice.d2}
                             </motion.div>
                          </div>

                          <button
                             onClick={() => {
                                setDice({ ...dice, rolling: true });
                                setTimeout(() => {
                                  setDice({
                                    d1: Math.floor(Math.random() * 6) + 1,
                                    d2: Math.floor(Math.random() * 6) + 1,
                                    rolling: false
                                  });
                                }, 1000);
                             }}
                             disabled={dice.rolling}
                             className="w-full py-5 md:py-8 bg-amber-500 text-slate-950 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase tracking-widest text-xs md:text-sm hover:bg-amber-400 transition-all border-b-6 md:border-b-8 border-amber-700 active:border-b-0 active:translate-y-2 shadow-xl disabled:opacity-50 mt-2 md:mt-4 shrink-0"
                          >
                             {dice.rolling ? "Кости в воздухе..." : "Бросить Кости"}
                          </button>
                       </div>
                    </div>
                 </div>
              </motion.div>
           </AnimatePresence>

           {/* ARCHIVE SECTION - Moved outside for full-width centering */}
            {archive.length > 0 && (
              <div className="pt-12 md:pt-20 space-y-8 md:space-y-12 w-full max-w-7xl mx-auto">
               <div className="flex items-center gap-4 md:gap-10">
                  <div className="h-px flex-1 bg-amber-900/10" />
                  <h3 className="text-2xl md:text-4xl font-black uppercase tracking-[0.2em] text-amber-900/30 text-center">Архив Обязанностей</h3>
                  <div className="h-px flex-1 bg-amber-900/10" />
               </div>
               
               <div className="flex flex-col md:flex-row md:flex-wrap justify-center gap-6 md:gap-10">
                  {archive.map((entry) => (
                    <motion.div 
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setConfirmAction({ type: 'view', id: entry.id })}
                      className={cn(
                        "w-full sm:w-[calc(50%-1.25rem)] lg:w-[calc(33.33%-1.5rem)] xl:w-[calc(25%-2rem)] min-w-[280px] md:min-w-[320px] max-w-none md:max-w-[380px] p-6 md:p-8 bg-[#f2e2ba] border-[8px] md:border-[12px] border-[#3e2723]/10 rounded-[2rem] md:rounded-[3.5rem] shadow-xl relative overflow-hidden group transition-all cursor-pointer hover:shadow-2xl hover:-translate-y-2",
                        viewingArchiveId === entry.id ? "border-amber-600 bg-amber-50 shadow-inner" : "hover:border-amber-600/40"
                      )}
                    >
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-30 pointer-events-none" />
                       
                       <div className="absolute -top-6 -right-6 p-8 opacity-[0.04] group-hover:opacity-[0.1] transition-opacity rotate-12">
                          <Scroll className="w-24 h-24 md:w-[120px] md:h-[120px] text-amber-900" />
                       </div>

                       <div className="relative z-10 space-y-4 md:space-y-6">
                           <div className="flex justify-between items-center border-b-2 md:border-b-4 border-amber-900/10 pb-4 md:pb-5">
                              <div className="flex flex-col flex-1 mr-2 md:mr-4">
                                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-amber-900/40 leading-none mb-1 md:mb-2">Заголовок закона</span>
                                <span className="text-base md:text-lg font-black text-amber-950 uppercase line-clamp-1 group-hover:text-amber-900 transition-colors tracking-tighter">{entry.title || "Без названия"}</span>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmAction({ type: 'delete', id: entry.id });
                                }}
                                className="p-2 md:p-3 hover:bg-red-500/20 hover:text-red-700 text-amber-900/20 rounded-xl md:rounded-2xl transition-all"
                              >
                                <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                              </button>
                           </div>

                           <div className="space-y-3 min-h-[100px] md:min-h-[140px] py-1 md:py-2">
                              <div className="flex gap-2 md:gap-3 items-start md:items-center">
                                   <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-amber-600/40 shrink-0 mt-1.5 md:mt-0 group-hover:bg-amber-600 transition-colors shadow-sm" />
                                   <p className="text-xs md:text-[13px] font-bold text-amber-950/80 line-clamp-3 uppercase tracking-tight italic font-serif group-hover:text-amber-950">{entry.description}</p>
                              </div>
                           </div>

                           <div className="pt-4 md:pt-6 border-t-2 md:border-t-4 border-amber-900/10 flex justify-between items-center gap-2">
                              <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 bg-white/40 rounded-lg md:rounded-xl border border-amber-900/5 -ml-1 md:-ml-2 shrink-0">
                                <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 text-amber-700" />
                                <span className="text-[9px] md:text-[11px] font-black text-amber-900/80 tracking-wider">{new Date(entry.created_at).toLocaleDateString()}</span>
                              </div>
                           </div>
                       </div>

                       {/* Decorative corner */}
                       <div className="absolute top-3 left-3 md:top-4 md:left-4 w-2.5 h-2.5 md:w-3 md:h-3 bg-amber-900/10 rounded-full shadow-inner" />
                    </motion.div>
                  ))}
               </div>
             </div>
           )}
        </div>

        {/* Info Modal */}
        <AnimatePresence>
          {showInfo && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[500] flex items-center justify-center p-4 md:p-12"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-[#f2e2ba] border-[8px] md:border-[12px] border-[#3e2723]/20 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 max-w-2xl w-full relative overflow-hidden shadow-2xl"
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40 pointer-events-none" />
                
                <button 
                  onClick={() => setShowInfo(false)}
                  className="absolute top-4 right-4 md:top-6 md:right-6 p-2 md:p-3 text-amber-900/40 hover:text-red-700 transition-colors"
                >
                  <X className="w-6 h-6 md:w-8 md:h-8" />
                </button>

                <div className="relative z-10 space-y-6 md:space-y-8 mt-4 md:mt-0">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 bg-[#3e2723] rounded-2xl md:rounded-3xl flex items-center justify-center text-amber-500 shadow-xl border-4 border-amber-600/30">
                      <Shield className="w-8 h-8 md:w-10 md:h-10" />
                    </div>
                    <div>
                      <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-amber-900/40">О Кодексе</h4>
                      <h3 className="text-2xl md:text-4xl font-black text-amber-950 uppercase tracking-tighter">Законы Моря</h3>
                    </div>
                  </div>

                  <div className="space-y-4 md:space-y-6 text-amber-950/80 font-serif text-base md:text-lg leading-relaxed italic">
                    <p>Этот свиток — не просто бумага. Это клятва, связывающая сердца капитанов Тортуги. Здесь записаны правила, которые делают наше плавание мирным и радостным.</p>
                    <p>Соблюдай их, и твой трюм всегда будет полон дублонов, а в каюте будет царить уют!</p>
                  </div>

                  <button 
                    onClick={() => setShowInfo(false)}
                    className="w-full py-4 md:py-6 bg-amber-500 text-slate-900 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-sm md:text-base shadow-xl border-b-[6px] md:border-b-8 border-amber-700 active:border-b-0 active:translate-y-2 transition-all"
                  >
                    Принято, Капитан!
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {confirmAction && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[600] flex items-center justify-center p-4 md:p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-[#f2e2ba] border-[8px] md:border-[12px] border-[#3e2723]/20 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 max-w-md w-full relative overflow-hidden shadow-2xl text-center"
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40 pointer-events-none" />
                
                <div className="relative z-10 space-y-6 md:space-y-8">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-amber-500 rounded-2xl md:rounded-3xl flex items-center justify-center text-slate-900 mx-auto shadow-xl border-4 border-amber-600">
                    <Skull className="w-8 h-8 md:w-10 md:h-10" />
                  </div>
                  
                  <div className="space-y-3 md:space-y-4">
                    <h3 className="text-2xl md:text-3xl font-black text-amber-950 uppercase tracking-tighter leading-none">Вы уверены?</h3>
                    <p className="text-amber-900/70 font-serif italic text-base md:text-lg leading-relaxed">
                      {confirmAction.type === 'reset' && "Это действие сбросит все изменения и вернет кодекс к исходному шаблону."}
                      {confirmAction.type === 'view' && "Вы хотите просмотреть эту архивную запись? Текущие несохраненные изменения будут потеряны."}
                      {confirmAction.type === 'delete' && "Это действие навсегда удалит запись из архива. Пути назад не будет!"}
                      {confirmAction.type === 'seal' && "Запечатывание кодекса отправит его в архив и создаст новый шаблон для следующего дня."}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 md:gap-4">
                    <button 
                      onClick={() => {
                        if (confirmAction.type === 'reset') resetToTemplate();
                        if (confirmAction.type === 'view') viewArchive(confirmAction.id!);
                        if (confirmAction.type === 'delete') deleteFromArchive(confirmAction.id!);
                        if (confirmAction.type === 'seal') saveToArchive();
                      }}
                      className="w-full py-4 md:py-5 bg-amber-500 text-slate-900 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-sm md:text-base shadow-xl border-b-[6px] md:border-b-8 border-amber-700 active:border-b-0 active:translate-y-2 transition-all"
                    >
                      Да, Капитан!
                    </button>
                    <button 
                      onClick={() => setConfirmAction(null)}
                      className="w-full py-4 md:py-5 bg-white/40 text-amber-900 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-sm md:text-base hover:bg-white/60 transition-all"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 15s linear infinite; }
      `}</style>
    </div>
  );
}
