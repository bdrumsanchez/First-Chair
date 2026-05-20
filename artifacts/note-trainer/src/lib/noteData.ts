export type NoteName = "A" | "B" | "C" | "D" | "E" | "F" | "G";
export type Accidental = "sharp" | "flat" | "natural" | null;

export interface NoteInfo {
  name: NoteName;
  octave: number;
  accidental: Accidental;
  staffPosition: number;
  clef: "treble" | "bass";
}

export interface NoteWithOctave {
  note: NoteName;
  octave: number;
  accidental: Accidental;
}

const LINE_SPACING = 10;
const HALF_SPACE = LINE_SPACING / 2;

const TREBLE_TOP_Y = 50;
const BASS_BOTTOM_Y = 150;

const TREBLE_LINES_Y = [
  TREBLE_TOP_Y,
  TREBLE_TOP_Y + LINE_SPACING,
  TREBLE_TOP_Y + LINE_SPACING * 2,
  TREBLE_TOP_Y + LINE_SPACING * 3,
  TREBLE_TOP_Y + LINE_SPACING * 4,
];

const BASS_LINES_Y = [
  BASS_BOTTOM_Y - LINE_SPACING * 4,
  BASS_BOTTOM_Y - LINE_SPACING * 3,
  BASS_BOTTOM_Y - LINE_SPACING * 2,
  BASS_BOTTOM_Y - LINE_SPACING,
  BASS_BOTTOM_Y,
];

export const STAFF_CONFIG = {
  lineSpacing: LINE_SPACING,
  halfSpace: HALF_SPACE,
  trebleLinesY: TREBLE_LINES_Y,
  bassLinesY: BASS_LINES_Y,
  trebleTopY: TREBLE_TOP_Y,
  trebleBottomY: TREBLE_TOP_Y + LINE_SPACING * 4,
  bassTopY: BASS_BOTTOM_Y - LINE_SPACING * 4,
  bassBottomY: BASS_BOTTOM_Y,
  middleCY: 100,
};

const notePositionMap: Record<string, number> = {
  "G2": 150,
  "A2": 145,
  "B2": 140,
  "C3": 135,
  "D3": 130,
  "E3": 125,
  "F3": 120,
  "G3": 115,
  "A3": 110,
  "B3": 105,
  "C4": 100,
  "D4": 95,
  "E4": 90,
  "F4": 85,
  "G4": 80,
  "A4": 75,
  "B4": 70,
  "C5": 65,
  "D5": 60,
  "E5": 55,
  "F5": 50,
  "G5": 45,
  "A5": 40,
};

export function getNoteY(name: NoteName, octave: number, _accidental: Accidental = null): number {
  const key = `${name}${octave}`;
  return notePositionMap[key] ?? 100;
}

function getNoteClef(name: NoteName, octave: number): "treble" | "bass" {
  const y = getNoteY(name, octave);
  if (y <= 100) return "treble";
  return "bass";
}

export function getLedgerLines(name: NoteName, octave: number, accidental: Accidental = null): number[] {
  const y = getNoteY(name, octave, accidental);

  // Middle C ledger line
  if (y === 100) return [100];

  const lines: number[] = [];

  // Ledger lines above treble staff
  if (y < TREBLE_TOP_Y) {
    for (let ly = TREBLE_TOP_Y - LINE_SPACING; ly >= y; ly -= LINE_SPACING) {
      lines.push(ly);
    }
  }

  // Ledger lines below bass staff
  if (y > BASS_BOTTOM_Y) {
    for (let ly = BASS_BOTTOM_Y + LINE_SPACING; ly <= y; ly += LINE_SPACING) {
      lines.push(ly);
    }
  }

  return lines;
}

