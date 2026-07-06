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
    <>
      {view === 'dashboard' && <DashboardView {...viewProps} />}
      {view === 'lobby' && <LobbyView {...viewProps} />}
      {view === 'game' && <GameView {...viewProps} />}
      {view === 'setup' && <SetupView {...viewProps} />}

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
