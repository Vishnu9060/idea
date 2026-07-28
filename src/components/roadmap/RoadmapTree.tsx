"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Circle, Lock, ChevronRight,
  BookOpen, FlaskConical, Trophy, Clock, Flame,
  ArrowLeft, Lightbulb, AlertTriangle, Zap, RotateCcw,
} from "lucide-react";
import { cn, getConfidenceColor } from "@/lib/utils";
import type { Roadmap, RoadmapNode, QuizPreferences } from "@/types";
import { QuizPreferenceModal } from "@/components/quiz/QuizPreferenceModal";
import { QuizEngine } from "@/components/quiz/QuizEngine";

interface RoadmapTreeProps {
  roadmap: Roadmap;
}

const NODE_STATUS_CONFIG = {
  locked:      { icon: Lock,         bg: "bg-muted",          border: "border-border",      text: "text-muted-foreground" },
  available:   { icon: Circle,       bg: "bg-white",          border: "border-accent",      text: "text-foreground" },
  in_progress: { icon: Flame,        bg: "bg-accent/10",      border: "border-accent",      text: "text-foreground" },
  completed:   { icon: CheckCircle2, bg: "bg-emerald-50",     border: "border-emerald-200", text: "text-emerald-700" },
};

const MASTERY_LABELS = {
  none:       { label: "—",          color: "#e5e5e5" },
  learning:   { label: "Learning",   color: "#f59e0b" },
  proficient: { label: "Proficient", color: "#3b82f6" },
  mastered:   { label: "Mastered",   color: "#22c55e" },
};

// ─── ReviseView ──────────────────────────────────────────────────────────────

