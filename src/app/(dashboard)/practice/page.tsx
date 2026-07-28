"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_QUIZ_QUESTIONS } from "@/lib/mock-data";
import { QuizPreferenceModal } from "@/components/quiz/QuizPreferenceModal";
import { QuizEngine } from "@/components/quiz/QuizEngine";
import { FlaskConical, Code2, MessageSquare, BookOpen, Zap } from "lucide-react";
import type { QuizPreferences } from "@/types";

const CARDS = [
  { icon: FlaskConical, title: "Quick Quiz", desc: "Adaptive questions on your weak areas", color: "#f5c518", id: "quiz" },
  { icon: Code2, title: "Coding Practice", desc: "LeetCode-style problems with hints", color: "#6366f1", id: "coding" },
  { icon: MessageSquare, title: "Interview Prep", desc: "Mock technical & HR interviews", color: "#22c55e", id: "interview" },
  { icon: BookOpen, title: "Flashcards", desc: "Spaced repetition card decks", color: "#ef4444", id: "flash" },
];

function FlashCard({ front, back }: { front: string; back: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="flashcard-scene h-48 cursor-pointer" onClick={() => setFlipped((f) => !f)}>
      <div className={`flashcard ${flipped ? "is-flipped" : ""}`}>
        <div className="flashcard-face flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-border bg-white shadow-card">
          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Question</p>
          <p className="font-bold text-[16px] text-center leading-snug">{front}</p>
          <p className="text-[11px] text-muted-foreground mt-4">Tap to reveal answer</p>
        </div>
        <div className="flashcard-back flashcard-face flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-accent bg-accent/5">
          <p className="text-xs font-semibold text-accent mb-3 uppercase tracking-wider">Answer</p>
          <p className="text-[14px] text-center leading-relaxed text-foreground">{back}</p>
        </div>
      </div>
    </div>
  );
}

export default function PracticePage() {
  const [mode, setMode] = useState<string | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizPrefs, setQuizPrefs] = useState<QuizPreferences | null>(null);

  if (mode === "quiz" && quizPrefs) return (
    <div className="max-w-xl mx-auto">
      <button onClick={() => { setMode(null); setQuizPrefs(null); }} className="flex items-center gap-2 px-4 pt-4 text-sm text-muted-foreground hover:text-foreground">← Back</button>
      <QuizEngine topic="Mixed Topics" onExit={() => { setMode(null); setQuizPrefs(null); }} />
    </div>
  );

  if (mode === "flash") return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <button onClick={() => setMode(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5">← Back</button>
      <h2 className="font-bold text-xl mb-4">Flashcards — Java Collections</h2>
      <div className="space-y-4">
        {[
          { front: "What is the default load factor of HashMap?", back: "0.75 — rehashing occurs when 75% capacity is filled." },
          { front: "Difference between ArrayList and LinkedList?", back: "ArrayList: O(1) random access, O(n) insert/delete.\nLinkedList: O(n) access, O(1) insert/delete at head/tail." },
          { front: "When does HashMap treeify a bucket?", back: "When a bucket's chain reaches 8 nodes — converts to a red-black tree for O(log n) lookups." },
        ].map((fc, i) => <FlashCard key={i} front={fc.front} back={fc.back} />)}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Practice</h1>
        <p className="text-sm text-muted-foreground mt-1">Sharpen your skills with targeted exercises</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {CARDS.map(({ icon: Icon, title, desc, color, id }) => (
          <motion.button key={id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => { if (id === "quiz") setShowQuizModal(true); else setMode(id); }}
            className="p-4 rounded-2xl border-2 border-border bg-white hover:shadow-card transition-all text-left">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: color + "18" }}>
              <Icon size={20} style={{ color }} />
            </div>
            <p className="font-bold text-[14px] mb-1">{title}</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {showQuizModal && (
          <QuizPreferenceModal topic="Mixed Topics"
            onClose={() => setShowQuizModal(false)}
            onStart={(p) => { setQuizPrefs(p); setMode("quiz"); setShowQuizModal(false); }} />
        )}
      </AnimatePresence>
    </div>
  );
}
