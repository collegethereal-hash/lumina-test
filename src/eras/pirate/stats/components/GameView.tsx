import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock } from 'lucide-react';
import { cn } from "@/lib/utils";
import { FloatingParticles } from './FloatingParticles';
import { ViewProps } from '../types';

export const GameView = ({
  quizState,
  currentUser,
  setView,
  activeRound,
  activeQuestionIndex,
  setActiveQuestonIndex,
  handleAnswer,
  activeQuestions,
  isAnswering,
  canIAnswerThisRound
}: ViewProps) => {
  const currentQuestion = activeQuestions[activeQuestionIndex];
  const myAnswer = (currentUser && currentQuestion) ? quizState[currentUser as 'Grinch' | 'Cindy']?.find(a => a.questionId === currentQuestion.id) : null;
  const partnerId = currentUser === 'Grinch' ? 'Cindy' : 'Grinch';

  if (!currentQuestion) return null;

  return (
    <div className="fixed inset-0 z-[100000] bg-[#f4ebd0] text-stone-900 font-serif overflow-hidden selection:bg-amber-500/30">
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/papyrus.png')] opacity-60" />
         <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-transparent to-amber-900/20" />
         <FloatingParticles />
      </div>

      <motion.button 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setView('lobby')}
        className="absolute top-6 left-6 z-[100001] flex items-center gap-6 pl-2 pr-8 py-3 bg-[#f2e2ba] border-[6px] border-[#3e2723]/10 rounded-[3rem] transition-all duration-300 group shadow-xl relative overflow-hidden"
      >
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-30 pointer-events-none" />
         <div className="w-16 h-16 rounded-full bg-rose-600 border-2 border-rose-400/50 flex items-center justify-center text-white transition-all duration-300 shadow-lg shadow-rose-600/20 group-hover:rotate-90 relative z-10">
            <X size={32} strokeWidth={3} />
         </div>
         <div className="flex flex-col items-start relative z-10">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-900/40 group-hover:text-amber-900/60 transition-colors">Вернуться в</span>
            <span className="text-sm font-black uppercase tracking-[0.15em] text-amber-950 group-hover:text-rose-600 transition-colors">Экспедицию</span>
         </div>
      </motion.button>

      <div className="relative z-10 max-w-4xl mx-auto px-6 h-full flex flex-col pt-0">
        <div className="flex flex-col items-center shrink-0 -mt-10">
           <div className="flex items-center gap-4 mb-6">
              <div className="h-[2px] w-16 bg-amber-900/10" />
              <div className="px-10 py-3 bg-amber-500/10 border-2 border-amber-500/50 rounded-full text-amber-600 text-[13px] font-black uppercase tracking-[0.4em] shadow-sm">
                 Экспедиция
              </div>
              <div className="h-[2px] w-16 bg-amber-900/10" />
           </div>
           <p className="text-amber-900/40 text-[11px] font-black uppercase tracking-[0.3em] bg-amber-900/5 px-5 py-2 rounded-xl mb-10">
              Вопрос {activeQuestionIndex + 1} из {activeQuestions.length}
           </p>
        </div>

        <div className="flex-1 flex flex-col justify-start min-h-0 -mt-4">
          <AnimatePresence mode="wait">
             <motion.div
               key={currentQuestion.id}
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 1.1, y: -20 }}
               className="relative group w-full"
             >
                <div className="relative bg-[#f2e2ba] rounded-[4rem] p-12 md:p-20 shadow-2xl overflow-hidden w-full border-[12px] border-[#3e2723]/10">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-30 pointer-events-none" />
                  
                  <div className="flex justify-center mb-6">
                     <div className="px-8 py-2 bg-amber-500/10 rounded-2xl border-2 border-amber-500/20">
                        <span className="text-sm font-black text-amber-700 uppercase tracking-[0.3em]">
                           {currentQuestion.category}
                        </span>
                     </div>
                  </div>

                  <h2 className="text-3xl md:text-5xl font-black text-amber-950 leading-[1.05] text-center tracking-tighter uppercase italic relative z-10 max-w-[90%] mx-auto line-clamp-3">
                     {currentQuestion?.gameQuestion}
                  </h2>
                </div>
             </motion.div>
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-4 mt-12 w-full pb-10">
             {currentQuestion.options.map((option, idx) => {
                const isMyChoice = myAnswer?.answer === option;
                const partnerTruth = quizState.userTruths?.[partnerId as 'Grinch' | 'Cindy']?.[currentQuestion.id];
                const isCorrect = option === partnerTruth;
                const isTurn = canIAnswerThisRound(activeRound);

                // Состояния для подсветки
                const showResult = !!myAnswer;
                const isSelectedAndWrong = showResult && isMyChoice && !isCorrect;
                const isSelectedAndCorrect = showResult && isMyChoice && isCorrect;
                const isCorrectButNotSelected = showResult && !isMyChoice && isCorrect;

                return (
                  <motion.button
                    key={option}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={isTurn && !myAnswer ? { scale: 1.03, y: -5 } : {}}
                    whileTap={isTurn && !myAnswer ? { scale: 0.97 } : {}}
                    onClick={() => isTurn && handleAnswer(option)}
                    disabled={isAnswering || !!myAnswer || !isTurn}
                    className={cn(
                      "p-8 md:p-10 rounded-[2.5rem] border-[8px] transition-all duration-300 text-center relative overflow-hidden group min-h-[120px] flex items-center justify-center font-black text-xl md:text-2xl uppercase tracking-wider shadow-xl",
                      // Яркое закрашивание результатов
                      isSelectedAndCorrect && "bg-emerald-500 border-emerald-400 text-white shadow-[0_0_40px_rgba(16,185,129,0.3)] scale-105 z-10",
                      isSelectedAndWrong && "bg-rose-600 border-rose-500 text-white shadow-[0_0_40px_rgba(244,63,94,0.3)] scale-95",
                      isCorrectButNotSelected && "bg-emerald-500 border-emerald-400 text-white shadow-[0_0_40px_rgba(16,185,129,0.2)]",
                      // Базовые стили для невыбранных вариантов
                      !showResult && isMyChoice && "bg-amber-600 border-amber-700 text-white shadow-lg",
                      (!showResult || (!isMyChoice && !isCorrect)) && "bg-[#f2e2ba] border-[#3e2723]/10 text-amber-950",
                      !showResult && isTurn && !isMyChoice && "hover:border-amber-500/30 hover:bg-amber-50"
                    )}
                  >
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 pointer-events-none" />
                     <span className="relative z-10">{option}</span>
                  </motion.button>
                );
             })}
          </div>
        </div>

        <div className="shrink-0 mt-12 pb-20">
           <AnimatePresence mode="wait">
              {!canIAnswerThisRound(activeRound) && !myAnswer && (
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="w-full py-10 bg-[#f2e2ba] border-[8px] border-[#3e2723]/10 rounded-[3rem] flex flex-col items-center gap-3 shadow-xl relative overflow-hidden"
                 >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 pointer-events-none" />
                    <Lock size={32} className="text-amber-600 animate-pulse relative z-10" />
                    <span className="text-sm font-black uppercase tracking-[0.4em] text-amber-700 relative z-10">
                       Ждем Капитана {partnerId === 'Grinch' ? 'Гринча' : 'Синди'}
                    </span>
                 </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
