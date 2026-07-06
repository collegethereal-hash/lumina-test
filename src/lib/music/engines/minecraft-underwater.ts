import { NOTES, PlaySynthNoteFn } from '../constants';

export const seqMinecraftUnderwater = (t: number, s: number, playSynthNote: PlaySynthNoteFn) => {
  const beat = 1.4;
  const cycle = s % 64;
  
  // Эффект "наплыва волны" (LFO-like volume)
  const swell = (Math.sin(s * 0.15) + 1) / 2;
  
  // Основной магический пад
  if (s % 8 === 0) {
    const roots = [NOTES.Ds3, NOTES.Fs3, NOTES.Gs3, NOTES.As3];
    const root = roots[(s/8) % 4];
    playSynthNote(root, t, beat * 7, 'sine', 0.5 * swell);
    playSynthNote(root * 1.25, t + 0.5, beat * 5, 'sine', 0.2); // Мажорная терция
  }

  // "Мерцание жемчуга" (Быстрые арпеджио)
  const shimmer = [NOTES.Ds5, NOTES.Fs5, NOTES.Gs5, NOTES.As5, NOTES.Cs6, NOTES.Ds6];
  if (s % 2 === 0) {
    playSynthNote(shimmer[s % 6], t, beat * 1.5, 'sine', 0.08);
    // Эхо в глубине
    playSynthNote(shimmer[s % 6], t + 0.6, beat, 'sine', 0.04);
  }

  // Соло-флейта океана (Мистическая тема)
  if (s % 16 === 4) {
    const flutes = [NOTES.As5, NOTES.Gs5, NOTES.Fs5, NOTES.Ds5];
    playSynthNote(flutes[(s/16)%4], t, beat * 8, 'triangle', 0.1);
  }

  // Глубокий "китовый" зов
  if (s % 32 === 0) {
    playSynthNote(50, t, beat * 10, 'sine', 0.4);
  }
  
  return t + beat;
};
