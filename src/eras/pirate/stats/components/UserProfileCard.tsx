import React, { useState, memo } from 'react';
import { User, RefreshCw, Camera, Anchor } from 'lucide-react';
import { cn } from "@/lib/utils";

export const UserProfileCard = memo(({ userId, name, stats, color, isUploading, onUpload, avatarUrl }: any) => {
  const [hoveredStat, setHoveredStat] = useState<'totalAnswers' | 'matches' | 'wins'>('wins');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(userId, file);
    e.target.value = '';
  };

  return (
    <div className="relative w-full h-full group/card">
      <input 
        type="file" 
        id={`avatar-upload-${userId}`}
        className="hidden" 
        accept="image/*"
        onChange={handleFileChange}
      />
      
      <div 
        onClick={() => document.getElementById(`avatar-upload-${userId}`)?.click()}
        className={cn(
          "bg-[#f2e2ba] rounded-[4rem] p-10 border-[12px] shadow-2xl flex flex-col items-center text-center space-y-12 relative overflow-hidden cursor-pointer min-h-[580px] justify-center transition-all duration-300",
          color === 'emerald' ? "border-[#3e2723]/10 hover:border-emerald-500/30 hover:shadow-emerald-500/10" : "border-[#3e2723]/10 hover:border-rose-500/30 hover:shadow-rose-500/10"
        )}
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40 pointer-events-none" />
        <div className={cn(
          "absolute top-0 inset-x-0 h-48 opacity-10 blur-3xl pointer-events-none transition-opacity duration-500",
          color === 'emerald' ? "bg-emerald-500" : "bg-rose-500"
        )} />

        <div className="relative pointer-events-none">
          <div className={cn(
            "w-52 h-52 rounded-[3.5rem] flex items-center justify-center shadow-lg relative z-10 overflow-hidden border-4 border-amber-900/10 transition-transform duration-500 group-hover/card:scale-105",
            color === 'emerald' ? "bg-emerald-50/40" : "bg-rose-50/40"
          )}>
            {isUploading === userId ? (
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="animate-spin text-amber-600" size={32} />
                <span className="text-[8px] font-black uppercase text-amber-600">Загрузка...</span>
              </div>
            ) : avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 p-6">
                <User size={48} className="text-stone-300" />
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Выбрать аватар</span>
              </div>
            )}
          </div>
          <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
             <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full border border-white/40">
                <Camera size={24} className="text-white" />
             </div>
          </div>
        </div>

        <div className="space-y-6 pointer-events-none">
           <div className={cn(
             "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg inline-block transition-transform duration-500 group-hover/card:translate-y-[-4px]",
             color === 'emerald' ? "bg-emerald-500" : "bg-rose-500"
           )}>
             Уровень: {stats.level}
           </div>
           <div className="pt-4">
              <h3 className="text-5xl font-black text-amber-950 uppercase tracking-tighter leading-none transition-colors duration-500 group-hover/card:text-amber-900">{name}</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-900/30 mt-4">Капитан Корабля</p>
           </div>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full pt-8 relative z-30" onMouseLeave={() => setHoveredStat('wins')}>
           <div 
             onMouseEnter={() => setHoveredStat('totalAnswers')}
             className={cn(
               "flex flex-col items-center p-5 rounded-[2rem] border-b-4 transition-all duration-300 cursor-default",
               hoveredStat === 'totalAnswers' 
                ? (color === 'emerald' ? "bg-emerald-500 border-emerald-700 text-white shadow-lg scale-105" : "bg-rose-500 border-rose-700 text-white shadow-lg scale-105")
                : "bg-amber-900/5 border-[#3e2723]/10 text-amber-950"
             )}
             onClick={(e) => e.stopPropagation()}
           >
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest mb-2 transition-colors",
                hoveredStat === 'totalAnswers' ? "text-white/60" : "text-amber-900/40"
              )}>Ответы</span>
              <span className="text-3xl font-black tabular-nums">{stats.totalAnswers}</span>
           </div>

           <div 
             onMouseEnter={() => setHoveredStat('matches')}
             className={cn(
               "flex flex-col items-center p-5 rounded-[2rem] border-b-4 transition-all duration-300 cursor-default",
               hoveredStat === 'matches'
                ? (color === 'emerald' ? "bg-emerald-500 border-emerald-700 text-white shadow-lg scale-105" : "bg-rose-500 border-rose-700 text-white shadow-lg scale-105")
                : "bg-amber-900/5 border-[#3e2723]/10 text-amber-950"
             )}
             onClick={(e) => e.stopPropagation()}
           >
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest mb-2 transition-colors",
                hoveredStat === 'matches' ? "text-white/60" : "text-amber-900/40"
              )}>Совпадения</span>
              <span className="text-3xl font-black tabular-nums">{stats.matches}</span>
           </div>

           <div 
             onMouseEnter={() => setHoveredStat('wins')}
             className={cn(
               "flex flex-col items-center p-5 rounded-[2rem] border-b-4 transition-all duration-300 cursor-default",
               hoveredStat === 'wins'
                ? (color === 'emerald' ? "bg-emerald-500 border-emerald-700 text-white shadow-lg scale-105" : "bg-rose-500 border-rose-700 text-white shadow-lg scale-105")
                : "bg-amber-900/5 border-[#3e2723]/10 text-amber-950"
             )}
             onClick={(e) => e.stopPropagation()}
           >
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest mb-2 transition-colors",
                hoveredStat === 'wins' ? "text-white/60" : "text-amber-900/40"
              )}>Победы</span>
              <span className="text-3xl font-black tabular-nums">{stats.wins}</span>
           </div>
        </div>

        <div className="absolute -bottom-20 -right-10 opacity-[0.03] rotate-12 pointer-events-none transition-transform duration-700 group-hover/card:rotate-45 group-hover/card:scale-110">
           <Anchor size={200} className="text-amber-900" />
        </div>
      </div>
    </div>
  );
});

UserProfileCard.displayName = 'UserProfileCard';
