'use client';

import { useState, useEffect, useMemo } from 'react';
import { User, Heart, Lock, Calendar, Edit3, Save, X, Sparkles, Plus, Trees, Moon, Archive, ArrowLeft, Mail, Trash2, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useData } from '@/components/DataProvider';
import { useModal } from '@/context/ModalContext';

interface ProfileField {
  id: string;
  label: string;
  value: string;
}

interface ProfileCategory {
  id: string;
  title: string;
  emoji: string;
  fields: ProfileField[];
}

interface ProfileData {
  id: string;
  name: string;
  status: string;
  mood: string;
  pref: string;
  avatarColor: string;
  categories: ProfileCategory[];
}

interface TimeCapsule {
  id: string;
  title: string;
  description: string;
  unlockDate: string;
  isLocked: boolean;
  content: string;
  author: 'Grinch' | 'Cindy';
}

const EMOJI_LIST: string[] = [];

export default function ProfilePage() {
  const { currentUser, spaceConfig, profiles, capsules: realCapsules, refreshProfiles, refreshCapsules } = useData();
  const { setIsModalOpen } = useModal();
  
  // Mock data for testing
  const mockCapsules: TimeCapsule[] = [
    {
      id: '1',
      title: 'Первое послание',
      description: 'Послание на Новый Год',
      unlockDate: '2027-01-01',
      isLocked: false,
      content: 'Привет, мы это мы через год! Надеюсь мы все еще вместе и счастливы!',
      author: 'Grinch'
    },
    {
      id: '2',
      title: 'Летнее воспоминание',
      description: 'Послание на лето 2026',
      unlockDate: '2026-07-01',
      isLocked: false,
      content: 'Надеюсь лето было жаркое и солнечное!',
      author: 'Cindy'
    },
    {
      id: '3',
      title: 'Будущее',
      description: 'Послание через год',
      unlockDate: '2027-06-16',
      isLocked: true,
      content: 'Это тайна!',
      author: 'Grinch'
    }
  ];
  
  // Use real data only
  const capsules = realCapsules;

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedCapsule, setSelectedCapsule] = useState<TimeCapsule | null>(null);
  const [isCapsuleModalOpen, setIsCapsuleModalOpen] = useState(false);
  const [isEditingCapsule, setIsEditingCapsule] = useState(false);
  const [capsuleEditData, setCapsuleEditData] = useState<Partial<TimeCapsule>>({});
  const [editData, setEditData] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [now, setNow] = useState(new Date());
  const [currentCapsulePage, setCurrentCapsulePage] = useState(0);

  // Pagination logic for long capsule content
  const CHARS_PER_PAGE = 240;
  const getCapsulePages = (text: string) => {
    if (!text) return [""];
    const words = text.split(' ');
    const pages = [];
    let currentPageText = "";

    words.forEach(word => {
      if ((currentPageText + word).length > CHARS_PER_PAGE) {
        pages.push(currentPageText.trim());
        currentPageText = word + " ";
      } else {
        currentPageText += word + " ";
      }
    });
    
    if (currentPageText.trim()) pages.push(currentPageText.trim());
    return pages.length > 0 ? pages : [""];
  };

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000); // Update every 30s for presence
    return () => clearInterval(timer);
  }, []);

  // Refresh profiles periodically to get status updates
  useEffect(() => {
    const interval = setInterval(refreshProfiles, 30000);
    return () => clearInterval(interval);
  }, [refreshProfiles]);

  const nextCapsule = useMemo(() => {
    const futureCapsules = capsules
      .filter(c => new Date(c.unlockDate) > now)
      .sort((a, b) => new Date(a.unlockDate).getTime() - new Date(b.unlockDate).getTime());

    if (futureCapsules.length === 0) return null;

    const next = futureCapsules[0];
    const diff = new Date(next.unlockDate).getTime() - now.getTime();
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  }, [capsules, now]);

  useEffect(() => {
    setIsModalOpen(!!selectedProfileId || isCapsuleModalOpen);
  }, [selectedProfileId, isCapsuleModalOpen, setIsModalOpen]);

  const getPresenceStatus = (profile: any) => {
    if (!profile.lastActive) return { text: 'Не в сети', online: false };
    
    const lastSeen = new Date(profile.lastActive);
    const diff = now.getTime() - lastSeen.getTime();
    const minutes = diff / (1000 * 60);

    if (minutes < 2) {
      return { text: 'В сети', online: true };
    } else if (minutes < 10) {
      return { text: 'Неактивен', online: true, isIdle: true };
    } else {
      return { text: 'Не в сети', online: false };
    }
  };

  const openDetails = (id: string) => {
    setSelectedProfileId(id);
    setIsEditing(false);
  };

  const [isDeletingCapsule, setIsDeletingCapsule] = useState<string | null>(null);

  const canEditProfile = (profileId: string) => {
    return true; // Разрешаем всем редактировать все профили
  };

  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedProfileId && canEditProfile(selectedProfileId)) {
      const data = getProfileData(selectedProfileId);
      if (data) {
        setEditData(JSON.parse(JSON.stringify(data)));
        setIsEditing(true);
      }
    } else {
      alert('Вы можете редактировать только свой профиль!');
    }
  };

  const saveDetails = async () => {
    if (!selectedProfileId || !editData) return;
    
    // Check if the user is authorized to edit this profile
    if (!canEditProfile(selectedProfileId)) {
      alert('Вы можете редактировать только свой профиль!');
      return;
    }
    
    try {
      const profile = profiles[selectedProfileId];
      const profileId = profile.realId || profile.id;
      
      console.log('Saving profile for:', profileId);

      // Пытаемся сохранить все данные
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editData.name,
          pref: editData.pref,
          categories: editData.categories || []
        })
        .eq('id', profileId);

      if (error) {
        console.error('Supabase error:', error);
        alert(`Ошибка Supabase: ${error.message || 'Неизвестная ошибка'}`);
        return;
      }

      console.log('Success! Refreshing...');
      await refreshProfiles();
      setIsEditing(false);
      
    } catch (err: any) {
      console.error('Network error:', err);
      alert(`Ошибка сети: ${err.message || 'Не удалось связаться с сервером'}`);
    }
  };

  const addCategory = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (editData) {
      const newCategory: ProfileCategory = {
        id: Date.now().toString(),
        title: 'Новая категория',
        emoji: '',
        fields: [{ id: Date.now().toString() + '-f', label: 'Новое поле', value: '' }]
      };
      setEditData({ ...editData, categories: [...editData.categories, newCategory] });
    }
  };

  const addField = (categoryId: string) => {
    if (editData) {
      const updatedCategories = editData.categories.map(cat => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            fields: [...cat.fields, { id: Date.now().toString(), label: 'Новое поле', value: '' }]
          };
        }
        return cat;
      });
      setEditData({ ...editData, categories: updatedCategories });
    }
  };

  const removeField = (categoryId: string, fieldId: string) => {
    if (editData) {
      const updatedCategories = editData.categories.map(cat => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            fields: cat.fields.filter(f => f.id !== fieldId)
          };
        }
        return cat;
      });
      setEditData({ ...editData, categories: updatedCategories });
    }
  };

  const removeCategory = (categoryId: string) => {
    if (editData) {
      setEditData({
        ...editData,
        categories: editData.categories.filter(cat => cat.id !== categoryId)
      });
    }
  };

  const openCapsule = (capsule: TimeCapsule) => {
    const isUnlocked = new Date(capsule.unlockDate) <= new Date();
    setSelectedCapsule({ ...capsule, isLocked: !isUnlocked });
    setIsCapsuleModalOpen(true);
    setIsEditingCapsule(false);
    setCurrentCapsulePage(0);
  };

  const startCreateCapsule = () => {
    setCapsuleEditData({
      title: '',
      description: '',
      unlockDate: new Date().toISOString().split('T')[0],
      content: ''
    });
    setIsEditingCapsule(true);
    setIsCapsuleModalOpen(true);
    setSelectedCapsule(null);
  };

  const canEditCapsule = (capsule: TimeCapsule | null) => {
    if (!currentUser || !capsule) return false;
    
    // Explicit check for both authors to prevent overlap
    const isGrinchAuthor = capsule.author === 'Grinch';
    const isCindyAuthor = capsule.author === 'Cindy';
    
    if (currentUser === 'Grinch') return isGrinchAuthor;
    if (currentUser === 'Cindy') return isCindyAuthor;
    
    return false;
  };

  const deleteCapsule = async (id: string) => {
    const capsuleToDelete = capsules.find(c => c.id === id);
    if (!capsuleToDelete || !canEditCapsule(capsuleToDelete)) {
      alert('Вы не можете удалить чужую капсулу!');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('time_capsules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await refreshCapsules();
      setIsDeletingCapsule(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      alert('Ошибка при удалении');
    }
  };

  const startEditCapsule = (capsule: TimeCapsule) => {
     if (!canEditCapsule(capsule)) {
       alert('Вы можете редактировать только свои капсулы!');
       return;
     }
     setCapsuleEditData(capsule);
     setIsEditingCapsule(true);
   };

   const saveCapsule = async () => {
    try {
      const capsuleData = {
        space_id: spaceConfig?.id,
        title: capsuleEditData.title || 'Новая капсула',
        description: capsuleEditData.description || '',
        unlock_date: capsuleEditData.unlockDate || new Date().toISOString().split('T')[0],
        content: capsuleEditData.content || '',
        is_sealed: true,
        author: currentUser === 'Grinch' ? 'The Grinch' : 'Cindy Lou'
      };

      if (capsuleEditData.id) {
        // Check author before updating using the new robust logic
        const existingCapsule = capsules.find(c => c.id === capsuleEditData.id);
        if (!existingCapsule || !canEditCapsule(existingCapsule)) {
          alert('Вы не можете редактировать чужую капсулу!');
          return;
        }

        const { error } = await supabase
          .from('time_capsules')
          .update(capsuleData)
          .eq('id', capsuleEditData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('time_capsules')
          .insert([capsuleData]);
        if (error) throw error;
      }

      await refreshCapsules();
      setIsCapsuleModalOpen(false);
      setIsEditingCapsule(false);
      setCapsuleEditData({ title: '', description: '', unlockDate: '', content: '' });
    } catch (err: any) {
      console.error('Capsule creation error:', err);
      alert('Ошибка при создании капсулы: ' + (err.message || 'Неизвестная ошибка'));
    }
  };

  const getProfileData = (id: string) => {
    const profile = profiles[id];
    if (!profile) return null;
    
    return {
      ...profile,
      categories: Array.isArray(profile.categories) ? profile.categories : []
    };
  };

  const selectedProfile = selectedProfileId ? getProfileData(selectedProfileId) : null;

  return (
    <div className="relative min-h-screen bg-[#fdfaf3]">
      {/* Background Decor (from Gallery) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#f0f9ff]/50 via-transparent to-[#fdf2f8]/50" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#0ea5e9]/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#ec4899]/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-20 pb-40 md:pb-52 space-y-8 md:space-y-12 relative z-10">
        {/* Mobile Header (from Gallery) */}
        <div className="md:hidden flex flex-col gap-4">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5c4a33] text-[#fdfaf3] text-[9px] font-bold uppercase tracking-widest shadow-md">
              <Clock size={10} />
              {nextCapsule 
                ? `Капсула через: ${nextCapsule.days}д ${nextCapsule.hours}ч` 
                : 'Все открыто'}
            </div>
            <h1 className="text-4xl font-serif font-bold text-[#5c4a33] tracking-tight">
              Созвездие Чувств
            </h1>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={startCreateCapsule}
              className="flex-1 flex items-center justify-center gap-2 bg-[#5c4a33] px-4 py-3 rounded-[1.5rem] text-[#fdfaf3] font-black uppercase tracking-widest shadow-md text-[10px] active:scale-95 transition-transform">
              <Plus size={16} />
              Создать
            </button>
            <div className="flex-1 flex items-center justify-center gap-2 bg-[#fdfaf3] border-4 border-[#e6d5bc]/30 px-4 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-sm text-[#5c4a33]">
              <Lock size={16} className="text-amber-500" />
              {capsules.length} всего
            </div>
          </div>
        </div>

        {/* Desktop Header (Palia styled) */}
        <header className="hidden md:flex flex-col md:flex-row gap-6 items-start md:items-end justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5c4a33] text-[#fdfaf3] text-[10px] font-bold uppercase tracking-widest shadow-md">
              <Clock size={12} />
              {nextCapsule 
                ? `Следующая капсула через: ${nextCapsule.days}д ${nextCapsule.hours}ч ${nextCapsule.minutes}м` 
                : 'Все капсулы открыты'}
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-black text-[#5c4a33] tracking-tight leading-tight">
              Созвездие Чувств
            </h1>
            <p className="text-[#8b7355] italic text-lg max-w-xl">
              Храним моменты, которые раскроются в нужный час.
            </p>
          </div>
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <div className="bg-[#fdfaf3] p-7 rounded-[3rem] border-[10px] border-[#e6d5bc]/30 shadow-[15px_15px_40px_rgba(0,0,0,0.06)] flex items-center justify-between relative overflow-hidden min-w-[420px] group transition-all duration-500 hover:shadow-[20px_20px_60px_rgba(0,0,0,0.08)]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/8 via-transparent to-[#ec4899]/8 opacity-40" />
              <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
              
              <div className="flex items-center gap-7 relative z-10 flex-1 justify-center px-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-[2rem] bg-white flex items-center justify-center text-[#5c4a33] shadow-lg border-4 border-[#e6d5bc]/50 shrink-0 group-hover:rotate-6 transition-transform duration-500">
                    {nextCapsule ? <Clock size={36} className="text-[#0ea5e9]/80" /> : <Lock size={36} className="text-[#ec4899]/80" />}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[12px] font-black uppercase text-[#8b7355] tracking-[0.2em] whitespace-nowrap opacity-70">
                    {nextCapsule ? 'До открытия памяти' : 'Все капсулы открыты'}
                  </p>
                  <p className="text-4xl font-serif font-black text-[#5c4a33] whitespace-nowrap drop-shadow-sm">
                    {nextCapsule 
                      ? `${nextCapsule.days}д ${nextCapsule.hours}ч ${nextCapsule.minutes}м` 
                      : `${capsules.length} всего`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Profile Cards Section */}
        <section className="space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
            {Object.values(profiles).map((profile: any) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={() => openDetails(profile.id)}
                className="cursor-pointer group"
              >
                <div className={cn(
                  "relative p-2 md:p-3 rounded-[2.5rem] md:rounded-[3rem] shadow-[15px_15px_40px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden",
                  profile.id === 'Grinch' || profile.id === 'me' ? "bg-[#f0f9ff]" : "bg-[#fdf2f8]"
                )}>
                  {/* Фоновое свечение в стиле Palia */}
                  <div className={cn(
                    "absolute -inset-10 blur-[60px] opacity-10 transition-all duration-700 group-hover:opacity-20",
                    profile.id === 'Grinch' || profile.id === 'me' ? "bg-[#0ea5e9]" : "bg-[#ec4899]"
                  )} />

                  <div className={cn(
                    "bg-[#fdfaf3] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border-4 md:border-8 relative overflow-hidden transition-all duration-500",
                    profile.id === 'Grinch' || profile.id === 'me' ? "border-[#bae6fd]" : "border-[#fbcfe8]"
                  )}>
                    {/* Paper texture overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                    
                    <div className="flex flex-col items-center text-center space-y-4 md:space-y-6 relative z-10">
                      {/* Palia-style Avatar */}
                      <div className="relative z-10">
                        <div className={cn(
                          "w-24 h-24 md:w-36 md:h-36 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center shadow-xl border-4 transition-transform duration-500 group-hover:rotate-1",
                          profile.id === 'Grinch' || profile.id === 'me'
                            ? "bg-[#f0f9ff] text-[#0ea5e9]/70 border-[#bae6fd]"
                            : "bg-[#fdf2f8] text-[#ec4899]/70 border-[#fbcfe8]"
                        )}>
                          <div className="relative z-10">
                            {profile.id === 'Grinch' || profile.id === 'me' ? (
                              <Trees className="w-12 h-12 md:w-[70px] md:h-[70px]" strokeWidth={1.5} />
                            ) : (
                              <Moon className="w-12 h-12 md:w-[70px] md:h-[70px]" strokeWidth={1.5} />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-1 md:space-y-2 relative z-10">
                        <h2 className={cn(
                          "text-2xl md:text-4xl font-serif font-black tracking-tight",
                          profile.id === 'Grinch' || profile.id === 'me' ? "text-[#0369a1]/90" : "text-[#be185d]/90"
                        )}>{profile.name}</h2>
                        <div className="flex items-center justify-center gap-2 md:gap-2.5">
                          <span className={cn(
                            "block w-2 h-2 md:w-3 md:h-3 rounded-full border-2 transition-colors duration-500",
                            (() => {
                              const status = getPresenceStatus(profile);
                              if (!status.online) return "bg-zinc-300 border-zinc-100";
                              if (status.isIdle) return "bg-amber-400 border-white animate-pulse";
                              return (profile.id === 'Grinch' || profile.id === 'me' ? "bg-[#0ea5e9]/80 border-white" : "bg-[#ec4899]/80 border-white") + " animate-pulse";
                            })()
                          )} />
                          <p className={cn(
                            "text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-colors duration-500",
                            getPresenceStatus(profile).online ? "text-[#5c4a33]" : "text-[#8b7355] opacity-60"
                          )}>
                            {getPresenceStatus(profile).text}
                          </p>
                        </div>
                      </div>

                      {/* Bio section in Palia style */}
                      <div className="w-full relative z-10">
                        <div className={cn(
                          "bg-white/40 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 border-2 border-dashed transition-all duration-500",
                          profile.id === 'Grinch' || profile.id === 'me' ? "border-[#bae6fd]/60" : "border-[#fbcfe8]/60"
                        )}>
                          <p className={cn(
                            "font-serif italic text-base md:text-xl leading-relaxed text-center opacity-80",
                            profile.id === 'Grinch' || profile.id === 'me' ? "text-[#0369a1]" : "text-[#be185d]"
                          )}>
                            "{profile.pref || "Место для твоей истории..."}"
                          </p>
                        </div>
                      </div>

                      {/* Redesigned button */}
                      <div className="pt-1 md:pt-2 relative z-10 w-full">
                        <span className={cn(
                          "inline-flex items-center justify-center gap-2 md:gap-3 w-full py-3 md:py-5 text-[#fdfaf3] rounded-[1.5rem] md:rounded-[2rem] text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] shadow-lg border-2 border-white/20 transform group-hover:translate-y-[-3px] transition-all",
                          profile.id === 'Grinch' || profile.id === 'me'
                            ? "bg-[#0ea5e9]/90 hover:bg-[#0ea5e9]"
                            : "bg-[#ec4899]/90 hover:bg-[#ec4899]"
                        )}>
                          <Sparkles size={14} className="md:w-4 md:h-4" />
                          Открыть анкету
                          <Sparkles size={14} className="md:w-4 md:h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Time Capsules Section */}
        <section className="space-y-6 md:space-y-8 pt-8 md:pt-12">
          <div className="flex items-center justify-between border-b-4 md:border-b-8 border-[#e6d5bc]/30 pb-4 md:pb-6">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.2rem] md:rounded-[1.5rem] bg-[#5c4a33] text-[#fdfaf3] flex items-center justify-center shadow-xl border-4 border-[#e6d5bc]">
                <Lock size={24} className="md:w-8 md:h-8" />
              </div>
              <div>
                <h2 className="text-2xl md:text-4xl font-serif font-black text-[#5c4a33]">Капсулы времени</h2>
                <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#8b7355]">Тайные послания в будущее</p>
              </div>
            </div>
            <button 
              onClick={startCreateCapsule}
              className="flex items-center gap-2 bg-[#5c4a33] text-[#fdfaf3] px-5 py-3 md:px-8 md:py-4 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase tracking-widest text-[9px] md:text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={16} className="md:w-[18px] md:h-[18px]" />
              Создать
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {capsules.map((capsule) => {
              const isUnlocked = new Date(capsule.unlockDate) <= new Date();
              return (
                <motion.div
                  key={capsule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  onClick={() => openCapsule(capsule)}
                  className="cursor-pointer"
                >
                  <div className="relative p-1.5 md:p-2 bg-[#e6d5bc] rounded-[2rem] md:rounded-[2.5rem] shadow-xl">
                    <div className="bg-[#fdfaf3] rounded-[1.8rem] md:rounded-[2.2rem] p-5 md:p-8 border-4 md:border-[12px] border-[#e6d5bc]/30 relative overflow-hidden flex items-center gap-4 md:gap-6">
                      <div className={cn(
                        "w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center transition-all shadow-inner border-2 md:border-4",
                        isUnlocked ? "bg-emerald-50 border-emerald-200 text-emerald-500" : "bg-white border-[#e6d5bc] text-[#e6d5bc]"
                      )}>
                        {isUnlocked ? <Sparkles size={24} className="md:w-8 md:h-8" /> : <Lock size={24} className="md:w-8 md:h-8" />}
                      </div>
                      <div className="space-y-1 md:space-y-2">
                        <h4 className="text-xl md:text-2xl font-serif font-black text-[#5c4a33]">{capsule.title}</h4>
                        <div className="flex items-center gap-1.5 md:gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#8b7355]">
                          <Calendar size={10} className="md:w-3 md:h-3" />
                          Откроется: {capsule.unlockDate}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {capsules.length === 0 && (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-center space-y-6 bg-[#fdfaf3]/50 rounded-[3rem] border-[12px] border-dashed border-[#e6d5bc]/30">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-[#e6d5bc] shadow-inner border-4 border-[#e6d5bc]">
                  <Lock size={40} />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-serif font-black text-[#5c4a33]">Архив пока пуст</p>
                  <p className="text-sm text-[#8b7355] italic max-w-xs mx-auto">
                    "Оставьте послание себе в будущее, которое откроется в особый день."
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

      </div>

      {/* Profile Detail Modal */}
      <AnimatePresence>
        {selectedProfileId && selectedProfile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProfileId(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl bg-[#fdfaf3] rounded-[2rem] md:rounded-[3.5rem] shadow-2xl border-4 md:border-[12px] border-[#e6d5bc] overflow-hidden group/modal max-h-[90vh] flex flex-col"
            >
              {/* Фоновое свечение внутри модалки */}
              <div className={cn(
                "absolute -inset-20 blur-[100px] opacity-10 transition-all duration-1000 pointer-events-none",
                selectedProfile.id === 'Grinch' || selectedProfile.id === 'me' ? "bg-[#0ea5e9]" : "bg-[#ec4899]"
              )} />

              <div className={cn(
                "p-4 md:p-8 flex items-center justify-between bg-[#fdfaf3] border-b-4 relative overflow-hidden shrink-0",
                selectedProfile.id === 'Grinch' || selectedProfile.id === 'me' ? "border-[#bae6fd]" : "border-[#fbcfe8]"
              )}>
                <div className="flex items-center gap-4 md:gap-6 relative z-10">
                  <div className={cn(
                    "w-12 h-12 md:w-16 md:h-16 rounded-[1rem] md:rounded-[1.2rem] flex items-center justify-center shadow-md border-2 md:border-4 overflow-hidden relative",
                    selectedProfile.id === 'Grinch' || selectedProfile.id === 'me' 
                      ? "bg-[#f0f9ff] border-[#bae6fd] text-[#0ea5e9]" 
                      : "bg-[#fdf2f8] border-[#fbcfe8] text-[#ec4899]"
                  )}>
                    <div className="relative z-10">
                      {selectedProfile.id === 'Grinch' || selectedProfile.id === 'me' ? (
                        <Trees className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />
                      ) : (
                        <Moon className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />
                      )}
                    </div>
                  </div>
                  <div className="space-y-0">
                    {isEditing ? (
                      <input 
                        value={editData!.name}
                        onChange={(e) => setEditData({...editData!, name: e.target.value})}
                        className={cn(
                          "text-xl md:text-3xl font-serif font-black tracking-tight bg-transparent border-b-2 focus:ring-0 outline-none w-full",
                          selectedProfile.id === 'Grinch' || selectedProfile.id === 'me' ? "text-[#0369a1] border-[#bae6fd]" : "text-[#be185d] border-[#fbcfe8]"
                        )}
                      />
                    ) : (
                      <h2 className={cn(
                        "text-xl md:text-3xl font-serif font-black tracking-tight",
                        selectedProfile.id === 'Grinch' || selectedProfile.id === 'me' ? "text-[#0369a1]" : "text-[#be185d]"
                      )}>{selectedProfile.name}</h2>
                    )}
                    <p className="text-[8px] md:text-[9px] text-[#8b7355]/60 font-black uppercase tracking-[0.2em]">Дневник приключений</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedProfileId(null)}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center transition-all border-4 border-[#e6d5bc]/30 text-[#8b7355] hover:scale-110 shadow-sm z-20"
                >
                  <X size={20} className="md:w-6 md:h-6" />
                </button>
              </div>

              {/* Content Wrapper - Two Columns */}
              <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-0 relative z-10">
                {/* Left Column: Bio/Chronicle */}
                <div className="w-full md:w-[40%] p-6 md:p-8 border-b-4 md:border-b-0 md:border-r-4 border-[#e6d5bc]/30 overflow-y-auto custom-scrollbar bg-white/20">
                  <div className={cn(
                    "bg-white/60 backdrop-blur-md rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 border-4 border-dashed relative overflow-hidden transition-all h-full flex flex-col justify-center",
                    selectedProfile.id === 'Grinch' || selectedProfile.id === 'me' ? "border-[#bae6fd]/60" : "border-[#fbcfe8]/60"
                  )}>
                    <div className="relative z-10 space-y-4 md:space-y-6">
                      <div className="flex items-center justify-center gap-3">
                        <div className="h-px w-6 md:w-8 bg-[#8b7355]/20" />
                        <label className={cn(
                          "text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-center",
                          selectedProfile.id === 'Grinch' || selectedProfile.id === 'me' ? "text-[#0ea5e9]/60" : "text-[#ec4899]/60"
                        )}>Личная летопись</label>
                        <div className="h-px w-6 md:w-8 bg-[#8b7355]/20" />
                      </div>
                      {isEditing ? (
                        <textarea 
                          value={editData!.pref}
                          onChange={(e) => setEditData({...editData!, pref: e.target.value})}
                          className={cn(
                            "w-full bg-white/80 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-6 border-2 font-serif italic text-base md:text-xl leading-relaxed text-center focus:ring-4 resize-none outline-none no-scrollbar shadow-inner transition-all",
                            selectedProfile.id === 'Grinch' || selectedProfile.id === 'me' 
                              ? "text-[#0369a1] border-[#bae6fd] focus:ring-[#0ea5e9]/10 focus:border-[#0ea5e9]" 
                              : "text-[#be185d] border-[#fbcfe8] focus:ring-[#ec4899]/10 focus:border-[#ec4899]"
                          )}
                          placeholder="Опиши свою историю здесь..."
                          rows={6}
                        />
                      ) : (
                        <p className={cn(
                          "font-serif italic text-base md:text-xl leading-relaxed text-center",
                          selectedProfile.id === 'Grinch' || selectedProfile.id === 'me' ? "text-[#0369a1]/80" : "text-[#be185d]/80"
                        )}>
                          "{selectedProfile.pref || "В ожидании первых слов истории..."}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Categories */}
                <div className="w-full md:w-[60%] p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-6 md:space-y-8 bg-white/10">
                  <div className="space-y-8 md:space-y-10">
                    {(isEditing ? editData!.categories : selectedProfile.categories).map((category: any) => (
                      <div key={category.id} className="space-y-4 md:space-y-6 group/cat relative">
                        <div className="flex items-center justify-between border-b-2 border-dashed border-[#e6d5bc] pb-2 md:pb-3">
                          <div className="flex items-center gap-4">
                            {isEditing ? (
                              <div className="flex items-center gap-4">
                                <input 
                                  value={category.title}
                                  onChange={(e) => {
                                    const updated = editData!.categories.map(c => 
                                      c.id === category.id ? { ...c, title: e.target.value } : c
                                    );
                                    setEditData({ ...editData!, categories: updated });
                                  }}
                                  className={cn(
                                    "bg-white/80 border-2 rounded-xl px-4 py-1.5 font-serif font-black text-lg md:text-xl focus:ring-4 outline-none transition-all shadow-inner",
                                    selectedProfile.id === 'Grinch' || selectedProfile.id === 'me' ? "border-[#bae6fd] text-[#0369a1] focus:ring-[#0ea5e9]/10 focus:border-[#0ea5e9]" : "border-[#fbcfe8] text-[#be185d] focus:ring-[#ec4899]/10 focus:border-[#ec4899]"
                                  )}
                                />
                              </div>
                            ) : (
                              <h3 className="text-lg md:text-xl font-serif font-black text-[#5c4a33] tracking-tight uppercase">{category.title}</h3>
                            )}
                          </div>
                          {isEditing && (
                            <button 
                              onClick={() => removeCategory(category.id)}
                              className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                            >
                              <Trash2 size={16} className="md:w-[18px] md:h-[18px]" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                          {category.fields.map((field: any) => (
                            <div key={field.id} className="relative group/field">
                              {isEditing ? (
                                <div className="space-y-2 bg-white/40 p-4 rounded-[1.2rem] md:rounded-[1.5rem] border-2 border-[#e6d5bc]/50 shadow-sm hover:shadow-md transition-all">
                                  <div className="flex items-center justify-between">
                                    <input 
                                      value={field.label}
                                      onChange={(e) => {
                                        const updated = editData!.categories.map(c => {
                                          if (c.id === category.id) {
                                            return {
                                              ...c,
                                              fields: c.fields.map((f: any) => f.id === field.id ? { ...f, label: e.target.value } : f)
                                            };
                                          }
                                          return c;
                                        });
                                        setEditData({ ...editData!, categories: updated });
                                      }}
                                      className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-[#8b7355] bg-transparent border-b border-[#e6d5bc] focus:border-[#5c4a33] outline-none w-2/3 transition-all"
                                    />
                                    <button 
                                      onClick={() => removeField(category.id, field.id)}
                                      className="p-1.5 text-red-300 hover:text-red-500 transition-colors"
                                    >
                                      <X size={12} className="md:w-[14px] md:h-[14px]" />
                                    </button>
                                  </div>
                                  <input 
                                    value={field.value}
                                    onChange={(e) => {
                                      const updated = editData!.categories.map(c => {
                                        if (c.id === category.id) {
                                          return {
                                            ...c,
                                            fields: c.fields.map((f: any) => f.id === field.id ? { ...f, value: e.target.value } : f)
                                          };
                                        }
                                        return c;
                                      });
                                      setEditData({ ...editData!, categories: updated });
                                    }}
                                    className="w-full bg-white/80 rounded-lg px-3 py-1.5 md:py-2 font-serif italic text-sm md:text-base text-[#5c4a33] border-2 border-transparent focus:border-[#e6d5bc] outline-none shadow-inner transition-all"
                                  />
                                </div>
                              ) : (
                                <div className="bg-white/40 p-3 md:p-4 rounded-[1.2rem] md:rounded-[1.5rem] border-2 border-[#e6d5bc]/40 shadow-sm relative overflow-hidden group-hover/field:shadow-md transition-all h-full">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-[#e6d5bc]/20" />
                                  <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-[#8b7355]/60 mb-0.5 md:mb-1">{field.label}</p>
                                  <p className="text-base md:text-lg font-serif font-black text-[#5c4a33] leading-tight">{field.value || "—"}</p>
                                </div>
                              )}
                            </div>
                          ))}
                          
                          {isEditing && (
                            <button 
                              onClick={() => addField(category.id)}
                              className={cn(
                                "flex items-center justify-center gap-2 p-3 md:p-4 rounded-[1.2rem] md:rounded-[1.5rem] border-2 border-dashed text-[#8b7355] transition-all group/add shadow-sm bg-white/20",
                                selectedProfile.id === 'Grinch' || selectedProfile.id === 'me' ? "border-[#bae6fd] hover:border-[#0ea5e9] hover:text-[#0ea5e9]" : "border-[#fbcfe8] hover:border-[#ec4899] hover:text-[#ec4899]"
                              )}
                            >
                              <Plus size={14} className="md:w-4 md:h-4 group-hover/add:rotate-90 transition-transform" />
                              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em]">Добавить поле</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {isEditing && (
                      <button 
                        onClick={(e) => addCategory(e)}
                        className={cn(
                          "w-full flex items-center justify-center gap-2 md:gap-3 p-4 md:p-5 rounded-xl md:rounded-2xl border-2 border-dashed text-[#8b7355] transition-all bg-white/20 hover:scale-[1.01] active:scale-[0.99]",
                          selectedProfile.id === 'Grinch' || selectedProfile.id === 'me' ? "border-[#bae6fd] hover:border-[#0ea5e9] hover:text-[#0ea5e9]" : "border-[#fbcfe8] hover:border-[#ec4899] hover:text-[#ec4899]"
                        )}
                      >
                        <Plus size={18} className="md:w-5 md:h-5" />
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Создать новую категорию</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className={cn(
                "p-6 md:p-10 bg-white/60 border-t-4 relative z-20 shrink-0",
                selectedProfile.id === 'Grinch' || selectedProfile.id === 'me' ? "border-[#bae6fd]" : "border-[#fbcfe8]"
              )}>
                {isEditing ? (
                  <div className="flex gap-4 md:gap-6">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase tracking-[0.2em] text-[9px] md:text-[11px] text-[#8b7355] hover:text-[#5c4a33] transition-all bg-[#f5e6d3] border-4 border-[#e6d5bc] shadow-md active:scale-95"
                    >
                      Отмена
                    </button>
                    <button 
                      onClick={saveDetails}
                      className={cn(
                        "flex-[2] py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase tracking-[0.2em] text-[9px] md:text-[11px] text-white shadow-xl border-b-4 border-black/20 transition-all active:scale-95",
                        selectedProfile.id === 'Grinch' || selectedProfile.id === 'me' ? "bg-[#0ea5e9] hover:bg-[#0284c7]" : "bg-[#ec4899] hover:bg-[#db2777]"
                      )}
                    >
                      Сохранить
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={startEditing}
                    className={cn(
                      "w-full py-4 md:py-5 rounded-[1.5rem] md:rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[10px] md:text-[12px] text-white shadow-xl border-b-4 md:border-b-8 border-black/10 transition-all flex items-center justify-center gap-3 md:gap-4 active:border-b-0 active:translate-y-1 md:active:translate-y-2",
                      selectedProfile.id === 'Grinch' || selectedProfile.id === 'me' ? "bg-[#0ea5e9] hover:bg-[#0284c7]" : "bg-[#ec4899] hover:bg-[#db2777]"
                    )}
                  >
                    <Edit3 size={18} className="md:w-5 md:h-5" />
                    Редактировать анкету
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Time Capsule Modal - Palia Scroll Style */}
      <AnimatePresence>
        {isCapsuleModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCapsuleModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-3xl bg-[#fdfaf3] rounded-[2rem] md:rounded-[3.5rem] shadow-2xl border-4 md:border-[12px] border-[#e6d5bc] overflow-hidden p-1 md:p-2"
            >
              {isEditingCapsule ? (
                <div className="p-5 md:p-8 space-y-6 md:space-y-8 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]">
                  <div className="text-center space-y-1 md:space-y-2">
                    <h3 className="text-2xl md:text-3xl font-serif font-black text-[#5c4a33]">
                      {capsuleEditData.id ? 'Свиток Изменений' : 'Новое Послание'}
                    </h3>
                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#8b7355]">Запечатайте свои мысли во времени</p>
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    <div className="space-y-2 md:space-y-3">
                      <label className="text-[8px] md:text-[10px] uppercase font-black text-[#8b7355] ml-2 md:ml-4">Заголовок Свитка</label>
                      <input 
                        value={capsuleEditData.title}
                        onChange={e => setCapsuleEditData({...capsuleEditData, title: e.target.value})}
                        className="w-full bg-white border-2 md:border-4 border-[#e6d5bc] rounded-[1rem] md:rounded-[1.5rem] px-4 md:px-6 py-3 md:py-4 focus:ring-0 focus:border-[#5c4a33] transition-all font-serif font-bold text-base md:text-lg text-[#5c4a33] shadow-inner"
                        placeholder="Как назовем это чудо?"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <div className="space-y-2 md:space-y-3">
                        <label className="text-[8px] md:text-[10px] uppercase font-black text-[#8b7355] ml-2 md:ml-4">Дата</label>
                        <input 
                          type="date"
                          value={capsuleEditData.unlockDate}
                          onChange={e => setCapsuleEditData({...capsuleEditData, unlockDate: e.target.value})}
                          className="w-full bg-white border-2 md:border-4 border-[#e6d5bc] rounded-[1rem] md:rounded-[1.5rem] px-3 md:px-4 py-3 md:py-4 focus:ring-0 focus:border-[#5c4a33] transition-all font-bold text-sm md:text-lg text-[#5c4a33] shadow-inner"
                        />
                      </div>
                      <div className="space-y-2 md:space-y-3">
                        <label className="text-[8px] md:text-[10px] uppercase font-black text-[#8b7355] ml-2 md:ml-4">Суть</label>
                        <input 
                          value={capsuleEditData.description}
                          onChange={e => setCapsuleEditData({...capsuleEditData, description: e.target.value})}
                          className="w-full bg-white border-2 md:border-4 border-[#e6d5bc] rounded-[1rem] md:rounded-[1.5rem] px-3 md:px-4 py-3 md:py-4 focus:ring-0 focus:border-[#5c4a33] transition-all font-bold text-sm md:text-lg text-[#5c4a33] shadow-inner"
                          placeholder="О чем память?"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 md:space-y-3">
                      <label className="text-[8px] md:text-[10px] uppercase font-black text-[#8b7355] ml-2 md:ml-4">Тайное Письмо</label>
                      <textarea 
                        value={capsuleEditData.content}
                        onChange={e => setCapsuleEditData({...capsuleEditData, content: e.target.value})}
                        className="w-full h-32 md:h-48 bg-white border-2 md:border-4 border-[#e6d5bc] rounded-[1.2rem] md:rounded-[2rem] px-4 md:px-6 py-4 md:py-6 focus:ring-0 focus:border-[#5c4a33] transition-all resize-none custom-scrollbar font-serif italic text-base md:text-lg text-[#5c4a33] shadow-inner"
                        placeholder="Напиши что-то особенное..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 md:gap-4 pt-4 md:pt-6">
                    <button 
                      onClick={() => setIsCapsuleModalOpen(false)}
                      className="flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl bg-[#e6d5bc]/20 text-[#8b7355] font-black uppercase tracking-widest text-[8px] md:text-[10px] hover:bg-[#e6d5bc]/40 transition-all"
                    >
                      Отмена
                    </button>
                    <button 
                      onClick={saveCapsule}
                      className="flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl bg-[#5c4a33] text-[#fdfaf3] font-black uppercase tracking-widest text-[8px] md:text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Lock size={12} className="md:w-[14px] md:h-[14px]" />
                      Запечатать
                    </button>
                  </div>
                </div>
              ) : selectedCapsule && (
                <div className="bg-white/40 rounded-[1.8rem] md:rounded-[2.5rem] border-4 border-dashed border-[#e6d5bc] p-6 md:p-10 space-y-6 md:space-y-8 flex flex-col items-center text-center">
                  {selectedCapsule.isLocked ? (
                    <>
                      <div className="space-y-2 md:space-y-3">
                        <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-[#5c4a33] text-[#fdfaf3] text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] shadow-md">
                          <Lock size={10} className="md:w-3 md:h-3 text-amber-400" />
                          Свиток запечатан
                        </div>
                        <h3 className="text-2xl md:text-4xl font-serif font-bold text-[#5c4a33]">{selectedCapsule.title}</h3>
                      </div>
                      
                      <div className="w-full min-h-[200px] md:min-h-[300px] flex items-center justify-center">
                        <div className="w-48 h-36 md:w-64 md:h-48 bg-[#f5e6d3] rounded-2xl md:rounded-3xl border-4 md:border-8 border-[#e6d5bc] shadow-2xl flex flex-col items-center justify-center gap-3 md:gap-4">
                          <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white flex items-center justify-center text-[#5c4a33] shadow-inner border-2 md:border-4 border-[#e6d5bc]">
                            <Lock size={24} className="md:w-8 md:h-8" />
                          </div>
                          <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-[#8b7355]">Магия времени</p>
                        </div>
                      </div>

                      <div className="w-full p-6 md:p-8 bg-white border-2 md:border-4 border-[#e6d5bc] rounded-[1.8rem] md:rounded-[2.5rem] shadow-xl">
                        <p className="text-[10px] md:text-sm font-black uppercase tracking-widest text-[#5c4a33]">Пробуждение через:</p>
                        <p className="text-3xl md:text-4xl font-serif font-black text-[#5c4a33] mt-1 md:mt-2">
                          {Math.ceil((new Date(selectedCapsule.unlockDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} дн.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2 md:space-y-3">
                        <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-[#5c4a33] text-[#fdfaf3] text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] shadow-md">
                          <Sparkles size={10} className="md:w-3 md:h-3 text-amber-400" />
                          Послание открыто
                        </div>
                        <h3 className="text-2xl md:text-4xl font-serif font-bold text-[#5c4a33]">{selectedCapsule.title}</h3>
                      </div>
                      
                      <div className="w-full min-h-[200px] md:min-h-[300px] flex flex-col gap-4 md:gap-6">
                        <div className="w-full bg-white p-5 md:p-8 rounded-[1.8rem] md:rounded-[2.5rem] border-2 md:border-4 border-[#e6d5bc] shadow-xl relative overflow-hidden min-h-[200px] md:min-h-[300px] flex flex-col justify-center">
                          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                          <p className="text-xl md:text-2xl font-serif italic text-[#5c4a33] leading-relaxed text-left pl-3 md:pl-4 border-l-4 border-[#e6d5bc]/50">
                            "{getCapsulePages(selectedCapsule.content)[currentCapsulePage]}"
                          </p>
                        </div>
                        
                        {getCapsulePages(selectedCapsule.content).length > 1 && (
                          <div className="flex items-center justify-between px-2 md:px-4">
                            <button 
                              onClick={() => setCurrentCapsulePage(p => Math.max(0, p - 1))} 
                              disabled={currentCapsulePage === 0} 
                              className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white border-2 md:border-4 border-[#e6d5bc] text-[#5c4a33] disabled:opacity-30 shadow-md hover:scale-105 transition-all"
                            >
                              <ChevronLeft size={20} className="md:w-6 md:h-6" />
                            </button>
                            <span className="text-[10px] md:text-xs font-black text-[#8b7355]">{currentCapsulePage + 1} / {getCapsulePages(selectedCapsule.content).length}</span>
                            <button 
                              onClick={() => setCurrentCapsulePage(p => Math.min(getCapsulePages(selectedCapsule.content).length - 1, p + 1))} 
                              disabled={currentCapsulePage === getCapsulePages(selectedCapsule.content).length - 1} 
                              className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white border-2 md:border-4 border-[#e6d5bc] text-[#5c4a33] disabled:opacity-30 shadow-md hover:scale-105 transition-all"
                            >
                              <ChevronRight size={20} className="md:w-6 md:h-6" />
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <div className="w-full flex flex-col gap-3 md:gap-4">
                    <button 
                      onClick={() => setIsCapsuleModalOpen(false)}
                      className="w-full py-4 md:py-5 rounded-[1.2rem] md:rounded-[1.5rem] bg-[#5c4a33] text-[#fdfaf3] font-black uppercase tracking-[0.3em] text-[9px] md:text-xs shadow-xl hover:scale-[1.02] active:scale-95 transition-all border-2 border-transparent hover:border-[#e6d5bc]"
                    >
                      Закрыть
                    </button>

                    {canEditCapsule(selectedCapsule) && (
                      <div className="flex gap-2 md:gap-3 justify-center">
                        <button 
                          onClick={() => startEditCapsule(selectedCapsule)}
                          className="flex-1 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white border-2 border-[#e6d5bc] text-[#8b7355] font-black uppercase tracking-widest text-[8px] md:text-[9px] hover:text-[#5c4a33] hover:border-[#5c4a33] transition-all flex items-center justify-center gap-1.5 md:gap-2 shadow-sm"
                        >
                          <Edit3 size={12} className="md:w-[14px] md:h-[14px]" />
                          Изменить
                        </button>
                        <button 
                          onClick={() => setIsDeletingCapsule(selectedCapsule.id)}
                          className="flex-1 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white border-2 border-[#e6d5bc] text-red-400 font-black uppercase tracking-widest text-[8px] md:text-[9px] hover:text-red-600 hover:border-red-200 transition-all flex items-center justify-center gap-1.5 md:gap-2 shadow-sm"
                        >
                          <Trash2 size={12} className="md:w-[14px] md:h-[14px]" />
                          Стереть
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeletingCapsule && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeletingCapsule(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#fdfaf3] rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border-4 md:border-[8px] border-[#e6d5bc] overflow-hidden p-6 md:p-8 text-center space-y-4 md:space-y-6"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-red-50 rounded-2xl md:rounded-3xl flex items-center justify-center text-red-400 mx-auto border-2 md:border-4 border-red-100 shadow-inner">
                <Trash2 size={32} className="md:w-[40px] md:h-[40px]" />
              </div>
              <div className="space-y-1 md:space-y-2">
                <h3 className="text-xl md:text-2xl font-serif font-black text-[#5c4a33]">Удалить свиток?</h3>
                <p className="text-[10px] md:text-sm text-[#8b7355] italic leading-relaxed">Это действие нельзя отменить. Магия сотрет это послание навсегда.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeletingCapsule(null)}
                  className="flex-1 py-3 md:py-4 rounded-xl bg-[#e6d5bc]/20 text-[#8b7355] font-black uppercase tracking-widest text-[8px] md:text-[9px] hover:bg-[#e6d5bc]/40 transition-all"
                >
                  Оставить
                </button>
                <button 
                  onClick={() => deleteCapsule(isDeletingCapsule)}
                  className="flex-1 py-3 md:py-4 rounded-xl bg-red-500 text-white font-black uppercase tracking-widest text-[8px] md:text-[9px] shadow-lg hover:bg-red-600 transition-all active:scale-95"
                >
                  Удалить
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailItem({ label, value, isEditing, profileId, onLabelChange, onValueChange }: { 
  label: string; 
  value: string; 
  isEditing: boolean;
  profileId: string;
  onLabelChange: (val: string) => void;
  onValueChange: (val: string) => void;
}) {
  const isMe = profileId === 'Grinch' || profileId === 'me';
  
  return (
    <div className={cn(
      "space-y-1.5 p-5 rounded-[1.5rem] border-2 shadow-sm hover:shadow-md transition-all duration-300 group/item overflow-hidden relative",
      isMe ? "bg-[#f0f9ff]/50 border-[#bae6fd]/30" : "bg-[#fdf2f8]/50 border-[#fbcfe8]/30",
      isEditing && (isMe ? "border-[#0ea5e9]/40 bg-white" : "border-[#ec4899]/40 bg-white")
    )}>
      {isEditing && (
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
      )}
      {isEditing ? (
        <>
          <div className="space-y-1 relative z-10">
            <label className={cn(
              "text-[8px] font-black uppercase tracking-[0.2em] ml-1",
              isMe ? "text-[#0ea5e9]/50" : "text-[#ec4899]/50"
            )}>Заголовок</label>
            <input 
              value={label}
              onChange={(e) => onLabelChange(e.target.value)}
              className={cn(
                "text-[11px] font-black uppercase tracking-[0.15em] bg-[#fdfaf3]/50 border-2 rounded-lg focus:ring-0 w-full outline-none px-3 py-1.5 transition-all",
                isMe ? "text-[#0ea5e9] border-[#bae6fd]/50 focus:border-[#0ea5e9]" : "text-[#ec4899] border-[#fbcfe8]/50 focus:border-[#ec4899]"
              )}
            />
          </div>
          <div className="space-y-1 relative z-10 mt-2">
            <label className={cn(
              "text-[8px] font-black uppercase tracking-[0.2em] ml-1",
              isMe ? "text-[#0ea5e9]/50" : "text-[#ec4899]/50"
            )}>Значение</label>
            <input 
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
              className={cn(
                "text-lg font-serif font-bold bg-[#fdfaf3]/50 border-2 rounded-xl focus:ring-0 w-full outline-none px-3 py-2 transition-all",
                isMe ? "text-[#0369a1] border-[#bae6fd]/50 focus:border-[#0ea5e9]" : "text-[#be185d] border-[#fbcfe8]/50 focus:border-[#ec4899]"
              )}
            />
          </div>
        </>
      ) : (
        <>
          <p className={cn(
            "text-[9px] font-black uppercase tracking-[0.15em]",
            isMe ? "text-[#0ea5e9]/50" : "text-[#ec4899]/50"
          )}>{label}</p>
          <p className={cn(
            "text-lg font-serif font-bold leading-tight",
            isMe ? "text-[#0369a1]" : "text-[#be185d]"
          )}>{value || '...'}</p>
        </>
      )}
    </div>
  );
}
