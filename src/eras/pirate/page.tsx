'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Anchor, Shield, Hammer, Package, Beer, 
  CloudLightning, Scroll, Wind, Coins, CheckCircle2,
  Sparkles, Send, MessageCircle, RefreshCw, Trash2,
  User, Volume2, ShieldAlert, Settings, Flame, Trees
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/components/DataProvider';
import BayScene from '@/eras/pirate/components/BayScene';
import { chatWithKoko } from '@/app/actions/koko';
import type { AIModelType } from '@/lib/ai';

import { PirateAuth } from '@/eras/pirate/components/PirateAuth';

import { PirateNavbar } from '@/eras/pirate/components/PirateNavbar';
import { useEra } from '@/context/EraContext';

export default function PirateDashboard() {
  const { currentUser, spaceConfig, isLoading: isDataLoading } = useData();
  const { setEra } = useEra();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'koko'>('koko');
  
  const switchToTalia = async () => {
    await setEra('palia');
  };
  const [kokoMode, setKokoMode] = useState<'personal' | 'shared'>('shared');
  const [aiModel, setAiModel] = useState<AIModelType>('qwen/qwen3.5-122b-a10b');
  const [notification, setNotification] = useState<string | null>(null);
  
  // Переключатель: чат от лица Синди / чат от лица Гринча (только в shared mode)
  const [sharedChatPerspective, setSharedChatPerspective] = useState<'cindy' | 'grinch'>('cindy');
  
  // Определяем, какой пользователь сейчас
  const isCindy = currentUser === 'Cindy';
  const isGrinch = currentUser === 'Grinch';
  
  // Mounted check for Hydration-safe R3F Canvas
  const [isMounted, setIsMounted] = useState(false);

  // Economy
  const [gold, setGold] = useState(1500);

  // Coco Chatbot State
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'koko' | 'grinch' | 'cindy'; text: string; hidden?: boolean }[]>([
    { role: 'koko', text: 'Привет! Я Коко, тут, чтобы выслушать и помочь разобраться. Что у тебя на сердце?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  // Sync data on mount and focused screen
  useEffect(() => {
    setIsMounted(true);
    
    // Set background color to match the pirate theme parchment
    document.body.style.backgroundColor = '#f4ebd0';
    
    const savedAuth = localStorage.getItem('lumina_auth');
    console.log('PirateDashboard Auth Check:', { savedAuth });
    setIsAuthenticated(!!savedAuth);

    const loadStats = () => {
      const savedGold = localStorage.getItem('pirate_gold');
      
      if (savedGold) setGold(parseInt(savedGold, 10));

      const savedMode = localStorage.getItem('pirate_koko_mode') as 'personal' | 'shared';
      if (savedMode) setKokoMode(savedMode);
      
      const savedPerspective = localStorage.getItem('pirate_koko_perspective') as 'cindy' | 'grinch';
      if (savedPerspective) setSharedChatPerspective(savedPerspective);
      
      const savedModel = localStorage.getItem('pirate_ai_model') as AIModelType;
      const validModels: AIModelType[] = [
        'qwen/qwen3.5-122b-a10b',
        'stepfun-ai/step-3.5-flash',
        'abacusai/dracarys-llama-3.1-70b-instruct'
      ];
      if (savedModel && validModels.includes(savedModel)) setAiModel(savedModel);
    };

    loadStats();

    window.addEventListener('storage', loadStats);
    window.addEventListener('focus', loadStats);
    return () => {
      window.removeEventListener('storage', loadStats);
      window.removeEventListener('focus', loadStats);
    };
  }, []);

  const handleAuthComplete = () => {
    setIsAuthenticated(true);
  };

  // ТОТАЛЬНАЯ ЗАЩИТА ОТ СКРОЛЛА ВНИЗ!!!
  useEffect(() => {
    // 1. Отключаем восстановление позиции браузером
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };

    // Сбрасываем сразу
    resetScroll();
    
    // 2. ДОБАВЛЯЕМ ВРЕМЕННЫЙ СЛУШАТЕЛЬ: любая попытка скролла возвращает вверх!
    const forceScrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };
    window.addEventListener('scroll', forceScrollToTop, { passive: false });

    // 3. И подстрахуемся чуть позже, когда всё точно загрузится
    const timeout = setTimeout(() => {
      // Удаляем слушатель через 1 секунду — больше не нужно
      window.removeEventListener('scroll', forceScrollToTop);
    }, 1000);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('scroll', forceScrollToTop);
      // Возвращаем, чтобы на других страницах работало
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
      }
    };
  }, [isMounted]);

  // Загружаем историю чата после того, как все состояния (mode/perspective) загружены
  useEffect(() => {
    if (!isMounted) return;
    
    // Загрузка чата в зависимости от режима и перспективы
    let chatKey = '';
    if (kokoMode === 'personal') {
      chatKey = 'pirate_koko_chat_personal';
    } else {
      chatKey = `pirate_koko_chat_shared_${sharedChatPerspective}`;
    }
    const savedChat = localStorage.getItem(chatKey);
    if (savedChat) {
      setChat(JSON.parse(savedChat));
    } else {
      // Reset to default if no history
      if (kokoMode === 'personal') {
        setChat([{ role: 'koko', text: 'Привет! Я Коко, тут, чтобы выслушать и помочь разобраться. Что у тебя на сердце?' }]);
      } else {
        // В shared mode: по умолчанию от лица Синди, добавляем скрытое приветствие от Гринча
        setChat([
          { role: 'grinch', text: 'привет, как дела?', hidden: true },
          { role: 'koko', text: 'Готов поговорить о вас и ваших отношениях. Как дела?' }
        ]);
      }
    }
  }, [kokoMode, sharedChatPerspective, isMounted]);

  // Save mode and perspective to localStorage when they change
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('pirate_koko_mode', kokoMode);
    localStorage.setItem('pirate_koko_perspective', sharedChatPerspective);
  }, [kokoMode, sharedChatPerspective, isMounted]);

  // Save AI model preference
  useEffect(() => {
    localStorage.setItem('pirate_ai_model', aiModel);
  }, [aiModel]);

  // Флаг для первой загрузки: чтобы не прокручивать страницу вниз при открытии
  const isFirstRender = useRef(true);
  const hasScrolledOnce = useRef(false);

  // Scroll to bottom of chat when messages change (НО НЕ НА ПЕРВОЙ ЗАГРУЗКЕ!!!)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    // И еще подстраховка: если мы еще ни разу не скроллили чат сами — не трогать!
    if (!hasScrolledOnce.current) {
      return;
    }

    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, isTyping]);

  // Prevent flash by showing a neutral state while checking auth or mounting
  if (isAuthenticated === null || !isMounted) {
    return (
      <div className="min-h-screen bg-[#f4ebd0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Anchor size={40} className="animate-spin text-amber-700/20" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <PirateAuth onComplete={handleAuthComplete} />;
  }

  const spaceName = spaceConfig?.name || 'Talia';
  const p1 = spaceConfig?.partner1_name || 'Гринч';
  const p2 = spaceConfig?.partner2_name || 'Синди Лу';

  // Sync back to localstorage when state changes
  const saveGold = (val: number) => {
    setGold(val);
    localStorage.setItem('pirate_gold', val.toString());
  };

  const saveChat = (newChat: typeof chat) => {
    setChat(newChat);
    let chatKey = '';
    if (kokoMode === 'personal') {
      chatKey = 'pirate_koko_chat_personal';
    } else {
      chatKey = `pirate_koko_chat_shared_${sharedChatPerspective}`;
    }
    localStorage.setItem(chatKey, JSON.stringify(newChat));
  };

  // Coco Chat actions
  const handleSend = async (customMsg?: string) => {
    const textToSend = customMsg || message;
    if (!textToSend.trim()) return;

    const userMsg = textToSend;
    if (!customMsg) setMessage('');

    // Определяем роль: если shared mode, то role = 'cindy' или 'grinch' в зависимости от перспективы
    const userRole = kokoMode === 'shared' ? sharedChatPerspective : 'user';

    const updatedChatWithUser = [...chat, { role: userRole as any, text: userMsg }];
    saveChat(updatedChatWithUser);
    setIsTyping(true);

    try {
      // Получаем "тайное знание" из localStorage для режима "наша бухта"
      let secretKnowledge = localStorage.getItem('pirate_shared_secret') || '';
      
      // Обновляем секрет, если текущее сообщение тоже добавляем в общую память, чтобы было что-то обсуждать было
      if (kokoMode === 'shared' && textToSend.length > 5) {
        const existingSecret = secretKnowledge ? secretKnowledge + '\n' + (sharedChatPerspective + ' сказал(а): ' + textToSend) : textToSend;
        localStorage.setItem('pirate_shared_secret', existingSecret);
        secretKnowledge = existingSecret;
      }

      // Передаем текущего юзера: если shared mode, то user = 'Cindy' или 'Grinch'
      const effectiveUser = kokoMode === 'shared' ? (sharedChatPerspective === 'cindy' ? 'Cindy' : 'Grinch') : (currentUser || undefined);
      const response = await chatWithKoko(userMsg, effectiveUser, kokoMode, aiModel, updatedChatWithUser, secretKnowledge);
      const updatedChatWithKoko = [...updatedChatWithUser, { role: 'koko' as const, text: response }];
      saveChat(updatedChatWithKoko);
    } catch (e) {
      const errorMsg = 'Кажется, связь оборвалась. Попробуй еще раз.';
      saveChat([...updatedChatWithUser, { role: 'koko' as const, text: errorMsg }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    const defaultChat: any[] = [];
    if (kokoMode === 'personal') {
      defaultChat.push({ role: 'koko' as const, text: 'Бортовой журнал очищен. Говори, я слушаю.' });
    } else {
      defaultChat.push({ role: 'grinch', text: 'привет, как дела?', hidden: true });
      defaultChat.push({ role: 'koko' as const, text: 'Готов поговорить о вас и ваших отношениях. Как дела?' });
    }
    saveChat(defaultChat);
    
    // Также сбросим "секрет", чтобы начать с чистого листа
    localStorage.removeItem('pirate_shared_secret');
    
    showNotif('Диалог с Коко очищен');
  };

  // Suggest prompts
  const suggestPrompts = kokoMode === 'personal' ? [
    { text: 'Мне тревожно сегодня...', icon: '' },
    { text: 'Как мне расслабиться?', icon: '' },
    { text: 'Дай совет для продуктивности', icon: '' },
    { text: 'Просто поболтаем?', icon: '' }
  ] : [
    { text: 'Дай совет дня для нас', icon: '' },
    { text: 'Как справиться со штормом в паре?', icon: '' },
    { text: 'Расскажи о важности доверия', icon: '' },
    { text: 'В чем наша сила как пары?', icon: '' }
  ];

  return (
    <div className="relative min-h-screen bg-[#000000] text-amber-100 font-serif overflow-x-hidden selection:bg-amber-500/30">
      
      {/* Ambient background glows */}
      <div className="absolute top-[-150px] left-[-150px] w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[50px] right-[-150px] w-[700px] h-[700px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none z-0" />
      
      {/* Wood pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-[0.05] pointer-events-none z-0" />
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[500] bg-red-700 text-white px-10 py-5 rounded-full font-black text-sm sm:text-base shadow-[0_15px_40px_rgba(185,28,28,0.3)] border-b-4 border-red-900 flex items-center gap-3.5 backdrop-blur-md"
          >
            <CheckCircle2 size={20} className="text-white" />
            <span className="tracking-widest uppercase font-black">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-10 pb-32 space-y-12">
        
        {/* HEADER BLOCK */}
        <header className="flex flex-row justify-between items-center gap-6 border-b-4 border-amber-900/10 pb-12 relative">
           <div className="text-left space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-900/10 bg-white/40 px-4 py-2 shadow-sm backdrop-blur-sm">
                <Anchor size={14} className="text-amber-700/60" />
                <span className="text-[10px] font-black uppercase tracking-[0.32em] text-amber-900/45">Ваша тихая пристань</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-amber-950 drop-shadow-sm">
                 Бухта <span className="text-amber-600">{spaceName}</span>
              </h1>
              <p className="max-w-2xl text-sm md:text-base italic text-amber-900/70 whitespace-nowrap overflow-hidden text-ellipsis">
                Место, где шторма затихают, а сердца находят верный курс домой.
              </p>
           </div>

           {/* Beautiful Theme Changer / Admin Panel Switcher */}
           <div className="shrink-0 z-20 flex items-center gap-3">
             <Link href="/about">
               <motion.button
                 whileHover={{ scale: 1.08, rotate: -2, backgroundColor: '#ffffff', borderColor: '#ffffff' }}
                 whileTap={{ scale: 0.95 }}
                 className="flex items-center gap-3 px-6 py-4 bg-amber-100 text-amber-900 border-b-4 border-amber-300 rounded-2xl transition-all duration-300 shadow-xl font-black uppercase tracking-[0.2em] text-xs hover:border-white"
               >
                 <Trees size={18} />
                 <span>НОВОЕ</span>
               </motion.button>
             </Link>
             <Link href="/admin">
               <motion.button
                 whileHover={{ scale: 1.05, rotate: 2 }}
                 whileTap={{ scale: 0.95 }}
                 className="flex items-center gap-3 px-10 py-5 bg-amber-500 text-slate-950 border-b-4 border-amber-700 rounded-2xl transition-all duration-300 font-black uppercase tracking-[0.2em] text-xs"
               >
                 <Settings size={18} className="animate-spin-slow" />
                 <span>Управление</span>
               </motion.button>
             </Link>
           </div>
        </header>

        {/* 3D INTERACTIVE SAFE PIRATE BAY SCENARIO */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
           
           {/* Left Column: Huge 3D Interactive Haven Diorama */}
           <div className="lg:col-span-8 flex flex-col gap-6 w-full">
              <motion.div 
                initial={false}
                animate={{ backgroundColor: isMounted ? '#000000' : '#d9c5a0' }}
                transition={{ duration: 1 }}
                className="h-[450px] rounded-[3rem] border-[12px] border-[#3e2723]/10 overflow-hidden relative shadow-[20px_20px_60px_rgba(0,0,0,0.1)]"
              >
                 <AnimatePresence mode="wait">
                   {isMounted ? (
                     <motion.div
                       key="bay-scene"
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       transition={{ duration: 1 }}
                       className="w-full h-full"
                     >
                       <BayScene />
                     </motion.div>
                   ) : (
                     <motion.div
                       key="bay-loading"
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       exit={{ opacity: 0 }}
                       className="w-full h-full flex flex-col items-center justify-center bg-[#d9c5a0] gap-4"
                     >
                       <Anchor size={36} className="animate-spin text-amber-900/20" />
                       <span className="text-[10px] uppercase font-black text-amber-900/30 tracking-[0.3em] animate-pulse">Заряжаем пушки...</span>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </motion.div>
           </div>

           {/* Right Column: Immersive safe harbor status sheet */}
           <div className="lg:col-span-4 rounded-[3rem] p-10 bg-[#f2e2ba] border-[12px] border-[#3e2723]/10 relative shadow-[20px_20px_60px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col justify-between h-[450px]">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40 pointer-events-none" />
              
              <div className="space-y-8 text-left relative z-10">
                 <div className="border-b-2 border-amber-900/10 pb-4">
                    <span className="text-[10px] font-black uppercase text-amber-900/40 tracking-[0.25em] block">Ведомости бухты</span>
                    <h2 className="text-3xl font-black text-amber-950 uppercase tracking-tight mt-1">Мирная Гавань</h2>
                 </div>

                 <p className="text-base text-amber-900/70 leading-relaxed italic font-serif">
                    Капитан! Пришвартовывайся к тихой пристани. Это самое безопасное и теплое место во всем архипелаге. Здесь шторма бессильны, а пушки молчат.
                 </p>
              </div>

              <div className="pt-6 border-t-2 border-amber-900/10 text-center relative z-10">
                 <p className="text-[11px] text-amber-900/30 uppercase tracking-[0.3em] font-black italic">
                    «Любовь греет круче рома!»
                 </p>
              </div>
           </div>

        </section>

        {/* DYNAMIC CONTENT AREA */}
        <div className="relative min-h-[480px] z-10 mb-20">
          <AnimatePresence mode="wait" initial={false}>
             
             {/* COCO ONLINE AI THERAPIST */}
             <motion.div
               key="koko"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.3 }}
               className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch"
             >
                   {/* Left Side Column: Coco Psych Profile Card */}
                   <div className="lg:col-span-4 rounded-[3rem] p-10 bg-[#f2e2ba] border-[12px] border-[#3e2723]/10 flex flex-col justify-between items-center text-center overflow-hidden relative shadow-[20px_20px_60px_rgba(0,0,0,0.1)] min-h-[550px]">
                      
                      {/* Paper texture overlay */}
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40 pointer-events-none" />
                      
                      <div className="space-y-8 w-full relative z-10">
                         {/* Live Badge */}
                         <div className="flex items-center justify-center gap-2 bg-emerald-500/10 border-2 border-emerald-500/20 px-4 py-2 rounded-full w-fit mx-auto">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">КОКО В СЕТИ</span>
                         </div>

                         {/* Coco Avatar Container */}
                         <div className="relative w-44 h-44 mx-auto">
                            <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-3xl animate-pulse" />
                            <div className="absolute inset-0 rounded-[3rem] bg-white/60 border-4 border-amber-900/10 shadow-2xl flex items-center justify-center text-8xl select-none transform hover:rotate-6 transition-all duration-500">
                               🦜
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 p-3 rounded-2xl border-4 border-amber-300 shadow-xl">
                               <Sparkles size={20} className="animate-spin-slow" />
                            </div>
                         </div>

                         {/* Description texts */}
                         <div className="space-y-3">
                            <h3 className="text-3xl font-black text-amber-950 uppercase tracking-tight leading-none">Психолог Коко</h3>
                            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-900/40">ИИ-терапевт Тортуги</p>
                         </div>

                         <p className="text-sm text-amber-900/70 font-serif italic leading-relaxed px-4">
                            «Ты можешь мне рассказать все, что угодно. Я помогу разобраться в чувствах и найти путь вперед.»
                         </p>
                      </div>

                      {/* Interactive Clear Chat Button */}
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          handleClearChat();
                        }}
                        className="w-full mt-10 py-5 bg-red-700/10 hover:bg-red-700 text-red-700 hover:text-white rounded-2xl font-black uppercase tracking-widest text-[11px] border-2 border-red-700/20 hover:border-red-700 transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg relative z-20 pointer-events-auto"
                      >
                         <Trash2 size={16} /> Очистить БОРТЖУРНАЛ
                      </button>
                   </div>

                   {/* Right Side Column: Immersive Consult Terminal */}
                   <div className="lg:col-span-8 rounded-[3rem] p-10 bg-[#f2e2ba] border-[12px] border-[#3e2723]/10 flex flex-col justify-between shadow-[20px_20px_60px_rgba(0,0,0,0.1)] relative overflow-hidden min-h-[550px] z-10">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40 pointer-events-none" />
                      
                      {/* Header bar inside consult panel */}
                      <div className="flex flex-col gap-4 border-b-2 border-amber-900/10 pb-6 mb-6 shrink-0 relative z-10">
                         <div className="flex items-center justify-between">
                             <div className="flex gap-2 p-1 bg-amber-900/5 rounded-2xl border border-amber-900/10">
                                <button 
                                  onClick={() => setKokoMode('personal')}
                                  className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    kokoMode === 'personal' ? "bg-amber-800 text-white shadow-lg" : "text-amber-900/40 hover:text-amber-900/60"
                                  )}
                                >
                                   Личный разговор
                                </button>
                                <button 
                                  onClick={() => setKokoMode('shared')}
                                  className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    kokoMode === 'shared' ? "bg-amber-800 text-white shadow-lg" : "text-amber-900/40 hover:text-amber-900/60"
                                  )}
                                >
                                   Наша бухта
                                </button>
                             </div>
                             <div className="flex items-center gap-2">
                                <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse", kokoMode === 'personal' ? "bg-rose-500" : "bg-emerald-500")} />
                                <span className="text-[10px] font-black text-amber-950/40 uppercase tracking-widest">
                                   {kokoMode === 'personal' ? 'Приватный канал' : 'Общий канал'}
                                </span>
                             </div>
                         </div>
                         {/* Переключатель Чат Синди / Чат Гринча (только в shared mode) */}
                         {kokoMode === 'shared' && (
                           <div className="flex gap-2 p-1 bg-rose-900/5 rounded-2xl border border-rose-900/10">
                              <button 
                                onClick={() => setSharedChatPerspective('cindy')}
                                className={cn(
                                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                  sharedChatPerspective === 'cindy' ? "bg-rose-700 text-white shadow-lg" : "text-rose-900/40 hover:text-rose-900/60"
                                )}
                              >
                                 💬 Чат Синди
                              </button>
                              <button 
                                onClick={() => setSharedChatPerspective('grinch')}
                                className={cn(
                                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                  sharedChatPerspective === 'grinch' ? "bg-blue-700 text-white shadow-lg" : "text-blue-900/40 hover:text-blue-900/60"
                                )}
                              >
                                 🎩 Чат Гринча
                              </button>
                           </div>
                         )}
                         {/* AI Model Switcher - только для Гринча, показываем переключатель, но скрываем название модели */}
                         {(isGrinch || isCindy) && (
                          <div className="flex flex-col gap-3">
                             {isGrinch && (
                               <div className="flex flex-wrap gap-2 p-1 bg-purple-900/5 rounded-2xl border border-purple-900/10">
                                  <button 
                                    onClick={() => setAiModel('qwen/qwen3.5-122b-a10b')}
                                    className={cn(
                                      "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                      aiModel === 'qwen/qwen3.5-122b-a10b' ? "bg-purple-700 text-white shadow-lg" : "text-purple-900/40 hover:text-purple-900/60"
                                    )}
                                  >
                                     Qwen 3.5 122B
                                  </button>
                                  <button 
                                    onClick={() => setAiModel('stepfun-ai/step-3.5-flash')}
                                    className={cn(
                                      "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                      aiModel === 'stepfun-ai/step-3.5-flash' ? "bg-purple-600 text-white shadow-lg" : "text-purple-900/40 hover:text-purple-900/60"
                                    )}
                                  >
                                     Step 3.5 Flash
                                  </button>
                                  <button 
                                    onClick={() => setAiModel('abacusai/dracarys-llama-3.1-70b-instruct')}
                                    className={cn(
                                      "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                      aiModel === 'abacusai/dracarys-llama-3.1-70b-instruct' ? "bg-red-700 text-white shadow-lg" : "text-red-900/40 hover:text-red-900/60"
                                    )}
                                  >
                                     Dracarys 70B
                                  </button>
                               </div>
                             )}
                             {/* Показываем название модели только Синди */}
                             {isCindy && (
                               <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black text-amber-950/40 uppercase tracking-widest">
                                     Текущая модель: {aiModel}
                                  </span>
                               </div>
                             )}
                          </div>
                         )}
                      </div>

                      {/* Message History Workspace */}
                      <div className="flex-1 overflow-y-auto space-y-6 px-4 py-4 max-h-[400px] scrollbar-thin scrollbar-thumb-amber-900/10 relative z-10">
                         {chat.map((msg, idx) => {
                            // Скрываем сообщения с hidden: true и сообщения противоположного персонажа
                            if ((msg as any).hidden) return null;
                            if (kokoMode === 'shared') {
                                if (sharedChatPerspective === 'cindy' && msg.role === 'grinch') return null;
                                if (sharedChatPerspective === 'grinch' && msg.role === 'cindy') return null;
                            }

                            const isCurrentUser = msg.role === 'user' || msg.role === sharedChatPerspective;
                            
                            return (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: isCurrentUser ? 20 : -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={cn(
                                 "flex gap-4 max-w-[90%] items-start text-left",
                                 isCurrentUser ? "ml-auto flex-row-reverse" : "mr-auto"
                              )}
                            >
                               {/* Avatar */}
                               <div className={cn(
                                  "w-10 h-10 rounded-xl border-4 flex items-center justify-center text-lg shrink-0 shadow-lg",
                                  isCurrentUser 
                                    ? (msg.role === 'grinch' ? "bg-blue-700 border-blue-900 text-white" : "bg-red-700 border-red-900 text-white") 
                                    : (msg.role === 'koko' ? "bg-[#3e2723] border-amber-600/30 text-amber-100" : "bg-amber-200 border-amber-400 text-amber-900")
                               )}>
                                  {msg.role === 'koko' ? '🦜' : (msg.role === 'grinch' ? '🎩' : (msg.role === 'cindy' ? '💬' : <User size={18} />))}
                               </div>

                               {/* Bubble */}
                               <div className={cn(
                                  "p-6 rounded-2xl font-bold leading-relaxed text-base font-serif relative shadow-md",
                                  isCurrentUser 
                                    ? (msg.role === 'grinch' ? "bg-blue-700 text-white rounded-tr-none" : "bg-red-700 text-white rounded-tr-none") 
                                    : (msg.role === 'koko' ? "bg-white/60 text-stone-900 rounded-tl-none border-2 border-amber-900/5" : "bg-amber-100 text-amber-900 rounded-tl-none border-2 border-amber-300")
                               )}>
                                  {msg.text}
                               </div>
                            </motion.div>
                            );
                         })}

                         {isTyping && (
                            <div className="flex gap-4 items-center mr-auto text-left">
                               <div className="w-10 h-10 rounded-xl bg-[#3e2723] border-4 border-amber-600/30 flex items-center justify-center text-lg shrink-0">
                                  🦜
                               </div>
                               <div className="bg-white/40 border-2 border-amber-900/5 p-5 rounded-2xl rounded-tl-none w-20 flex gap-1.5 justify-center shadow-inner">
                                  <span className="w-2 h-2 bg-amber-900/20 rounded-full animate-bounce" />
                                  <span className="w-2 h-2 bg-amber-900/20 rounded-full animate-bounce [animation-delay:0.2s]" />
                                  <span className="w-2 h-2 bg-amber-900/20 rounded-full animate-bounce [animation-delay:0.4s]" />
                               </div>
                            </div>
                         )}
                         <div ref={chatEndRef} />
                      </div>

                      {/* Footer: Quick suggesting prompts & Input console */}
                      <div className="mt-8 pt-8 border-t-2 border-amber-900/10 space-y-6 shrink-0 relative z-20">
                         
                         {/* Prompt suggestions grid */}
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-30">
                            {suggestPrompts.map((prompt, i) => (
                               <button
                                 key={i}
                                 type="button"
                                 onClick={(e) => {
                                   e.preventDefault();
                                   handleSend(prompt.text);
                                 }}
                                 disabled={isTyping}
                                 className="px-4 py-3 bg-amber-900/5 hover:bg-amber-800 hover:text-white border-2 border-amber-900/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-amber-900/60 text-left transition-all cursor-pointer truncate flex items-center gap-2 active:scale-95 pointer-events-auto"
                               >
                                  <Sparkles size={12} /> <span className="truncate">{prompt.text}</span>
                               </button>
                            ))}
                         </div>

                         {/* Console Input Bar */}
                         <form 
                           onSubmit={(e) => {
                             e.preventDefault();
                             handleSend();
                           }}
                           className="relative z-30"
                         >
                            <input
                              type="text"
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder="Задай Коко вопрос..."
                              disabled={isTyping}
                              className="w-full bg-white/60 border-4 border-amber-900/10 focus:border-amber-800 rounded-2xl px-8 py-5 text-stone-900 placeholder:text-amber-900/20 focus:outline-none transition-all pr-20 text-lg font-serif font-bold shadow-inner pointer-events-auto"
                            />
                            <button
                              type="submit"
                              disabled={isTyping}
                              className="absolute right-3 top-3 bottom-3 px-5 bg-amber-600 text-white rounded-xl flex items-center justify-center hover:bg-amber-700 active:scale-95 transition-all cursor-pointer shadow-lg border-b-4 border-amber-800 pointer-events-auto"
                            >
                               <Send size={20} />
                            </button>
                         </form>
                      </div>

                   </div>
                </motion.div>

          </AnimatePresence>
        </div>

      </div>
      <style jsx global>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 15s linear infinite; }
      `}</style>
      </motion.div>
    </div>
  );
}