export const ALL_NOTES: NoteInfo[] = [
  { name: "G", octave: 2, accidental: "natural", staffPosition: 0, clef: "bass" },
  { name: "A", octave: 2, accidental: "natural", staffPosition: 1, clef: "bass" },
  { name: "B", octave: 2, accidental: "natural", staffPosition: 2, clef: "bass" },
  { name: "C", octave: 3, accidental: "natural", staffPosition: 3, clef: "bass" },
  { name: "D", octave: 3, accidental: "natural", staffPosition: 4, clef: "bass" },
  { name: "E", octave: 3, accidental: "natural", staffPosition: 5, clef: "bass" },
  { name: "F", octave: 3, accidental: "natural", staffPosition: 6, clef: "bass" },
  { name: "G", octave: 3, accidental: "natural", staffPosition: 7, clef: "bass" },
  { name: "A", octave: 3, accidental: "natural", staffPosition: 8, clef: "bass" },
  { name: "B", octave: 3, accidental: "natural", staffPosition: 9, clef: "bass" },
  { name: "C", octave: 4, accidental: "natural", staffPosition: 10, clef: "treble" },
  { name: "D", octave: 4, accidental: "natural", staffPosition: 11, clef: "treble" },
  { name: "E", octave: 4, accidental: "natural", staffPosition: 12, clef: "treble" },
  { name: "F", octave: 4, accidental: "natural", staffPosition: 13, clef: "treble" },
  { name: "G", octave: 4, accidental: "natural", staffPosition: 14, clef: "treble" },
  { name: "A", octave: 4, accidental: "natural", staffPosition: 15, clef: "treble" },
  { name: "B", octave: 4, accidental: "natural", staffPosition: 16, clef: "treble" },
  { name: "C", octave: 5, accidental: "natural", staffPosition: 17, clef: "treble" },
  { name: "D", octave: 5, accidental: "natural", staffPosition: 18, clef: "treble" },
  { name: "E", octave: 5, accidental: "natural", staffPosition: 19, clef: "treble" },
  { name: "F", octave: 5, accidental: "natural", staffPosition: 20, clef: "treble" },
  { name: "G", octave: 5, accidental: "natural", staffPosition: 21, clef: "treble" },
  { name: "A", octave: 5, accidental: "natural", staffPosition: 22, clef: "treble" },
  { name: "G", octave: 2, accidental: "sharp", staffPosition: 0, clef: "bass" },
  { name: "A", octave: 2, accidental: "sharp", staffPosition: 1, clef: "bass" },
  { name: "C", octave: 3, accidental: "sharp", staffPosition: 3, clef: "bass" },
  { name: "D", octave: 3, accidental: "sharp", staffPosition: 4, clef: "bass" },
  { name: "F", octave: 3, accidental: "sharp", staffPosition: 6, clef: "bass" },
  { name: "G", octave: 3, accidental: "sharp", staffPosition: 7, clef: "bass" },
  { name: "A", octave: 3, accidental: "sharp", staffPosition: 8, clef: "bass" },
  { name: "C", octave: 4, accidental: "sharp", staffPosition: 10, clef: "treble" },
  { name: "D", octave: 4, accidental: "sharp", staffPosition: 11, clef: "treble" },
  { name: "F", octave: 4, accidental: "sharp", staffPosition: 13, clef: "treble" },
  { name: "G", octave: 4, accidental: "sharp", staffPosition: 14, clef: "treble" },
  { name: "A", octave: 4, accidental: "sharp", staffPosition: 15, clef: "treble" },
  { name: "C", octave: 5, accidental: "sharp", staffPosition: 17, clef: "treble" },
  { name: "D", octave: 5, accidental: "sharp", staffPosition: 18, clef: "treble" },
  { name: "F", octave: 5, accidental: "sharp", staffPosition: 20, clef: "treble" },
  { name: "G", octave: 5, accidental: "sharp", staffPosition: 21, clef: "treble" },
  { name: "A", octave: 5, accidental: "sharp", staffPosition: 22, clef: "treble" },
  { name: "G", octave: 2, accidental: "flat", staffPosition: 0, clef: "bass" },
  { name: "A", octave: 2, accidental: "flat", staffPosition: 1, clef: "bass" },
  { name: "B", octave: 2, accidental: "flat", staffPosition: 2, clef: "bass" },
  { name: "D", octave: 3, accidental: "flat", staffPosition: 4, clef: "bass" },
  { name: "E", octave: 3, accidental: "flat", staffPosition: 5, clef: "bass" },
  { name: "G", octave: 3, accidental: "flat", staffPosition: 7, clef: "bass" },
  { name: "A", octave: 3, accidental: "flat", staffPosition: 8, clef: "bass" },
  { name: "B", octave: 3, accidental: "flat", staffPosition: 9, clef: "bass" },
  { name: "D", octave: 4, accidental: "flat", staffPosition: 11, clef: "treble" },
  { name: "E", octave: 4, accidental: "flat", staffPosition: 12, clef: "treble" },
  { name: "G", octave: 4, accidental: "flat", staffPosition: 14, clef: "treble" },
  { name: "A", octave: 4, accidental: "flat", staffPosition: 15, clef: "treble" },
  { name: "B", octave: 4, accidental: "flat", staffPosition: 16, clef: "treble" },
  { name: "D", octave: 5, accidental: "flat", staffPosition: 18, clef: "treble" },
  { name: "E", octave: 5, accidental: "flat", staffPosition: 19, clef: "treble" },
  { name: "G", octave: 5, accidental: "flat", staffPosition: 21, clef: "treble" },
];

