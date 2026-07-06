'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Lock, User, Sparkles, ArrowRight, ChevronRight, HelpCircle, X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/components/DataProvider';

type Character = 'grinch' | 'cindy';

interface AuthProps {
  onComplete: (user: Character) => void;
}

export const AuthScreen = ({ onComplete }: AuthProps) => {
  const { spaceConfig } = useData();
  const [step, setStep] = useState<'character' | 'password'>('character');
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleCharSelect = (char: Character) => {
    setSelectedChar(char);
    setStep('password');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaceConfig) return;

    const correctPassword = selectedChar === 'grinch' ? spaceConfig.password_p1 : spaceConfig.password_p2;
    
    if (password === correctPassword) {
      if (selectedChar) onComplete(selectedChar);
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
      setPassword('');
    }
  };

  const p1Name = spaceConfig?.partner1_name || 'Гринч';
  const p2Name = spaceConfig?.partner2_name || 'Синди Лу';
  const spaceName = spaceConfig?.name || 'Talia';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#fefce8] overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-200/30 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-orange-200/30 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#e6d5bc_1px,transparent_1px)] [background-size:40px_40px] opacity-20" />
      </div>

      <AnimatePresence mode="wait">
        {step === 'character' ? (
          <motion.div
            key="char-select"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="relative z-10 w-full max-w-4xl px-4 text-center space-y-8 md:space-y-12"
          >
            <div className="space-y-4 md:space-y-6">
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="inline-flex px-4 py-1.5 rounded-full bg-white border-2 border-[#e6d5bc] text-[#8b7355] text-[10px] md:text-xs font-black uppercase tracking-[0.2em] shadow-sm"
              >
                <Sparkles size={12} className="mr-2 text-amber-400" />
                Добро пожаловать домой
              </motion.div>
              <h1 className="text-4xl md:text-7xl font-serif font-bold text-[#5c4a33] tracking-tight leading-tight">
                Кто заглянул в {spaceName}?
              </h1>
              <p className="text-[#8b7355] font-medium italic text-lg md:text-xl max-w-xl mx-auto px-4">
                "Для начала выбери своего героя"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 max-w-4xl mx-auto px-4">
              <CharacterCard 
                type="cindy" 
                name={p2Name} 
                desc="Доброе сердце"
                onClick={() => handleCharSelect('cindy')}
                color="bg-pink-50"
                emoji="🎀"
              />
              <CharacterCard 
                type="grinch" 
                name={p1Name} 
                desc="Злой ворчун"
                onClick={() => handleCharSelect('grinch')}
                color="bg-emerald-50"
                emoji="🍏"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="password-entry"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="relative z-10 w-full max-w-md px-6 text-center space-y-8"
          >
            <button 
              onClick={() => setStep('character')}
              className="absolute -top-16 left-6 text-[#8b7355] font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:text-[#5c4a33] transition-colors"
            >
              ← Назад к выбору
            </button>

            <div className="space-y-6">
              <div className="relative mx-auto w-32 h-32">
                <div className={cn(
                  "absolute inset-0 rounded-[2.5rem] border-4 border-[#e6d5bc] rotate-6",
                  selectedChar === 'grinch' ? "bg-emerald-50" : "bg-pink-50"
                )} />
                <div className="absolute inset-0 bg-white rounded-[2.5rem] border-4 border-[#e6d5bc] shadow-xl flex items-center justify-center text-[#5c4a33] -rotate-3 overflow-hidden">
                  <div className="text-6xl">
                    {selectedChar === 'grinch' ? '🍏' : '🎀'}
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <h2 className="text-3xl font-serif font-bold text-[#5c4a33]">Привет, {selectedChar === 'grinch' ? p1Name : p2Name}!</h2>
                <p className="text-[#8b7355] text-sm font-medium">Введи наш секретный ключ</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <motion.div 
                animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                className="relative"
              >
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b7355]/40" size={20} />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  autoFocus
                  className={cn(
                    "w-full bg-white border-4 border-[#e6d5bc] rounded-2xl pl-12 pr-4 py-4 text-center text-2xl tracking-[0.5em] focus:ring-0 focus:border-[#5c4a33] transition-all font-bold text-[#5c4a33]",
                    error && "border-red-400 text-red-400"
                  )}
                />
              </motion.div>
              <button 
                type="submit"
                className="w-full py-5 rounded-[2rem] bg-[#5c4a33] text-[#fdfaf3] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Войти в {spaceName}
                <ArrowRight size={20} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CharacterCard = ({ type, name, desc, onClick, color, emoji }: { type: Character, name: string, desc: string, onClick: () => void, color: string, emoji: string }) => (
  <motion.button
    whileHover={{ y: -8, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="group relative w-full"
  >
    <div className={cn("absolute inset-0 rounded-[2rem] md:rounded-[3.5rem] border-2 md:border-4 translate-y-2 transition-transform", color, "border-[#e6d5bc]")} />
    <div className="relative bg-white rounded-[2rem] md:rounded-[3.5rem] border-2 md:border-4 border-[#e6d5bc] p-6 md:p-10 shadow-xl flex flex-col items-center gap-4 md:gap-8 overflow-hidden min-h-[180px] md:min-h-[400px] justify-center">
      <div className="relative">
        <div className="absolute inset-0 bg-amber-100 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="w-20 h-20 md:w-36 md:h-36 rounded-2xl md:rounded-[2.5rem] bg-[#fdfaf3] border-2 md:border-4 border-[#e6d5bc] flex items-center justify-center text-4xl md:text-8xl shadow-inner group-hover:rotate-12 transition-transform duration-500 relative z-10">
          {emoji}
        </div>
      </div>
      <div className="space-y-1 md:space-y-3">
        <h3 className="text-2xl md:text-5xl font-serif font-bold text-[#5c4a33]">{name}</h3>
        <p className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em] text-[#8b7355] opacity-60 leading-tight">{desc}</p>
      </div>
      
      <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-[#f5e6d3] flex items-center justify-center text-[#5c4a33] group-hover:bg-[#5c4a33] group-hover:text-white transition-all duration-300 shadow-md">
        <ChevronRight size={20} className="md:w-10 md:h-10" />
      </div>
    </div>
  </motion.button>
);

export const OnboardingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "С годовщиной нас! ✨",
      content: "Привет, моя радость! Сегодня особенный день — нашим отношениям исполнилось 2 месяца. Я хотел создать что-то такое же волшебное, теплое и уникальное, как и время, проведенное с тобой. Добро пожаловать в Talia — наш личный цифровой островок, где не существует расстояний, а есть только мы и наши чувства.",
      icon: "🎁",
      color: "bg-pink-100"
    },
    {
      title: "Наш Арчи 🐕",
      content: "Познакомься поближе с Арчи. Он не просто цифровой пес, он — отражение нашей заботы друг о друге. Он чувствует нашу энергию, радуется, когда мы вместе заходим сюда, и грустит, если мы долго не заглядываем. Заботясь о нем, мы делаем наш общий мир чуть ярче и уютнее.",
      icon: "⭐",
      color: "bg-amber-100",
      q: "Как за ним ухаживать?",
      a: "На главной странице нажми на карточку Арчи. Откроется целое меню: корми его вкусняшками, наливай свежую воду и обязательно гладь! За каждое действие он получает опыт (XP). Повышай его уровень, чтобы открывать новые титулы и секретные факты из его звездной биографии!"
    },
    {
      title: "Слепки моментов 📸",
      content: "Время летит быстро, но здесь мы можем его остановить. Галерея 'Слепки моментов' — это наш цифровой альбом, где каждое фото превращается в полароидный снимок. Это не просто склад картинок, а настоящая доска памяти, которую мы будем заполнять вместе, шаг за шагом.",
      icon: "🎨",
      color: "bg-blue-100",
      q: "Что тут особенного?",
      a: "Зайди в 'Галерею' через меню. Нажимай 'Снять', чтобы добавить новый момент. Каждое фото можно подписать и выбрать для него категорию. Попробуй нажать 'Вспомнить' — Talia выберет случайный теплый момент из прошлого, чтобы согреть тебя прямо сейчас."
    },
    {
      title: "Послание в бутылке 🍾",
      content: "Я добавил кое-что особенное. Каждый день в Talia приплывает 'Послание в бутылке'. Это короткие, но важные слова, которые я подготовил для тебя. Они обновляются ежедневно и доступны только 24 часа. Это наш способ сказать друг другу что-то важное, даже когда мы заняты.",
      icon: "🌊",
      color: "bg-cyan-100",
      q: "Где искать послания?",
      a: "Ищи иконку бутылки в океане Talia на главной странице. Нажми на неё, чтобы откупорить и прочитать, что скрыто внутри сегодня. Это маленькая капля нежности в твоем дне."
    },
    {
      title: "Магия в деталях 🪄",
      content: "Разламывай печенье судьбы, чтобы получить смелое предсказание, читай удивительные факты о мире животных (они такие милые!) и следи за нашим общим таймером. Каждая деталь здесь создана с любовью и мыслями о тебе.",
      icon: "🔮",
      color: "bg-purple-100",
      q: "Что еще за печенье?",
      a: "На главной странице есть раздел 'Fortune'. Нажми 'Разломить печенье', и ты увидишь предсказание, которое я подготовил специально для нас. Но будь осторожна — магия печенья срабатывает только один раз в сутки!"
    }
  ];

  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-[#fefce8]/90 backdrop-blur-xl p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-2xl bg-white rounded-[3rem] border-8 border-[#e6d5bc] shadow-2xl overflow-hidden flex flex-col min-h-[500px]"
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#f5e6d3] flex">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "flex-1 transition-all duration-500",
                i <= currentSlide ? "bg-[#5c4a33]" : "bg-transparent"
              )} 
            />
          ))}
        </div>

        <div className="flex-1 p-8 md:p-12 flex flex-col items-center text-center justify-center space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className={cn("w-24 h-24 rounded-[2rem] flex items-center justify-center text-5xl mx-auto shadow-xl border-4 border-white rotate-3", slides[currentSlide].color)}>
                {slides[currentSlide].icon}
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#5c4a33]">{slides[currentSlide].title}</h2>
                <p className="text-[#8b7355] text-lg leading-relaxed font-medium italic">
                  "{slides[currentSlide].content}"
                </p>
              </div>

              {slides[currentSlide].q && (
                <div className="pt-4 space-y-3">
                  <button 
                    onClick={() => setShowAnswer(!showAnswer)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f5e6d3] text-[#5c4a33] text-sm font-bold hover:bg-[#e6d5bc] transition-colors"
                  >
                    <HelpCircle size={18} />
                    {slides[currentSlide].q}
                  </button>
                  <AnimatePresence>
                    {showAnswer && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-[#fdfaf3] p-4 rounded-2xl border-2 border-[#e6d5bc] text-sm text-[#8b7355] font-bold leading-relaxed">
                          {slides[currentSlide].a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-8 border-t-2 border-[#e6d5bc] bg-[#fdfaf3] flex justify-between items-center">
          <button 
            onClick={() => {
              if (currentSlide > 0) {
                setCurrentSlide(currentSlide - 1);
                setShowAnswer(false);
              }
            }}
            className={cn(
              "text-[#8b7355] font-black uppercase text-[10px] tracking-widest transition-opacity",
              currentSlide === 0 ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
          >
            ← Назад
          </button>
          
          <button 
            onClick={() => {
              if (currentSlide < slides.length - 1) {
                setCurrentSlide(currentSlide + 1);
                setShowAnswer(false);
              } else {
                onComplete();
              }
            }}
            className="px-8 py-4 rounded-2xl bg-[#5c4a33] text-[#fdfaf3] font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            {currentSlide === slides.length - 1 ? (
              <>Начать приключение <CheckCircle2 size={18} /></>
            ) : (
              <>Далее <ChevronRight size={18} /></>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
