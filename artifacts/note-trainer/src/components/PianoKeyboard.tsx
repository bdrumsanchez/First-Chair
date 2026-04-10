import { getPianoKeys, getBlackKeyPositions, type NoteName } from "@/lib/noteData";

interface PianoKeyboardProps {
  onKeyClick: (note: NoteName) => void;
  highlightedKey?: { note: NoteName; type: "correct" | "incorrect" } | null;
  disabled?: boolean;
}

const WHITE_KEY_WIDTH = 28;
const WHITE_KEY_HEIGHT = 100;
const BLACK_KEY_WIDTH = 18;
const BLACK_KEY_HEIGHT = 62;

export default function PianoKeyboard({ onKeyClick, highlightedKey, disabled }: PianoKeyboardProps) {
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
          const isHighlighted = highlightedKey && highlightedKey.note === key.note;
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
                onClick={() => !disabled && onKeyClick(key.note)}
                onMouseDown={(e) => {
                  if (!disabled) {
                    const rect = e.currentTarget;
                    rect.setAttribute("fill", "hsl(220 15% 92%)");
                  }
                }}
                onMouseUp={(e) => {
                  if (!disabled) {
                    const rect = e.currentTarget;
                    rect.setAttribute("fill", fill);
                  }
                }}
                onMouseLeave={(e) => {
                  if (!disabled) {
                    const rect = e.currentTarget;
                    rect.setAttribute("fill", fill);
                  }
                }}
              />
              {(key.note === "C") && (
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

          return (
            <rect
              key={`b-${bk.note}${bk.octave}`}
              x={x}
              y={1}
              width={BLACK_KEY_WIDTH}
              height={BLACK_KEY_HEIGHT}
              fill="hsl(220 20% 15%)"
              stroke="hsl(220 15% 10%)"
              strokeWidth="1"
              rx="0"
              ry="2"
            />
          );
        })}
      </svg>
    </div>
  );
}
