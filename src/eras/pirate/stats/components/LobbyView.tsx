import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Skull, Gem, Play } from 'lucide-react';
import { cn } from "@/lib/utils";
import { FloatingParticles } from './FloatingParticles';
import { WinnerModal } from './WinnerModal';
import { QUIZ_QUESTIONS, ALL_ISLANDS } from '../constants';
import { ViewProps } from '../types';

export const LobbyView = ({
  quizState,
  currentUser,
  spaceConfig,
  profiles,
  setView,
  selectedIsland,
  activeRound,
  setActiveRound,
  setActiveQuestonIndex,
  islandQuestions,
  hasFilledTruths,
  isRoundLocked,
  onSwitchUser
}: ViewProps) => {
  const [showWinnerModal, setShowWinnerModal] = React.useState(false);
  const [hasShownModal, setHasShownModal] = React.useState(false);
  const island = ALL_ISLANDS[selectedIsland];

  const calculateScore = () => {
    let gScore = 0;
    let cScore = 0;
    if (!quizState.userTruths) return { gScore, cScore };

    islandQuestions.forEach(q => {
      const a1 = quizState.Grinch?.find(a => a.questionId === q.id);
      const a2 = quizState.Cindy?.find(a => a.questionId === q.id);
      const t1 = quizState.userTruths.Grinch?.[q.id];
      const t2 = quizState.userTruths.Cindy?.[q.id];

      if (a1 && t2 && a1.answer === t2) gScore++;
      if (a2 && t1 && a2.answer === t1) cScore++;
    });
    return { gScore, cScore };
  };

  const { gScore, cScore } = calculateScore();

  // Проверка завершения всех раундов на острове
  React.useEffect(() => {
    if (hasShownModal) return;

    const allFinished = [0, 1, 2].every(idx => {
      const roundQs = islandQuestions.slice(idx * 6, idx * 6 + 6);
      const gFinished = roundQs.every(q => quizState.Grinch?.find(a => a.questionId === q.id));
      const cFinished = roundQs.every(q => quizState.Cindy?.find(a => a.questionId === q.id));
      return gFinished && cFinished;
    });

    if (allFinished) {
      setTimeout(() => setShowWinnerModal(true), 1000);
      setHasShownModal(true);
    }
  }, [quizState, islandQuestions, hasShownModal]);

  const rounds = [0, 1, 2];

  const canPlayRound = (r: number) => {
    if (isRoundLocked(r)) return false;
    const partnerId = currentUser === 'Grinch' ? 'Cindy' : 'Grinch';
    const myTruthReady = hasFilledTruths(currentUser as 'Grinch' | 'Cindy', r);
    const partnerTruthReady = hasFilledTruths(partnerId, r);
    
    const roundQs = islandQuestions.slice(r * 6, r * 6 + 6);
    const iFinished = currentUser ? roundQs.every(q => quizState[currentUser]?.find(a => a.questionId === q.id)) : false;
    
    // Блокируем если я не стартер и стартер еще не готов
    const roundStarter = r % 2 === 0 ? 'Cindy' : 'Grinch';
    if (currentUser !== roundStarter && !partnerTruthReady && !myTruthReady) return false;
    
    return !myTruthReady || (partnerTruthReady && !iFinished);
  };

  const firstPlayableRound = rounds.find(r => canPlayRound(r));
  const isPlayDisabled = firstPlayableRound === undefined;

  const getRoundStatusForUser = (roundIdx: number, userId: 'Grinch' | 'Cindy') => {
    const start = roundIdx * 6;
    const questions = islandQuestions.slice(start, start + 6);
    const partnerId = userId === 'Grinch' ? 'Cindy' : 'Grinch';
    
    return questions.map(q => {
      const myAns = quizState[userId]?.find(a => a.questionId === q.id);
      const partnerTruth = quizState.userTruths?.[partnerId]?.[q.id];
      
      if (!myAns) return 'empty';
      if (!partnerTruth) return 'waiting';
      return myAns.answer === partnerTruth ? 'correct' : 'incorrect';
    });
  };

  const p1Name = spaceConfig?.partner1_name || 'Гринч';
  const p2Name = (spaceConfig?.partner2_name || 'Синди').replace(' Лу', '');

  return (
    <div className="relative min-h-screen bg-[#f4ebd0] text-stone-900 font-serif overflow-x-hidden selection:bg-amber-500/30">
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/papyrus.png')] opacity-60" />
         <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-transparent to-amber-900/20" />
         
         <FloatingParticles />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col min-h-screen pt-4 pb-10 px-6">
        <div className="flex flex-col items-center mb-10 mt-2">
           <div className="w-full flex items-center mb-12">
              <motion.button 
                whileHover={{ scale: 1.1, x: -4 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setView('dashboard')} 
                className="p-4 rounded-2xl bg-[#f2e2ba] border-[6px] border-[#3e2723]/10 text-amber-950 hover:bg-amber-100 transition-all shadow-xl mr-auto group relative overflow-hidden"
              >
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-30 pointer-events-none" />
                 <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform relative z-10" />
              </motion.button>
              
              <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                 <h1 className="text-3xl md:text-5xl font-black text-amber-950 tracking-tighter uppercase leading-none drop-shadow-sm">
                    Битва <span className="text-red-700">Сердец</span>
                 </h1>
                 <div className="h-1.5 w-32 bg-amber-900/10 mt-3 rounded-full" />
              </div>
              
              <div className="w-16" />
           </div>

           <div className="w-full flex items-center justify-around py-2 max-w-3xl">
              <div 
                className={cn(
                  "flex flex-col items-center gap-4 group transition-all duration-300",
                  currentUser === 'Grinch' ? "scale-110 opacity-100" : "scale-90 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 cursor-pointer"
                )}
                onClick={() => onSwitchUser?.('Grinch')}
              >
                 <motion.div 
                   whileHover={{ scale: 1.1, rotate: -3 }}
                   className="relative"
                 >
                    <div className={cn(
                      "w-28 h-28 rounded-[2.5rem] border-[10px] bg-[#f2e2ba] flex items-center justify-center overflow-hidden transition-all relative",
                      currentUser === 'Grinch' ? "border-emerald-500/30 shadow-2xl" : "border-[#3e2723]/10"
                    )}>
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-30 pointer-events-none" />
                       {(profiles['Grinch']?.avatar_url && profiles['Grinch']?.avatar_url.length > 5) || (spaceConfig?.partner1_avatar && spaceConfig?.partner1_avatar.length > 5) ? (
                          <img src={profiles['Grinch']?.avatar_url || spaceConfig?.partner1_avatar} alt="G" className="w-full h-full object-cover rounded-[2.2rem] p-1.5 relative z-10" />
                       ) : (
                          <Skull size={48} className="text-emerald-600 opacity-80 animate-pulse relative z-10" />
                       )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-2xl bg-emerald-500 border-4 border-[#f4ebd0] flex items-center justify-center shadow-lg z-20">
                       <span className="text-[10px] font-black text-white">G</span>
                    </div>
                 </motion.div>
                 <span className="text-xs font-black text-emerald-600 uppercase tracking-[0.3em]">{p1Name}</span>
              </div>

              <div className="flex flex-col items-center">
                 <div className="text-7xl font-black tracking-tighter flex items-center gap-6 text-amber-950">
                    <span className="text-emerald-600 drop-shadow-sm">{gScore}</span>
                    <span className="text-amber-900/10 text-5xl">-</span>
                    <span className="text-rose-600 drop-shadow-sm">{cScore}</span>
                 </div>
                 <div className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-900/30 mt-4">Текущий счет</div>
              </div>

              <div 
                className={cn(
                  "flex flex-col items-center gap-4 group transition-all duration-300",
                  currentUser === 'Cindy' ? "scale-110 opacity-100" : "scale-90 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 cursor-pointer"
                )}
                onClick={() => onSwitchUser?.('Cindy')}
              >
                 <motion.div 
                   whileHover={{ scale: 1.1, rotate: 3 }}
                   className="relative"
                 >
                    <div className={cn(
                      "w-28 h-28 rounded-[2.5rem] border-[10px] bg-[#f2e2ba] flex items-center justify-center overflow-hidden transition-all relative",
                      currentUser === 'Cindy' ? "border-rose-500/30 shadow-2xl" : "border-[#3e2723]/10"
                    )}>
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-30 pointer-events-none" />
                       {(profiles['Cindy']?.avatar_url && profiles['Cindy']?.avatar_url.length > 5) || (spaceConfig?.partner2_avatar && spaceConfig?.partner2_avatar.length > 5) ? (
                          <img src={profiles['Cindy']?.avatar_url || spaceConfig?.partner2_avatar} alt="C" className="w-full h-full object-cover rounded-[2.2rem] p-1.5 relative z-10" />
                       ) : (
                          <Gem size={48} className="text-rose-600 opacity-80 animate-pulse relative z-10" />
                       )}
                    </div>
                    <div className="absolute -bottom-1 -left-1 w-10 h-10 rounded-2xl bg-rose-500 border-4 border-[#f4ebd0] flex items-center justify-center shadow-lg z-20">
                       <span className="text-[10px] font-black text-white">C</span>
                    </div>
                 </motion.div>
                 <span className="text-xs font-black text-rose-600 uppercase tracking-[0.3em]">{p2Name}</span>
              </div>
           </div>
        </div>

        <div className="flex-1 space-y-4 px-2 mt-4">
           <div className="flex items-center gap-6 mb-6">
              <div className="h-1 flex-1 bg-amber-900/5 rounded-full" />
              <span className="text-[11px] font-black uppercase tracking-[0.6em] text-amber-900/30">Этапы Испытаний</span>
              <div className="h-1 flex-1 bg-amber-900/5 rounded-full" />
           </div>

           {rounds.map((idx) => {
              const locked = isRoundLocked(idx);
              const gResults = getRoundStatusForUser(idx, 'Grinch');
              const cResults = getRoundStatusForUser(idx, 'Cindy');
              const partnerId = currentUser === 'Grinch' ? 'Cindy' : 'Grinch';
              
              const myTruthReady = hasFilledTruths(currentUser as 'Grinch' | 'Cindy', idx);
              const partnerTruthReady = hasFilledTruths(partnerId, idx);
              
              const roundQuestions = islandQuestions.slice(idx * 6, idx * 6 + 6);
              const iHaveFinishedRound = currentUser ? roundQuestions.every(q => quizState[currentUser as 'Grinch' | 'Cindy']?.find(a => a.questionId === q.id)) : false;
              
              const gTruthReady = hasFilledTruths('Grinch', idx);
              const cTruthReady = hasFilledTruths('Cindy', idx);

              const roundStarter = idx % 2 === 0 ? 'Cindy' : 'Grinch';
              const starterName = roundStarter === 'Grinch' ? p1Name : p2Name;
              const iAmStarter = currentUser === roundStarter;

              let statusText = island.title;
              let statusColor = "text-amber-950/60";
              let isMyTurn = false;

              if (locked) {
                statusText = "СКРЫТО";
                statusColor = "text-amber-900/20";
              } else if (!myTruthReady) {
                if (!iAmStarter && !partnerTruthReady) {
                  statusText = `ЖДЕМ ${starterName.toUpperCase()}`;
                  statusColor = "text-blue-600/40";
                  isMyTurn = false;
                } else {
                  statusText = "ТВОЙ ХОД: ПОДГОТОВКА";
                  statusColor = "text-amber-600 animate-pulse";
                  isMyTurn = true;
                }
              } else if (!partnerTruthReady) {
                statusText = "ЖДЕМ ПАРТНЕРА";
                statusColor = "text-blue-600/40";
              } else if (!iHaveFinishedRound) {
                statusText = "ТВОЙ ХОД: БИТВА";
                statusColor = "text-emerald-600 animate-pulse";
                isMyTurn = true;
              } else {
                const partnerFinished = roundQuestions.every(q => quizState[partnerId]?.find(a => a.questionId === q.id));
                if (!partnerFinished) {
                  statusText = "ЖДЕМ ХОД ПАРТНЕРА";
                  statusColor = "text-blue-600/20";
                } else {
                  statusText = "РАУНД ЗАВЕРШЕН";
                  statusColor = "text-amber-900/30";
                }
              }

              return (
                 <motion.div 
                   key={idx}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className={cn(
                     "w-full rounded-[2.5rem] p-4 flex items-center gap-6 transition-all border-[8px] relative overflow-hidden",
                     locked ? "bg-amber-900/5 border-transparent opacity-50 grayscale-[0.5]" : 
                     isMyTurn ? "bg-[#f2e2ba] border-amber-500/30 shadow-2xl scale-[1.01]" :
                     "bg-[#f2e2ba] border-[#3e2723]/10 hover:border-amber-500/10 shadow-lg"
                   )}
                 >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 pointer-events-none" />
                    
                    <div className="grid grid-cols-3 gap-1.5 w-24 relative z-10">
                       {gResults.map((res, i) => (
                          <div key={i} className={cn(
                             "w-full h-7 rounded-lg border-2 transition-all duration-500", 
                             res === 'correct' ? "bg-emerald-500 border-emerald-600 shadow-sm" : 
                             res === 'incorrect' ? "bg-rose-500 border-rose-600 shadow-sm" : 
                             res === 'waiting' ? "bg-amber-500/20 border-amber-500/30 animate-pulse" :
                             "bg-amber-900/5 border-amber-900/5"
                          )} />
                       ))}
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                       {!locked && !myTruthReady && !partnerTruthReady && (
                         <div className="mb-1 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                            <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">
                               Начинает {starterName}
                            </span>
                         </div>
                       )}
                       <div className="text-[9px] font-black text-amber-900/20 uppercase tracking-[0.2em] mb-1">Раунд {idx + 1}</div>
                       <button 
                            disabled={locked}
                            onClick={() => {
                               if (!locked) {
                                  setActiveRound(idx);
                                  setActiveQuestonIndex(0);
                                  setView(myTruthReady ? 'game' : 'setup');
                               }
                            }}
                            className={cn(
                               "text-lg font-black uppercase tracking-tighter transition-all",
                               statusColor
                            )}
                         >
                            {statusText}
                         </button>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 w-24 relative z-10">
                       {cResults.map((res, i) => (
                          <div key={i} className={cn(
                             "w-full h-7 rounded-lg border-2 transition-all duration-500", 
                             res === 'correct' ? "bg-emerald-500 border-emerald-600 shadow-sm" : 
                             res === 'incorrect' ? "bg-rose-500 border-rose-600 shadow-sm" : 
                             res === 'waiting' ? "bg-amber-500/20 border-amber-500/30 animate-pulse" :
                             "bg-amber-900/5 border-amber-900/5"
                          )} />
                       ))}
                    </div>
                 </motion.div>
              );
           })}
        </div>

        <motion.button 
          whileHover={!isPlayDisabled ? { scale: 1.02, y: -2 } : {}}
          whileTap={!isPlayDisabled ? { scale: 0.98, y: 0 } : {}}
          disabled={isPlayDisabled}
          onClick={() => {
             if (firstPlayableRound !== undefined) {
                setActiveRound(firstPlayableRound);
                setActiveQuestonIndex(0);
                const roundReady = hasFilledTruths(currentUser as 'Grinch' | 'Cindy', firstPlayableRound);
                setView(roundReady ? 'game' : 'setup');
             }
          }}
          className={cn(
             "mt-4 w-full py-6 rounded-[2rem] flex items-center justify-center gap-4 transition-all border-b-[8px] group relative overflow-hidden shrink-0",
             isPlayDisabled 
              ? "bg-amber-900/5 text-amber-900/20 border-amber-900/10 cursor-not-allowed" 
              : "bg-amber-500 text-white border-amber-800 shadow-[0_15px_40px_rgba(245,158,11,0.2)] hover:brightness-110"
          )}
        >
           {!isPlayDisabled && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 pointer-events-none" />}
           {isPlayDisabled ? (
             <div className="flex items-center gap-3 relative z-10">
                <div className="w-2 h-2 rounded-full bg-amber-900/20 animate-pulse" />
                <span className="text-xl font-black uppercase tracking-[0.2em]">Ждем партнера...</span>
             </div>
           ) : (
             <>
               <Play fill="currentColor" size={28} className="relative z-10 group-hover:scale-110 transition-transform" />
               <span className="text-2xl font-black uppercase tracking-[0.2em] relative z-10">Играть</span>
             </>
           )}
        </motion.button>

        <WinnerModal 
          isOpen={showWinnerModal}
          onClose={() => setShowWinnerModal(false)}
          gScore={gScore}
          cScore={cScore}
          p1Name={p1Name}
          p2Name={p2Name}
          islandTitle={island.title}
        />
      </div>
    </div>
  );
};
