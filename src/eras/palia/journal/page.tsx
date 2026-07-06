'use client';

import { useState, useRef, useEffect, Suspense, useMemo } from 'react';
import { Card } from "@/components/Card";
import { BookOpen, PenTool, Calendar, Heart, MessageCircle, Send, User, Eraser, Trash2, Edit3, Save, X, Sparkles, Sparkle, Trees, Moon, Flower, Archive, ArrowLeft, RefreshCw, Reply, Lock, Unlock, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useData } from '@/components/DataProvider';
import { PagedText } from '../components/PagedText';

interface Comment {
  id: number | string; 
  author: 'Grinch' | 'Cindy';
  text: string;
  date: string;
  replyTo?: number | string; // id of comment this is replying to
}

interface Note {
  id: string; 
  title: string;
  content: string;
  date: string;
  author: 'Grinch' | 'Cindy';
  mood?: string;
  likes: number;
  isLiked: boolean;
  liked_by?: string[];
  read_by?: string[]; // New field to track who read the note
  comments_read_by?: Record<string, number>; // { 'Grinch': timestamp, 'Cindy': timestamp }
  comments: Comment[];
}

const INITIAL_NOTES: Note[] = [];

const TEST_NOTES: Note[] = [
  {
    id: 'template-unread',
    title: '✨ Тестовая запись (Непрочитанный комментарий)',
    content: 'Эта запись создана специально, чтобы ты увидел, как выглядит иконка, когда партнер оставил новый комментарий. Посмотри на значок сообщения внизу справа — он должен быть желтым и закрашенным!',
    date: 'Сегодня',
    author: 'Cindy',
    mood: '🔮',
    likes: 99,
    isLiked: false,
    read_by: ['Cindy', 'Grinch'],
    comments_read_by: { 'Grinch': 0, 'Cindy': 0 },
    comments: [
      { id: 9999999999999, author: 'Grinch', text: 'Этот комментарий помечен как "новый" для Синди!', date: 'Только что' },
      { id: 9999999999998, author: 'Cindy', text: 'А этот — как "новый" для Гринча!', date: 'Только что' }
    ]
  },
  {
    id: '1',
    title: 'Первый день в нашем мире',
    content: 'Сегодня мы впервые открыли это место. Оно кажется таким уютным и волшебным. Надеюсь, мы наполним его множеством теплых воспоминаний и искренних слов.',
    date: '15 июня 2026',
    author: 'Cindy',
    mood: '🌸',
    likes: 5,
    isLiked: true,
    liked_by: ['Cindy', 'Grinch'],
    comments: [
      { id: 1, author: 'Grinch', text: 'Полностью согласен! Это наше новое начало. ❤️', date: '15:30' }
    ]
  },
  {
    id: '2',
    title: 'Мысли о будущем',
    content: 'Думая о том, сколько всего мы можем здесь создать... Галерею наших улыбок, журнал наших мыслей. Это очень вдохновляет и заставляет сердце биться чаще.',
    date: '14 июня 2026',
    author: 'Grinch',
    mood: '🌿',
    likes: 3,
    isLiked: false,
    liked_by: ['Cindy'],
    comments: []
  },
  {
    id: '3',
    title: 'Просто хороший вечер',
    content: 'Провели вечер, просто болтая ни о чем и обо всем. Иногда самые простые моменты — самые ценные. Захотелось запечатлеть это чувство здесь, чтобы никогда не забывать.',
    date: '13 июня 2026',
    author: 'Cindy',
    mood: '❤️',
    likes: 10,
    isLiked: true,
    liked_by: ['Cindy', 'Grinch'],
    comments: [
        { id: 1, author: 'Grinch', text: 'Это был лучший вечер. Спасибо тебе.', date: '22:10' },
        { id: 2, author: 'Cindy', text: 'Тебе спасибо ✨', date: '22:12' }
    ]
  },
    {
    id: '4',
    title: 'Смешной случай в магазине',
    content: 'Никогда не забуду, как ты сегодня пытался достать ту банку с верхней полки. Это было так забавно и мило! Смеялись до слез. Нужно будет вспоминать это почаще.',
    date: '12 июня 2026',
    author: 'Grinch',
    mood: '🥧',
    likes: 8,
    isLiked: false,
    liked_by: [],
    comments: []
  },
  {
    id: '5',
    title: 'Уютный дождливый день',
    content: 'Сегодня весь день шел дождь, и мы провели его дома, читая книги и слушая музыку. Такие дни особенно ценны, когда можно просто быть рядом и наслаждаться тишиной.',
    date: '11 июня 2026',
    author: 'Cindy',
    mood: '🧸',
    likes: 7,
    isLiked: true,
    liked_by: ['Cindy', 'Grinch'],
    comments: [
      { id: 1, author: 'Grinch', text: 'Идеальный день. 🌧️', date: '18:00' }
    ]
  },
  {
    id: '6',
    title: 'Новые идеи для приключений',
    content: 'Придумал несколько новых мест, куда мы могли бы отправиться. Мир полон чудес, и я хочу исследовать их все вместе с тобой.',
    date: '10 июня 2026',
    author: 'Grinch',
    mood: '🌿',
    likes: 4,
    isLiked: false,
    liked_by: ['Cindy'],
    comments: []
  },
  {
    id: '7',
    title: 'Вкусный ужин',
    content: 'Приготовила сегодня твое любимое блюдо. Видеть твою улыбку, когда ты ешь, — это лучшая награда. Люблю наши кулинарные эксперименты!',
    date: '09 июня 2026',
    author: 'Cindy',
    mood: '🥧',
    likes: 12,
    isLiked: true,
    liked_by: ['Cindy', 'Grinch'],
    comments: [
      { id: 1, author: 'Grinch', text: 'Было невероятно вкусно! Ты лучшая! 😋', date: '20:30' }
    ]
  },
  {
    id: '8',
    title: 'Прогулка под звездами',
    content: 'Сегодня ночью звезды были особенно яркими. Мы лежали на траве и просто смотрели в небо, мечтая. Такие моменты навсегда остаются в сердце.',
    date: '08 июня 2026',
    author: 'Grinch',
    mood: '🌸',
    likes: 9,
    isLiked: false,
    liked_by: [],
    comments: []
  },
  {
    id: '9',
    title: 'Маленькие радости',
    content: 'Нашла сегодня в старой книге закладку, которую ты мне подарил. Такие мелочи напоминают о том, как много у нас общего и как сильно я тебя ценю.',
    date: '07 июня 2026',
    author: 'Cindy',
    mood: '🧸',
    likes: 6,
    isLiked: true,
    liked_by: ['Cindy', 'Grinch'],
    comments: []
  },
  {
    id: '10',
    title: 'Новый фильм',
    content: 'Посмотрели сегодня тот фильм, который ты так давно хотел. Было здорово разделить с тобой этот момент. Даже если фильм не очень, главное — что мы вместе.',
    date: '06 июня 2026',
    author: 'Grinch',
    mood: '❤️',
    likes: 11,
    isLiked: true,
    liked_by: ['Cindy', 'Grinch'],
    comments: [
      { id: 1, author: 'Cindy', text: 'Мне понравилось! Особенно твои комментарии 😉', date: '23:00' }
    ]
  },
  {
    id: '11',
    title: 'Утренний кофе',
    content: 'Нет ничего лучше, чем просыпаться рядом с тобой и пить утренний кофе. Это мой любимый ритуал, который делает каждый день особенным.',
    date: '05 июня 2026',
    author: 'Cindy',
    mood: '🌸',
    likes: 15,
    isLiked: true,
    liked_by: ['Cindy', 'Grinch'],
    comments: []
  },
  {
    id: '12',
    title: 'Планы на выходные',
    content: 'Думаю о наших планах на выходные. Хочется сделать что-то особенное, что запомнится надолго. Есть идеи?',
    date: '04 июня 2026',
    author: 'Grinch',
    mood: '🌿',
    likes: 2,
    isLiked: false,
    liked_by: [],
    comments: []
  },
  {
    id: '13',
    title: 'Спонтанная поездка',
    content: 'Сегодня решили спонтанно поехать за город. Ветер в волосах, солнце на лице и ты рядом. Что может быть лучше?',
    date: '03 июня 2026',
    author: 'Cindy',
    mood: '❤️',
    likes: 14,
    isLiked: true,
    liked_by: ['Cindy', 'Grinch'],
    comments: [
      { id: 1, author: 'Grinch', text: 'Это было незабываемо! 🚗💨', date: '17:45' }
    ]
  },
  {
    id: '14',
    title: 'Новая книга',
    content: 'Начал читать новую книгу, которую ты мне посоветовала. Очень интересно! Спасибо за рекомендацию, ты всегда знаешь, что мне понравится.',
    date: '02 июня 2026',
    author: 'Grinch',
    mood: '🧸',
    likes: 5,
    isLiked: false,
    liked_by: ['Cindy'],
    comments: []
  },
  {
    id: '15',
    title: 'Просто люблю тебя',
    content: 'Иногда просто хочется сказать, как сильно я тебя люблю. Каждый день с тобой — это подарок. Спасибо, что ты есть.',
    date: '01 июня 2026',
    author: 'Cindy',
    mood: '🌸',
    likes: 20,
    isLiked: true,
    liked_by: ['Cindy', 'Grinch'],
    comments: [
      { id: 1, author: 'Grinch', text: 'И я тебя! ❤️❤️❤️', date: '21:00' },
      { id: 2, author: 'Cindy', text: '🥰', date: '21:05' }
    ]
  },
  // MAY 2026
  {
    id: 'may-1',
    title: 'Майские прогулки',
    content: 'Цветущие сады в этом мае просто невероятные. Рад, что мы провели этот день на свежем воздухе.',
    date: '15 мая 2026',
    author: 'Grinch',
    mood: '🌿',
    likes: 12,
    isLiked: false,
    liked_by: [],
    comments: []
  },
  {
    id: 'may-2',
    title: 'Пикник у озера',
    content: 'Твои домашние пироги были просто божественны! Повторим в следующие выходные?',
    date: '10 мая 2026',
    author: 'Cindy',
    mood: '🥧',
    likes: 18,
    isLiked: true,
    liked_by: ['Grinch'],
    comments: []
  },
  // APRIL 2026
  {
    id: 'apr-1',
    title: 'Апрельский дождь',
    content: 'Весь день сидели дома под одним пледом. Самое уютное воспоминание этой весны.',
    date: '20 апреля 2026',
    author: 'Cindy',
    mood: '🧸',
    likes: 25,
    isLiked: true,
    liked_by: ['Grinch'],
    comments: []
  },
];


