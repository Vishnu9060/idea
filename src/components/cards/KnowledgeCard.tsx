"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  BookmarkCheck,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  Clock,
  Lightbulb,
  AlertTriangle,
  Code2,
  Share2,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn, formatReadingTime, getDifficultyColor, getConfidenceColor, getConfidenceLabel } from "@/lib/utils";
import type { KnowledgeCard } from "@/types";

interface KnowledgeCardProps {
  card: KnowledgeCard;
  isActive: boolean;
  onKnown: (id: string) => void;
  onWeak: (id: string) => void;
  onBookmark: (id: string) => void;
}

const SECTION_TABS = [
  { key: "concept",   label: "Concept",  icon: Lightbulb },
  { key: "example",   label: "Example",  icon: Code2 },
  { key: "interview", label: "Interview", icon: Zap },
  { key: "mistake",   label: "Mistake",  icon: AlertTriangle },
] as const;

type SectionKey = typeof SECTION_TABS[number]["key"];

export function KnowledgeCardComponent({
  card,
  isActive,
  onKnown,
  onWeak,
  onBookmark,
}: KnowledgeCardProps) {
  const [activeSection, setActiveSection] = useState<SectionKey>("concept");
  const [isBookmarked, setIsBookmarked] = useState(card.isBookmarked ?? false);
  const [liked, setLiked] = useState<"up" | "down" | null>(null);
  const [showFull, setShowFull] = useState(false);

  const difficultyClass = getDifficultyColor(card.difficulty);
  const confidenceColor = getConfidenceColor(card.confidenceScore ?? 0);
  const confidenceLabel = getConfidenceLabel(card.confidenceScore ?? 0);

  const handleBookmark = () => {
    setIsBookmarked((b) => !b);
    onBookmark(card.id);
  };

  const sectionContent: Record<SectionKey, React.ReactNode> = {
    concept: (
      <motion.div
        key="concept"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="space-y-3"
      >
        <p className="text-[15px] leading-relaxed text-foreground/90">
          {card.explanation}
        </p>
      </motion.div>
    ),
    example: (
      <motion.div
        key="example"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        <div className="code-block text-[12px] leading-relaxed">
          {card.example}
        </div>
      </motion.div>
    ),
    interview: (
      <motion.div
        key="interview"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="space-y-3"
      >
        <div className="flex gap-2.5 p-3.5 rounded-xl bg-accent/10 border border-accent/20">
          <Zap size={16} className="text-accent shrink-0 mt-0.5" fill="currentColor" />
          <p className="text-[14px] leading-relaxed text-foreground/90">
            {card.interviewTip}
          </p>
        </div>
      </motion.div>
    ),
    mistake: (
      <motion.div
        key="mistake"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100">
          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-[14px] leading-relaxed text-foreground/90">
            {card.commonMistake}
          </p>
        </div>
      </motion.div>
    ),
  };

  return (
    <div className="feed-card-wrapper flex items-center justify-center bg-background p-0 md:p-6">
      <motion.div
        initial={isActive ? { opacity: 0, scale: 0.97 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
        className="w-full h-full md:h-auto md:max-w-lg md:rounded-2xl md:shadow-elevated bg-white flex flex-col overflow-hidden"
        style={{ maxHeight: "100dvh" }}
      >
        {/* ── Header ─────────────────────────────────── */}
        <div className="px-5 pt-5 pb-3 shrink-0">
          {/* Topic + Difficulty + Time */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">
              {card.topic}
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-[11px] text-muted-foreground">
              {card.subtopic}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <span
                className={cn(
                  "tag-pill text-[10px]",
                  difficultyClass
                )}
              >
                {card.difficulty}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock size={11} />
                {formatReadingTime(card.readingTimeSeconds)}
              </span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-foreground leading-tight mb-2">
            {card.title}
          </h2>

          {/* Concept summary */}
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            {card.concept}
          </p>
        </div>

        {/* ── Confidence Bar ─────────────────────────── */}
        {card.confidenceScore !== undefined && (
          <div className="px-5 mb-3 shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-muted-foreground font-medium">
                Your confidence
              </span>
              <span
                className="text-[11px] font-bold"
                style={{ color: confidenceColor }}
              >
                {confidenceLabel} · {card.confidenceScore}%
              </span>
            </div>
            <div className="confidence-bar">
              <motion.div
                className="confidence-fill"
                initial={{ width: 0 }}
                animate={{ width: `${card.confidenceScore}%` }}
                transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                style={{ background: confidenceColor }}
              />
            </div>
          </div>
        )}

        {/* ── Section Tabs ───────────────────────────── */}
        <div className="px-5 mb-3 shrink-0">
          <div className="flex gap-1 p-1 rounded-xl bg-muted">
            {SECTION_TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold transition-all",
                  activeSection === key
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon size={12} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ────────────────────────────────── */}
        <div className="flex-1 px-5 overflow-y-auto no-scrollbar min-h-0">
          <AnimatePresence mode="wait">
            {sectionContent[activeSection]}
          </AnimatePresence>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-4 mb-2">
            {card.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground hover:bg-muted/70 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* ── Action Bar ─────────────────────────────── */}
        <div className="px-5 py-4 border-t border-border shrink-0">
          <div className="flex items-center gap-2">
            {/* Known */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onKnown(card.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-[13px] hover:bg-emerald-100 transition-colors border border-emerald-100"
            >
              <ThumbsUp size={15} />
              Got it
            </motion.button>

            {/* Weak */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onWeak(card.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-600 font-semibold text-[13px] hover:bg-red-100 transition-colors border border-red-100"
            >
              <ThumbsDown size={15} />
              Revise
            </motion.button>

            {/* Bookmark */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleBookmark}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-muted hover:bg-muted/70 transition-colors"
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark card"}
            >
              {isBookmarked ? (
                <BookmarkCheck size={18} className="text-accent" fill="#f5c518" />
              ) : (
                <Bookmark size={18} className="text-muted-foreground" />
              )}
            </motion.button>

            {/* Share */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-muted hover:bg-muted/70 transition-colors"
              aria-label="Share card"
            >
              <Share2 size={16} className="text-muted-foreground" />
            </motion.button>
          </div>

          {/* Swipe hint */}
          <div className="flex items-center justify-center gap-1.5 mt-3 swipe-hint">
            <ChevronDown size={14} className="text-muted-foreground/50" />
            <span className="text-[10px] text-muted-foreground/50 font-medium">
              Swipe for next concept
            </span>
            <ChevronDown size={14} className="text-muted-foreground/50" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
