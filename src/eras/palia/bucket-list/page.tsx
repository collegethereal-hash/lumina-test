"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useData } from "@/components/DataProvider";
import { cn } from "@/lib/utils";
import { useEra } from "@/context/EraContext";
import { 
  CheckSquare, Star, Trophy, Target, Plus, X, Edit3, Save, Trash2, 
  Sparkles, ChevronRight, MapPin, Calendar, ListChecks, 
  User, Clock, CheckCircle2, Coins, Camera, Film, Mic,
  Archive, ArrowLeft, Check, BookOpen, Settings2, Search
} from "lucide-react";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  color: string;
  category: string;
  completed: boolean;
  completedByGrinch: boolean;
  completedByCindy: boolean;
  proposedBy: 'Grinch' | 'Cindy';
  isChecklist: boolean;
  checklistItems?: ChecklistItem[];
  createdAt: string;
  completedAt?: string | null;
  deleteRequestedBy?: string | null;
}

const QUEST_COLORS = [
  { id: 'orange', bg: 'bg-[#fff7ed]', text: 'text-[#9a3412]', border: 'border-[#fed7aa]', accent: 'bg-[#f97316]', hover: 'hover:border-[#f97316]' },
  { id: 'blue', bg: 'bg-[#f0f9ff]', text: 'text-[#0369a1]', border: 'border-[#bae6fd]', accent: 'bg-[#0ea5e9]', hover: 'hover:border-[#0ea5e9]' },
  { id: 'pink', bg: 'bg-[#fdf2f8]', text: 'text-[#be185d]', border: 'border-[#fbcfe8]', accent: 'bg-[#ec4899]', hover: 'hover:border-[#ec4899]' },
  { id: 'yellow', bg: 'bg-[#fefce8]', text: 'text-[#854d0e]', border: 'border-[#fef08a]', accent: 'bg-[#eab308]', hover: 'hover:border-[#eab308]' },
  { id: 'purple', bg: 'bg-[#faf5ff]', text: 'text-[#581c87]', border: 'border-[#e9d5ff]', accent: 'bg-[#a855f7]', hover: 'hover:border-[#a855f7]' },
  { id: 'green', bg: 'bg-[#f0fdf4]', text: 'text-[#166534]', border: 'border-[#bbf7d0]', accent: 'bg-[#22c55e]', hover: 'hover:border-[#22c55e]' },
  { id: 'teal', bg: 'bg-[#f0fdfa]', text: 'text-[#0d9488]', border: 'border-[#99f6e4]', accent: 'bg-[#14b8a6]', hover: 'hover:border-[#14b8a6]' },
  { id: 'indigo', bg: 'bg-[#eef2ff]', text: 'text-[#4338ca]', border: 'border-[#c7d2fe]', accent: 'bg-[#6366f1]', hover: 'hover:border-[#6366f1]' },
];

