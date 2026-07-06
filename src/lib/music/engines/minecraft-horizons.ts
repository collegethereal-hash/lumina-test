import { NOTES, PlaySynthNoteFn } from '../constants';

export const seqMinecraftHorizons = (t: number, s: number, playSynthNote: PlaySynthNoteFn) => {
  const beat = 0.9;
  const cycle = s % 128; // Очень длинный цикл для развития темы
  
  // Сверхглубокий бас с "дыханием"
  if (s % 16 === 0) {
    const progression = [NOTES.F2, NOTES.As2 * 0.5, NOTES.C2, NOTES.G2 * 0.5];
    const root = progression[(s/16) % 4];
    playSynthNote(root, t, beat * 14, 'sine', 0.6);
    playSynthNote(root * 2, t + 0.2, beat * 10, 'sine', 0.2);
  }
  
  // Богатые, "разлитые" аккорды
  if (s % 8 === 0) {
    const chords = [
      [NOTES.F3, NOTES.A3, NOTES.C4, NOTES.E4],
      [NOTES.As3, NOTES.D4, NOTES.F4, NOTES.A4],
      [NOTES.C3, NOTES.G3, NOTES.C4, NOTES.E4],
      [NOTES.G3, NOTES.B3, NOTES.D4, NOTES.Fs4]
    ];
    const currentChord = chords[(s/8) % 4];
    currentChord.forEach((n, i) => {
      playSynthNote(n, t + i * 0.08, beat * 7, 'triangle', 0.15);
    });
  }
  
  // Тонкая, плачущая мелодия (Высокое пианино)
  const melody = [
    NOTES.C5, NOTES.E5, NOTES.A5, NOTES.G5, NOTES.E5, NOTES.D5, NOTES.C5, 0,
    NOTES.F5, NOTES.A5, NOTES.C6, NOTES.As5, NOTES.A5, NOTES.G5, NOTES.F5, 0
  ];
  
  if (s % 4 === 2) {
    const note = melody[Math.floor(s % 64 / 4)];
    if (note > 0) {
      playSynthNote(note, t, beat * 4, 'triangle', 0.2);
      // "Стеклянный" призвук
      playSynthNote(note * 2, t + 0.03, beat * 2, 'sine', 0.05);
    }
  }

  // Случайные "искры" в вышине
  if (Math.random() > 0.9) {
    playSynthNote(NOTES.C6 + Math.random() * 2000, t, beat * 5, 'sine', 0.03);
  }
  
  return t + beat;
};