function ReviseView({
  node,
  roadmapName,
  onBack,
  onTest,
}: {
  node: RoadmapNode;
  roadmapName: string;
  onBack: () => void;
  onTest: () => void;
}) {
  const mastery = MASTERY_LABELS[node.masteryLevel] ?? MASTERY_LABELS["none"];
  const confColor = getConfidenceColor(node.confidenceScore);

  // Derive study points from the node description — split on ". " or use as-is
  const bullets = node.description
    ? node.description.split(/(?<=\.)\s+/).filter(Boolean)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
      className="max-w-2xl mx-auto px-4 py-6 space-y-5"
    >
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={15} /> Back to roadmap
      </button>

      {/* Header card */}
      <div className="rounded-2xl border-2 border-accent/30 bg-accent/5 p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
            {roadmapName} · Topic {node.orderIndex}
          </span>
          {node.masteryLevel !== "none" && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ color: mastery.color, background: mastery.color + "20" }}
            >
              {mastery.label}
            </span>
          )}
        </div>
        <h2 className="text-xl font-bold text-foreground mb-1">{node.title}</h2>
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground mt-3">
          <span className="flex items-center gap-1"><Clock size={11} /> {node.estimatedHours}h estimated</span>
          {node.confidenceScore > 0 && (
            <span className="font-bold" style={{ color: confColor }}>
              {node.confidenceScore}% confidence
            </span>
          )}
        </div>
      </div>

      {/* Study content */}
      <div className="rounded-2xl border border-border bg-white p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Lightbulb size={16} className="text-accent" />
          <p className="font-bold text-[14px]">What to Study</p>
        </div>
        {bullets.length > 1 ? (
          <ul className="space-y-2.5">
            {bullets.map((point, i) => (
              <li key={i} className="flex gap-2.5 text-[13px] text-foreground/80 leading-relaxed">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>{point.replace(/\.$/, "")}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[13px] text-foreground/80 leading-relaxed">{node.description}</p>
        )}
      </div>

      {/* Interview tip */}
      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 flex gap-3">
        <Zap size={16} className="text-amber-500 shrink-0 mt-0.5" fill="currentColor" />
        <div>
          <p className="text-[12px] font-bold text-amber-700 mb-1">Interview Focus</p>
          <p className="text-[13px] text-amber-800 leading-relaxed">
            Understand both the <strong>theory</strong> and practical implementation of <strong>{node.title}</strong>.
            Be ready to explain the <em>why</em> behind the concept, not just the <em>how</em>.
          </p>
        </div>
      </div>

      {/* Common pitfall */}
      <div className="rounded-2xl border border-red-100 bg-red-50 p-4 flex gap-3">
        <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-[12px] font-bold text-red-600 mb-1">Common Mistake</p>
          <p className="text-[13px] text-red-700 leading-relaxed">
            Don't memorize — focus on understanding the mental model behind <strong>{node.title}</strong> so you can
            reason about edge cases under pressure.
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {node.status === "in_progress" && (
        <div>
          <div className="flex items-center justify-between mb-1.5 text-[11px]">
            <span className="text-muted-foreground">Your progress</span>
            <span className="font-semibold text-foreground">{node.completionPercent}%</span>
          </div>
          <div className="confidence-bar h-2">
            <motion.div
              className="confidence-fill h-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: `${node.completionPercent}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={onBack}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-muted font-semibold text-[13px] hover:bg-muted/70 transition-colors border border-border"
        >
          <RotateCcw size={14} /> Back to Roadmap
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onTest}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent font-bold text-[13px] hover:bg-accent-hover transition-colors"
        >
          <FlaskConical size={14} /> Test Yourself
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── NodeCard ────────────────────────────────────────────────────────────────

function NodeCard({
  node,
  index,
  onRevise,
  onTest,
}: {
  node: RoadmapNode;
  index: number;
  onRevise: (node: RoadmapNode) => void;
  onTest: (node: RoadmapNode) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const config = NODE_STATUS_CONFIG[node.status] ?? NODE_STATUS_CONFIG["available"];
  const mastery = MASTERY_LABELS[node.masteryLevel] ?? MASTERY_LABELS["none"];
  const confColor = getConfidenceColor(node.confidenceScore);
  const StatusIcon = config.icon;
  const isLocked = node.status === "locked";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className={cn(
        "relative rounded-2xl border-2 transition-all duration-200",
        config.bg, config.border,
        isLocked ? "opacity-50" : "cursor-pointer hover:shadow-card"
      )}
    >
      <button
        onClick={() => !isLocked && setExpanded((e) => !e)}
        className="w-full text-left p-4"
        disabled={isLocked}
        aria-expanded={expanded}
      >
        <div className="flex items-start gap-3">
          {/* Status icon */}
          <div
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
              node.status === "completed" ? "bg-emerald-100" : "bg-muted"
            )}
          >
            <StatusIcon
              size={18}
              className={cn(
                node.status === "completed" ? "text-emerald-600" :
                node.status === "in_progress" ? "text-accent" :
                node.status === "available" ? "text-foreground" :
                "text-muted-foreground"
              )}
              strokeWidth={2.2}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                Topic {node.orderIndex}
              </span>
              {node.masteryLevel !== "none" && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    color: mastery.color,
                    background: mastery.color + "20",
                  }}
                >
                  {mastery.label}
                </span>
              )}
            </div>
            <h3 className={cn("font-bold text-[15px] leading-tight", config.text)}>
              {node.title}
            </h3>
            <p className="text-[12px] text-muted-foreground mt-1 line-clamp-1">
              {node.description}
            </p>
          </div>

          {/* Right: stats + chevron */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            {node.status !== "locked" && node.confidenceScore > 0 && (
              <span
                className="text-[11px] font-bold"
                style={{ color: confColor }}
              >
                {node.confidenceScore}%
              </span>
            )}
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock size={10} />
              {node.estimatedHours}h
            </div>
            {!isLocked && (
              <ChevronRight
                size={14}
                className={cn(
                  "text-muted-foreground transition-transform",
                  expanded && "rotate-90"
                )}
              />
            )}
          </div>
        </div>

        {/* Progress bar for in-progress nodes */}
        {node.status === "in_progress" && (
          <div className="mt-3 ml-12">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground">Progress</span>
              <span className="text-[10px] font-semibold text-foreground">{node.completionPercent}%</span>
            </div>
            <div className="confidence-bar">
              <motion.div
                className="confidence-fill bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${node.completionPercent}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
        )}
      </button>

      {/* Expanded Actions */}
      <AnimatePresence>
        {expanded && !isLocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border"
          >
            <div className="px-4 py-3 flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => { e.stopPropagation(); onRevise(node); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted text-foreground font-semibold text-[13px] hover:bg-muted/70 transition-colors border border-border"
              >
                <BookOpen size={14} />
                Revise
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => { e.stopPropagation(); onTest(node); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent text-accent-fg font-semibold text-[13px] hover:bg-accent-hover transition-colors"
              >
                <FlaskConical size={14} />
                Test Yourself
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── RoadmapTree ─────────────────────────────────────────────────────────────

type View = "tree" | "revise" | "quiz";

export function RoadmapTree({ roadmap }: RoadmapTreeProps) {
  const [view, setView] = useState<View>("tree");
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);

  const totalNodes = roadmap.nodes?.length ?? 0;
  const completedNodes = roadmap.nodes?.filter((node) => node.status === "completed").length ?? 0;
  const completionPercent = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

  // ── Revise view ──
  if (view === "revise" && selectedNode) {
    return (
      <ReviseView
        node={selectedNode}
        roadmapName={roadmap.name}
        onBack={() => setView("tree")}
        onTest={() => {
          setShowQuizModal(true);
        }}
      />
    );
  }

  // ── Quiz view ──
  if (view === "quiz" && selectedNode) {
    return (
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => setView("tree")}
          className="flex items-center gap-2 px-4 pt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={15} /> Back to roadmap
        </button>
        <QuizEngine
          topic={selectedNode.title}
          onExit={() => setView("tree")}
        />
      </div>
    );
  }

  // ── Tree view ──
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="text-4xl">{roadmap.icon}</div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{roadmap.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{roadmap.description}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Completed", value: `${completedNodes}/${totalNodes}`, icon: CheckCircle2, color: "#22c55e" },
            { label: "Est. Hours", value: `${roadmap.estimatedHours}h`, icon: Clock, color: "#f5c518" },
            { label: "Progress", value: `${completionPercent}%`, icon: Trophy, color: "#8b5cf6" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-muted rounded-xl p-3 text-center">
              <Icon size={16} className="mx-auto mb-1" style={{ color }} />
              <div className="text-lg font-bold text-foreground">{value}</div>
              <div className="text-[10px] text-muted-foreground font-medium">{label}</div>
            </div>
          ))}
        </div>

        {/* Overall progress bar */}
        <div className="confidence-bar h-2">
          <motion.div
            className="confidence-fill h-full"
            style={{ background: "#f5c518" }}
            initial={{ width: 0 }}
            animate={{ width: `${completionPercent}%` }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Node List */}
      <div className="space-y-3 relative">
        {/* Vertical line */}
        <div className="absolute left-7 top-9 bottom-9 w-0.5 bg-border z-0" />

        {roadmap.nodes.map((node, index) => (
          <NodeCard
            key={node.id ?? index}
            node={node}
            index={index}
            onRevise={(n) => {
              setSelectedNode(n);
              setView("revise");
            }}
            onTest={(n) => {
              setSelectedNode(n);
              setShowQuizModal(true);
            }}
          />
        ))}
      </div>

      {/* Quiz preference modal */}
      <AnimatePresence>
        {showQuizModal && selectedNode && (
          <QuizPreferenceModal
            topic={selectedNode.title}
            onClose={() => setShowQuizModal(false)}
            onStart={(_prefs: QuizPreferences) => {
              setShowQuizModal(false);
              setView("quiz");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
