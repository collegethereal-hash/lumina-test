'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useEra } from '@/context/EraContext';
import { useAdminSettings } from '@/context/AdminSettingsContext';
import { motion } from 'framer-motion';
import { Settings, RefreshCw, Ship, Trees, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const translations = {
  ru: {
    title: "Talia Control",
    subtitle: "Настройка уютной реальности",
    eras: "Эпохи",
    settings: "Настройки",
    badge: "Переключатель настроения",
    heading: "Выберите текущую эпоху",
    paliaName: "Palia Era",
    paliaDesc: "Самый уютный архив! Конабёво, цветы, пастельные тона и тишина.",
    pirateName: "Pirate Era",
    pirateDesc: "Для искателей приключений! Ром, золото, бушующее море.",
    active: "Активна",
    activate: "Активировать"
  },
  en: {
    title: "Talia Control",
    subtitle: "Customizing our cozy reality",
    eras: "Eras",
    settings: "Settings",
    badge: "Mood switcher",
    heading: "Choose current era",
    paliaName: "Palia Era",
    paliaDesc: "The coziest archive! Konabe, flowers, pastel tones and silence.",
    pirateName: "Pirate Era",
    pirateDesc: "For adventure seekers! Rum, gold, raging sea.",
    active: "Active",
    activate: "Activate"
  },
  fr: {
    title: "Talia Control",
    subtitle: "Personnaliser notre réalité douillette",
    eras: "Époques",
    settings: "Paramètres",
    badge: "Interrupteur d'humeur",
    heading: "Choisissez l'époque actuelle",
    paliaName: "Palia Era",
    paliaDesc: "L'archive la plus douillette ! Konabe, fleurs, tons pastels et silence.",
    pirateName: "Pirate Era",
    pirateDesc: "Pour les chercheurs d'aventure ! Rhum, or, mer déchainée.",
    active: "Active",
    activate: "Activer"
  }
};

export default function AdminPage() {
  const { currentEra, setEra } = useEra();
  const { adminTheme, adminLanguage } = useAdminSettings();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const t = translations[adminLanguage];
  const isPalia = adminTheme === 'palia';
  
  const paliaColors = {
    bg: "bg-[#fdf8ed]",
    cardBg: "bg-white/80 backdrop-blur-xl",
    cardBorder: "border-[#e6d5bc]",
    text: "text-[#5c4a33]",
    textMuted: "text-[#8b7355]/70",
    accent: "bg-[#f5e6d3]",
    accentBorder: "border-[#e6d5bc]",
    btnActive: "bg-[#5c4a33] text-white"
  };
  
  const pirateColors = {
    bg: "bg-[#f4ebd0]",
    cardBg: "bg-[#f2e2ba]/80 backdrop-blur-xl",
    cardBorder: "border-[#3e2723]/10",
    text: "text-[#3e2723]",
    textMuted: "text-[#5d4037]/80",
    accent: "bg-[#f4ebd0]",
    accentBorder: "border-[#3e2723]/10",
    btnActive: "bg-[#8b4513] text-white"
  };
  
  const colors = isPalia ? paliaColors : pirateColors;

  const handleEraSwitch = async (era: 'palia' | 'pirate') => {
    setIsUpdating(true);
    await setEra(era);
    setTimeout(() => setIsUpdating(false), 500);
  };

  return (
    <div className={cn("min-h-screen p-8 pb-40 font-sans relative overflow-hidden", colors.bg)}>
      {/* Paper texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
      
      <div className="max-w-4xl mx-auto space-y-10 relative z-10">
        {/* Header */}
        {isPalia ? (
          <header className={cn(
            "flex items-center justify-between rounded-[2.5rem] p-8 shadow-2xl border-4 relative overflow-hidden",
            colors.cardBg,
            colors.cardBorder
          )}>
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
            
            <div className="flex items-center gap-6 relative z-10">
              <div className="p-4 rounded-[2rem] shadow-xl bg-gradient-to-br from-[#f5e6d3] to-[#e6d5bc] shadow-inner">
                <motion.div
                  animate={isUpdating ? { rotate: 360 } : {}}
                  transition={{ duration: 1.5, repeat: isUpdating ? Infinity : 0, ease: "linear" }}
                >
                  <Settings size={36} className="text-[#5c4a33]" />
                </motion.div>
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent font-serif bg-gradient-to-r from-[#5c4a33] to-[#8b7355]">
                  {t.title}
                </h1>
                <p className={cn("text-sm mt-2 flex items-center gap-2 font-medium", colors.textMuted)}>
                  <RefreshCw size={16} className="opacity-50" />
                  {t.subtitle}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 relative z-10">
              <button className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-xl hover:scale-105 border-3 border-white",
                colors.accent,
                colors.accentBorder,
                colors.text,
                "shadow-inner"
              )}>
                <Sparkles size={20} />
                {t.eras}
              </button>
              <Link href="/admin/settings">
                <button className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all hover:scale-105",
                  colors.textMuted,
                  "hover:" + colors.text
                )}>
                  {t.settings}
                </button>
              </Link>
            </div>
          </header>
        ) : (
          <header className="relative p-1 bg-[#3e2723]/5 rounded-[2.5rem] group">
            <div className="flex items-center justify-between rounded-[2.3rem] p-8 shadow-2xl border-[10px] border-[#3e2723]/10 relative overflow-hidden bg-[#f2e2ba]">
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
              
              <div className="flex items-center gap-6 relative z-10">
                <div className="p-4 rounded-[2rem] shadow-xl bg-gradient-to-br from-[#d4a574] to-[#8b4513] shadow-lg">
                  <motion.div
                    animate={isUpdating ? { rotate: 360 } : {}}
                    transition={{ duration: 1.5, repeat: isUpdating ? Infinity : 0, ease: "linear" }}
                  >
                    <Settings size={36} className="text-white" />
                  </motion.div>
                </div>
                <div>
                  <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent font-serif bg-gradient-to-r from-[#3e2723] to-[#8b4513]">
                    {t.title}
                  </h1>
                  <p className="text-sm mt-2 flex items-center gap-2 font-medium text-[#5d4037]/80">
                    <RefreshCw size={16} className="opacity-50" />
                    {t.subtitle}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="relative p-1 bg-[#3e2723]/5 rounded-[1.5rem]">
                  <button className="flex items-center gap-2 px-6 py-3 rounded-[1.3rem] text-sm font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-xl hover:scale-105 border-3 border-[#3e2723]/10 bg-[#f4ebd0] text-[#3e2723] shadow-lg">
                    <Sparkles size={20} />
                    {t.eras}
                  </button>
                </div>
                <Link href="/admin/settings">
                  <button className="flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all hover:scale-105 text-[#5d4037]/80 hover:text-[#3e2723]">
                    {t.settings}
                  </button>
                </Link>
              </div>
            </div>
          </header>
        )}

        {/* Badge */}
        <div className="flex justify-center">
          {isPalia ? (
            <span className={cn(
              "inline-flex items-center px-8 py-3 rounded-[1.5rem] text-xs font-black tracking-[0.2em] uppercase shadow-lg border-2 border-white/50",
              colors.accent,
              colors.text
            )}>
              {t.badge}
            </span>
          ) : (
            <div className="relative p-1 bg-[#3e2723]/5 rounded-[1.5rem]">
              <span className={cn(
                "inline-flex items-center px-8 py-3 rounded-[1.3rem] text-xs font-black tracking-[0.2em] uppercase shadow-lg border-[3px] border-[#3e2723]/10",
                colors.accent,
                colors.text
              )}>
                {t.badge}
              </span>
            </div>
          )}
        </div>

        {/* Section Heading */}
        <h2 className={cn("text-4xl font-black text-center font-serif", colors.text)}>
          {t.heading}
        </h2>

        {/* Era Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Palia Era Card */}
          <EraOption
            id="palia"
            name={t.paliaName}
            desc={t.paliaDesc}
            icon={<Trees size={52} strokeWidth={2} />}
            isActive={currentEra === 'palia'}
            onClick={() => handleEraSwitch('palia')}
            adminTheme={adminTheme}
            activeLabel={t.active}
            inactiveLabel={t.activate}
          />

          {/* Pirate Era Card */}
          <EraOption
            id="pirate"
            name={t.pirateName}
            desc={t.pirateDesc}
            icon={<Ship size={52} strokeWidth={2} />}
            isActive={currentEra === 'pirate'}
            onClick={() => !isUpdating && handleEraSwitch('pirate')}
            adminTheme={adminTheme}
            activeLabel={t.active}
            inactiveLabel={t.activate}
            isUnavailable={true}
          />
        </div>
      </div>
    </div>
  );
}

