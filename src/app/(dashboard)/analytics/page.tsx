"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { MOCK_MEMORY, MOCK_STREAK, MOCK_DAILY_STATS } from "@/lib/mock-data";
import { getConfidenceColor, getConfidenceLabel } from "@/lib/utils";
import { Flame, Brain, TrendingDown, TrendingUp, RefreshCw, AlertCircle } from "lucide-react";
import type { ConceptMemory } from "@/types";

function MemoryCard({ m }: { m: ConceptMemory }) {
  const color = getConfidenceColor(m.confidenceScore);
  const label = getConfidenceLabel(m.confidenceScore);
  const daysAgo = Math.floor((Date.now() - new Date(m.lastReviewed).getTime()) / 86400000);
  return (
    <div className="p-3.5 rounded-xl border border-border bg-white">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-[14px]">{m.conceptKey}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{m.topic} · {daysAgo === 0 ? "Today" : `${daysAgo}d ago`}</p>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0"
          style={{ color, background: color + "18" }}>{label}</span>
      </div>
      <div className="mt-2.5 confidence-bar">
        <div className="confidence-fill" style={{ width: `${m.confidenceScore}%`, background: color, transition: "width 0.6s ease" }} />
      </div>
      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
        <span>✅ {m.correctStreak} streak</span>
        <span>🔁 {m.reviewCount} reviews</span>
        <span>{Math.round(m.retentionRate * 100)}% retention</span>
      </div>
    </div>
  );
}

function HeatMap() {
  const stats = MOCK_DAILY_STATS.slice(0, 28).reverse();
  const max = Math.max(...stats.map((s) => s.minutesActive));
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {["M","T","W","T","F","S","S"].map((d,i) => <div key={i} className="text-[9px] text-muted-foreground text-center font-medium">{d}</div>)}
      {stats.map((s, i) => {
        const intensity = max === 0 ? 0 : s.minutesActive / max;
        const bg = intensity === 0 ? "#f5f5f5" : intensity < 0.3 ? "#fef3c7" : intensity < 0.6 ? "#fde047" : intensity < 0.85 ? "#f5c518" : "#d97706";
        return <div key={i} className="heatmap-cell rounded-sm" style={{ background: bg }} title={`${s.minutesActive} min`} />;
      })}
    </div>
  );
}

export default function AnalyticsPage() {
  const streak = MOCK_STREAK;
  const weak = MOCK_MEMORY.filter((m) => m.strength === "weak" || m.strength === "forgotten");
  const strong = MOCK_MEMORY.filter((m) => m.strength === "strong");
  const goalPct = Math.min(100, Math.round((streak.minutesToday / streak.dailyGoalMinutes) * 100));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Memory Engine</h1>
        <p className="text-sm text-muted-foreground mt-1">Your personalized learning intelligence</p>
      </div>

      {/* Streak + Goal */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={18} className="text-amber-500" />
            <span className="font-bold text-2xl text-foreground">{streak.currentStreak}</span>
          </div>
          <p className="text-xs font-semibold text-amber-700">Day Streak</p>
          <p className="text-[10px] text-amber-600 mt-0.5">Best: {streak.longestStreak} days</p>
        </div>
        <div className="p-4 rounded-2xl bg-muted border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-2xl">{streak.minutesToday}</span>
            <span className="text-xs text-muted-foreground">/{streak.dailyGoalMinutes} min</span>
          </div>
          <div className="confidence-bar mb-1.5">
            <div className="confidence-fill bg-accent" style={{ width: `${goalPct}%` }} />
          </div>
          <p className="text-xs font-semibold text-muted-foreground">Today's Goal</p>
        </div>
      </div>

      {/* Memory score */}
      <div className="p-4 rounded-2xl border border-border bg-white">
        <div className="flex items-center gap-3 mb-3">
          <Brain size={18} className="text-violet-500" />
          <div>
            <p className="font-bold">Overall Memory Score</p>
            <p className="text-[11px] text-muted-foreground">Based on {MOCK_MEMORY.length} concepts tracked</p>
          </div>
          <span className="ml-auto text-2xl font-bold text-foreground">68%</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[{ label: "Strong", count: strong.length, color: "#22c55e" },
            { label: "Weak", count: weak.length, color: "#ef4444" },
            { label: "Due Review", count: 2, color: "#f59e0b" }].map(({ label, count, color }) => (
            <div key={label} className="p-2 rounded-xl bg-muted">
              <p className="text-lg font-bold" style={{ color }}>{count}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="p-4 rounded-2xl border border-border bg-white">
        <p className="font-bold mb-3">Activity — Last 28 Days</p>
        <HeatMap />
        <div className="flex items-center gap-1.5 mt-3 justify-end">
          <span className="text-[10px] text-muted-foreground">Less</span>
          {["#f5f5f5","#fef3c7","#fde047","#f5c518","#d97706"].map((c) => (
            <div key={c} className="w-3 h-3 rounded-sm" style={{ background: c }} />
          ))}
          <span className="text-[10px] text-muted-foreground">More</span>
        </div>
      </div>

      {/* Weak/Forgotten */}
      {weak.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-red-500" />
            <p className="font-bold">Needs Attention</p>
            <span className="text-[11px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-semibold ml-auto">{weak.length} concepts</span>
          </div>
          <div className="space-y-2.5">
            {weak.map((m) => <MemoryCard key={m.id} m={m} />)}
          </div>
        </div>
      )}

      {/* Strong */}
      {strong.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-emerald-500" />
            <p className="font-bold">Strong Concepts</p>
          </div>
          <div className="space-y-2.5">
            {strong.map((m) => <MemoryCard key={m.id} m={m} />)}
          </div>
        </div>
      )}
    </div>
  );
}
