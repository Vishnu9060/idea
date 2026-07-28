"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Trophy } from "lucide-react";
import { MOCK_QUIZ_QUESTIONS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/types";

export function QuizEngine({ topic, onExit }: { topic?: string; onExit: () => void }) {
  const questions = MOCK_QUIZ_QUESTIONS;
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const q = questions[current];

  const handleSelect = (opt: string) => {
    if (revealed) return;
    setSelected(opt);
    setRevealed(true);
    const correct = opt === q.correctAnswer;
    if (correct) setScore((s) => s + 1);
    setAnswers((a) => [...a, correct]);
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) { setDone(true); return; }
    setSelected(null);
    setRevealed(false);
    setCurrent((c) => c + 1);
  };

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center space-y-5">
        <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
          <Trophy size={36} className="text-accent" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Quiz Complete!</h2>
          <p className="text-muted-foreground mt-1">{topic}</p>
        </div>
        <div className="text-5xl font-bold text-foreground">{pct}%</div>
        <p className="text-muted-foreground">{score} of {questions.length} correct</p>
        <div className="flex gap-2">
          <button onClick={() => { setCurrent(0); setScore(0); setDone(false); setAnswers([]); setSelected(null); setRevealed(false); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-muted font-semibold text-sm hover:bg-muted/70 transition-colors">
            <RotateCcw size={15} /> Retry
          </button>
          <button onClick={onExit}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent font-bold text-sm hover:bg-accent-hover transition-colors">
            Done
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-semibold">{current + 1} / {questions.length}</span>
          <span className="text-muted-foreground capitalize">{q.difficulty} · {q.type}</span>
        </div>
        <div className="confidence-bar h-2">
          <div className="confidence-fill h-full bg-accent transition-all duration-500" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>
        <div className="flex gap-1">
          {answers.map((correct, i) => (
            <div key={`a-${i}`} className={cn("flex-1 h-1.5 rounded-full", correct ? "bg-emerald-400" : "bg-red-400")} />
          ))}
          {Array.from({ length: questions.length - answers.length }).map((_, i) => (
            <div key={`r-${i}`} className="flex-1 h-1.5 rounded-full bg-muted" />
          ))}
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
          className="space-y-4">
          {q.codeSnippet && <div className="code-block text-[12px]">{q.codeSnippet}</div>}
          <h2 className="text-[16px] font-bold leading-snug">{q.question}</h2>

          {/* MCQ Options */}
          {q.type === "mcq" && q.options && (
            <div className="space-y-2.5">
              {q.options.map((opt) => {
                const isSelected = selected === opt;
                const isCorrect = opt === q.correctAnswer;
                let cls = "bg-muted border-transparent text-foreground";
                if (revealed) {
                  if (isCorrect) cls = "bg-emerald-50 border-emerald-300 text-emerald-800";
                  else if (isSelected && !isCorrect) cls = "bg-red-50 border-red-300 text-red-800";
                } else if (isSelected) cls = "bg-accent/10 border-accent text-foreground";
                return (
                  <button key={opt} onClick={() => handleSelect(opt)}
                    className={cn("w-full text-left px-4 py-3 rounded-xl border-2 font-medium text-[14px] transition-all", cls,
                      !revealed && "hover:border-border active:scale-[0.99]")}>
                    <div className="flex items-center gap-3">
                      {revealed && isCorrect && <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />}
                      {revealed && isSelected && !isCorrect && <XCircle size={16} className="text-red-500 shrink-0" />}
                      <span>{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Coding question */}
          {q.type === "coding" && (
            <textarea className="w-full h-36 font-mono text-sm p-3 border-2 border-border rounded-xl resize-none focus:border-accent focus:outline-none bg-muted/30"
              placeholder="Write your solution here…" />
          )}

          {/* Theory/Interview */}
          {(q.type === "theory" || q.type === "interview") && (
            <textarea className="w-full h-28 text-sm p-3 border-2 border-border rounded-xl resize-none focus:border-accent focus:outline-none bg-muted/30"
              placeholder="Write your answer…" />
          )}

          {/* Explanation */}
          <AnimatePresence>
            {revealed && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                <div className="p-4 rounded-xl bg-muted border border-border">
                  <p className="text-[13px] font-semibold text-foreground mb-1">Explanation</p>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{q.explanation}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Next */}
      {(revealed || q.type !== "mcq") && (
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent font-bold hover:bg-accent-hover transition-colors">
          {current + 1 >= questions.length ? "See Results" : "Next"} <ChevronRight size={16} />
        </motion.button>
      )}
    </div>
  );
}
