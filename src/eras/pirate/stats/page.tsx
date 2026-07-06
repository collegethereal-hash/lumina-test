'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useData } from '@/components/DataProvider';
import { QUIZ_QUESTIONS } from './constants';
import { QuizQuestion, IslandMode, QuizState, UserAnswer, ViewProps } from './types';
import { DashboardView } from './components/DashboardView';
import { LobbyView } from './components/LobbyView';
import { GameView } from './components/GameView';
import { SetupView } from './components/SetupView';
import { cn } from '@/lib/utils';
import { Anchor, Compass } from 'lucide-react';

export default function PirateStatsPage() {
  const { currentUser: dataUser, spaceConfig, profiles, refreshProfiles, refreshSpace } = useData();
  const [testUser, setTestUser] = useState<'Grinch' | 'Cindy' | null>(null);
  
  const currentUser = testUser || dataUser;

  const [view, setView] = useState<'dashboard' | 'lobby' | 'game' | 'setup'>('dashboard');
  const [selectedIsland, setSelectedIsland] = useState<IslandMode>('knowledge');
  const [quizState, setQuizState] = useState<QuizState>({ 
    Grinch: [], 
    Cindy: [], 
    userTruths: { Grinch: {}, Cindy: {} },
    lastUpdate: new Date().toISOString() 
  });
  const [activeQuestionIndex, setActiveQuestonIndex] = useState(0);
  const [activeRound, setActiveRound] = useState(0);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<{msg: string, type: 'info' | 'error' | 'success'}[]>([]);

  // Скрытие глобального меню навигации только во время активной игры или подготовки
  useEffect(() => {
    const handleNavbar = () => {
      // Ищем навигацию по классу z-[9999], так как это самый надежный способ найти PirateNavbar
      const navbar = document.querySelector('.z-\\[9999\\]');
      if (navbar instanceof HTMLElement) {
        if (view === 'dashboard') {
          navbar.style.display = 'block';
        } else {
          navbar.style.display = 'none';
        }
      }
    };

    // Небольшая задержка, чтобы Next.js успел отрендерить Navbar
    const timer = setTimeout(handleNavbar, 100);
    
    return () => {
      clearTimeout(timer);
      const navbar = document.querySelector('.z-\\[9999\\]');
      if (navbar instanceof HTMLElement) {
        navbar.style.display = 'block';
      }
    };
  }, [view]);

  const addLog = (msg: string, type: 'info' | 'error' | 'success' = 'info') => {
    setDebugLogs(prev => [...prev.slice(-4), { msg, type }]);
  };

  // Total questions for current island
  const islandQuestions = useMemo(() => {
    const filtered = QUIZ_QUESTIONS.filter(q => q.mode === selectedIsland);
    const day = new Date().getDate();
    return [...filtered].sort((a, b) => {
      const hashA = a.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + day;
      const hashB = b.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + day;
      return (hashA % 10) - (hashB % 10);
    });
  }, [selectedIsland]);

  // Questions for the current active round (6 questions per round)
  const activeQuestions = useMemo(() => {
    const start = activeRound * 6;
    return islandQuestions.slice(start, start + 6);
  }, [islandQuestions, activeRound]);

  const getRoundStatus = useCallback((roundIdx: number) => {
    const start = roundIdx * 6;
    const questions = islandQuestions.slice(start, start + 6);
    if (questions.length === 0) return 'empty';
    
    const allAnswered = questions.every(q => {
      const a1 = quizState.Grinch.find(a => a.questionId === q.id);
      const a2 = quizState.Cindy.find(a => a.questionId === q.id);
      return a1 && a2;
    });

    const anyAnswered = questions.some(q => {
      const a1 = quizState.Grinch.find(a => a.questionId === q.id);
      const a2 = quizState.Cindy.find(a => a.questionId === q.id);
      return a1 || a2;
    });

    if (allAnswered) return 'completed';
    if (anyAnswered) return 'in_progress';
    return 'locked';
  }, [islandQuestions, quizState]);

  const isRoundLocked = (roundIdx: number) => {
     if (roundIdx === 0) return false;
     return getRoundStatus(roundIdx - 1) !== 'completed';
   };

   const hasFilledTruths = useCallback((userId: 'Grinch' | 'Cindy', roundIdx: number) => {
     if (!quizState.userTruths?.[userId]) return false;
     const start = roundIdx * 6;
     const questions = islandQuestions.slice(start, start + 6);
     return questions.every(q => quizState.userTruths[userId][q.id]);
   }, [islandQuestions, quizState.userTruths]);

   const canIAnswerThisRound = useCallback((roundIdx: number) => {
     if (!currentUser) return false;

     const partnerId = currentUser === 'Grinch' ? 'Cindy' : 'Grinch';
     if (!hasFilledTruths(partnerId, roundIdx)) return false;

     return true;
   }, [currentUser, hasFilledTruths]);

   useEffect(() => {
     const fetchState = async () => {
       if (!spaceConfig?.id) return;
       try {
         const { data } = await supabase
           .from('global_state')
           .select('value')
           .eq('key', 'pirate_quiz_state')
           .maybeSingle();

         if (data && data.value) {
           setQuizState(data.value as QuizState);
         }
       } catch (e) {
         console.error(e);
       }
     };
     fetchState();

     const channel = supabase
       .channel('quiz_changes_v6')
       .on('postgres_changes', { 
         event: 'UPDATE', 
         schema: 'public', 
         table: 'global_state',
         filter: `key=eq.pirate_quiz_state` 
       }, (payload) => {
         if (payload.new && (payload.new as any).value) {
           setQuizState((payload.new as any).value as QuizState);
         }
       })
       .subscribe();

     return () => { channel.unsubscribe(); };
   }, [spaceConfig?.id]);

   const findNextUnansweredIndex = useCallback((questions: QuizQuestion[], state: QuizState, user: 'Grinch' | 'Cindy', mode: 'game' | 'setup') => {
     return questions.findIndex(q => {
       if (mode === 'setup') {
         return !state.userTruths?.[user]?.[q.id];
       } else {
         return !state[user]?.find(a => a.questionId === q.id);
       }
     });
   }, []);

   useEffect(() => {
     if (view === 'game' || view === 'setup') {
       const firstUnanswered = findNextUnansweredIndex(activeQuestions, quizState, currentUser as 'Grinch' | 'Cindy', view);
       if (firstUnanswered !== -1) {
         setActiveQuestonIndex(firstUnanswered);
       } else if (activeQuestionIndex >= activeQuestions.length) {
         setActiveQuestonIndex(0);
       }
     }
   }, [view, activeRound, currentUser, findNextUnansweredIndex]);

   const handleAnswer = async (option: string) => {
     if (!currentUser || isAnswering) return;
     setIsAnswering(true);

     const questionId = activeQuestions[activeQuestionIndex].id;
     const newAnswer: UserAnswer = {
       questionId,
       answer: option,
       timestamp: new Date().toISOString()
     };

     const newState = { 
       ...quizState,
       [currentUser]: [
         ...(quizState[currentUser as 'Grinch' | 'Cindy'] || []).filter(a => a.questionId !== questionId),
         newAnswer
       ],
       lastUpdate: new Date().toISOString()
     };

     setQuizState(newState);

     try {
       await supabase.from('global_state').upsert({
         key: 'pirate_quiz_state',
         value: newState,
         space_id: spaceConfig?.id
       });

       setTimeout(() => {
         const nextUnanswered = findNextUnansweredIndex(activeQuestions, newState, currentUser as 'Grinch' | 'Cindy', 'game');
         if (nextUnanswered !== -1) {
           setActiveQuestonIndex(nextUnanswered);
         } else {
           // Если все ответили в раунде, выходим в лобби
           setView('lobby');
         }
         setIsAnswering(false);
       }, 800);
     } catch (e) {
       console.error(e);
       setIsAnswering(false);
     }
   };

   const handleSaveTruth = async (questionId: string, option: string) => {
     if (!currentUser || isAnswering) return;
     setIsAnswering(true);
     
     const currentTruths = quizState.userTruths || { Grinch: {}, Cindy: {} };
     const userTruths = currentTruths[currentUser as 'Grinch' | 'Cindy'] || {};

     const newState = {
       ...quizState,
       userTruths: {
         ...currentTruths,
         [currentUser]: {
           ...userTruths,
           [questionId]: option
         }
       },
       lastUpdate: new Date().toISOString()
     };

     setQuizState(newState);

     try {
       await supabase.from('global_state').upsert({
         key: 'pirate_quiz_state',
         value: newState,
         space_id: spaceConfig?.id
       });

       setTimeout(() => {
         const nextUnanswered = findNextUnansweredIndex(activeQuestions, newState, currentUser as 'Grinch' | 'Cindy', 'setup');
         if (nextUnanswered !== -1) {
           setActiveQuestonIndex(nextUnanswered);
         } else {
           const partnerId = currentUser === 'Grinch' ? 'Cindy' : 'Grinch';
           if (hasFilledTruths(partnerId, activeRound)) {
             setActiveQuestonIndex(0);
             setView('game');
           } else {
             setView('lobby');
           }
         }
         setIsAnswering(false);
       }, 200);
     } catch (e) {
       console.error(e);
       setIsAnswering(false);
     }
   };

   const handleAvatarUpload = useCallback(async (userId: 'Grinch' | 'Cindy', file: File) => {
    if (!spaceConfig?.id) {
      addLog('Ошибка: ID пространства не найден', 'error');
      return;
    }
    
    setIsUploading(userId);
    addLog(`Начало загрузки для ${userId}...`, 'info');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar_${userId}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('moments')
        .upload(filePath, file, { 
          cacheControl: '3600',
          upsert: true 
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('moments')
        .getPublicUrl(filePath);

      const field = userId === 'Grinch' ? 'partner1_avatar' : 'partner2_avatar';
      const { error: spaceError } = await supabase
        .from('spaces')
        .update({ [field]: publicUrl })
        .eq('id', spaceConfig.id);
        
      if (spaceError) throw spaceError;
      
      addLog('Готово! Сокровища обновлены', 'success');
      if (refreshSpace) await refreshSpace();
      
    } catch (e: any) {
      addLog(`Критическая ошибка: ${e.message}`, 'error');
    } finally {
      setIsUploading(null);
    }
  }, [spaceConfig?.id, refreshSpace]);

  const viewProps: ViewProps = {
    quizState,
    currentUser: currentUser as 'Grinch' | 'Cindy',
    spaceConfig,
    profiles,
    setView,
    selectedIsland,
    setSelectedIsland,
    activeRound,
    setActiveRound,
    activeQuestionIndex,
    setActiveQuestonIndex,
    handleAnswer,
    handleSaveTruth,
    handleAvatarUpload,
    isUploading,
    isAnswering,
    islandQuestions,
    activeQuestions,
    hasFilledTruths,
    isRoundLocked,
    canIAnswerThisRound,
    onSwitchUser: (userId: 'Grinch' | 'Cindy') => setTestUser(userId)
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-amber-100 font-serif overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10" />
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-red-950/20 via-[#0a0a0a] to-transparent" />
        <div className="absolute bottom-0 right-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_bottom_right,rgba(245,158,11,0.05)_0%,transparent_50%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-12 pb-32 space-y-12">
        
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="text-center md:text-left space-y-2">
              <h1 className="text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-amber-200 via-amber-500 to-amber-700 drop-shadow-lg">
                Черный Рынок
              </h1>
              <p className="text-amber-500/50 italic tracking-widest text-lg">"Золото не имеет запаха, пока ты не купишь на него ром!"</p>
           </div>

           <div className="flex flex-wrap justify-center items-center gap-4 bg-slate-950/80 p-4 rounded-3xl border-2 border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.1)] backdrop-blur-md">
              <div className="flex items-center gap-4 px-6 border-r border-amber-500/20">
                 <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20 shadow-inner">
                   <Coins size={24} />
                 </div>
                 <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/40">Казна</p>
                   <p className="text-3xl font-bold text-amber-400 leading-none">{gold}</p>
                 </div>
              </div>
              <div className="flex items-center gap-4 px-6">
                 <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 border border-blue-500/20 shadow-inner">
                   <Users size={24} />
                 </div>
                 <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-blue-500/40">Команда</p>
                   <p className="text-3xl font-bold text-blue-400 leading-none">{crew}</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Store Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3">
           {tabs.map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={cn(
                 "flex items-center gap-3 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all",
                 activeTab === tab.id 
                  ? "bg-amber-500 text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.4)] scale-105" 
                  : "bg-slate-900/50 text-amber-500/50 border border-amber-500/10 hover:bg-slate-800 hover:text-amber-400"
               )}
             >
               {tab.icon} <span>{tab.label}</span>
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
             className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
           >
              {(storeItems[activeTab as keyof typeof storeItems] || []).map((item) => {
                const isOwned = inventory.includes(item.id);

                return (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={cn(
                      "relative p-6 rounded-[2.5rem] border-4 flex flex-col justify-between transition-all group overflow-hidden pirate-wood cursor-pointer shadow-xl",
                      isOwned ? "border-emerald-500/30 opacity-70" : "border-amber-900/40 hover:border-amber-500/50 hover:shadow-[0_0_40px_rgba(245,158,11,0.2)]"
                    )}
                  >
                     <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors" />
                     
                     <div className="relative z-10 space-y-6">
                        <div className="w-24 h-24 bg-[#1a1a1a] rounded-full border-4 border-amber-900/50 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(0,0,0,0.8)] group-hover:scale-110 group-hover:border-amber-500/50 transition-all">
                          {item.icon}
                        </div>
                        
                        <div className="text-center space-y-2">
                           <h3 className="text-xl font-bold uppercase tracking-tight text-amber-100 leading-tight drop-shadow-md">{item.name}</h3>
                           <p className="text-xs text-amber-100/40 italic leading-relaxed h-12 line-clamp-2">"{item.desc}"</p>
                        </div>
                     </div>

                     <div className="relative z-10 mt-6 pt-6 border-t border-amber-500/10 flex items-center justify-between">
                        {isOwned ? (
                           <div className="w-full py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl font-black uppercase tracking-widest text-xs text-center flex justify-center items-center gap-2">
                             <Sparkles size={14}/> В арсенале
                           </div>
                        ) : (
                           <>
                             <div className="flex items-center gap-2 text-amber-400 font-bold text-xl">
                               <Coins size={20} /> {item.price}
                             </div>
                             <div className="p-3 bg-slate-800 rounded-xl text-amber-500/50 group-hover:text-amber-400 group-hover:bg-slate-700 transition-colors">
                               <Info size={20} />
                             </div>
                           </>
                        )}
                     </div>
                  </div>
                );
              })}
           </motion.div>
        </AnimatePresence>
      </div>

      {/* DETAILED ITEM MODAL (LORE & BUY) */}
      <AnimatePresence>
        {debugLogs.length > 0 && (
          <div className="fixed bottom-6 left-6 z-[10000] w-72 space-y-2 pointer-events-none">
            {debugLogs.map((log, i) => (
              <motion.div
                key={`${i}-${log.msg}`}
                initial={{ opacity: 0, x: -20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.8 }}
                className={cn(
                  "p-3 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 shadow-xl backdrop-blur-md pointer-events-auto",
                  log.type === 'error' ? "bg-red-500/90 border-red-400 text-white" :
                  log.type === 'success' ? "bg-emerald-500/90 border-emerald-400 text-white" :
                  "bg-amber-900/90 border-amber-800 text-amber-100"
                )}
              >
                {log.msg}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
