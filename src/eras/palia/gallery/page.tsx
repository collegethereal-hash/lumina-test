'use client';

import { useState, useEffect } from 'react';
import { PolaroidCard } from '@/eras/palia/components/PolaroidCard';
import { Plus, Search, Sparkles, Image as ImageIcon, X, Camera, Tag, Upload, Trash2, Settings2, Download, Maximize2, RefreshCw, Calendar, User, Archive, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useData } from '@/components/DataProvider';
import { default as NextImage } from 'next/image';

interface Moment {
  id: string;
  src: string;
  caption: string;
  date: string;
  category: string;
  author: string;
  rotate?: number;
}

const INITIAL_MOMENTS: Moment[] = [
  { id: '1', src: 'https://images.unsplash.com/photo-1518173946687-a4c03f6f85c6?q=80&w=1000&auto=format&fit=crop', caption: 'Наше первое свидание в кафе', date: '2026-03-15', rotate: 3, category: 'Свидания', author: 'Гринч' },
  { id: '2', src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000&auto=format&fit=crop', caption: 'Прогулка по парку', date: '2026-03-20', rotate: -2, category: 'Прогулки', author: 'Синди' },
  { id: '3', src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop', caption: 'Вечер дома с фильмом', date: '2026-04-01', rotate: 4, category: 'Дом', author: 'Гринч' },
  { id: '4', src: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop', caption: 'Путешествие в горы', date: '2026-04-15', rotate: -4, category: 'Путешествия', author: 'Синди' },
  { id: '5', src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1000&auto=format&fit=crop', caption: 'Наше романтическое признание', date: '2026-05-01', rotate: 2, category: 'Свидания', author: 'Гринч' },
  { id: '6', src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1000&auto=format&fit=crop', caption: 'Утренний кофе вместе', date: '2026-05-10', rotate: -3, category: 'Дом', author: 'Синди' },
  { id: '7', src: 'https://images.unsplash.com/photo-1501785888041-af3ef281b395?q=80&w=1000&auto=format&fit=crop', caption: 'Пикник на берегу озера', date: '2026-05-20', rotate: 5, category: 'Прогулки', author: 'Гринч' },
  { id: '8', src: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop', caption: 'Закат на море', date: '2026-06-01', rotate: -1, category: 'Путешествия', author: 'Синди' },
];

const INITIAL_CATEGORIES = ['Все', 'Свидания', 'Прогулки', 'Дом', 'Путешествия'];
const AUTHORS = ['Гринч', 'Синди'];

import { Skeleton } from '@/components/Skeleton';

export default function GalleryPage() {
  const { 
    currentUser, 
    spaceConfig, 
    moments, 
    setMoments, 
    galleryCategories, 
    setGalleryCategories, 
    isLoading, 
    isMomentsLoading,
    archiveMonths: archiveMonthsList,
    loadArchiveMonth,
    setArchiveMoments,
    getCurrentMonthMoments // Используем готовую функцию из провайдера
  } = useData();
  
  const [localArchiveMoments, setLocalArchiveMoments] = useState<Moment[]>([]);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  
  const currentMonthMoments = getCurrentMonthMoments();
  
  const [filter, setFilter] = useState('Все');
  const [search, setSearch] = useState('');
  const [randomMoment, setRandomMoment] = useState<Moment | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Moment | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<Moment | null>(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [selectedArchiveMonth, setSelectedArchiveMonth] = useState<{ year: number; month: number } | null>(null);

  // Add Moment State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMoment, setNewMoment] = useState({
    src: '',
    caption: '',
    category: 'Свидания',
  });

  // Category Management State
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const saveCategories = async (newCats: string[]) => {
    setGalleryCategories(newCats); // Optimistic update
    await supabase.from('global_state').upsert({
      key: 'gallery_categories',
      value: newCats,
    });
  };

  // Load an archive month
  const loadLocalArchiveMonth = (year: number, month: number) => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 1);
    
    const monthMoments = moments.filter(m => {
      const momentDate = new Date(m.date);
      return momentDate >= startDate && momentDate < endDate;
    });
    
    setLocalArchiveMoments(monthMoments);
  };

  // Body scroll lock
  useEffect(() => {
    const isAnyModalOpen = isAddModalOpen || selectedPhoto || randomMoment || isManagingCategories || photoToDelete || categoryToDelete || isArchiveOpen;
    if (isAnyModalOpen) {
      document.body.classList.add('lock-scroll');
    } else {
      document.body.classList.remove('lock-scroll');
    }
    return () => document.body.classList.remove('lock-scroll');
  }, [isAddModalOpen, selectedPhoto, randomMoment, isManagingCategories, photoToDelete, categoryToDelete, isArchiveOpen]);

  // Filter moments based on whether we're in archive or not
  const getDisplayMoments = () => {
    if (selectedArchiveMonth) {
      return localArchiveMoments;
    }
    return currentMonthMoments;
  };

  const displayMoments = getDisplayMoments();

  const filteredMoments = displayMoments.filter(
    (m) =>
      (filter === 'Все' || m.category === filter) &&
      m.caption.toLowerCase().includes(search.toLowerCase())
  );

  const getNewThisWeekCount = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return displayMoments.filter((m) => new Date(m.date) >= sevenDaysAgo).length;
  };

  const showRandomMemory = () => {
    if (displayMoments.length > 0) {
      const random = displayMoments[Math.floor(Math.random() * displayMoments.length)];
      setRandomMoment(random);
    }
  };

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max dimensions
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Convert to Blob (JPEG 0.7 quality)
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Canvas to Blob failed'));
            },
            'image/jpeg',
            0.7
          );
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMoment({ ...newMoment, src: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addMoment = async () => {
    if (!newMoment.src || !newMoment.caption) return;
    setIsUploading(true);

    try {
      let finalImageUrl = newMoment.src;

      // If it's a base64 from file upload, we should compress and upload it to Supabase Storage
      if (newMoment.src.startsWith('data:')) {
        // Convert base64 to File object first
        const originalBlob = await fetch(newMoment.src).then((res) => res.blob());
        const originalFile = new File([originalBlob], 'upload.jpg', { type: 'image/jpeg' });

        // Compress the image!
        const compressedBlob = await compressImage(originalFile);

        const fileName = `${Math.random()}.jpeg`;
        const filePath = `moments/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(filePath, compressedBlob, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from('gallery')
          .getPublicUrl(filePath);

        finalImageUrl = publicUrlData.publicUrl;
      }

      // Get author name based on currentUser
      const authorName = currentUser === 'Grinch' ? 'Гринч' : 'Синди';

      // Используем локальную дату вместо ISO, чтобы избежать проблем с часовыми поясами
      const localDate = new Date();
      const dateStr = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;

      const moment = {
        space_id: spaceConfig?.id,
        image_url: finalImageUrl,
        caption: newMoment.caption,
        category: newMoment.category,
        date: dateStr,
        author: authorName,
      };

      const { data, error } = await supabase
        .from('gallery_moments')
        .insert([moment])
        .select()
        .single();

      if (error) throw error;

      setMoments([{ ...data, src: data.image_url }, ...moments]);
      setNewMoment({ src: '', caption: '', category: galleryCategories[1] || 'Все' });
      setIsAddModalOpen(false);
    } catch (err: any) {
      console.error('Full Error Object:', err);
      const errorMessage = err.message || JSON.stringify(err);
      console.error('Error detail:', errorMessage);
      alert('Ошибка при загрузке фото: ' + errorMessage + '. Проверьте права доступа (INSERT) для бакета "gallery" в Storage Policies.');
    } finally {
      setIsUploading(false);
    }
  };

  const addCategory = async () => {
    if (!newCategoryName.trim() || galleryCategories.includes(newCategoryName.trim())) return;
    const updated = [...galleryCategories, newCategoryName.trim()];
    await saveCategories(updated);
    setNewCategoryName('');
  };

  const deleteCategory = async (catToDelete: string) => {
    if (catToDelete === 'Все') return;
    const updated = galleryCategories.filter((c) => c !== catToDelete);
    await saveCategories(updated);
    if (filter === catToDelete) setFilter('Все');
    setCategoryToDelete(null);
  };

  const updateMomentCategory = async (moment: Moment, newCategory: string) => {
    try {
      // 1. Update in Database
      const { error: dbError } = await supabase
        .from('gallery_moments')
        .update({ category: newCategory })
        .eq('id', moment.id);

      if (dbError) throw dbError;

      // 2. Update locally
      setMoments(moments.map((m) => m.id === moment.id ? { ...m, category: newCategory } : m));
      
      // Update selected photo if needed
      if (selectedPhoto?.id === moment.id) {
        setSelectedPhoto({ ...selectedPhoto, category: newCategory });
      }
    } catch (err) {
      console.error('Error updating category:', err);
      alert('Ошибка при обновлении категории.');
    }
  };

  const confirmDeletePhoto = async (moment: Moment) => {
    try {
      // 1. Delete from Database
      const { error: dbError } = await supabase
        .from('gallery_moments')
        .delete()
        .eq('id', moment.id);

      if (dbError) throw dbError;

      // 2. Delete from Storage if it's a Supabase URL
      if (moment.src.includes('.supabase.co/storage/v1/object/public/gallery/')) {
        const filePath = moment.src.split('/gallery/')[1];
        await supabase.storage.from('gallery').remove([filePath]);
      }

      setMoments(moments.filter((m) => m.id !== moment.id));
      setPhotoToDelete(null);
      if (selectedPhoto?.id === moment.id) setSelectedPhoto(null);
    } catch (err) {
      console.error('Error deleting photo:', err);
      alert('Ошибка при удалении фотографии.');
    }
  };

  const downloadPhoto = (src: string, filename: string) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative min-h-screen bg-[#fdfaf3]">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#f0f9ff]/50 via-transparent to-[#fdf2f8]/50" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#0ea5e9]/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#ec4899]/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-20 pb-40 md:pb-52 space-y-6 md:space-y-10 relative z-10">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="md:hidden flex flex-col gap-4">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5c4a33] text-[#fdfaf3] text-[9px] font-bold uppercase tracking-widest shadow-md">
              <Camera size={10} />
              {selectedArchiveMonth 
                ? (() => {
                    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
                    return `${monthNames[selectedArchiveMonth.month]} ${selectedArchiveMonth.year}`;
                  })()
                : (() => {
                    const now = new Date();
                    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
                    return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
                  })()
              }
            </div>
            <h1 className="text-4xl font-serif font-bold text-[#5c4a33] tracking-tight">
              {selectedArchiveMonth ? 'Архив' : 'Слепки моментов'}
            </h1>
          </div>
          
          <div className="flex gap-2">
            {selectedArchiveMonth ? (
              <button
                onClick={() => {
                  setSelectedArchiveMonth(null);
                  setArchiveMoments([]);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-[#e6d5bc] border-4 border-[#8b7355]/20 px-4 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-sm text-[#5c4a33] active:scale-95 transition-transform">
                <ArrowLeft size={16} />
                Назад
              </button>
            ) : (
              <button
                onClick={() => setIsArchiveOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-[#e6d5bc] border-4 border-[#8b7355]/20 px-4 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-sm text-[#5c4a33] active:scale-95 transition-transform">
                <Archive size={16} />
                Архив
              </button>
            )}
            <button
              onClick={showRandomMemory}
              className="flex-1 flex items-center justify-center gap-2 bg-[#fdfaf3] border-4 border-[#e6d5bc]/30 px-4 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-sm text-[#5c4a33] active:scale-95 transition-transform">
              <Sparkles size={16} className="text-amber-500" />
              Вспомнить
            </button>
            {!selectedArchiveMonth && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-[#5c4a33] px-4 py-3 rounded-[1.5rem] text-[#fdfaf3] font-black uppercase tracking-widest shadow-md text-[10px] active:scale-95 transition-transform">
                <Plus size={16} />
                Снять
              </button>
            )}
          </div>
        </div>

        {/* Desktop Header Section (Hidden on Mobile) */}
        <header className="hidden md:flex flex-col md:flex-row gap-6 items-start md:items-end justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5c4a33] text-[#fdfaf3] text-[10px] font-bold uppercase tracking-widest shadow-md">
              <Camera size={12} />
              {selectedArchiveMonth 
                ? (() => {
                    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
                    return `${monthNames[selectedArchiveMonth.month]} ${selectedArchiveMonth.year}`;
                  })()
                : (() => {
                    const now = new Date();
                    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
                    return `Текущий месяц: ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
                  })()
              }
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#5c4a33] tracking-tight">
              {selectedArchiveMonth ? 'Архивные воспоминания' : 'Слепки моментов'}
            </h1>
            <p className="text-[#8b7355] italic text-lg max-w-xl">
              {selectedArchiveMonth 
                ? "Вспомни, как было тогда..." 
                : "Каждый кадр — это живой кусочек нашей истории, приколотый к доске вечности."
              }
            </p>
          </div>
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <div className="bg-[#fdfaf3] p-4 rounded-[2rem] border-8 border-[#e6d5bc]/30 shadow-[15px_15px_40px_rgba(0,0,0,0.08)] flex items-center justify-between relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#5c4a33] shadow-sm border-4 border-[#e6d5bc]">
                  <ImageIcon size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-[#8b7355] tracking-widest">
                    {selectedArchiveMonth ? 'В этом месяце' : 'В этом месяце'}
                  </p>
                  <p className="text-xl font-bold text-[#5c4a33]">{displayMoments.length} фото</p>
                </div>
              </div>
              {!selectedArchiveMonth && (
                <>
                  <div className="h-10 w-px bg-[#e6d5bc] relative z-10" />
                  <div className="text-right relative z-10">
                    <p className="text-[10px] font-black uppercase text-[#8b7355] tracking-widest">Новых за неделю</p>
                    <p className="text-xl font-bold text-[#5c4a33]">+{getNewThisWeekCount()}</p>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-4">
              {selectedArchiveMonth ? (
                <button
                  onClick={() => {
                    setSelectedArchiveMonth(null);
                    setArchiveMoments([]); // Теперь эта функция определена
                  }}
                  className="flex items-center justify-center gap-2 bg-[#e6d5bc] border-8 border-[#8b7355]/20 px-6 py-4 rounded-[2rem] text-sm font-black uppercase tracking-widest shadow-[15px_15px_40px_rgba(0,0,0,0.08)] hover:scale-105 transition-all text-[#5c4a33] group active:scale-95 relative overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                  <ArrowLeft size={18} className="text-[#5c4a33] group-hover:-translate-x-1 transition-transform relative z-10" />
                  <span className="relative z-10">Вернуться</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsArchiveOpen(true)}
                  className="flex items-center justify-center gap-2 bg-[#e6d5bc] border-8 border-[#8b7355]/20 px-6 py-4 rounded-[2rem] text-sm font-black uppercase tracking-widest shadow-[15px_15px_40px_rgba(0,0,0,0.08)] hover:scale-105 transition-all text-[#5c4a33] group active:scale-95 relative overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                  <Archive size={18} className="text-[#5c4a33] group-hover:rotate-12 transition-transform relative z-10" />
                  <span className="relative z-10">Архив</span>
                </button>
              )}
              <button
                onClick={showRandomMemory}
                className="flex-1 flex items-center justify-center gap-2 bg-[#fdfaf3] border-8 border-[#e6d5bc]/30 px-6 py-4 rounded-[2rem] text-sm font-black uppercase tracking-widest shadow-[15px_15px_40px_rgba(0,0,0,0.08)] hover:scale-105 transition-all text-[#5c4a33] group active:scale-95 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                <Sparkles size={18} className="text-amber-500 group-hover:rotate-12 transition-transform relative z-10" />
                <span className="relative z-10">Вспомнить</span>
              </button>
              {!selectedArchiveMonth && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#5c4a33] px-6 py-4 rounded-[2rem] text-[#fdfaf3] font-black uppercase tracking-widest shadow-[20px_20px_60px_rgba(0,0,0,0.15)] hover:shadow-[25px_25px_70px_rgba(0,0,0,0.2)] hover:scale-105 transition-all text-sm active:scale-95">
                  <Plus size={20} />
                  Снять
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Toolbar - Palia Style */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch md:items-center justify-between bg-[#fdfaf3] p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border-4 md:border-8 border-[#e6d5bc]/30 shadow-md md:shadow-[15px_15px_40px_rgba(0,0,0,0.08)] relative overflow-hidden">
          {/* Paper texture overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />

          <div className="flex items-center gap-3 w-full md:w-auto relative z-10">
            <div className="flex items-center gap-2 p-2 bg-[#f5e6d3] rounded-[1.5rem] overflow-x-auto no-scrollbar touch-pan-x w-full md:max-w-lg border-2 md:border-4 border-[#e6d5bc]">
              {galleryCategories.map((cat, index) => (
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
              className="p-3 md:p-3 rounded-2xl bg-[#f5e6d3] text-[#5c4a33] border-2 md:border-4 border-[#e6d5bc] hover:bg-white transition-all shadow-sm shrink-0 hover:scale-105 active:scale-95">
              <Settings2 size={18} />
            </button>
          </div>

          <div className="relative w-full md:w-80 group relative z-10">
            <div className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 p-1.5 md:p-2 rounded-full bg-[#f5e6d3]">
              <Search className="text-[#8b7355] group-focus-within:text-[#5c4a33] transition-colors" size={16} />
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск момента..."
              className="w-full bg-white border-2 md:border-4 border-[#e6d5bc] rounded-[1.5rem] pl-14 md:pl-16 pr-4 md:pr-6 py-3 md:py-4 text-xs md:text-sm focus:ring-0 focus:border-[#5c4a33] transition-all placeholder:text-[#8b7355]/40 font-bold text-[#5c4a33] shadow-inner"
            />
          </div>
        </div>

        {/* Grid - Cozy Board Style */}
        <div className="relative p-4 md:p-12 bg-[#fdfaf3] rounded-[2rem] md:rounded-[3rem] border-4 md:border-8 border-[#e6d5bc]/30 shadow-[inset_10px_10px_40px_rgba(0,0,0,0.05)] min-h-[400px] md:min-h-[600px] overflow-hidden">
          {/* Grid pattern for the board */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/cork-board.png')]" />
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#5c4a33_1px,transparent_1px)] [background-size:60px_60px]" />

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-6 md:gap-y-16 gap-x-4 md:gap-x-12 justify-items-center relative z-10 pt-6 md:pt-10">
            {(isLoading || isMomentsLoading) ? (
              // Skeleton loading state
              Array.from({ length: 8 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="w-full max-w-[280px] h-auto min-h-[220px] md:min-h-[380px] bg-white p-2 md:p-4 shadow-lg space-y-2 md:space-y-4">
                  <Skeleton className="w-full aspect-square" />
                  <Skeleton className="h-3 md:h-4 w-3/4 mx-auto" />
                  <Skeleton className="h-2 md:h-3 w-1/2 mx-auto" />
                </div>
              ))
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredMoments.map((moment, idx) => (
                  <motion.div
                    key={moment.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedPhoto(moment)}
                    className="cursor-pointer group relative w-full flex justify-center">
                    <div className="hidden md:flex absolute inset-0 z-20 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="p-4 rounded-full bg-[#5c4a33]/80 backdrop-blur-md text-[#fdfaf3] shadow-2xl">
                        <Maximize2 size={24} />
                      </div>
                    </div>
                    <PolaroidCard {...moment} />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Empty State */}
          {!isLoading && !isMomentsLoading && filteredMoments.length === 0 && (
            <div className="text-center py-20 md:py-32 space-y-6 relative z-10">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-[#e6d5bc] rounded-full flex items-center justify-center mx-auto text-[#8b7355] shadow-inner border-4 border-[#e6d5bc]/50">
                <Camera size={48} />
              </div>
              <div className="space-y-2">
                <p className="text-[#5c4a33] font-serif italic text-xl md:text-2xl">Альбом пока пуст...</p>
                <p className="text-[#8b7355] font-bold uppercase text-[10px] tracking-widest">Добавьте первый кадр вашей истории</p>
              </div>
            </div>
          )}
        </div>

        {/* Random Memory Modal */}
        <AnimatePresence>
          {randomMoment && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setRandomMoment(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 0 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 0 }}
                className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto no-scrollbar"
              >
                {/* Decorative Background */}
                <div className="absolute -inset-10 bg-gradient-to-br from-amber-400/10 via-transparent to-pink-400/10 rounded-full blur-3xl opacity-60" />
                
                <div className="relative z-10">
                  <button
                    onClick={() => setRandomMoment(null)}
                    className="absolute top-4 right-4 md:-top-16 md:right-0 p-3 rounded-2xl bg-[#fdfaf3]/90 text-[#5c4a33] hover:bg-[#fdfaf3] transition-all shadow-lg border-4 border-[#e6d5bc] backdrop-blur-sm z-50"
                  >
                    <X size={20} className="md:w-6 md:h-6" />
                  </button>
                  
                  <div className="bg-[#fdfaf3] rounded-[2rem] md:rounded-[3rem] border-4 md:border-[12px] border-[#e6d5bc] shadow-2xl overflow-hidden">
                    <div className="flex flex-col md:flex-row items-stretch">
                      {/* Left - Photo */}
                      <div className="flex-1 p-6 md:p-8 flex items-start justify-center bg-[#f5e6d3] pt-12 md:pt-8 pb-12 md:pb-16">
                        <div className="w-full max-w-[240px] md:max-w-xs">
                          <PolaroidCard {...randomMoment} />
                        </div>
                      </div>
                      
                      {/* Right - Info */}
                      <div className="flex-1 p-6 md:p-10 flex flex-col justify-center items-center bg-[#fdfaf3]">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-[#5c4a33] text-[#fdfaf3] text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-6 md:mb-8">
                          <Sparkles size={12} className="text-amber-300 md:w-3.5 md:h-3.5" />
                          Случайное воспоминание
                        </div>
                        
                        <h2 className="text-2xl md:text-4xl font-serif font-bold text-[#5c4a33] mb-4 md:mb-6 leading-tight text-center px-2">
                          {randomMoment.caption}
                        </h2>
                        
                        <div className="flex items-center justify-center gap-4 md:gap-6 mb-6 md:mb-8">
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="p-2 md:p-3 rounded-full bg-[#f5e6d3] border-2 md:border-4 border-[#e6d5bc]">
                              <Calendar size={16} className="text-[#8b7355] md:w-5 md:h-5" />
                            </div>
                            <div>
                              <p className="text-[8px] md:text-[10px] font-black uppercase text-[#8b7355] tracking-widest text-center">Дата</p>
                              <p className="text-sm md:text-lg font-bold text-[#5c4a33] text-center">{randomMoment.date}</p>
                            </div>
                          </div>
                          <div className="w-px h-10 md:h-12 bg-[#e6d5bc]"></div>
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="p-2 md:p-3 rounded-full bg-[#f5e6d3] border-2 md:border-4 border-[#e6d5bc]">
                              <User size={16} className="text-[#8b7355] md:w-5 md:h-5" />
                            </div>
                            <div>
                              <p className="text-[8px] md:text-[10px] font-black uppercase text-[#8b7355] tracking-widest text-center">Автор</p>
                              <p className="text-sm md:text-lg font-bold text-[#5c4a33] text-center">{randomMoment.author}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 md:space-y-3 text-center w-full">
                          <p className="text-[9px] md:text-[11px] font-black uppercase text-[#8b7355] tracking-[0.3em] mb-1 md:mb-2">Категория</p>
                          <div className="flex justify-center flex-wrap gap-2">
                            <span className="px-4 py-2 md:px-6 md:py-3 rounded-full bg-[#f5e6d3] text-[#5c4a33] text-xs md:text-sm font-bold border-2 md:border-4 border-[#e6d5bc]">
                              {randomMoment.category}
                            </span>
                          </div>
                        </div>
                        
                        {/* Decorative Divider */}
                        <div className="flex items-center gap-2 md:gap-3 mt-8 md:mt-10 pt-4 md:pt-6 border-t-2 md:border-t-4 border-[#e6d5bc] w-full">
                          <div className="h-[1px] md:h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#e6d5bc] to-transparent" />
                          <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#e6d5bc]" />
                          <div className="h-[1px] md:h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#e6d5bc] to-transparent" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Add Moment Modal - Palia Style */}
        <AnimatePresence>
          {isAddModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAddModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-4xl bg-[#fdfaf3] rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden border-4 md:border-[12px] border-[#e6d5bc] max-h-[95vh] overflow-y-auto no-scrollbar">
                {/* Background Texture */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />

                <div className="relative z-10 flex flex-col md:flex-row">
                  {/* Left Column - Upload Area */}
                  <div className="flex-1 bg-[#f5e6d3] p-6 md:p-12 flex flex-col items-center justify-center border-b-4 md:border-b-0 md:border-r-4 border-[#e6d5bc]/30">
                    <h3 className="text-xl md:text-2xl font-serif font-bold text-[#5c4a33] mb-4 md:mb-6 flex items-center gap-2">
                      <Camera size={20} className="text-[#8b7355] md:w-6 md:h-6" />
                      Фотография
                    </h3>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="w-full max-w-[200px] md:max-w-sm aspect-[3/4] bg-white border-2 md:border-4 border-dashed border-[#e6d5bc] rounded-[1.5rem] md:rounded-[2rem] cursor-pointer hover:bg-[#fdfaf3] hover:border-[#5c4a33]/30 transition-all overflow-hidden flex flex-col items-center justify-center gap-3 md:gap-4 group"
                    >
                      {newMoment.src ? (
                        <div className="w-full h-full relative">
                          <NextImage
                            src={newMoment.src}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-bold text-xs md:text-sm">Изменить</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-[#f5e6d3] shadow-inner flex items-center justify-center text-[#5c4a33]">
                            <Upload size={32} className="md:w-10 md:h-10" />
                          </div>
                          <div className="text-center px-4">
                            <p className="text-xs md:text-sm font-bold text-[#5c4a33]">Выбрать файл</p>
                            <p className="text-[8px] md:text-[10px] text-[#8b7355] uppercase tracking-widest">PNG, JPG до 10MB</p>
                          </div>
                        </>
                      )}
                    </label>
                  </div>

                  {/* Right Column - Form */}
                  <div className="flex-1 p-6 md:p-12 flex flex-col justify-between space-y-6 md:space-y-0">
                    <div className="space-y-6 md:space-y-8">
                      <div className="flex justify-between items-start">
                        <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#5c4a33]">Новый момент</h3>
                        <button
                          onClick={() => setIsAddModalOpen(false)}
                          className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-[#f5e6d3] text-[#5c4a33] hover:bg-[#e6d5bc] transition-all"
                        >
                          <X size={20} className="md:w-6 md:h-6" />
                        </button>
                      </div>

                      <div className="space-y-6 md:space-y-8">
                        {/* Caption Field */}
                        <div className="space-y-3 md:space-y-5">
                          <label className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] text-[#8b7355]">
                            Что на фото?
                          </label>
                          <div className="relative">
                            <div className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 p-1.5 md:p-2 rounded-full bg-[#f5e6d3]">
                              <ImageIcon size={16} className="text-[#8b7355] md:w-[18px] md:h-[18px]" />
                            </div>
                            <input
                              type="text"
                              value={newMoment.caption}
                              onChange={(e) => setNewMoment({ ...newMoment, caption: e.target.value })}
                              placeholder="Краткое описание..."
                              className="w-full bg-white border-2 md:border-4 border-[#e6d5bc] rounded-[1.2rem] md:rounded-[1.5rem] pl-14 md:pl-16 pr-4 md:pr-6 py-4 md:py-5 focus:ring-0 focus:border-[#5c4a33] transition-all text-xs md:text-sm font-bold text-[#5c4a33]"
                            />
                          </div>
                        </div>

                        {/* Category Selector */}
                        <div className="space-y-3 md:space-y-5 text-center">
                          <label className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] text-[#8b7355] text-center block">
                            выберите категорию
                          </label>
                          <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
                            {galleryCategories
                              .filter((c) => c !== 'Все')
                              .map((cat) => (
                                <button
                                  key={cat}
                                  onClick={() => setNewMoment({ ...newMoment, category: cat })}
                                  className={cn(
                                    "px-4 py-2 md:px-6 md:py-3 rounded-[1rem] md:rounded-[1.25rem] text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all",
                                    newMoment.category === cat
                                      ? "bg-[#5c4a33] text-[#fdfaf3] shadow-lg"
                                      : "bg-[#f5e6d3] text-[#8b7355] hover:bg-[#e6d5bc]"
                                  )}
                                >
                                  {cat}
                                </button>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={addMoment}
                      disabled={!newMoment.src || !newMoment.caption || isUploading}
                      className="w-full py-4 md:py-6 rounded-[1.5rem] md:rounded-[2rem] bg-[#5c4a33] text-[#fdfaf3] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 md:gap-3 mt-6 md:mt-12 text-xs md:text-base"
                    >
                      {isUploading ? (
                        <RefreshCw size={18} className="animate-spin md:w-5 md:h-5" />
                      ) : (
                        <Sparkles size={18} className="md:w-5 md:h-5" />
                      )}
                      {isUploading ? 'Загружаем...' : 'Запечатлеть'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Photo Detail View Modal - Palia Style */}
        <AnimatePresence>
          {selectedPhoto && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setSelectedPhoto(null);
                  setShowCategorySelector(false);
                }}
                className="absolute inset-0 bg-black/60 backdrop-blur-xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 0 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 0 }}
                className="relative w-full max-w-5xl max-h-[95vh] overflow-y-auto no-scrollbar"
              >
                {/* Decorative Background */}
                <div className="absolute -inset-10 bg-gradient-to-br from-amber-400/10 via-transparent to-pink-400/10 rounded-full blur-3xl opacity-60" />
                
                <div className="relative z-10">
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="absolute top-4 right-4 md:-top-16 md:right-0 p-3 rounded-2xl bg-[#fdfaf3]/90 text-[#5c4a33] hover:bg-[#fdfaf3] transition-all shadow-lg border-4 border-[#e6d5bc] backdrop-blur-sm z-50">
                    <X size={20} className="md:w-6 md:h-6" />
                  </button>
                  
                  <div className="bg-[#fdfaf3] rounded-[2rem] md:rounded-[3rem] border-4 md:border-[12px] border-[#e6d5bc] shadow-2xl overflow-hidden">
                    <div className="flex flex-col md:flex-row items-stretch">
                      {/* Left - Photo */}
                      <div className="flex-1 p-6 md:p-8 flex items-start justify-center bg-[#f5e6d3] pt-12 md:pt-8 pb-12 md:pb-16 border-b-4 md:border-b-0 md:border-r-4 border-[#e6d5bc]/30">
                        <div className="w-full max-w-[240px] md:max-w-xs">
                          <PolaroidCard {...selectedPhoto} rotate={0} />
                        </div>
                      </div>
                      
                      {/* Right - Info & Edit */}
                      <div className="flex-1 p-6 md:p-10 flex flex-col items-center justify-start bg-[#fdfaf3]">
                        <div className="space-y-5 md:space-y-6 w-full">
                          {/* Header with change category button */}
                          <div className="flex flex-col md:flex-row items-center md:items-start justify-between w-full gap-4">
                            {/* Left: Category & Title - centered */}
                            <div className="flex-1 text-center md:text-left space-y-2 md:space-y-3">
                              {/* Title */}
                              <h2 className="text-2xl md:text-4xl font-serif font-bold text-[#5c4a33] leading-tight px-2 md:px-0">
                                {selectedPhoto.caption}
                              </h2>
                              {/* Date & Author - nicer styling */}
                              <div className="flex items-center justify-center md:justify-start gap-3 md:gap-4 pt-1 md:pt-2">
                                <div className="flex items-center gap-1.5 md:gap-2">
                                  <Calendar size={14} className="text-[#8b7355] md:w-[18px] md:h-[18px]" />
                                  <span className="text-xs md:text-sm text-[#5c4a33] font-bold">{selectedPhoto.date}</span>
                                </div>
                                <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-[#e6d5bc]"></div>
                                <div className="flex items-center gap-1.5 md:gap-2">
                                  <User size={14} className="text-[#8b7355] md:w-[18px] md:h-[18px]" />
                                  <span className="text-xs md:text-sm text-[#5c4a33] font-bold">{selectedPhoto.author}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Right: Change category button */}
                            <div className="shrink-0">
                              <button
                                onClick={() => setShowCategorySelector(!showCategorySelector)}
                                className="flex items-center gap-2 px-4 py-2 md:px-4 md:py-2 rounded-full bg-[#f5e6d3] text-[#8b7355] hover:bg-[#e6d5bc] hover:text-[#5c4a33] transition-all border-2 md:border-4 border-transparent hover:border-[#e6d5bc] shadow-sm">
                                <Tag size={14} className="md:w-4 md:h-4" />
                                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">
                                  {showCategorySelector ? "Скрыть" : "Сменить"}
                                </span>
                              </button>
                            </div>
                          </div>
                          
                          {/* Collapsible Category Selector */}
                          <AnimatePresence>
                            {showCategorySelector && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="pt-4 border-t-2 border-[#e6d5bc]">
                                  <p className="text-[9px] md:text-[11px] font-black uppercase text-[#8b7355] tracking-[0.3em] mb-3 text-center">Выберите категорию</p>
                                  <div className="flex flex-wrap gap-2 justify-center">
                                    {galleryCategories
                                      .filter((c) => c !== 'Все')
                                      .map((cat) => (
                                        <button
                                          key={cat}
                                          onClick={() => {
                                            updateMomentCategory(selectedPhoto, cat);
                                            setShowCategorySelector(false);
                                          }}
                                          className={cn(
                                            "px-4 py-2 md:px-5 md:py-2 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all border-2 md:border-3",
                                            selectedPhoto.category === cat
                                              ? "bg-[#5c4a33] text-[#fdfaf3] border-[#5c4a33] shadow-lg"
                                              : "bg-[#f5e6d3] text-[#8b7355] border-transparent hover:bg-[#e6d5bc] hover:text-[#5c4a33]"
                                          )}>
                                          {cat}
                                        </button>
                                      ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                            {!showCategorySelector && (
                              <div className="pt-4 border-t-2 border-[#e6d5bc] text-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-[#f5e6d3] border-2 border-[#e6d5bc]/30">
                                  <span className="text-[9px] md:text-[11px] font-black uppercase text-[#8b7355] tracking-widest">Категория</span>
                                  <span className="text-xs md:text-sm font-bold text-[#5c4a33]">- {selectedPhoto.category}</span>
                                </div>
                              </div>
                            )}
                          </AnimatePresence>
                          
                          {/* Decorative Divider */}
                          <div className="flex items-center gap-2 md:gap-3 mt-4 md:mt-6 pt-4 md:pt-6 border-t-2 md:border-t-4 border-[#e6d5bc] w-full">
                            <div className="h-[1px] md:h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#e6d5bc] to-transparent" />
                            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#e6d5bc]" />
                            <div className="h-[1px] md:h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#e6d5bc] to-transparent" />
                          </div>
                          
                          {/* Actions */}
                          <div className="flex flex-col gap-3 pt-2 md:pt-4">
                            <button
                              onClick={() => downloadPhoto(selectedPhoto.src, `moment-${selectedPhoto.date}.png`)}
                              className="w-full py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] bg-[#5c4a33] text-[#fdfaf3] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 text-xs md:text-base">
                              <Download size={18} className="md:w-5 md:h-5" />
                              Сохранить
                            </button>
                            <button
                              onClick={() => setPhotoToDelete(selectedPhoto)}
                              className="w-full py-3 md:py-4 rounded-xl md:rounded-2xl bg-[#f5e6d3] text-red-500 font-black uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2 border-2 md:border-4 border-transparent hover:border-red-100 text-[10px] md:text-xs">
                              <Trash2 size={16} className="md:w-[18px] md:h-[18px]" />
                              Стереть момент
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Photo Delete Confirmation Modal - Palia Style */}
        <AnimatePresence>
          {photoToDelete && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setPhotoToDelete(null)}
                className="absolute inset-0 bg-black/40 backdrop-blur-xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm bg-[#fdfaf3] rounded-[2rem] md:rounded-[3rem] shadow-2xl p-6 md:p-8 text-center space-y-4 md:space-y-6 border-4 md:border-[12px] border-[#e6d5bc]">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-red-50 text-red-400 rounded-2xl md:rounded-full flex items-center justify-center mx-auto border-2 md:border-4 border-red-100 shadow-inner">
                  <Trash2 size={32} className="md:w-10 md:h-10" />
                </div>
                <div className="space-y-1 md:space-y-2">
                  <h3 className="text-lg md:text-xl font-bold text-[#5c4a33]">Удалить это фото?</h3>
                  <p className="text-xs md:text-sm text-[#8b7355] leading-relaxed">
                    Это действие нельзя будет отменить. Вы уверены, что хотите стереть это воспоминание?
                  </p>
                </div>
                <div className="flex gap-2 md:gap-3">
                  <button
                    onClick={() => setPhotoToDelete(null)}
                    className="flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl bg-[#f5e6d3] text-[#5c4a33] font-bold hover:bg-[#e6d5bc] transition-all border-2 md:border-4 border-[#e6d5bc] text-xs md:text-sm">
                    Отмена
                  </button>
                  <button
                    onClick={() => confirmDeletePhoto(photoToDelete)}
                    className="flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl bg-red-500 text-white font-bold shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all text-xs md:text-sm">
                    Удалить
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Manage Categories Modal - Palia Style */}
        <AnimatePresence>
          {isManagingCategories && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
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
                className="relative w-full max-w-md bg-[#fdfaf3] rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden p-6 md:p-8 space-y-6 md:space-y-8 border-4 md:border-[12px] border-[#e6d5bc] max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center shrink-0">
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-[#5c4a33] flex items-center gap-2 md:gap-3">
                    <Tag className="text-[#8b7355] md:w-6 md:h-6" />
                    Категории
                  </h3>
                  <button
                    onClick={() => setIsManagingCategories(false)}
                    className="p-2 rounded-full bg-[#f5e6d3] text-[#5c4a33] hover:bg-[#e6d5bc] transition-all">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4 md:space-y-6 flex-1 overflow-hidden flex flex-col">
                  <div className="flex gap-2 shrink-0">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Новая..."
                      className="flex-1 bg-white border-2 md:border-4 border-[#e6d5bc] rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 focus:ring-0 focus:border-[#5c4a33] transition-all text-xs md:text-sm font-bold text-[#5c4a33]"
                      onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                    />
                    <button
                      onClick={addCategory}
                      disabled={!newCategoryName.trim()}
                      className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-[#5c4a33] text-[#fdfaf3] shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                      <Plus size={20} />
                    </button>
                  </div>

                  <div className="space-y-2 md:space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                    {galleryCategories.map((cat) => (
                      <div
                        key={cat}
                        className="flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl bg-[#f5e6d3] border-2 md:border-4 border-[#e6d5bc] group">
                        <span className="text-xs md:text-sm font-bold text-[#5c4a33] uppercase tracking-widest">{cat}</span>
                        {cat !== 'Все' && (
                          <button
                            onClick={() => setCategoryToDelete(cat)}
                            className="p-1.5 md:p-2 text-[#8b7355] hover:text-red-500 transition-colors">
                            <Trash2 size={14} className="md:w-4 md:h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setIsManagingCategories(false)}
                  className="w-full py-3 md:py-4 rounded-xl md:rounded-2xl bg-[#f5e6d3] text-[#5c4a33] font-bold hover:bg-[#e6d5bc] transition-all border-2 md:border-4 border-[#e6d5bc] shrink-0 text-sm">
                  Готово
                </button>
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
                className="relative w-full max-w-sm bg-[#fdfaf3] rounded-[2rem] md:rounded-[3rem] shadow-2xl p-6 md:p-8 text-center space-y-4 md:space-y-6 border-4 md:border-[12px] border-[#e6d5bc]">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-red-50 text-red-400 rounded-2xl md:rounded-full flex items-center justify-center mx-auto border-2 md:border-4 border-red-100 shadow-inner">
                  <Tag size={32} className="md:w-10 md:h-10" />
                </div>
                <div className="space-y-1 md:space-y-2">
                  <h3 className="text-lg md:text-xl font-bold text-[#5c4a33]">Удалить категорию?</h3>
                  <p className="text-xs md:text-sm text-[#8b7355] leading-relaxed">
                    Вы уверены, что хотите удалить категорию <span className="font-bold text-[#5c4a33]">«{categoryToDelete}»</span>?
                    {moments.filter((m) => m.category === categoryToDelete).length > 0 && (
                      <div className="mt-1 md:mt-2">В ней находится <span className="text-red-500 font-bold">{moments.filter((m) => m.category === categoryToDelete).length}</span> фото.</div>
                    )}
                  </p>
                </div>
                <div className="flex gap-2 md:gap-3">
                  <button
                    onClick={() => setCategoryToDelete(null)}
                    className="flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl bg-[#f5e6d3] text-[#5c4a33] font-bold hover:bg-[#e6d5bc] transition-all border-2 md:border-4 border-[#e6d5bc] text-xs md:text-sm">
                    Отмена
                  </button>
                  <button
                    onClick={() => deleteCategory(categoryToDelete)}
                    className="flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl bg-red-500 text-white font-bold shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all text-xs md:text-sm">
                    Удалить
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Archive Modal - Palia Style */}
        <AnimatePresence>
          {isArchiveOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setIsArchiveOpen(false);
                  setSelectedArchiveMonth(null);
                }}
                className="absolute inset-0 bg-black/60 backdrop-blur-xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-6xl max-h-[90vh] bg-[#fdfaf3] rounded-[3rem] shadow-2xl overflow-hidden border-[12px] border-[#e6d5bc]"
              >
                {/* Archive Header */}
                <div className="bg-[#f5e6d3] p-8 border-b-[12px] border-[#e6d5bc]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => {
                          if (selectedArchiveMonth) {
                            setSelectedArchiveMonth(null);
                            setLocalArchiveMoments([]);
                          } else {
                            setIsArchiveOpen(false);
                          }
                        }}
                        className="p-3 rounded-2xl bg-[#fdfaf3] text-[#5c4a33] hover:bg-white transition-all border-4 border-[#e6d5bc] shrink-0">
                        <ArrowLeft size={24} />
                      </button>
                      <div>
                        <h3 className="text-3xl font-serif font-bold text-[#5c4a33] flex items-center gap-3">
                          <Archive className="text-[#8b7355]" />
                          {selectedArchiveMonth 
                            ? (() => {
                                const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
                                return `${monthNames[selectedArchiveMonth.month]} ${selectedArchiveMonth.year}`;
                              })()
                            : 'Архив воспоминаний'
                          }
                        </h3>
                        {!selectedArchiveMonth && (
                          <p className="text-[#8b7355] mt-2 text-sm">Выберите месяц, чтобы увидеть фотографии</p>
                        )}
                      </div>
                    </div>
                    {!selectedArchiveMonth && (
                      <button
                        onClick={() => setIsArchiveOpen(false)}
                        className="p-3 rounded-2xl bg-[#fdfaf3] text-[#5c4a33] hover:bg-white transition-all border-4 border-[#e6d5bc]">
                        <X size={24} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Archive Content */}
                <div className="p-8 max-h-[60vh] overflow-y-auto">
                  {!selectedArchiveMonth ? (
                    /* Month Selection */
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {archiveMonthsList.map((month) => (
                        <button
                          key={month.id}
                          onClick={() => {
                            setSelectedArchiveMonth({ year: month.year, month: month.month });
                            loadLocalArchiveMonth(month.year, month.month);
                            setIsArchiveOpen(false);
                          }}
                          className="p-6 rounded-[2rem] bg-[#f5e6d3] border-[12px] border-[#e6d5bc]/30 hover:border-[#e6d5bc] hover:shadow-xl hover:scale-[1.02] transition-all text-left group relative overflow-hidden"
                        >
                          <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                          <div className="relative z-10">
                            <p className="text-2xl font-serif font-bold text-[#5c4a33] mb-2">{month.name}</p>
                            <div className="flex items-center gap-2 text-[#8b7355]">
                              <Camera size={16} />
                              <span className="text-sm font-bold uppercase tracking-widest">{month.moments_count} фото</span>
                            </div>
                          </div>
                        </button>
                      ))}
                      {archiveMonthsList.length === 0 && (
                        <div className="col-span-full text-center py-20">
                          <div className="w-20 h-20 bg-[#e6d5bc] rounded-full flex items-center justify-center mx-auto text-[#8b7355] shadow-inner border-4 border-[#e6d5bc]/50 mb-6">
                            <Archive size={48} />
                          </div>
                          <p className="text-[#5c4a33] font-serif italic text-xl mb-2">Архив пока пуст...</p>
                          <p className="text-[#8b7355] font-bold uppercase text-[10px] tracking-widest">Фотографии текущего месяца появятся здесь в следующем месяце</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Archive Photo Grid */
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {localArchiveMoments.length > 0 ? (
                        localArchiveMoments.map((moment) => (
                          <div 
                            key={moment.id}
                            onClick={() => setSelectedPhoto(moment)}
                            className="cursor-pointer"
                          >
                            <PolaroidCard {...moment} />
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-20">
                          <div className="w-20 h-20 bg-[#e6d5bc] rounded-full flex items-center justify-center mx-auto text-[#8b7355] shadow-inner border-4 border-[#e6d5bc]/50 mb-6">
                            <Camera size={48} />
                          </div>
                          <p className="text-[#5c4a33] font-serif italic text-xl mb-2">В этом месяце нет фотографий...</p>
                          <p className="text-[#8b7355] font-bold uppercase text-[10px] tracking-widest">Выберите другой месяц</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
