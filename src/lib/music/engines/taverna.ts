import { NOTES, PlaySynthNoteFn } from '../constants';

export const seqTaverna = (t: number, s: number, playSynthNote: PlaySynthNoteFn) => {
  const beat = 0.4;
  const cycle = s % 64;
  if (s % 4 === 0) playSynthNote(cycle < 32 ? NOTES.A2 : NOTES.D3, t, beat * 2, 'sine', 0.8);
  if (s % 2 === 0) {
    const chord = cycle < 32 ? [NOTES.A3, NOTES.C4, NOTES.E4] : [NOTES.D3, NOTES.F4, NOTES.A4];
    chord.forEach(n => playSynthNote(n, t, beat, 'triangle', 0.25));
  }
  const mel = cycle < 32 
    ? [NOTES.E5, NOTES.D5, NOTES.C5, NOTES.B4, NOTES.A4, NOTES.B4, NOTES.C5, NOTES.A4]
    : [NOTES.F5, NOTES.E5, NOTES.D5, NOTES.C5, NOTES.B4, NOTES.C5, NOTES.D5, NOTES.B4];
  if (s % 2 === 1) playSynthNote(mel[(s % 16) >> 1], t, beat * 1.5, 'square', 0.35);
  if (Math.random() > 0.8) playSynthNote(8000 * Math.random(), t, 0.01, 'square', 0.05);
  return t + beat;
};
