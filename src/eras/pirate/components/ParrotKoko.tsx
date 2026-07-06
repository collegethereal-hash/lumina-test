'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Sparkles } from 'lucide-react';
import { chatWithKoko } from '@/app/actions/koko';
import { cn } from '@/lib/utils';

interface ParrotKokoProps {
  /** Controlled mode: pass open/onClose to control from outside */
  open?: boolean;
  onClose?: () => void;
  /** Uncontrolled mode: render the trigger button + modal together */
  showTrigger?: boolean;
}

export function ParrotKoko({ open, onClose, showTrigger = true }: ParrotKokoProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'koko'; text: string }[]>([
    { role: 'koko', text: 'Привет! Я Коко, тут, чтобы выслушать и помочь разобраться. Что у тебя на сердце?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const isOpen = open !== undefined ? open : internalOpen;

  const handleClose = () => {
    if (onClose) onClose();
    else setInternalOpen(false);
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    const userMsg = message;
    setMessage('');
    const updatedChatWithUser = [...chat, { role: 'user' as const, text: userMsg }];
    setChat(updatedChatWithUser);
    setIsTyping(true);
    
    const response = await chatWithKoko(userMsg, undefined, 'shared', undefined, updatedChatWithUser as any);
    setChat(prev => [...prev, { role: 'koko' as const, text: response }]);
    setIsTyping(false);
  };

  return (
    <>
      {/* Trigger — only rendered in uncontrolled mode */}
      {showTrigger && open === undefined && (
        <motion.div 
          whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setInternalOpen(true)}
          className="relative cursor-pointer group"
        >
          <div className="w-24 h-24 rounded-[2rem] pirate-wood flex items-center justify-center border-4 border-amber-500/40 shadow-2xl overflow-hidden">
            <div className="text-6xl filter drop-shadow-2xl group-hover:rotate-6 transition-transform">🦜</div>
            <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 p-1.5 rounded-xl shadow-lg border-2 border-amber-200">
             <Sparkles size={14} />
          </div>
        </motion.div>
      )}

      {/* Parrot emoji for inline display (used in header card) */}
      {!showTrigger && (
        <span className="text-2xl select-none">🦜</span>
      )}

      {/* Modal — always rendered at top level via portal-like fixed */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4" style={{ isolation: 'isolate' }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-[#0a0705] border-2 border-amber-500/30 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
              style={{ height: '580px' }}
            >
              {/* Top gold line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

              {/* Header */}
              <div className="p-6 bg-amber-500/5 border-b border-amber-500/15 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl">🦜</div>
                  <div>
                    <h3 className="text-xl font-bold text-amber-100 leading-none">Коко</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/50 mt-0.5">
                      ИИ-терапевт
                    </p>
                  </div>
                </div>
                <button onClick={handleClose} className="text-amber-500/30 hover:text-amber-500 transition-colors p-2">
                  <X size={22} />
                </button>
              </div>

              {/* Chat area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {chat.map((msg, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i}
                    className={cn(
                      "max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-amber-500 text-slate-950 ml-auto rounded-tr-none" 
                        : "bg-[#1a100a] text-amber-100 rounded-tl-none border border-amber-500/10"
                    )}
                  >
                    {msg.text}
                  </motion.div>
                ))}
                {isTyping && (
                  <div className="bg-[#1a100a] text-amber-100 p-4 rounded-2xl rounded-tl-none border border-amber-500/10 w-16 flex gap-1 justify-center">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse [animation-delay:0.4s]" />
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-5 bg-black/20 border-t border-amber-500/10 shrink-0">
                <div className="relative">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Напиши Коко..."
                    className="w-full bg-[#0d0705] border border-amber-900/30 rounded-2xl px-5 py-3.5 text-amber-100 placeholder:text-amber-500/30 focus:border-amber-500/40 outline-none transition-all pr-14 text-sm"
                  />
                  <button 
                    onClick={handleSend}
                    className="absolute right-2 top-2 bottom-2 w-10 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
