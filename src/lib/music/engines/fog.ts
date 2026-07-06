import { NOTES, PlaySynthNoteFn } from '../constants';

export const seqFog = (t: number, s: number, playSynthNote: PlaySynthNoteFn) => {
  const beat = 0.24;
  const cycle = s % 64;
  
  // Мягкий, глубокий бас без резких атак (Sine wave)
  if (s % 8 === 0) {
    playSynthNote(NOTES.A2, t, 0.8, 'sine', 0.6);
  }
  if (s % 8 === 4) {
    playSynthNote(NOTES.E2, t, 0.4, 'sine', 0.3);
  }
  
  // Плавная гармония (как орган или мягкие пады)
  if (s % 16 === 0) {
    const chord = [NOTES.A3, NOTES.C4, NOTES.E4];
    chord.forEach((n, i) => playSynthNote(n, t + i * 0.05, 3.5, 'sine', 0.08));
  }

  // Чистая, плавная мелодия (только Sine и Triangle, без "плевания")
  const melody = [
    NOTES.A4, NOTES.C5, NOTES.E5, NOTES.D5, NOTES.C5, NOTES.B4, NOTES.A4, NOTES.G4,
    NOTES.A4, NOTES.C5, NOTES.D5, NOTES.F5, NOTES.E5, NOTES.C5, NOTES.B4, NOTES.A4
  ];
  
  // Играем мелодию длинными, связными нотами
  if (s % 4 === 0) {
    const note = melody[(s / 4) % 16];
    // Основная нота - чистый синус
    playSynthNote(note, t, 1.2, 'sine', 0.15);
    // Мягкий подголосок
    playSynthNote(note * 0.5, t, 1.2, 'triangle', 0.05);
  }

  // Очень тихий фоновый гул (эффект пространства)
  if (s % 32 === 0) {
    playSynthNote(NOTES.A2 * 0.5, t, beat * 32, 'sine', 0.1);
  }
  
  return t + beat;
};
