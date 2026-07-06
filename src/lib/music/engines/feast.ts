import { NOTES, PlaySynthNoteFn } from '../constants';

export const seqFeast = (t: number, s: number, playSynthNote: PlaySynthNoteFn) => {
  const beat = 0.22; // Ускорили (был 0.25)
  const cycle = s % 128;
  
  // Бас (стал чуть бодрее)
  const bassNotes = cycle < 64 ? [NOTES.D3, NOTES.A2] : [NOTES.G2, NOTES.C3];
  if (s % 4 === 0) {
    playSynthNote(bassNotes[0], t, 0.35, 'sine', 0.8);
  } else if (s % 4 === 1 || s % 4 === 2) {
    playSynthNote(bassNotes[1], t, 0.15, 'sine', 0.4);
  }
  
  // Гармония (лютня)
  if (s % 8 === 0) {
    const chord = cycle < 64 ? [NOTES.D4, NOTES.F4, NOTES.A4] : [NOTES.G4, NOTES.As4, NOTES.D5];
    chord.forEach((n, i) => playSynthNote(n, t + i * 0.02, 1.2, 'triangle', 0.1));
  }

  // МЕЛОДИЯ (темп выше, но певучесть сохранена)
  const melody1 = [
    NOTES.D5, NOTES.E5, NOTES.F5, NOTES.A5, NOTES.G5, NOTES.F5, NOTES.E5, NOTES.D5,
    NOTES.A4, NOTES.D5, NOTES.F5, NOTES.G5, NOTES.E5, NOTES.F5, NOTES.D5, NOTES.D5
  ];
  const melody2 = [
    NOTES.F5, NOTES.G5, NOTES.A5, NOTES.D6, NOTES.C6, NOTES.As5, NOTES.A5, NOTES.G5,
    NOTES.A5, NOTES.F5, NOTES.D5, NOTES.E5, NOTES.F5, NOTES.E5, NOTES.D5, NOTES.D5
  ];
  
  const currentMelody = cycle < 64 ? melody1 : melody2;
  const note = currentMelody[(s % 32) / 2 | 0];

  if (s % 2 === 0) {
    playSynthNote(note, t, 0.5, 'sawtooth', 0.12);
    if (cycle >= 64 && s % 4 === 0) {
      playSynthNote(note * 0.5, t, 0.3, 'sine', 0.05);
    }
  }
  
  return t + beat;
};
