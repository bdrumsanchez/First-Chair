import { STAFF_CONFIG, getNoteY, getLedgerLines, type NoteInfo } from "@/lib/noteData";

interface GrandStaffProps {
  currentNote?: NoteInfo | null;
  feedback?: "correct" | "incorrect" | null;
  showNoteName?: boolean;
  clefMode?: "treble" | "bass" | "both";
}

const SVG_WIDTH = 320;
const SVG_HEIGHT = 200;
const STAFF_LEFT = 60;
const STAFF_RIGHT = SVG_WIDTH - 20;
const NOTE_X = 190;

// Cropped viewBox Y bounds for single-clef display
const TREBLE_VIEW_TOP = 25;
const TREBLE_VIEW_BOTTOM = 115;
const BASS_VIEW_TOP = 85;
const BASS_VIEW_BOTTOM = 170;

// Treble clef: baseline placed at G4 (Y=80), the line the curl wraps around.
// Font sized so the stem rises above F5 (Y=50) and the lower loop sits below E4 (Y=90).
function TrebleClef() {
  return (
    <text
      x={STAFF_LEFT + 2}
      y={84}
      fontSize="72"
      fontFamily="'Noto Music', 'Segoe UI Symbol', 'Apple Symbols', serif"
      fill="currentColor"
      textAnchor="start"
    >
      {"\uD834\uDD1E"}
    </text>
  );
}

// Bass clef: unicode glyph positioned so the F dot lands on F3 (Y=120).
// x inside the barline; y raised until the glyph's F reference sits at Y=120.
function BassClef() {
  return (
    <text
      x={STAFF_LEFT + 2}
      y={140}
      fontSize="42"
      fontFamily="'Noto Music', 'Segoe UI Symbol', 'Apple Symbols', serif"
      fill="currentColor"
      textAnchor="start"
    >
      {"\uD834\uDD22"}
    </text>
  );
}