interface EraOptionProps {
  id: string;
  name: string;
  desc: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  adminTheme: 'palia' | 'pirate';
  activeLabel: string;
  inactiveLabel: string;
  isUnavailable?: boolean;
}

function EraOption({ id, name, desc, icon, isActive, onClick, adminTheme, activeLabel, inactiveLabel, isUnavailable }: EraOptionProps) {
  const isAdminPalia = adminTheme === 'palia';
  
  const paliaAdminColors = {
    card: {
      active: "bg-gradient-to-br from-white via-white to-emerald-100 border-emerald-300",
      inactive: "bg-white/60 border-[#e6d5bc]"
    },
    icon: {
      active: "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white",
      inactive: "bg-[#f5e6d3] text-[#8b7355] border-[#e6d5bc]"
    },
    btn: {
      active: "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white border-white",
      inactive: "bg-[#f5e6d3] text-[#5c4a33] border-[#e6d5bc]"
    },
    text: {
      active: "text-emerald-800",
      inactive: "text-[#5c4a33]",
      muted: "text-[#8b7355]/70"
    },
    check: "bg-emerald-500"
  };
  
  const pirateAdminColors = {
    card: {
      active: "bg-gradient-to-br from-[#f2e2ba] via-[#f2e2ba] to-[#e6d5b8] border-[#3e2723]/10",
      inactive: "bg-[#f2e2ba]/60 border-[#3e2723]/10"
    },
    icon: {
      active: "bg-gradient-to-br from-[#d4a574] to-[#8b4513] text-white",
      inactive: "bg-[#f4ebd0] text-[#3e2723] border-[#3e2723]/10"
    },
    btn: {
      active: "bg-gradient-to-br from-[#d4a574] to-[#8b4513] text-white border-white",
      inactive: "bg-[#f4ebd0] text-[#3e2723] border-[#3e2723]/10"
    },
    text: {
      active: "text-[#3e2723]",
      inactive: "text-[#3e2723]",
      muted: "text-[#5d4037]/80"
    },
    check: "bg-[#8b4513]"
  };
  
  const c = isAdminPalia ? paliaAdminColors : pirateAdminColors;
  
  // Option colors now depend on adminTheme, not on era type
  const optionColors = isAdminPalia 
    ? { bg: "from-white via-white to-emerald-100", border: "border-emerald-300", iconBg: "bg-gradient-to-br from-emerald-400 to-emerald-600", btnBg: "bg-gradient-to-br from-emerald-400 to-emerald-600", text: "text-emerald-800", checkBg: "bg-emerald-500" }
    : { bg: "from-[#f2e2ba] via-[#f2e2ba] to-[#e6d5b8]", border: "border-[#3e2723]/10", iconBg: "bg-gradient-to-br from-[#d4a574] to-[#8b4513]", btnBg: "bg-gradient-to-br from-[#d4a574] to-[#8b4513]", text: "text-[#3e2723]", checkBg: "bg-[#8b4513]" };
  
  // Если пиратская тема - делаем двойную обводку
  if (!isAdminPalia) {
    return (
      <motion.div
        whileHover={isUnavailable ? {} : { y: -6, scale: 1.02 }}
        whileTap={isUnavailable ? {} : { scale: 0.98 }}
        onClick={isUnavailable ? undefined : onClick}
        className={cn(
          "relative p-1 bg-[#3e2723]/5 rounded-[3rem] group",
          isUnavailable ? "cursor-not-allowed grayscale-[0.5] opacity-80" : "cursor-pointer"
        )}
      >
        <div className={cn(
          "relative px-16 py-8 rounded-[2.8rem] border-[6px] transition-all flex flex-col items-center text-center space-y-5 overflow-hidden shadow-xl hover:shadow-2xl",
          isActive ? `bg-gradient-to-br ${optionColors.bg} ${optionColors.border}` : c.card.inactive
        )}>
          {/* Unavailable Ribbon */}
          {isUnavailable && (
            <div className="absolute top-0 right-0 z-30 pointer-events-none overflow-hidden w-32 h-32">
              <div className="absolute top-6 -right-8 w-40 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rotate-45 shadow-lg text-center border-y border-white/20">
                Недоступно
              </div>
            </div>
          )}
          
          {/* Paper texture */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
          
          {isActive && (
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -180 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="absolute top-8 right-8 z-20"
            >
              <div className={cn("p-3 rounded-2xl shadow-xl border-3 border-[#3e2723]/30", optionColors.checkBg)}>
                <CheckCircle2 size={28} className="text-white" />
              </div>
            </motion.div>
          )}

          <motion.div
            whileHover={{ rotate: 12, scale: 1.1 }}
            className={cn(
              "w-32 h-32 rounded-[2.5rem] flex items-center justify-center shadow-2xl transition-all duration-300 relative z-10",
              isActive ? optionColors.iconBg : "bg-amber-100/50 shadow-lg border-3 border-amber-600/30"
            )}
          >
            <div className={isActive ? "text-white" : "text-[#5d4037]"}>
              {icon}
            </div>
          </motion.div>

          <div className="space-y-4 relative z-10">
            <h4 className={cn(
              "text-3xl font-black uppercase tracking-tight font-serif",
              isActive ? optionColors.text : c.text.inactive
            )}>
              {name}
            </h4>
            <p className={cn(
              "text-sm leading-relaxed font-medium",
              isActive ? optionColors.text : c.text.muted
            )}>
              «{desc}»
            </p>
          </div>

          <button className={cn(
            "px-10 py-4 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-xl hover:scale-105 relative z-10",
            isActive ? `${optionColors.btnBg} text-white` : "bg-amber-100/50 text-[#3e2723] shadow-lg"
          )}>
            {isActive ? activeLabel : inactiveLabel}
          </button>
        </div>
      </motion.div>
    );
  }
  
  // Паллианская тема - обычная обводка
  return (
    <motion.div
      whileHover={isUnavailable ? {} : { y: -6, scale: 1.02 }}
      whileTap={isUnavailable ? {} : { scale: 0.98 }}
      onClick={isUnavailable ? undefined : onClick}
      className={cn(
        "relative px-16 py-8 rounded-[3rem] border-4 transition-all flex flex-col items-center text-center space-y-5 overflow-hidden shadow-xl hover:shadow-2xl bg-white/80 backdrop-blur-xl",
        isActive ? `bg-gradient-to-br ${optionColors.bg} ${optionColors.border}` : c.card.inactive,
        isUnavailable ? "cursor-not-allowed grayscale-[0.5] opacity-80" : "cursor-pointer"
      )}
    >
      {/* Unavailable Ribbon */}
      {isUnavailable && (
        <div className="absolute top-0 right-0 z-30 pointer-events-none overflow-hidden w-32 h-32">
          <div className="absolute top-6 -right-8 w-40 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rotate-45 shadow-lg text-center border-y border-white/20">
            Недоступно
          </div>
        </div>
      )}

      {/* Paper texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
      
      {isActive && (
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -180 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="absolute top-8 right-8 z-20"
        >
          <div className={cn("p-3 rounded-2xl shadow-xl border-3 border-white", optionColors.checkBg)}>
            <CheckCircle2 size={28} className="text-white" />
          </div>
        </motion.div>
      )}

      <motion.div
        whileHover={{ rotate: 12, scale: 1.1 }}
        className={cn(
          "w-32 h-32 rounded-[2.5rem] flex items-center justify-center shadow-2xl transition-all duration-300 relative z-10",
          isActive ? optionColors.iconBg : "bg-[#f5e6d3] shadow-inner border-3 border-[#e6d5bc]"
        )}
      >
        <div className={isActive ? "text-white" : "text-[#8b7355]"}>
          {icon}
        </div>
      </motion.div>

      <div className="space-y-4 relative z-10">
        <h4 className={cn(
          "text-3xl font-black uppercase tracking-tight font-serif",
          isActive ? optionColors.text : c.text.inactive
        )}>
          {name}
        </h4>
        <p className={cn(
          "text-sm leading-relaxed font-medium",
          isActive ? optionColors.text : c.text.muted
        )}>
          «{desc}»
        </p>
      </div>

      <button className={cn(
        "px-10 py-4 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-xl hover:scale-105 relative z-10",
        isActive ? `${optionColors.btnBg} text-white` : "bg-[#f5e6d3] text-[#5c4a33] shadow-inner"
      )}>
        {isActive ? activeLabel : inactiveLabel}
      </button>
    </motion.div>
  );
}
