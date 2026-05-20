import { getPianoKeys, getBlackKeyPositions, type NoteName, type Accidental } from "@/lib/noteData";
import { playPianoNote } from "@/lib/audio";

interface PianoKeyboardProps {
  onKeyClick: (note: NoteName, octave: number) => void;
  highlightedKey?: { note: NoteName; octave: number; accidental: Accidental; type: "correct" | "incorrect" } | null;
  disabled?: boolean;
  currentAccidental?: Accidental;
}

// Maps the sharp-side letter of a black key to its flat-side letter (e.g. A → B for A#/Bb)
const SHARP_TO_FLAT: Record<string, NoteName> = { A: "B", C: "D", D: "E", F: "G", G: "A" };
// Maps the flat-side letter to the sharp-side letter (e.g. B → A for Bb/A#)
const FLAT_TO_SHARP: Record<string, string> = { B: "A", D: "C", E: "D", G: "F", A: "G" };

// B#/E# are sharps that land on white keys; Cb/Fb are flats that land on white keys
function noteIsOnWhiteKey(note: NoteName, accidental: Accidental): boolean {
  if (!accidental || accidental === "natural") return true;
  if (accidental === "sharp") return note === "B" || note === "E";
  if (accidental === "flat") return note === "C" || note === "F";
  return false;
}

const WHITE_KEY_WIDTH = 28;
const WHITE_KEY_HEIGHT = 100;
const BLACK_KEY_WIDTH = 18;
const BLACK_KEY_HEIGHT = 62;

export default function PianoKeyboard({ onKeyClick, highlightedKey, disabled, currentAccidental }: PianoKeyboardProps) {
  const whiteKeys = getPianoKeys();
  const blackKeys = getBlackKeyPositions();
  const totalWidth = whiteKeys.length * WHITE_KEY_WIDTH;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${totalWidth + 2} ${WHITE_KEY_HEIGHT + 20}`}
        className="w-full max-w-2xl mx-auto"
        style={{ minHeight: 120 }}
      >
        {whiteKeys.map((key, i) => {
          const x = i * WHITE_KEY_WIDTH + 1;
          const isHighlighted =
            highlightedKey &&
            highlightedKey.note === key.note &&
            highlightedKey.octave === key.octave &&
            noteIsOnWhiteKey(highlightedKey.note, highlightedKey.accidental);
          let fill = "white";
          if (isHighlighted) {
            fill = highlightedKey.type === "correct" ? "hsl(142 71% 85%)" : "hsl(0 84% 85%)";
          }

          return (
            <g key={`w-${key.note}${key.octave}`}>
              <rect
                x={x}
                y={1}
                width={WHITE_KEY_WIDTH - 1}
                height={WHITE_KEY_HEIGHT}
                fill={fill}
                stroke="hsl(220 15% 50%)"
                strokeWidth="1"
                rx="0"
                ry="3"
                style={{ cursor: disabled ? "default" : "pointer" }}
                onClick={() => { playPianoNote(key.note, key.octave, 0); if (!disabled) onKeyClick(key.note, key.octave); }}
                onMouseDown={(e) => {
                  if (!disabled) e.currentTarget.setAttribute("fill", "hsl(220 15% 92%)");
                }}
                onMouseUp={(e) => {
                  if (!disabled) e.currentTarget.setAttribute("fill", fill);
                }}
                onMouseLeave={(e) => {
                  if (!disabled) e.currentTarget.setAttribute("fill", fill);
                }}
              />
              {key.note === "C" && (
                <text
                  x={x + WHITE_KEY_WIDTH / 2 - 0.5}
                  y={WHITE_KEY_HEIGHT - 6}
                  fontSize="8"
                  fontWeight="600"
                  fill="hsl(220 15% 55%)"
                  textAnchor="middle"
                >
                  C{key.octave}
                </text>
              )}
            </g>
          );
        })}

        {blackKeys.map((bk) => {
          const whiteX = bk.afterWhiteIndex * WHITE_KEY_WIDTH + 1;
          const x = whiteX + WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2;
          const noteName = bk.note.replace("#", "") as NoteName;

          const isHighlighted =
            highlightedKey &&
            highlightedKey.octave === bk.octave &&
            !noteIsOnWhiteKey(highlightedKey.note, highlightedKey.accidental) &&
            (
              (highlightedKey.accidental === "sharp" && highlightedKey.note === noteName) ||
              (highlightedKey.accidental === "flat" && FLAT_TO_SHARP[highlightedKey.note] === noteName)
            );

          return (
            <g key={`b-${bk.note}${bk.octave}`}>
              <rect
                x={x}
                y={1}
                width={BLACK_KEY_WIDTH}
                height={BLACK_KEY_HEIGHT}
                fill={
                  isHighlighted
                    ? highlightedKey!.type === "correct"
                      ? "hsl(142 71% 65%)"
                      : "hsl(0 84% 65%)"
                    : "hsl(220 20% 15%)"
                }
                stroke="hsl(220 15% 10%)"
                strokeWidth="1"
                rx="0"
                ry="2"
                style={{ cursor: disabled ? "default" : "pointer" }}
                onClick={() => {
                  playPianoNote(noteName, bk.octave, 1);
                  if (!disabled) {
                    const noteToSend =
                      currentAccidental === "flat" && SHARP_TO_FLAT[noteName]
                        ? SHARP_TO_FLAT[noteName]
                        : noteName;
                    onKeyClick(noteToSend, bk.octave);
                  }
                }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
