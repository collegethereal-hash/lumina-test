'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, MessageSquare, Trash2, X, AlertTriangle } from 'lucide-react';
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: 'me' | 'partner';
  text: string;
  timestamp: Date;
  isSystem?: boolean;
}

export function PirateChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [userName, setUserName] = useState('Карим');
  const [partnerName, setPartnerName] = useState('Полина');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load history and detect user role
  useEffect(() => {
    // Basic role detection: if current user has Polina in localStorage, they are Polina
    const savedRole = localStorage.getItem('pirate_user_role');
    if (savedRole === 'Polina') {
      setUserName('Полина');
      setPartnerName('Карим');
    } else {
      setUserName('Карим');
      setPartnerName('Полина');
    }

    const savedChat = localStorage.getItem('pirate_live_chat');
    if (savedChat) {
      const parsed = JSON.parse(savedChat);
      setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
    } else {
      setMessages([{ 
        id: '1', 
        sender: 'partner', 
        text: 'Привет, любимый! Давай поиграем? Сегодня точно твой день! ✨', 
        timestamp: new Date() 
      }]);
    }

    // Live Sync: Listen for storage changes from another tab/device
    const handleStorage = (e: any) => {
      if (e.key === 'pirate_live_chat' && e.newValue) {
        const parsed = JSON.parse(e.newValue);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      }
    };

    window.addEventListener('storage', handleStorage as any);
    window.addEventListener('storage_sync' as any, handleStorage as any); // Custom event for same-tab sync
    return () => {
      window.removeEventListener('storage', handleStorage as any);
      window.removeEventListener('storage_sync' as any, handleStorage as any);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (textOverride?: string, isSystem = false) => {
    const text = textOverride || inputText;
    if (!text.trim()) return;
    
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'me',
      text: text,
      timestamp: new Date(),
      isSystem
    };
    
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    if (!textOverride) setInputText('');

    // Save to localStorage for sync
    localStorage.setItem('pirate_live_chat', JSON.stringify(updatedMessages));
    
    // Trigger custom event for same-tab sync (if needed)
    window.dispatchEvent(new Event('storage_sync'));
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.setItem('pirate_live_chat', JSON.stringify([]));
    window.dispatchEvent(new Event('storage_sync'));
    setShowClearConfirm(false);
  };

  // Expose role switch for testing
  const toggleRole = () => {
    const newRole = userName === 'Карим' ? 'Polina' : 'Karim';
    localStorage.setItem('pirate_user_role', newRole);
    window.location.reload();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white/40 rounded-[3rem] border-8 border-[#3e2723]/10 relative overflow-hidden shadow-2xl backdrop-blur-md">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 pointer-events-none" />
      
      {/* Header */}
      <div className="p-6 bg-[#3e2723] flex items-center justify-between relative z-20 shadow-lg px-8">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            <div className="w-10 h-10 rounded-full border-2 border-amber-500 bg-amber-100 flex items-center justify-center text-xl shadow-lg relative z-20">
              👨‍✈️
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-rose-400 bg-rose-50 flex items-center justify-center text-xl shadow-lg relative z-10">
              👩‍🦰
            </div>
          </div>
          <div className="flex flex-col">
            <h4 className="text-xs font-black text-white uppercase tracking-[0.2em]">Наш Чат</h4>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">В море вместе</span>
            </div>
          </div>
        </div>
        <button 
           onClick={() => setShowClearConfirm(true)}
           className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-rose-400/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all active:scale-95 group"
           title="Очистить чат"
         >
           <Trash2 size={18} className="group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* Messages area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-10"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex flex-col max-w-[85%] relative",
                msg.sender === 'me' ? "ml-auto items-end" : "mr-auto items-start",
                msg.isSystem && "max-w-full w-full items-center"
              )}
            >
              {msg.isSystem ? (
                <div className={cn(
                  "bg-amber-500/10 border-4 rounded-2xl px-6 py-3 text-center transition-all",
                  msg.text.includes('Карим') ? "border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]" : "border-rose-400/40 shadow-[0_0_15px_rgba(251,113,133,0.1)]"
                )}>
                   <p className="text-[10px] font-black text-amber-900/40 uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
                     <Sparkles size={10} /> Кодекс Чести <Sparkles size={10} />
                   </p>
                   <p className="text-sm font-serif italic text-amber-950 font-bold break-all whitespace-pre-wrap">{msg.text}</p>
                </div>
              ) : (
                <>
                  <div className={cn(
                    "p-5 rounded-[2rem] text-sm font-serif italic shadow-lg border-4 relative overflow-hidden transition-all w-full",
                    msg.sender === 'me' 
                      ? (userName === 'Карим' 
                          ? "bg-[#3e2723] text-white border-amber-600/50 rounded-tr-none shadow-amber-900/40" 
                          : "bg-rose-900 text-rose-50 border-rose-400/50 rounded-tr-none shadow-rose-950/40")
                      : (partnerName === 'Карим'
                          ? "bg-white text-amber-950 border-amber-600/30 rounded-tl-none shadow-amber-900/10"
                          : "bg-rose-50 text-rose-950 border-rose-400/30 rounded-tl-none shadow-rose-900/10")
                  )}>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-10 pointer-events-none" />
                    <span className="relative z-10 break-all whitespace-pre-wrap">{msg.text}</span>
                  </div>
                  <span className={cn(
                    "text-[8px] font-black uppercase tracking-widest mt-2 px-2",
                    (msg.sender === 'me' ? userName : partnerName) === 'Карим' ? "text-amber-700/60" : "text-rose-700/60"
                  )}>
                    {msg.sender === 'me' ? userName : partnerName} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input area */}
      <div className="p-6 bg-[#3e2723]/5 border-t-4 border-[#3e2723]/10 relative z-10 backdrop-blur-xl">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Шепни что-нибудь..."
            className="flex-1 bg-white/80 border-4 border-[#3e2723]/5 rounded-[2rem] px-6 py-4 text-sm font-serif focus:outline-none focus:border-amber-500/50 transition-all shadow-inner placeholder:text-amber-900/30"
          />
          <button
            onClick={() => sendMessage()}
            className="w-14 h-14 bg-amber-500 text-slate-900 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-b-4 border-amber-700 group"
          >
            <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-amber-950/20 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full bg-white rounded-[2.5rem] p-8 shadow-2xl border-4 border-white relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-10 pointer-events-none" />
              
              <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-500 shadow-inner">
                  <AlertTriangle size={32} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-amber-950 uppercase tracking-tighter">Очистить чат?</h3>
                  <p className="text-sm font-serif italic text-amber-900/60 leading-relaxed">
                    «Все ваши послания исчезнут в пучине морской... Вы уверены, капитан?»
                  </p>
                </div>

                <div className="flex flex-col w-full gap-3">
                  <button
                    onClick={clearChat}
                    className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-rose-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} /> Да, в бездну!
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="w-full py-4 bg-amber-100 text-amber-950 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-200 transition-all active:scale-95"
                  >
                    Нет, оставить
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setShowClearConfirm(false)}
                className="absolute top-4 right-4 text-amber-900/20 hover:text-amber-900 transition-colors"
              >
                <X size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