function Brace() {
  const top = STAFF_CONFIG.trebleTopY;
  const bottom = STAFF_CONFIG.bassBottomY;
  const mid = (top + bottom) / 2;

  return (
    <path
      d={`M ${STAFF_LEFT - 8} ${top} 
          Q ${STAFF_LEFT - 22} ${mid} ${STAFF_LEFT - 8} ${bottom}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  );
}

function NoteHead({
  note,
  feedback,
  showName,
}: {
  note: NoteInfo;
  feedback?: "correct" | "incorrect" | null;
  showName?: boolean;
}) {
  const y = getNoteY(note.name, note.octave, note.accidental);
  const ledgerLines = getLedgerLines(note.name, note.octave, note.accidental);

  let noteColor = "hsl(220 30% 10%)";
  if (feedback === "correct") noteColor = "hsl(142 71% 45%)";
  if (feedback === "incorrect") noteColor = "hsl(0 84% 60%)";

  const stemUp = note.clef === "bass" ? y > 130 : y > 70;
  const stemX = stemUp ? NOTE_X + 7 : NOTE_X - 7;
  const stemEndY = stemUp ? y - 30 : y + 30;

  const accidentalSymbol = note.accidental === "sharp" ? "♯" : note.accidental === "flat" ? "♭" : "";

  return (
    <g>
      {ledgerLines.map((ly, i) => (
        <line
          key={i}
          x1={NOTE_X - 14}
          y1={ly}
          x2={NOTE_X + 14}
          y2={ly}
          stroke="currentColor"
          strokeWidth="1"
        />
      ))}

      {accidentalSymbol && (
        <text
          x={NOTE_X - 22}
          y={y + 4}
          fontSize="14"
          fontFamily="serif"
          fill="currentColor"
          textAnchor="middle"
        >
          {accidentalSymbol}
        </text>
      )}

      <ellipse
        cx={NOTE_X}
        cy={y}
        rx="7"
        ry="5"
        fill={noteColor}
        transform={`rotate(-15 ${NOTE_X} ${y})`}
      />

      <line
        x1={stemX}
        y1={y}
        x2={stemX}
        y2={stemEndY}
        stroke={noteColor}
        strokeWidth="1.5"
      />

      {showName && (
        <g>
          <rect
            x={NOTE_X + 18}
            y={y - 10}
            width="26"
            height="20"
            rx="4"
            fill={feedback === "correct" ? "hsl(142 71% 45%)" : feedback === "incorrect" ? "hsl(0 84% 60%)" : "hsl(250 60% 55%)"}
          />
          <text
            x={NOTE_X + 31}
            y={y + 4}
            fontSize="13"
            fontWeight="700"
            fill="white"
            textAnchor="middle"
          >
            {note.name}{note.accidental === "natural" ? "" : note.accidental === "sharp" ? "#" : "b"}
          </text>
        </g>
      )}
    </g>
  );
}

export default function GrandStaff({ currentNote, feedback, showNoteName, clefMode = "both" }: GrandStaffProps) {
  const showTreble = clefMode === "both" || clefMode === "treble";
  const showBass = clefMode === "both" || clefMode === "bass";

  let viewBox: string;
  let minHeight: number;
  if (clefMode === "treble") {
    viewBox = `0 ${TREBLE_VIEW_TOP} ${SVG_WIDTH} ${TREBLE_VIEW_BOTTOM - TREBLE_VIEW_TOP}`;
    minHeight = 120;
  } else if (clefMode === "bass") {
    viewBox = `0 ${BASS_VIEW_TOP} ${SVG_WIDTH} ${BASS_VIEW_BOTTOM - BASS_VIEW_TOP}`;
    minHeight = 120;
  } else {
    viewBox = `0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`;
    minHeight = 200;
  }

  const lineColor = "hsl(220 15% 30%)";

  return (
    <svg
      viewBox={viewBox}
      className="w-full max-w-lg mx-auto"
      style={{ minHeight }}
    >
      <rect x="0" y="0" width={SVG_WIDTH} height={SVG_HEIGHT} fill="white" />

      {showTreble && STAFF_CONFIG.trebleLinesY.map((y, i) => (
        <line key={`t${i}`} x1={STAFF_LEFT} y1={y} x2={STAFF_RIGHT} y2={y} stroke={lineColor} strokeWidth="1" />
      ))}

      {showBass && STAFF_CONFIG.bassLinesY.map((y, i) => (
        <line key={`b${i}`} x1={STAFF_LEFT} y1={y} x2={STAFF_RIGHT} y2={y} stroke={lineColor} strokeWidth="1" />
      ))}

      {showTreble && (
        <>
          <line x1={STAFF_LEFT}  y1={STAFF_CONFIG.trebleTopY} x2={STAFF_LEFT}  y2={STAFF_CONFIG.trebleBottomY} stroke={lineColor} strokeWidth="1" />
          <line x1={STAFF_RIGHT} y1={STAFF_CONFIG.trebleTopY} x2={STAFF_RIGHT} y2={STAFF_CONFIG.trebleBottomY} stroke={lineColor} strokeWidth="1" />
        </>
      )}

      {showBass && (
        <>
          <line x1={STAFF_LEFT}  y1={STAFF_CONFIG.bassTopY} x2={STAFF_LEFT}  y2={STAFF_CONFIG.bassBottomY} stroke={lineColor} strokeWidth="1" />
          <line x1={STAFF_RIGHT} y1={STAFF_CONFIG.bassTopY} x2={STAFF_RIGHT} y2={STAFF_CONFIG.bassBottomY} stroke={lineColor} strokeWidth="1" />
        </>
      )}

      {clefMode === "both" && <Brace />}
      {showTreble && <TrebleClef />}
      {showBass && <BassClef />}

      {currentNote && (
        <NoteHead note={currentNote} feedback={feedback} showName={showNoteName} />
      )}
    </svg>
  );
}
