'use client';

import { useState, useRef, useEffect } from 'react';
import { Mail, Send, Archive, Sparkles, Lock, Unlock, ChevronLeft, ChevronRight, X, Calendar, Trees, Moon, Trash2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useData } from '@/components/DataProvider';
import { useEra } from '@/context/EraContext';

const getMockWhispers = () => [];

export default function StatsPage() {
  const { currentUser, spaceConfig, whispers: realWhispers, refreshWhispers, isLoading } = useData();
  const { setIsUIHidden } = useEra();
  
  // Mock data for archive (bottom part) - CLEARED
  const mockArchiveWhispers: any[] = [];

  // Send Whisper State
  const [whisperText, setWhisperText] = useState("");
  const [isSent, setIsSent] = useState(false);
  
  // Receive Whisper State - START EMPTY
  const [incomingWhispers, setIncomingWhispers] = useState<any[]>([]);
  const [isWhisperModalOpen, setIsWhisperModalOpen] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [currentWhisperPage, setCurrentWhisperPage] = useState(0);
  const [selectedHistoryWhisper, setSelectedHistoryWhisper] = useState<any>(null);

  // Archive State
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [selectedArchiveMonth, setSelectedArchiveMonth] = useState<{ year: number; month: number } | null>(null);
  const [mockHistory, setMockHistory] = useState<any[]>([]);

  const whispers = (realWhispers.length === 0 ? [...mockArchiveWhispers, ...mockHistory] : realWhispers)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Hide navbar when modal is open
  useEffect(() => {
    if (isWhisperModalOpen || isArchiveOpen || selectedHistoryWhisper) {
      setIsUIHidden(true);
    } else {
      setIsUIHidden(false);
    }
    return () => setIsUIHidden(false);
  }, [isWhisperModalOpen, isArchiveOpen, selectedHistoryWhisper, setIsUIHidden]);

  // Check for incoming whispers
  const checkIncomingWhisper = async () => {
    if (!currentUser || !spaceConfig?.id) return;
    const key = currentUser === 'Grinch' ? 'whisper_for_grinch' : 'whisper_for_cindy';
    
    const { data, error } = await supabase
      .from('global_state')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (data && data.value) {
      // Handle both old single whisper format and new array format
      const val = data.value;
      let list = [];
      if (Array.isArray(val)) {
        list = val;
      } else {
        const content = typeof val === 'object' ? (val as any).text : val;
        list = [{ text: content, id: Date.now() }];
      }
      
      // Only replace mock data if we actually have real messages in DB
      if (list.length > 0) {
        setIncomingWhispers(list);
      }
    }
  };

  useEffect(() => {
    checkIncomingWhisper();
    const interval = setInterval(checkIncomingWhisper, 30000);
    return () => clearInterval(interval);
  }, [currentUser, spaceConfig]);

  // Pagination helper for long whispers
  const CHARS_PER_PAGE = 240;
  const getWhisperPages = (text: string) => {
    if (!text) return [""];
    const words = text.split(' ');
    const pages = [];
    let currentPage = "";

    words.forEach(word => {
      if ((currentPage + word).length > CHARS_PER_PAGE) {
        pages.push(currentPage.trim());
        currentPage = word + " ";
      } else {
        currentPage += word + " ";
      }
    });
    
    if (currentPage.trim()) pages.push(currentPage.trim());
    return pages.length > 0 ? pages : [""];
  };

  const currentWhisper = (selectedHistoryWhisper ? { text: selectedHistoryWhisper.content || selectedHistoryWhisper.text, id: selectedHistoryWhisper.id } : (incomingWhispers[0] || null));
  const whisperPages = getWhisperPages(currentWhisper?.text || "");

  const handleSendWhisper = async () => {
    if (!whisperText.trim() || !currentUser || !spaceConfig?.id) return;
    
    // Блокируем кнопку на время отправки
    setIsSent(true);
    
    const targetKey = currentUser === 'Grinch' ? 'whisper_for_cindy' : 'whisper_for_grinch';
    
    try {
      // 1. Fetch current array
      const { data: existingData } = await supabase
        .from('global_state')
        .select('value')
        .eq('key', targetKey)
        .maybeSingle();
      
      let currentList = [];
      if (existingData?.value) {
        currentList = Array.isArray(existingData.value) ? existingData.value : [existingData.value];
      }
      
      // 2. Append new whisper
      const newList = [...currentList, { 
        text: whisperText, 
        id: Date.now(),
        created_at: new Date().toISOString()
      }];
      
      // 3. Upsert back
      const { error } = await supabase
        .from('global_state')
        .upsert({
          key: targetKey,
          value: newList,
          space_id: spaceConfig.id,
          updated_at: new Date().toISOString()
        });

      if (!error) {
        setWhisperText("");
        // Показываем успех на 2 секунды, потом разрешаем писать снова
        setTimeout(() => setIsSent(false), 2000);
      } else {
        console.error('Error sending whisper:', error);
        setIsSent(false);
        alert('Ошибка при отправке письма: ' + JSON.stringify(error));
      }
    } catch (e) {
      console.error('Exception sending whisper:', e);
      setIsSent(false);
    }
  };

  const handleCloseWhisper = async () => {
    if (selectedHistoryWhisper) {
      setIsWhisperModalOpen(false);
      setSelectedHistoryWhisper(null);
      setIsRevealed(false);
      setCurrentWhisperPage(0);
      return;
    }

    if (!currentUser || !currentWhisper || !spaceConfig?.id) {
      setIsWhisperModalOpen(false);
      return;
    }

    // МГНОВЕННО обновляем UI, чтобы пользователь не ждал базу данных
    const whisperToArchive = { ...currentWhisper };
    const newList = incomingWhispers.filter((w: any) => w.id !== currentWhisper.id);
    
    setIncomingWhispers(newList);
    setIsWhisperModalOpen(false);
    setIsRevealed(false);
    setCurrentWhisperPage(0);

    // Выполняем тяжелые операции с БД в фоне
    (async () => {
      try {
        const key = currentUser === 'Grinch' ? 'whisper_for_grinch' : 'whisper_for_cindy';
        
        // 1. Сохраняем в историю
        const { error: historyError } = await supabase
          .from('whisper_history')
          .insert({
            sender: currentUser === 'Grinch' ? 'Cindy' : 'Grinch',
            receiver: currentUser,
            author: currentUser === 'Grinch' ? 'Cindy' : 'Grinch', // Добавлено обязательное поле
            content: whisperToArchive.text || whisperToArchive.content || '',
            space_id: spaceConfig.id,
            created_at: whisperToArchive.created_at || new Date().toISOString()
          });

        if (historyError) {
          console.error('Background history save error:', historyError);
        }

        // 2. Удаляем из очереди
        const { data: currentGlobalData } = await supabase
          .from('global_state')
          .select('value')
          .eq('key', key)
          .maybeSingle();

        if (currentGlobalData?.value) {
          let dbList = Array.isArray(currentGlobalData.value) ? currentGlobalData.value : [currentGlobalData.value];
          const updatedDbList = dbList.filter((w: any) => w.id !== whisperToArchive.id);
          
          if (updatedDbList.length > 0) {
            await supabase
              .from('global_state')
              .upsert({
                key: key,
                value: updatedDbList,
                space_id: spaceConfig.id,
                updated_at: new Date().toISOString()
              }, { onConflict: 'key' });
          } else {
            await supabase.from('global_state').delete().eq('key', key);
          }
        }
        
        // Обновляем архив в фоне
        refreshWhispers();
      } catch (e) {
        console.error('Background whisper processing error:', e);
      }
    })();
  };

  // Archive logic
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

    const months = new Map<string, { year: number; month: number; count: number }>();
    
    whispers.forEach(whisper => {
      const date = new Date(whisper.created_at);
      const dateUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
      
      // Пропускаем текущий период
      if (dateUTC >= currentPeriodStartUTC) return;

      const year = date.getFullYear();
      const month = date.getMonth();
      const key = `${year}-${month}`;
      
      const current = months.get(key);
      if (current) current.count++;
      else months.set(key, { year, month, count: 1 });
    });
    
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    
    return Array.from(months.values())
      .sort((a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month)
      .map(m => ({
        id: `${m.year}-${m.month}`,
        name: `${monthNames[m.month]} ${m.year}`,
        year: m.year,
        month: m.month,
        count: m.count
      }));
  };

  const archiveMonthsList = getArchiveMonths();

  const getDisplayWhispers = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    if (selectedArchiveMonth) {
      return whispers.filter(w => {
        const d = new Date(w.created_at);
        return d.getFullYear() === selectedArchiveMonth.year && d.getMonth() === selectedArchiveMonth.month;
      });
    }

    let startDate;
    if (currentDay >= 20) {
      startDate = new Date(currentYear, currentMonth, 20);
    } else {
      startDate = new Date(currentYear, currentMonth - 1, 20);
    }
    const startDateUTC = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0);

    return whispers.filter(w => {
      const d = new Date(w.created_at);
      const dUTC = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      return dUTC >= startDateUTC;
    });
  };

  const displayWhispers = getDisplayWhispers();

  const currentMonthName = () => {
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    if (selectedArchiveMonth) {
      return `${monthNames[selectedArchiveMonth.month]} ${selectedArchiveMonth.year}`;
    }
    return `${monthNames[new Date().getMonth()]} ${new Date().getFullYear()}`;
  };

  const getChronicleDate = () => {
    const now = new Date();
    const monthNames = ['Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь', 'Январь', 'Февраль', 'Март', 'Апрель', 'Май'];
    // Adjusting index because JS months are 0-11
    const monthNamesCorrect = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    const month = monthNamesCorrect[now.getMonth()];
    const year = now.getFullYear();
    return `Наша летопись — ${month} ${year}`;
  };

  return (
    <div className="relative min-h-screen bg-[#fdfaf3] md:py-20 py-6 md:pb-40 pb-40">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#f0f9ff]/50 via-transparent to-[#fdf2f8]/50" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#0ea5e9]/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#ec4899]/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 space-y-10 md:space-y-16">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="md:hidden flex flex-col gap-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5c4a33] text-[#fdfaf3] text-[9px] font-bold uppercase tracking-widest shadow-md">
              <Sparkles size={10} className="text-[#fdfaf3]" />
              {getChronicleDate()}
            </div>
            <h1 className="text-4xl font-serif font-black text-[#5c4a33] tracking-tight leading-tight">
              Тайные Письма
            </h1>
          </div>

          {/* Mobile Incoming Whisper Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#fdfaf3] p-5 rounded-[2rem] border-4 border-[#e6d5bc]/30 shadow-md relative overflow-hidden w-full group"
          >
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/5 via-transparent to-[#ec4899]/5 opacity-30" />
            
            <div className="relative z-10 flex items-center gap-4">
              <div className={cn(
                "w-16 h-16 rounded-[1.5rem] flex items-center justify-center border-2 shrink-0 transition-all duration-700 relative",
                incomingWhispers.length > 0 
                  ? "bg-white border-[#bae6fd] text-[#0ea5e9] shadow-[0_0_15px_rgba(14,165,233,0.2)]" 
                  : "bg-white border-[#e6d5bc] text-[#e6d5bc]"
              )}>
                <Mail size={24} className={cn(incomingWhispers.length > 0 && "animate-bounce")} />
                
                {/* Badge for multiple letters */}
                {incomingWhispers.length > 1 && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#5c4a33] text-white border-2 border-[#fdfaf3] flex items-center justify-center text-[10px] font-black shadow-md">
                    {incomingWhispers.length}
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-1.5">
                <h2 className="text-lg font-serif font-black text-[#5c4a33] leading-tight">
                  {incomingWhispers.length > 0 ? "Вам пришли письма!" : "Ящик пуст"}
                </h2>
                
                {incomingWhispers.length > 0 ? (
                  <button
                    onClick={() => setIsWhisperModalOpen(true)}
                    className="w-full mt-1 px-4 py-2 bg-[#5c4a33] text-[#fdfaf3] rounded-xl font-black uppercase tracking-widest text-[9px] shadow-md active:scale-95 transition-all"
                  >
                    Вскрыть
                  </button>
                ) : (
                  <p className="text-[#8b7355] italic font-serif text-xs leading-snug">
                    Ждем весточки.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Desktop Header (Hidden on Mobile) */}
        <header className="hidden md:flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5c4a33] text-[#fdfaf3] text-[10px] font-bold uppercase tracking-widest shadow-md">
              <Sparkles size={12} className="text-[#fdfaf3]" />
              {getChronicleDate()}
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-black text-[#5c4a33] tracking-tight">
              Тайные Письма
            </h1>
            <p className="text-[#8b7355] italic text-lg max-w-xl">
              Слова, сказанные сердцем, остаются в памяти навсегда.
            </p>
          </div>

          {/* Incoming Whisper Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#fdfaf3] p-6 rounded-[2.5rem] border-8 border-[#e6d5bc]/30 shadow-[15px_15px_40px_rgba(0,0,0,0.08)] relative overflow-hidden max-w-md w-full group"
          >
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/5 via-transparent to-[#ec4899]/5 opacity-30" />
            
            <div className="relative z-10 flex items-center gap-6">
              <div className={cn(
                "w-20 h-20 rounded-[2rem] flex items-center justify-center border-4 shrink-0 transition-all duration-700 relative",
                incomingWhispers.length > 0 
                  ? "bg-white border-[#bae6fd] text-[#0ea5e9] shadow-[0_0_20px_rgba(14,165,233,0.2)]" 
                  : "bg-white border-[#e6d5bc] text-[#e6d5bc]"
              )}>
                <Mail size={32} className={cn(incomingWhispers.length > 0 && "animate-bounce")} />
                
                {/* Badge for multiple letters */}
                {incomingWhispers.length > 1 && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#5c4a33] text-white border-4 border-[#fdfaf3] flex items-center justify-center text-xs font-black shadow-lg">
                    {incomingWhispers.length}
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-2">
                <h2 className="text-xl font-serif font-black text-[#5c4a33] leading-tight">
                  {incomingWhispers.length > 0 ? "Вам пришли письма!" : "Почтовый ящик пуст"}
                </h2>
                <p className="text-[#8b7355] italic font-serif text-sm leading-snug">
                  {incomingWhispers.length > 0 
                    ? `У тебя ${incomingWhispers.length} сокровенных ${incomingWhispers.length === 1 ? 'письма' : incomingWhispers.length < 5 ? 'письма' : 'писем'}.` 
                    : "Ждем весточки от любимого человека."}
                </p>
                
                {incomingWhispers.length > 0 && (
                  <button
                    onClick={() => setIsWhisperModalOpen(true)}
                    className="mt-2 px-6 py-2.5 bg-[#5c4a33] text-[#fdfaf3] rounded-[1.2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-lg hover:scale-105 active:scale-95 transition-all border-2 border-transparent hover:border-[#e6d5bc]"
                  >
                    Вскрыть
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
          {/* Left/Main Column: Send */}
          <div className="lg:col-span-2 space-y-6 md:space-y-10">
            {/* Send Whisper Card */}
            <div className="bg-[#fdfaf3] p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border-4 md:border-8 border-[#e6d5bc]/30 shadow-md md:shadow-[15px_15px_40px_rgba(0,0,0,0.08)] relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
              
              <div className="relative z-10 space-y-6 md:space-y-8">
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-5">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.2rem] md:rounded-[1.8rem] bg-[#5c4a33] text-[#fdfaf3] flex items-center justify-center shadow-lg border-2 md:border-4 border-[#e6d5bc] shrink-0 mx-auto md:mx-0">
                    <Send size={24} className="md:hidden" />
                    <Send size={28} className="hidden md:block" />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl md:text-3xl font-serif font-black text-[#5c4a33]">Отправить письмо</h3>
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#8b7355]">Тайное послание для любимых глаз</p>
                  </div>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <textarea 
                    value={whisperText}
                    onChange={(e) => setWhisperText(e.target.value)}
                    placeholder="Напиши что-то сокровенное..."
                    className="w-full h-40 md:h-56 bg-white border-2 md:border-4 border-[#e6d5bc] rounded-[1.5rem] md:rounded-[2.5rem] px-5 py-5 md:px-8 md:py-8 focus:ring-0 focus:border-[#5c4a33] transition-all resize-none text-base md:text-xl leading-relaxed placeholder:text-[#8b7355]/40 text-[#5c4a33] font-serif italic shadow-inner no-scrollbar"
                  />
                  
                  <div className="flex flex-col md:flex-row items-center justify-end gap-4 md:gap-6">
                    <button 
                      onClick={handleSendWhisper}
                      disabled={!whisperText.trim() || isSent}
                      className="w-full md:w-auto px-8 py-4 md:px-12 md:py-5 bg-[#5c4a33] text-[#fdfaf3] rounded-[1.5rem] md:rounded-[1.8rem] font-black uppercase tracking-widest md:tracking-[0.2em] text-xs md:text-sm shadow-lg md:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 md:gap-3 border-2 border-transparent hover:border-[#e6d5bc] shrink-0"
                    >
                      <AnimatePresence mode="wait">
                        {isSent ? (
                          <motion.div key="sent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
                            <Sparkles size={16} className="text-amber-400" />
                            Запечатано!
                          </motion.div>
                        ) : (
                          <motion.div key="send" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
                            <Send size={16} />
                            Отправить
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Archive Stats & Months */}
          <div className="space-y-6 md:space-y-10 h-full">
            <div className="bg-[#fdfaf3] p-6 md:p-8 rounded-[2.5rem] md:rounded-[3.5rem] border-4 md:border-8 border-[#e6d5bc]/30 shadow-md md:shadow-[15px_15px_40px_rgba(0,0,0,0.08)] relative overflow-hidden h-full flex flex-col min-h-[350px] md:min-h-[420px]">
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
              
              <div className="relative z-10 flex flex-col h-full space-y-6 md:space-y-8">
                <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 shrink-0">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-[1.2rem] bg-[#5c4a33] border-2 md:border-4 border-[#e6d5bc] flex items-center justify-center text-[#fdfaf3] shadow-md">
                    <Archive size={18} className="md:hidden" />
                    <Archive size={20} className="hidden md:block" />
                  </div>
                  <h3 className="text-2xl md:text-xl font-serif font-black text-[#5c4a33]">Архив</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4 shrink-0">
                  <div className="bg-white/60 p-4 md:p-5 rounded-2xl md:rounded-[1.8rem] border-2 border-[#e6d5bc]/50 text-center shadow-sm">
                    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#8b7355] mb-1">Всего</p>
                    <p className="text-2xl md:text-3xl font-serif font-bold text-[#5c4a33]">{whispers.length}</p>
                  </div>
                  <div className="bg-white/60 p-4 md:p-5 rounded-2xl md:rounded-[1.8rem] border-2 border-[#e6d5bc]/50 text-center shadow-sm">
                    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#8b7355] mb-1 truncate px-1">{selectedArchiveMonth ? 'В архиве' : 'В этом месяце'}</p>
                    <p className="text-2xl md:text-3xl font-serif font-bold text-[#5c4a33]">{displayWhispers.length}</p>
                  </div>
                </div>

                <div className="space-y-4 flex-1 flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    {selectedArchiveMonth ? (
                      <motion.button
                        key="back-btn"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onClick={() => setSelectedArchiveMonth(null)}
                        className="w-full py-4 md:py-5 bg-[#5c4a33] border-2 md:border-4 border-[#5c4a33] rounded-2xl md:rounded-[1.5rem] text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-3 group"
                      >
                        <ArrowLeft size={16} className="md:hidden group-hover:-translate-x-1 transition-transform" />
                        <ArrowLeft size={18} className="hidden md:block group-hover:-translate-x-1 transition-transform" />
                        Вернуться
                      </motion.button>
                    ) : (
                      <motion.button
                        key="select-btn"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onClick={() => setIsArchiveOpen(true)}
                        className="w-full py-5 bg-[#5c4a33] border-4 border-[#e6d5bc]/30 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] text-[#fdfaf3] shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
                      >
                        <Archive size={18} className="text-[#fdfaf3] group-hover:scale-110 transition-transform" />
                        Выбрать месяц
                      </motion.button>
                    )}
                  </AnimatePresence>
                  
                  <div className="bg-white/40 p-5 rounded-[1.5rem] border-2 border-dashed border-[#e6d5bc] text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#8b7355] mb-1.5">Сейчас показано:</p>
                    <p className="text-sm font-bold text-[#5c4a33] font-serif italic">{currentMonthName()}</p>
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-[#e6d5bc]/30 shrink-0">
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#8b7355]/40 text-center italic">
                    "История ваших чувств"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History/Archive Grid */}
        <section className="space-y-6 md:space-y-8 pt-4 md:pt-0">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 border-b-4 md:border-b-8 border-[#e6d5bc] pb-4 md:pb-6">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-[1.5rem] bg-[#5c4a33] text-[#fdfaf3] flex items-center justify-center shadow-lg border-2 md:border-4 border-[#e6d5bc] shrink-0">
              <Archive size={24} className="md:hidden" />
              <Archive size={28} className="hidden md:block" />
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-black text-[#5c4a33] leading-tight">
              {selectedArchiveMonth 
                ? `Архив за ${archiveMonthsList.find(m => m.year === selectedArchiveMonth.year && m.month === selectedArchiveMonth.month)?.name}`
                : "Письма этого месяца"}
            </h2>
          </div>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-8 space-y-4 md:space-y-8">
            <AnimatePresence mode="popLayout">
              {displayWhispers.map((whisper) => (
                <motion.div
                  key={whisper.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                  onClick={() => {
                    setSelectedHistoryWhisper(whisper);
                    setIsRevealed(true); // Auto-reveal for history
                  }}
                  className="break-inside-avoid cursor-pointer w-full"
                >
                  <div className={cn(
                    "p-2 md:p-3 rounded-[2rem] md:rounded-[2.8rem] shadow-md md:shadow-xl transition-all duration-500",
                    whisper.sender === 'Grinch' ? "bg-[#f0f9ff]" : "bg-[#fdf2f8]"
                  )}>
                    <div className={cn(
                      "bg-[#fdfaf3] rounded-[1.5rem] md:rounded-[2.2rem] p-5 md:p-8 border-4 md:border-8 relative overflow-hidden flex flex-col gap-4 md:gap-6",
                      whisper.sender === 'Grinch' ? "border-[#bae6fd]" : "border-[#fbcfe8]"
                    )}>
                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                      
                      <div className="flex justify-between items-start relative z-10">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className={cn(
                            "w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-[1.2rem] flex items-center justify-center border-2 shadow-sm",
                            whisper.sender === 'Grinch' ? "bg-[#f0f9ff] border-[#bae6fd] text-[#0ea5e9]" : "bg-[#fdf2f8] border-[#fbcfe8] text-[#ec4899]"
                          )}>
                            {whisper.sender === 'Grinch' ? <Trees size={16} className="md:hidden" /> : <Moon size={16} className="md:hidden" />}
                            {whisper.sender === 'Grinch' ? <Trees size={20} className="hidden md:block" /> : <Moon size={20} className="hidden md:block" />}
                          </div>
                          <div>
                            <p className={cn(
                              "text-[8px] md:text-[10px] font-black uppercase tracking-widest",
                              whisper.sender === 'Grinch' ? "text-[#0369a1]" : "text-[#be185d]"
                            )}>От: {whisper.sender === 'Grinch' ? 'Гринч' : 'Синди Лу'}</p>
                            <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#8b7355]/40">{new Date(whisper.created_at).toLocaleDateString('ru-RU')}</p>
                          </div>
                        </div>
                        
                        {whisper.sender === currentUser && (
                          <button 
                            onClick={async (e) => {
                              e.stopPropagation();
                              await supabase.from('whisper_history').delete().eq('id', whisper.id);
                              refreshWhispers();
                            }}
                            className="p-1.5 md:p-2 text-red-300 hover:text-red-500 transition-all bg-white/50 rounded-lg md:rounded-xl"
                          >
                            <Trash2 size={16} className="md:hidden" />
                            <Trash2 size={18} className="hidden md:block" />
                          </button>
                        )}
                      </div>

                      <p className={cn(
                        "relative z-10 text-base md:text-xl font-serif italic leading-relaxed pl-1 md:pl-2 line-clamp-4 md:line-clamp-3",
                        whisper.sender === 'Grinch' ? "text-[#0369a1]" : "text-[#be185d]"
                      )}>
                        "{whisper.content || whisper.text}"
                      </p>
                      
                      {(whisper.content || whisper.text).length > 80 && (
                        <div className="flex justify-end relative z-10 mt-1 md:mt-0">
                          <span className={cn(
                            "text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1 bg-white/40 px-2 py-1 rounded-full",
                            whisper.sender === 'Grinch' ? "text-[#0ea5e9]/80" : "text-[#ec4899]/80"
                          )}>
                            Читать <ChevronRight size={10} />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {displayWhispers.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-6 bg-[#fdfaf3]/50 rounded-[3rem] border-[12px] border-dashed border-[#e6d5bc]/30">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-[#e6d5bc] shadow-inner border-4 border-[#e6d5bc]">
                  <Mail size={40} className="opacity-20" />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-serif font-black text-[#5c4a33]">Тишина...</p>
                  <p className="text-sm text-[#8b7355] italic">В этом периоде пока нет писем.</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Whisper Reveal Modal */}
      <AnimatePresence>
        {(isWhisperModalOpen || selectedHistoryWhisper) && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseWhisper}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl"
            >
              <div className="relative z-10 bg-[#fdfaf3] rounded-[2rem] md:rounded-[3.5rem] border-4 md:border-[12px] border-[#e6d5bc] shadow-2xl overflow-hidden p-1 md:p-2">
                <div className="bg-white/40 rounded-[1.5rem] md:rounded-[2.5rem] border-4 border-dashed border-[#e6d5bc] p-6 md:p-10 space-y-6 md:space-y-8 flex flex-col items-center text-center">
                  <div className="space-y-2 md:space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-[#5c4a33] text-[#fdfaf3] text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] shadow-md">
                      <Sparkles size={10} className="md:w-3 md:h-3 text-amber-400" />
                      Тайный Конверт
                    </div>
                    <h3 className="text-2xl md:text-4xl font-serif font-bold text-[#5c4a33]">
                      {selectedHistoryWhisper ? "Архивное письмо" : (isRevealed ? "Послание открыто" : "Вам письмо")}
                    </h3>
                  </div>

                  <div className="w-full min-h-[200px] md:min-h-[300px] flex items-center justify-center">
                    {!isRevealed && !selectedHistoryWhisper ? (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-48 h-36 md:w-64 md:h-48 bg-[#f5e6d3] rounded-2xl md:rounded-3xl border-4 md:border-8 border-[#e6d5bc] shadow-2xl flex flex-col items-center justify-center gap-3 md:gap-4 cursor-pointer group"
                        onClick={() => setIsRevealed(true)}
                      >
                        <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white flex items-center justify-center text-[#5c4a33] shadow-inner border-2 md:border-4 border-[#e6d5bc]">
                          <Lock size={24} className="md:w-8 md:h-8 group-hover:text-amber-500 transition-colors" />
                        </div>
                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-[#8b7355] animate-pulse">Нажми, чтобы вскрыть</p>
                      </motion.div>
                    ) : (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full flex flex-col gap-4 md:gap-6">
                        <div className="w-full bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border-2 md:border-4 border-[#e6d5bc] shadow-xl relative overflow-hidden min-h-[200px] md:min-h-[300px] flex flex-col justify-center">
                          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                          <p className="text-xl md:text-2xl font-serif italic text-[#5c4a33] leading-relaxed">
                            "{whisperPages[currentWhisperPage]}"
                          </p>
                        </div>
                        
                        {whisperPages.length > 1 && (
                          <div className="flex items-center justify-between px-2">
                            <button onClick={() => setCurrentWhisperPage(p => Math.max(0, p - 1))} disabled={currentWhisperPage === 0} className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white border-2 md:border-4 border-[#e6d5bc] disabled:opacity-30"><ChevronLeft size={20} /></button>
                            <span className="text-[10px] md:text-xs font-black text-[#8b7355]">{currentWhisperPage + 1} / {whisperPages.length}</span>
                            <button onClick={() => setCurrentWhisperPage(p => Math.min(whisperPages.length - 1, p + 1))} disabled={currentWhisperPage === whisperPages.length - 1} className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white border-2 md:border-4 border-[#e6d5bc] disabled:opacity-30"><ChevronRight size={20} /></button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  <button 
                    onClick={handleCloseWhisper}
                    className="w-full py-4 md:py-5 rounded-[1.2rem] md:rounded-[1.5rem] bg-[#5c4a33] text-[#fdfaf3] font-black uppercase tracking-[0.3em] text-[10px] md:text-xs shadow-xl hover:scale-[1.02] active:scale-95 transition-all border-2 border-transparent hover:border-[#e6d5bc]"
                  >
                    Закрыть конверт
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Archive Selection Modal */}
      <AnimatePresence>
        {isArchiveOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsArchiveOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#fdfaf3] rounded-[3rem] shadow-2xl overflow-hidden border-[12px] border-[#e6d5bc]"
            >
              <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
              
              <div className="relative z-10 p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[1.5rem] bg-[#5c4a33] text-[#fdfaf3] flex items-center justify-center shadow-lg border-4 border-[#e6d5bc]">
                      <Archive size={24} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-serif font-black text-[#5c4a33]">Архив писем</h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8b7355]">Выберите месяц</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsArchiveOpen(false)}
                    className="p-3 rounded-2xl bg-white text-[#5c4a33] border-4 border-[#e6d5bc] hover:bg-[#f5e6d3] transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 no-scrollbar">
                  {archiveMonthsList.length === 0 ? (
                    <div className="text-center py-12 space-y-4">
                      <div className="w-16 h-16 bg-[#e6d5bc] rounded-3xl flex items-center justify-center mx-auto text-[#8b7355]">
                        <Mail size={32} />
                      </div>
                      <p className="text-xl font-serif text-[#5c4a33]">Архив пока пуст</p>
                    </div>
                  ) : (
                    archiveMonthsList.map((month: any) => (
                      <button
                        key={month.id}
                        onClick={() => {
                          setSelectedArchiveMonth({ year: month.year, month: month.month });
                          setIsArchiveOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-6 rounded-[2rem] bg-white border-4 border-[#e6d5bc] hover:border-[#5c4a33] hover:bg-[#f5e6d3] transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-[1.5rem] bg-[#e6d5bc] text-[#5c4a33] flex items-center justify-center">
                            <Calendar size={24} />
                          </div>
                          <div className="text-left">
                            <p className="text-xl font-serif font-bold text-[#5c4a33]">{month.name}</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8b7355]">{month.count} записок</p>
                          </div>
                        </div>
                        <ChevronRight size={24} className="text-[#8b7355] group-hover:translate-x-2 transition-transform" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
