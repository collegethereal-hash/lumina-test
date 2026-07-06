'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { Dog, Heart, Zap, Utensils, Droplets, X, Star, Settings2, Flame, MessageCircle, Clock, Book, Quote, Info, Sparkles, User, ShieldCheck, Gift, Camera, Beaker, Mic, Footprints, RefreshCw, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useData } from '@/components/DataProvider';
import { useModal } from '@/context/ModalContext';
import { Archi2D } from './Archi2D';

const PALIA_CATEGORY_COLORS = [
  { 
    bg: 'bg-[#f0f9ff]', 
    text: 'text-[#0369a1]', 
    border: 'border-[#bae6fd]', 
    glow: 'shadow-[0_0_25px_rgba(14,165,233,0.2)]', 
    icon: 'text-[#0ea5e9]', 
    name: 'Общее',
    accent: 'bg-[#0ea5e9]',
    gradient: 'from-[#f0f9ff] to-[#e0f2fe]'
  },
  { 
    bg: 'bg-[#fdf2f8]', 
    text: 'text-[#be185d]', 
    border: 'border-[#fbcfe8]', 
    glow: 'shadow-[0_0_25px_rgba(236,72,153,0.2)]', 
    icon: 'text-[#ec4899]', 
    name: 'Романтичный',
    accent: 'bg-[#ec4899]',
    gradient: 'from-[#fdf2f8] to-[#fce7f3]'
  },
];

type PetType = 'dog';

interface CareAction {
  id: number;
  user: 'The Grinch' | 'Cindy Lou';
  type: 'feed' | 'water' | 'pet';
  timestamp: number;
}

interface PetCustomization {
  furColor: string;
  eyeType: 'normal' | 'sparkle' | 'cool' | 'tired';
  hatType: string;
  accessoryType: string;
  backgroundType: 'new_bg' | 'two_bg' | 'three_bg' | 'four_bg';
}

interface PetSkill {
  id: string;
  name: string;
  level: number;
  xp: number;
  icon: string;
  description: string;
  unlockedAt: number;
  lastTrained?: number; // Timestamp of last training
}

interface PetState {
  hunger: number;
  happiness: number;
  thirst: number;
  level: number;
  xp: number;
  stardust: number;
  lastInteraction: number;
  lastWalked?: number;
  lastBrushed?: number;
  isFull: boolean;
  isHappy: boolean;
  isHydrated: boolean;
  streak: number;
  lastVisitDay: string; // YYYY-MM-DD
  careLog: CareAction[];
  customization: PetCustomization;
  skills: PetSkill[];
  claimedStreaks: number[];
  createdAt: number;
  inventory: {
    hats: string[];
    outfits: string[];
    backgrounds: string[];
  };
  isAutofeedEnabled?: boolean;
}

const PET_CONFIGS: Record<PetType, { icon: any; color: string; bgColor: string; name: string; species: string; hexColor: string }> = {
  dog: { icon: Dog, color: 'text-amber-600', hexColor: '#d97706', bgColor: 'bg-amber-50', name: 'Арчи', species: 'Звездный пес' },
};

