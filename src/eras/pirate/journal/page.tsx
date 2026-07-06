'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book, Send, Sparkles, MessageCircle, 
  Trash2, Heart, Trees, Moon, Ship, 
  Sword, Scroll, Anchor, PenTool as Quill
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { supabase } from '@/lib/supabase';
import { useData } from '@/components/DataProvider';

import { Skeleton } from '@/components/Skeleton';

export default function PirateJournal() {
  const { currentUser, whispers, refreshWhispers, isLoading, isWhispersLoading } = useData();
  const [newWhisper, setNewWhisper] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!newWhisper.trim() || !currentUser) return;
    setIsSending(true);

    try {
      // 1. Add to history
      await supabase.from('whisper_history').insert([{
        content: newWhisper,
        sender: currentUser,
        author: currentUser, // Добавлено обязательное поле
        receiver: currentUser === 'Grinch' ? 'Cindy' : 'Grinch'
      }]);

      // 2. Set global state for notification
      const key = currentUser === 'Grinch' ? 'whisper_for_cindy' : 'whisper_for_grinch';
      await supabase.from('global_state').upsert({ key, value: true });

      setNewWhisper('');
      await refreshWhispers();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#020617] text-amber-100 font-serif overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-10" />
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-transparent via-blue-950/10 to-black/40" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-16 pb-40 space-y-12">
        <header className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block p-4 bg-amber-400/10 rounded-full border-2 border-amber-400/20 shadow-2xl"
          >
            <Scroll size={48} className="text-amber-400" />
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-600">
            Судовой Журнал
          </h1>
          <p className="text-amber-200/50 italic text-lg">"Тайные депеши сквозь бури и шторма"</p>
        </header>

        {/* Input Area */}
        <div className="pirate-wood p-8 rounded-[3rem] border-amber-500/20 shadow-2xl space-y-6 relative overflow-hidden">
           <div className="absolute top-4 right-8 opacity-10"><Quill size={120} /></div>
           
           <div className="space-y-4 relative z-10">
              <h3 className="text-xl font-bold uppercase tracking-widest text-amber-400 flex items-center gap-3">
                <Anchor size={20} /> Написать письмо
              </h3>
              <div className="relative">
                <textarea
                  value={newWhisper}
                  onChange={(e) => setNewWhisper(e.target.value)}
                  placeholder="Твое секретное послание..."
                  className="w-full h-40 bg-black/40 border-4 border-amber-500/10 rounded-[2.5rem] p-8 focus:ring-0 focus:border-amber-400/40 transition-all text-xl italic text-amber-100 placeholder:text-amber-500/10 resize-none shadow-inner"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={isSending || !newWhisper.trim()}
                className="w-full py-5 bg-amber-400 text-slate-900 rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
              >
                {isSending ? 'Голубь летит...' : 'Отправить в бутылке'}
                <Send size={18} />
              </button>
           </div>
        </div>

        {/* History Area */}
        <div className="space-y-8">
           <div className="flex items-center gap-4 border-b-4 border-amber-500/10 pb-4">
              <MessageCircle className="text-amber-500" />
              <h2 className="text-2xl font-bold uppercase tracking-widest">Архив Шепотов</h2>
           </div>

           <div className="space-y-6">
              {(isLoading || isWhispersLoading) ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div 
                    key={`skeleton-whisper-${i}`}
                    className={cn(
                      "flex flex-col max-w-[85%] space-y-2",
                      i % 2 === 0 ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <Skeleton className="w-64 h-24 rounded-[2rem] bg-amber-500/5 border-2 border-amber-500/10" />
                    <Skeleton className="w-24 h-3 opacity-20" />
                  </div>
                ))
              ) : whispers.length > 0 ? (
                whispers.map((whisper) => (
                  <motion.div
                    key={whisper.id}
                    initial={{ opacity: 0, x: whisper.sender === currentUser ? 20 : -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className={cn(
                      "flex flex-col max-w-[85%] space-y-2",
                      whisper.sender === currentUser ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div className={cn(
                      "relative p-6 rounded-[2rem] border-2 shadow-xl",
                      whisper.sender === currentUser 
                        ? "bg-amber-400/10 border-amber-400/30 text-amber-100" 
                        : "bg-slate-900/60 border-amber-500/10 text-amber-200/80"
                    )}>
                      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] pointer-events-none" />
                      <p className="text-lg italic leading-relaxed relative z-10">"{whisper.content}"</p>
                      
                      <div className="absolute -bottom-1 -right-1 opacity-10">
                         {whisper.sender === 'Grinch' ? <Trees size={40} /> : <Moon size={40} />}
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 px-4">
                      {new Date(whisper.created_at).toLocaleDateString()} • {whisper.sender === 'Grinch' ? 'Гринч' : 'Синди'}
                    </span>
                  </motion.div>
                ))
              ) : (!isLoading && !isWhispersLoading && whispers.length === 0) ? (
                <div className="text-center py-20 opacity-20 italic">
                  <p className="text-2xl">Океан спокоен... Писем пока нет.</p>
                </div>
              ) : null}
           </div>
        </div>
      </div>
    </div>
  );
}
