'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Plus, Play, Pause, Trash2, ExternalLink, Mic, Disc, Volume2, X, Heart, Sparkles, Waves, Skull, Upload, Compass, Anchor, Navigation, Map as MapIcon, Gem, Coffee, Wind, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/components/DataProvider';
import { useEra } from '@/context/EraContext';
import { supabase } from '@/lib/supabase';
import { useMusic, PIRATE_TRACKS } from '@/context/MusicContext';
import { searchYouTubeId } from '@/app/actions/youtube';

interface MusicMoment {
  id: string;
  title: string;
  url: string;
  type: 'yandex' | 'voice' | 'background' | 'youtube';
  sender: string;
  date: string;
  category: string;
  cardTitle?: string;
  artist?: string;
  artworkUrl?: string;
  duration?: string;
  bgVolume?: number;
  bgTrackId?: string;
}

interface iTunesResult {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100: string;
}

interface TrackOfDay {
  id: string;
  title: string;
  url: string;
  date: string;
  sender: string;
  comment?: string;
  cardTitle?: string;
  artworkUrl?: string;
}

const createEmptySong = () => ({
  title: '',
  cardTitle: '',
  url: '',
  type: 'youtube' as 'yandex' | 'voice' | 'background' | 'youtube',
  bgVolume: 50,
  selectedBgId: '',
  file: null as File | null
});

