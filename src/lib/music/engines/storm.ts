import { NOTES, PlaySynthNoteFn } from '../constants';

export const seqStorm = (t: number, s: number, playSynthNote: PlaySynthNoteFn) => {
  const beat = 0.25;
  const cycle = s % 64;
  
  // Глубокий, мягкий пульс (убрали резкость)
  if (s % 8 === 0) {
    playSynthNote(NOTES.E2, t, 1.5, 'sine', 0.8);
    playSynthNote(NOTES.B2 * 0.5, t + 0.1, 1.2, 'sine', 0.4);
  }
  
  // Призрачный ритм (как далекие барабаны в тумане)
  if (s % 4 === 4) {
    playSynthNote(60, t, 0.2, 'triangle', 0.3);
  }

  // Загадочная, низкая мелодия (Виолончель)
  const melody = [
    NOTES.E3, NOTES.G3, NOTES.B3, NOTES.A3, NOTES.G3, NOTES.F3, NOTES.E3, NOTES.B2,
    NOTES.E3, NOTES.G3, NOTES.C4, NOTES.B3, NOTES.A3, NOTES.G3, NOTES.F3, NOTES.E3
  ];
  
  if (s % 4 === 0) {
    const note = melody[(s/4) % 16];
    playSynthNote(note, t, 1.0, 'triangle', 0.2);
    // Добавляем мягкое эхо
    playSynthNote(note, t + beat * 2, 0.5, 'sine', 0.05);
  }

  // Легкий шум моря (убрали скрежет)
  if (Math.random() > 0.9) {
    playSynthNote(200 + Math.random() * 50, t, 0.5, 'sine', 0.05);
  }
  
  return t + beat;
};
