import { useState, useCallback, useRef, useEffect } from "react";
import GrandStaff from "./GrandStaff";
import PianoKeyboard from "./PianoKeyboard";
import { getRandomNote, NOTE_NAMES, RANGE_PRESETS, STAFF_NOTES_ORDERED, MAJOR_SCALES, type NoteInfo, type NoteName, type NoteWithOctave, type MajorScale } from "@/lib/noteData";
import referenceImage from "@assets/the_grand_staff_for_google_1775821516752.png";

type GameState = "menu" | "playing" | "results";
type ClefFilter = "treble" | "bass" | "both";
type AccidentalFilter = "natural" | "sharp" | "flat" | "all";
type InputMode = "buttons" | "keyboard";
type RangePreset = "all" | "treble-lines" | "treble-spaces" | "bass-lines" | "bass-spaces" | "custom";

interface RoundResult {
  note: NoteInfo;
  answer: NoteWithOctave;
  correct: boolean;
  timeMs: number;
}

const TOTAL_ROUNDS = 20;
const TIMER_PRESETS = [30, 60, 90, 120];

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m > 0 ? `${m}:` : ""}${String(s).padStart(m > 0 ? 2 : 1, "0")}`;
}

export default function NoteGame() {
  const [gameState, setGameState] = useState<GameState>("menu");
  const [clefFilter, setClefFilter] = useState<ClefFilter>("both");
  const [accidentalFilter, setAccidentalFilter] = useState<AccidentalFilter>("all");
  const [inputMode, setInputMode] = useState<InputMode>("buttons");
  const [selectedOctave, setSelectedOctave] = useState<number>(4);
  const [currentNote, setCurrentNote] = useState<NoteInfo | null>(null);
  const [round, setRound] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [showNoteName, setShowNoteName] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showReference, setShowReference] = useState(false);

  // Note range state
  const [rangePreset, setRangePreset] = useState<RangePreset>("all");
  const [customRangeMin, setCustomRangeMin] = useState(0);
  const [customRangeMax, setCustomRangeMax] = useState(22);

  // Major scale state
  const [selectedScale, setSelectedScale] = useState<MajorScale | null>(null);

  // Timer state
  const [timerDuration, setTimerDuration] = useState(0); // 0 = off
  const [customTimerInput, setCustomTimerInput] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);

  const timerEnabled = timerDuration > 0;

  const positionFilter: ((pos: number) => boolean) | undefined = (() => {
    if (rangePreset === "all") return undefined;
    if (rangePreset === "custom") return (pos) => pos >= customRangeMin && pos <= customRangeMax;
    const set = RANGE_PRESETS[rangePreset];
    return (pos) => set.has(pos as never);
  })();

  const scaleFilter: ((note: NoteInfo) => boolean) | undefined = selectedScale
    ? (note) => selectedScale.notes.some((sn) => sn.name === note.name && sn.accidental === note.accidental)
    : undefined;

  const roundStartRef = useRef<number>(0);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const endGame = useCallback(() => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = null;
    setGameState("results");
  }, []);

  const startGame = useCallback(() => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = null;
    setGameState("playing");
    setRound(1);
    setResults([]);
    setStreak(0);
    setBestStreak(0);
    setFeedback(null);
    setShowNoteName(false);
    setTimeRemaining(timerDuration);
    const note = getRandomNote(clefFilter, accidentalFilter === "all" ? undefined : accidentalFilter, positionFilter, scaleFilter);
    setCurrentNote(note);
    roundStartRef.current = Date.now();
  }, [clefFilter, accidentalFilter, timerDuration]);

  const nextRound = useCallback(() => {
    if (!timerEnabled && round >= TOTAL_ROUNDS) {
      endGame();
      return;
    }
    setFeedback(null);
    setShowNoteName(false);
    const note = getRandomNote(clefFilter, accidentalFilter === "all" ? undefined : accidentalFilter, positionFilter, scaleFilter);
    setCurrentNote(note);
    setRound((r) => r + 1);
    roundStartRef.current = Date.now();
  }, [round, clefFilter, accidentalFilter, timerEnabled, endGame]);

  const handleAnswer = useCallback(
    (answer: NoteWithOctave) => {
      if (!currentNote || feedback) return;

      const timeMs = Date.now() - roundStartRef.current;
      const correct =
        answer.note === currentNote.name &&
        answer.octave === currentNote.octave &&
        answer.accidental === currentNote.accidental;

      setResults((prev) => [...prev, { note: currentNote, answer, correct, timeMs }]);

      if (correct) {
        setFeedback("correct");
        setStreak((s) => {
          const next = s + 1;
          setBestStreak((b) => Math.max(b, next));
          return next;
        });
      } else {
        setFeedback("incorrect");
        setShowNoteName(true);
        setStreak(0);
      }

      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = setTimeout(nextRound, correct ? 600 : 1200);
    },
    [currentNote, feedback, nextRound]
  );

  // Countdown
  useEffect(() => {
    if (gameState !== "playing" || !timerEnabled) return;

    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current!);
          timerIntervalRef.current = null;
          if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
          setGameState("results");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [gameState, timerEnabled]);

  // Keyboard shortcuts
  useEffect(() => {
    if (gameState !== "playing") return;
    function handleKeyDown(e: KeyboardEvent) {
      const key = e.key.toUpperCase();
      if (NOTE_NAMES.includes(key as NoteName)) {
        handleAnswer({ note: key as NoteName, octave: selectedOctave, accidental: currentNote?.accidental ?? "natural" });
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, handleAnswer, selectedOctave, currentNote]);

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const btnBase = (active: boolean) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      active
        ? "bg-[hsl(250,60%,55%)] text-white"
        : "bg-[hsl(220,15%,22%)] text-[hsl(220,20%,65%)] hover:bg-[hsl(220,15%,28%)]"
    }`;

  // ── MENU ─────────────────────────────────────────────────────────────────
  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[hsl(250,30%,15%)] to-[hsl(220,25%,12%)] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[hsl(250,60%,55%)] mb-4">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Speed-Trainer</h1>
            <p className="text-[hsl(220,20%,65%)] text-sm">
              Test your speed at identifying notes on the grand staff
            </p>
          </div>

          <div className="bg-[hsl(220,20%,18%)] rounded-xl p-6 space-y-5 border border-[hsl(220,15%,25%)]">
            {/* Clef */}
            <div>
              <label className="block text-xs font-semibold text-[hsl(220,20%,65%)] uppercase tracking-wider mb-2">Clef Range</label>
              <div className="grid grid-cols-3 gap-2">
                {(["both", "treble", "bass"] as ClefFilter[]).map((f) => (
                  <button key={f} onClick={() => setClefFilter(f)} className={btnBase(clefFilter === f)}>
                    {f === "both" ? "Both" : f === "treble" ? "Treble" : "Bass"}
                  </button>
                ))}
              </div>
            </div>

            {/* Accidentals */}
            <div>
              <label className="block text-xs font-semibold text-[hsl(220,20%,65%)] uppercase tracking-wider mb-2">Accidentals</label>
              <div className="grid grid-cols-4 gap-2">
                {(["all", "natural", "sharp", "flat"] as AccidentalFilter[]).map((f) => (
                  <button key={f} onClick={() => setAccidentalFilter(f)} className={btnBase(accidentalFilter === f)}>
                    {f === "all" ? "All" : f === "natural" ? "Natural" : f === "sharp" ? "Sharps" : "Flats"}
                  </button>
                ))}
              </div>
            </div>

            {/* Input mode */}
            <div>
              <label className="block text-xs font-semibold text-[hsl(220,20%,65%)] uppercase tracking-wider mb-2">Answer With</label>
              <div className="grid grid-cols-2 gap-2">
                {(["buttons", "keyboard"] as InputMode[]).map((m) => (
                  <button key={m} onClick={() => setInputMode(m)} className={btnBase(inputMode === m)}>
                    {m === "buttons" ? "Note Buttons" : "Piano Keys"}
                  </button>
                ))}
              </div>
            </div>

            {/* Note Range */}
            <div>
              <label className="block text-xs font-semibold text-[hsl(220,20%,65%)] uppercase tracking-wider mb-2">Note Range</label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {([
                  { id: "all",           label: "All Notes",      sub: null },
                  { id: "treble-lines",  label: "Treble Lines",   sub: "EGBDF" },
                  { id: "treble-spaces", label: "Treble Spaces",  sub: "FACE" },
                  { id: "bass-lines",    label: "Bass Lines",     sub: "GBDFA" },
                  { id: "bass-spaces",   label: "Bass Spaces",    sub: "ACEG" },
                  { id: "custom",        label: "Custom Range",   sub: null },
                ] as { id: RangePreset; label: string; sub: string | null }[]).map(({ id, label, sub }) => (
                  <button
                    key={id}
                    onClick={() => setRangePreset(id)}
                    className={`px-2 py-2 rounded-lg text-xs font-medium transition-all leading-tight ${
                      rangePreset === id
                        ? "bg-[hsl(250,60%,55%)] text-white"
                        : "bg-[hsl(220,15%,22%)] text-[hsl(220,20%,65%)] hover:bg-[hsl(220,15%,28%)]"
                    }`}
                  >
                    {label}
                    {sub && <span className={`block text-[10px] mt-0.5 font-mono ${rangePreset === id ? "text-white/70" : "text-[hsl(220,20%,45%)]"}`}>{sub}</span>}
                  </button>
                ))}
              </div>
              {rangePreset === "custom" && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[hsl(220,20%,50%)]">From</span>
                  <select
                    value={customRangeMin}
                    onChange={(e) => setCustomRangeMin(Math.min(Number(e.target.value), customRangeMax))}
                    className="flex-1 px-2 py-1 rounded-lg bg-[hsl(220,15%,22%)] border border-[hsl(220,15%,30%)] text-white text-xs focus:outline-none focus:border-[hsl(250,60%,55%)]"
                  >
                    {STAFF_NOTES_ORDERED.map((n) => (
                      <option key={n.staffPosition} value={n.staffPosition}>
                        {n.name}{n.octave}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-[hsl(220,20%,50%)]">To</span>
                  <select
                    value={customRangeMax}
                    onChange={(e) => setCustomRangeMax(Math.max(Number(e.target.value), customRangeMin))}
                    className="flex-1 px-2 py-1 rounded-lg bg-[hsl(220,15%,22%)] border border-[hsl(220,15%,30%)] text-white text-xs focus:outline-none focus:border-[hsl(250,60%,55%)]"
                  >
                    {STAFF_NOTES_ORDERED.map((n) => (
                      <option key={n.staffPosition} value={n.staffPosition}>
                        {n.name}{n.octave}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Major Scale */}
            <div>
              <label className="block text-xs font-semibold text-[hsl(220,20%,65%)] uppercase tracking-wider mb-2">
                Major Scale {selectedScale && <span className="text-[hsl(45,93%,47%)]">— {selectedScale.label}</span>}
              </label>
              <div className="grid grid-cols-7 gap-1.5 mb-1">
                <button
                  onClick={() => setSelectedScale(null)}
                  className={`px-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedScale === null
                      ? "bg-[hsl(250,60%,55%)] text-white"
                      : "bg-[hsl(220,15%,22%)] text-[hsl(220,20%,65%)] hover:bg-[hsl(220,15%,28%)]"
                  }`}
                >
                  None
                </button>
                {MAJOR_SCALES.slice(0, 6).map((scale) => (
                  <button
                    key={scale.key}
                    onClick={() => setSelectedScale(scale)}
                    className={`px-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedScale?.key === scale.key
                        ? "bg-[hsl(250,60%,55%)] text-white"
                        : "bg-[hsl(220,15%,22%)] text-[hsl(220,20%,65%)] hover:bg-[hsl(220,15%,28%)]"
                    }`}
                  >
                    {scale.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {MAJOR_SCALES.slice(6).map((scale) => (
                  <button
                    key={scale.key}
                    onClick={() => setSelectedScale(scale)}
                    className={`px-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedScale?.key === scale.key
                        ? "bg-[hsl(250,60%,55%)] text-white"
                        : "bg-[hsl(220,15%,22%)] text-[hsl(220,20%,65%)] hover:bg-[hsl(220,15%,28%)]"
                    }`}
                  >
                    {scale.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Timer */}
            <div>
              <label className="block text-xs font-semibold text-[hsl(220,20%,65%)] uppercase tracking-wider mb-2">
                Timer {timerEnabled && <span className="text-[hsl(45,93%,47%)]">— {fmt(timerDuration)}</span>}
              </label>
              <div className="grid grid-cols-5 gap-2 mb-2">
                <button onClick={() => { setTimerDuration(0); setCustomTimerInput(""); }} className={btnBase(timerDuration === 0)}>
                  Off
                </button>
                {TIMER_PRESETS.map((t) => (
                  <button key={t} onClick={() => { setTimerDuration(t); setCustomTimerInput(""); }} className={btnBase(timerDuration === t)}>
                    {fmt(t)}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[hsl(220,20%,50%)]">Custom:</span>
                <input
                  type="number"
                  min="5"
                  max="600"
                  placeholder="seconds"
                  value={customTimerInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomTimerInput(val);
                    const n = parseInt(val);
                    if (!isNaN(n) && n >= 5 && n <= 600) setTimerDuration(n);
                  }}
                  className="w-24 px-2 py-1 rounded-lg bg-[hsl(220,15%,22%)] border border-[hsl(220,15%,30%)] text-white text-xs focus:outline-none focus:border-[hsl(250,60%,55%)]"
                />
              </div>
            </div>

            <div className="pt-1">
              <p className="text-xs text-[hsl(220,20%,50%)] mb-3 text-center">
                {timerEnabled
                  ? `${fmt(timerDuration)} to answer as many notes as possible`
                  : `${TOTAL_ROUNDS} notes · Identify note name + octave`}
                {" · "}Use keyboard (A–G) for speed
              </p>
              <button
                onClick={startGame}
                className="w-full py-3 rounded-xl bg-[hsl(250,60%,55%)] hover:bg-[hsl(250,60%,60%)] text-white font-semibold text-lg transition-all active:scale-[0.98]"
              >
                Start Game
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowReference(!showReference)}
            className="mt-4 w-full text-center text-xs text-[hsl(220,20%,50%)] hover:text-[hsl(220,20%,70%)] transition-colors"
          >
            {showReference ? "Hide" : "Show"} Reference Chart
          </button>
          {showReference && (
            <div className="mt-3 rounded-xl overflow-hidden border border-[hsl(220,15%,25%)]">
              <img src={referenceImage} alt="Grand Staff Reference" className="w-full" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── RESULTS ───────────────────────────────────────────────────────────────
  if (gameState === "results") {
    const correctCount = results.filter((r) => r.correct).length;
    const total = results.length;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const correctResults = results.filter((r) => r.correct);
    const avgTime = correctResults.length > 0
      ? Math.round(correctResults.reduce((s, r) => s + r.timeMs, 0) / correctResults.length)
      : 0;
    const fastestTime = correctResults.length > 0 ? Math.min(...correctResults.map((r) => r.timeMs)) : 0;
    const elapsedSec = timerEnabled ? timerDuration - timeRemaining : null;
    const notesPerMin = elapsedSec && elapsedSec > 0 ? Math.round((correctCount / elapsedSec) * 60) : null;

    let grade = "Keep Practicing";
    let gradeColor = "text-[hsl(0,84%,60%)]";
    if (accuracy >= 95 && avgTime < 2000) { grade = "Master"; gradeColor = "text-[hsl(45,93%,47%)]"; }
    else if (accuracy >= 85 && avgTime < 3000) { grade = "Expert"; gradeColor = "text-[hsl(250,60%,65%)]"; }
    else if (accuracy >= 70) { grade = "Getting There"; gradeColor = "text-[hsl(142,71%,55%)]"; }

    return (
      <div className="min-h-screen bg-gradient-to-b from-[hsl(250,30%,15%)] to-[hsl(220,25%,12%)] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h2 className={`text-3xl font-bold mb-1 ${gradeColor}`}>{grade}</h2>
            <p className="text-[hsl(220,20%,65%)] text-sm">
              {timerEnabled ? `${fmt(timerDuration)} challenge complete` : "Round Complete"}
            </p>
          </div>

          <div className="bg-[hsl(220,20%,18%)] rounded-xl p-6 border border-[hsl(220,15%,25%)] space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[hsl(220,15%,22%)] rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{accuracy}%</div>
                <div className="text-xs text-[hsl(220,20%,55%)]">Accuracy</div>
              </div>
              <div className="bg-[hsl(220,15%,22%)] rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{avgTime > 0 ? `${(avgTime / 1000).toFixed(1)}s` : "–"}</div>
                <div className="text-xs text-[hsl(220,20%,55%)]">Avg per Note</div>
              </div>
              <div className="bg-[hsl(220,15%,22%)] rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-[hsl(142,71%,55%)]">{correctCount}/{total}</div>
                <div className="text-xs text-[hsl(220,20%,55%)]">Correct</div>
              </div>
              {notesPerMin !== null ? (
                <div className="bg-[hsl(220,15%,22%)] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[hsl(45,93%,47%)]">{notesPerMin}</div>
                  <div className="text-xs text-[hsl(220,20%,55%)]">Notes / min</div>
                </div>
              ) : (
                <div className="bg-[hsl(220,15%,22%)] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[hsl(45,93%,47%)]">{fastestTime > 0 ? `${(fastestTime / 1000).toFixed(1)}s` : "–"}</div>
                  <div className="text-xs text-[hsl(220,20%,55%)]">Fastest</div>
                </div>
              )}
            </div>

            <div className="pt-1">
              <div className="text-xs font-semibold text-[hsl(220,20%,55%)] uppercase tracking-wider mb-2">
                Best Streak: {bestStreak}
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {results.map((r, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between px-3 py-1.5 rounded text-xs ${
                      r.correct ? "bg-[hsl(142,50%,20%)] text-[hsl(142,71%,75%)]" : "bg-[hsl(0,40%,20%)] text-[hsl(0,84%,75%)]"
                    }`}
                  >
                    <span className="font-medium">
                      {r.note.name}{r.note.octave}
                      {r.note.accidental && r.note.accidental !== "natural" ? (r.note.accidental === "sharp" ? "♯" : "♭") : ""}{" "}
                      <span className="opacity-60">({r.note.clef})</span>
                    </span>
                    <span>
                      {r.correct
                        ? `${(r.timeMs / 1000).toFixed(1)}s`
                        : `→ ${r.answer.note}${r.answer.octave}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button onClick={startGame} className="py-2.5 rounded-xl bg-[hsl(250,60%,55%)] hover:bg-[hsl(250,60%,60%)] text-white font-semibold transition-all active:scale-[0.98]">
                Play Again
              </button>
              <button onClick={() => setGameState("menu")} className="py-2.5 rounded-xl bg-[hsl(220,15%,25%)] hover:bg-[hsl(220,15%,30%)] text-[hsl(220,20%,75%)] font-semibold transition-all active:scale-[0.98]">
                Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── GAMEPLAY ──────────────────────────────────────────────────────────────
  const correctSoFar = results.filter((r) => r.correct).length;
  const isWarning = timerEnabled && timeRemaining <= 10 && timeRemaining > 0;
  const timerPct = timerEnabled ? (timeRemaining / timerDuration) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(250,30%,15%)] to-[hsl(220,25%,12%)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(220,15%,20%)]">
        {/* Left: round progress or timer bar */}
        <div className="flex items-center gap-3">
          {timerEnabled ? (
            <>
              <span className={`text-xl font-bold tabular-nums ${isWarning ? "text-[hsl(0,84%,60%)]" : "text-white"} ${isWarning ? "animate-pulse" : ""}`}>
                {fmt(timeRemaining)}
              </span>
              <div className="w-32 h-1.5 bg-[hsl(220,15%,22%)] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${isWarning ? "bg-[hsl(0,84%,60%)]" : "bg-[hsl(250,60%,55%)]"}`}
                  style={{ width: `${timerPct}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <span className="text-sm font-semibold text-[hsl(220,20%,65%)]">{round}/{TOTAL_ROUNDS}</span>
              <div className="w-32 h-1.5 bg-[hsl(220,15%,22%)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[hsl(250,60%,55%)] rounded-full transition-all duration-300"
                  style={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }}
                />
              </div>
            </>
          )}
        </div>

        {/* Right: score + streak */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-[hsl(142,71%,55%)] font-semibold">{correctSoFar} correct</span>
          {streak > 1 && (
            <span className="text-sm text-[hsl(45,93%,47%)] font-semibold animate-pulse">{streak} streak</span>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        {/* Staff */}
        <div className="w-full max-w-lg">
          <div className="text-center mb-3">
            <p className="text-[hsl(220,20%,55%)] text-sm">What note is this?</p>
          </div>
          <div className="bg-[hsl(220,20%,18%)] rounded-xl p-4 border border-[hsl(220,15%,25%)]">
            <GrandStaff currentNote={currentNote} feedback={feedback} showNoteName={showNoteName} clefMode={clefFilter} />
          </div>
        </div>

        {/* Input */}
        {inputMode === "buttons" ? (
          <div className="w-full max-w-lg">
            <div className="mb-3">
              <label className="block text-xs text-[hsl(220,20%,55%)] mb-1 text-center">Octave: {selectedOctave}</label>
              <div className="flex justify-center gap-1">
                {[2, 3, 4, 5].map((oct) => (
                  <button
                    key={oct}
                    onClick={() => setSelectedOctave(oct)}
                    disabled={!!feedback}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      selectedOctave === oct
                        ? "bg-[hsl(250,60%,55%)] text-white"
                        : "bg-[hsl(220,15%,22%)] text-[hsl(220,20%,65%)] hover:bg-[hsl(220,15%,28%)]"
                    }`}
                  >
                    {oct}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {NOTE_NAMES.map((name) => {
                let cls = "py-4 rounded-xl font-bold text-lg transition-all active:scale-95 ";
                const noteMatches = feedback && currentNote && name === currentNote.name && selectedOctave === currentNote.octave;
                if (feedback && currentNote) {
                  if (noteMatches) cls += "bg-[hsl(142,71%,45%)] text-white ";
                  else if (name === currentNote.name) cls += "bg-[hsl(45,93%,47%)] text-white ";
                  else cls += "bg-[hsl(220,15%,22%)] text-[hsl(220,20%,45%)] ";
                } else {
                  cls += "bg-[hsl(220,15%,22%)] text-white hover:bg-[hsl(220,15%,30%)] ";
                }
                return (
                  <button
                    key={name}
                    onClick={() => handleAnswer({ note: name, octave: selectedOctave, accidental: currentNote?.accidental ?? "natural" })}
                    disabled={!!feedback}
                    className={cls}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
            <p className="text-center text-xs text-[hsl(220,20%,40%)] mt-2">or press A–G on your keyboard</p>
          </div>
        ) : (
          <div className="w-full max-w-2xl bg-[hsl(220,20%,18%)] rounded-xl p-4 border border-[hsl(220,15%,25%)]">
            <PianoKeyboard
              onKeyClick={(note, octave) => handleAnswer({ note, octave, accidental: currentNote?.accidental ?? "natural" })}
              highlightedKey={
                feedback && currentNote
                  ? { note: currentNote.name, octave: currentNote.octave, accidental: currentNote.accidental, type: feedback === "correct" ? "correct" : "incorrect" }
                  : null
              }
              disabled={!!feedback}
              currentAccidental={currentNote?.accidental}
            />
            <p className="text-center text-xs text-[hsl(220,20%,40%)] mt-2">
              Click the correct key or press A–G on your keyboard
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