export default function PirateMusicPage() {
  const { currentUser } = useData();
  const { setIsUIHidden } = useEra();
  const { currentTrack, isPlaying, playTrack, togglePlay, setIsMuted } = useMusic();
  const [songs, setSongs] = useState<MusicMoment[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [isTrackOfDayModalOpen, setIsTrackOfDayModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tracksOfDay, setTracksOfDay] = useState<TrackOfDay[]>([]);
  const [selectedYouTubeTrack, setSelectedYouTubeTrack] = useState<iTunesResult | null>(null);
  
  const [newTrackOfDay, setNewTrackOfDay] = useState({
    title: '',
    url: '',
    comment: '',
    cardTitle: ''
  });
  const [daySearchQuery, setDaySearchQuery] = useState('');
  const [daySearchResults, setDaySearchResults] = useState<iTunesResult[]>([]);
  const [isDaySearching, setIsDaySearching] = useState(false);
  const [selectedDayTrack, setSelectedDayTrack] = useState<iTunesResult | null>(null);

  useEffect(() => {
    setIsUIHidden(isSelectModalOpen || isAddModalOpen || isTrackOfDayModalOpen);
    return () => setIsUIHidden(false);
  }, [isSelectModalOpen, isAddModalOpen, isTrackOfDayModalOpen, setIsUIHidden]);
  const [filter, setFilter] = useState('Все');
  const [isUploading, setIsUploading] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<iTunesResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [isMuteActive, setIsMuteActive] = useState(false);

  useEffect(() => {
    setIsMuted(isMuteActive);
  }, [isMuteActive, setIsMuted]);

  const toggleMuteAmbient = () => {
    setIsMuteActive(!isMuteActive);
  };

  const [newSong, setNewSong] = useState(createEmptySong);

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    setIsLoading(true);
    try {
      const currentSaved = localStorage.getItem('pirate_music_songs');
      if (currentSaved) {
        setSongs(JSON.parse(currentSaved));
      } else {
        setSongs([]);
      }

      const savedTracksOfDay = localStorage.getItem('pirate_tracks_of_day');
      if (savedTracksOfDay) {
        setTracksOfDay(JSON.parse(savedTracksOfDay));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDaySearch = async () => {
    if (!daySearchQuery.trim()) return;
    setIsDaySearching(true);
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(daySearchQuery)}&entity=musicTrack&limit=15`);
      const data = await res.json();
      setDaySearchResults(data.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDaySearching(false);
    }
  };

  const handleAddTrackOfDay = async () => {
    if (!selectedDayTrack) return;

    setIsUploading(true);
    const query = `${selectedDayTrack.artistName} ${selectedDayTrack.trackName} audio`;
    const videoId = await searchYouTubeId(query);

    const track: TrackOfDay = {
      id: Date.now().toString(),
      title: newTrackOfDay.title || `${selectedDayTrack.artistName} - ${selectedDayTrack.trackName}`,
      url: videoId ? `https://www.youtube.com/embed/${videoId}` : `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(query)}`,
      date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }),
      sender: currentUser || 'Аноним',
      comment: newTrackOfDay.comment,
      cardTitle: newTrackOfDay.cardTitle,
      artworkUrl: selectedDayTrack.artworkUrl100
    };

    const updated = [track, ...tracksOfDay];
    setTracksOfDay(updated);
    localStorage.setItem('pirate_tracks_of_day', JSON.stringify(updated));
    setIsTrackOfDayModalOpen(false);
    setNewTrackOfDay({ title: '', url: '', comment: '', cardTitle: '' });
    setSelectedDayTrack(null);
    setDaySearchResults([]);
    setDaySearchQuery('');
    setIsUploading(false);
  };

  const handleDeleteTrackOfDay = (id: string) => {
    const updated = tracksOfDay.filter(t => t.id !== id);
    setTracksOfDay(updated);
    localStorage.setItem('pirate_tracks_of_day', JSON.stringify(updated));
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&entity=musicTrack&limit=5`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const resetSongComposer = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedYouTubeTrack(null);
    setNewSong(createEmptySong());
  };

  const handleAddYouTubeTrack = async () => {
    if (!selectedYouTubeTrack) return;

    const query = `${selectedYouTubeTrack.artistName} ${selectedYouTubeTrack.trackName} audio`;
    let videoId = await searchYouTubeId(query);

    const song: MusicMoment = {
      id: Date.now().toString(),
      title: newSong.title || `${selectedYouTubeTrack.artistName} - ${selectedYouTubeTrack.trackName}`,
      url: videoId ? `https://www.youtube.com/embed/${videoId}` : `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(query)}`,
      type: 'youtube',
      sender: currentUser || 'Аноним',
      date: new Date().toISOString(),
      category: 'YouTube',
      cardTitle: newSong.cardTitle.trim() || undefined,
      artist: selectedYouTubeTrack.artistName,
      artworkUrl: selectedYouTubeTrack.artworkUrl100
    };

    setSongs(prev => {
      const updated = [song, ...prev];
      localStorage.setItem('pirate_music_songs', JSON.stringify(updated));
      return updated;
    });
    setIsAddModalOpen(false);
    resetSongComposer();
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `music/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('moments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('moments')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddSong = async () => {
    if (!newSong.title) return;
    
    let finalUrl = newSong.url;
    let duration = "0:00";

    if (newSong.type !== 'yandex' && newSong.file) {
      const uploadedUrl = await handleFileUpload(newSong.file);
      if (!uploadedUrl) return;
      finalUrl = uploadedUrl;
      duration = "2:45"; 
    }

    const song: MusicMoment = {
      id: Date.now().toString(),
      title: newSong.title,
      url: finalUrl,
      type: newSong.type,
      sender: currentUser || 'Аноним',
      date: new Date().toISOString(),
      category: newSong.type === 'yandex' ? 'Яндекс' : (newSong.type === 'voice' ? 'Голосовые' : 'Фон'),
      duration: duration,
      bgVolume: newSong.type === 'voice' ? newSong.bgVolume : undefined,
      bgTrackId: newSong.type === 'voice' ? newSong.selectedBgId : undefined
    };

    setSongs(prev => {
      const updated = [song, ...prev];
      localStorage.setItem('pirate_music_songs', JSON.stringify(updated));
      return updated;
    });
    setIsAddModalOpen(false);
    resetSongComposer();
  };

  const handleDelete = (id: string) => {
    setSongs(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem('pirate_music_songs', JSON.stringify(updated));
      return updated;
    });
  };

  const getYandexEmbed = (url: string) => {
    if (!url) return null;
    try {
      const trackMatch = url.match(/track\/(\d+)/);
      const albumMatch = url.match(/album\/(\d+)/);
      
      if (trackMatch) {
        const trackId = trackMatch[1];
        const albumId = albumMatch ? albumMatch[1] : '';
        // Возвращаем # — он критически важен для роутинга внутри плеера Яндекса
        return `https://music.yandex.ru/iframe/#track/${trackId}/${albumId}`;
      }
      
      if (albumMatch && !trackMatch) {
        return `https://music.yandex.ru/iframe/#album/${albumMatch[1]}`;
      }

      const playlistMatch = url.match(/playlists\/(\d+)/);
      const userMatch = url.match(/users\/([^\/]+)/);
      if (playlistMatch && userMatch) {
        return `https://music.yandex.ru/iframe/#playlist/${userMatch[1]}/${playlistMatch[1]}`;
      }

      return null;
    } catch (e) {
      console.error('Yandex Embed Error:', e);
      return null;
    }
  };

  const categories = [
    { id: 'taverna', label: 'Уютная Таверна', icon: Coffee, color: 'text-orange-500' },
    { id: 'ocean', label: 'Шум Океана', icon: Waves, color: 'text-blue-500' },
    { id: 'shanty', label: 'Пиратские Шанти', icon: Skull, color: 'text-amber-600' }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4ebd0] text-stone-900 font-serif selection:bg-amber-400/25">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/papyrus.png')] opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/5 via-transparent to-amber-900/10" />
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-amber-700/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-700/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-10 pb-40 space-y-12">
        {/* HEADER */}
        <header className="flex flex-row justify-between items-center gap-6 border-b-4 border-amber-900/10 pb-12 relative">
           <div className="text-left space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-900/10 bg-white/40 px-4 py-2 shadow-sm backdrop-blur-sm">
                <Compass size={14} className="text-amber-700/60" />
                <span className="text-[9px] font-black uppercase tracking-[0.32em] text-amber-900/45">Музыкальная каюта</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-amber-900 drop-shadow-sm">
                 Музыка <span className="text-amber-600">Таверны</span>
              </h1>
              <p className="max-w-2xl text-sm md:text-base italic text-amber-900/55">
                Коллекция находок, корабельных посланий и самых тёплых песен на всей Тортуге.
              </p>
           </div>

           <div className="flex items-center gap-4 shrink-0 z-20">
             <motion.button
               whileHover={{ scale: 1.05, rotate: 2 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-4 px-8 py-4 bg-amber-500 text-slate-900 border-b-4 border-amber-700 rounded-[1.75rem] shadow-2xl font-black uppercase tracking-[0.22em] text-xs"
             >
               <Plus size={20} />
               <span>Записать Весть</span>
             </motion.button>
           </div>
        </header>

        {/* GRAMOPHONE SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative">
           <div className="lg:col-span-8 flex flex-col gap-0 w-full">
              <div className="h-[450px] rounded-[3rem] border-[12px] border-[#3e2723]/10 overflow-hidden relative shadow-[20px_20px_60px_rgba(0,0,0,0.1)] bg-[#f2e2ba]">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40" />
                 
                 <div className="w-full h-full flex flex-col items-center justify-center relative z-10 p-12">
                    <div className="relative w-64 h-64 mb-8">
                       <div className="absolute inset-0 bg-white/40 rounded-full border-8 border-amber-600/30 flex items-center justify-center shadow-inner overflow-hidden backdrop-blur-sm">
                          <Disc size={120} className={cn("text-amber-700 transition-all duration-1000", isPlaying ? "animate-spin-slow scale-110" : "opacity-40 scale-90")} />
                       </div>
                       <div 
                         className="absolute -top-4 -right-4 bg-amber-500 text-slate-900 p-6 rounded-2xl shadow-xl transform rotate-12 border-4 border-amber-700 cursor-pointer hover:scale-110 transition-transform"
                         onClick={togglePlay}
                       >
                          {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
                       </div>
                    </div>
                    
                    <div className="text-center space-y-4">
                       <h2 className="text-4xl font-black uppercase tracking-tight text-amber-950">
                         {currentTrack ? currentTrack.title : "Граммофон Джо"}
                       </h2>
                       <p className="text-amber-900/60 font-serif italic text-lg">
                         {currentTrack ? currentTrack.artist : "Выберите пластинку ниже"}
                       </p>
                       <div className="flex items-center gap-4 px-6 py-2 bg-white/60 rounded-full border-2 border-amber-500/20 shadow-sm mx-auto w-fit">
                          <div className={cn("w-2.5 h-2.5 rounded-full transition-all duration-500", isPlaying ? "bg-emerald-500 animate-ping" : "bg-red-600 animate-pulse")} />
                          <span className={cn("text-[10px] font-black uppercase tracking-widest", isPlaying ? "text-emerald-700" : "text-red-800")}>
                             {isPlaying ? "Музыка играет" : "Тишина в эфире"}
                          </span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-4 rounded-[3rem] p-10 bg-[#f2e2ba] border-[12px] border-[#3e2723]/10 relative shadow-[20px_20px_60px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col justify-between">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40 pointer-events-none" />
              <div className="space-y-8 text-left relative z-10">
                 <div className="border-b-2 border-amber-900/10 pb-6">
                    <span className="text-[10px] font-black uppercase text-amber-900/40 tracking-[0.25em] block">Совет Капитана</span>
                    <h2 className="text-3xl font-black text-amber-950 uppercase tracking-tight mt-1">О Граммофоне</h2>
                 </div>
                 <p className="text-lg text-amber-900/70 leading-relaxed italic font-serif">
                    «Если музыка не заиграла сразу — просто ткни в любую часть палубы! Море не любит робких, оно ждет твоего приказа!»
                 </p>
                 
                 <motion.button
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   onClick={() => setIsSelectModalOpen(true)}
                   className="w-full py-5 bg-amber-900 text-amber-100 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl border-b-4 border-amber-950 flex items-center justify-center gap-3"
                 >
                   <Disc size={16} className="animate-spin-slow" />
                   Выбрать пластинку
                 </motion.button>
              </div>
           </div>
        </section>

        {/* YANDEX & MOMENTS SECTION */}
        <div className="pt-20 space-y-12">
           <div className="border-b-4 border-amber-900/10 pb-6 flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black text-amber-950 uppercase tracking-tight">Вести из Океана</h2>
                <p className="text-amber-900/40 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Яндекс-свитки, YouTube-находки и голосовые записи</p>
              </div>
              
              <div className="hidden md:block">
                <div className="px-6 py-3 bg-white/40 border-2 border-amber-900/10 rounded-2xl flex items-center gap-3">
                  <Gem size={18} className="text-amber-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-900/60">{tracksOfDay.length} ПЕСЕН</span>
                </div>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <AnimatePresence mode="popLayout">
                 {songs
                    .filter(s => filter === 'Все' || s.category === filter)
                    .map((song) => {
                       const isYandex = song.type === 'yandex';
                       const isYouTube = song.type === 'youtube';
                       return (
                          <motion.div 
                            key={song.id} 
                            layout 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            whileHover={{ y: -5 }}
                            className="group"
                          >
                             <div className={cn(
                               "relative overflow-hidden rounded-[3rem] min-h-[320px] flex flex-col justify-between transition-all",
                               isYouTube
                                 ? "p-6 bg-[#f2e2ba] border-[12px] border-[#3e2723]/10 shadow-xl group-hover:-translate-y-1 group-hover:shadow-2xl"
                                 : "p-8 bg-[#f2e2ba] border-[12px] border-[#3e2723]/10 shadow-xl group-hover:shadow-2xl group-hover:border-amber-900/20"
                             )}>
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40 pointer-events-none" />
                                
                                {/* Top Decor & Icon */}
                                <div className={cn(
                                  "absolute top-0 right-0 w-24 h-24 rounded-bl-[4rem] flex items-start justify-end p-6 pointer-events-none",
                                  isYouTube ? "bg-amber-900/5" : "bg-amber-900/5"
                                )}>
                                   {(isYandex || isYouTube) ? <Anchor size={24} className="text-amber-900/20" /> : <Compass size={24} className="text-amber-900/20" />}
                                </div>

                                <div className="relative z-10 flex-1 flex flex-col">
                                   {isYouTube ? (
                                      <div className="mb-6 rounded-[2rem] border border-amber-900/10 bg-[linear-gradient(135deg,#fbf1d8_0%,#f3e3bb_38%,#ead1a6_100%)] p-5 text-amber-950 shadow-[0_14px_30px_rgba(120,53,15,0.12)]">
                                         <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                               <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-800/55">
                                                  {song.cardTitle || "YouTube находка"}
                                               </p>
                                               <h3 className="mt-2 text-xl font-black uppercase leading-tight text-amber-950 break-words">
                                                  {song.title}
                                               </h3>
                                               <p className="mt-2 text-[10px] font-black uppercase tracking-[0.24em] text-amber-900/45">
                                                  {song.artist || "Личный саундтрек"}
                                               </p>
                                            </div>
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100/60 text-amber-700 shadow-inner ring-1 ring-amber-900/10">
                                               <Music size={22} />
                                            </div>
                                         </div>
                                      </div>
                                   ) : (
                                      <div className="flex items-start gap-4 mb-6">
                                         <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg rotate-3 group-hover:rotate-0 transition-transform",
                                            (isYandex || isYouTube) ? "bg-blue-700 text-blue-100" : "bg-emerald-700 text-emerald-100",
                                            isYouTube && "bg-red-700 text-red-100"
                                         )}>
                                            {(isYandex || isYouTube) ? <Music size={24} /> : <Mic size={24} />}
                                         </div>
                                         <div className="text-left overflow-hidden">
                                            <h3 className="text-xl font-black uppercase text-amber-950 leading-tight truncate group-hover:text-red-800 transition-colors">
                                               {song.title}
                                            </h3>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-amber-900/40 mt-1">
                                               {isYandex ? "Яндекс-Свиток" : isYouTube ? "YouTube-Свиток" : "Голосовая Весть"}
                                            </p>
                                         </div>
                                      </div>
                                   )}

                                   <div className="flex-1 flex flex-col justify-center">
                                      {isYandex ? (
                                         <div className="rounded-2xl border-4 border-amber-900/5 overflow-hidden shadow-inner bg-white/20 group-hover:border-amber-900/20 transition-all flex items-center justify-center">
                                            {getYandexEmbed(song.url) ? (
                                               <iframe 
                                                 src={getYandexEmbed(song.url) || undefined} 
                                                 width="100%" 
                                                 height="180" 
                                                 frameBorder="0" 
                                                 className="block grayscale-[0.3] hover:grayscale-0 transition-all" 
                                               />
                                            ) : (
                                               <div className="text-center p-4">
                                                  <p className="text-[10px] font-black uppercase text-red-800/40">Свиток поврежден</p>
                                                  <p className="text-[8px] italic text-amber-900/30">Проверьте ссылку на трек</p>
                                               </div>
                                            )}
                                         </div>
                                      ) : isYouTube ? (
                                         <div className="relative overflow-hidden rounded-[2rem] border-[6px] border-amber-900/10 bg-black/90 shadow-[inset_0_4px_20px_rgba(0,0,0,0.1)] group-hover:border-red-900/20 group-hover:shadow-[0_10px_30px_rgba(185,28,28,0.14)]">
                                            {song.artworkUrl && (
                                              <img
                                                src={song.artworkUrl.replace('100x100bb', '600x600bb')}
                                                alt={song.title}
                                                className="absolute inset-0 h-full w-full object-cover opacity-30 blur-md scale-110"
                                              />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-br from-black/25 via-black/10 to-black/55" />
                                            {song.url ? (
                                              <iframe 
                                                src={song.url} 
                                                width="100%" 
                                                height="220" 
                                                frameBorder="0" 
                                                className="relative z-10 block transition-all opacity-95" 
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                              />
                                            ) : (
                                              <div className="text-center p-8 space-y-2">
                                                <Music size={32} className="mx-auto text-amber-900/20 mb-2" />
                                                <p className="text-[12px] font-black uppercase tracking-widest text-red-800/60">Магия не сработала</p>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-amber-900/40">Попробуйте найти трек по-другому</p>
                                              </div>
                                            )}
                                         </div>
                                      ) : (
                                         <div className="py-6 px-6 bg-white/40 rounded-3xl border-2 border-amber-900/10 flex flex-col gap-4 group-hover:bg-white/60 transition-all shadow-inner">
                                            <div className="flex items-center gap-6">
                                               <motion.button 
                                                 whileHover={{ scale: 1.1 }}
                                                 whileTap={{ scale: 0.9 }}
                                                 className="w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-xl border-b-4 border-emerald-800"
                                               >
                                                  <Play size={28} fill="currentColor" className="ml-1" />
                                               </motion.button>
                                               <div className="flex-1 space-y-2">
                                                  <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-tighter text-amber-900/40">
                                                     <span>Слушать запись</span>
                                                     <span>{song.duration || "0:00"}</span>
                                                  </div>
                                                  <div className="h-2.5 bg-amber-900/10 rounded-full overflow-hidden p-0.5">
                                                     <div className="w-1/3 h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                                  </div>
                                               </div>
                                            </div>
                                            <div className="flex justify-between items-center px-2">
                                               <div className="flex items-center gap-1.5">
                                                  <Zap size={10} className="text-amber-900/30" />
                                                  <span className="text-[8px] font-black uppercase tracking-widest text-amber-900/40">
                                                     {new Date(song.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                  </span>
                                               </div>
                                               <div className="flex items-center gap-1.5">
                                                  <Waves size={10} className="text-amber-900/30" />
                                                  <span className="text-[8px] font-black uppercase tracking-widest text-amber-900/40">Эхо бухты</span>
                                               </div>
                                            </div>
                                         </div>
                                      )}
                                   </div>

                                   <div className={cn(
                                     "mt-8 pt-4",
                                     isYouTube ? "border-t border-amber-900/10" : "border-t-2 border-dashed border-amber-900/10"
                                   )}>
                                      {isYouTube ? (
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <div className="rounded-full bg-white/70 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-amber-900 shadow-sm">
                                              {song.sender}
                                            </div>
                                            <div className="rounded-full bg-amber-900/5 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-amber-900/55">
                                              {new Date(song.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                          </div>
                                          <button 
                                            onClick={() => handleDelete(song.id)} 
                                            className="flex items-center gap-1.5 rounded-full bg-amber-900/5 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-red-700/40 transition-all hover:bg-red-700/10 hover:text-red-700"
                                          >
                                             <Trash2 size={12} />
                                             <span>Убрать</span>
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="flex justify-between items-end">
                                           <div className="space-y-1">
                                              <div className="flex items-center gap-2">
                                                 <div className="w-6 h-6 bg-amber-900/10 rounded-full flex items-center justify-center">
                                                    <Zap size={10} className="text-amber-900/40" />
                                                 </div>
                                                 <span className="text-[10px] font-black uppercase tracking-widest text-amber-900/60">{song.sender}</span>
                                              </div>
                                              <p className="text-[8px] font-black uppercase tracking-widest text-amber-900/30 pl-8">
                                                 {new Date(song.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
                                              </p>
                                           </div>
                                           <button 
                                             onClick={() => handleDelete(song.id)} 
                                             className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-red-700/30 hover:text-red-700 transition-all pb-1"
                                           >
                                              <Trash2 size={12} />
                                              <span>Выбросить</span>
                                           </button>
                                        </div>
                                      )}
                                   </div>
                                </div>
                             </div>
                          </motion.div>
                       );
                    })}
              </AnimatePresence>
           </div>
        </div>

        {/* TRACK OF THE DAY ARCHIVE */}
        <div className="pt-20 space-y-12">
           <div className="border-b-4 border-amber-900/10 pb-6 flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black text-amber-950 uppercase tracking-tight">Золотой Архив <span className="text-amber-600">Тортуги</span></h2>
                <p className="text-amber-900/40 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Коллекция Песен Дня от команды</p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsTrackOfDayModalOpen(true)}
                className="group relative overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,#8c6239_0%,#a77443_38%,#d9b36a_100%)] px-5 py-4 text-white shadow-lg shadow-amber-900/20 hover:shadow-xl hover:shadow-amber-900/30 transition-all outline-none border-b-4 border-amber-800/50"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.24),transparent_45%)] opacity-80" />
                <div className="relative flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/15 backdrop-blur-sm">
                    <Heart size={18} fill="currentColor" className="text-amber-100" />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/70">Особый выбор</p>
                    <span className="block text-[11px] font-black uppercase tracking-[0.28em] text-amber-50">Песня дня</span>
                  </div>
                  <Sparkles size={16} className="text-amber-100 transition-transform duration-300 group-hover:scale-110" />
                </div>
              </motion.button>
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <AnimatePresence mode="popLayout">
                 {tracksOfDay.map((track) => (
                    <motion.div 
                      key={track.id} 
                      layout 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group"
                    >
                       <div className="relative p-8 bg-[#f2e2ba] border-[12px] border-[#3e2723]/10 shadow-xl rounded-[3.5rem] overflow-hidden flex flex-col md:flex-row gap-8 group-hover:shadow-2xl transition-all duration-500 group-hover:border-amber-900/20">
                          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40 pointer-events-none" />
                          
                          {/* Left: Status & Date */}
                          <div className="md:w-[35%] flex flex-col justify-center items-center text-center space-y-5 border-r-2 border-amber-900/5 pr-0 md:pr-8 border-b-2 md:border-b-0 pb-6 md:pb-0 relative z-10">
                             <div className="relative">
                                <div className="absolute -inset-4 bg-amber-500/20 blur-2xl rounded-full animate-pulse" />
                                <div className="relative w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl flex items-center justify-center text-slate-900 shadow-[0_10px_25px_rgba(245,158,11,0.3)] rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                   <Heart size={36} fill="currentColor" />
                                </div>
                             </div>
                             
                             <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-800/60">Песня дня</p>
                                <h4 className="text-2xl font-black uppercase text-amber-950 leading-tight tracking-tighter">{track.date}</h4>
                             </div>

                             <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-2xl border border-amber-900/10 shadow-sm">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-900/70">{track.sender}</span>
                             </div>
                          </div>

                          {/* Right: Content & Player */}
                          <div className="md:w-[65%] space-y-6 relative z-10">
                             <div className="rounded-[2rem] border border-amber-900/10 bg-[linear-gradient(135deg,#fbf1d8_0%,#f3e3bb_38%,#ead1a6_100%)] p-6 shadow-[0_12px_24px_rgba(120,53,15,0.08)]">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                   <div className="min-w-0">
                                      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-800/55 mb-1">
                                         {track.cardTitle || "Золотая находка"}
                                      </p>
                                      <h3 className="text-xl font-black uppercase leading-tight text-amber-950 break-words">{track.title}</h3>
                                   </div>
                                   <div className="w-12 h-12 rounded-2xl bg-amber-100/60 flex items-center justify-center text-amber-700 shadow-inner ring-1 ring-amber-900/10 shrink-0">
                                      <Music size={22} />
                                   </div>
                                </div>

                                {track.comment && (
                                   <div className="relative pt-4 border-t border-amber-900/5">
                                      <p className="text-sm font-serif italic text-amber-950/70 leading-relaxed">
                                         «{track.comment}»
                                      </p>
                                   </div>
                                )}
                             </div>

                             <div className="rounded-[2.5rem] border-[6px] border-amber-900/5 overflow-hidden shadow-inner bg-white/30 backdrop-blur-sm group-hover:border-amber-900/10 transition-all">
                                {track.url ? (
                                   <div className="relative h-[180px] w-full overflow-hidden bg-black/90">
                                      {track.artworkUrl && (
                                         <img 
                                            src={track.artworkUrl.replace('100x100bb', '600x600bb')} 
                                            alt={track.title}
                                            className="absolute inset-0 h-full w-full object-cover opacity-30 blur-md scale-110"
                                         />
                                      )}
                                      <div className="absolute inset-0 bg-gradient-to-br from-black/25 via-black/10 to-black/55" />
                                      <iframe 
                                        src={track.url} 
                                        width="100%" 
                                        height="100%" 
                                        frameBorder="0" 
                                        className="relative z-10 block grayscale-[0.2] hover:grayscale-0 transition-all duration-500" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                      />
                                   </div>
                                ) : (
                                   <div className="py-12 text-center space-y-2">
                                      <div className="w-12 h-12 bg-red-900/5 rounded-full flex items-center justify-center mx-auto mb-2">
                                         <Anchor size={20} className="text-red-800/20" />
                                      </div>
                                      <p className="text-[10px] font-black uppercase tracking-widest text-red-800/40">Свиток поврежден</p>
                                      <p className="text-[8px] italic text-amber-900/30">Ссылка утеряна в пучине...</p>
                                   </div>
                                )}
                             </div>

                             <div className="flex justify-end pt-2">
                                <button 
                                  onClick={() => handleDeleteTrackOfDay(track.id)}
                                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-900/5 text-[9px] font-black uppercase tracking-widest text-red-700/40 hover:bg-red-700/10 hover:text-red-700 transition-all"
                                >
                                   <Trash2 size={12} /> Вычеркнуть из летописи
                                </button>
                             </div>
                          </div>
                       </div>
                    </motion.div>
                 ))}
              </AnimatePresence>

              {tracksOfDay.length === 0 && (
                <div className="lg:col-span-2 py-20 text-center space-y-6 bg-white/20 rounded-[3rem] border-4 border-dashed border-amber-900/10">
                   <div className="w-24 h-24 bg-amber-900/5 rounded-full flex items-center justify-center mx-auto">
                      <Music size={40} className="text-amber-900/20" />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-2xl font-black uppercase text-amber-900/40">Архив пуст, капитан!</h3>
                      <p className="text-sm font-serif italic text-amber-900/30">Назначьте первую Песню Дня, чтобы начать летопись</p>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* MODAL: ADD TRACK OF THE DAY */}
      <AnimatePresence>
        {isTrackOfDayModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsTrackOfDayModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 50 }} className="relative w-full max-w-xl bg-[#f2e2ba] p-12 rounded-[4rem] border-[12px] border-[#3e2723]/10 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40 pointer-events-none" />
              <button onClick={() => setIsTrackOfDayModalOpen(false)} className="absolute top-10 right-10 p-2 text-amber-900/40 hover:text-red-700 transition-all z-20"><X size={32} /></button>
              
              <div className="mb-10 relative z-10 text-center">
                <div className="inline-flex items-center gap-4 mb-4 bg-white/40 px-6 py-3 rounded-2xl border-2 border-amber-900/5">
                   <div className="p-2 bg-amber-500 rounded-xl text-slate-900 shadow-lg rotate-3">
                      <Sparkles size={24} />
                   </div>
                   <h2 className="text-4xl font-black uppercase tracking-tighter text-amber-950">Песня <span className="text-amber-600">Дня</span></h2>
                </div>
                <p className="text-amber-900/60 text-[10px] font-black uppercase tracking-[0.3em]">Главный шедевр сегодняшнего плавания</p>
              </div>

              <div className="space-y-6 relative z-10">
                {!selectedDayTrack ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-amber-900/40 ml-2">Поиск трека дня</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={daySearchQuery} 
                          onChange={(e) => setDaySearchQuery(e.target.value)} 
                          onKeyDown={(e) => e.key === 'Enter' && handleDaySearch()}
                          placeholder="Напр: Король и Шут Кукла" 
                          className="flex-1 bg-white/60 border-4 border-amber-900/10 rounded-2xl px-6 py-4 text-amber-950 outline-none focus:border-amber-500/50 transition-all font-serif italic text-lg shadow-inner" 
                        />
                        <button 
                          onClick={handleDaySearch}
                          disabled={isDaySearching || !daySearchQuery}
                          className="px-8 bg-amber-500 text-slate-900 rounded-2xl font-black uppercase shadow-xl border-b-4 border-amber-700 active:translate-y-1 active:border-b-0 transition-all disabled:opacity-50"
                        >
                          {isDaySearching ? "Ищу..." : "Найти"}
                        </button>
                      </div>
                    </div>

                    {daySearchResults.length > 0 && (
                      <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                        {daySearchResults.map((track) => (
                          <div key={track.trackId} className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border-2 border-amber-900/10 hover:border-amber-500/30 transition-all">
                            <div className="flex items-center gap-4 overflow-hidden">
                              <img src={track.artworkUrl100} alt="Cover" className="w-12 h-12 rounded-lg shadow-md" />
                              <div className="overflow-hidden text-left">
                                <h4 className="font-black text-amber-950 truncate">{track.trackName}</h4>
                                <p className="text-xs italic text-amber-900/60 truncate">{track.artistName}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                setSelectedDayTrack(track);
                                setNewTrackOfDay((prev) => ({
                                  ...prev,
                                  title: `${track.artistName} - ${track.trackName}`,
                                  cardTitle: ''
                                }));
                              }}
                              className="shrink-0 px-6 py-3 bg-amber-900 text-amber-100 hover:bg-amber-800 rounded-xl font-black text-[10px] uppercase tracking-wider transition-colors"
                            >
                              Выбрать
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-5 rounded-[2rem] border border-amber-900/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.55),rgba(242,226,186,0.9))] p-8 shadow-inner"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <button 
                        onClick={() => setSelectedDayTrack(null)}
                        className="text-[10px] font-black uppercase tracking-widest text-amber-900/40 hover:text-amber-900 transition-colors flex items-center gap-2"
                      >
                        ← Назад к поиску
                      </button>
                    </div>

                    <div className="flex items-center gap-6">
                      <img
                        src={selectedDayTrack.artworkUrl100}
                        alt={selectedDayTrack.trackName}
                        className="h-24 w-24 rounded-2xl object-cover shadow-lg"
                      />
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-900/45">Выбранный шедевр</p>
                        <h4 className="mt-1 truncate text-xl font-black uppercase text-amber-950">
                          {selectedDayTrack.trackName}
                        </h4>
                        <p className="truncate text-base italic text-amber-900/60">
                          {selectedDayTrack.artistName}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="ml-2 text-[10px] font-black uppercase tracking-widest text-amber-900/40">Заголовок карточки</label>
                      <input
                        type="text"
                        value={newTrackOfDay.cardTitle}
                        onChange={(e) => setNewTrackOfDay({ ...newTrackOfDay, cardTitle: e.target.value })}
                        placeholder="Напр: Песня нашего утра"
                        className="w-full rounded-2xl border-4 border-amber-900/10 bg-white/70 px-6 py-4 text-lg font-serif italic text-amber-950 outline-none transition-all focus:border-amber-500/25 shadow-inner"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="ml-2 text-[10px] font-black uppercase tracking-widest text-amber-900/40">Комментарий</label>
                      <textarea 
                        value={newTrackOfDay.comment} 
                        onChange={(e) => setNewTrackOfDay({...newTrackOfDay, comment: e.target.value})} 
                        placeholder="Почему эта песня сегодня лучшая?.." 
                        className="w-full bg-white/70 border-4 border-amber-900/10 rounded-2xl px-6 py-4 text-amber-950 outline-none focus:border-amber-500/30 transition-all font-serif italic text-lg min-h-[100px] resize-none placeholder:text-amber-900/20 shadow-inner" 
                      />
                    </div>

                    <button 
                      onClick={handleAddTrackOfDay} 
                      disabled={isUploading}
                      className="w-full rounded-[2.5rem] bg-amber-400 hover:bg-amber-500 py-8 text-slate-900 shadow-[0_20px_40px_rgba(245,158,11,0.2)] transition-all active:scale-[0.98] border-b-8 border-amber-600 font-black uppercase tracking-[0.3em] text-sm"
                    >
                      {isUploading ? "Загрузка в архив..." : "Увековечить в архиве"}
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD RECORD */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsAddModalOpen(false); resetSongComposer(); }} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 50 }} className="relative w-full max-w-xl bg-[#f2e2ba] p-10 rounded-[3rem] border-[12px] border-[#3e2723]/10 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40 pointer-events-none" />
              <button onClick={() => { setIsAddModalOpen(false); resetSongComposer(); }} className="absolute top-8 right-8 p-2 text-amber-900/40 hover:text-red-700 transition-all z-20"><X size={32} /></button>
              <div className="mb-10 relative z-10">
                <h2 className="text-4xl font-black uppercase tracking-tight text-amber-950 mb-2">Новая <span className="text-amber-600">Запись</span></h2>
                <p className="text-amber-900/60 text-[10px] font-black uppercase tracking-widest">Добавь мелодию в бортовой журнал Тортуги</p>
              </div>
              <div className="space-y-8 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'youtube', label: 'Поиск (YouTube)', icon: Music },
                    { id: 'voice', label: 'Голос', icon: Mic }
                  ].map((cat) => (
                    <button key={cat.id} onClick={() => { setNewSong({ ...createEmptySong(), type: cat.id as any }); setSelectedYouTubeTrack(null); setSearchResults([]); setSearchQuery(''); }} className={cn("flex flex-col items-center gap-3 p-6 rounded-2xl border-4 transition-all", newSong.type === cat.id ? "bg-amber-500 border-amber-600 text-slate-950 shadow-lg scale-105" : "bg-white/60 border-amber-900/10 text-amber-900/40")}>
                      <cat.icon size={24} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {newSong.type === 'youtube' && (
                    <div className="w-full">
                      {!selectedYouTubeTrack ? (
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-amber-900/40 ml-2">Поиск трека (название, автор)</label>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)} 
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Напр: Король и Шут Кукла" 
                                className="flex-1 bg-white/60 border-4 border-amber-900/10 rounded-2xl px-6 py-4 text-amber-950 outline-none focus:border-amber-500/50 transition-all font-serif italic text-lg" 
                              />
                              <button 
                                onClick={handleSearch}
                                disabled={isSearching || !searchQuery}
                                className="px-8 bg-amber-500 text-slate-900 rounded-2xl font-black uppercase shadow-xl border-b-4 border-amber-700 active:translate-y-1 active:border-b-0 transition-all disabled:opacity-50"
                              >
                                {isSearching ? "Ищу..." : "Найти"}
                              </button>
                            </div>
                          </div>
                          
                          {searchResults.length > 0 && (
                            <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                              {searchResults.map((track) => (
                                <div key={track.trackId} className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border-2 border-amber-900/10 hover:border-amber-500/30 transition-all">
                                  <div className="flex items-center gap-4 overflow-hidden">
                                    <img src={track.artworkUrl100} alt="Cover" className="w-12 h-12 rounded-lg shadow-md" />
                                    <div className="overflow-hidden text-left">
                                      <h4 className="font-black text-amber-950 truncate">{track.trackName}</h4>
                                      <p className="text-xs italic text-amber-900/60 truncate">{track.artistName}</p>
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => {
                                      setSelectedYouTubeTrack(track);
                                      setNewSong((prev) => ({
                                        ...prev,
                                        title: `${track.artistName} - ${track.trackName}`,
                                        cardTitle: ''
                                      }));
                                    }}
                                    className="shrink-0 px-6 py-3 bg-amber-900 text-amber-100 hover:bg-amber-800 rounded-xl font-black text-[10px] uppercase tracking-wider transition-colors"
                                  >
                                    Выбрать
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-5 rounded-[2rem] border border-amber-900/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.55),rgba(242,226,186,0.9))] p-8 shadow-inner"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <button 
                              onClick={() => setSelectedYouTubeTrack(null)}
                              className="text-[10px] font-black uppercase tracking-widest text-amber-900/40 hover:text-amber-900 transition-colors flex items-center gap-2"
                            >
                              ← Назад к поиску
                            </button>
                          </div>

                          <div className="flex items-center gap-6">
                            <img
                              src={selectedYouTubeTrack.artworkUrl100}
                              alt={selectedYouTubeTrack.trackName}
                              className="h-24 w-24 rounded-2xl object-cover shadow-lg"
                            />
                            <div className="min-w-0">
                              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-900/45">Выбранный трек</p>
                              <h4 className="mt-1 truncate text-xl font-black uppercase text-amber-950">
                                {selectedYouTubeTrack.trackName}
                              </h4>
                              <p className="truncate text-base italic text-amber-900/60">
                                {selectedYouTubeTrack.artistName}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="ml-2 text-[10px] font-black uppercase tracking-widest text-amber-900/40">Заголовок карточки</label>
                            <input
                              type="text"
                              value={newSong.cardTitle}
                              onChange={(e) => setNewSong({ ...newSong, cardTitle: e.target.value })}
                              placeholder="Напр: Для позднего вечера"
                              className="w-full rounded-2xl border-4 border-amber-900/10 bg-white/70 px-6 py-4 text-lg font-serif italic text-amber-950 outline-none transition-all focus:border-red-700/25"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="ml-2 text-[10px] font-black uppercase tracking-widest text-amber-900/40">Подпись трека</label>
                            <input
                              type="text"
                              value={newSong.title}
                              onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                              placeholder="Как будет называться карточка в ленте"
                              className="w-full rounded-2xl border-4 border-amber-900/10 bg-white/70 px-6 py-4 text-lg font-serif italic text-amber-950 outline-none transition-all focus:border-amber-500/40"
                            />
                          </div>

                          <button
                            onClick={handleAddYouTubeTrack}
                            disabled={!newSong.title}
                            className="w-full rounded-[1.75rem] border-b-8 border-amber-700 bg-amber-400 hover:bg-amber-500 py-6 text-xs font-black uppercase tracking-[0.28em] text-slate-900 shadow-[0_14px_30px_rgba(245,158,11,0.15)] transition-all active:scale-[0.99] disabled:opacity-40"
                          >
                            Сохранить в сокровищницу
                          </button>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {newSong.type === 'voice' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-amber-900/40 ml-2">Название мелодии</label>
                        <input type="text" value={newSong.title} onChange={(e) => setNewSong({...newSong, title: e.target.value})} placeholder="Как назовем это голосовое?.." className="w-full bg-white/60 border-4 border-amber-900/10 rounded-2xl px-6 py-5 text-amber-950 outline-none transition-all font-serif italic text-lg" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-amber-900/40 ml-2">Загрузить голосовой свиток</label>
                        <input 
                          type="file" 
                          accept="audio/*"
                          onChange={(e) => setNewSong({...newSong, file: e.target.files ? e.target.files[0] : null})}
                          className="w-full bg-white/40 border-4 border-dashed border-amber-900/10 rounded-2xl px-6 py-4 text-amber-900/40 font-serif text-xs file:hidden cursor-pointer" 
                        />
                        {newSong.file && <p className="text-[10px] text-emerald-400 font-black px-4 italic">Файл выбран: {newSong.file.name}</p>}
                      </div>
                    </div>
                  )}
                </div>

                {newSong.type !== 'youtube' && (
                  <button 
                    onClick={handleAddSong} 
                    disabled={isUploading || !newSong.title || (newSong.type === 'yandex' && !newSong.url) || (newSong.type === 'voice' && !newSong.file)} 
                    className="w-full py-8 bg-amber-500 disabled:opacity-30 text-slate-900 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl border-b-8 border-amber-700 active:translate-y-1 active:border-b-4 transition-all"
                  >
                    {isUploading ? "Загрузка..." : "Спрятать в Сокровищницу"}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TRACK SELECTION MODAL */}
      <AnimatePresence>
        {isSelectModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsSelectModalOpen(false)} 
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }} 
              animate={{ opacity: 1, scale: 1, rotate: 0 }} 
              exit={{ opacity: 0, scale: 0.9, rotate: 5 }} 
              className="relative w-full max-w-2xl bg-[#f2e2ba] p-12 rounded-[4rem] border-[15px] border-[#3e2723]/20 shadow-2xl overflow-hidden aspect-square flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-40 pointer-events-none" />
              
              {/* COMPASS DECOR */}
              <div className="absolute inset-10 border-4 border-dashed border-amber-900/10 rounded-full animate-spin-slow opacity-20" />
              <div className="absolute inset-20 border-2 border-amber-900/5 rounded-full" />

              <button 
                onClick={() => setIsSelectModalOpen(false)} 
                className="absolute top-10 right-10 p-2 text-amber-900/40 hover:text-red-700 transition-all z-30"
              >
                <X size={32} />
              </button>

              <div className="relative w-full h-full flex items-center justify-center">
                {/* CENTRAL TRACK INFO */}
                <motion.div 
                  layoutId="active-track"
                  className="relative z-20 w-48 h-48 rounded-full bg-white shadow-2xl border-8 border-amber-600/30 flex flex-col items-center justify-center text-center p-6 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-amber-500/5 animate-pulse" />
                  <Disc size={64} className={cn("text-amber-700 mb-2 transition-all duration-1000", isPlaying ? "animate-spin-slow scale-110" : "opacity-20")} />
                  <h3 className="text-xs font-black uppercase tracking-tighter text-amber-950 leading-tight">
                    {currentTrack ? currentTrack.title : "Выберите путь"}
                  </h3>
                  <p className="text-[8px] font-serif italic text-amber-900/60 mt-1">
                    {currentTrack ? currentTrack.artist : "Роза Ветров"}
                  </p>
                </motion.div>

                {/* RADIAL TRACKS */}
                {PIRATE_TRACKS.map((track, index) => {
                  const isCurrent = currentTrack?.id === track.id;
                  const angle = (index * (360 / PIRATE_TRACKS.length)) - 90;
                  const radius = 200; // Расстояние от центра
                  
                  return (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                        x: Math.cos(angle * (Math.PI / 180)) * radius,
                        y: Math.sin(angle * (Math.PI / 180)) * radius
                      }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.2, zIndex: 30 }}
                      className="absolute z-10"
                    >
                      <button
                        onClick={() => playTrack(track)}
                        className={cn(
                          "group relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500",
                          isCurrent 
                            ? "bg-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.35)] border-4 border-amber-300 scale-110" 
                            : "bg-white/60 hover:bg-white border-4 border-amber-900/10 shadow-lg"
                        )}
                      >
                        <Disc size={24} className={cn(
                          "transition-colors",
                          isCurrent ? "text-slate-900 animate-spin-slow" : "text-amber-900/30 group-hover:text-amber-600"
                        )} />
                        
                        {/* TOOLTIP ON HOVER */}
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-amber-900 text-amber-100 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest z-40">
                          {track.title}
                        </div>
                      </button>
                    </motion.div>
                  );
                })}

                {/* CONNECTING LINES (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
                  {PIRATE_TRACKS.map((_, index) => {
                    const angle = (index * (360 / PIRATE_TRACKS.length)) - 90;
                    const x2 = 50 + Math.cos(angle * (Math.PI / 180)) * 40;
                    const y2 = 50 + Math.sin(angle * (Math.PI / 180)) * 40;
                    return (
                      <line 
                        key={index}
                        x1="50%" y1="50%" 
                        x2={`${x2}%`} y2={`${y2}%`} 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        className="text-amber-900"
                      />
                    );
                  })}
                </svg>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(62, 39, 35, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(62, 39, 35, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(62, 39, 35, 0.3);
        }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 15s linear infinite; }
      `}</style>
    </div>
  );
}
