'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { seqTaverna } from '@/lib/music/engines/taverna';
import { seqCabin } from '@/lib/music/engines/cabin';
import { seqFeast } from '@/lib/music/engines/feast';
import { seqOcean } from '@/lib/music/engines/ocean';
import { seqStorm } from '@/lib/music/engines/storm';
import { seqFog } from '@/lib/music/engines/fog';
import { seqMinecraftHorizons } from '@/lib/music/engines/minecraft-horizons';
import { seqMinecraftUnderwater } from '@/lib/music/engines/minecraft-underwater';
import { seqMinecraftVoid } from '@/lib/music/engines/minecraft-void';

interface Track {
  id: string;
  title: string;
  artist: string;
  type: string;
  category: 'taverna' | 'ocean' | 'shanty';
}

interface MusicContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  setVolume: (volume: number) => void;
  togglePlay: () => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const PIRATE_TRACKS: Track[] = [
  { id: 'tav-1', title: 'Мелодия Старой Тортуги', artist: 'Пиратский Клавесин', type: 'taverna', category: 'taverna' },
  { id: 'tav-2', title: 'Шепот Каюты', artist: 'Уютный Вечер', type: 'cabin', category: 'taverna' },
  { id: 'tav-3', title: 'Призрачный Пир', artist: 'Тени Таверны', type: 'feast', category: 'taverna' },
  { id: 'oce-1', title: 'Песнь Сирен', artist: 'Генератор Океана', type: 'ocean', category: 'ocean' },
  { id: 'oce-2', title: 'Сердце Бездны', artist: 'Гром из Глубин', type: 'storm', category: 'ocean' },
  { id: 'oce-3', title: 'Призрачный Берег', artist: 'Туманный Фонарь', type: 'fog', category: 'ocean' },
  { id: 'sha-1', title: 'Далекие Горизонты', artist: 'C418 Style', type: 'shanty', category: 'shanty' },
  { id: 'sha-2', title: 'Подводный Мир', artist: 'C418 Style', type: 'gold', category: 'shanty' },
  { id: 'sha-3', title: 'Дыхание Бездны', artist: 'C418 Style', type: 'ogurtsov', category: 'shanty' }
];

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const sequencerRef = useRef<number | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ latencyHint: 'interactive' });
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
  };

  const stopAll = () => {
    if (sequencerRef.current) cancelAnimationFrame(sequencerRef.current);
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.05);
    }
  };

  const playSynthNote = (freq: number, time: number, duration: number, type: OscillatorType = 'triangle', gainValue: number = 0.1) => {
    if (!audioCtxRef.current || !masterGainRef.current || !isFinite(freq) || freq <= 0) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    g.gain.setValueAtTime(0, time);
    const finalGain = isMuted ? 0 : gainValue * volume;
    g.gain.linearRampToValueAtTime(finalGain, time + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.connect(g);
    g.connect(masterGainRef.current);
    osc.start(time);
    osc.stop(time + duration);
    osc.onended = () => { osc.disconnect(); g.disconnect(); };
  };

  const runSequencer = (type: string, step: number, nextTime: number) => {
    if (!isPlaying || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    while (nextTime < ctx.currentTime + 0.1) {
      switch(type) {
        case 'taverna': nextTime = seqTaverna(nextTime, step, playSynthNote); break;
        case 'cabin': nextTime = seqCabin(nextTime, step, playSynthNote); break;
        case 'feast': nextTime = seqFeast(nextTime, step, playSynthNote); break;
        case 'ocean': nextTime = seqOcean(nextTime, step, playSynthNote); break;
        case 'storm': nextTime = seqStorm(nextTime, step, playSynthNote); break;
        case 'fog': nextTime = seqFog(nextTime, step, playSynthNote); break;
        case 'shanty': nextTime = seqMinecraftHorizons(nextTime, step, playSynthNote); break;
        case 'gold': nextTime = seqMinecraftUnderwater(nextTime, step, playSynthNote); break;
        case 'ogurtsov': nextTime = seqMinecraftVoid(nextTime, step, playSynthNote); break;
        default: nextTime += 0.5;
      }
      step++;
    }
    sequencerRef.current = requestAnimationFrame(() => runSequencer(type, step, nextTime));
  };

  const playTrack = (track: Track) => {
    initAudio();
    stopAll();
    setIsPlaying(true);
    setCurrentTrack(track);
    masterGainRef.current!.gain.setTargetAtTime(volume, audioCtxRef.current!.currentTime, 0.1);
    runSequencer(track.type, 0, audioCtxRef.current!.currentTime + 0.05);
    localStorage.setItem('last_track_id', track.id);
  };

  const pauseTrack = () => { stopAll(); setIsPlaying(false); };
  const resumeTrack = () => { if (currentTrack) playTrack(currentTrack); };
  const togglePlay = () => { if (isPlaying) pauseTrack(); else resumeTrack(); };

  useEffect(() => { return () => stopAll(); }, []);
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      const targetGain = isMuted ? 0 : volume;
      masterGainRef.current.gain.setTargetAtTime(targetGain, audioCtxRef.current.currentTime, 0.1);
    }
  }, [volume, isMuted]);

  return (
    <MusicContext.Provider value={{ currentTrack, isPlaying, volume, playTrack, pauseTrack, resumeTrack, setVolume, togglePlay, isMuted, setIsMuted }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) throw new Error('useMusic must be used within a MusicProvider');
  return context;
}
