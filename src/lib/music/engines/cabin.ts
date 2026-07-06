import { NOTES, PlaySynthNoteFn } from '../constants';

export const seqCabin = (t: number, s: number, playSynthNote: PlaySynthNoteFn) => {
  const beat = 0.8;
  const cycle = s % 32;
  // Глубокий бас
  if (s % 8 === 0) playSynthNote(cycle < 16 ? NOTES.E2 : NOTES.A2, t, beat * 6, 'sine', 0.6);
  // Мягкие переборы (арпеджио)
  const arp = cycle < 16 ? [NOTES.E3, NOTES.G3, NOTES.B3, NOTES.E4] : [NOTES.A3, NOTES.C4, NOTES.E4, NOTES.A4];
  playSynthNote(arp[s % 4], t, beat * 1.2, 'sine', 0.3);
  // Соло флейта (высокая, с вибрато)
  if (s % 4 === 2) {
    const mel = cycle < 16 ? [NOTES.B4, NOTES.G4, NOTES.E4] : [NOTES.C5, NOTES.A4, NOTES.E4];
    playSynthNote(mel[Math.floor(s/4) % 3], t, beat * 2, 'triangle', 0.2);
  }
  return t + beat;
};
