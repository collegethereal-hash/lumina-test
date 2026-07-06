'use client';

import { useState, useEffect } from 'react';
import { RelationshipTimer } from "@/eras/palia/components/RelationshipTimer";
import { WeatherWidget } from "@/eras/palia/components/WeatherWidget";
import { PetHub } from "@/eras/palia/components/PetHub";
import { Card } from "@/components/Card";
import { AuthScreen, OnboardingScreen } from "@/eras/palia/components/AuthSystem";
import { Sparkles, MessageCircle, Heart, Cookie, Timer, RefreshCw, BrainCircuit, Sparkle, X, HelpCircle, Settings } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useData } from '@/components/DataProvider';
import { supabase } from '@/lib/supabase';
import { useEra } from '@/context/EraContext';

export default function Home() {
  const router = useRouter();
  const { dailyFact, dailyCookie, currentUser } = useData();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('lumina_auth');
    console.log('PaliaDashboard Auth Check:', { auth });
    if (auth && !window.location.search.includes('reset')) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleAuthComplete = (user: string) => {
    localStorage.setItem('lumina_auth', user);
    // Устанавливаем куку для middleware (срок действия 30 дней)
    document.cookie = `lumina_auth=${user}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
    setIsAuthenticated(true);
    
    // Force reload to update AuthGuard and Middleware state
    window.location.reload();
    
    const hasSeenOnboarding = localStorage.getItem('lumina_onboarding_seen');
    if (!hasSeenOnboarding) {
      localStorage.setItem('lumina_onboarding_seen', 'true');
      router.push('/about');
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('lumina_onboarding_seen', 'true');
    setShowOnboarding(false);
  };



  if (!isAuthenticated) {
    return <AuthScreen onComplete={handleAuthComplete} />;
  }

  return (
    <div className="relative min-h-screen bg-[#fdfaf3]">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#f0f9ff]/50 via-transparent to-[#fdf2f8]/50" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#0ea5e9]/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#ec4899]/5 rounded-full blur-[120px]" />
      </div>
      
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      {/* Mobile Top Header (Hidden on Desktop) */}
      <div className="md:hidden sticky top-0 z-[100] w-full px-6 pt-6 pb-4 bg-[#fdfaf3]/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5c4a33] text-[#fdfaf3] flex items-center justify-center shadow-lg border-2 border-[#e6d5bc]">
            <Heart size={20} fill="currentColor" />
          </div>
          <div>
            <h2 className="text-lg font-black text-[#5c4a33] leading-none">{currentUser === 'Cindy' ? 'Polina' : 'Karim'}</h2>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#8b7355]/60 mt-0.5">Эра Талии</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/about" className="p-2 rounded-xl bg-[#f5e6d3] text-[#5c4a33] border-2 border-[#e6d5bc] shadow-sm">
            <HelpCircle size={20} />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 pb-40 md:pb-52 space-y-8 md:space-y-10 relative z-10">

        <header className="hidden md:flex flex-col md:flex-row items-center justify-between gap-6 relative pt-6 pb-2 px-4 md:px-0">
          {/* Left side: Logo & Brand Element */}
          <div className="flex items-center gap-4">
            <Link href="/" className="shrink-0">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] bg-[#5c4a33] text-[#fdfaf3] flex items-center justify-center shadow-xl border-4 border-[#e6d5bc] relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-purple-400/20 group-hover:opacity-100 opacity-0 transition-opacity duration-300" />
                <Heart size={28} fill="currentColor" className="relative z-10" />
              </motion.div>
            </Link>
            <div className="hidden md:block">
              <h2 className="text-2xl font-black text-[#5c4a33] tracking-tight">{currentUser === 'Cindy' ? 'Polina' : 'Karim'}</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8b7355]/60">Эра Талии</p>
            </div>
          </div>

          {/* Center: Title */}
          <div className="text-center space-y-2">
            <Link href="/about">
              <motion.h1 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-5xl md:text-6xl font-serif font-bold text-[#5c4a33] tracking-tight cursor-pointer select-none inline-block drop-shadow-lg"
              >
                Talia
              </motion.h1>
            </Link>
            <p className="text-sm md:text-base text-[#8b7355]/70 font-medium">
              Время вместе, которое никогда не закончится
            </p>
          </div>

          {/* Right side: Admin Panel Button - DISABLED */}
          <div className="shrink-0 opacity-50 grayscale cursor-not-allowed">
            <motion.button
              disabled
              className="flex items-center gap-3 px-6 py-4 bg-[#5c4a33] text-[#fdfaf3] border-4 border-[#e6d5bc] rounded-[1.5rem] shadow-xl transition-all duration-300 group cursor-not-allowed"
            >
              <div className="p-2 bg-white/10 rounded-xl transition-colors">
                <Settings size={20} />
              </div>
              <div className="text-left hidden md:block">
                <span className="text-[11px] font-black uppercase tracking-[0.3em] block">Управление</span>
                <span className="text-[10px] opacity-70 block">Недоступно</span>
              </div>
            </motion.button>
          </div>
        </header>

        {/* Mobile Main Hero (Centered Title) */}
        <div className="md:hidden text-center space-y-2 py-4">
          <Link href="/about">
            <motion.h1 
              className="text-6xl font-serif font-bold text-[#5c4a33] tracking-tight drop-shadow-md"
            >
              Talia
            </motion.h1>
          </Link>
          <p className="text-xs text-[#8b7355]/70 font-medium italic">
            "Время вместе, которое никогда не закончится"
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
          <RelationshipTimer />
          <WeatherWidget />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-10 auto-rows-auto">
          {/* Pinterest-like layout */}
          <div className="md:col-span-2 md:row-span-1">
            <PetHub />
          </div>
          
          <div className="md:col-span-1">
            <FortuneCard />
          </div>

          <div className="md:col-span-3">
            <div className="bg-[#fdfaf3] border-4 md:border-8 border-[#e6d5bc]/30 shadow-[10px_10px_30px_rgba(0,0,0,0.06)] md:shadow-[15px_15px_40px_rgba(0,0,0,0.08)] p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] relative overflow-hidden group">
              {/* Paper texture overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
              
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-10 z-10 w-full relative">
                <div className="p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] bg-gradient-to-br from-[#f5e6d3] to-[#e6d5bc] text-[#5c4a33] shadow-xl md:shadow-2xl border-2 md:border-4 border-[#e6d5bc] transition-transform duration-500 shrink-0 relative overflow-hidden">
                   <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
                   <BrainCircuit size={36} className="md:hidden" />
                   <BrainCircuit size={72} className="hidden md:block" />
                </div>
                <div className="flex-1 space-y-2 md:space-y-4 z-10 text-center md:text-left">
                  <p className="text-base md:text-3xl font-serif font-bold text-[#5c4a33] leading-[1.4] italic drop-shadow-sm">
                    {dailyFact || "Каждый день — это новая возможность узнать что-то удивительное вместе."}
                  </p>
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#5c4a33]/5 rounded-full border border-[#e6d5bc]/40 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#8b7355]">
                      <Sparkle size={10} className="text-amber-500" />
                      Факт дня для вас двоих
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FortuneCard() {
  const { dailyCookie } = useData();
  const [fortune, setFortune] = useState<string | null>(null);
  const [isBreaking, setIsBreaking] = useState(false);
  const [nextCookieTime, setNextCookieTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCookie = async () => {
      const { data } = await supabase.from('global_state').select('value').eq('key', 'fortune_state').single();
      if (data && data.value) {
        const state = data.value;
        const now = new Date().getTime();
        if (state.nextTime && state.nextTime > now) {
          setFortune(state.fortune);
          setNextCookieTime(state.nextTime);
        }
      }
      setIsLoading(false);
    };
    fetchCookie();
  }, []);

  useEffect(() => {
    if (!nextCookieTime) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = nextCookieTime - now;
      
      if (distance < 0) {
        setFortune(null);
        setNextCookieTime(null);
        setTimeLeft("");
      } else {
        const h = Math.floor(distance / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${h}ч ${m}м ${s}с`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextCookieTime]);

  const breakCookie = async () => {
    setIsBreaking(true);
    setTimeout(async () => {
      const randomFortune = dailyCookie || "Полинка, помни, что я всегда рядом с тобой, в любую минуту и в любой ситуации, ты никогда не будешь одна !!";
      const nextTime = new Date().getTime() + 24 * 60 * 60 * 1000;
      
      setFortune(randomFortune);
      setNextCookieTime(nextTime);
      setIsBreaking(false);

      await supabase.from('global_state').upsert({
        key: 'fortune_state',
        value: { fortune: randomFortune, nextTime: nextTime }
      });
    }, 800);
  };

  return (
    <div className="relative h-full flex flex-col items-center justify-between bg-[#fdfaf3] border-4 md:border-8 border-[#e6d5bc]/30 shadow-[10px_10px_30px_rgba(0,0,0,0.06)] md:shadow-[15px_15px_40px_rgba(0,0,0,0.08)] p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] overflow-hidden group">
      {/* Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
      
      <div className="w-full flex justify-between items-start relative z-10">
        <div className="text-left">
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#5c4a33]">Fortune</h3>
          <p className="text-[9px] md:text-[11px] font-black text-[#8b7355] uppercase tracking-[0.3em]">Печенье Talia</p>
        </div>
        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-[#f5e6d3] flex items-center justify-center text-[#5c4a33] border-2 md:border-4 border-[#e6d5bc]">
          <Cookie size={20} className="md:hidden" />
          <Cookie size={28} className="hidden md:block" />
        </div>
      </div>

      <div className="relative py-4 md:py-6 flex flex-col items-center relative z-10 w-full">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 md:gap-4"
            >
              <RefreshCw className="animate-spin text-[#e6d5bc]" size={40} />
              <p className="text-[9px] md:text-[11px] font-black uppercase text-[#8b7355] opacity-40 tracking-[0.2em]">Загрузка судьбы...</p>
            </motion.div>
          ) : !fortune ? (
            <motion.div
              key="cookie-visual"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className="relative"
            >
              <motion.div
                animate={isBreaking ? { 
                  rotate: [0, -10, 10, -10, 10, 0],
                  scale: [1, 1.1, 0.9, 1.1, 1]
                } : { y: [0, -8, 0] }}
                transition={isBreaking ? { duration: 0.8 } : { duration: 4, repeat: Infinity }}
                className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-amber-100 to-amber-200 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center text-amber-700 shadow-xl border-4 md:border-8 border-[#e6d5bc]"
              >
                <Cookie size={48} className="md:hidden" />
                <Cookie size={64} className="hidden md:block" />
              </motion.div>
              <div className="absolute -inset-3 md:-inset-4 border border-dashed md:border-2 border-[#e6d5bc] rounded-[2.5rem] md:rounded-[3rem] animate-[spin_20s_linear_infinite]" />
            </motion.div>
          ) : (
            <motion.div
              key="fortune-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 md:p-8 rounded-xl md:rounded-2xl border-2 md:border-4 border-[#e6d5bc] shadow-lg relative w-full"
            >
              <p className="text-sm md:text-lg text-[#5c4a33] italic leading-relaxed font-bold text-center">
                "{fortune}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full relative z-10">
        {isLoading ? (
          <div className="w-full py-4 md:py-5 rounded-xl md:rounded-2xl bg-[#e6d5bc]/30 border-2 md:border-3 border-dashed border-[#e6d5bc]" />
        ) : !fortune ? (
          <button 
            onClick={breakCookie}
            disabled={isBreaking}
            className="w-full py-3.5 md:py-5 rounded-xl md:rounded-2xl bg-[#5c4a33] text-[#fdfaf3] font-black uppercase tracking-[0.2em] md:tracking-[0.25em] text-[10px] md:text-sm hover:bg-[#4a3b29] transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            {isBreaking ? "Разламываю..." : "Разломить печенье"}
          </button>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2 md:py-3">
            <div className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-2.5 bg-[#f5e6d3] rounded-full border-2 md:border-4 border-[#e6d5bc]">
              <Timer size={14} className="text-[#8b7355] md:hidden" />
              <Timer size={16} className="text-[#8b7355] hidden md:block" />
              <span className="text-xs md:text-sm font-black text-[#5c4a33] tabular-nums tracking-widest">{timeLeft}</span>
            </div>
            <p className="text-[8px] md:text-[9px] font-black uppercase text-[#8b7355] opacity-60 tracking-widest">
              До следующего печенья
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const FAQModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const categories = [
    {
      title: "🐾 Питомник Арчи",
      items: [
        { q: "Как Арчи растет?", a: "За каждое действие (кормление, вода, ласка) Арчи получает опыт (XP). Каждые 100 XP повышают его уровень. С каждым уровнем он становится мудрее!" },
        { q: "Что если я забуду его покормить?", a: "Арчи очень выносливый, но он начнет грустить и его показатели будут падать. Если показатели упадут до нуля, ваша серия заботы (Streak) может прерваться." },
        { q: "Почему Арчи парит?", a: "В мире Talia Арчи — звездное существо. Он принимает астральную форму, чтобы лучше чувствовать ваши мысли и связь." }
      ]
    },
    {
      title: "📸 Галерея Памяти",
      items: [
        { q: "Как добавить новое фото?", a: "Зайди в раздел 'Галерея' и нажми 'Снять'. Там ты сможешь загрузить любой момент и подписать его." },
        { q: "Что за кнопка 'Вспомнить'?", a: "Это магия Talia! Она выбирает случайное фото из вашего архива, чтобы напомнить о теплом моменте." }
      ]
    },
    {
      title: "✨ Магические Механики",
      items: [
        { q: "Печенье Судьбы", a: "Разламывай его раз в сутки, чтобы получить смелое и вдохновляющее предсказание для вас двоих." },
        { q: "Таймер Связи", a: "Он считает каждую секунду с того момента, как вы решили быть вместе. Это ваше общее время." }
      ]
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-[#fdfaf3] rounded-[3rem] border-8 border-[#e6d5bc] shadow-[15px_15px_40px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 md:p-12 bg-[#f5e6d3] border-b-4 border-[#e6d5bc] relative shrink-0">
              <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/20 transition-colors">
                <X size={32} className="text-[#5c4a33]" />
              </button>
              <div className="space-y-2">
                <div className="inline-flex px-4 py-1.5 rounded-full bg-[#5c4a33] text-[#fdfaf3] text-[11px] font-black uppercase tracking-[0.3em]">
                  Путеводитель по миру
                </div>
                <h2 className="text-4xl md:text-6xl font-serif font-bold text-[#5c4a33] tracking-tight">Библиотека Talia</h2>
                <p className="text-[#8b7355] italic text-lg max-w-xl">
                  "Здесь собраны все знания о нашем маленьком мире, чтобы ты всегда чувствовала себя как дома."
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-12 custom-scrollbar">
              {categories.map((cat, idx) => (
                <div key={idx} className="space-y-6">
                  <h3 className="text-2xl font-serif font-bold text-[#5c4a33] flex items-center gap-3 border-b-2 border-[#e6d5bc] pb-2">
                    {cat.title}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {cat.items.map((item, i) => (
                      <div key={i} className="bg-white p-6 rounded-[2rem] border-4 border-[#e6d5bc] shadow-sm space-y-3">
                        <p className="font-black uppercase text-[11px] tracking-widest text-[#8b7355] flex items-center gap-2">
                          <HelpCircle size={14} className="text-amber-500" />
                          {item.q}
                        </p>
                        <p className="text-[#5c4a33] text-sm leading-relaxed italic">
                          "{item.a}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-8 bg-[#fdfaf3] border-t-2 border-[#e6d5bc] text-center shrink-0">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8b7355] opacity-60">
                С любовью для Полины • 2026
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
