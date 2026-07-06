import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Map, ChevronRight, Users } from 'lucide-react';
import { cn } from "@/lib/utils";
import { UserProfileCard } from './UserProfileCard';
import { DailyTimer } from './DailyTimer';
import { QUIZ_QUESTIONS, ALL_ISLANDS } from '../constants';
import { ViewProps, IslandMode } from '../types';

export const DashboardView = ({ 
  quizState, 
  currentUser, 
  spaceConfig, 
  profiles, 
  setView, 
  setSelectedIsland,
  isUploading,
  handleAvatarUpload,
  onSwitchUser 
}: ViewProps) => {
  const getStats = (userId: 'Grinch' | 'Cindy') => {
    const answers = quizState?.[userId] || [];
    const totalAnswers = answers.length;
    
    const matches = QUIZ_QUESTIONS.filter(q => {
      const a1 = quizState?.Grinch?.find(a => a.questionId === q.id);
      const a2 = quizState?.Cindy?.find(a => a.questionId === q.id);
      const t1 = quizState?.userTruths?.Grinch?.[q.id];
      const t2 = quizState?.userTruths?.Cindy?.[q.id];
      
      // Match if both guessed right
      return a1 && t2 && a1.answer === t2 && a2 && t1 && a2.answer === t1;
    }).length;

    const wins = Math.floor(totalAnswers / 2) + (userId === 'Grinch' ? 2 : 5);
    const level = Math.floor(totalAnswers / 5) + 1;

    return { totalAnswers, matches, wins, level };
  };

  const grinchStats = getStats('Grinch');
  const cindyStats = getStats('Cindy');

  const p1Name = spaceConfig?.partner1_name || 'Гринч';
  const p2Name = (spaceConfig?.partner2_name || 'Синди').replace(' Лу', '');

  return (
    <div className="relative min-h-screen bg-[#f4ebd0] text-stone-900 font-serif overflow-x-hidden selection:bg-amber-500/30">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/papyrus.png')] opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-transparent to-amber-900/20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-12 pb-48 space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-4 border-amber-900/10 pb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-900/10 bg-white/40 px-4 py-2 shadow-sm backdrop-blur-sm">
              <Map size={14} className="text-amber-700/60" />
              <span className="text-[9px] font-black uppercase tracking-[0.32em] text-amber-900/45">Затерянные острова</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-amber-950 leading-none">
               Наши <span className="text-amber-600">Открытия</span>
            </h1>
            <p className="max-w-2xl text-sm md:text-base italic text-amber-900/55 whitespace-nowrap overflow-hidden text-ellipsis">
              Исследуйте острова откровений и собирайте золото общих воспоминаний.
            </p>
          </div>
          
          <div className="bg-[#f2e2ba] px-8 py-5 rounded-[2.5rem] shadow-xl flex items-center gap-6 border-[8px] border-[#3e2723]/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-30 pointer-events-none" />
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shadow-sm relative z-10 border-2 border-rose-500/20">
              <Heart size={32} strokeWidth={2.5} fill="currentColor" />
            </div>
            <div className="relative z-10">
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-900/40">Уровень связи</div>
              <div className="text-3xl font-black tabular-nums text-amber-950">100%</div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-12 space-y-12">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                   <div className="p-4 bg-[#f2e2ba] border-[6px] border-[#3e2723]/10 text-amber-800 rounded-2xl shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-30" />
                      <Map size={28} className="relative z-10" />
                   </div>
                   <div>
                      <h2 className="text-4xl font-black text-amber-950 uppercase tracking-tighter leading-none">Архипелаг <span className="text-amber-600">Откровений</span></h2>
                   </div>
                </div>
                <DailyTimer />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {Object.values(ALL_ISLANDS).map((island) => {
                  const islandQuestions = QUIZ_QUESTIONS.filter(q => q.mode === island.id);
                  const myUnanswered = islandQuestions.filter(q => !quizState[currentUser || 'Grinch']?.find(a => a.questionId === q.id));
                  const hasActiveGame = myUnanswered.length > 0;
                  const Icon = island.icon;

                  // Подсчет счета для конкретного острова
                  let islandGScore = 0;
                  let islandCScore = 0;
                  islandQuestions.forEach(q => {
                    const a1 = quizState.Grinch?.find(a => a.questionId === q.id);
                    const a2 = quizState.Cindy?.find(a => a.questionId === q.id);
                    const t1 = quizState.userTruths?.Grinch?.[q.id];
                    const t2 = quizState.userTruths?.Cindy?.[q.id];
                    if (a1 && t2 && a1.answer === t2) islandGScore++;
                    if (a2 && t1 && a2.answer === t1) islandCScore++;
                  });

                  // Проверка завершенности острова (все раунды закончены обоими)
                  const isIslandFinished = [0, 1, 2].every(idx => {
                    const roundQs = islandQuestions.slice(idx * 6, idx * 6 + 6);
                    const gFinished = roundQs.every(q => quizState.Grinch?.find(a => a.questionId === q.id));
                    const cFinished = roundQs.every(q => quizState.Cindy?.find(a => a.questionId === q.id));
                    return gFinished && cFinished;
                  });

                  return (
                    <motion.div 
                      key={island.id}
                      whileHover={{ y: -8 }}
                      onClick={() => {
                        setSelectedIsland(island.id as IslandMode);
                        setView('lobby');
                      }}
                      className="relative p-1 bg-[#3e2723]/5 rounded-[3rem] cursor-pointer group"
                    >
                      <div className="bg-[#f2e2ba] rounded-[2.8rem] p-10 border-[10px] border-[#3e2723]/10 group-hover:border-amber-500/30 transition-all h-full flex flex-col space-y-8 relative overflow-hidden">
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 pointer-events-none" />
                         {/* Отображение счета только если остров завершен, иначе - иконка */}
                         {isIslandFinished ? (
                           <div className="absolute bottom-10 right-10 flex items-center gap-1 select-none pointer-events-none transition-transform duration-700 group-hover:scale-110 origin-bottom-right z-10">
                              <span className="text-[64px] font-black text-emerald-500 group-hover:text-emerald-400 transition-colors leading-none tracking-tighter">{islandGScore}</span>
                              <span className="text-[24px] font-black text-amber-900/20 leading-none px-1 h-[64px] flex items-center">-</span>
                              <span className="text-[64px] font-black text-rose-500 group-hover:text-rose-400 transition-colors leading-none tracking-tighter">{islandCScore}</span>
                           </div>
                         ) : (
                           <div className="absolute bottom-2 right-10 text-amber-900/5 group-hover:scale-110 group-hover:text-amber-500/10 transition-all pointer-events-none">
                              <Icon size={140} />
                           </div>
                         )}

                         <div className="flex justify-between items-start relative z-10 gap-4">
                            <div className={cn(
                              "w-20 h-20 rounded-[1.5rem] flex items-center justify-center shadow-xl transition-all shrink-0 border-4 border-white/20 backdrop-blur-sm",
                              island.color === 'emerald' ? "bg-emerald-500 text-white group-hover:bg-emerald-400 group-hover:shadow-emerald-500/40" :
                              island.color === 'amber' ? "bg-amber-500 text-white group-hover:bg-amber-400 group-hover:shadow-amber-500/40" :
                              island.color === 'red' ? "bg-rose-500 text-white group-hover:bg-rose-400 group-hover:shadow-rose-500/40" :
                              "bg-orange-500 text-white group-hover:bg-orange-400 group-hover:shadow-orange-500/40"
                            )}>
                               <Icon size={36} strokeWidth={2.5} className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]" />
                            </div>
                            <div className={cn(
                               "px-8 py-4 rounded-2xl text-[14px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all border-b-8 relative overflow-hidden",
                               island.color === 'emerald' ? "bg-emerald-500 text-white border-emerald-800" :
                               island.color === 'amber' ? "bg-amber-500 text-white border-amber-800" :
                               island.color === 'red' ? "bg-rose-600 text-white border-rose-900" :
                               "bg-orange-500 text-white border-orange-800",
                               hasActiveGame && "animate-pulse scale-110"
                            )}>
                               <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                               <span className="relative z-10">{island.badge}</span>
                            </div>
                         </div>

                         <div className="space-y-3 flex-1 relative z-10">
                            <h3 className="text-2xl font-black uppercase tracking-tight text-amber-950">{island.title}</h3>
                            <p className="text-stone-600 font-serif italic leading-relaxed max-w-[220px]">{island.desc}</p>
                         </div>

                         <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-600 mt-auto">
                            <span>Исследовать остров</span>
                            <ChevronRight size={14} strokeWidth={3} />
                         </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="space-y-8 pt-12">
                 <div className="flex items-center gap-4">
                    <div className="p-4 bg-[#f2e2ba] border-[6px] border-[#3e2723]/10 text-amber-800 rounded-2xl shadow-lg relative overflow-hidden">
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-30 pointer-events-none" />
                       <Users size={28} className="relative z-10" />
                    </div>
                    <div>
                       <h2 className="text-4xl font-black text-amber-950 uppercase tracking-tighter leading-none">Командный <span className="text-amber-600">Состав</span></h2>
                       <p className="text-[10px] text-amber-900/30 font-black uppercase tracking-[0.4em] mt-2">Личные достижения капитанов</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div 
                      className="transition-all duration-300 scale-100 opacity-100 rounded-[4rem] shadow-2xl"
                      onClick={() => onSwitchUser?.('Grinch')}
                    >
                      <UserProfileCard 
                        userId="Grinch" 
                        name={p1Name} 
                        stats={grinchStats} 
                        color="emerald" 
                        isUploading={isUploading}
                        onUpload={handleAvatarUpload}
                        avatarUrl={profiles['Grinch']?.avatar_url || spaceConfig?.partner1_avatar}
                      />
                    </div>
                    <div 
                      className="transition-all duration-300 scale-100 opacity-100 rounded-[4rem] shadow-2xl"
                      onClick={() => onSwitchUser?.('Cindy')}
                    >
                      <UserProfileCard 
                        userId="Cindy" 
                        name={p2Name} 
                        stats={cindyStats} 
                        color="rose" 
                        isUploading={isUploading}
                        onUpload={handleAvatarUpload}
                        avatarUrl={profiles['Cindy']?.avatar_url || spaceConfig?.partner2_avatar}
                      />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
