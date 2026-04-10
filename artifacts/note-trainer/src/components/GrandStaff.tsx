import { STAFF_CONFIG, getNoteY, getLedgerLines, type NoteInfo } from "@/lib/noteData";

interface GrandStaffProps {
  currentNote?: NoteInfo | null;
  feedback?: "correct" | "incorrect" | null;
  showNoteName?: boolean;
}

const SVG_WIDTH = 320;
const SVG_HEIGHT = 200;
const STAFF_LEFT = 60;
const STAFF_RIGHT = SVG_WIDTH - 20;
const NOTE_X = 190;

function TrebleClef() {
  return (
    <g transform="translate(38, 52)">
      <text
        x="0"
        y="30"
        fontSize="48"
        fontFamily="serif"
        fill="currentColor"
        textAnchor="middle"
      >
        {"\uD834\uDD1E"}
      </text>
      <text
        x="0"
        y="30"
        fontSize="48"
        fontFamily="'Noto Music', 'Segoe UI Symbol', serif"
        fill="currentColor"
        textAnchor="middle"
      >
        {"\uD834\uDD1E"}
      </text>
    </g>
  );
}

function BassClef() {
  return (
    <g transform="translate(38, 108)">
      <text
        x="0"
        y="16"
        fontSize="36"
        fontFamily="serif"
        fill="currentColor"
        textAnchor="middle"
      >
        {"\uD834\uDD22"}
      </text>
      <text
        x="0"
        y="16"
        fontSize="36"
        fontFamily="'Noto Music', 'Segoe UI Symbol', serif"
        fill="currentColor"
        textAnchor="middle"
      >
        {"\uD834\uDD22"}
      </text>
    </g>
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
  const y = getNoteY(note.name, note.octave);
  const ledgerLines = getLedgerLines(note.name, note.octave);

  let noteColor = "hsl(220 30% 10%)";
  if (feedback === "correct") noteColor = "hsl(142 71% 45%)";
  if (feedback === "incorrect") noteColor = "hsl(0 84% 60%)";

  const stemUp = y > 75;
  const stemX = stemUp ? NOTE_X + 7 : NOTE_X - 7;
  const stemEndY = stemUp ? y - 30 : y + 30;

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
            width="22"
            height="20"
            rx="4"
            fill={feedback === "correct" ? "hsl(142 71% 45%)" : feedback === "incorrect" ? "hsl(0 84% 60%)" : "hsl(250 60% 55%)"}
          />
          <text
            x={NOTE_X + 29}
            y={y + 4}
            fontSize="13"
            fontWeight="700"
            fill="white"
            textAnchor="middle"
          >
            {note.name}
          </text>
        </g>
      )}
    </g>
  );
}

export default function GrandStaff({ currentNote, feedback, showNoteName }: GrandStaffProps) {
  return (
    <svg
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      className="w-full max-w-lg mx-auto"
      style={{ minHeight: 200 }}
    >
      <rect x="0" y="0" width={SVG_WIDTH} height={SVG_HEIGHT} fill="white" rx="8" />

      {STAFF_CONFIG.trebleLinesY.map((y, i) => (
        <line
          key={`t${i}`}
          x1={STAFF_LEFT}
          y1={y}
          x2={STAFF_RIGHT}
          y2={y}
          stroke="hsl(220 15% 30%)"
          strokeWidth="1"
        />
      ))}

      {STAFF_CONFIG.bassLinesY.map((y, i) => (
        <line
          key={`b${i}`}
          x1={STAFF_LEFT}
          y1={y}
          x2={STAFF_RIGHT}
          y2={y}
          stroke="hsl(220 15% 30%)"
          strokeWidth="1"
        />
      ))}

      <line
        x1={STAFF_LEFT}
        y1={STAFF_CONFIG.trebleTopY}
        x2={STAFF_LEFT}
        y2={STAFF_CONFIG.trebleBottomY}
        stroke="hsl(220 15% 30%)"
        strokeWidth="1"
      />
      <line
        x1={STAFF_LEFT}
        y1={STAFF_CONFIG.bassTopY}
        x2={STAFF_LEFT}
        y2={STAFF_CONFIG.bassBottomY}
        stroke="hsl(220 15% 30%)"
        strokeWidth="1"
      />

      <line
        x1={STAFF_RIGHT}
        y1={STAFF_CONFIG.trebleTopY}
        x2={STAFF_RIGHT}
        y2={STAFF_CONFIG.trebleBottomY}
        stroke="hsl(220 15% 30%)"
        strokeWidth="1"
      />
      <line
        x1={STAFF_RIGHT}
        y1={STAFF_CONFIG.bassTopY}
        x2={STAFF_RIGHT}
        y2={STAFF_CONFIG.bassBottomY}
        stroke="hsl(220 15% 30%)"
        strokeWidth="1"
      />

      <Brace />
      <TrebleClef />
      <BassClef />

      {currentNote && (
        <NoteHead
          note={currentNote}
          feedback={feedback}
          showName={showNoteName}
        />
      )}
    </svg>
  );
}
