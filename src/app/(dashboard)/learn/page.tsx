"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { RoadmapTree } from "@/components/roadmap/RoadmapTree";
import { ChevronRight, CheckCircle2, Clock, Upload } from "lucide-react";
import type { Roadmap } from "@/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useRoadmaps, useUploads } from "@/lib/api";

function RoadmapCard({ roadmap, onClick }: { roadmap: Roadmap; onClick: () => void }) {
  const totalNodes = roadmap.nodes?.length ?? 0;
  const completedNodes = roadmap.nodes?.filter((node) => node.status === "completed").length ?? 0;
  const pct = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;
  return (
    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={onClick}
      className="w-full text-left p-4 rounded-2xl border-2 border-border bg-white hover:border-accent/40 hover:shadow-card transition-all">
      <div className="flex items-center gap-4">
        <div className="text-3xl">{roadmap.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-[15px]">{roadmap.name}</span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </div>
          <p className="text-[12px] text-muted-foreground mb-2 line-clamp-1">{roadmap.description}</p>
          <div className="confidence-bar mb-1.5">
            <div className="confidence-fill bg-accent" style={{ width: `${pct}%`, transition: "width 0.6s ease" }} />
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><CheckCircle2 size={11} />{roadmap.completedNodes}/{roadmap.totalNodes} topics</span>
            <span className="flex items-center gap-1"><Clock size={11} />{roadmap.estimatedHours}h</span>
            <span className="font-semibold text-foreground ml-auto">{pct}%</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

export default function LearnPage() {
  const [selected, setSelected] = useState<Roadmap | null>(null);
  const [tab, setTab] = useState<"roadmaps" | "uploads">("roadmaps");
  const { userId } = useAuth();
  const { data: roadmaps = [] } = useRoadmaps(userId);
  const { data: uploads = [] } = useUploads(userId);

  if (selected) return (
    <div>
      <button onClick={() => setSelected(null)} className="flex items-center gap-2 px-4 pt-4 text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← All Roadmaps
      </button>
      <RoadmapTree roadmap={selected} />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold">Learn</h1>
        <p className="text-sm text-muted-foreground mt-1">Roadmaps &amp; uploaded content</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted mb-5">
        {[{ id: "roadmaps", label: "Roadmaps" }, { id: "uploads", label: "My Uploads" }].map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id as "roadmaps" | "uploads")}
            className={cn("flex-1 py-2 rounded-lg text-sm font-semibold transition-all",
              tab === id ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
            {label}
          </button>
        ))}
      </div>

      {tab === "roadmaps" && (
        <div className="space-y-3">
          {roadmaps.length > 0 ? roadmaps.map((r: any, i: number) => <RoadmapCard key={r.id ?? i} roadmap={r} onClick={() => setSelected(r)} />) : (
            <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Upload content to generate your first roadmap.
            </div>
          )}
        </div>
      )}

      {tab === "uploads" && (
        <div className="space-y-3">
          {uploads.length > 0 ? uploads.map((upload: any, i: number) => (
            <div key={upload.id ?? i} className="rounded-2xl border border-border bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm">{upload.filename}</p>
                  <p className="text-xs text-muted-foreground">{upload.processingStatus}</p>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                  {upload.extractedConceptsCount ?? 0} concepts
                </span>
              </div>
            </div>
          )) : (
            <div className="text-center py-16 space-y-3">
              <Upload size={32} className="text-muted-foreground/40 mx-auto" />
              <p className="font-semibold text-muted-foreground">Upload learning resources</p>
              <p className="text-sm text-muted-foreground/70">PDF, DOCX, YouTube, URLs and more</p>
              <a href="/learn/uploads" className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-xl bg-accent font-bold text-sm hover:bg-accent-hover transition-colors">
                Open Upload Center
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
