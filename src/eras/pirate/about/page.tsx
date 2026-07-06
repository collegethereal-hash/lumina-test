'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Anchor, Skull, Compass, Sword, Ship, 
  Map as MapIcon, Gem, Beer, Coins, 
  Scroll, Fish, Music, Wind, Waves, Sparkles, 
  ChevronRight, Trees, Info, Target, Trophy, MessageCircle, Play,
  BookOpen, Star, Shield, Heart, Zap
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const chronicleSections = [
  {
    id: "bay",
    number: "I",
    title: "Экран «Бухта»",
    lore: "Здесь ты можешь поговорить с попугаем Коко.",
    icon: Anchor,
    points: [
      "3D-обзор бухты: смотришь вокруг и погружаешься в атмосферу.",
      "Личный разговор: поговорить с психологом и поделиться своими проблемами.",
      "Наша бухта: решать проблемы отношений вместе с партнёром."
    ],
    alignment: "left"
  },
  {
    id: "fishing",
    number: "II",
    title: "Экран «Рыбалка»",
    lore: "Мини-игра, где ты ловишь рыбу и собираешь коллекцию.",
    icon: Fish,
    points: [
      "Лови рыбу: жди поклевки и нажимай в нужный момент.",
      "Аквариум: заботься о рыбах, корми и украшай их дом.",
      "Костёр: посидеть, расслабиться и общаться в чате друг с другом."
    ],
    alignment: "right"
  },
  {
    id: "music",
    number: "III",
    title: "Экран «Музыка»",
    lore: "Создаем атмосферу: звуки моря или твои любимые треки.",
    icon: Music,
    points: [
      "Фоновые звуки: подбираешь атмосферу для сайта.",
      "Добавляй любимые треки: сохраняй и переслушивай их.",
      "Трек дня: каждый день новая мелодия для настроения."
    ],
    alignment: "left"
  },
  {
    id: "code",
    number: "IV",
    title: "Экран «Кодекс»",
    lore: "Здесь мы храним наши законы.",
    icon: Scroll,
    points: [
      "Закон чести: пишем наши правила, которые мы не нарушаем."
    ],
    alignment: "right"
  },
  {
    id: "stats",
    number: "V",
    title: "Экран «Острова»",
    lore: "Викторина, чтобы узнавать друг друга лучше.",
    icon: Compass,
    points: [
      "Викторина на разные категории: отвечай на вопросы.",
      "Узнай друг друга: выигрывай и проигрывай, но главное — узнавай."
    ],
    alignment: "left"
  },
  {
    id: "games",
    number: "VI",
    title: "Экран «Каюта»",
    lore: "Место для совместных игр и проверки удачи.",
    icon: Coins,
    points: [
      "Крэш-корабль: ставь золото и жди, пока лодка не взорвётся.",
      "Классические игры: блэкджек, слоты и лотерея.",
      "Правда или дело: игра для двоих, чтобы узнать друг друга лучше."
    ],
    alignment: "right"
  }
];

