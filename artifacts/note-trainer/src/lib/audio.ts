const NOTE_SEMITONES: Record<string, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
};

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// sharpOffset: 0 for white keys (natural), 1 for black keys (always a sharp in pitch)
export function playPianoNote(note: string, octave: number, sharpOffset: 0 | 1 = 0): void {
  try {
    const ctx = getCtx();
    const midiNote = (octave + 1) * 12 + (NOTE_SEMITONES[note] ?? 0) + sharpOffset;
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);

    const now = ctx.currentTime;
    const duration = 2.0;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(0.4, now + 0.006);   // sharp attack
    master.gain.exponentialRampToValueAtTime(0.2, now + 0.12); // decay
    master.gain.exponentialRampToValueAtTime(0.001, now + duration); // release
    master.connect(ctx.destination);

    // Fundamental – triangle for warmth
    const o1 = ctx.createOscillator();
    o1.type = "triangle";
    o1.frequency.setValueAtTime(freq, now);
    o1.connect(master);
    o1.start(now);
    o1.stop(now + duration);

    // 2nd harmonic
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.4, now);
    const o2 = ctx.createOscillator();
    o2.type = "sine";
    o2.frequency.setValueAtTime(freq * 2, now);
    o2.connect(g2);
    g2.connect(master);
    o2.start(now);
    o2.stop(now + duration);

    // 3rd harmonic
    const g3 = ctx.createGain();
    g3.gain.setValueAtTime(0.15, now);
    const o3 = ctx.createOscillator();
    o3.type = "sine";
    o3.frequency.setValueAtTime(freq * 3, now);
    o3.connect(g3);
    g3.connect(master);
    o3.start(now);
    o3.stop(now + duration);
  } catch {
    // AudioContext unavailable
  }
}