import { Skeleton } from "@/components/Skeleton";
import { useEra } from '@/context/EraContext';

function JournalContent() {
  const { 
    currentUser, 
    spaceConfig, 
    notes: dataNotes, 
    setNotes, 
    refreshNotes, 
    refreshWhispers, 
    isLoading, 
    isNotesLoading,
    getCurrentMonthNotes // Используем общую функцию
  } = useData();
  const { setIsUIHidden } = useEra();
  const notes = dataNotes;
  const [activeTab, setActiveTab] = useState<'all' | 'Grinch' | 'Cindy'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'unread' | '3days' | '7days'>('all');
  const [openCommentsId, setOpenCommentsId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  
  // Comment States
  const [editingCommentId, setEditingCommentId] = useState<number | string | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [replyingToCommentId, setReplyingToCommentId] = useState<number | string | null>(null);
  
  // Modal State
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  
  // Archive State
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [selectedArchiveMonth, setSelectedArchiveMonth] = useState<{ year: number; month: number } | null>(null);

  // New Note State
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [selectedMood, setSelectedMood] = useState("🍄");
  const [currentWhisperPage, setCurrentWhisperPage] = useState(0);
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editMood, setEditMood] = useState("");
  
  // Mobile View State
  const [mobileView, setMobileView] = useState<'content' | 'comments'>('content');

  // Pagination states for Modal
  const [notePage, setNotePage] = useState(0);
  const [noteTotalPages, setNoteTotalPages] = useState(1);
  const [commentPage, setCommentPage] = useState(0);
  const [commentTotalPages, setCommentTotalPages] = useState(1);
  const noteContentRef = useRef<HTMLDivElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  const calculatePages = () => {
    if (noteContentRef.current) {
      const el = noteContentRef.current;
      // Даем браузеру время на отрисовку колонок
      requestAnimationFrame(() => {
        const total = Math.ceil(el.scrollWidth / el.clientWidth);
        console.log('Book Navigation Debug:', {
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
          totalPages: total
        });
        setNoteTotalPages(total || 1);
      });
    }
  };

  useEffect(() => {
    if (selectedNote) {
      setNotePage(0);
      setCommentPage(0);
      setMobileView('content');
      setTimeout(calculatePages, 100);
      window.addEventListener('resize', calculatePages);
      return () => window.removeEventListener('resize', calculatePages);
    }
  }, [selectedNote]);

  useEffect(() => {
    if (selectedNote) {
      setTimeout(calculatePages, 100);
    }
  }, [selectedNote?.comments]);

  const scrollNote = (direction: 'next' | 'prev') => {
    if (!noteContentRef.current) return;
    const el = noteContentRef.current;
    const newPage = direction === 'next' 
      ? Math.min(notePage + 1, noteTotalPages - 1)
      : Math.max(notePage - 1, 0);
    
    setNotePage(newPage);
    el.scrollTo({
      left: newPage * el.clientWidth,
      behavior: 'smooth'
    });
  };

  const scrollComments = (direction: 'next' | 'prev') => {
    if (!commentsContainerRef.current) return;
    const el = commentsContainerRef.current;
    const newPage = direction === 'next' 
      ? Math.min(commentPage + 1, commentTotalPages - 1)
      : Math.max(commentPage - 1, 0);
    
    setCommentPage(newPage);
    el.scrollTo({
      left: newPage * el.clientWidth,
      behavior: 'smooth'
    });
  };
  
  const searchParams = useSearchParams();
  
  // Hide navbar when note modal is open
  useEffect(() => {
    if (selectedNote) {
      setIsUIHidden(true);
    } else {
      setIsUIHidden(false);
    }
  }, [selectedNote, setIsUIHidden]);

  // Clean up UI hidden state on unmount
  useEffect(() => {
    return () => setIsUIHidden(false);
  }, [setIsUIHidden]);

  // Emoji Groups State
  const EMOJI_GROUPS = [
    ['🍄', '🧸', '☕', '🕯️', '🏠'],
    ['🌸', '🐱', '🥧', '✨', '🌙'],
    ['🌿', '🦊', '🦉', '🙄', '🍃'],
    ['🍰', '🥨', '🥞', '🍯', '🍦'],
    ['🔮', '💫', '🪐', '🗝️', '📜']
  ];
  const [currentEmojiSet, setCurrentEmojiSet] = useState(0);

  const toggleEmojiSet = () => {
    setCurrentEmojiSet((prev) => (prev + 1) % EMOJI_GROUPS.length);
  };

  // Helper to parse Russian date string "15 июня 2026" or ISO "2026-06-15"
  const parseNoteDate = (dateStr: string) => {
    if (!dateStr) return new Date();

    // 1. Check if it's already YYYY-MM-DD
    if (dateStr.includes('-')) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) return d;
    }

    const months: Record<string, number> = {
      'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3, 'мая': 4, 'июня': 5,
      'июля': 6, 'августа': 7, 'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11
    };
    
    // Clean string (remove ' г.' if exists)
    const cleanStr = dateStr.replace(' г.', '').trim();
    const parts = cleanStr.split(' ');
    
    if (parts.length >= 3) {
      const day = parseInt(parts[0]);
      const month = months[parts[1].toLowerCase()];
      const year = parseInt(parts[2]);
      
      if (!isNaN(day) && month !== undefined && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    return new Date(); // Fallback
  };

  // Filter notes based on selected month or current month
  const getDisplayNotes = () => {
    if (selectedArchiveMonth) {
      return notes.filter(note => {
        const date = parseNoteDate(note.date);
        return date.getFullYear() === selectedArchiveMonth.year && 
               date.getMonth() === selectedArchiveMonth.month;
      });
    }
    return getCurrentMonthNotes();
  };

  const getDayAndMonthStats = () => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const todayCount = notes.filter(note => {
      const noteDate = parseNoteDate(note.date);
      const noteDateStr = `${noteDate.getFullYear()}-${String(noteDate.getMonth() + 1).padStart(2, '0')}-${String(noteDate.getDate()).padStart(2, '0')}`;
      return noteDateStr === todayStr;
    }).length;

    const monthCount = notes.filter(note => {
      const noteDate = parseNoteDate(note.date);
      return noteDate.getMonth() === currentMonth && noteDate.getFullYear() === currentYear;
    }).length;

    return { todayCount, monthCount };
  };

  const stats = getDayAndMonthStats();

  const getArchiveMonthsList = (notes: any[]) => {
    const monthsMap = new Map<string, { year: number; month: number; count: number }>();
    
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

    notes.forEach(note => {
      const date = parseNoteDate(note.date);
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

  const monthsForArchive = getArchiveMonthsList(notes);
  const displayNotes = getDisplayNotes();
  
  // Body scroll lock
  useEffect(() => {
    if (selectedNote) {
      document.body.classList.add('lock-scroll');
    } else {
      document.body.classList.remove('lock-scroll');
    }
    return () => document.body.classList.remove('lock-scroll');
  }, [selectedNote]);

  const addComment = async (noteId: string) => {
    if (!commentText.trim() || !currentUser) return;

    const note = notes.find(n => n.id === noteId);
    if (!note) {
      console.error('Note not found:', noteId);
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const newComment: Comment = {
      id: Date.now(),
      author: currentUser,
      text: commentText,
      date: `${timeStr}`,
      replyTo: replyingToCommentId || undefined
    };

    const newComments = [...note.comments, newComment];
    const updatedNotes = notes.map(n => n.id === noteId ? { ...n, comments: newComments } : n);

    setNotes(updatedNotes);

    // Reset input immediately for better UX
    setCommentText("");
    setReplyingToCommentId(null);

    // Sync to Supabase
    try {
      const { error } = await supabase
        .from('journal_notes')
        .update({ comments: newComments })
        .eq('id', noteId);

      if (error) {
        console.error('Error adding comment to Supabase:', error);
      }
    } catch (err) {
      console.error('Unexpected error adding comment:', err);
    }
  };
  
  const deleteComment = async (noteId: string, commentId: number | string) => {
    if (!currentUser) return;
    const note = notes.find(n => n.id === noteId);
    if (!note) {
      console.error('Note not found for deletion:', noteId);
      return;
    }
    
    const newComments = note.comments.filter((c: any) => c.id !== commentId);
    const updatedNotes = notes.map(n => n.id === noteId ? { ...n, comments: newComments } : n);
    
    localStorage.setItem('lumina_local_notes', JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
    
    try {
      const { error } = await supabase
        .from('journal_notes')
        .update({ comments: newComments })
        .eq('id', noteId);
        
      if (error) {
        console.error('Error deleting comment from Supabase:', error.message, error.details);
      }
    } catch (err) {
      console.error('Unexpected error in deleteComment:', err);
    }
  };
  
  const editComment = async (noteId: string, commentId: number | string) => {
    if (!currentUser || !editCommentText.trim()) return;
    const note = notes.find(n => n.id === noteId);
    if (!note) {
      console.error('Note not found for editing:', noteId);
      return;
    }
    
    const newComments = note.comments.map((c: any) => c.id === commentId ? { ...c, text: editCommentText } : c);
    const updatedNotes = notes.map(n => n.id === noteId ? { ...n, comments: newComments } : n);
    
    localStorage.setItem('lumina_local_notes', JSON.stringify(updatedNotes));
    setNotes(updatedNotes);

    // Update selectedNote immediately for UI sync
    if (selectedNote && selectedNote.id === noteId) {
      setSelectedNote({ ...selectedNote, comments: newComments });
    }
    
    try {
      const { error } = await supabase
        .from('journal_notes')
        .update({ comments: newComments })
        .eq('id', noteId);
        
      if (error) {
        console.error('Error editing comment in Supabase:', error.message, error.details);
      }
    } catch (err) {
      console.error('Unexpected error in editComment:', err);
    }
    
    setEditingCommentId(null);
    setEditCommentText("");
  };

  const addNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim() || !currentUser || !spaceConfig?.id) return;
    
    // Используем локальную дату YYYY-MM-DD для надежной фильтрации
    const localDate = new Date();
    const dateStr = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
    
    // Для отображения (если нужно оставить старый формат) можно использовать отдельное поле, 
    // но в базе лучше хранить стандарт.
    
    // 1. Insert to Supabase first to get the real ID
    try {
      const { data, error } = await supabase
        .from('journal_notes')
        .insert([{
          title: newNoteTitle,
          content: newNoteContent,
          date: dateStr, // Теперь здесь всегда YYYY-MM-DD
          author: currentUser,
          mood: selectedMood,
          likes: 0,
          liked_by: [],
          read_by: [currentUser], // Author has read their own note
          comments: [],
          space_id: spaceConfig.id // Added space_id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding note to Supabase:', error);
        alert('Не удалось сохранить запись в облаке. Проверьте подключение.');
        return;
      }

      if (data) {
        // 2. Update local state with the returned note (with real ID)
        const updatedNotes = [data, ...notes];
        
        // Update local storage
        localStorage.setItem('lumina_local_notes', JSON.stringify(updatedNotes));
        setNotes(updatedNotes);
        
        setNewNoteTitle("");
        setNewNoteContent("");
        setSelectedMood(currentUser === 'Grinch' ? '🍄' : '🧸');
      }
    } catch (err) {
      console.error('Unexpected error in addNote:', err);
    }
  };

  const deleteNote = async (id: string) => {
    const updatedNotes = notes.filter(n => n.id !== id);
    
    setNotes(updatedNotes);

    const { error } = await supabase
      .from('journal_notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting note from Supabase:', error);
    }
  };

  const startEditing = (note: Note) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditMood(note.mood || (note.author === 'Grinch' ? "🍄" : "🧸"));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
    setEditMood("");
  };

  const updateNote = async () => {
    if (!editTitle.trim() || !editContent.trim() || !editingId) return;
    
    let updatedSelectedNote: Note | null = null;
    const updatedNotes = notes.map(n => {
      if (n.id === editingId) {
        const updated = {
          ...n,
          title: editTitle,
          content: editContent,
          mood: editMood
        };
        updatedSelectedNote = updated;
        return updated;
      }
      return n;
    });

    setNotes(updatedNotes);
    if (updatedSelectedNote) {
      setSelectedNote(updatedSelectedNote);
    }

    try {
      const { error } = await supabase
        .from('journal_notes')
        .update({
          title: editTitle,
          content: editContent,
          mood: editMood
        })
        .eq('id', editingId);

      if (error) {
        console.error('Error updating note in Supabase:', error.message, error.details);
      }
    } catch (err) {
      console.error('Unexpected error in updateNote:', err);
    }
    cancelEditing();
  };

  const markAsRead = async (noteId: string) => {
    if (!currentUser) return;
    
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    // Check if already read by current user
    if (note.read_by?.includes(currentUser)) return;
    
    const updatedReadBy = [...(note.read_by || []), currentUser];
    
    try {
      await supabase
        .from('journal_notes')
        .update({ read_by: updatedReadBy })
        .eq('id', noteId);
        
      // Update local state ONLY after success or in a way that doesn't trigger loop
      setNotes(prev => prev.map(n => n.id === noteId ? { ...n, read_by: updatedReadBy } : n));
    } catch (err) {
      console.error('Error marking note as read:', err);
    }
  };

  const markCommentsAsRead = async (noteId: string) => {
    if (!currentUser) return;
    
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    // Only update if there are actually unread comments
    const partnerComments = note.comments.filter((c: any) => c.author !== currentUser);
    const lastRead = (note.comments_read_by || {})[currentUser] || 0;
    const hasUnread = partnerComments.some((c: any) => Number(c.id) > lastRead);
    
    if (!hasUnread) return;

    const now = Date.now();
    const updatedReadBy = { ...(note.comments_read_by || {}), [currentUser]: now };
    
    try {
      await supabase
        .from('journal_notes')
        .update({ comments_read_by: updatedReadBy })
        .eq('id', noteId);
        
      // Update local state ONLY after success
      setNotes(prev => prev.map(n => n.id === noteId ? { ...n, comments_read_by: updatedReadBy } : n));
      
      const updatedLocalNotes = notes.map(n => n.id === noteId ? { ...n, comments_read_by: updatedReadBy } : n);
      localStorage.setItem('lumina_local_notes', JSON.stringify(updatedLocalNotes));
    } catch (err) {
      console.error('Error marking comments as read:', err);
    }
  };

  // Sync selectedNote with notes array
  useEffect(() => {
    if (selectedNote) {
      const updatedNote = notes.find(n => n.id === selectedNote.id);
      if (updatedNote) {
        // Only update selectedNote if there's a real change to avoid infinite loops
        if (updatedNote.comments.length !== selectedNote.comments.length || 
            updatedNote.likes !== selectedNote.likes ||
            JSON.stringify(updatedNote.comments_read_by) !== JSON.stringify(selectedNote.comments_read_by)) {
          setSelectedNote(updatedNote);
        }
      }
    }
  }, [notes, selectedNote]);

  // Separate effect for marking as read to avoid logic soup
  useEffect(() => {
    if (selectedNote) {
      markAsRead(selectedNote.id);
      markCommentsAsRead(selectedNote.id);
    }
  }, [selectedNote?.id]); // Only trigger when ID changes

  // Add a helper to force clear all unread comments in the current view
  const clearAllUnread = () => {
    if (!currentUser) return;
    const now = Date.now();
    const updatedNotes = notes.map(note => {
      const partnerComments = note.comments.filter((c: any) => c.author !== currentUser);
      if (partnerComments.length > 0) {
        return {
          ...note,
          comments_read_by: { ...(note.comments_read_by || {}), [currentUser]: now }
        };
      }
      return note;
    });
    setNotes(updatedNotes);
    localStorage.setItem('lumina_local_notes', JSON.stringify(updatedNotes));
  };

  useEffect(() => {
    // One-time force clear on load to fix stuck yellow icons
    clearAllUnread();
  }, []);

  const toggleLike = async (noteId: string) => {
    if (!currentUser) return;
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    // Бесконечные лайки: всегда увеличиваем на 1, убирать нельзя
    const newLikes = (note.likes || 0) + 1;
    
    const updatedNotes = notes.map(n => n.id === noteId ? { 
      ...n, 
      likes: newLikes,
      isLiked: true 
    } : n);

    setNotes(updatedNotes);

    try {
      const { error } = await supabase
        .from('journal_notes')
        .update({ 
          likes: newLikes
        })
        .eq('id', noteId);

      if (error) {
        console.error('Error adding like in Supabase:', error.message, error.details);
      }
    } catch (err) {
      console.error('Unexpected error in toggleLike:', err);
    }
  };

  const filteredNotes = displayNotes.filter(n => {
    // Filter by author
    const authorMatch = activeTab === 'all' || n.author === activeTab;
    if (!authorMatch) return false;

    // Filter by time/status
    if (timeFilter === 'all') return true;
    
    if (timeFilter === 'unread') {
      return !n.read_by?.includes(currentUser || '');
    }

    const noteDate = parseNoteDate(n.date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - noteDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (timeFilter === '3days') return diffDays <= 3;
    if (timeFilter === '7days') return diffDays <= 7;

    return true;
  });

  const leftNotes = filteredNotes.filter((_, idx) => idx % 2 === 0);
  const rightNotes = filteredNotes.filter((_, idx) => idx % 2 !== 0);

  const currentMonthName = () => {
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    if (selectedArchiveMonth) {
      return `${monthNames[selectedArchiveMonth.month]} ${selectedArchiveMonth.year}`;
    }
    return `${monthNames[new Date().getMonth()]} ${new Date().getFullYear()}`;
  };

  return (
    <div className="relative min-h-screen bg-[#fdfaf3]">
      {/* Background Decor from Gallery */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#f0f9ff]/50 via-transparent to-[#fdf2f8]/50" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#0ea5e9]/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#ec4899]/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-20 pb-40 md:pb-52 space-y-6 md:space-y-12 relative z-10">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="md:hidden flex flex-col gap-4">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5c4a33] text-[#fdfaf3] text-[9px] font-bold uppercase tracking-widest shadow-md">
              <BookOpen size={10} />
              {selectedArchiveMonth ? 'Архив' : 'Наша летопись'} — {currentMonthName()}
            </div>
            <h1 className="text-4xl font-serif font-bold text-[#5c4a33] tracking-tight">
              {selectedArchiveMonth ? 'Страницы прошлого' : 'Страницы истории'}
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
                onClick={() => setIsArchiveOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-[#e6d5bc] border-4 border-[#8b7355]/20 px-4 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-sm text-[#5c4a33] active:scale-95 transition-transform">
                <Archive size={16} />
                Архив
              </button>
            )}
            
            <div className="flex-[2] bg-[#fdfaf3] px-4 py-3 rounded-[1.5rem] border-4 border-[#e6d5bc]/30 shadow-sm flex items-center justify-around relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
              <div className="flex items-center gap-2 relative z-10">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#5c4a33] shadow-sm border-2 border-[#e6d5bc]">
                  <BookOpen size={16} />
                </div>
                <div className="flex flex-col">
                  <p className="text-[8px] font-black uppercase text-[#8b7355] tracking-widest">
                    В месяце
                  </p>
                  <p className="text-sm font-bold text-[#5c4a33] whitespace-nowrap">{stats.monthCount} зап.</p>
                </div>
              </div>
              <div className="h-8 w-px bg-[#e6d5bc] relative z-10 mx-2" />
              <div className="flex flex-col items-center relative z-10">
                <p className="text-[8px] font-black uppercase text-[#8b7355] tracking-widest">Сегодня</p>
                <p className="text-sm font-bold text-[#5c4a33]">+{stats.todayCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Header Section (Hidden on Mobile) */}
        <header className="hidden md:flex flex-col md:flex-row gap-6 items-start md:items-end justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5c4a33] text-[#fdfaf3] text-[10px] font-bold uppercase tracking-widest shadow-md">
              <BookOpen size={12} />
              {selectedArchiveMonth ? 'Архив' : 'Наша летопись'} — {currentMonthName()}
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#5c4a33] tracking-tight">
              {selectedArchiveMonth ? 'Страницы прошлого' : 'Страницы истории'}
            </h1>
            <p className="text-[#8b7355] italic text-lg max-w-xl">
                {selectedArchiveMonth 
                  ? "Каждое слово из прошлого согревает настоящее."
                  : "Каждая запись — это шаг нашей общей истории."}
              </p>
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
            {/* Archive Button - Moved back to right, near the card */}
            <div className="shrink-0">
              {selectedArchiveMonth ? (
                <button
                  onClick={() => setSelectedArchiveMonth(null)}
                  className="w-full md:w-48 flex items-center justify-center gap-2 bg-[#e6d5bc] border-8 border-[#8b7355]/20 px-6 py-7 rounded-[2.5rem] text-sm font-black uppercase tracking-widest shadow-[15px_15px_40px_rgba(0,0,0,0.08)] hover:scale-105 transition-all text-[#5c4a33] group active:scale-95 relative overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                  <ArrowLeft size={18} className="text-[#5c4a33] group-hover:-translate-x-1 transition-transform relative z-10" />
                  <span className="relative z-10">Вернуться</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsArchiveOpen(true)}
                  className="w-full md:w-48 flex items-center justify-center gap-2 bg-[#e6d5bc] border-8 border-[#8b7355]/20 px-6 py-7 rounded-[2.5rem] text-sm font-black uppercase tracking-widest shadow-[15px_15px_40px_rgba(0,0,0,0.08)] hover:scale-105 transition-all text-[#5c4a33] group active:scale-95 relative overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                  <Archive size={18} className="text-[#5c4a33] group-hover:rotate-12 transition-transform relative z-10" />
                  <span className="relative z-10">Архив</span>
                </button>
              )}
            </div>

            <div className="bg-[#fdfaf3] py-7 px-8 rounded-[2.5rem] border-8 border-[#e6d5bc]/30 shadow-[15px_15px_40px_rgba(0,0,0,0.08)] flex items-center justify-around relative overflow-hidden md:min-w-[360px] flex-1 md:flex-none">
              <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#5c4a33] shadow-sm border-4 border-[#e6d5bc]">
                  <BookOpen size={24} />
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-[10px] font-black uppercase text-[#8b7355] tracking-widest">
                    В этом месяце
                  </p>
                  <p className="text-2xl font-bold text-[#5c4a33] whitespace-nowrap">{stats.monthCount} записей</p>
                </div>
              </div>
              <div className="h-12 w-px bg-[#e6d5bc] relative z-10 mx-6" />
              <div className="flex flex-col items-center relative z-10">
                <p className="text-[10px] font-black uppercase text-[#8b7355] tracking-widest">Сегодня</p>
                <p className="text-2xl font-bold text-[#5c4a33]">+{stats.todayCount}</p>
              </div>
            </div>
          </div>
        </header>

      {/* Archive Selection Panel */}
      <AnimatePresence>
        {isArchiveOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-[#fdfaf3] rounded-[2rem] md:rounded-[2.5rem] border-4 md:border-8 border-[#e6d5bc]/30 shadow-[15px_15px_40px_rgba(0,0,0,0.08)] p-5 md:p-8 space-y-4 md:space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl md:text-2xl font-serif font-bold text-[#5c4a33] flex items-center gap-2 md:gap-3">
                <Archive className="text-[#8b7355] w-5 h-5 md:w-6 md:h-6" />
                Архив нашей истории
              </h3>
              <button 
                onClick={() => setIsArchiveOpen(false)}
                className="p-2 rounded-xl hover:bg-[#f5e6d3] transition-colors"
              >
                <X className="text-[#8b7355] w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {monthsForArchive.length > 0 ? (
                monthsForArchive.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedArchiveMonth({ year: m.year, month: m.month });
                      setIsArchiveOpen(false);
                    }}
                    className="flex flex-col items-center gap-1.5 md:gap-2 p-4 md:p-6 rounded-[1.25rem] md:rounded-2xl bg-white border-2 md:border-4 border-[#e6d5bc] hover:border-[#5c4a33] hover:scale-105 transition-all shadow-sm group"
                  >
                    <Calendar className="text-[#8b7355] group-hover:text-[#5c4a33] w-5 h-5 md:w-6 md:h-6" />
                    <span className="text-[10px] md:text-xs font-bold text-[#5c4a33] text-center">{m.name}</span>
                    <span className="text-[9px] md:text-[10px] font-black uppercase text-[#8b7355]/60 tracking-widest">{m.count} зап.</span>
                  </button>
                ))
              ) : (
                <div className="col-span-full py-10 text-center text-[#8b7355] italic">
                  Архив пока пуст... История только начинается!
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor, Tabs & Timeline */}
      <div className="space-y-12 md:space-y-16 relative z-10">
        {/* Toolbar (replaces old tabs) & New Note Editor */}
        {!selectedArchiveMonth && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
            
            {/* Left Side: Editor */}
            <div className="lg:col-span-2">
              <div className="bg-[#fdfaf3] p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-4 md:border-8 border-[#e6d5bc]/30 shadow-[15px_15px_40px_rgba(0,0,0,0.08)] relative overflow-hidden h-full flex flex-col justify-between">
                <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <h3 className="font-serif font-black text-2xl md:text-3xl text-[#5c4a33] flex items-center gap-3 md:gap-4 mb-6">
                    <PenTool className="text-[#8b7355] w-6 h-6 md:w-7 md:h-7" />
                    Оставить новую запись
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8b7355] ml-4">Заголовок</label>
                      <input 
                        type="text" 
                        value={newNoteTitle}
                        onChange={(e) => setNewNoteTitle(e.target.value)}
                        placeholder="О чем ты думаешь?.." 
                        className="w-full bg-white border-2 md:border-4 border-[#e6d5bc] rounded-[1.25rem] md:rounded-[1.5rem] px-4 md:px-6 py-3 md:py-4 focus:ring-0 focus:border-[#5c4a33] transition-all font-serif font-bold text-base md:text-lg placeholder:text-[#8b7355]/40 text-[#5c4a33] shadow-inner"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between ml-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8b7355]">Настроение</label>
                        <button 
                          onClick={toggleEmojiSet}
                          className="text-[9px] font-black uppercase tracking-widest text-[#5c4a33]/40 hover:text-[#5c4a33] transition-colors flex items-center gap-1 group"
                        >
                          <RefreshCw size={10} className="group-active:rotate-180 transition-transform duration-500" />
                          Сменить
                        </button>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 bg-white border-2 md:border-4 border-[#e6d5bc] rounded-[1.25rem] md:rounded-[1.5rem] p-2 md:p-2.5 shadow-inner">
                        {EMOJI_GROUPS[currentEmojiSet].map(m => (
                          <button 
                            key={m} 
                            onClick={() => setSelectedMood(m)}
                            className={cn(
                              "flex-1 h-10 md:h-12 rounded-xl flex items-center justify-center transition-all text-xl md:text-2xl",
                              selectedMood === m 
                                ? (currentUser === 'Grinch' 
                                    ? "bg-[#0ea5e9] text-white scale-105 shadow-[0_10px_20px_rgba(14,165,233,0.3)]" 
                                    : "bg-[#ec4899] text-white scale-105 shadow-[0_10px_20px_rgba(236,72,153,0.3)]")
                                : "bg-transparent text-[#8b7355] hover:bg-[#f5e6d3]"
                            )}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col space-y-3 min-h-[220px]">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8b7355] ml-4">Содержание</label>
                    <textarea 
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="Напиши что-то особенное для истории..."
                      className="w-full flex-1 bg-white border-2 md:border-4 border-[#e6d5bc] rounded-[1.25rem] md:rounded-[1.5rem] px-4 md:px-6 py-3 md:py-4 outline-none focus:ring-0 focus:border-[#e6d5bc] transition-all resize-none text-sm md:text-base leading-relaxed placeholder:text-[#8b7355]/40 text-[#5c4a33] font-serif italic shadow-inner no-scrollbar"
                    />
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 pt-6 md:pt-10">
                    <div className="flex-1 w-full">
                    </div>

                    <button 
                      onClick={addNote}
                      disabled={!newNoteTitle.trim() || !newNoteContent.trim() || !currentUser}
                      className="w-full md:w-auto bg-[#5c4a33] text-[#fdfaf3] px-8 md:px-10 py-4 md:mb-2 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:scale-105 active:scale-95 transition-all flex justify-center items-center gap-3 disabled:opacity-50 border-2 border-transparent hover:border-[#e6d5bc]"
                    >
                      <Send size={16} />
                      Опубликовать
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Filters */}
            <div className="lg:col-span-1 flex flex-col gap-4 md:gap-6">
               {/* Author Filters */}
               <div className="bg-[#fdfaf3] p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border-4 md:border-8 border-[#e6d5bc]/30 shadow-[15px_15px_40px_rgba(0,0,0,0.08)] relative overflow-hidden space-y-4 flex-1">
                  <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                  <div className="relative z-10">
                    <h3 className="font-serif font-black text-lg md:text-xl text-[#5c4a33] flex items-center gap-3 mb-4">
                      <User size={20} className="text-[#8b7355]" />
                      Автор
                    </h3>
                    <div className="flex flex-col gap-2">
                      {(['all', 'Grinch', 'Cindy'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab as any)}
                          className={cn(
                            "w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative z-10 text-left px-6 flex items-center gap-4",
                            activeTab === tab 
                              ? (currentUser === 'Grinch' 
                                  ? "bg-[#0ea5e9] text-white shadow-[0_10px_20px_rgba(14,165,233,0.3)] border-2 border-white/20" 
                                  : "bg-[#ec4899] text-white shadow-[0_10px_20px_rgba(236,72,153,0.3)] border-2 border-white/20")
                              : "text-[#5c4a33]/60 hover:text-[#5c4a33] hover:bg-white/50"
                          )}
                        >
                          <div className={cn("w-2 h-2 rounded-full transition-all", activeTab === tab ? 'bg-white' : 'bg-[#8b7355]/50')} />
                          {tab === 'all' ? 'Все Свитки' : tab === 'Grinch' ? 'Гринч' : 'Синди Лу'}
                        </button>
                      ))}
                    </div>
                  </div>
              </div>

              {/* Time/Status Filters */}
              <div className="bg-[#fdfaf3] p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border-4 md:border-8 border-[#e6d5bc]/30 shadow-[15px_15px_40px_rgba(0,0,0,0.08)] relative overflow-hidden space-y-4 flex-1">
                  <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                  <div className="relative z-10">
                    <h3 className="font-serif font-black text-lg md:text-xl text-[#5c4a33] flex items-center gap-3 mb-4">
                      <Calendar size={20} className="text-[#8b7355]" />
                      Период
                    </h3>
                    <div className="flex flex-col gap-2">
                      {[
                        { id: 'all', label: 'За все время' },
                        { id: 'unread', label: 'Непрочитанные' },
                        { id: '7days', label: 'Последние 7 дней' }
                      ].map((filter) => (
                        <button
                          key={filter.id}
                          onClick={() => setTimeFilter(filter.id as any)}
                          className={cn(
                            "w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative z-10 text-left px-6 flex items-center gap-4",
                            timeFilter === filter.id 
                              ? (currentUser === 'Grinch' 
                                  ? "bg-[#0ea5e9] text-white shadow-[0_10px_20px_rgba(14,165,233,0.3)] border-2 border-white/20" 
                                  : "bg-[#ec4899] text-white shadow-[0_10px_20px_rgba(236,72,153,0.3)] border-2 border-white/20")
                              : "text-[#5c4a33]/60 hover:text-[#5c4a33] hover:bg-white/50"
                          )}
                        >
                          <div className={cn("w-2 h-2 rounded-full transition-all", timeFilter === filter.id ? 'bg-white' : 'bg-[#8b7355]/50')} />
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>
              </div>
            </div>
          </div>
        )}

        {selectedArchiveMonth && (
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#fdfaf3] p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border-4 md:border-8 border-[#e6d5bc]/30 shadow-xl">
             <div className="space-y-1 text-center md:text-left">
                <h3 className="text-lg md:text-xl font-serif font-black text-[#5c4a33]">Фильтры архива</h3>
                <p className="text-[10px] font-black uppercase text-[#8b7355] tracking-widest">Просмотр записей за {currentMonthName()}</p>
             </div>
             <div className="flex gap-2 p-2 bg-[#f5e6d3] rounded-2xl border-4 border-[#e6d5bc] w-full md:w-auto">
                {(['all', 'Grinch', 'Cindy'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={cn(
                      "flex-1 md:flex-none px-4 md:px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      activeTab === tab 
                        ? (currentUser === 'Grinch' 
                            ? "bg-[#0ea5e9] text-white shadow-md" 
                            : "bg-[#ec4899] text-white shadow-md")
                        : "text-[#8b7355] hover:text-[#5c4a33] hover:bg-white/50"
                    )}
                  >
                    {tab === 'all' ? 'Все' : tab === 'Grinch' ? 'Гринч' : 'Синди'}
                  </button>
                ))}
             </div>
          </div>
        )}

          {/* Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {(isLoading || isNotesLoading) ? (
              // Skeleton loading state
              Array.from({ length: 6 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="bg-[#fdfaf3] p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-4 md:border-8 border-[#e6d5bc]/30 shadow-[15px_15px_40px_rgba(0,0,0,0.08)] space-y-4">
                   <div className="flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                   </div>
                   <Skeleton className="h-6 w-3/4" />
                   <div className="space-y-2">
                     <Skeleton className="h-4 w-full" />
                     <Skeleton className="h-4 w-5/6" />
                     <Skeleton className="h-4 w-4/6" />
                   </div>
                </div>
              ))
            ) : filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <JournalNoteCard 
                  key={note.id}
                  note={note}
                  currentUser={currentUser}
                  onToggleLike={() => toggleLike(note.id)}
                  onClick={() => {
                    setSelectedNote(note);
                    markAsRead(note.id);
                  }}
                />
              ))
            ) : (!isLoading && !isNotesLoading && filteredNotes.length === 0) ? (
              <div className="col-span-full py-10 md:py-20 flex flex-col items-center justify-center text-center space-y-4 md:space-y-6">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-[#fdfaf3] border-4 border-[#e6d5bc] rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-[#8b7355] shadow-lg">
                  <BookOpen className="w-10 h-10 md:w-12 md:h-12" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-[#5c4a33]">Летопись пока чиста</h3>
                  <p className="text-sm md:text-base text-[#8b7355] italic max-w-xs mx-auto">
                    "Поделитесь своими мыслями или чувствами. Каждая запись — это частичка вашей общей истории."
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>



      {/* Note Modal */}
      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#fdfaf3] rounded-[2rem] md:rounded-[2.5rem] border-4 md:border-8 border-[#e6d5bc] shadow-2xl p-6 md:p-8 space-y-6 text-center overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
              
              <div className="relative z-10 space-y-4">
                <div className="w-16 h-16 bg-[#f5e6d3] rounded-2xl border-4 border-[#e6d5bc] flex items-center justify-center text-3xl mx-auto shadow-inner rotate-3">
                  ⚠️
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-serif font-black text-[#5c4a33]">{confirmModal.title}</h3>
                  <p className="text-sm font-serif italic text-[#8b7355] leading-relaxed">
                    {confirmModal.message}
                  </p>
                </div>
              </div>

              <div className="relative z-10 flex gap-3 pt-2">
                <button
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-[#e6d5bc] text-[#5c4a33] font-black uppercase tracking-widest text-[10px] hover:bg-[#f5e6d3] transition-all"
                >
                  Отмена
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#5c4a33] text-[#fdfaf3] font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 active:scale-95 transition-all border-2 border-transparent hover:border-[#e6d5bc]"
                >
                  Удалить
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedNote && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center px-2 py-6 md:px-4 md:py-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNote(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl max-h-[95vh] md:max-h-[85vh]"
            >
              <div className="absolute -inset-10 bg-gradient-to-br from-amber-400/10 via-transparent to-pink-400/10 rounded-full blur-2xl opacity-70" />
              <div className="relative z-10 bg-[#fdfaf3] rounded-[2rem] md:rounded-[3rem] border-8 md:border-[12px] border-[#e6d5bc] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[80vh]">
                
                {/* Mobile Tabs */}
                <div className="md:hidden flex bg-[#e6d5bc]/30 p-1.5 rounded-2xl mx-4 mt-4 shrink-0 relative z-20">
                  <button 
                    onClick={() => setMobileView('content')} 
                    className={cn(
                      "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2", 
                      mobileView === 'content' ? "bg-white text-[#5c4a33] shadow-sm" : "text-[#8b7355]"
                    )}
                  >
                    <BookOpen size={14} />
                    Запись
                  </button>
                  <button 
                    onClick={() => setMobileView('comments')} 
                    className={cn(
                      "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2", 
                      mobileView === 'comments' ? "bg-white text-[#5c4a33] shadow-sm" : "text-[#8b7355]"
                    )}
                  >
                    <MessageCircle size={14} />
                    Комментарии ({selectedNote.comments.length})
                  </button>
                </div>

                {/* Left Column: Note Content */}
                <div className={cn(
                  "flex-[1.5] md:flex-1 flex-col min-w-0 md:border-r-4 border-[#e6d5bc]/30 relative overflow-hidden h-full",
                  mobileView === 'content' ? "flex" : "hidden md:flex"
                )}>
                    {editingId === selectedNote.id ? (
                      <div className="flex-1 p-5 md:p-12 overflow-hidden no-scrollbar">
                        <div className="space-y-4 md:space-y-6">
                          <div className="space-y-2">
                            <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#8b7355]">Заголовок</label>
                            <input 
                              value={editTitle} 
                              onChange={(e) => setEditTitle(e.target.value)} 
                              className="w-full bg-white border-2 md:border-4 border-[#e6d5bc] rounded-[1.25rem] md:rounded-[1.5rem] px-4 md:px-6 py-3 md:py-4 focus:ring-0 focus:border-[#5c4a33] transition-all font-serif font-bold text-lg md:text-2xl text-[#5c4a33]"
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#8b7355]">Настроение</label>
                              <button 
                                onClick={toggleEmojiSet}
                                className="text-[9px] font-black uppercase tracking-widest text-[#5c4a33]/40 hover:text-[#5c4a33] transition-colors flex items-center gap-1"
                              >
                                <RefreshCw size={12} className="group-active:rotate-180 transition-transform duration-500" />
                                Сменить
                              </button>
                            </div>
                            <div className="flex items-center gap-2 md:gap-3 bg-white border-2 md:border-4 border-[#e6d5bc] rounded-[1.25rem] md:rounded-[1.5rem] p-2 md:p-3 shadow-inner">
                              {EMOJI_GROUPS[currentEmojiSet].map(m => (
                                <button 
                                  key={m} 
                                  onClick={() => setEditMood(m)}
                                  className={cn(
                                    "flex-1 h-10 md:h-12 rounded-xl flex items-center justify-center transition-all text-xl md:text-2xl",
                                  editMood === m 
                                    ? (currentUser === 'Grinch' 
                                        ? "bg-[#0ea5e9] text-white scale-105 shadow-[0_10px_20px_rgba(14,165,233,0.3)]" 
                                        : "bg-[#ec4899] text-white scale-105 shadow-[0_10px_20px_rgba(236,72,153,0.3)]")
                                    : "bg-transparent text-[#8b7355] hover:bg-[#f5e6d3]"
                                )}
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#8b7355]">Содержание</label>
                          <textarea 
                            value={editContent} 
                            onChange={(e) => setEditContent(e.target.value)} 
                            className="w-full h-40 md:h-80 bg-white border-2 md:border-4 border-[#e6d5bc] rounded-[1.25rem] md:rounded-[1.5rem] px-4 md:px-6 py-3 md:py-4 focus:ring-0 focus:border-[#5c4a33] transition-all resize-none text-sm md:text-lg leading-relaxed text-[#5c4a33] font-serif italic shadow-inner no-scrollbar"
                          />
                        </div>
                        <div className="flex gap-2 md:gap-3 pt-2">
                          <button 
                            onClick={updateNote}
                            className="flex-1 bg-[#5c4a33] text-[#fdfaf3] px-3 md:px-6 py-3 md:py-4 rounded-xl md:rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] md:text-xs shadow-xl hover:scale-105 active:scale-95 transition-all border-2 border-transparent hover:border-[#e6d5bc]"
                          >
                            Сохранить
                          </button>
                          <button 
                            onClick={cancelEditing}
                            className="px-3 md:px-6 py-3 md:py-4 rounded-xl md:rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] md:text-xs shadow-lg border-2 border-[#e6d5bc] text-[#5c4a33] hover:bg-[#f5e6d3] transition-all"
                          >
                            Отмена
                          </button>
                          <button 
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: "Удаление записи",
                                message: "Точно хочешь удалить эту запись? Она исчезнет навсегда... 🥺",
                                onConfirm: () => {
                                  deleteNote(selectedNote.id);
                                  setSelectedNote(null);
                                  setEditingId(null);
                                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                }
                              });
                            }} 
                            className="p-3 md:p-4 rounded-xl md:rounded-[1.5rem] border-2 border-red-100 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-md active:scale-95 group flex items-center justify-center"
                            title="Удалить запись"
                          >
                            <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col h-full relative">
                      <div className="p-5 md:p-12 flex-1 flex flex-col h-full">
                        {/* Modal Header */}
                        <div className="flex items-start justify-between gap-3 md:gap-4 mb-6 md:mb-8 shrink-0">
                          <div className="flex-1 space-y-2 md:space-y-3">
                            <div className="flex items-center gap-3 md:gap-4">
                              <div className={cn(
                                "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-xl md:text-2xl shadow-md border-3 md:border-4 border-[#e6d5bc] shrink-0",
                                "bg-[#5c4a33] text-[#fdfaf3]"
                              )}>
                                {selectedNote.author === 'Grinch' ? <Trees size={20} className="md:w-6 md:h-6" /> : <Moon size={20} className="md:w-6 md:h-6" />}
                              </div>
                              <div>
                                <p className="font-bold text-sm md:text-lg text-[#5c4a33]">
                                  {selectedNote.author === 'Grinch' ? 'Гринч' : 'Синди Лу'}
                                </p>
                                <p className="text-[9px] md:text-xs font-black uppercase tracking-widest text-[#8b7355]/60">
                                  {selectedNote.date}
                                </p>
                              </div>
                            </div>
                            <h3 className="text-2xl md:text-4xl font-serif font-bold text-[#5c4a33] leading-tight">{selectedNote.title}</h3>
                          </div>
                          <div className="flex gap-3 shrink-0">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl border-3 md:border-4 border-[#e6d5bc] flex items-center justify-center text-2xl md:text-3xl shadow-lg rotate-6">
                              {selectedNote.mood}
                            </div>
                          </div>
                        </div>

                        {/* Scrollable Content Area */}
                        <div className="flex-1 relative mb-8 min-h-[300px] flex flex-col">
                          <PagedText 
                            content={selectedNote.content} 
                            renderFooter={({ currentPage, totalPages, handlePrev, handleNext }) => (
                              <div className="shrink-0 space-y-4 pt-4 border-t-2 border-[#e6d5bc]/30 relative z-30">
                                <div className="flex items-center justify-between relative min-h-[64px]">
                                  <div className="flex items-center gap-2 md:gap-3">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleLike(selectedNote.id);
                                      }}
                                      className={cn(
                                        "flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl border-2 transition-all active:scale-95 bg-[#f5e6d3] border-[#5c4a33] text-[#5c4a33] hover:scale-105 shadow-md"
                                      )}
                                    >
                                      <Heart className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
                                      <span className="text-xs md:text-sm font-black tracking-widest">{selectedNote.likes}</span>
                                    </button>

                                    {currentUser === selectedNote.author && (
                                      <div className="flex items-center gap-2 md:gap-3">
                                        <button 
                                          onClick={() => startEditing(selectedNote)} 
                                          className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg md:rounded-xl border-2 border-[#e6d5bc] bg-[#5c4a33] text-[#fdfaf3] hover:scale-105 active:scale-95 transition-all shadow-lg"
                                        >
                                          <Edit3 size={14} className="md:w-4 md:h-4" />
                                          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Ред.</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {totalPages > 1 && (
                                    <div className="flex items-center gap-2 md:gap-4 bg-[#fdfaf3]/80 backdrop-blur-sm px-3 md:px-4 py-1 rounded-3xl">
                                      <button 
                                        onClick={handlePrev} 
                                        disabled={currentPage === 0} 
                                        className="p-2 md:p-4 rounded-xl bg-white border-2 border-[#e6d5bc] text-[#5c4a33] disabled:opacity-30 shadow-md hover:scale-110 active:scale-90 transition-all"
                                      >
                                        <ChevronLeft size={20} className="md:w-6 md:h-6" />
                                      </button>
                                      <span className="text-xs md:text-sm font-black text-[#8b7355] min-w-[2.5rem] md:min-w-[3rem] text-center">
                                        {currentPage + 1} / {totalPages}
                                      </span>
                                      <button 
                                        onClick={handleNext} 
                                        disabled={currentPage === totalPages - 1} 
                                        className="p-2 md:p-4 rounded-xl bg-white border-2 border-[#e6d5bc] text-[#5c4a33] disabled:opacity-30 shadow-md hover:scale-110 active:scale-90 transition-all"
                                      >
                                        <ChevronRight size={20} className="md:w-6 md:h-6" />
                                      </button>
                                    </div>
                                  )}

                                  {/* Empty spacer to balance layout */}
                                  <div className="w-[140px] hidden md:block" />
                                </div>
                              </div>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Comments */}
                <div className={cn(
                  "w-full md:w-96 flex-[1] bg-[#fdfaf3] p-4 md:p-8 flex-col md:border-l-2 border-[#e6d5bc]/30 overflow-hidden relative",
                  mobileView === 'comments' ? "flex" : "hidden md:flex"
                )}>
                  <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-dashed border-[#e6d5bc]/70 shrink-0">
                    <h4 className="text-lg font-serif font-bold text-[#5c4a33] flex items-center gap-2">
                      <span className="text-xl">💌</span>
                      Комментарии
                    </h4>
                    <span className="px-3 py-1 bg-[#f5e6d3] rounded-full text-xs font-black uppercase tracking-widest text-[#5c4a33]/70">
                      {selectedNote.comments.length}
                    </span>
                  </div>
                  
                  {/* Vertical Comments Container (Restored) */}
                  <div className="flex-1 overflow-y-auto space-y-6 mb-6 no-scrollbar">
                    {selectedNote.comments.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="w-20 h-20 bg-[#5c4a33] rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                          <span className="text-4xl">📖</span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[#5c4a33]/80 font-serif italic">Пока пусто...</p>
                          <p className="text-xs text-[#8b7355]/60 font-medium">Начните вашу историю здесь!</p>
                        </div>
                      </div>
                    ) : (
                      selectedNote.comments.map((comment) => {
                        const isCommentAuthor = comment.author === currentUser;
                        const replyToComment = selectedNote.comments.find((c: any) => c.id === comment.replyTo);
                        
                        return (
                          <div 
                            key={comment.id} 
                            className={cn(
                              "space-y-2 flex flex-col group/comment break-inside-avoid mb-6",
                              isCommentAuthor ? "items-end" : "items-start"
                            )}
                          >
                            <div className={cn(
                              "flex items-start gap-2 max-w-[95%]",
                              isCommentAuthor ? "flex-row-reverse" : "flex-row"
                            )}>
                              <div className={cn(
                                "w-8 h-8 rounded-xl flex items-center justify-center text-base shadow-md border-3 border-[#e6d5bc] shrink-0 mt-1",
                                "bg-[#5c4a33] text-[#fdfaf3]"
                              )}>
                                {comment.author === 'Grinch' ? <Trees size={12} /> : <Moon size={12} />}
                              </div>

                              <div className="flex flex-col space-y-1">
                                {replyToComment && (
                                  <div className={cn(
                                    "flex flex-col gap-1 mb-1",
                                    isCommentAuthor ? "items-end" : "items-start"
                                  )}>
                                    <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[#8b7355]/60">
                                      <Reply size={10} />
                                      Ответ
                                    </div>
                                    <div className={cn(
                                      "px-3 py-1.5 rounded-xl bg-[#f5e6d3]/50 border-2 border-[#e6d5bc] text-[10px] italic text-[#5c4a33]/70 line-clamp-1 max-w-[200px]",
                                      isCommentAuthor ? "rounded-tr-none" : "rounded-tl-none"
                                    )}>
                                      "{replyToComment.text}"
                                    </div>
                                  </div>
                                )}

                                <div className="flex flex-col gap-1 group/msg w-full">
                                  <div 
                                    className={cn(
                                      "rounded-2xl px-4 py-3 border-3 border-[#e6d5bc] shadow-md relative",
                                      isCommentAuthor ? "bg-[#5c4a33] rounded-tr-md" : "bg-white rounded-tl-md"
                                    )}
                                  >
                                    {editingCommentId === comment.id ? (
                                      <div className="space-y-3">
                                        <textarea
                                          value={editCommentText}
                                          onChange={(e) => setEditCommentText(e.target.value)}
                                          className={cn(
                                            "w-full bg-transparent border-b-2 border-dashed outline-none font-serif text-sm min-h-[60px] resize-none",
                                            isCommentAuthor ? "text-[#fdfaf3] border-white/30" : "text-[#5c4a33] border-[#5c4a33]/30"
                                          )}
                                          autoFocus
                                        />
                                        <div className="flex items-center justify-end gap-2">
                                          <button
                                            onClick={() => {
                                              setEditingCommentId(null);
                                              setEditCommentText("");
                                            }}
                                            className="p-1 hover:bg-black/10 rounded-lg transition-colors"
                                          >
                                            <X size={14} className={isCommentAuthor ? "text-[#fdfaf3]" : "text-[#5c4a33]"} />
                                          </button>
                                          <button
                                            onClick={() => editComment(selectedNote.id, comment.id)}
                                            className="p-1 hover:bg-black/10 rounded-lg transition-colors"
                                          >
                                            <Save size={14} className={isCommentAuthor ? "text-[#fdfaf3]" : "text-[#5c4a33]"} />
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <p className={cn(
                                          "font-serif font-bold leading-relaxed break-words overflow-hidden text-sm",
                                          isCommentAuthor ? "text-[#fdfaf3]" : "text-[#5c4a33]"
                                        )}>
                                          {comment.text.replace(/^@(Гринч|Синди Лу|Синди),?\s*/, '')}
                                        </p>
                                        <div className={cn(
                                          "flex items-center gap-2 mt-1",
                                          isCommentAuthor ? "justify-end" : "justify-start"
                                        )}>
                                          <span className={cn(
                                            "text-[8px] font-semibold tracking-wide opacity-60",
                                            isCommentAuthor ? "text-[#e6d5bc]" : "text-[#8b7355]"
                                          )}>
                                            {comment.date}
                                          </span>
                                        </div>
                                      </>
                                    )}
                                  </div>

                                  {editingCommentId !== comment.id && (
                                    <div className={cn(
                                      "flex items-center gap-3 px-1 pt-1 opacity-0 group-hover/msg:opacity-100 transition-all duration-300",
                                      isCommentAuthor ? "justify-end" : "justify-start"
                                    )}>
                                      {isCommentAuthor ? (
                                        <>
                                          <button 
                                            onClick={() => {
                                              setEditingCommentId(comment.id);
                                              setEditCommentText(comment.text);
                                            }}
                                            className="text-[9px] font-black uppercase tracking-widest text-[#8b7355] hover:text-[#5c4a33] transition-colors"
                                          >
                                            Ред.
                                          </button>
                                          <button 
                                            onClick={() => {
                                              setConfirmModal({
                                                isOpen: true,
                                                title: "Удаление комментария",
                                                message: "Ты правда хочешь удалить этот комментарий? 🥺",
                                                onConfirm: () => {
                                                  deleteComment(selectedNote.id, comment.id);
                                                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                                }
                                              });
                                            }}
                                            className="text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
                                          >
                                            Удалить
                                          </button>
                                        </>
                                      ) : (
                                        <button 
                                          onClick={() => {
                                            setReplyingToCommentId(comment.id);
                                            document.querySelector('textarea')?.focus();
                                          }}
                                          className="text-[9px] font-black uppercase tracking-widest text-[#8b7355] hover:text-[#5c4a33] transition-colors"
                                        >
                                          Ответить
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Comments Pagination Controls */}
                  {commentTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mb-4 shrink-0">
                      <button 
                        onClick={() => scrollComments('prev')}
                        disabled={commentPage === 0}
                        className="p-1.5 rounded-lg hover:bg-[#5c4a33] hover:text-[#fdfaf3] transition-all disabled:opacity-30 border-2 border-[#e6d5bc]/30"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-[10px] font-black text-[#8b7355]">
                        {commentPage + 1} / {commentTotalPages}
                      </span>
                      <button 
                        onClick={() => scrollComments('next')}
                        disabled={commentPage === commentTotalPages - 1}
                        className="p-1.5 rounded-lg hover:bg-[#5c4a33] hover:text-[#fdfaf3] transition-all disabled:opacity-30 border-2 border-[#e6d5bc]/30"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}

                  {currentUser && (
                    <div className="shrink-0 pt-4 border-t-2 border-dashed border-[#e6d5bc]/70 space-y-3">
                      {replyingToCommentId && (
                        <div className="flex items-center justify-between px-4 py-2 bg-[#f5e6d3] rounded-xl border-2 border-[#e6d5bc] animate-in fade-in slide-in-from-bottom-2">
                          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#5c4a33]">
                            <Reply size={12} />
                            Ответ на комментарий
                          </div>
                          <button 
                            onClick={() => setReplyingToCommentId(null)}
                            className="p-1 hover:bg-white/50 rounded-full transition-colors text-[#5c4a33]"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                      <textarea 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Напиши что-то милое..."
                        className="w-full bg-white border-3 border-[#e6d5bc] rounded-[1.5rem] px-5 py-3 focus:ring-0 focus:border-[#5c4a33] transition-all resize-none text-sm placeholder:text-[#8b7355]/40 shadow-inner font-serif text-[#5c4a33] h-20"
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), addComment(selectedNote.id))}
                      />
                      <button 
                        onClick={() => addComment(selectedNote.id)}
                        disabled={!commentText.trim()}
                        className="w-full bg-[#5c4a33] text-[#fdfaf3] px-4 py-3 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-lg hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <span>Отправить</span>
                        <Send size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setSelectedNote(null)}
                className="absolute -bottom-4 md:-bottom-6 left-1/2 -translate-x-1/2 px-6 md:px-8 py-2 md:py-3 bg-[#fdfaf3]/80 backdrop-blur-sm border-2 md:border-4 border-[#e6d5bc] rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest text-[#5c4a33] hover:scale-105 transition-transform shadow-lg z-50"
              >
                Закрыть
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function JournalNoteCard({ 
  note, 
  currentUser,
  onToggleLike,
  onClick
}: { 
  note: Note; 
  currentUser: 'Grinch' | 'Cindy' | null;
  onToggleLike: () => void; 
  onClick: () => void;
}) {

  const isUnread = currentUser && note.author !== currentUser && !note.read_by?.includes(currentUser);

  // Check for unread comments
  const hasUnreadComments = useMemo(() => {
    if (!currentUser || note.comments.length === 0) return false;
    
    // Partner's comments
    const partnerComments = note.comments.filter((c: any) => c.author !== currentUser);
    if (partnerComments.length === 0) return false;
    
    // User's last read timestamp for this note
    const userReadTimestamp = (note.comments_read_by || {})[currentUser] || 0;
    
    // Check if any partner comment is newer than our last read
    return partnerComments.some((c: any) => Number(c.id) > userReadTimestamp);
  }, [note.comments, note.comments_read_by, currentUser]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full break-inside-avoid relative"
    >
      {/* Unread Badge (Ribbon) */}
      <AnimatePresence>
        {isUnread && (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="absolute -top-2 -right-2 z-20 pointer-events-none"
          >
            <div className={cn(
              "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border-2 border-white flex items-center gap-2",
              currentUser === 'Grinch' 
                ? "bg-[#0ea5e9] text-white shadow-[0_10px_20px_rgba(14,165,233,0.3)]" 
                : "bg-[#ec4899] text-white shadow-[0_10px_20px_rgba(236,72,153,0.3)]"
            )}>
              <Sparkles size={12} className="animate-pulse text-white" />
              Новое
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        onClick={onClick}
        className={cn(
          "bg-[#fdfaf3] p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-[8px] md:border-[12px] shadow-[15px_15px_40px_rgba(0,0,0,0.08)] relative overflow-hidden space-y-4 md:space-y-6 group flex flex-col min-h-[280px] md:min-h-[320px] cursor-pointer hover:scale-[1.01] transition-all duration-300",
          isUnread ? "border-pink-500/50 ring-4 md:ring-8 ring-pink-500/10 shadow-[0_20px_40px_rgba(236,72,153,0.1)]" : "border-[#e6d5bc]/30",
          note.author === 'Grinch' ? "ring-2 md:ring-4 ring-[#0ea5e9]/20 border-[#bae6fd]" : "ring-2 md:ring-4 ring-[#ec4899]/20 border-[#fbcfe8]"
        )}
      >
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />

        <div className="relative z-10 space-y-6">
          {/* Card Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-4">
                  <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md border-4 border-[#e6d5bc] shrink-0",
                      "bg-[#5c4a33] text-[#fdfaf3]"
                  )}>
                    {note.author === 'Grinch' ? <Trees size={20} /> : <Moon size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#5c4a33]">
                      {note.author === 'Grinch' ? 'Гринч' : 'Синди Лу'}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#8b7355]/60">
                      {note.date}
                    </p>
                  </div>
                </div>
                <h4 className="text-xl md:text-2xl font-serif font-bold text-[#5c4a33] leading-tight pt-2">{note.title}</h4>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-2xl border-4 border-[#e6d5bc] flex items-center justify-center text-xl md:text-2xl shadow-lg rotate-6 group-hover:rotate-12 transition-all duration-500 shrink-0">
                {note.mood}
              </div>
            </div>

            {/* Card Body */}
            <div className="flex-1">
              <p className="text-[#6d5b43] leading-relaxed whitespace-pre-wrap font-serif text-base md:text-lg italic border-l-4 border-[#e6d5bc]/50 pl-4 md:pl-6 line-clamp-4">
                "{note.content}"
              </p>
            </div>

            {/* Card Footer Actions */}
            <div className="flex items-center justify-between pt-6 border-t-2 border-[#e6d5bc]/30">
              <div className="flex items-center gap-4">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLike();
                  }}
                  className={cn(
                    "flex items-center gap-2 transition-all active:scale-90 group/heart text-[#5c4a33] hover:scale-110"
                  )}
                >
                  <Heart size={22} fill="currentColor" />
                  <span className="text-xs font-black tracking-widest">{note.likes}</span>
                </button>
                <div className="flex items-center gap-2 relative">
                  <MessageCircle 
                    size={22} 
                    className={cn(
                      "transition-all duration-500",
                      hasUnreadComments ? "text-pink-500 scale-110" : "text-[#8b7355]/50"
                    )} 
                    fill={hasUnreadComments ? "currentColor" : "none"}
                  />
                  <span className={cn(
                    "text-xs font-black tracking-widest transition-colors duration-500",
                    hasUnreadComments ? "text-pink-600" : "text-[#8b7355]/50"
                  )}>
                    {note.comments.length}
                  </span>
                </div>
              </div>
              

            </div>
          </div>
      </div>
    </motion.div>
  );
}

export default function JournalPage() {
  return (
    <Suspense fallback={null}>
      <JournalContent />
    </Suspense>
  );
}