// Natural notes in ascending staff-position order — used for the custom range picker
export const STAFF_NOTES_ORDERED = ALL_NOTES
  .filter((n) => n.accidental === "natural")
  .sort((a, b) => a.staffPosition - b.staffPosition);

// Predefined pedagogical note groups (staff positions only; accidentals share position with natural)
export const RANGE_PRESETS = {
  "treble-lines":  new Set([12, 14, 16, 18, 20]), // E4 G4 B4 D5 F5  (EGBDF)
  "treble-spaces": new Set([13, 15, 17, 19]),       // F4 A4 C5 E5     (FACE)
  "bass-lines":    new Set([0,  2,  4,  6,  8]),    // G2 B2 D3 F3 A3  (GBDFA)
  "bass-spaces":   new Set([1,  3,  5,  7]),         // A2 C3 E3 G3     (ACEG)
} as const;

export interface ScaleNote { name: NoteName; accidental: "natural" | "sharp" | "flat"; }
export interface MajorScale { key: string; label: string; notes: ScaleNote[]; }

export const MAJOR_SCALES: MajorScale[] = [
  { key: "C",  label: "C",  notes: [
    { name: "C", accidental: "natural" }, { name: "D", accidental: "natural" },
    { name: "E", accidental: "natural" }, { name: "F", accidental: "natural" },
    { name: "G", accidental: "natural" }, { name: "A", accidental: "natural" },
    { name: "B", accidental: "natural" },
  ]},
  { key: "G",  label: "G",  notes: [
    { name: "G", accidental: "natural" }, { name: "A", accidental: "natural" },
    { name: "B", accidental: "natural" }, { name: "C", accidental: "natural" },
    { name: "D", accidental: "natural" }, { name: "E", accidental: "natural" },
    { name: "F", accidental: "sharp" },
  ]},
  { key: "D",  label: "D",  notes: [
    { name: "D", accidental: "natural" }, { name: "E", accidental: "natural" },
    { name: "F", accidental: "sharp" },   { name: "G", accidental: "natural" },
    { name: "A", accidental: "natural" }, { name: "B", accidental: "natural" },
    { name: "C", accidental: "sharp" },
  ]},
  { key: "A",  label: "A",  notes: [
    { name: "A", accidental: "natural" }, { name: "B", accidental: "natural" },
    { name: "C", accidental: "sharp" },   { name: "D", accidental: "natural" },
    { name: "E", accidental: "natural" }, { name: "F", accidental: "sharp" },
    { name: "G", accidental: "sharp" },
  ]},
  { key: "E",  label: "E",  notes: [
    { name: "E", accidental: "natural" }, { name: "F", accidental: "sharp" },
    { name: "G", accidental: "sharp" },   { name: "A", accidental: "natural" },
    { name: "B", accidental: "natural" }, { name: "C", accidental: "sharp" },
    { name: "D", accidental: "sharp" },
  ]},
  { key: "B",  label: "B",  notes: [
    { name: "B", accidental: "natural" }, { name: "C", accidental: "sharp" },
    { name: "D", accidental: "sharp" },   { name: "E", accidental: "natural" },
    { name: "F", accidental: "sharp" },   { name: "G", accidental: "sharp" },
    { name: "A", accidental: "sharp" },
  ]},
  { key: "Fs", label: "F♯", notes: [
    { name: "F", accidental: "sharp" },   { name: "G", accidental: "sharp" },
    { name: "A", accidental: "sharp" },   { name: "B", accidental: "natural" },
    { name: "C", accidental: "sharp" },   { name: "D", accidental: "sharp" },
    // E# omitted (not in note pool) — graceful fallback if pool becomes empty
  ]},
  { key: "F",  label: "F",  notes: [
    { name: "F", accidental: "natural" }, { name: "G", accidental: "natural" },
    { name: "A", accidental: "natural" }, { name: "B", accidental: "flat" },
    { name: "C", accidental: "natural" }, { name: "D", accidental: "natural" },
    { name: "E", accidental: "natural" },
  ]},
  { key: "Bb", label: "B♭", notes: [
    { name: "B", accidental: "flat" },    { name: "C", accidental: "natural" },
    { name: "D", accidental: "natural" }, { name: "E", accidental: "flat" },
    { name: "F", accidental: "natural" }, { name: "G", accidental: "natural" },
    { name: "A", accidental: "natural" },
  ]},
  { key: "Eb", label: "E♭", notes: [
    { name: "E", accidental: "flat" },    { name: "F", accidental: "natural" },
    { name: "G", accidental: "natural" }, { name: "A", accidental: "flat" },
    { name: "B", accidental: "flat" },    { name: "C", accidental: "natural" },
    { name: "D", accidental: "natural" },
  ]},
  { key: "Ab", label: "A♭", notes: [
    { name: "A", accidental: "flat" },    { name: "B", accidental: "flat" },
    { name: "C", accidental: "natural" }, { name: "D", accidental: "flat" },
    { name: "E", accidental: "flat" },    { name: "F", accidental: "natural" },
    { name: "G", accidental: "natural" },
  ]},
  { key: "Db", label: "D♭", notes: [
    { name: "D", accidental: "flat" },    { name: "E", accidental: "flat" },
    { name: "F", accidental: "natural" }, { name: "G", accidental: "flat" },
    { name: "A", accidental: "flat" },    { name: "B", accidental: "flat" },
    { name: "C", accidental: "natural" },
  ]},
];

