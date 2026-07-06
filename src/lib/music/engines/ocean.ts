import { NOTES, PlaySynthNoteFn } from '../constants';

export const seqOcean = (t: number, s: number, playSynthNote: PlaySynthNoteFn) => {
  const beat = 1.4;
  const cycle = s % 32;
  const wave = (Math.sin(s * 0.15) + 1) / 2;
  
  // Глубокий рокот бездны
  playSynthNote(40 + wave * 10, t, beat * 2, 'sine', 0.8 * wave);
  
  // Подводные течения (фильтрованный шум)
  if (s % 2 === 0) {
    playSynthNote(150 + Math.cos(s * 0.1) * 50, t, beat * 1.5, 'sine', 0.2);
  }

  // Зов сирен (эфирные голоса с реверберацией)
  if (s % 4 === 0) {
    const voices = [NOTES.B4, NOTES.C5, NOTES.E5, NOTES.G5, NOTES.F5, NOTES.E5, NOTES.C5, NOTES.B4];
    const note = voices[(s/4) % 8];
    playSynthNote(note, t, beat * 3, 'sine', 0.12);
    // Призрачное эхо
    playSynthNote(note * 1.005, t + 0.5, beat * 2, 'sine', 0.06);
  }

  // Мерцание планктона (высокие искры)
  if (Math.random() > 0.8) {
    playSynthNote(3000 + Math.random() * 2000, t, 0.1, 'sine', 0.05);
  }
  
  return t + beat;
};
