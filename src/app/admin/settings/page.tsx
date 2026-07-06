'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminSettings } from '@/context/AdminSettingsContext';
import { useEra } from '@/context/EraContext';
import { motion } from 'framer-motion';
import { 
  Settings, 
  ArrowLeft, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Bell, 
  BellOff, 
  Globe, 
  Palette,
  CheckCircle2,
  Heart,
  Calendar,
  Download,
  Upload,
  User,
  Plus,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const translations = {
  ru: {
    title: "Настройки",
    subtitle: "Настройка уютной реальности",
    back: "Назад",
    theme: "Стиль админ панели",
    themePalia: "Palia (уютный)",
    themePirate: "Pirate (пиратский)",
    language: "Язык",
    languageSubtitle: "Выберите удобный язык интерфейса",
    sound: "Звук",
    soundSubtitle: "Нажмите чтобы включить/отключить звук",
    soundOn: "Включен",
    soundOff: "Выключен",
    notifications: "Уведомления",
    notificationsSubtitle: "Нажмите чтобы включить/отключить уведомления",
    notificationsOn: "Включены",
    notificationsOff: "Выключены",
    memories: "Наши памятные даты",
    addMemory: "Добавить дату",
    memoryDate: "Дата",
    memoryTitle: "Заголовок",
    memoryDesc: "Описание",
    delete: "Удалить",
    backup: "Резервная копия",
    backupSubtitle: "Пока недоступно — скоро!",
    backupComingSoon: "Пока недоступно",
    export: "Экспорт",
    import: "Импорт"
  },
  en: {
    title: "Settings",
    subtitle: "Customizing our cozy reality",
    back: "Back",
    theme: "Admin Panel Style",
    themePalia: "Palia (cozy)",
    themePirate: "Pirate (pirate)",
    language: "Language",
    languageSubtitle: "Choose your preferred interface language",
    sound: "Sound",
    soundSubtitle: "Click to turn sound on/off",
    soundOn: "On",
    soundOff: "Off",
    notifications: "Notifications",
    notificationsSubtitle: "Click to turn notifications on/off",
    notificationsOn: "On",
    notificationsOff: "Off",
    memories: "Our Memorable Dates",
    addMemory: "Add Date",
    memoryDate: "Date",
    memoryTitle: "Title",
    memoryDesc: "Description",
    delete: "Delete",
    backup: "Backup",
    backupSubtitle: "Coming soon!",
    backupComingSoon: "Coming soon",
    export: "Export",
    import: "Import"
  },
  fr: {
    title: "Paramètres",
    subtitle: "Personnaliser notre réalité douillette",
    back: "Retour",
    theme: "Style du panneau d'administration",
    themePalia: "Palia (chaleureux)",
    themePirate: "Pirate (pirate)",
    language: "Langue",
    languageSubtitle: "Choisissez la langue de l'interface",
    sound: "Son",
    soundSubtitle: "Cliquez pour activer/désactiver le son",
    soundOn: "Activé",
    soundOff: "Désactivé",
    notifications: "Notifications",
    notificationsSubtitle: "Cliquez pour activer/désactiver les notifications",
    notificationsOn: "Activées",
    notificationsOff: "Désactivées",
    memories: "Nos Dates Mémorables",
    addMemory: "Ajouter une Date",
    memoryDate: "Date",
    memoryTitle: "Titre",
    memoryDesc: "Description",
    delete: "Supprimer",
    backup: "Sauvegarde",
    backupSubtitle: "Bientôt disponible!",
    backupComingSoon: "Bientôt disponible",
    export: "Exporter",
    import: "Importer"
  }
};

export default function AdminSettingsPage() {
  const { 
    adminTheme, 
    setAdminTheme, 
    adminLanguage, 
    setAdminLanguage,
    soundEnabled,
    setSoundEnabled,
    notificationsEnabled,
    setNotificationsEnabled,
    memoryDates,
    addMemoryDate,
    updateMemoryDate,
    deleteMemoryDate,
    exportSettings,
    importSettings
  } = useAdminSettings();
  
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
  
  return (
    <div className={cn("min-h-screen p-8 pb-40 font-sans relative overflow-hidden", colors.bg)}>
      {/* Paper texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
      
      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        {/* Header */}
        {isPalia ? (
          <header className={cn(
            "flex items-center justify-between rounded-[2.5rem] p-8 shadow-2xl border-4 relative overflow-hidden",
            colors.cardBg,
            colors.cardBorder
          )}>
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
            
            <div className="flex items-center gap-6 relative z-10">
              <Link href="/admin" className="group">
                <div className={cn(
                  "p-4 rounded-[2rem] transition-all hover:scale-105",
                  colors.accent,
                  colors.accentBorder,
                  isPalia ? "shadow-inner" : "shadow-lg"
                )}>
                  <ArrowLeft size={36} className={colors.text} />
                </div>
              </Link>
              <div>
                <h1 className={cn(
                  "text-4xl font-black tracking-tight bg-clip-text text-transparent font-serif",
                  "bg-gradient-to-r from-[#5c4a33] to-[#8b7355]"
                )}>
                  {t.title}
                </h1>
                <p className={cn("text-sm mt-2 flex items-center gap-2 font-medium", colors.textMuted)}>
                  <Sparkles size={16} className="opacity-50" />
                  {t.subtitle}
                </p>
              </div>
            </div>
          </header>
        ) : (
          <header className="relative p-1 bg-[#3e2723]/5 rounded-[2.5rem] group">
            <div className="flex items-center justify-between rounded-[2.3rem] p-8 shadow-2xl border-[10px] border-[#3e2723]/10 relative overflow-hidden bg-[#f2e2ba]">
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
              
              <div className="flex items-center gap-6 relative z-10">
                <Link href="/admin" className="group">
                  <div className="p-4 rounded-[2rem] bg-[#f4ebd0] border-[#3e2723]/10 shadow-lg transition-all hover:scale-105">
                    <ArrowLeft size={36} className="text-[#3e2723]" />
                  </div>
                </Link>
                <div>
                  <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent font-serif bg-gradient-to-r from-[#3e2723] to-[#8d6e63]">
                    {t.title}
                  </h1>
                  <p className="text-sm mt-2 flex items-center gap-2 font-medium text-[#5d4037]/80">
                    <Sparkles size={16} className="opacity-50" />
                    {t.subtitle}
                  </p>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Settings Sections - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Notifications Toggle */}
          <SettingSection
            title={t.notifications}
            subtitle={t.notificationsSubtitle}
            icon={notificationsEnabled ? <Bell size={28} /> : <BellOff size={28} />}
            colors={colors}
            isPalia={isPalia}
          >
            <ToggleSwitch
              isActive={notificationsEnabled}
              onToggle={() => setNotificationsEnabled(!notificationsEnabled)}
              activeLabel={t.notificationsOn}
              inactiveLabel={t.notificationsOff}
              colors={colors}
              isPalia={isPalia}
            />
          </SettingSection>

          {/* Language Switcher */}
          <SettingSection
            title={t.language}
            subtitle={t.languageSubtitle}
            icon={<Globe size={28} />}
            colors={colors}
            isPalia={isPalia}
          >
            <div className="grid grid-cols-3 gap-4">
              <LanguageOption
                id="ru"
                name="Русский"
                isActive={adminLanguage === 'ru'}
                onClick={() => setAdminLanguage('ru')}
                colors={colors}
                isPalia={isPalia}
              />
              <LanguageOption
                id="en"
                name="English"
                isActive={adminLanguage === 'en'}
                onClick={() => setAdminLanguage('en')}
                colors={colors}
                isPalia={isPalia}
              />
              <LanguageOption
                id="fr"
                name="Français"
                isActive={adminLanguage === 'fr'}
                onClick={() => setAdminLanguage('fr')}
                colors={colors}
                isPalia={isPalia}
              />
            </div>
          </SettingSection>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Sound Toggle */}
          <SettingSection
            title={t.sound}
            subtitle={t.soundSubtitle}
            icon={soundEnabled ? <Volume2 size={28} /> : <VolumeX size={28} />}
            colors={colors}
            isPalia={isPalia}
          >
            <ToggleSwitch
              isActive={soundEnabled}
              onToggle={() => setSoundEnabled(!soundEnabled)}
              activeLabel={t.soundOn}
              inactiveLabel={t.soundOff}
              colors={colors}
              isPalia={isPalia}
            />
          </SettingSection>

          {/* Backup Section */}
          <SettingSection
            title={t.backup}
            subtitle={t.backupSubtitle}
            icon={<Download size={28} />}
            colors={colors}
            isPalia={isPalia}
          >
            <div className="grid grid-cols-2 gap-4">
              {!isPalia ? (
                <>
                  <div className="relative p-1 bg-[#3e2723]/5 rounded-[2rem] group cursor-not-allowed">
                    <div className="relative w-full p-3 rounded-[1.8rem] border-[6px] border-[#3e2723]/10 flex flex-col items-center text-center space-y-2 overflow-hidden bg-[#f2e2ba] opacity-50">
                      <Download size={20} className="text-[#3e2723] line-through" />
                      <span className="text-xs font-black uppercase tracking-[0.2em] font-serif text-[#3e2723] line-through">
                        {t.export}
                      </span>
                      <span className="text-[10px] text-[#3e2723]/70">{t.backupComingSoon}</span>
                    </div>
                  </div>

                  <div className="relative p-1 bg-[#3e2723]/5 rounded-[2rem] group cursor-not-allowed">
                    <div className="relative w-full p-3 rounded-[1.8rem] border-[6px] border-[#3e2723]/10 flex flex-col items-center text-center space-y-2 overflow-hidden bg-[#f2e2ba] opacity-50">
                      <Upload size={20} className="text-[#3e2723] line-through" />
                      <span className="text-xs font-black uppercase tracking-[0.2em] font-serif text-[#3e2723] line-through">
                        {t.import}
                      </span>
                      <span className="text-[10px] text-[#3e2723]/70">{t.backupComingSoon}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative w-full p-3 rounded-[2rem] border-4 flex flex-col items-center text-center space-y-2 overflow-hidden opacity-50 cursor-not-allowed">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                    <div className={cn("relative", colors.accent)}>
                      <Download size={20} className={cn(colors.text, "line-through")} />
                    </div>
                    <span className={cn("text-xs font-black uppercase tracking-[0.2em] font-serif line-through", colors.text)}>
                      {t.export}
                    </span>
                    <span className={cn("text-[10px]", colors.textMuted)}>{t.backupComingSoon}</span>
                  </div>

                  <div className="relative w-full p-3 rounded-[2rem] border-4 flex flex-col items-center text-center space-y-2 overflow-hidden opacity-50 cursor-not-allowed">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                    <div className={cn("relative", colors.accent)}>
                      <Upload size={20} className={cn(colors.text, "line-through")} />
                    </div>
                    <span className={cn("text-xs font-black uppercase tracking-[0.2em] font-serif line-through", colors.text)}>
                      {t.import}
                    </span>
                    <span className={cn("text-[10px]", colors.textMuted)}>{t.backupComingSoon}</span>
                  </div>
                </>
              )}
            </div>
          </SettingSection>
        </div>
      </div>
      </div>
    </div>
  );
}

interface Colors {
  bg: string;
  cardBg: string;
  cardBorder: string;
  text: string;
  textMuted: string;
  accent: string;
  accentBorder: string;
  btnActive: string;
}

interface SettingSectionProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  colors: Colors;
  isPalia: boolean;
}

function SettingSection({ title, subtitle, icon, children, colors, isPalia }: SettingSectionProps) {
  // Если пиратская тема - делаем двойную обводку
  if (!isPalia) {
    return (
      <div className="relative p-1 bg-[#3e2723]/5 rounded-[2.5rem] group">
        <div className="rounded-[2.3rem] p-8 shadow-2xl border-[10px] border-[#3e2723]/10 relative overflow-hidden bg-[#f2e2ba]">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
          
          <div className="relative z-10 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-[2rem] bg-[#f4ebd0] border-[#3e2723]/10 shadow-lg">
                  <div className="text-[#3e2723]">{icon}</div>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-2xl font-black tracking-tight font-serif text-[#3e2723]">
                    {title}
                  </h3>
                  {subtitle && (
                    <p className="text-[#3e2723]/60 text-sm font-serif">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="pl-0">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Паллианская тема - обычная обводка
  return (
    <div className={cn(
      "rounded-[2.5rem] p-8 shadow-2xl border-4 relative overflow-hidden",
      colors.cardBg,
      colors.cardBorder
    )}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
      
      <div className="relative z-10 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-4 rounded-[2rem]",
              colors.accent,
              colors.accentBorder,
              isPalia ? "shadow-inner" : "shadow-lg"
            )}>
              <div className={colors.text}>{icon}</div>
            </div>
            <div className="flex flex-col">
              <h3 className={cn(
                "text-2xl font-black tracking-tight font-serif",
                colors.text
              )}>
                {title}
              </h3>
              {subtitle && (
                <p className={cn("text-sm font-serif", colors.textMuted)}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="pl-0">
          {children}
        </div>
      </div>
    </div>
  );
}

interface ThemeOptionProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  colors: Colors;
  isPalia: boolean;
}

function ThemeOption({ id, name, icon, isActive, onClick, colors, isPalia }: ThemeOptionProps) {
  const isThisPalia = id === 'palia';
  const optionColors = isThisPalia 
    ? { bg: "from-white via-white to-emerald-100", border: "border-emerald-300", iconBg: "bg-emerald-500", text: "text-emerald-800" }
    : { bg: "from-white via-white to-amber-100", border: "border-amber-300", iconBg: "bg-amber-500", text: "text-amber-800" };
  
  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative w-full p-6 rounded-[2rem] border-4 cursor-pointer transition-all flex flex-col items-center text-center space-y-4 overflow-hidden shadow-lg hover:shadow-xl",
        isActive ? `bg-gradient-to-br ${optionColors.bg} ${optionColors.border}` : `${colors.accent} ${colors.accentBorder}`,
        isPalia ? "shadow-inner" : ""
      )}
    >
      {isActive && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-4 right-4"
        >
          <div className={cn("p-2 rounded-full shadow-md border-2 border-white", optionColors.iconBg)}>
            <CheckCircle2 size={20} className="text-white" />
          </div>
        </motion.div>
      )}
      <div className={cn(
        "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg",
        isActive ? optionColors.iconBg : colors.accent
      )}>
        <div className={isActive ? "text-white" : colors.text}>{icon}</div>
      </div>
      <h4 className={cn(
        "text-lg font-black uppercase tracking-tight font-serif",
        isActive ? optionColors.text : colors.text
      )}>
        {name}
      </h4>
    </motion.button>
  );
}

interface LanguageOptionProps {
  id: string;
  name: string;
  isActive: boolean;
  onClick: () => void;
  colors: Colors;
  isPalia: boolean;
}

function LanguageOption({ id, name, isActive, onClick, colors, isPalia }: LanguageOptionProps) {
  if (!isPalia) {
    return (
      <div className="relative p-1 bg-[#3e2723]/5 rounded-[2rem] group">
        <motion.button
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClick}
          className={cn(
            "relative w-full p-4 rounded-[1.8rem] border-[3px] border-[#3e2723]/10 cursor-pointer transition-all flex flex-col items-center text-center space-y-4 overflow-hidden shadow-lg hover:shadow-xl",
            isActive ? "bg-amber-600 border-amber-500/30" : "bg-[#f2e2ba]"
          )}
        >
          <h4 className={cn(
            "text-base font-black uppercase tracking-[0.2em] font-serif",
            isActive ? "text-white" : "text-[#3e2723]"
          )}>
            {name}
          </h4>
        </motion.button>
      </div>
    );
  }
  
  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative w-full p-4 rounded-[2rem] border-4 cursor-pointer transition-all flex flex-col items-center text-center space-y-4 overflow-hidden shadow-lg hover:shadow-xl",
        isActive ? "bg-[#5c4a33] border-[#5c4a33]" : `${colors.accent} ${colors.accentBorder}`,
        "shadow-inner"
      )}
    >
      <h4 className={cn(
        "text-base font-black uppercase tracking-[0.2em] font-serif",
        isActive ? "text-white" : colors.text
      )}>
        {name}
      </h4>
    </motion.button>
  );
}

interface ToggleSwitchProps {
  isActive: boolean;
  onToggle: () => void;
  activeLabel: string;
  inactiveLabel: string;
  colors: Colors;
  isPalia: boolean;
}

function ToggleSwitch({ isActive, onToggle, activeLabel, inactiveLabel, colors, isPalia }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn(
        "text-lg font-bold font-serif",
        isActive ? colors.text : colors.textMuted
      )}>
        {isActive ? activeLabel : inactiveLabel}
      </span>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className={cn(
          "relative w-24 h-14 rounded-full border-4 transition-all duration-300",
          isActive 
            ? (isPalia ? "bg-[#5c4a33] border-[#5c4a33]" : "bg-amber-600 border-amber-600")
            : `${colors.accent} ${colors.accentBorder}`,
          isPalia ? "shadow-inner" : "shadow-lg"
        )}
      >
        <motion.div
          animate={{ x: isActive ? 40 : 4 }}
          className="absolute top-1 w-10 h-10 rounded-full bg-white shadow-lg"
        />
      </motion.button>
    </div>
  );
}