export function getRandomNote(
  clefFilter?: "treble" | "bass" | "both",
  accidentalFilter?: "natural" | "sharp" | "flat" | "all",
  positionFilter?: (pos: number) => boolean,
  scaleFilter?: (note: NoteInfo) => boolean,
): NoteInfo {
  let pool = ALL_NOTES;
  if (clefFilter === "treble") pool = pool.filter((n) => n.clef === "treble");
  else if (clefFilter === "bass") pool = pool.filter((n) => n.clef === "bass");

  if (accidentalFilter === "natural") pool = pool.filter((n) => n.accidental === "natural");
  else if (accidentalFilter === "sharp") pool = pool.filter((n) => n.accidental === "sharp");
  else if (accidentalFilter === "flat")  pool = pool.filter((n) => n.accidental === "flat");

  if (positionFilter) {
    const filtered = pool.filter((n) => positionFilter(n.staffPosition));
    if (filtered.length > 0) pool = filtered;
  }

  if (scaleFilter) {
    const filtered = pool.filter(scaleFilter);
    if (filtered.length > 0) pool = filtered;
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

export const NOTE_NAMES: NoteName[] = ["A", "B", "C", "D", "E", "F", "G"];

export const PIANO_OCTAVES = [1, 2, 3, 4, 5, 6];

export interface PianoKey {
  note: NoteName;
  octave: number;
  isBlack: boolean;
}

export function getPianoKeys(): PianoKey[] {
  const keys: PianoKey[] = [];
  const whiteNoteOrder: NoteName[] = ["C", "D", "E", "F", "G", "A", "B"];

  for (const octave of PIANO_OCTAVES) {
    for (const note of whiteNoteOrder) {
      if (octave === 6 && note !== "C" && note !== "D") continue;
      keys.push({ note, octave, isBlack: false });
    }
  }

  return keys;
}

export function getBlackKeyPositions(): { note: string; octave: number; afterWhiteIndex: number }[] {
  const blackKeys: { note: string; octave: number; afterWhiteIndex: number }[] = [];
  const whiteKeys = getPianoKeys();

  for (let i = 0; i < whiteKeys.length; i++) {
    const key = whiteKeys[i];
    if (key.note === "C" || key.note === "D" || key.note === "F" || key.note === "G" || key.note === "A") {
      const nextKey = whiteKeys[i + 1];
      if (nextKey) {
        blackKeys.push({
          note: key.note + "#",
          octave: key.octave,
          afterWhiteIndex: i,
        });
      }
    }
  }

  return blackKeys;
}
