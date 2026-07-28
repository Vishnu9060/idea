"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { X, FlaskConical } from "lucide-react";
import type { QuizPreferences } from "@/types";
import { cn } from "@/lib/utils";

const COUNTS = [5, 10, 20, 30, 50] as const;
const DIFFICULTIES = ["easy", "medium", "hard", "mixed"] as const;
const TYPES = ["mcq", "coding", "theory", "interview", "mixed"] as const;

export function QuizPreferenceModal({
  topic, onClose, onStart,
}: { topic: string; onClose: () => void; onStart: (p: QuizPreferences) => void }) {
  const [count, setCount] = useState<typeof COUNTS[number]>(10);
  const [difficulty, setDifficulty] = useState<typeof DIFFICULTIES[number]>("mixed");
  const [type, setType] = useState<typeof TYPES[number]>("mixed");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-modal overflow-hidden"
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">Configure Quiz</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{topic}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-5">
          {/* Count */}
          <div>
            <p className="text-sm font-semibold mb-2.5">How many questions?</p>
            <div className="flex gap-2 flex-wrap">
              {COUNTS.map((c) => (
                <button key={c} onClick={() => setCount(c)}
                  className={cn("px-4 py-2 rounded-xl font-semibold text-sm border-2 transition-all",
                    count === c ? "bg-accent border-accent text-foreground" : "bg-muted border-transparent text-muted-foreground hover:border-border")}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          {/* Difficulty */}
          <div>
            <p className="text-sm font-semibold mb-2.5">Difficulty</p>
            <div className="flex gap-2 flex-wrap">
              {DIFFICULTIES.map((d) => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={cn("px-4 py-2 rounded-xl font-semibold text-sm border-2 transition-all capitalize",
                    difficulty === d ? "bg-accent border-accent text-foreground" : "bg-muted border-transparent text-muted-foreground hover:border-border")}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          {/* Type */}
          <div>
            <p className="text-sm font-semibold mb-2.5">Question Type</p>
            <div className="flex gap-2 flex-wrap">
              {TYPES.map((t) => (
                <button key={t} onClick={() => setType(t)}
                  className={cn("px-4 py-2 rounded-xl font-semibold text-sm border-2 transition-all capitalize",
                    type === t ? "bg-accent border-accent text-foreground" : "bg-muted border-transparent text-muted-foreground hover:border-border")}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 pb-6">
          <motion.button whileTap={{ scale: 0.98 }} onClick={() => onStart({ count, difficulty, type } as QuizPreferences)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent font-bold text-foreground hover:bg-accent-hover transition-colors">
            <FlaskConical size={18} />
            Start {count} Questions
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
