export type NoteName = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export interface NoteInfo {
  name: NoteName;
  octave: number;
  staffPosition: number;
  clef: "treble" | "bass";
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

export function getNoteY(name: NoteName, octave: number): number {
  const key = `${name}${octave}`;
  return notePositionMap[key] ?? 100;
}

function getNoteClef(name: NoteName, octave: number): "treble" | "bass" {
  const y = getNoteY(name, octave);
  if (y <= 100) return "treble";
  return "bass";
}

export function getLedgerLines(name: NoteName, octave: number): number[] {
  const y = getNoteY(name, octave);
  const lines: number[] = [];

  if (y === 100) {
    lines.push(100);
  }

  if (y >= 100) {
    for (let ly = 100; ly <= y; ly += LINE_SPACING) {
      if (ly > STAFF_CONFIG.bassTopY - HALF_SPACE && ly < STAFF_CONFIG.bassTopY) continue;
      if (ly > STAFF_CONFIG.trebleBottomY && ly < STAFF_CONFIG.bassTopY) {
        lines.push(ly);
      }
    }
  }

  if (y < TREBLE_TOP_Y) {
    for (let ly = TREBLE_TOP_Y - LINE_SPACING; ly >= y; ly -= LINE_SPACING) {
      lines.push(ly);
    }
  }

  if (y > BASS_BOTTOM_Y) {
    for (let ly = BASS_BOTTOM_Y + LINE_SPACING; ly <= y; ly += LINE_SPACING) {
      lines.push(ly);
    }
  }

  if (y === 100) {
    return [100];
  }

  return lines;
}

export const ALL_NOTES: NoteInfo[] = [
  { name: "G", octave: 2, staffPosition: 0, clef: "bass" },
  { name: "A", octave: 2, staffPosition: 1, clef: "bass" },
  { name: "B", octave: 2, staffPosition: 2, clef: "bass" },
  { name: "C", octave: 3, staffPosition: 3, clef: "bass" },
  { name: "D", octave: 3, staffPosition: 4, clef: "bass" },
  { name: "E", octave: 3, staffPosition: 5, clef: "bass" },
  { name: "F", octave: 3, staffPosition: 6, clef: "bass" },
  { name: "G", octave: 3, staffPosition: 7, clef: "bass" },
  { name: "A", octave: 3, staffPosition: 8, clef: "bass" },
  { name: "B", octave: 3, staffPosition: 9, clef: "bass" },
  { name: "C", octave: 4, staffPosition: 10, clef: "treble" },
  { name: "D", octave: 4, staffPosition: 11, clef: "treble" },
  { name: "E", octave: 4, staffPosition: 12, clef: "treble" },
  { name: "F", octave: 4, staffPosition: 13, clef: "treble" },
  { name: "G", octave: 4, staffPosition: 14, clef: "treble" },
  { name: "A", octave: 4, staffPosition: 15, clef: "treble" },
  { name: "B", octave: 4, staffPosition: 16, clef: "treble" },
  { name: "C", octave: 5, staffPosition: 17, clef: "treble" },
  { name: "D", octave: 5, staffPosition: 18, clef: "treble" },
  { name: "E", octave: 5, staffPosition: 19, clef: "treble" },
  { name: "F", octave: 5, staffPosition: 20, clef: "treble" },
  { name: "G", octave: 5, staffPosition: 21, clef: "treble" },
  { name: "A", octave: 5, staffPosition: 22, clef: "treble" },
];

export function getRandomNote(clefFilter?: "treble" | "bass" | "both"): NoteInfo {
  let pool = ALL_NOTES;
  if (clefFilter === "treble") {
    pool = ALL_NOTES.filter((n) => n.clef === "treble");
  } else if (clefFilter === "bass") {
    pool = ALL_NOTES.filter((n) => n.clef === "bass");
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

export const NOTE_NAMES: NoteName[] = ["A", "B", "C", "D", "E", "F", "G"];

export const PIANO_OCTAVES = [2, 3, 4, 5];

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
      if (octave === 2 && (note === "C" || note === "D" || note === "E" || note === "F")) continue;
      if (octave === 5 && (note === "B")) continue;
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
