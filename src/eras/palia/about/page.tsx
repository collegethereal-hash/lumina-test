'use client';

import { motion } from 'framer-motion';
import { 
  Heart, Sparkles, Camera, Book, Star, Flame, 
  Waves, Anchor, Trophy, Map, ShieldCheck, 
  Zap, Utensils, Droplets, Clock, X, ChevronRight, Info
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const categories = [
  {
    title: "📸 Снимки моментов",
    desc: "Где время останавливается специально для нас",
    color: "bg-blue-50",
    items: [
      { 
        q: "🖼️ Полароидная магия", 
        a: "Все фото в галерее автоматически превращаются в полароиды. Это делает каждое воспоминание осязаемым, как будто мы прикололи его на настоящую доску."
      },
      { 
        q: "🔍 Кнопка 'Вспомнить'", 
        a: "Если нахлынет ностальгия, нажми на кнопку Вспомнить в галерее. Talia выберет случайное фото из глубины памяти, чтобы напомнить как нам было круто."
      },
      { 
        q: "🏷️ Порядок в памяти", 
        a: "Ты можешь удалять и создавать разные категории для наших воспоминаний, чтобы не потеряться в нашем цифровом альбоме."
      }
    ]
  },
  {
    title: "🌊 Секреты Океана",
    desc: "Маленькие детали, создающие большую магию",
    color: "bg-cyan-50",
    items: [
      { 
        q: "🍾 Послания в бутылке", 
        a: "Каждое утро к берегу приплывает новая бутылка. В ней скрыты добрые и мотивирующие слова, которые напомнят о важном и поднимут настроение на весь день."
      },
      { 
        q: "🥠 Печенье Судьбы (Fortune)", 
        a: "Это не просто предсказания, это вызовы! Печенье может посоветовать нам что-то безумное или очень романтичное. Разламывай его, когда нужно вдохновение."
      },
      { 
        q: "🔭 Звездные Факты", 
        a: "Talia знает тысячи удивительных фактов о нашем мире. Читай их, когда хочешь узнать что-то новое и поделиться этим со мной. Магия в знаниях!"
      }
    ]
  },
  {
    title: "📖 Журнал и Архив",
    desc: "Твоя личная летопись наших отношений",
    color: "bg-emerald-50",
    items: [
      { 
        q: "📜 Твоя история дня", 
        a: "Каждый день оставляй здесь одну искреннюю запись о том, что произошло. Делись успехами, мыслями или просто важными моментами дня, как в сторис, только для нас двоих."
      },
      { 
        q: "📊 Аналитика чувств", 
        a: "В архиве ты можешь увидеть, как часто мы заботимся друг о друге. Это не просто цифры, это график нашей привязанности и внимания."
      },
      { 
        q: "🎖️ Наши Вехи", 
        a: "Каждый наш месяц, каждая сотня фотографий и каждый новый уровень Арчи отмечаются здесь как важная победа нашей любви и совместного пути."
      }
    ]
  },
  {
    title: "⏳ Капсулы времени",
    desc: "Послания, которые ждут своего часа",
    color: "bg-purple-50",
    items: [
      { 
        q: "🔒 Что такое капсула?", 
        a: "Это фото или текст, который мы запечатываем сегодня, но открыть сможем только через месяц, полгода или год. Маленький подарок будущим нам."
      },
      { 
        q: "🔑 Как это работает?", 
        a: "Ты выбираешь дату открытия, и Talia надежно прячет капсулу. До наступления срока её нельзя увидеть — она будет ждать своего момента в секретном разделе."
      },
      { 
        q: "🔔 Звонок из прошлого", 
        a: "Когда придет время открыть капсулу, Talia пришлет тебе нежное напоминание. Это будет как теплое письмо от нас самих, отправленное сквозь время."
      }
    ]
  },
  {
    title: "✉️ Письма любви",
    desc: "Самый искренний способ общения",
    color: "bg-pink-50",
    items: [
      { 
        q: "📝 Как отправить письмо?", 
        a: "В разделе писем ты можешь написать длинное, вдумчивое послание. Оно не исчезнет через 24 часа, как бутылка, а останется в твоем почтовом ящике."
      },
      { 
        q: "🗑️ Как удалять письма?", 
        a: "Если письмо выполнило свою задачу, его можно бережно 'сжечь' (удалить). Но помни: в Talia мы стараемся хранить только то, что действительно греет душу."
      },
      { 
        q: "✍️ Твой почерк", 
        a: "В письмах ты можешь быть собой. Здесь нет ограничений по количеству символов или времени — только искренность и глубина твоих мыслей."
      }
    ]
  },
  {
    title: "🐕 Звездный пес Арчи",
    desc: "Твой верный спутник и хранитель нашей связи",
    color: "bg-amber-50",
    items: [
      { 
        q: "✨ Как Арчи помогает нам?", 
        a: "Арчи — это живое воплощение наших чувств. Он растет и становится сильнее, когда мы заботимся о нем. Его уровень (Lvl) — это показатель нашей совместной ответственности и тепла."
      },
      { 
        q: "📈 Система опыта (XP) и уровни", 
        a: "Каждое действие дает 10 XP. Наполнила миску? +10 XP. Погладила? +10 XP. С каждым уровнем Арчи получает новый титул: от 'Звездного щенка' до 'Божества Уюта'."
      },
      { 
        q: "🔥 Серия заботы (Streak)", 
        a: "Если заходить в Talia каждый день и совершать хотя бы одно действие, твоя серия (Flame) будет расти. Это наш общий огонек, который нельзя давать погаснуть!"
      }
    ]
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fdfaf3] pb-32">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#f0f9ff]/50 via-transparent to-[#fdf2f8]/50" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#0ea5e9]/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#ec4899]/5 rounded-full blur-[120px]" />
      </div>

      {/* Hero Section */}
      <header className="relative h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden bg-[#fdfaf3] border-b-8 border-[#e6d5bc]/30 shadow-[15px_15px_40px_rgba(0,0,0,0.08)]">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#5c4a33_1px,transparent_1px)] [background-size:32px_32px]" />
        
        <Link href="/" className="absolute top-8 left-8 z-[60]">
          <motion.button
            whileHover={{ x: -5 }}
            className="flex items-center gap-2 text-[#8b7355] font-black uppercase text-xs tracking-widest bg-[#fdfaf3]/50 backdrop-blur-md px-6 py-3 rounded-2xl border-4 border-[#e6d5bc]/30 shadow-sm"
          >
            ← Вернуться
          </motion.button>
        </Link>

        <div className="relative text-center space-y-4 px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif font-bold text-[#5c4a33] tracking-tight"
          >
            Библиотека Talia
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[#8b7355] italic text-xl md:text-2xl max-w-2xl mx-auto font-medium"
          >
            "Добро пожаловать в наш мир"
          </motion.p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-20 pb-40 md:pb-52 relative z-10 space-y-24">
        {/* Detailed Info Categories */}
        <div className="grid grid-cols-1 gap-12">
          {categories.map((cat, idx) => (
            <section key={cat.title} className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-[#e6d5bc] pb-6">
                <div className="space-y-2">
                  <h2 className="text-4xl font-serif font-bold text-[#5c4a33]">{cat.title}</h2>
                  <p className="text-xl text-[#8b7355] italic font-medium">{cat.desc}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {cat.items.map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -5 }}
                    className="bg-[#fdfaf3] p-8 rounded-[3rem] border-8 border-[#e6d5bc]/30 shadow-[15px_15px_40px_rgba(0,0,0,0.08)] space-y-6 relative overflow-hidden group"
                  >
                    <div className="space-y-3 relative z-10">
                      <h4 className="font-black uppercase text-xs tracking-widest text-[#8b7355]">
                        {item.q}
                      </h4>
                      <p className="text-[#5c4a33] leading-relaxed italic text-lg text-center md:text-left">
                        "{item.a}"
                      </p>
                    </div>

                    {/* Decorative element */}
                    <div className={cn("absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity", cat.color)} />
                  </motion.div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer Info */}
        <section className="bg-[#5c4a33] p-12 rounded-[4rem] text-[#fdfaf3] text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <div className="relative z-10 space-y-4">
            <h3 className="text-3xl font-serif font-bold">Talia — Это наш с тобою дом</h3>
            <p className="max-w-2xl mx-auto text-lg text-[#fdfaf3]/80 leading-relaxed italic">
              Это наше общее обещание беречь каждый момент, даже когда мы далеко. Каждый клик здесь — это мысль друг о друге. Каждое кормление Арчи — это забота о нашем общем уюте.
            </p>
            <div className="pt-8">
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#fdfaf3] text-[#5c4a33] px-12 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-xl"
                >
                  Вернуться в наш мир
                </motion.button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
