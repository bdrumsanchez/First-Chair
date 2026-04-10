import { useState, useCallback, useRef, useEffect } from "react";
import GrandStaff from "./GrandStaff";
import PianoKeyboard from "./PianoKeyboard";
import { getRandomNote, NOTE_NAMES, type NoteInfo, type NoteName } from "@/lib/noteData";
import referenceImage from "@assets/the_grand_staff_for_google_1775821516752.png";

type GameState = "menu" | "playing" | "results";
type ClefFilter = "treble" | "bass" | "both";
type InputMode = "buttons" | "keyboard";

interface RoundResult {
  note: NoteInfo;
  answer: NoteName;
  correct: boolean;
  timeMs: number;
}

const TOTAL_ROUNDS = 20;

export default function NoteGame() {
  const [gameState, setGameState] = useState<GameState>("menu");
  const [clefFilter, setClefFilter] = useState<ClefFilter>("both");
  const [inputMode, setInputMode] = useState<InputMode>("buttons");
  const [currentNote, setCurrentNote] = useState<NoteInfo | null>(null);
  const [round, setRound] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [showNoteName, setShowNoteName] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showReference, setShowReference] = useState(false);
  const roundStartRef = useRef<number>(0);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startGame = useCallback(() => {
    setGameState("playing");
    setRound(1);
    setResults([]);
    setStreak(0);
    setBestStreak(0);
    setFeedback(null);
    setShowNoteName(false);
    const note = getRandomNote(clefFilter);
    setCurrentNote(note);
    roundStartRef.current = Date.now();
  }, [clefFilter]);

  const nextRound = useCallback(() => {
    if (round >= TOTAL_ROUNDS) {
      setGameState("results");
      return;
    }
    setFeedback(null);
    setShowNoteName(false);
    const note = getRandomNote(clefFilter);
    setCurrentNote(note);
    setRound((r) => r + 1);
    roundStartRef.current = Date.now();
  }, [round, clefFilter]);

  const handleAnswer = useCallback(
    (answer: NoteName) => {
      if (!currentNote || feedback) return;

      const timeMs = Date.now() - roundStartRef.current;
      const correct = answer === currentNote.name;

      const result: RoundResult = {
        note: currentNote,
        answer,
        correct,
        timeMs,
      };

      setResults((prev) => [...prev, result]);

      if (correct) {
        setFeedback("correct");
        setStreak((s) => {
          const newStreak = s + 1;
          setBestStreak((b) => Math.max(b, newStreak));
          return newStreak;
        });
      } else {
        setFeedback("incorrect");
        setShowNoteName(true);
        setStreak(0);
      }

      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = setTimeout(() => {
        nextRound();
      }, correct ? 600 : 1200);
    },
    [currentNote, feedback, nextRound]
  );

  useEffect(() => {
    if (gameState !== "playing") return;

    function handleKeyDown(e: KeyboardEvent) {
      const key = e.key.toUpperCase();
      if (NOTE_NAMES.includes(key as NoteName)) {
        handleAnswer(key as NoteName);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, handleAnswer]);

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, []);

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
            <h1 className="text-3xl font-bold text-white mb-2">Note Trainer</h1>
            <p className="text-[hsl(220,20%,65%)] text-sm">
              Test your speed at identifying notes on the grand staff
            </p>
          </div>

          <div className="bg-[hsl(220,20%,18%)] rounded-xl p-6 space-y-5 border border-[hsl(220,15%,25%)]">
            <div>
              <label className="block text-xs font-semibold text-[hsl(220,20%,65%)] uppercase tracking-wider mb-2">
                Clef Range
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["both", "treble", "bass"] as ClefFilter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setClefFilter(f)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      clefFilter === f
                        ? "bg-[hsl(250,60%,55%)] text-white"
                        : "bg-[hsl(220,15%,22%)] text-[hsl(220,20%,65%)] hover:bg-[hsl(220,15%,28%)]"
                    }`}
                  >
                    {f === "both" ? "Both" : f === "treble" ? "Treble" : "Bass"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[hsl(220,20%,65%)] uppercase tracking-wider mb-2">
                Answer With
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["buttons", "keyboard"] as InputMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setInputMode(m)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      inputMode === m
                        ? "bg-[hsl(250,60%,55%)] text-white"
                        : "bg-[hsl(220,15%,22%)] text-[hsl(220,20%,65%)] hover:bg-[hsl(220,15%,28%)]"
                    }`}
                  >
                    {m === "buttons" ? "Note Buttons" : "Piano Keys"}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-1">
              <p className="text-xs text-[hsl(220,20%,50%)] mb-3 text-center">
                {TOTAL_ROUNDS} notes &middot; Identify each as fast as you can &middot; Use keyboard (A-G) for speed
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

  if (gameState === "results") {
    const correctCount = results.filter((r) => r.correct).length;
    const accuracy = Math.round((correctCount / results.length) * 100);
    const correctResults = results.filter((r) => r.correct);
    const avgTime =
      correctResults.length > 0
        ? Math.round(correctResults.reduce((sum, r) => sum + r.timeMs, 0) / correctResults.length)
        : 0;
    const fastestTime =
      correctResults.length > 0 ? Math.min(...correctResults.map((r) => r.timeMs)) : 0;

    let grade = "Keep Practicing";
    let gradeColor = "text-[hsl(0,84%,60%)]";
    if (accuracy >= 95 && avgTime < 2000) {
      grade = "Master";
      gradeColor = "text-[hsl(45,93%,47%)]";
    } else if (accuracy >= 85 && avgTime < 3000) {
      grade = "Expert";
      gradeColor = "text-[hsl(250,60%,65%)]";
    } else if (accuracy >= 70) {
      grade = "Getting There";
      gradeColor = "text-[hsl(142,71%,55%)]";
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-[hsl(250,30%,15%)] to-[hsl(220,25%,12%)] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h2 className={`text-3xl font-bold mb-1 ${gradeColor}`}>{grade}</h2>
            <p className="text-[hsl(220,20%,65%)] text-sm">Round Complete</p>
          </div>

          <div className="bg-[hsl(220,20%,18%)] rounded-xl p-6 border border-[hsl(220,15%,25%)] space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[hsl(220,15%,22%)] rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{accuracy}%</div>
                <div className="text-xs text-[hsl(220,20%,55%)]">Accuracy</div>
              </div>
              <div className="bg-[hsl(220,15%,22%)] rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {avgTime > 0 ? `${(avgTime / 1000).toFixed(1)}s` : "-"}
                </div>
                <div className="text-xs text-[hsl(220,20%,55%)]">Avg Time</div>
              </div>
              <div className="bg-[hsl(220,15%,22%)] rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-[hsl(142,71%,55%)]">
                  {correctCount}/{results.length}
                </div>
                <div className="text-xs text-[hsl(220,20%,55%)]">Correct</div>
              </div>
              <div className="bg-[hsl(220,15%,22%)] rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-[hsl(45,93%,47%)]">
                  {fastestTime > 0 ? `${(fastestTime / 1000).toFixed(1)}s` : "-"}
                </div>
                <div className="text-xs text-[hsl(220,20%,55%)]">Fastest</div>
              </div>
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
                      r.correct
                        ? "bg-[hsl(142,50%,20%)] text-[hsl(142,71%,75%)]"
                        : "bg-[hsl(0,40%,20%)] text-[hsl(0,84%,75%)]"
                    }`}
                  >
                    <span className="font-medium">
                      {r.note.name}{r.note.octave} ({r.note.clef})
                    </span>
                    <span>
                      {r.correct ? (
                        <span>{(r.timeMs / 1000).toFixed(1)}s</span>
                      ) : (
                        <span>
                          You said {r.answer}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={startGame}
                className="py-2.5 rounded-xl bg-[hsl(250,60%,55%)] hover:bg-[hsl(250,60%,60%)] text-white font-semibold transition-all active:scale-[0.98]"
              >
                Play Again
              </button>
              <button
                onClick={() => setGameState("menu")}
                className="py-2.5 rounded-xl bg-[hsl(220,15%,25%)] hover:bg-[hsl(220,15%,30%)] text-[hsl(220,20%,75%)] font-semibold transition-all active:scale-[0.98]"
              >
                Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const correctSoFar = results.filter((r) => r.correct).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(250,30%,15%)] to-[hsl(220,25%,12%)] flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(220,15%,20%)]">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[hsl(220,20%,65%)]">
            {round}/{TOTAL_ROUNDS}
          </span>
          <div className="w-32 h-1.5 bg-[hsl(220,15%,22%)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[hsl(250,60%,55%)] rounded-full transition-all duration-300"
              style={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[hsl(142,71%,55%)] font-semibold">
            {correctSoFar} correct
          </span>
          {streak > 1 && (
            <span className="text-sm text-[hsl(45,93%,47%)] font-semibold animate-pulse">
              {streak} streak
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        <div className="w-full max-w-lg">
          <div className="text-center mb-3">
            <p className="text-[hsl(220,20%,55%)] text-sm">
              What note is this?
            </p>
          </div>

          <div className="bg-[hsl(220,20%,18%)] rounded-xl p-4 border border-[hsl(220,15%,25%)]">
            <GrandStaff
              currentNote={currentNote}
              feedback={feedback}
              showNoteName={showNoteName}
            />
          </div>
        </div>

        {inputMode === "buttons" ? (
          <div className="w-full max-w-lg">
            <div className="grid grid-cols-7 gap-2">
              {NOTE_NAMES.map((name) => {
                let btnClass =
                  "py-4 rounded-xl font-bold text-lg transition-all active:scale-95 ";
                if (feedback && currentNote) {
                  if (name === currentNote.name) {
                    btnClass += "bg-[hsl(142,71%,45%)] text-white ";
                  } else {
                    btnClass += "bg-[hsl(220,15%,22%)] text-[hsl(220,20%,45%)] ";
                  }
                } else {
                  btnClass +=
                    "bg-[hsl(220,15%,22%)] text-white hover:bg-[hsl(220,15%,30%)] ";
                }
                return (
                  <button
                    key={name}
                    onClick={() => handleAnswer(name)}
                    disabled={!!feedback}
                    className={btnClass}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
            <p className="text-center text-xs text-[hsl(220,20%,40%)] mt-2">
              or press A-G on your keyboard
            </p>
          </div>
        ) : (
          <div className="w-full max-w-2xl bg-[hsl(220,20%,18%)] rounded-xl p-4 border border-[hsl(220,15%,25%)]">
            <PianoKeyboard
              onKeyClick={handleAnswer}
              highlightedKey={
                feedback && currentNote
                  ? { note: currentNote.name, type: feedback === "correct" ? "correct" : "incorrect" }
                  : null
              }
              disabled={!!feedback}
            />
            <p className="text-center text-xs text-[hsl(220,20%,40%)] mt-2">
              Click the correct key or press A-G on your keyboard
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