export default function BucketListPage() {
  const { 
    currentUser, 
    isQuestsLoading: isDataLoading, 
    bucketListCategories, 
    setBucketListCategories,
    spaceConfig
  } = useData();
  const { setIsUIHidden } = useEra();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuestsLoading, setIsQuestsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Quest>>({});
  const [isChecklistMode, setIsChecklistMode] = useState(false);
  const [creationType, setCreationType] = useState<'quest' | 'checklist'>('quest');
  const [newChecklistItems, setNewChecklistItems] = useState<string[]>(['']);
  
  // Category Management State
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [filter, setFilter] = useState('Все');

  // Archive States
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [selectedArchiveMonth, setSelectedArchiveMonth] = useState<{ year: number; month: number } | null>(null);

  const saveBucketListCategories = async (newCats: string[]) => {
    if (!spaceConfig?.id) return;
    setBucketListCategories(newCats);
    await supabase.from('global_state').upsert({
      space_id: spaceConfig.id,
      key: 'bucket_list_categories',
      value: newCats,
    });
  };

  const addCategory = async () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName || bucketListCategories.includes(trimmedName)) return;
    
    // Ограничение: максимум 6 категорий (включая "Все")
    if (bucketListCategories.length >= 6) {
      alert("Максимум 6 категорий разрешено");
      return;
    }
    
    // Ограничение: название не более 12 символов
    if (trimmedName.length > 12) {
      alert("Название категории не должно превышать 12 символов");
      return;
    }

    const updated = [...bucketListCategories, trimmedName];
    await saveBucketListCategories(updated);
    setNewCategoryName('');
  };

  const deleteCategory = async (catToDelete: string) => {
    if (catToDelete === 'Все') return;
    const updated = bucketListCategories.filter((c) => c !== catToDelete);
    await saveBucketListCategories(updated);
    if (filter === catToDelete) setFilter('Все');
    setCategoryToDelete(null);
  };

  // Скрываем навигацию при открытом модальном окне
  useEffect(() => {
    if (isModalOpen) {
      setIsUIHidden(true);
    } else {
      setIsUIHidden(false);
    }
    return () => setIsUIHidden(false);
  }, [isModalOpen, setIsUIHidden]);

  const refreshQuests = async () => {
    setIsQuestsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bucket_list')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedQuests = data.map((q: any) => ({
        id: q.id,
        title: q.title,
        description: q.description,
        color: q.color || 'orange',
        category: q.category,
        completed: q.is_completed,
        completedByGrinch: q.completed_by_p1,
        completedByCindy: q.completed_by_p2,
        proposedBy: q.proposed_by,
        isChecklist: q.is_checklist,
        checklistItems: q.checklist_items || [],
        createdAt: q.created_at,
        completedAt: q.completed_at,
        deleteRequestedBy: q.delete_requested_by
      }));

      setQuests(formattedQuests);
    } catch (err) {
      console.error('Error fetching quests:', err);
    } finally {
      setIsQuestsLoading(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshQuests();
    
    const channel = supabase
      .channel('bucket_list_changes')
      .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'bucket_list' }, () => {
        refreshQuests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleQuest = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentUser) return;
    
    const quest = quests.find(q => q.id === id);
    if (!quest) return;

    const wasCompleted = quest.completed;
    const updated = { ...quest };
    
    if (currentUser === 'Grinch') {
      updated.completedByGrinch = !quest.completedByGrinch;
    } else {
      updated.completedByCindy = !quest.completedByCindy;
    }

    // В новой логике выполнение квеста — это просто галочка автора
    const isNowCompleted = currentUser === 'Grinch' ? updated.completedByGrinch : updated.completedByCindy;
    updated.completed = isNowCompleted;

    // Таймер запускается сразу при выполнении автором
    let newCompletedAt = quest.completedAt;
    if (isNowCompleted && !wasCompleted) {
      newCompletedAt = new Date().toISOString();
    } else if (!isNowCompleted) {
      newCompletedAt = null;
    }
    updated.completedAt = newCompletedAt;

    setQuests(quests.map(q => q.id === id ? updated : q));

    const { error } = await supabase
      .from('bucket_list')
      .update({
        completed_by_p1: updated.completedByGrinch,
        completed_by_p2: updated.completedByCindy,
        is_completed: updated.completed,
        completed_at: newCompletedAt
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating quest:', error);
      refreshQuests();
    }
  };

  const toggleChecklistItem = async (questId: string, itemId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest || !quest.checklistItems) return;

    const updatedItems = quest.checklistItems.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    const isAllCompleted = updatedItems.every(item => item.completed);
    
    // Сначала обновляем локальное состояние для мгновенного отклика
    const updatedQuest = { 
      ...quest, 
      checklistItems: updatedItems, 
      completed: isAllCompleted,
      completedAt: isAllCompleted ? new Date().toISOString() : null
    };

    setQuests(prev => prev.map(q => q.id === questId ? updatedQuest : q));
    
    // Если эта заметка сейчас открыта в модальном окне, обновляем и её
    if (selectedQuest && selectedQuest.id === questId) {
      setSelectedQuest(updatedQuest);
    }
    
    const { error } = await supabase
      .from('bucket_list')
      .update({ 
        checklist_items: updatedItems,
        is_completed: isAllCompleted,
        completed_at: updatedQuest.completedAt
      })
      .eq('id', questId);

    if (error) {
      console.error('Error updating checklist item:', error);
      refreshQuests(); // В случае ошибки откатываемся к данным из БД
    }
  };

  const startCreate = (type: 'quest' | 'checklist') => {
    setSelectedQuest(null);
    setIsChecklistMode(type === 'checklist');
    setEditData({
      title: '',
      description: '',
      color: 'orange',
      category: 'Общее',
      isChecklist: type === 'checklist'
    });
    setNewChecklistItems(['']);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const openQuest = (quest: Quest) => {
    setSelectedQuest(quest);
    setEditData(quest);
    setIsChecklistMode(!!quest.isChecklist);
    if (quest.isChecklist && quest.checklistItems) {
      setNewChecklistItems(quest.checklistItems.map(item => item.text));
    } else {
      setNewChecklistItems(['']);
    }
    
    setIsEditing(false); // Всегда открываем сначала в режиме просмотра
    setIsModalOpen(true);
  };

  const saveQuest = async () => {
    if (!currentUser || !spaceConfig?.id) {
      console.error('Error saving quest: Missing user or space ID', { currentUser, spaceId: spaceConfig?.id });
      return;
    }
    
    try {
      const questData = {
        title: editData.title,
        description: editData.description,
        color: editData.color,
        category: editData.category,
        proposed_by: selectedQuest ? selectedQuest.proposedBy : currentUser,
        is_checklist: isChecklistMode,
        space_id: spaceConfig.id,
        checklist_items: isChecklistMode ? newChecklistItems.filter(i => i.trim()).map(text => ({
          id: Math.random().toString(36).substr(2, 9),
          text,
          completed: false
        })) : null
      };

      console.log('Attempting to save quest:', questData);

      let error;
      if (selectedQuest) {
        const { error: err } = await supabase
          .from('bucket_list')
          .update(questData)
          .eq('id', selectedQuest.id);
        error = err;
      } else {
        const { error: err } = await supabase
          .from('bucket_list')
          .insert([questData]);
        error = err;
      }

      if (error) {
        console.error('Error from Supabase while saving quest:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        alert(`Ошибка при сохранении: ${error.message || 'Неизвестная ошибка'}`);
      } else {
        console.log('Quest saved successfully');
        setIsModalOpen(false);
        refreshQuests();
      }
    } catch (err) {
      console.error('Unexpected error in saveQuest:', err);
      alert('Произошла непредвиденная ошибка при сохранении квеста.');
    }
  };

  const deleteQuest = async (id: string) => {
    if (!currentUser) return;
    
    const quest = quests.find(q => q.id === id);
    if (!quest) return;

    const { error } = await supabase
      .from('bucket_list')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting quest:', error);
    }
    
    refreshQuests();
    setIsModalOpen(false);
  };

  const getTimerInfo = (quest: Quest) => {
    if (!quest.completed || !quest.completedAt) return null;
    
    const FIVE_MINUTES = 5 * 60 * 1000;
    const completedAt = new Date(quest.completedAt).getTime();
    const now = new Date().getTime();
    const elapsed = now - completedAt;
    const remaining = FIVE_MINUTES - elapsed;
    
    if (remaining > 0) {
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      return { 
        text: `Подтверждение через ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`, 
        isLocked: false,
        isConfirming: true,
        isDone: false
      };
    }
    
    return { text: `Завершено`, isLocked: true, isConfirming: false, isDone: true };
  };

  // Эффект для обновления таймеров каждую секунду
  useEffect(() => {
    const timer = setInterval(() => {
      setQuests(prev => [...prev]); // Форсируем ререндер для обновления таймеров
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Archive logic helpers
  const getArchiveMonths = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    
    let currentPeriodStart;
    if (currentDay >= 20) {
      currentPeriodStart = new Date(currentYear, currentMonth, 20);
    } else {
      currentPeriodStart = new Date(currentYear, currentMonth - 1, 20);
    }
    const currentPeriodStartUTC = Date.UTC(currentPeriodStart.getFullYear(), currentPeriodStart.getMonth(), currentPeriodStart.getDate(), 0, 0, 0);

    const monthsMap = new Map<string, { year: number; month: number; count: number }>();
    
    quests.forEach(quest => {
      const date = new Date(quest.createdAt);
      const dateUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
      
      // Пропускаем текущий период
      if (dateUTC >= currentPeriodStartUTC) return;

      const year = date.getFullYear();
      const month = date.getMonth();
      const key = `${year}-${month}`;
      
      const existing = monthsMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        monthsMap.set(key, { year, month, count: 1 });
      }
    });
    
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    
    return Array.from(monthsMap.values())
      .sort((a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month)
      .map(m => ({
        id: `${m.year}-${m.month}`,
        name: `${monthNames[m.month]} ${m.year}`,
        year: m.year,
        month: m.month,
        count: m.count
      }));
  };

  const getDisplayQuests = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    
    let filteredQuests = quests;

    if (filter !== 'Все') {
      filteredQuests = filteredQuests.filter(q => q.category === filter);
    }

    if (selectedArchiveMonth) {
      return filteredQuests.filter(quest => {
        const date = new Date(quest.createdAt);
        return date.getFullYear() === selectedArchiveMonth.year && 
               date.getMonth() === selectedArchiveMonth.month;
      });
    }

    let startDate;
    if (currentDay >= 20) {
      startDate = new Date(currentYear, currentMonth, 20);
    } else {
      startDate = new Date(currentYear, currentMonth - 1, 20);
    }
    const startDateUTC = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0);

    return filteredQuests.filter(quest => {
      const date = new Date(quest.createdAt);
      const dateUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
      return dateUTC >= startDateUTC;
    });
  };

  const currentMonthName = () => {
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    if (selectedArchiveMonth) {
      return `${monthNames[selectedArchiveMonth.month]} ${selectedArchiveMonth.year}`;
    }
    return `${monthNames[new Date().getMonth()]} ${new Date().getFullYear()}`;
  };

  const archiveMonthsList = getArchiveMonths();
  const displayQuests = getDisplayQuests();

  return (
    <div className="min-h-screen bg-[#fdfaf3] px-4 md:px-12 pt-6 md:pt-20 pb-20 md:pb-40">
      
      {/* Mobile Header (Hidden on Desktop) */}
      <div className="md:hidden flex flex-col gap-4 mb-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5c4a33] text-[#fdfaf3] text-[9px] font-bold uppercase tracking-widest shadow-md">
            <BookOpen size={10} />
            {selectedArchiveMonth ? 'Архив' : 'Список желаний'} — {currentMonthName()}
          </div>
          <h1 className="text-4xl font-serif font-black text-[#5c4a33] tracking-tight">
            {selectedArchiveMonth ? 'Страницы прошлого' : 'Список Желаний'}
          </h1>
        </div>
        
        <div className="flex gap-2">
          {selectedArchiveMonth ? (
            <button
              onClick={() => setSelectedArchiveMonth(null)}
              className="flex-1 flex items-center justify-center gap-2 bg-[#e6d5bc] border-4 border-[#8b7355]/20 px-4 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-sm text-[#5c4a33] active:scale-95 transition-transform">
              <ArrowLeft size={16} />
              Назад
            </button>
          ) : (
            <button
              onClick={() => setIsArchiveOpen(!isArchiveOpen)}
              className="flex-1 flex items-center justify-center gap-2 bg-[#e6d5bc] border-4 border-[#8b7355]/20 px-4 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-sm text-[#5c4a33] active:scale-95 transition-transform">
              <Archive size={16} />
              Архив
            </button>
          )}
          <div className="flex-1 bg-[#fdfaf3] border-4 border-[#e6d5bc]/30 px-4 py-3 rounded-[1.5rem] shadow-sm flex items-center justify-center gap-2 text-[#5c4a33]">
            <Trophy size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {displayQuests.filter(q => q.completed).length}/{displayQuests.length}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Header (Hidden on Mobile) */}
      <div className="hidden md:flex max-w-7xl mx-auto mb-10 flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5c4a33] text-[#fdfaf3] text-[10px] font-bold uppercase tracking-widest shadow-md mb-2">
            <BookOpen size={12} />
            {selectedArchiveMonth ? 'Архив' : 'Список желаний'} — {currentMonthName()}
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-black text-[#5c4a33] tracking-tight">
            {selectedArchiveMonth ? 'Страницы прошлого' : 'Список Желаний'}
          </h1>
          <p className="text-xl text-[#8b7355] font-serif italic max-w-xl leading-relaxed">
            {selectedArchiveMonth 
              ? "Каждое выполненное желание согревает наше настоящее."
              : "Каждая галочка — это шаг к нашему общему счастью."}
          </p>
        </div>

        <div className="flex items-center gap-6">
          {selectedArchiveMonth ? (
            <button 
              onClick={() => setSelectedArchiveMonth(null)}
              className="flex items-center justify-center gap-2 bg-[#e6d5bc] border-8 border-[#8b7355]/20 px-8 py-5 rounded-[2rem] text-sm font-black uppercase tracking-widest shadow-[15px_15px_40px_rgba(0,0,0,0.08)] hover:scale-105 transition-all text-[#5c4a33] group active:scale-95 relative overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
              <ArrowLeft size={18} className="text-[#5c4a33] group-hover:-translate-x-1 transition-transform relative z-10" />
              <span className="relative z-10">Назад</span>
            </button>
          ) : (
            <button 
              onClick={() => setIsArchiveOpen(!isArchiveOpen)}
              className="flex items-center justify-center gap-2 bg-[#e6d5bc] border-8 border-[#8b7355]/20 px-8 py-5 rounded-[2rem] text-sm font-black uppercase tracking-widest shadow-[15px_15px_40px_rgba(0,0,0,0.08)] hover:scale-105 transition-all text-[#5c4a33] group active:scale-95 relative overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
              <Archive size={18} className="text-[#5c4a33] group-hover:rotate-12 transition-transform relative z-10" />
              <span className="relative z-10">Архив</span>
            </button>
          )}
          
          <div className="bg-[#fdfaf3] p-4 rounded-[2.5rem] border-8 border-[#e6d5bc]/30 shadow-[15px_15px_40px_rgba(0,0,0,0.08)] flex items-center justify-between relative overflow-hidden min-w-[240px]">
            <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#5c4a33] shadow-sm border-4 border-[#e6d5bc]">
                <Trophy size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-[#8b7355] tracking-widest">
                  {selectedArchiveMonth ? 'В этом месяце' : 'Общий Прогресс'}
                </p>
                <p className="text-2xl font-serif font-black text-[#5c4a33]">
                  {displayQuests.filter(q => q.completed).length} / {displayQuests.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Archive Selection Panel */}
      <AnimatePresence>
        {isArchiveOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-7xl mx-auto overflow-hidden bg-[#fdfaf3] rounded-[2rem] md:rounded-[2.5rem] border-4 md:border-8 border-[#e6d5bc]/30 shadow-[15px_15px_40px_rgba(0,0,0,0.08)] p-5 md:p-8 mb-6 md:mb-8 space-y-4 md:space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl md:text-2xl font-serif font-bold text-[#5c4a33] flex items-center gap-2 md:gap-3">
                <Archive className="text-[#8b7355] w-5 h-5 md:w-6 md:h-6" />
                Архив наших желаний
              </h3>
              <button 
                onClick={() => setIsArchiveOpen(false)}
                className="p-1.5 md:p-2 rounded-xl hover:bg-[#f5e6d3] transition-colors"
              >
                <X className="text-[#8b7355] w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {archiveMonthsList.length > 0 ? (
                archiveMonthsList.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedArchiveMonth({ year: m.year, month: m.month });
                      setIsArchiveOpen(false);
                    }}
                    className="flex flex-col items-center gap-1.5 md:gap-2 p-4 md:p-6 rounded-xl md:rounded-2xl bg-white border-2 md:border-4 border-[#e6d5bc] hover:border-[#5c4a33] hover:scale-105 transition-all shadow-sm group"
                  >
                    <Calendar className="text-[#8b7355] group-hover:text-[#5c4a33] w-5 h-5 md:w-6 md:h-6" />
                    <span className="text-[11px] md:text-xs font-bold text-[#5c4a33] text-center leading-tight">{m.name}</span>
                    <span className="text-[9px] md:text-[10px] font-black uppercase text-[#8b7355]/60 tracking-widest">{m.count} зап.</span>
                  </button>
                ))
              ) : (
                <div className="col-span-full py-6 md:py-10 text-center text-[#8b7355] italic text-sm md:text-base">
                  Архив пока пуст... История наших желаний только начинается!
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-10 md:space-y-20">
        {/* Categories Bar */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch md:items-center justify-between bg-[#fdfaf3] p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border-4 md:border-8 border-[#e6d5bc]/30 shadow-md md:shadow-[15px_15px_40px_rgba(0,0,0,0.08)] relative overflow-hidden">
          {/* Paper texture overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />

          <div className="flex items-center gap-3 w-full md:w-auto relative z-10 overflow-hidden">
            <div className="flex items-center gap-2 p-2 bg-[#f5e6d3] rounded-[1.5rem] overflow-x-auto no-scrollbar touch-pan-x w-full md:w-auto justify-start border-2 md:border-4 border-[#e6d5bc]">
              {bucketListCategories.map((cat, index) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={cn(
                    "px-4 py-2.5 md:px-5 md:py-3 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap relative overflow-hidden flex-shrink-0",
                    filter === cat
                      ? "bg-[#5c4a33] text-[#fdfaf3] shadow-lg scale-105"
                      : "text-[#8b7355] hover:bg-white/60 hover:text-[#5c4a33]"
                  )}>
                  <span className="relative z-10">{cat}</span>
                  {filter === cat && (
                    <motion.div
                      layoutId="activeCategory"
                      className="absolute inset-0 bg-[#5c4a33]"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsManagingCategories(true)}
              className="p-3 rounded-2xl bg-[#f5e6d3] text-[#5c4a33] border-2 md:border-4 border-[#e6d5bc] hover:bg-white transition-all shadow-sm shrink-0 hover:scale-105 active:scale-95">
              <Settings2 size={18} />
            </button>
          </div>

          {!selectedArchiveMonth && (
            <div className="flex p-1.5 bg-white rounded-[1.8rem] border-2 md:border-4 border-[#e6d5bc] shadow-inner relative overflow-hidden group z-10 w-full md:w-auto">
              <motion.div
                className="absolute inset-1.5 rounded-[1.3rem] bg-[#5c4a33] shadow-lg"
                initial={false}
                animate={{
                  x: creationType === 'quest' ? 0 : '100%',
                  width: 'calc(50% - 3px)'
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              <button
                onClick={() => setCreationType('quest')}
                className={cn(
                  "flex-1 md:flex-none relative z-10 flex items-center justify-center gap-2 px-6 py-3 rounded-[1.3rem] text-[10px] font-black uppercase tracking-widest transition-colors duration-300",
                  creationType === 'quest' ? "text-[#fdfaf3]" : "text-[#8b7355] hover:text-[#5c4a33]"
                )}
              >
                <Target size={14} />
                <span>Квест</span>
              </button>
              <button
                onClick={() => setCreationType('checklist')}
                className={cn(
                  "flex-1 md:flex-none relative z-10 flex items-center justify-center gap-2 px-6 py-3 rounded-[1.3rem] text-[10px] font-black uppercase tracking-widest transition-colors duration-300",
                  creationType === 'checklist' ? "text-[#fdfaf3]" : "text-[#8b7355] hover:text-[#5c4a33]"
                )}
              >
                <ListChecks size={14} />
                <span>Список</span>
              </button>
            </div>
          )}

          <div className="relative w-full md:w-80 group relative z-10">
            <div className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 p-1.5 md:p-2 rounded-full bg-[#f5e6d3]">
              <Search className="text-[#8b7355] group-focus-within:text-[#5c4a33] transition-colors" size={16} />
            </div>
            <input
              value={''} // TODO: implement search logic if needed, or leave for now
              onChange={() => {}} 
              placeholder="Поиск желания..."
              className="w-full bg-white border-2 md:border-4 border-[#e6d5bc] rounded-[1.5rem] pl-14 md:pl-16 pr-4 md:pr-6 py-3 md:py-4 text-xs md:text-sm outline-none focus:border-[#5c4a33]/60 transition-all placeholder:text-[#8b7355]/40 font-bold text-[#5c4a33] shadow-inner"
            />
          </div>
        </div>

        <section className="space-y-6 md:space-y-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b-4 md:border-b-8 border-[#e6d5bc] pb-4 md:pb-8 gap-4 md:gap-6">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white border-2 md:border-4 border-[#e6d5bc] rounded-2xl md:rounded-[1.8rem] flex items-center justify-center text-[#5c4a33] shadow-md shrink-0">
                <Target className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div>
                <h2 className="text-2xl md:text-4xl font-serif font-black text-[#5c4a33]">Рабочая Область</h2>
                <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[#8b7355] mt-1">
                  {selectedArchiveMonth ? `Приключения за ${currentMonthName()}` : 'Наши общие цели и мечты'}
                </p>
              </div>
            </div>
            {!selectedArchiveMonth && (
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto mt-2 md:mt-0">
                <button 
                  onClick={() => startCreate(creationType)}
                  className="px-6 md:px-8 py-4 md:py-5 bg-[#5c4a33] text-[#fdfaf3] rounded-[1.5rem] md:rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 md:gap-3 w-full sm:w-auto justify-center"
                >
                  <Plus size={18} />
                  Добавить запись
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {isQuestsLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-[240px] md:h-[280px] rounded-[2.5rem] md:rounded-[3.5rem] bg-[#fdfaf3] border-4 md:border-8 border-[#e6d5bc]/30 p-5 md:p-6 flex flex-col gap-4 animate-pulse relative overflow-hidden shadow-sm">
                   <div className="flex justify-between items-start">
                     <div className="space-y-2">
                       <div className="w-24 h-5 md:h-6 bg-[#e6d5bc]/40 rounded-full" />
                       <div className="w-32 h-3 md:h-4 bg-[#e6d5bc]/20 rounded-lg" />
                     </div>
                     <div className="w-12 h-12 md:w-14 md:h-14 bg-[#e6d5bc]/40 rounded-xl md:rounded-[1.5rem]" />
                   </div>
                   <div className="space-y-4 flex-1">
                     <div className="w-full h-8 md:h-10 bg-[#e6d5bc]/40 rounded-2xl" />
                     <div className="space-y-2">
                       <div className="w-full h-3 md:h-4 bg-[#e6d5bc]/20 rounded-lg" />
                       <div className="w-[90%] h-3 md:h-4 bg-[#e6d5bc]/20 rounded-lg" />
                       <div className="w-[80%] h-3 md:h-4 bg-[#e6d5bc]/20 rounded-lg" />
                     </div>
                   </div>
                   <div className="flex justify-between items-center pt-4 md:pt-6 border-t-2 md:border-t-4 border-[#e6d5bc]/20 border-dashed">
                     <div className="w-20 h-6 md:h-8 bg-[#e6d5bc]/30 rounded-xl" />
                     <div className="w-12 h-12 md:w-16 md:h-16 bg-[#e6d5bc]/40 rounded-xl md:rounded-[1.8rem]" />
                   </div>
                </div>
              ))
            ) : (
              displayQuests.map((quest) => (
                <motion.div
                  key={quest.id}
                  layoutId={quest.id}
                  onClick={() => openQuest(quest)}
                  className="group cursor-pointer perspective-1000"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                    <div className={cn(
                      "rounded-[2.5rem] md:rounded-[3.5rem] border-[6px] md:border-[10px] p-5 md:p-6 relative overflow-hidden space-y-4 flex flex-col min-h-[240px] md:min-h-[280px] h-full transition-all duration-500 shadow-xl bg-[#fdfaf3]",
                      QUEST_COLORS.find(c => c.id === quest.color)?.border || "border-[#e6d5bc]",
                      quest.completed && "opacity-60 grayscale-[0.5]"
                    )}>
                      {/* Текстура бумаги */}
                      <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"></div>
                      
                      <div className="flex justify-between items-start relative z-10 pt-1 md:pt-2">
                        <div className="flex flex-col gap-2">
                          <div className={cn(
                            "px-4 py-1.5 md:px-5 md:py-2 rounded-full border-2 md:border-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] shadow-sm flex items-center gap-2 w-fit bg-white",
                            QUEST_COLORS.find(c => c.id === quest.color)?.border || "border-[#e6d5bc]",
                            QUEST_COLORS.find(c => c.id === quest.color)?.text || "text-[#5c4a33]"
                          )}>
                            {quest.category}
                          </div>
                          
                          {/* Отображение таймера */}
                          {getTimerInfo(quest) && (
                            <div className={cn(
                              "px-3 py-1 md:px-4 md:py-1.5 rounded-xl border-2 md:border-4 text-[8px] md:text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1.5 md:gap-2 w-fit animate-pulse bg-white",
                              QUEST_COLORS.find(c => c.id === quest.color)?.border || "border-[#e6d5bc]",
                              QUEST_COLORS.find(c => c.id === quest.color)?.text || "text-[#5c4a33]"
                            )}>
                              <Clock size={10} className="md:w-3 md:h-3" />
                              {getTimerInfo(quest)?.text}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 md:space-y-4 flex-1 relative z-10">
                        <h3 className={cn(
                          "text-lg md:text-2xl font-serif font-black leading-tight tracking-tight",
                          QUEST_COLORS.find(c => c.id === quest.color)?.text || "text-[#5c4a33]",
                          quest.completed && "line-through opacity-50"
                        )}>
                          {quest.title}
                        </h3>
                        
                        {!quest.isChecklist ? (
                          <p className={cn(
                            "italic font-serif text-xs md:text-sm line-clamp-3 leading-relaxed opacity-80",
                            QUEST_COLORS.find(c => c.id === quest.color)?.text || "text-[#5c4a33]"
                          )}>
                            {quest.description}
                          </p>
                        ) : (
                          quest.checklistItems && (
                            <div className="space-y-1 md:space-y-1.5 mt-1">
                              {quest.checklistItems.slice(0, 2).map((item) => (
                                <div key={item.id} className="flex items-center gap-2">
                                  <div className={cn(
                                    "w-3 h-3 md:w-4 md:h-4 rounded-sm md:rounded-md border-2 shrink-0 flex items-center justify-center transition-all",
                                    item.completed 
                                      ? (QUEST_COLORS.find(c => c.id === quest.color)?.accent || "bg-[#8b7355]") + " border-transparent"
                                      : "border-[#e6d5bc] bg-white/50"
                                  )}>
                                    {item.completed && <Check size={10} className="text-white md:w-3 md:h-3" strokeWidth={4} />}
                                  </div>
                                  <span className={cn(
                                    "text-[11px] md:text-xs font-serif truncate font-bold",
                                    item.completed ? "line-through opacity-40" : "opacity-80",
                                    QUEST_COLORS.find(c => c.id === quest.color)?.text || "text-[#5c4a33]"
                                  )}>
                                    {item.text}
                                  </span>
                                </div>
                              ))}
                              {quest.checklistItems.length > 2 && (
                                <p className={cn(
                                  "text-[9px] md:text-[10px] italic opacity-40 font-serif font-black ml-5 md:ml-6",
                                  QUEST_COLORS.find(c => c.id === quest.color)?.text || "text-[#5c4a33]"
                                )}>
                                  + еще {quest.checklistItems.length - 2} дел...
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>

                      <div className={cn(
                        "flex items-center justify-between pt-3 md:pt-4 border-t-2 md:border-t-4 mt-auto relative z-10 border-dashed",
                        QUEST_COLORS.find(c => c.id === quest.color)?.border || "border-[#e6d5bc]/50"
                      )}>
                        <div className={cn(
                          "flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]",
                          QUEST_COLORS.find(c => c.id === quest.color)?.text || "text-[#5c4a33]"
                        )}>
                          <div className={cn(
                            "w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center shadow-sm border-2",
                            "bg-white",
                            QUEST_COLORS.find(c => c.id === quest.color)?.border || "border-[#e6d5bc]"
                          )}>
                            {quest.isChecklist ? (
                              <ListChecks size={16} className={cn("md:w-[18px] md:h-[18px]", QUEST_COLORS.find(c => c.id === quest.color)?.text || "text-[#5c4a33]")} />
                            ) : (
                              <Target size={16} className={cn("md:w-[18px] md:h-[18px]", QUEST_COLORS.find(c => c.id === quest.color)?.text || "text-[#5c4a33]")} />
                            )}
                          </div>
                          <span className="text-lg md:text-xl font-serif font-black">
                            {quest.isChecklist 
                              ? `${quest.checklistItems?.filter(i => i.completed).length}/${quest.checklistItems?.length}`
                              : (quest.completed ? 'Завершено' : 'В Пути')
                            }
                          </span>
                        </div>
                        
                        {!quest.isChecklist ? (
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => toggleQuest(quest.id, e)}
                            className={cn(
                              "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all shadow-md border-2 md:border-4",
                              (currentUser === 'Grinch' ? quest.completedByGrinch : quest.completedByCindy)
                                ? (QUEST_COLORS.find(c => c.id === quest.color)?.accent || "bg-[#5c4a33]") + " border-white text-white"
                                : "bg-white border-[#e6d5bc] text-[#e6d5bc] hover:border-[#5c4a33]"
                            )}
                          >
                            <Star size={20} className="md:w-6 md:h-6" fill={(currentUser === 'Grinch' ? quest.completedByGrinch : quest.completedByCindy) ? "currentColor" : "none"} />
                          </motion.button>
                        ) : (
                          <div className={cn(
                            "w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center shadow-md border-2 transition-all group-hover:translate-x-1",
                            "bg-white",
                            QUEST_COLORS.find(c => c.id === quest.color)?.border || "border-[#e6d5bc]",
                            QUEST_COLORS.find(c => c.id === quest.color)?.text || "text-[#5c4a33]"
                          )}>
                            <ChevronRight size={16} className="md:w-5 md:h-5" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    </div>
                </motion.div>
              ))
            )}

            {!isLoading && !isQuestsLoading && displayQuests.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="col-span-full py-16 md:py-24 flex flex-col items-center justify-center text-center space-y-6 md:space-y-10 bg-[#fdfaf3] rounded-[3rem] md:rounded-[4rem] border-[6px] md:border-[10px] border-[#e6d5bc] shadow-xl relative overflow-hidden"
                >
                  <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"></div>
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-white border-4 md:border-8 border-[#e6d5bc] rounded-[2rem] md:rounded-[3rem] flex items-center justify-center text-[#5c4a33] shadow-md">
                    <Sparkles className="w-12 h-12 md:w-16 md:h-16" strokeWidth={2.5} />
                  </div>
                  <div className="space-y-2 md:space-y-4 px-4">
                    <h3 className="text-3xl md:text-4xl font-serif font-black text-[#5c4a33]">Здесь пока пусто</h3>
                    <p className="text-[#8b7355] font-serif italic text-base md:text-lg max-w-md mx-auto">
                      Создай первую запись, чтобы наполнить этот мир магией и общими мечтами.
                    </p>
                  </div>
                  <button 
                    onClick={() => startCreate(creationType)}
                    className="bg-[#5c4a33] text-[#fdfaf3] px-8 md:px-12 py-4 md:py-6 rounded-[2rem] md:rounded-[2.5rem] font-black uppercase tracking-[0.25em] text-[10px] md:text-[11px] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 md:gap-4"
                  >
                    <Plus size={20} className="md:w-6 md:h-6" />
                    Добавить первую запись
                  </button>
                </motion.div>
            )}
          </div>
        </section>
      </div>

      {/* Оптимальный пробел внизу для комфортного листания */}
      <div className="h-[10px] w-full pointer-events-none" />

      {/* Quest Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsModalOpen(false);
              }}
              className="absolute inset-0 bg-[#5c4a33]/60 backdrop-blur-xl"
            />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full flex flex-col transition-all duration-500 max-w-5xl z-10"
              >
                {/* Main modal content */}
                <div className={cn(
                  "relative rounded-[3rem] shadow-[0_20px_70px_rgba(0,0,0,0.15),0_10px_30px_rgba(0,0,0,0.1)] border-[12px] transition-all duration-500 overflow-hidden flex flex-col flex-1 max-h-[90vh]",
                  "bg-[#fdfaf3]", // Всегда светлый фон для стиля Palia
                  "border-[#e6d5bc] shadow-[inset_0_0_0_4px_#fdfaf3]" // Традиционный стиль Palia
                )}>
                  {/* Decorative glow background */}
                  <div className={cn(
                    "absolute -top-24 -right-24 w-64 h-64 blur-[100px] opacity-20 pointer-events-none transition-colors duration-700",
                    QUEST_COLORS.find(c => c.id === editData.color)?.accent || "bg-[#8b7355]"
                  )} />
                  <div className={cn(
                    "absolute -bottom-24 -left-24 w-64 h-64 blur-[100px] opacity-20 pointer-events-none transition-colors duration-700",
                    QUEST_COLORS.find(c => c.id === editData.color)?.accent || "bg-[#8b7355]"
                  )} />

                <div className="p-5 md:p-12 space-y-6 md:space-y-8 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] flex flex-col flex-1 overflow-hidden relative z-10">
                  <div className={cn(
                    "flex justify-between items-start border-b-2 pb-4 md:pb-6 transition-colors duration-500 shrink-0",
                    "border-[#e6d5bc]/50"
                  )}>
                    <div className="space-y-1 md:space-y-2">
                      <h3 className={cn(
                        "text-2xl md:text-5xl font-serif font-black transition-colors duration-500 tracking-tight",
                        QUEST_COLORS.find(c => c.id === editData.color)?.text || "text-[#5c4a33]"
                      )}>
                        {isEditing 
                          ? (selectedQuest ? 'Свиток Изменений' : (isChecklistMode ? 'Новая Заметка' : 'Новое Поручение')) 
                          : (selectedQuest ? (selectedQuest.isChecklist ? 'Детали Заметки' : 'Детали Квеста') : 'Детали')
                        }
                      </h3>
                      <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[#8b7355]/60">
                        Летопись наших общих приключений
                      </p>
                    </div>
                    <button 
                      onClick={() => setIsModalOpen(false)} 
                      className={cn(
                        "w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border-2 flex items-center justify-center transition-all shadow-sm hover:scale-110 active:scale-95",
                        QUEST_COLORS.find(c => c.id === editData.color)?.border || "border-[#e6d5bc]",
                        QUEST_COLORS.find(c => c.id === editData.color)?.text || "text-[#5c4a33]",
                        "hover:bg-[#f5e6d3]"
                      )}
                    >
                      <X className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>

                  {isEditing ? (
                    isChecklistMode ? (
                      /* ОКНО ЗАМЕТКИ - Двухколоночное */
                      <div className="flex flex-col md:flex-row gap-6 md:gap-12 flex-1 overflow-hidden">
                        {/* Левая колонка - Настройки */}
                        <div className="w-full md:w-[40%] flex flex-col gap-6 md:gap-8 overflow-y-auto pr-2 md:pr-4 custom-scrollbar">
                          <div className="space-y-6 md:space-y-8">
                            <div className="space-y-3 md:space-y-4">
                              <div className="flex items-center gap-2 md:gap-3 px-2">
                                <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#8b7355]/40" />
                                <label className="text-[9px] md:text-[10px] uppercase font-black text-[#8b7355] tracking-widest">Название Списка</label>
                              </div>
                              <input 
                                value={editData.title}
                                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                className={cn(
                                  "w-full bg-white/80 border-2 rounded-2xl md:rounded-[1.8rem] px-5 py-4 md:px-8 md:py-5 outline-none focus:ring-0 focus:border-[#5c4a33]/40 transition-all font-serif font-bold text-[#5c4a33] text-lg md:text-xl shadow-inner-sm",
                                  QUEST_COLORS.find(c => c.id === editData.color)?.border || "border-[#e6d5bc]"
                                )}
                                placeholder="Назови свой список..."
                              />
                            </div>

                            <div className="space-y-3 md:space-y-4">
                              <div className="flex items-center gap-2 md:gap-3 px-2">
                                <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#8b7355]/40" />
                                <label className="text-[9px] md:text-[10px] uppercase font-black text-[#8b7355] tracking-widest">Категория</label>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {bucketListCategories
                                  .filter((c) => c !== 'Все')
                                  .map((cat) => (
                                    <button
                                      key={cat}
                                      onClick={() => setEditData({ ...editData, category: cat })}
                                      className={cn(
                                        "px-4 py-2 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border-2",
                                        editData.category === cat
                                          ? (QUEST_COLORS.find(c => c.id === editData.color)?.accent || "bg-[#5c4a33]") + " border-transparent text-white shadow-lg"
                                          : "bg-white border-[#e6d5bc]/60 text-[#8b7355] hover:border-[#8b7355]/40"
                                      )}>
                                      {cat}
                                    </button>
                                  ))}
                              </div>
                            </div>

                            <div className="space-y-3 md:space-y-4">
                              <div className="flex items-center gap-2 md:gap-3 px-2">
                                <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#8b7355]/40" />
                                <label className="text-[9px] md:text-[10px] uppercase font-black text-[#8b7355] tracking-widest">Цвет Заметки</label>
                              </div>
                              <div className="flex flex-wrap gap-3 md:gap-4 justify-center bg-white/40 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-2 border-[#e6d5bc]/30 shadow-inner">
                                {QUEST_COLORS.map((color) => (
                                  <button
                                    key={color.id}
                                    onClick={() => setEditData({ ...editData, color: color.id })}
                                    className={cn(
                                      "w-8 h-8 md:w-10 md:h-10 rounded-full border-[3px] md:border-4 transition-all relative group shadow-sm",
                                      color.border,
                                      color.bg,
                                      editData.color === color.id ? "scale-125 shadow-lg z-10" : "hover:scale-110 opacity-60 hover:opacity-100"
                                    )}
                                  >
                                    {editData.color === color.id && (
                                      <div className={cn("absolute inset-0 flex items-center justify-center", color.text)}>
                                        <Check className="w-4 h-4 md:w-[18px] md:h-[18px]" strokeWidth={4} />
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Правая колонка - Пункты */}
                        <div className={cn(
                          "w-full md:w-[60%] flex flex-col min-h-0 overflow-hidden bg-white/40 border-2 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 shadow-inner relative transition-all duration-500",
                          QUEST_COLORS.find(c => c.id === editData.color)?.border || "border-[#e6d5bc]"
                        )}>
                          <div className="flex items-center justify-between mb-4 md:mb-6 shrink-0">
                            <label className="text-[9px] md:text-[10px] uppercase font-black text-[#8b7355] tracking-widest flex items-center gap-2">
                              <ListChecks className="w-4 h-4 md:w-4 md:h-4" /> Пункты списка
                            </label>
                            <span className="text-[9px] md:text-[10px] font-black text-[#8b7355]/40 uppercase tracking-widest">
                              {newChecklistItems.filter(i => i.trim()).length} пунктов
                            </span>
                          </div>
                          
                          <div className="flex-1 overflow-y-auto pr-2 md:pr-4 space-y-3 md:space-y-4 custom-scrollbar mb-6 md:mb-8">
                            <AnimatePresence mode="popLayout">
                              {newChecklistItems.map((item, idx) => (
                                <motion.div 
                                  key={idx} 
                                  layout
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  className="flex gap-2 md:gap-4 group/item"
                                >
                                  <div className="flex-1 relative">
                                    <input 
                                      value={item}
                                      onChange={(e) => {
                                        const updated = [...newChecklistItems];
                                        updated[idx] = e.target.value;
                                        setNewChecklistItems(updated);
                                      }}
                                      className={cn(
                                        "w-full bg-white border-2 rounded-xl md:rounded-2xl px-4 py-3 md:px-6 md:py-4 outline-none focus:ring-0 transition-all font-serif italic text-[#5c4a33] shadow-sm text-sm md:text-base",
                                        QUEST_COLORS.find(c => c.id === editData.color)?.border || "border-[#e6d5bc]",
                                        "focus:border-[#5c4a33]/40"
                                      )}
                                      placeholder={`Пункт №${idx + 1}...`}
                                    />
                                    {newChecklistItems.length > 1 && (
                                      <button 
                                        onClick={() => setNewChecklistItems(newChecklistItems.filter((_, i) => i !== idx))}
                                        className="absolute -right-2 -top-2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white border-2 border-red-100 flex items-center justify-center text-red-400 hover:text-red-600 hover:border-red-200 transition-all opacity-100 md:opacity-0 group-hover/item:opacity-100 shadow-sm"
                                      >
                                        <X className="w-3 h-3 md:w-[14px] md:h-[14px]" />
                                      </button>
                                    )}
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                          
                          {newChecklistItems.length < 4 && (
                            <button 
                              onClick={() => setNewChecklistItems([...newChecklistItems, ''])}
                              className={cn(
                                "w-full py-4 md:py-5 border-2 border-dashed rounded-xl md:rounded-2xl transition-all flex items-center justify-center gap-2 md:gap-3 font-black uppercase text-[10px] md:text-[11px] tracking-widest shrink-0 bg-white/80 hover:bg-white shadow-sm",
                                QUEST_COLORS.find(c => c.id === editData.color)?.border || "border-[#e6d5bc]",
                                QUEST_COLORS.find(c => c.id === editData.color)?.text || "text-[#8b7355]",
                                "hover:opacity-80"
                              )}
                            >
                              <Plus className="w-4 h-4 md:w-5 md:h-5" /> Добавить пункт
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* ОКНО КВЕСТА - Вертикальный Свиток */
                      <div className="flex flex-col gap-6 md:gap-10 flex-1 overflow-y-auto pr-2 md:pr-4 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                          {/* Основная инфа */}
                          <div className="md:col-span-7 space-y-6 md:space-y-10">
                            <div className="space-y-3 md:space-y-4">
                              <div className="flex items-center gap-2 md:gap-3 px-2">
                                <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#8b7355]/40" />
                                <label className="text-[9px] md:text-[10px] uppercase font-black text-[#8b7355] tracking-widest">Суть Приключения</label>
                              </div>
                              <input 
                                value={editData.title}
                                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                className={cn(
                                  "w-full bg-white/80 border-2 rounded-2xl md:rounded-[2rem] px-5 py-4 md:px-8 md:py-6 outline-none focus:ring-0 focus:border-[#5c4a33]/40 transition-all font-serif font-black text-[#5c4a33] text-lg md:text-2xl shadow-sm",
                                  QUEST_COLORS.find(c => c.id === editData.color)?.border || "border-[#e6d5bc]"
                                )}
                                placeholder="Что предстоит совершить?"
                              />
                            </div>
                            <div className="space-y-3 md:space-y-4">
                              <div className="flex items-center gap-2 md:gap-3 px-2">
                                <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#8b7355]/40" />
                                <label className="text-[9px] md:text-[10px] uppercase font-black text-[#8b7355] tracking-widest">Дневник Подробностей</label>
                              </div>
                              <textarea 
                                value={editData.description}
                                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                className={cn(
                                  "w-full h-32 md:h-56 bg-white/80 border-2 rounded-2xl md:rounded-[2.5rem] px-6 py-6 md:px-10 md:py-10 outline-none focus:ring-0 focus:border-[#5c4a33]/40 transition-all resize-none font-serif italic text-base md:text-xl text-[#5c4a33] leading-relaxed shadow-sm",
                                  QUEST_COLORS.find(c => c.id === editData.color)?.border || "border-[#e6d5bc]"
                                )}
                                placeholder="Опиши ваше приключение во всех красках..."
                              />
                            </div>
                          </div>

                          {/* Боковая панель настроек */}
                          <div className="md:col-span-5 flex flex-col gap-8 md:gap-10">
                            <div className="space-y-8 md:space-y-10">
                              <div className="space-y-4 md:space-y-5">
                                <div className="flex items-center gap-2 md:gap-3 px-2">
                                  <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#8b7355]/40" />
                                  <label className="text-[9px] md:text-[10px] uppercase font-black text-[#8b7355] tracking-widest">Категория</label>
                                </div>
                                <div className="flex flex-wrap gap-2 md:gap-2.5">
                                  {bucketListCategories
                                    .filter((c) => c !== 'Все')
                                    .map((cat) => (
                                      <button
                                        key={cat}
                                        onClick={() => setEditData({ ...editData, category: cat })}
                                        className={cn(
                                          "px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border-2",
                                          editData.category === cat
                                            ? (QUEST_COLORS.find(c => c.id === editData.color)?.accent || "bg-[#5c4a33]") + " border-transparent text-white shadow-lg"
                                            : "bg-white border-[#e6d5bc]/60 text-[#8b7355] hover:border-[#8b7355]/40"
                                        )}>
                                        {cat}
                                      </button>
                                    ))}
                                </div>
                              </div>

                              <div className="space-y-4 md:space-y-5">
                                <div className="flex items-center gap-2 md:gap-3 px-2">
                                  <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#8b7355]/40" />
                                  <label className="text-[9px] md:text-[10px] uppercase font-black text-[#8b7355] tracking-widest">Цвет Свитка</label>
                                </div>
                                <div className="flex flex-wrap gap-3 md:gap-4 justify-center bg-white/40 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-2 border-[#e6d5bc]/30 shadow-inner">
                                  {QUEST_COLORS.map((color) => (
                                    <button
                                      key={color.id}
                                      onClick={() => setEditData({ ...editData, color: color.id })}
                                      className={cn(
                                        "w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] md:border-4 transition-all relative group shadow-sm",
                                        color.border,
                                        color.bg,
                                        editData.color === color.id ? "scale-125 shadow-lg z-10" : "hover:scale-110 opacity-60 hover:opacity-100"
                                      )}
                                    >
                                      {editData.color === color.id && (
                                        <div className={cn("absolute inset-0 flex items-center justify-center", color.text)}>
                                          <Check className="w-5 h-5 md:w-5 md:h-5" strokeWidth={4} />
                                        </div>
                                      )}
                                    </button>
                                  ))}
                                </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                    )
                  ) : selectedQuest && (
                    <div className="flex flex-col md:flex-row gap-6 md:gap-10 flex-1 min-h-0 overflow-hidden">
                      {/* Левая колонка - Список задач */}
                      <div className={cn(
                        "flex-1 flex flex-col min-h-0 bg-white/40 border-2 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 shadow-inner relative",
                        QUEST_COLORS.find(c => c.id === selectedQuest.color)?.border || "border-[#e6d5bc]/40"
                      )}>
                        <div className="flex items-center justify-between mb-4 md:mb-6 shrink-0 border-b-2 border-dashed pb-3 md:pb-4" style={{ borderColor: QUEST_COLORS.find(c => c.id === selectedQuest.color)?.border.split('-')[1] }}>
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className={cn(
                              "w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center shadow-sm",
                              QUEST_COLORS.find(c => c.id === selectedQuest.color)?.bg || "bg-white",
                              QUEST_COLORS.find(c => c.id === selectedQuest.color)?.text || "text-[#5c4a33]"
                            )}>
                              <ListChecks className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <h4 className={cn(
                              "text-lg md:text-xl font-serif font-black tracking-tight",
                              QUEST_COLORS.find(c => c.id === selectedQuest.color)?.text || "text-[#5c4a33]"
                            )}>План наших действий</h4>
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 md:pr-4 custom-scrollbar -mr-2 md:-mr-4">
                          {selectedQuest.isChecklist ? (
                            <AnimatePresence mode="popLayout">
                              <div className="space-y-2 md:space-y-3">
                                {selectedQuest.checklistItems?.map((item) => (
                                  <motion.button 
                                    layout
                                    key={item.id}
                                    onClick={() => toggleChecklistItem(selectedQuest.id, item.id)}
                                    className="w-full flex items-center gap-3 md:gap-4 text-left group/item transition-all py-2 px-3 md:py-2.5 md:px-4 rounded-xl md:rounded-2xl hover:bg-white/40"
                                  >
                                    <div className={cn(
                                      "w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl border-2 flex items-center justify-center transition-all shrink-0 shadow-sm",
                                      item.completed 
                                        ? (QUEST_COLORS.find(c => c.id === selectedQuest.color)?.accent || "bg-[#5c4a33]") + " border-transparent scale-110 shadow-lg"
                                        : cn("bg-white hover:border-[#5c4a33] border-[#e6d5bc]")
                                    )}>
                                      {item.completed && <Check className="w-4 h-4 md:w-[18px] md:h-[18px] text-white" strokeWidth={4} />}
                                    </div>
                                    <span className={cn(
                                      "text-base md:text-xl font-serif leading-tight transition-all font-bold",
                                      item.completed ? "line-through opacity-40 italic" : "text-[#5c4a33] group-hover/item:translate-x-1",
                                      !item.completed && (QUEST_COLORS.find(c => c.id === selectedQuest.color)?.text || "text-[#5c4a33]")
                                    )}>{item.text}</span>
                                  </motion.button>
                                ))}
                              </div>
                            </AnimatePresence>
                          ) : (
                            <div className="h-full flex items-center justify-center p-4 md:p-8 relative">
                              <Sparkles className={cn(
                                "absolute top-0 left-0 opacity-10 w-6 h-6 md:w-10 md:h-10",
                                QUEST_COLORS.find(c => c.id === selectedQuest.color)?.text || "text-[#5c4a33]"
                              )} />
                              <p className={cn(
                                "text-lg md:text-2xl font-serif italic leading-relaxed text-center font-black",
                                QUEST_COLORS.find(c => c.id === selectedQuest.color)?.text || "text-[#5c4a33]"
                              )}>«{selectedQuest.description}»</p>
                              <Sparkles className={cn(
                                "absolute bottom-0 right-0 opacity-10 w-6 h-6 md:w-10 md:h-10",
                                QUEST_COLORS.find(c => c.id === selectedQuest.color)?.text || "text-[#5c4a33]"
                              )} />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Правая колонка - Информация и Прогресс */}
                      <div className="w-full md:w-[350px] flex flex-col gap-4 md:gap-6">
                        {/* Статус/Таймер */}
                        {getTimerInfo(selectedQuest) && (
                          <div className={cn(
                            "px-6 py-4 md:px-8 md:py-5 rounded-[2rem] md:rounded-[2.5rem] border-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 md:gap-4 animate-pulse bg-white shadow-sm",
                            getTimerInfo(selectedQuest)?.isDone 
                              ? (QUEST_COLORS.find(c => c.id === selectedQuest.color)?.text || "text-[#5c4a33]")
                              : "bg-amber-500/10 border-amber-500/30 text-amber-600"
                          )}>
                            <Clock className="w-4 h-4 md:w-5 md:h-5" />
                            {getTimerInfo(selectedQuest)?.text}
                          </div>
                        )}

                        {/* Дата */}
                        <div className={cn(
                          "group p-5 md:p-6 border-2 rounded-[2rem] md:rounded-[2.5rem] shadow-sm transition-all bg-white/40",
                          QUEST_COLORS.find(c => c.id === selectedQuest.color)?.border || "border-[#e6d5bc]/40"
                        )}>
                          <div className="flex items-center gap-4 md:gap-5">
                            <div className={cn(
                              "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white flex items-center justify-center shadow-md border-2",
                              QUEST_COLORS.find(c => c.id === selectedQuest.color)?.border || "border-[#e6d5bc]"
                            )}>
                              <Calendar className={cn("w-5 h-5 md:w-6 md:h-6", QUEST_COLORS.find(c => c.id === selectedQuest.color)?.text || "text-[#5c4a33]")} />
                            </div>
                            <div>
                              <span className="block text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-[#8b7355]/60 mb-0.5">Дата создания</span>
                              <span className={cn(
                                "text-lg md:text-xl font-serif font-black",
                                QUEST_COLORS.find(c => c.id === selectedQuest.color)?.text || "text-[#5c4a33]"
                              )}>{new Date(selectedQuest.createdAt).toLocaleDateString('ru-RU')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Прогресс */}
                        <div className={cn(
                          "group p-5 md:p-6 border-2 rounded-[2rem] md:rounded-[2.5rem] shadow-sm transition-all bg-white/40",
                          QUEST_COLORS.find(c => c.id === selectedQuest.color)?.border || "border-[#e6d5bc]/40"
                        )}>
                          <div className="flex items-center gap-4 md:gap-5">
                            <div className={cn(
                              "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white flex items-center justify-center shadow-md border-2",
                              QUEST_COLORS.find(c => c.id === selectedQuest.color)?.border || "border-[#e6d5bc]"
                            )}>
                              {selectedQuest.isChecklist ? (
                                <ListChecks className={cn("w-5 h-5 md:w-6 md:h-6", QUEST_COLORS.find(c => c.id === selectedQuest.color)?.text || "text-[#5c4a33]")} />
                              ) : (
                                <Target className={cn("w-5 h-5 md:w-6 md:h-6", QUEST_COLORS.find(c => c.id === selectedQuest.color)?.text || "text-[#5c4a33]")} />
                              )}
                            </div>
                            <div>
                              <span className="block text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-[#8b7355]/60 mb-0.5">Прогресс</span>
                              <span className={cn(
                                "text-lg md:text-xl font-serif font-black",
                                selectedQuest.completed 
                                  ? (QUEST_COLORS.find(c => c.id === selectedQuest.color)?.text || "text-[#5c4a33]") 
                                  : "text-[#8b7355]"
                              )}>
                                {selectedQuest.isChecklist 
                                  ? `${selectedQuest.checklistItems?.filter(i => i.completed).length}/${selectedQuest.checklistItems?.length}`
                                  : (selectedQuest.completed ? 'Исполнено' : 'В Пути')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Разделитель */}
                        <div className="hidden md:block flex-1" />

                        {/* Действия (Перенесены из футера для экономии места) */}
                        <div className="flex flex-col gap-3 md:gap-4 mt-2 md:mt-0">
                          <button 
                            onClick={() => deleteQuest(selectedQuest.id)} 
                            className={cn(
                              "w-full p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] transition-all flex items-center justify-center gap-2 md:gap-3 border-2 group shadow-sm bg-white hover:bg-red-50 hover:border-red-200 text-[#8b7355] hover:text-red-500",
                              QUEST_COLORS.find(c => c.id === selectedQuest.color)?.border || "border-[#e6d5bc]/40"
                            )}
                          >
                            <Trash2 className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:scale-110" />
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">Удалить</span>
                          </button>
                          
                          {!getTimerInfo(selectedQuest)?.isLocked && (
                            <button 
                              onClick={() => setIsEditing(true)} 
                              className={cn(
                                "w-full py-4 md:py-5 bg-white border-2 font-black uppercase tracking-[0.2em] text-[9px] md:text-[10px] rounded-[1.5rem] md:rounded-[2rem] transition-all flex items-center justify-center gap-2 md:gap-3 shadow-sm hover:shadow-md hover:translate-y-[-2px]",
                                QUEST_COLORS.find(c => c.id === selectedQuest.color)?.border || "border-[#e6d5bc]",
                                QUEST_COLORS.find(c => c.id === selectedQuest.color)?.text || "text-[#5c4a33]"
                              )}
                            >
                              <Edit3 className="w-4 h-4 md:w-5 md:h-5" /> Править
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer - Оставляем только для режима редактирования */}
                  {isEditing && (
                    <div className={cn(
                      "pt-6 md:pt-8 border-t-2 flex flex-col sm:flex-row justify-between gap-4 md:gap-6 shrink-0",
                      currentUser === 'Grinch' ? "border-[#bae6fd]/30" : "border-[#fbcfe8]/30"
                    )}>
                      <div className="flex gap-4 md:gap-6 flex-1">
                        <button 
                          onClick={() => setIsModalOpen(false)} 
                          className="px-6 md:px-10 py-4 md:py-5 text-[#8b7355] font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] hover:text-[#5c4a33] transition-all hover:translate-x-[-4px]"
                        >
                          Отмена
                        </button>
                        <button 
                          onClick={saveQuest} 
                          className={cn(
                            "flex-1 py-4 md:py-5 text-[#fdfaf3] font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] rounded-[1.5rem] md:rounded-[1.8rem] shadow-xl hover:scale-[1.02] active:scale-95 transition-all border-b-4",
                            QUEST_COLORS.find(c => c.id === editData.color)?.accent || "bg-[#5c4a33]",
                            "border-black/20 shadow-lg"
                          )}
                        >
                          {selectedQuest ? 'Записать в Свиток' : (isChecklistMode ? 'Запечатать Заметку' : 'Провозгласить Квест')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                </div>
              </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category Management Modal - Palia Style */}
      <AnimatePresence>
        {isManagingCategories && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsManagingCategories(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#fdfaf3] rounded-[2.5rem] md:rounded-[3rem] border-6 md:border-8 border-[#e6d5bc] shadow-2xl p-6 md:p-10 overflow-hidden"
            >
              {/* Paper texture overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />

              <div className="relative z-10 space-y-6 md:space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl md:text-3xl font-serif font-black text-[#5c4a33] flex items-center gap-2 md:gap-3">
                    <Settings2 className="text-[#8b7355] w-6 h-6 md:w-8 md:h-8" />
                    Категории
                  </h3>
                  <button
                    onClick={() => setIsManagingCategories(false)}
                    className="p-2 rounded-full bg-[#f5e6d3] text-[#5c4a33] hover:bg-[#e6d5bc] transition-all">
                    <X className="w-5 h-5 md:w-5 md:h-5" />
                  </button>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => {
                        if (e.target.value.length <= 12) {
                          setNewCategoryName(e.target.value);
                        }
                      }}
                      placeholder="Новая категория..."
                      className="flex-1 bg-white border-2 md:border-4 border-[#e6d5bc] rounded-xl md:rounded-2xl px-4 py-3 md:px-6 md:py-4 outline-none focus:border-[#5c4a33]/60 transition-all text-xs md:text-sm font-bold text-[#5c4a33]"
                      onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                    />
                    <button
                      onClick={addCategory}
                      disabled={!newCategoryName.trim()}
                      className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-[#5c4a33] text-[#fdfaf3] shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                      <Plus className="w-5 h-5 md:w-5 md:h-5" />
                    </button>
                  </div>

                  <div className="space-y-2 md:space-y-3 max-h-48 md:max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {bucketListCategories.map((cat) => (
                      <div
                        key={cat}
                        className="flex items-center justify-between p-3 md:p-4 bg-white border-2 md:border-4 border-[#e6d5bc] rounded-xl md:rounded-2xl group hover:border-[#5c4a33] transition-all">
                        <span className="font-bold text-[#5c4a33] text-sm md:text-base">{cat}</span>
                        {cat !== 'Все' && (
                          <button
                            onClick={() => setCategoryToDelete(cat)}
                            className="p-1.5 md:p-2 text-[#8b7355] hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4 md:w-4 md:h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setIsManagingCategories(false)}
                  className="w-full py-3 md:py-4 rounded-xl md:rounded-2xl bg-[#f5e6d3] text-[#5c4a33] font-bold text-sm md:text-base hover:bg-[#e6d5bc] transition-all border-2 md:border-4 border-[#e6d5bc]">
                  Готово
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category Delete Confirmation Modal - Palia Style */}
      <AnimatePresence>
        {categoryToDelete && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCategoryToDelete(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#fdfaf3] rounded-[2.5rem] md:rounded-[3rem] border-6 md:border-8 border-[#e6d5bc] shadow-2xl p-6 md:p-10 text-center"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 text-red-500">
                <Trash2 className="w-8 h-8 md:w-10 md:h-10" />
              </div>
              <h3 className="text-xl md:text-2xl font-serif font-black text-[#5c4a33] mb-3 md:mb-4">Удалить категорию?</h3>
              <p className="text-sm md:text-base text-[#8b7355] font-medium mb-6 md:mb-8">
                Вы уверены, что хотите удалить категорию <span className="text-[#5c4a33] font-black">"{categoryToDelete}"</span>? 
                Это не удалит сами желания, но они останутся без категории.
              </p>
              <div className="flex gap-3 md:gap-4">
                <button
                  onClick={() => setCategoryToDelete(null)}
                  className="flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl bg-[#f5e6d3] text-[#5c4a33] font-bold text-sm md:text-base hover:bg-[#e6d5bc] transition-all">
                  Отмена
                </button>
                <button
                  onClick={() => deleteCategory(categoryToDelete)}
                  className="flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl bg-red-500 text-white font-bold text-sm md:text-base hover:bg-red-600 shadow-lg shadow-red-200 transition-all">
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
