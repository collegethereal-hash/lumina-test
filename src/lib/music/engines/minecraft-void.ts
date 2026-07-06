import { NOTES, PlaySynthNoteFn } from '../constants';

export const seqMinecraftVoid = (t: number, s: number, playSynthNote: PlaySynthNoteFn) => {
  const beat = 1.0;
  const cycle = s % 64;
  
  // Низкочастотный рокот пещеры
  if (s % 16 === 0) {
    playSynthNote(40, t, beat * 12, 'sine', 0.6);
    playSynthNote(80, t + 0.5, beat * 8, 'sine', 0.3);
  }

  // Одинокие, пугающе красивые ноты рояля
  const caveTheme = [
    NOTES.A3, NOTES.C4, NOTES.E4, 0, 
    NOTES.Ds4, NOTES.B3, NOTES.Fs3, 0,
    NOTES.A3, NOTES.E4, NOTES.C5, NOTES.B4,
    NOTES.G4, NOTES.E4, NOTES.D4, 0
  ];
  
  const note = caveTheme[s % 16];
  if (note > 0) {
    // Добавляем реверберацию через эхо
    playSynthNote(note, t, beat * 4, 'triangle', 0.2);
    playSynthNote(note, t + beat * 1.5, beat * 2, 'triangle', 0.08);
    
    // Мрачная гармоника снизу
    if (s % 4 === 0) playSynthNote(note * 0.5, t, beat * 5, 'sine', 0.15);
  }

  // Звуки "падающих капель"
  if (Math.random() > 0.85) {
    playSynthNote(2000 + Math.random() * 1000, t, 0.1, 'sine', 0.04);
  }

  // "Ветер" из глубин
  if (s % 8 === 2) {
    playSynthNote(150 + Math.random() * 50, t, beat * 3, 'sine', 0.05);
  }
  
  return t + beat;
};