export const PetHub = () => {
  const { spaceConfig, currentUser } = useData();
  const { isModalOpen, setIsModalOpen } = useModal();
  const [petType] = useState<PetType>('dog');
  const [activeTab, setActiveTab] = useState<'status' | 'commands' | 'shop' | 'progress'>('status');
  const [activeShopTab, setActiveShopTab] = useState<'outfits' | 'backgrounds'>('outfits');

  const calculateAge = (createdAt: number) => {
    const now = Date.now();
    const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000;
    const years = Math.floor((now - createdAt) / twoWeeksInMs);
    return Math.max(0, years);
  };

  const p1 = spaceConfig?.partner1_name || 'Гринч';
  const p2 = spaceConfig?.partner2_name || 'Синди Лу';


  const DEFAULT_SKILLS: PetSkill[] = [
    { id: 'sit', name: 'Сидеть', level: 1, xp: 0, icon: 'dog', description: 'Базовая команда послушания', unlockedAt: 1 },
    { id: 'paw', name: 'Дай лапу', level: 1, xp: 0, icon: 'footprints', description: 'Дружеское приветствие', unlockedAt: 1 },
    { id: 'voice', name: 'Голос', level: 1, xp: 0, icon: 'mic', description: 'Громкое заявление о себе', unlockedAt: 1 },
    { id: 'dance', name: 'Танцуй', level: 1, xp: 0, icon: 'sparkles', description: 'Звездный вальс Арчи', unlockedAt: 1 },
    { id: 'roll', name: 'Кувырок', level: 1, xp: 0, icon: 'refresh-cw', description: 'Акробатический трюк', unlockedAt: 1 },
  ];

  const [state, setState] = useState<PetState>({
    hunger: 80,
    happiness: 90,
    thirst: 75,
    level: 1,
    xp: 0,
    stardust: 100, // Начальный капитал
    lastInteraction: Date.now(),
    lastWalked: 0,
    lastBrushed: 0,
    isFull: false,
    isHappy: false,
    isHydrated: false,
    streak: 0,
    lastVisitDay: '',
    careLog: [],
    customization: {
      furColor: '#5c4a33',
      eyeType: 'normal',
      hatType: 'none',
      accessoryType: 'none',
      backgroundType: 'new_bg'
    },
    skills: DEFAULT_SKILLS,
    claimedStreaks: [],
    createdAt: Date.now(),
    inventory: {
      hats: ['none'],
      outfits: ['none'], 
      backgrounds: ['new_bg']
    }
  });
  const [activeSubTab, setActiveSubTab] = useState<'status' | 'closet'>('status');

  // Body scroll lock
  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('lock-scroll');
    } else {
      document.body.classList.remove('lock-scroll');
    }
    return () => document.body.classList.remove('lock-scroll');
  }, [isModalOpen]);

  const claimStreakReward = (days: number) => {
    setState(prev => {
      if (prev.claimedStreaks.includes(days)) return prev;
      const reward = getRewardForStreak(days);
      const newState = {
        ...prev,
        stardust: prev.stardust + reward,
        claimedStreaks: [...prev.claimedStreaks, days]
      };
      updateArchiState(newState);
      return newState;
    });
  };

  const getRewardForStreak = (days: number) => {
    if (days >= 365) return 25000;
    if (days >= 250) return 15000;
    if (days >= 200) return 10000;
    if (days >= 150) return 7000;
    if (days >= 100) return 5000;
    if (days >= 75) return 3000;
    if (days >= 50) return 1500;
    if (days >= 30) return 700;
    if (days >= 15) return 300;
    if (days >= 7) return 100;
    return 0;
  };

  const [showHeart, setShowHeart] = useState(false);
  const [currentThought, setCurrentThought] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeCommand, setActiveCommand] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (spaceConfig?.id) {
      fetchArchiState();
    }
  }, [spaceConfig?.id]);

  const fetchArchiState = async () => {
    if (!spaceConfig?.id) return;

    console.log('Fetching Archi state for space:', spaceConfig.id);
    const { data } = await supabase
      .from('global_state')
      .select('value')
      .eq('space_id', spaceConfig.id)
      .eq('key', 'archi_state')
      .maybeSingle();

    if (data && data.value) {
      const parsed = data.value as PetState;
      const now = Date.now();
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const secondsPassed = Math.floor((now - (parsed.lastInteraction || now)) / 1000);

      const hungerDecay = secondsPassed * 0.00115;
      const thirstDecay = secondsPassed * 0.00154;
      const happinessDecay = secondsPassed * 0.00057;

      let newStreak = parsed.streak || 0;
      if (parsed.lastVisitDay && parsed.lastVisitDay !== today && parsed.lastVisitDay !== yesterday) {
        newStreak = 0;
      }

      const newState = { 
        ...parsed, 
        hunger: parsed.isAutofeedEnabled && Math.max(0, (parsed.hunger || 0) - hungerDecay) < 50 ? 100 : Math.max(0, (parsed.hunger || 0) - hungerDecay),
        thirst: parsed.isAutofeedEnabled && Math.max(0, (parsed.thirst || 0) - thirstDecay) < 50 ? 100 : Math.max(0, (parsed.thirst || 0) - thirstDecay),
        happiness: Math.max(0, (parsed.happiness || 0) - happinessDecay),
        streak: newStreak,
        lastInteraction: now,
        // Гарантируем, что если в базе 100, то будет 100, а не 5000
        stardust: parsed.stardust ?? 100,
        inventory: parsed.inventory || {
          hats: ['none'],
          outfits: ['none'],
          backgrounds: ['new_bg']
        },
        isAutofeedEnabled: parsed.isAutofeedEnabled ?? false
      };
      
      setState(newState);
      setIsLoaded(true);
    } else {
      // Initialize with default state if not found
      const defaultState: PetState = {
        hunger: 80,
        happiness: 90,
        thirst: 75,
        level: 1,
        xp: 0,
        stardust: 100,
        lastInteraction: Date.now(),
        lastWalked: 0,
        lastBrushed: 0,
        isFull: false,
        isHappy: false,
        isHydrated: false,
        streak: 0,
        lastVisitDay: new Date().toISOString().split('T')[0],
        careLog: [],
        customization: {
          furColor: '#5c4a33',
          eyeType: 'normal',
          hatType: 'none',
          accessoryType: 'none',
          backgroundType: 'new_bg'
        },
        skills: DEFAULT_SKILLS,
        claimedStreaks: [],
        createdAt: Date.now(),
        inventory: {
          hats: ['none'],
          outfits: ['none'],
          backgrounds: ['new_bg']
        },
        isAutofeedEnabled: false
      };
      setState(defaultState);
      setIsLoaded(true);
      updateArchiState(defaultState);
    }
  };

  const updateArchiState = async (newState: PetState) => {
    if (!spaceConfig?.id) {
      console.warn('Cannot sync Archi: spaceConfig.id is missing');
      return;
    }
    
    setIsSyncing(true);
    console.log('Syncing Archi state to DB...', newState);
    
    const { error } = await supabase
      .from('global_state')
      .upsert({
        space_id: spaceConfig.id,
        key: 'archi_state',
        value: newState
      }, { onConflict: 'space_id,key' });

    if (error) {
      console.error('CRITICAL: Archi Sync Failed:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    } else {
      console.log('Archi sync successful!');
    }
    setIsSyncing(false);
  };

  const resetState = () => {
    if (window.confirm('Вы уверены, что хотите полностью сбросить прогресс Арчи? Это действие нельзя отменить.')) {
      const defaultState: PetState = {
        hunger: 80,
        happiness: 90,
        thirst: 75,
        level: 1,
        xp: 0,
        stardust: 100,
        lastInteraction: Date.now(),
        lastWalked: 0,
        lastBrushed: 0,
        isFull: false,
        isHappy: false,
        isHydrated: false,
        streak: 0,
        lastVisitDay: new Date().toISOString().split('T')[0],
        careLog: [],
        customization: {
          furColor: '#5c4a33',
          eyeType: 'normal',
          hatType: 'none',
          accessoryType: 'none',
          backgroundType: 'new_bg'
        },
        skills: DEFAULT_SKILLS,
        claimedStreaks: [],
        createdAt: Date.now(),
        inventory: {
          hats: ['none'],
          outfits: ['none'],
          backgrounds: ['new_bg']
        }
      };
      setState(defaultState);
      updateArchiState(defaultState);
    }
  };

  // Sync state to Supabase on changes
  useEffect(() => {
    if (isLoaded && state.lastVisitDay !== '') {
      const timer = setTimeout(() => {
        updateArchiState(state);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.hunger, state.thirst, state.happiness, state.xp, state.stardust, state.customization, isLoaded]);


  // Thoughts logic removed as the UI component was removed
  useEffect(() => {
    setCurrentThought("");
  }, []);

  useEffect(() => {
    const checkNeglect = () => {
      const isNeglected = state.hunger === 0 || state.thirst === 0 || state.happiness === 0;
      if (isNeglected && state.streak > 0) {
        setState(prev => ({ ...prev, streak: 0 }));
      }
    };
    
    const timer = setInterval(checkNeglect, 60000); // Check every minute
    return () => clearInterval(timer);
  }, [state.hunger, state.thirst, state.happiness, state.streak]);

  // Passive decay based on time intervals
  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => {
        // Calculations based on 10-second intervals (Slower rates)
        // Hunger: 100% in 24h -> 100 / (86400 / 10) = 0.0115 per 10s
        // Thirst: 100% in 18h -> 100 / (64800 / 10) = 0.0154 per 10s
        // Happiness: 100% in 48h -> 100 / (172800 / 10) = 0.0057 per 10s
        
        const newHunger = Math.max(0, prev.hunger - 0.0115);
        const newThirst = Math.max(0, prev.thirst - 0.0154);
        const newHappiness = Math.max(0, prev.happiness - 0.0057);
        
        // Streak loss logic: if any stat is 0 for too long, streak could reset
        // For simplicity, we check if they are very low
        
        return {
          ...prev,
          hunger: newHunger,
          thirst: newThirst,
          happiness: newHappiness,
          isFull: newHunger >= 95,
          isHappy: newHappiness >= 95,
          isHydrated: newThirst >= 95
        };
      });
    }, 10000); // Check every 10 seconds
    return () => clearInterval(timer);
  }, []);

  const buyItem = (type: 'hats' | 'outfits' | 'backgrounds', id: string, price: number) => {
    setState(prev => {
      if (prev.stardust < price) return prev;
      
      const newInventory = { ...prev.inventory };
      if (!newInventory[type].includes(id)) {
        newInventory[type] = [...newInventory[type], id];
      }

      const newState = {
        ...prev,
        stardust: prev.stardust - price,
        inventory: newInventory
      };
      
      updateArchiState(newState);
      return newState;
    });
  };

  const trainSkill = (skillId: string) => {
    setState(prev => {
      const skillIndex = prev.skills.findIndex(s => s.id === skillId);
      if (skillIndex === -1) return prev;

      const skill = prev.skills[skillIndex];
      const now = Date.now();
      const COOLDOWN = 12 * 60 * 60 * 1000; // 12 hours

      if (skill.lastTrained && now - skill.lastTrained < COOLDOWN) {
        return prev;
      }

      const newSkills = [...prev.skills];
      
      let newXp = skill.xp + 25;
      let newLevel = skill.level;

      if (newXp >= 100) {
        newLevel += 1;
        newXp = 0;
      }

      newSkills[skillIndex] = { ...skill, level: newLevel, xp: newXp, lastTrained: now };

      // Выполнение команды визуально (кроме танца и кувырка)
      if (skillId !== 'dance' && skillId !== 'roll') {
        setActiveCommand(skillId);
        setTimeout(() => setActiveCommand(null), 3000);
      }

      const newState = { ...prev, skills: newSkills, xp: prev.xp + 5, stardust: prev.stardust + 10 };
      updateArchiState(newState);
      return newState;
    });
  };

  const interact = (type: 'feed' | 'water' | 'pet') => {
    setState(prev => {
      let newState = { ...prev };
      
      const userName = currentUser === 'Grinch' ? p1 : p2;

      // Streak logic on interaction
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      if (prev.lastVisitDay === yesterday) {
        newState.streak = prev.streak + 1;
      } else if (prev.lastVisitDay !== today) {
        newState.streak = 1;
      }
      newState.lastVisitDay = today;

      if (type === 'feed' && !prev.isFull) {
        newState.hunger = Math.min(100, prev.hunger + 20);
        if (newState.hunger >= 95) newState.isFull = true;
        newState.stardust += 5;
      }
      if (type === 'water' && !prev.isHydrated) {
        newState.thirst = Math.min(100, prev.thirst + 25);
        if (newState.thirst >= 95) newState.isHydrated = true;
        newState.stardust += 5;
      }
      if (type === 'pet' && !prev.isHappy) {
        newState.happiness = Math.min(100, prev.happiness + 15);
        if (newState.happiness >= 95) newState.isHappy = true;
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 1000);
        newState.stardust += 5;
      }
      
      newState.lastInteraction = Date.now();
      
      // Update care log
      const newAction: CareAction = {
        id: Date.now(),
        user: (currentUser === 'Grinch' ? 'The Grinch' : 'Cindy Lou') as any,
        type,
        timestamp: Date.now()
      };
      const currentLog = Array.isArray(prev.careLog) ? prev.careLog : [];
      newState.careLog = [newAction, ...currentLog].slice(0, 10);
      
      newState.xp += 10;
      if (newState.xp >= 100) {
        newState.level += 1;
        newState.xp = 0;
        newState.stardust += 50;
      }
      
      // Trigger immediate sync for interactions
      updateArchiState(newState);
      
      return newState;
    });
  };

  const avgMood = (state.hunger + state.thirst + state.happiness) / 3;

  const currentPet = PET_CONFIGS[petType];
  const PetIcon = currentPet.icon;

  const getAgeString = (years: number) => {
    if (years === 0) return 'Меньше года';
    const lastDigit = years % 10;
    const lastTwoDigits = years % 100;
    if (lastDigit === 1 && lastTwoDigits !== 11) return `${years} год`;
    if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) return `${years} года`;
    return `${years} лет`;
  };

  const currentAge = calculateAge(state.createdAt);

  const getStatusColor = (value: number) => {
    if (value > 70) return 'bg-green-400';
    if (value > 30) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  const getMoodEmoji = () => {
    const avg = (state.hunger + state.thirst + state.happiness) / 3;
    if (avg > 80) return '✨ Счастлив';
    if (avg > 50) return '🙂 В порядке';
    if (avg > 20) return '🥱 Устал';
    return '😭 Грустит';
  };

  return (
    <>
      {/* Mini Card for Home Screen */}
      <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        onClick={() => setIsModalOpen(true)}
        className="cursor-pointer h-full"
      >
        <div className="relative overflow-hidden p-0 bg-[#fdfaf3] border-[12px] border-[#e6d5bc]/30 shadow-[20px_20px_60px_rgba(0,0,0,0.1)] group h-full flex flex-col justify-center min-h-[220px] rounded-[3rem]">
          {/* Pin */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <div className="relative">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-md border border-red-700/20" />
              <div className="absolute top-0.5 left-0.5 w-2 h-2 rounded-full bg-white/40" />
            </div>
          </div>

          <div className="p-5 md:p-8 flex items-center gap-5 md:gap-8">
            <div className="relative shrink-0">
              <div className={cn("w-20 h-20 md:w-32 md:h-32 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center text-white shadow-xl rotate-2 transition-transform group-hover:rotate-6 bg-[#f5e6d3] border-4 border-[#e6d5bc]")}>
                <PetIcon className="text-[#5c4a33] w-12 h-12 md:w-16 md:h-16" />
              </div>
              {state.streak > 0 && (
                <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 bg-orange-500 text-white px-2.5 md:px-4 py-1 md:py-1.5 rounded-full text-[9px] md:text-[11px] font-black flex items-center gap-1 md:gap-1.5 shadow-lg animate-bounce border-2 md:border-3 border-white">
                  <Flame size={12} fill="currentColor" className="md:w-3.5 md:h-3.5" />
                  {state.streak}
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-2 md:space-y-4">
              <div className="space-y-1 md:space-y-2">
                <h3 className="text-2xl md:text-4xl font-serif font-bold text-[#5c4a33] tracking-tight">{currentPet.name}</h3>
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="text-[8px] md:text-[11px] font-black px-3 md:px-4 py-1 md:py-1.5 bg-[#5c4a33] text-[#fdfaf3] rounded-full uppercase tracking-[0.2em] md:tracking-[0.3em] shadow-sm">
                    {getAgeString(currentAge)}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-1.5 md:gap-3 w-full">
                <div className="flex-1 h-2 md:h-3.5 bg-[#e6d5bc] rounded-full overflow-hidden border border-[#d4c3ab]">
                  <motion.div 
                    animate={{ width: `${state.hunger}%` }}
                    className="h-full bg-orange-400" 
                  />
                </div>
                <div className="flex-1 h-2 md:h-3.5 bg-[#e6d5bc] rounded-full overflow-hidden border border-[#d4c3ab]">
                  <motion.div 
                    animate={{ width: `${state.happiness}%` }}
                    className="h-full bg-pink-400" 
                  />
                </div>
                <div className="flex-1 h-2 md:h-3.5 bg-[#e6d5bc] rounded-full overflow-hidden border border-[#d4c3ab]">
                  <motion.div 
                    animate={{ width: `${state.thirst}%` }}
                    className="h-full bg-blue-400" 
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Texture Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] rounded-[3rem]" />
        </div>
      </motion.div>

      {/* Detailed Interaction Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8">
            {/* Syncing indicator hidden for users as requested */}
            {/* {isSyncing && (
              <div className="absolute top-4 right-4 z-[130] bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border-2 border-[#e6d5bc] text-[#5c4a33] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                Синхронизация...
              </div>
            )} */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-6xl h-[95vh] md:h-[750px] bg-[#fdfaf3] rounded-[2rem] md:rounded-[3rem] shadow-[20px_20px_60px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col md:flex-row border-[8px] md:border-[12px] border-[#e6d5bc]/40 z-10 overscroll-contain"
              >
              {/* Left Side: Archi 2D & Status (Visual focus) */}
              <div className="w-full md:w-[38%] bg-[#fdfaf3] relative flex flex-col items-center justify-center p-4 md:p-10 border-b-4 md:border-b-0 md:border-r-8 border-[#e6d5bc]/30 shrink-0">
                {/* Pin in the corner */}
                <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20">
                  <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-md border border-red-700/20" />
                </div>

                <button 
                  onClick={() => {
                    const newState = { ...state, isAutofeedEnabled: !state.isAutofeedEnabled };
                    setState(newState);
                    updateArchiState(newState);
                  }}
                  className={cn(
                    "absolute top-4 right-4 md:top-8 md:right-8 z-20 h-8 md:h-10 px-3 md:px-4 rounded-xl flex items-center gap-2 transition-all shadow-sm border-2",
                    state.isAutofeedEnabled 
                      ? "bg-green-100 border-green-300 text-green-600 hover:bg-green-200" 
                      : "bg-zinc-100 border-zinc-300 text-zinc-400 hover:bg-zinc-200"
                  )}
                  title={state.isAutofeedEnabled ? "Автокормление включено" : "Автокормление выключено"}
                >
                  <div className={cn(
                    "w-1.5 h-1.5 md:w-2 md:h-2 rounded-full",
                    state.isAutofeedEnabled ? "bg-green-500 animate-pulse" : "bg-zinc-400"
                  )} />
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Авто</span>
                  <RefreshCw size={10} className={cn("transition-transform md:w-3 md:h-3", state.isAutofeedEnabled && "animate-spin-slow")} />
                </button>

                <div className="relative w-full max-w-[280px] md:max-w-none aspect-square md:flex-1 bg-white/30 rounded-[2rem] md:rounded-[3rem] overflow-visible border-4 border-[#e6d5bc]/50 shadow-inner group">
                  <Archi2D customization={state.customization} isHappy={showHeart} activeCommand={activeCommand} />
                </div>

                <div className="mt-3 md:mt-6 text-center">
                  <h2 className="text-2xl md:text-4xl font-serif font-bold text-[#5c4a33]">{currentPet.name}</h2>
                  <div className="flex items-center justify-center mt-1 md:mt-2">
                    <span className="px-3 md:px-4 py-1 md:py-1.5 bg-[#5c4a33] text-[#fdfaf3] rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest shadow-sm">
                      {getAgeString(currentAge)}
                    </span>
                  </div>
                </div>

                {/* Level Progress */}
                <div className="w-full mt-3 md:mt-8 px-2 md:px-4 space-y-1.5 md:space-y-2">
                  <div className="flex justify-between text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#8b7355]">
                    <span>Опыт</span>
                    <span>{state.xp}%</span>
                  </div>
                  <div className="h-2 md:h-3 bg-[#e6d5bc] rounded-full overflow-hidden border-2 border-[#d4c3ab]">
                    <motion.div 
                      animate={{ width: `${state.xp}%` }}
                      className="h-full bg-[#8b7355]" 
                    />
                  </div>
                </div>
              </div>

              {/* Right Side: Tabs & Content */}
              <div className="flex-1 flex flex-col bg-[#fdfaf3] relative min-h-0 z-50">
                {/* Tabs Navigation */}
                <div className="flex justify-start md:justify-center p-3 md:p-6 gap-2 md:gap-3 border-b-4 border-[#e6d5bc]/30 overflow-x-auto no-scrollbar touch-pan-x bg-[#fdfaf3]/50 backdrop-blur-sm sticky top-0 z-[60] scroll-smooth">
                  <TabButton 
                    active={activeTab === 'status'} 
                    onClick={() => setActiveTab('status')} 
                    icon={<Settings2 size={16} className="md:w-[18px] md:h-[18px]" />} 
                    label="Уход" 
                  />
                  <TabButton 
                    active={activeTab === 'commands'} 
                    onClick={() => setActiveTab('commands')} 
                    icon={<Zap size={16} className="md:w-[18px] md:h-[18px]" />} 
                    label="Команды" 
                  />
                  <TabButton 
                    active={activeTab === 'shop'} 
                    onClick={() => setActiveTab('shop')} 
                    icon={<Sparkles size={16} className="md:w-[18px] md:h-[18px]" />} 
                    label="Магазин" 
                  />
                  <TabButton 
                    active={activeTab === 'progress'} 
                    onClick={() => setActiveTab('progress')} 
                    icon={<Star size={16} className="md:w-[18px] md:h-[18px]" />} 
                    label="Прогресс" 
                  />
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar overscroll-contain touch-pan-y">
                  <AnimatePresence mode="wait">
                    {activeTab === 'status' && (
                      <motion.div
                        key="status"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6 md:space-y-8"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                          <StatBox label="Сытость" value={state.hunger} icon={<Utensils size={18} />} color="bg-orange-400" />
                          <StatBox label="Жажда" value={state.thirst} icon={<Droplets size={18} />} color="bg-blue-400" />
                          <StatBox label="Радость" value={state.happiness} icon={<Heart size={18} />} color="bg-pink-400" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 pt-2 md:pt-4">
                          <BigActionButton 
                            icon={<Utensils size={20} className="md:w-6 md:h-6" />} 
                            label="Покормить" 
                            desc="Дать косточку"
                            onClick={() => interact('feed')}
                            disabled={state.isFull}
                            hoverClass="hover:border-orange-400 hover:text-orange-600"
                            iconHoverClass="group-hover:bg-orange-50 group-hover:text-orange-600"
                          />
                          <BigActionButton 
                            icon={<Droplets size={20} className="md:w-6 md:h-6" />} 
                            label="Напоить" 
                            desc="Свежая вода"
                            onClick={() => interact('water')}
                            disabled={state.isHydrated}
                            hoverClass="hover:border-blue-400 hover:text-blue-600"
                            iconHoverClass="group-hover:bg-blue-50 group-hover:text-blue-600"
                          />
                          <BigActionButton 
                            icon={<Heart size={20} className="md:w-6 md:h-6" />} 
                            label="Погладить" 
                            desc="Дать любовь"
                            onClick={() => interact('pet')}
                            disabled={state.isHappy}
                            hoverClass="hover:border-pink-400 hover:text-pink-600"
                            iconHoverClass="group-hover:bg-pink-50 group-hover:text-pink-600"
                          />
                        </div>

                        {/* Extra Care Actions (New Row) */}
                        <div className="pt-6 md:pt-8 border-t-2 border-[#e6d5bc] space-y-4">
                          <h4 className="text-[#8b7355] font-black uppercase text-[9px] md:text-[10px] tracking-widest px-2 flex items-center gap-2">
                            <Sparkles size={12} /> Дополнительная забота
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            {[
                              { id: 'walk', name: 'Выгулять', icon: <Footprints size={18} />, last: state.lastWalked },
                              { id: 'brush', name: 'Причесать', icon: <Sparkles size={18} />, last: state.lastBrushed }
                            ].map((action) => {
                              const now = Date.now();
                              const COOLDOWN = 12 * 60 * 60 * 1000;
                              const timeLeft = action.last ? Math.max(0, COOLDOWN - (now - action.last)) : 0;
                              const isOnCooldown = timeLeft > 0;

                              const formatTimeLeft = (ms: number) => {
                                const hours = Math.floor(ms / (1000 * 60 * 60));
                                const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
                                return `${hours}ч ${minutes}м`;
                              };

                              return (
                                <div 
                                  key={action.id} 
                                  onClick={() => {
                                    if (!isOnCooldown) {
                                      setState(prev => ({ 
                                        ...prev, 
                                        [action.id === 'walk' ? 'lastWalked' : 'lastBrushed']: Date.now(),
                                        happiness: Math.min(100, prev.happiness + 15),
                                        stardust: prev.stardust + 20
                                      }));
                                    }
                                  }}
                                  className={cn(
                                    "flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-2xl bg-[#fdfaf3] border-4 border-[#e6d5bc]/50 transition-all shadow-sm group relative overflow-hidden",
                                    isOnCooldown ? "cursor-not-allowed opacity-70" : "hover:border-amber-400 cursor-pointer hover:shadow-md hover:-translate-y-0.5"
                                  )}
                                >
                                  <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                                  <div className={cn(
                                    "w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#f5e6d3] flex items-center justify-center text-[#5c4a33] transition-colors z-10",
                                    !isOnCooldown && "group-hover:bg-amber-50"
                                  )}>
                                    <span className={cn(isOnCooldown ? "text-zinc-400" : "text-[#5c4a33]")}>{action.icon}</span>
                                  </div>
                                  <div className="flex-1 z-10">
                                    <div className="flex justify-between items-center">
                                      <p className={cn("font-bold text-xs md:text-sm", isOnCooldown ? "text-zinc-400" : "text-[#5c4a33]")}>{action.name}</p>
                                      <span className={cn("text-[8px] md:text-[9px] font-black uppercase tracking-widest", isOnCooldown ? "text-zinc-400" : "text-amber-600")}>
                                        {isOnCooldown ? formatTimeLeft(timeLeft) : "Доступно"}
                                      </span>
                                    </div>
                                    <p className="text-[9px] md:text-[10px] text-[#8b7355] italic">
                                      {isOnCooldown ? "Арчи отдыхает..." : "Порадовать Арчи"}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'commands' && (
                      <motion.div
                        key="commands"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6 md:space-y-8"
                      >
                        {/* Progress Bars for Skills (Top Row) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                          {state.skills.slice(0, 3).map((skill, i) => {
                            const colors = [
                              { text: 'text-orange-600', bg: 'bg-orange-400', icon: <Dog size={18} /> },
                              { text: 'text-blue-600', bg: 'bg-blue-400', icon: <Footprints size={18} /> },
                              { text: 'text-pink-600', bg: 'bg-pink-400', icon: <Mic size={18} /> }
                            ];
                            const color = colors[i % 3];

                            return (
                              <div key={skill.id} className="bg-[#fdfaf3] p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] border-4 border-[#e6d5bc]/40 shadow-sm space-y-2 md:space-y-3 relative overflow-hidden group">
                                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                                <div className="flex items-center gap-2 text-[#8b7355] mb-2 md:mb-3 font-black uppercase text-[8px] md:text-[9px] tracking-[0.2em] relative z-10">
                                  <span className="text-[#8b7355]">{color.icon}</span>
                                  <span className="text-[#8b7355]">{skill.name}</span>
                                </div>
                                <div className="h-3 md:h-4 bg-[#e6d5bc]/30 rounded-full overflow-hidden border-2 border-[#e6d5bc]/50 relative z-10">
                                  <motion.div 
                                    animate={{ width: `${skill.xp}%` }}
                                    className={cn("h-full shadow-[inset_-2px_0_5px_rgba(0,0,0,0.1)]", color.bg)} 
                                  />
                                </div>
                                <div className="mt-1 md:mt-2 text-right text-[9px] md:text-[10px] font-black text-[#5c4a33] relative z-10">Lvl {skill.level}</div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Training Actions (Middle Row) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                          {state.skills.slice(0, 3).map((skill, i) => {
                            const isTraining = activeCommand === skill.id;
                            
                            const now = Date.now();
                            const COOLDOWN = 12 * 60 * 60 * 1000;
                            const timeLeft = skill.lastTrained ? Math.max(0, COOLDOWN - (now - skill.lastTrained)) : 0;
                            const isOnCooldown = timeLeft > 0;

                            const formatTimeLeft = (ms: number) => {
                              const hours = Math.floor(ms / (1000 * 60 * 60));
                              const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
                              return `${hours}ч ${minutes}м`;
                            };

                            const colors = [
                              { hover: "hover:border-orange-400 hover:text-orange-600", icon: "group-hover:bg-orange-50 group-hover:text-orange-600", lucide: <Dog size={20} className="md:w-6 md:h-6" /> },
                              { hover: "hover:border-blue-400 hover:text-blue-600", icon: "group-hover:bg-blue-50 group-hover:text-blue-600", lucide: <Footprints size={20} className="md:w-6 md:h-6" /> },
                              { hover: "hover:border-pink-400 hover:text-pink-600", icon: "group-hover:bg-pink-50 group-hover:text-pink-600", lucide: <Mic size={20} className="md:w-6 md:h-6" /> }
                            ];
                            const color = colors[i % 3];

                            return (
                              <button
                                key={`btn-${skill.id}`}
                                onClick={() => !isOnCooldown && trainSkill(skill.id)}
                                disabled={isTraining || isOnCooldown}
                                className={cn(
                                  "group flex flex-col items-center justify-center p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border-4 transition-all relative overflow-hidden",
                                  isOnCooldown 
                                    ? "bg-zinc-100/50 border-zinc-200 opacity-50 cursor-not-allowed" 
                                    : cn("bg-[#fdfaf3] border-[#e6d5bc]/60 text-[#5c4a33] hover:shadow-xl hover:-translate-y-1 active:scale-95", color.hover)
                                )}
                              >
                                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                                <div className={cn(
                                  "w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-[1.5rem] flex items-center justify-center mb-3 md:mb-4 transition-all shadow-md relative z-10",
                                  isOnCooldown ? "bg-zinc-200 text-zinc-400" : "bg-[#f5e6d3] text-[#5c4a33] border-2 border-[#e6d5bc]/50"
                                )}>
                                  {color.lucide}
                                </div>
                                <div className="text-center z-10">
                                  <p className="font-black text-[#5c4a33] uppercase text-[8px] md:text-[10px] tracking-[0.2em] mb-0.5 md:mb-1">
                                    {isTraining ? "Учит..." : isOnCooldown ? "Остывает" : skill.name}
                                  </p>
                                  <p className={cn("text-[8px] md:text-[9px] font-bold italic", isOnCooldown ? "text-zinc-400" : "text-[#8b7355]")}>
                                    {isOnCooldown ? formatTimeLeft(timeLeft) : "Тренировать"}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Soon in Talia (Bottom Row) */}
                        <div className="pt-6 md:pt-8 border-t-2 border-[#e6d5bc] space-y-4">
                          <h4 className="text-[#8b7355] font-black uppercase text-[9px] md:text-[10px] tracking-widest px-2 flex items-center gap-2">
                            <Star size={12} /> Дополнительные навыки
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            {state.skills.slice(3).map((skill, i) => {
                              const now = Date.now();
                              const COOLDOWN = 12 * 60 * 60 * 1000;
                              const timeLeft = skill.lastTrained ? Math.max(0, COOLDOWN - (now - skill.lastTrained)) : 0;
                              const isOnCooldown = timeLeft > 0;

                              const formatTimeLeft = (ms: number) => {
                                const hours = Math.floor(ms / (1000 * 60 * 60));
                                const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
                                return `${hours}ч ${minutes}м`;
                              };
                              
                              const extraIcons = [
                                <Sparkles key="dance" size={18} />,
                                <RefreshCw key="roll" size={18} />
                              ];

                              return (
                                <div 
                                  key={skill.id} 
                                  onClick={() => !isOnCooldown && trainSkill(skill.id)}
                                  className={cn(
                                    "flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl bg-[#fdfaf3] border-4 border-[#e6d5bc]/50 transition-all shadow-sm group relative overflow-hidden",
                                    isOnCooldown ? "cursor-not-allowed opacity-80" : "hover:border-amber-400 cursor-pointer"
                                  )}
                                >
                                  <div className={cn(
                                    "w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[#f5e6d3] flex items-center justify-center text-[#5c4a33] transition-colors",
                                    !isOnCooldown && "group-hover:bg-amber-50"
                                  )}>
                                    <span className="text-lg md:text-xl">{extraIcons[i % 2]}</span>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                    <p className="font-bold text-[#5c4a33] text-xs md:text-sm">{skill.name}</p>
                                    <span className={cn("text-[8px] md:text-[9px] font-black", isOnCooldown ? "text-zinc-400" : "text-amber-600")}>
                                      {isOnCooldown ? formatTimeLeft(timeLeft) : `Lvl ${skill.level}`}
                                    </span>
                                  </div>
                                  <div className="h-1 md:h-1.5 bg-[#e6d5bc]/30 rounded-full mt-1 overflow-hidden">
                                    <motion.div animate={{ width: `${skill.xp}%` }} className="h-full bg-amber-400" />
                                  </div>
                                </div>
                              </div>
                            );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}


                    {activeTab === 'shop' && (
                      <motion.div
                        key="shop"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="h-full flex flex-col"
                      >
                        {/* Sub Tabs for Shop */}
                        <div className="flex justify-center gap-3 md:gap-4 mb-6 md:mb-8">
                          <button
                            onClick={() => setActiveShopTab('outfits')}
                            className={cn(
                              "px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-black uppercase text-[8px] md:text-[10px] tracking-[0.15em] md:tracking-[0.2em] transition-all flex items-center gap-2 border-2 md:border-4",
                              activeShopTab === 'outfits' 
                                ? "bg-[#ec4899] text-white border-white shadow-lg scale-105" 
                                : "bg-white text-[#be185d] border-[#fbcfe8] hover:bg-[#fdf2f8]"
                            )}
                          >
                            <Gift size={14} className="md:w-4 md:h-4" /> Облик
                          </button>
                          <button
                            onClick={() => setActiveShopTab('backgrounds')}
                            className={cn(
                              "px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-black uppercase text-[8px] md:text-[10px] tracking-[0.15em] md:tracking-[0.2em] transition-all flex items-center gap-2 border-2 md:border-4",
                              activeShopTab === 'backgrounds' 
                                ? "bg-[#0ea5e9] text-white border-white shadow-lg scale-105" 
                                : "bg-white text-[#0369a1] border-[#bae6fd] hover:bg-[#f0f9ff]"
                            )}
                          >
                            <Camera size={14} className="md:w-4 md:h-4" /> Фоны
                          </button>
                        </div>

                        {/* Shop Categories Content centered vertically */}
                        <div className="flex-1 flex flex-col pb-10 md:pb-20 mt-2 md:mt-6">
                           <AnimatePresence mode="wait">
                             {activeShopTab === 'outfits' ? (
                               <motion.div
                                 key="outfits-list"
                                 initial={{ opacity: 0, y: 10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 exit={{ opacity: 0, y: -10 }}
                                 className="space-y-4"
                               >
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                   {(() => {
                                     const items = [
                                       { id: 'archi_povar', name: 'Костюм Повара', price: 500, img: 'archi_povar.png', type: 'outfits' },
                                       { id: 'archi_rycar', name: 'Рыцарь Арчи', price: 800, img: 'archi_rycar.png', type: 'outfits' },
                                       { id: 'archi_korole', name: 'Королевский наряд', price: 1200, img: 'archi_korole.png', type: 'outfits' },
                                       { id: 'archi_ximiya', name: 'Ученый Химик', price: 1500, img: 'archi_ximiya.png', type: 'outfits' },
                                       { id: 'archi_gubkabob', name: 'Арчи Боб', price: 2000, img: 'archi_gubkabob.png', type: 'outfits' },
                                       { id: 'archi_crosh', name: 'Крош Арчи', price: 2500, img: 'archi_crosh.png', type: 'outfits' },
                                     ];
                                     
                                     return items.map((item, i) => {
                                       const isOwned = state.inventory[item.type as keyof typeof state.inventory].includes(item.id);
                                       const isSelected = state.customization?.accessoryType === item.id;
                                       
                                       const colorIndex = (Math.floor(i / 2) + (i % 2)) % 2 === 0 ? 1 : 0;
                                       const color = PALIA_CATEGORY_COLORS[colorIndex];
                                       
                                       return (
                                         <motion.div 
                                            key={item.id} 
                                            whileHover={{ y: -4 }}
                                            className={cn(
                                              "p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] border-4 flex items-center gap-3 md:gap-4 transition-all relative overflow-hidden h-28 md:h-32",
                                              color.bg, color.border, color.glow
                                            )}
                                         >
                                            <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                                            
                                            <div className={cn(
                                              "w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-[1.5rem] overflow-hidden border-2 shrink-0 flex items-center justify-center p-1 bg-white shadow-sm z-10",
                                              color.border
                                            )}>
                                              <img src={`/pets/archi/${item.img}`} alt={item.name} className="w-full h-full object-contain translate-x-2 -translate-y-1 scale-125" />
                                            </div>

                                            <div className="flex-1 flex flex-col justify-between h-full py-0.5 md:py-1 z-10">
                                              <div className="space-y-0.5 md:space-y-1">
                                                <p className={cn("font-serif font-bold text-[11px] md:text-sm leading-tight text-left", color.text)}>{item.name}</p>
                                                {!isOwned && (
                                                  <div className="flex items-center gap-1 md:gap-1.5">
                                                    <div className={cn("w-3.5 h-3.5 md:w-4 md:h-4 rounded-full flex items-center justify-center shadow-sm", color.accent)}>
                                                      <Beaker size={7} className="text-white" />
                                                    </div>
                                                    <span className={cn("text-[9px] md:text-[11px] font-black uppercase tracking-widest", color.text)}>{item.price}</span>
                                                  </div>
                                                )}
                                              </div>
                                              
                                              <div className="w-full">
                                                {isOwned ? (
                                                  <button 
                                                    onClick={() => {
                                                      const newCustomization = { ...state.customization, accessoryType: isSelected ? 'none' : item.id };
                                                      const newState = { ...state, customization: newCustomization };
                                                      setState(newState);
                                                      updateArchiState(newState);
                                                    }}
                                                    className={cn(
                                                      "w-full py-1.5 md:py-2 rounded-lg md:rounded-xl font-black uppercase text-[8px] md:text-[9px] tracking-[0.15em] md:tracking-[0.2em] transition-all shadow-sm border-2",
                                                      isSelected 
                                                        ? "bg-[#5c4a33] text-white border-[#5c4a33]" 
                                                        : cn("bg-white hover:bg-opacity-50", color.border, color.text)
                                                    )}
                                                  >
                                                    {isSelected ? 'Надето' : 'Выбрать'}
                                                  </button>
                                                ) : (
                                                  <button 
                                                    onClick={() => buyItem(item.type as any, item.id, item.price)}
                                                    disabled={state.stardust < item.price}
                                                    className={cn(
                                                      "w-full py-1.5 md:py-2 rounded-lg md:rounded-xl font-black uppercase text-[8px] md:text-[9px] tracking-[0.15em] md:tracking-[0.2em] transition-all shadow-md disabled:opacity-40 disabled:grayscale",
                                                      color.accent, "text-white hover:brightness-110 active:scale-95"
                                                    )}
                                                  >
                                                    Купить
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                         </motion.div>
                                       );
                                     });
                                   })()}
                                 </div>
                               </motion.div>
                             ) : (
                               <motion.div
                                 key="backgrounds-list"
                                 initial={{ opacity: 0, y: 10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 exit={{ opacity: 0, y: -10 }}
                                 className="space-y-4"
                               >
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                   {[
                                     { id: 'new_bg', name: 'Зимний уют', price: 0, img: 'new_bg.png' },
                                     { id: 'two_bg', name: 'Звездный берег', price: 1000, img: 'two_bg.png' },
                                     { id: 'three_bg', name: 'Магический лес', price: 1500, img: 'three_bg.png' },
                                     { id: 'four_bg', name: 'Радужный мир', price: 2000, img: 'four_bg.png' },
                                    ].map((item, i) => {
                                     const isOwned = state.inventory.backgrounds.includes(item.id);
                                     const isSelected = state.customization?.backgroundType === item.id;
                                     
                                     const colorIndex = (Math.floor(i / 2) + (i % 2)) % 2 === 0 ? 0 : 1;
                                     const color = PALIA_CATEGORY_COLORS[colorIndex];
                                     
                                     return (
                                       <motion.div 
                                          key={item.id} 
                                          whileHover={{ y: -4 }}
                                          className={cn(
                                            "p-3 md:p-4 rounded-[1.5rem] md:rounded-[2.5rem] border-4 flex items-center gap-4 md:gap-5 transition-all relative overflow-hidden h-32 md:h-40",
                                            color.bg, color.border, color.glow
                                          )}
                                       >
                                          <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                                          
                                          <div className={cn(
                                            "w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden border-2 shrink-0 flex items-center justify-center p-1 bg-white shadow-inner z-10",
                                            color.border
                                          )}>
                                            <img src={`/pets/backhround/${item.img}`} alt={item.name} className="w-full h-full object-cover scale-110" />
                                          </div>

                                          <div className="flex-1 flex flex-col justify-between h-full py-1 md:py-2 z-10">
                                            <div className="space-y-0.5 md:space-y-1">
                                              <p className={cn("font-serif font-bold text-[13px] md:text-base leading-tight text-left", color.text)}>{item.name}</p>
                                              
                                              {!isOwned && (
                                                <div className="flex items-center gap-1.5 md:gap-2">
                                                  <div className={cn("w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center shadow-sm", color.accent)}>
                                                    <Beaker size={8} className="text-white" />
                                                  </div>
                                                  <span className={cn("text-[10px] md:text-[12px] font-black uppercase tracking-widest", color.text)}>{item.price}</span>
                                                </div>
                                              )}
                                            </div>
                                            
                                            <div className="w-full">
                                              {isOwned ? (
                                                <button 
                                                  onClick={() => {
                                                    const newCustomization = { ...state.customization, backgroundType: item.id as any };
                                                    const newState = { ...state, customization: newCustomization };
                                                    setState(newState);
                                                    updateArchiState(newState);
                                                  }}
                                                  className={cn(
                                                    "w-full py-1.5 md:py-2.5 rounded-lg md:rounded-xl font-black uppercase text-[8px] md:text-[10px] tracking-[0.15em] md:tracking-[0.2em] transition-all shadow-sm border-2",
                                                    isSelected 
                                                      ? "bg-[#5c4a33] text-white border-[#5c4a33]" 
                                                      : cn("bg-white hover:bg-opacity-50", color.border, color.text)
                                                  )}
                                                >
                                                  {isSelected ? 'Выбрано' : 'Выбрать'}
                                                </button>
                                              ) : (
                                                <button 
                                                  onClick={() => buyItem('backgrounds', item.id, item.price)}
                                                  disabled={state.stardust < item.price}
                                                  className={cn(
                                                    "w-full py-1.5 md:py-2.5 rounded-lg md:rounded-xl font-black uppercase text-[8px] md:text-[10px] tracking-[0.15em] md:tracking-[0.2em] transition-all shadow-md disabled:opacity-40 disabled:grayscale",
                                                    color.accent, "text-white hover:brightness-110 active:scale-95"
                                                  )}
                                                >
                                                  Купить
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                       </motion.div>
                                     );
                                   })}
                                 </div>
                               </motion.div>
                             )}
                           </AnimatePresence>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'progress' && (
                      <motion.div
                        key="progress"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6 md:space-y-8"
                      >
                        {/* Streak Card */}
                        <div className="bg-gradient-to-br from-orange-400 to-red-500 p-6 md:p-8 rounded-[1.5rem] md:rounded-3xl text-white shadow-xl relative overflow-hidden group">
                          {/* Elixir Balance in Top Right */}
                          <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
                            <motion.div 
                              whileHover={{ scale: 1.05 }}
                              className="bg-white/20 backdrop-blur-md border-2 border-white/30 px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl flex items-center gap-2 shadow-lg"
                            >
                              <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-white flex items-center justify-center shadow-inner">
                                <Beaker size={14} className="text-[#ec4899] md:w-[18px] md:h-[18px]" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest text-white/70 leading-none mb-0.5">Эликсиры</span>
                                <span className="text-base md:text-xl font-black leading-none">{state.stardust}</span>
                              </div>
                            </motion.div>
                          </div>

                          <div className="relative z-10">
                            <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                              <Flame size={24} fill="currentColor" className="animate-pulse md:w-8 md:h-8" />
                              <h3 className="text-xl md:text-3xl font-black uppercase tracking-tighter">Серия заботы</h3>
                            </div>
                            <p className="text-2xl md:text-4xl font-black mb-1 md:mb-2">{state.streak} {state.streak === 1 ? 'день' : 'дня'}</p>
                            <p className="text-xs md:text-base text-white/80 font-medium max-w-[70%]">
                              {state.streak > 0 
                                ? "Вы отлично справляетесь! Не пропускайте дни, чтобы Арчи был счастлив." 
                                : "Начните серию сегодня, покормив или погладив Арчи!"}
                            </p>
                          </div>
                          <Flame size={80} className="absolute -right-2 -bottom-2 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700 md:w-[120px] md:h-[120px]" />
                        </div>

                        {/* Streak Rewards Section */}
                        <div className="space-y-4">
                          <h4 className="text-[#5c4a33] font-black uppercase text-[10px] md:text-xs tracking-widest px-2 flex items-center gap-2">
                            <Gift size={12} className="text-pink-500 md:w-3.5 md:h-3.5" /> Награды за серию
                          </h4>
                          <div className="grid grid-cols-1 gap-2 md:gap-3">
                            {(() => {
                              const milestones = [7, 15, 30, 50, 75, 100, 150, 200, 250, 365];
                              const streakToShow = new Set([
                                ...milestones.filter(m => m <= state.streak),
                                ...milestones.filter(m => m > state.streak).slice(0, 4)
                              ]);
                              
                              return Array.from(streakToShow).sort((a, b) => a - b).map((days) => {
                                const isClaimed = state.claimedStreaks.includes(days);
                                const isAvailable = state.streak >= days;
                                const reward = getRewardForStreak(days);
                                const isBigMilestone = true; // Теперь все БОНУС!

                                const getStreakString = (d: number) => {
                                  const lastDigit = d % 10;
                                  const lastTwoDigits = d % 100;
                                  if (lastDigit === 1 && lastTwoDigits !== 11) return `${d} день`;
                                  if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) return `${d} дня`;
                                  return `${d} дней`;
                                };

                                return (
                                  <div 
                                    key={`streak-reward-${days}`}
                                    className={cn(
                                      "p-4 md:p-5 rounded-[1.5rem] md:rounded-3xl border-4 flex items-center justify-between transition-all relative overflow-hidden",
                                      isClaimed 
                                        ? "bg-zinc-50 border-zinc-200 opacity-60" 
                                        : isAvailable 
                                          ? "bg-white border-pink-400 shadow-lg scale-[1.02]" 
                                          : "bg-zinc-50 border-[#e6d5bc] opacity-60"
                                    )}
                                  >
                                    {isBigMilestone && !isClaimed && isAvailable && (
                                      <motion.div 
                                        animate={{ opacity: [0.1, 0.3, 0.1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-200/30 to-transparent -skew-x-12 translate-x-full animate-[shimmer_2s_infinite]"
                                      />
                                    )}
                                    <div className="flex items-center gap-3 md:gap-4 relative z-10">
                                      <div className={cn(
                                        "w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl shadow-inner",
                                        isClaimed 
                                          ? "bg-zinc-200 text-zinc-400" 
                                          : "bg-pink-100 text-pink-500"
                                      )}>
                                        {days >= 50 ? <Star size={24} fill="currentColor" className="md:w-8 md:h-8" /> : <Flame size={20} className="md:w-7 md:h-7" />}
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-1.5 md:gap-2">
                                          <p className="font-black text-[#5c4a33] uppercase text-xs md:text-sm tracking-tight">
                                            {getStreakString(days)}
                                          </p>
                                          {isBigMilestone && !isClaimed && (
                                            <span className="text-[7px] md:text-[8px] bg-pink-500 text-white px-1 md:px-1.5 py-0.5 rounded-md font-black">БОНУС!</span>
                                          )}
                                        </div>
                                        <p className="text-[10px] md:text-xs text-[#8b7355] font-bold">
                                          {isClaimed ? "Награда получена" : `Награда: ${reward} эликсиров`}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    {isAvailable && !isClaimed && (
                                      <button
                                        onClick={() => claimStreakReward(days)}
                                        className="px-4 md:px-6 py-2 md:py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-lg md:rounded-xl font-black uppercase text-[8px] md:text-[10px] tracking-widest shadow-md transition-all active:scale-95 relative z-10"
                                      >
                                        Забрать
                                      </button>
                                    )}

                                    {isClaimed && (
                                      <div className="text-[#84cc16] font-black uppercase text-[8px] md:text-[10px] tracking-widest flex items-center gap-1 relative z-10">
                                        <Star size={12} fill="currentColor" className="md:w-3.5 md:h-3.5" /> Получено
                                      </div>
                                    )}
                                    
                                    {!isAvailable && (
                                      <div className="text-zinc-400 font-black uppercase text-[8px] md:text-[10px] tracking-widest flex items-center gap-1 relative z-10">
                                        <Clock size={12} className="md:w-3.5 md:h-3.5" /> Скоро
                                      </div>
                                    )}
                                  </div>
                                );
                              });
                            })()}
                            {state.streak < 7 && !state.claimedStreaks.includes(7) && (
                              <div className="p-6 md:p-8 rounded-[1.5rem] md:rounded-3xl border-4 border-dashed border-[#e6d5bc] text-center">
                                <p className="text-[#8b7355] font-bold italic text-[11px] md:text-sm">
                                  Первая награда будет доступна через 7 дней серии!
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all shrink-0",
      active 
        ? "bg-[#5c4a33] text-[#fdfaf3] shadow-lg scale-105" 
        : "text-[#8b7355] hover:bg-[#f5e6d3] border-2 border-transparent hover:border-[#e6d5bc]"
    )}
  >
    {icon}
    <span className="inline">{label}</span>
  </button>
);

const StatBox = ({ label, value, icon, color }: { label: string, value: number, icon: any, color: string }) => (
  <div className="bg-[#fdfaf3] p-5 rounded-[2rem] border-4 border-[#e6d5bc]/40 shadow-sm relative overflow-hidden group">
    <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
    <div className="flex items-center gap-2 text-[#8b7355] mb-3 font-black uppercase text-[9px] tracking-[0.2em] relative z-10">
      {icon}
      <span>{label}</span>
    </div>
    <div className="h-4 bg-[#e6d5bc]/30 rounded-full overflow-hidden border-2 border-[#e6d5bc]/50 relative z-10">
      <motion.div 
        animate={{ width: `${value}%` }}
        className={cn("h-full shadow-[inset_-2px_0_5px_rgba(0,0,0,0.1)]", color)} 
      />
    </div>
    <div className="mt-2 text-right text-[10px] font-black text-[#5c4a33] relative z-10">{Math.round(value)}%</div>
  </div>
);

const BigActionButton = ({ icon, label, desc, onClick, disabled, hoverClass, iconHoverClass }: { icon: any, label: string, desc: string, onClick: () => void, disabled: boolean, hoverClass: string, iconHoverClass: string }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "flex flex-col items-center text-center p-6 rounded-[2.5rem] border-4 transition-all group relative overflow-hidden",
      disabled 
        ? "bg-zinc-100/50 border-zinc-200 opacity-50 cursor-not-allowed" 
        : cn("bg-[#fdfaf3] border-[#e6d5bc]/60 text-[#5c4a33] hover:shadow-xl hover:-translate-y-1 active:scale-95", hoverClass)
    )}
  >
    <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
    <div className={cn(
      "w-14 h-14 rounded-[1.5rem] flex items-center justify-center mb-4 transition-all shadow-md relative z-10",
      disabled ? "bg-zinc-200 text-zinc-400" : cn("bg-[#f5e6d3] text-[#5c4a33] border-2 border-[#e6d5bc]/50", iconHoverClass)
    )}>
      {icon}
    </div>
    <span className="font-black uppercase tracking-[0.2em] text-[10px] mb-1 relative z-10">{label}</span>
    <span className="text-[9px] text-[#8b7355] font-bold italic relative z-10">{desc}</span>
  </button>
);