export default function PirateAboutPage() {
  return (
    <div className="min-h-screen bg-[#fdf6e3] text-[#3e2723] font-serif selection:bg-amber-600/20 selection:text-amber-900">
      {/* Background Textures */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/5 via-transparent to-amber-900/10" />
      </div>

      {/* Hero Section */}
      <header className="relative py-20 px-6 border-b-[8px] border-amber-900/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Левая часть: текст с декором */}
          <div className="space-y-5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
              <div className="h-[1px] w-16 md:w-24 bg-amber-900/30" />
              <span className="text-amber-700/70 font-black uppercase tracking-[0.4em] text-xs">
                Карта твоих островов
              </span>
              <div className="h-[1px] w-16 md:w-24 bg-amber-900/30" />
            </div>
            
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold text-amber-950 uppercase tracking-tight">
                Легенда <span className="text-amber-600">Тортуги</span>
              </h1>
              
              <p className="text-amber-900/60 italic text-lg">
                Полный справочник: что где находится и как этим пользоваться.
              </p>
            </div>
          </div>

          {/* Правая часть: кнопка */}
          <Link href="/" className="flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.05, rotate: -1, y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-4 px-12 py-6 bg-[#fdf6e3] text-amber-950 border-[4px] border-amber-900/20 rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm hover:bg-white transition-all"
            >
              <ChevronRight className="rotate-180" size={20} />
              Вернуться в бухту
            </motion.button>
          </Link>
        </div>
      </header>

      {/* Main Content - Narrative Layout */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-16 relative z-10 space-y-24">
        {chronicleSections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <React.Fragment key={section.id}>
              <motion.section 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                className={cn(
                  "flex flex-col md:flex-row items-center gap-8 md:gap-16",
                  section.alignment === "right" ? "md:flex-row-reverse text-right" : "text-left"
                )}
              >
                {/* Visual Side */}
                <div className="flex-1 relative group">
                  <div className="relative w-72 h-72 md:w-96 md:h-96 mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-100/80 via-amber-300/30 to-amber-600/20 rounded-full blur-3xl animate-pulse group-hover:bg-gradient-to-br group-hover:from-amber-50/90 group-hover:via-amber-400/40 group-hover:to-amber-600/30 transition-all duration-700" />
                    <div className="relative w-full h-full border-2 border-amber-900/10 rounded-[3rem] flex items-center justify-center bg-white/30 backdrop-blur-sm shadow-xl transition-transform duration-700 group-hover:rotate-3 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-300/10 via-amber-500/15 to-amber-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <Icon size={120} strokeWidth={0.5} className="text-amber-600/80 group-hover:text-amber-500 relative z-10 transition-colors duration-500" />
                        
                        {/* Section Number */}
                        <div className={cn(
                          "absolute top-4 left-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-700 to-amber-950 text-white flex items-center justify-center font-black text-2xl shadow-xl rotate-[-10deg]",
                          section.alignment === "right" ? "left-auto right-4 rotate-[10deg]" : ""
                        )}>
                          {section.number}
                        </div>
                    </div>
                  </div>
                </div>

                {/* Content Side */}
                <div className="flex-[1.2] space-y-6">
                  <div className="space-y-3">
                    <h2 className="text-4xl md:text-5xl font-bold text-amber-950 uppercase tracking-tighter">
                      {section.title}
                    </h2>
                    <p className="text-lg md:text-xl text-amber-700 italic font-medium leading-relaxed">
                      {section.lore}
                    </p>
                  </div>

                  <div className={cn(
                    "flex flex-col gap-5",
                    section.alignment === "right" ? "items-end" : "items-start"
                  )}>
                    {section.points.map((point, i) => (
                      <div key={i} className="flex gap-3 max-w-lg group/item">
                        <div className={cn(
                          "mt-2.5 w-2 h-2 shrink-0 rounded-full bg-amber-500 group-hover/item:scale-150 transition-transform",
                          section.alignment === "right" ? "order-last" : ""
                        )} />
                        <p className="text-amber-900/80 leading-relaxed font-serif text-lg italic whitespace-nowrap overflow-ellipsis">
                          {point}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.section>

              {/* Decorative Separator */}
              {idx !== chronicleSections.length - 1 && (
                <motion.div 
                  initial={{ opacity: 0, scaleX: 0 }}
                  whileInView={{ opacity: 1, scaleX: 1 }}
                  viewport={{ once: true }}
                  className="flex items-center justify-center gap-6 py-8"
                >
                  <div className="h-[1px] w-24 md:w-32 bg-gradient-to-r from-transparent via-amber-900/20 to-transparent" />
                  <div className="text-amber-900/10 flex gap-3">
                     <Waves size={18} />
                     <Anchor size={18} className="rotate-12" />
                     <Waves size={18} />
                  </div>
                  <div className="h-[1px] w-24 md:w-32 bg-gradient-to-r from-transparent via-amber-900/20 to-transparent" />
                </motion.div>
              )}
            </React.Fragment>
          );
        })}
      </main>

      {/* Minimal Footer */}
      <footer className="py-12 text-center opacity-30">
         <p className="text-[10px] font-black uppercase tracking-[0.8em] text-amber-900">
           Talia &bull; Pirates &bull; 2026
         </p>
      </footer>
    </div>
  );
}
