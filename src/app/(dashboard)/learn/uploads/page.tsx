"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  FileText, Link2, Clipboard, Video, GitBranch, Bot,
  Upload, CheckCircle2, AlertCircle, X, ChevronRight,
  Loader2, Sparkles, BookOpen, FlaskConical, Code2,
  MessageSquare, Map, Zap, Brain, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useCreateUpload, useProcessUpload, useUploads } from "@/lib/api";

// ── Source Type Grid ──────────────────────────────────────
const SOURCE_TYPES = [
  { id: "pdf",     icon: FileText,   label: "PDF",        accept: ".pdf" },
  { id: "docx",    icon: FileText,   label: "DOCX",       accept: ".docx" },
  { id: "ppt",     icon: Layers,     label: "PPT",        accept: ".ppt,.pptx" },
  { id: "url",     icon: Link2,      label: "URL",        accept: null },
  { id: "youtube", icon: Video,      label: "YouTube",    accept: null },
  { id: "github",  icon: GitBranch,  label: "GitHub",     accept: null },
  { id: "chatgpt", icon: Bot,        label: "ChatGPT",    accept: null },
  { id: "paste",   icon: Clipboard,  label: "Paste Text", accept: null },
];

// ── Generation Options ────────────────────────────────────
const GEN_OPTIONS = [
  { id: "cards",     icon: BookOpen,       label: "Scroll & Revise",      desc: "Instagram-style knowledge cards" },
  { id: "flash",     icon: Zap,            label: "Flashcards",           desc: "Spaced repetition card decks" },
  { id: "quiz",      icon: FlaskConical,   label: "Test Yourself",        desc: "Adaptive quiz with your preferences" },
  { id: "coding",    icon: Code2,          label: "Coding Questions",     desc: "LeetCode-style practice problems" },
  { id: "interview", icon: MessageSquare,  label: "Interview Questions",  desc: "Behavioral + technical questions" },
  { id: "mindmap",   icon: Map,            label: "Mind Map",             desc: "Visual concept relationships" },
  { id: "revision",  icon: Sparkles,       label: "Quick Revision",       desc: "One-page summary of all concepts" },
  { id: "ai",        icon: Brain,          label: "AI Explanation",       desc: "Mentor-guided deep explanation" },
  { id: "beginner",  icon: Brain,          label: "Beginner Mode",        desc: "ELI5 — plain English, no jargon" },
  { id: "advanced",  icon: Brain,          label: "Advanced Mode",        desc: "Deep dives with internals & trade-offs" },
];

// ── Processing Stages ─────────────────────────────────────
const STAGES = [
  "Extracting text",
  "Cleaning & normalizing",
  "Detecting concepts",
  "Building knowledge graph",
  "Generating cards",
  "Creating quiz bank",
  "Building flashcards",
  "Finalizing",
];

type UploadState = "idle" | "url-input" | "paste-input" | "uploading" | "processing" | "gen-menu" | "error";

type PendingInput = {
  filename: string;
  fileType: string;
  content?: string;
};

export default function UploadsPage() {
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [cardCount, setCardCount] = useState(0);
  const [urlInput, setUrlInput] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [selectedOutputs, setSelectedOutputs] = useState<string[]>(["cards"]);
  const [pendingInput, setPendingInput] = useState<PendingInput | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const { userId } = useAuth();
  const createUploadMutation = useCreateUpload();
  const processUploadMutation = useProcessUpload();
  const { data: uploads = [] } = useUploads(userId);

  const normalizeFileType = useCallback((name: string) => {
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    if (ext === "pptx" || ext === "ppt") return "ppt";
    if (ext === "md") return "md";
    if (ext === "txt") return "txt";
    if (ext === "pdf") return "pdf";
    if (ext === "docx") return "docx";
    if (ext === "png" || ext === "jpg" || ext === "jpeg") return "image";
    return "txt";
  }, []);

  const simulateProcessing = useCallback(async () => {
    setState("processing");
    setProgress(0);
    setCompletedStages([]);

    for (let i = 0; i < STAGES.length; i++) {
      setCurrentStage(i);
      await new Promise((r) => setTimeout(r, 300 + Math.random() * 200));
      setCompletedStages((p) => [...p, i]);
      setProgress(Math.round(((i + 1) / STAGES.length) * 100));
    }

    setCardCount(20 + Math.floor(Math.random() * 10));
    setState("gen-menu");
  }, []);

  const handleGenerate = useCallback(async (input: PendingInput | null = pendingInput) => {
    if (!input || !userId) {
      toast.error("Please sign in first or choose content to analyze.");
      return;
    }

    const requestedOutputs = selectedOutputs.filter((id) => ["quiz", "flash", "interview", "coding"].includes(id));
    const outputs = requestedOutputs.length > 0 ? requestedOutputs : ["cards"];

    setPendingInput(input);
    setState("processing");
    setProgress(20);
    setErrorMsg("");

    try {
      const uploadResult = await createUploadMutation.mutateAsync({
        userId,
        filename: input.filename,
        fileType: input.fileType,
        sourceUrl: input.fileType === "url" ? input.content : undefined,
      });

      setProgress(60);
      await processUploadMutation.mutateAsync({
        uploadId: uploadResult.uploadId,
        userId,
        content: input.content,
        fileType: input.fileType,
        outputs,
      });

      setProgress(100);
      setCardCount(20);
      setState("gen-menu");
      toast.success("Your content is now ready in your feed and learning roadmap.");
    } catch (err: any) {
      setErrorMsg(err.message ?? "Processing failed.");
      setState("error");
      toast.error(err.message ?? "Processing failed.");
    }
  }, [createUploadMutation, pendingInput, processUploadMutation, selectedOutputs, userId]);

  const onDrop = useCallback(async (files: File[]) => {
    if (!files.length) return;
    const file = files[0];
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File too large. Max size is 50MB.");
      return;
    }

    let content = "";
    if (file.type.startsWith("text/") || file.name.toLowerCase().endsWith(".md") || file.name.toLowerCase().endsWith(".txt")) {
      content = await file.text();
    }

    const input = {
      filename: file.name,
      fileType: normalizeFileType(file.name),
      content,
    };

    setPendingInput(input);
    setState("uploading");
    setProgress(0);
    for (let p = 0; p <= 100; p += 20) {
      setProgress(p);
      await new Promise((r) => setTimeout(r, 120));
    }
    await simulateProcessing();
    await handleGenerate(input);
  }, [handleGenerate, normalizeFileType, simulateProcessing]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"], "text/plain": [".txt"], "text/markdown": [".md"] },
    maxFiles: 1,
    noClick: false,
  });

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;
    const input = { filename: urlInput, fileType: "url", content: urlInput };
    setPendingInput(input);
    setState("uploading");
    setProgress(0);
    await simulateProcessing();
    await handleGenerate(input);
  };

  const handlePasteSubmit = async () => {
    if (pasteText.trim().length < 50) {
      toast.error("Paste at least 50 characters of content.");
      return;
    }
    const input = { filename: "paste-content.txt", fileType: "paste", content: pasteText };
    setPendingInput(input);
    setState("uploading");
    setProgress(0);
    await simulateProcessing();
    await handleGenerate(input);
  };

  const toggleOutput = (id: string) => {
    setSelectedOutputs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Upload & Transform</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Any learning resource → personalized knowledge cards
        </p>
      </div>

      <AnimatePresence mode="wait">

        {/* ── Idle State ── */}
        {state === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* Drop Zone */}
            <div {...getRootProps()} className={cn(
              "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all",
              isDragActive ? "border-accent bg-accent/5" : "border-border hover:border-accent/50 hover:bg-muted/50"
            )}>
              <input {...getInputProps()} />
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Upload size={24} className="text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground mb-1">
                {isDragActive ? "Drop it here!" : "Drag & drop or click to upload"}
              </p>
              <p className="text-sm text-muted-foreground">PDF · DOCX · PPT · TXT · Markdown · Images</p>
              <p className="text-xs text-muted-foreground mt-1">Max 50MB · 500 pages</p>
            </div>

            {/* Other source types */}
            <div className="grid grid-cols-4 gap-2">
              {SOURCE_TYPES.slice(3).map(({ id, icon: Icon, label }) => (
                <button key={id}
                  onClick={() => id === "url" || id === "youtube" || id === "github" ? setState("url-input") : setState("paste-input")}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-white hover:border-accent/40 hover:shadow-sm transition-all">
                  <Icon size={18} className="text-muted-foreground" />
                  <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
                </button>
              ))}
            </div>

            {/* Past Uploads */}
            {uploads.length > 0 && (
              <div>
                <p className="font-semibold text-[12px] mb-2.5 text-muted-foreground uppercase tracking-wider">Recent Uploads</p>
                <div className="space-y-2">
                  {uploads.map((u: any) => (
                    <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-white">
                      <FileText size={16} className="text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium truncate">{u.filename}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {u.processingStatus === "completed" ? `${u.extractedConceptsCount ?? 0} concepts` :
                           u.processingStatus === "processing" ? "Processing..." : "Queued"}
                        </p>
                      </div>
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full",
                        u.processingStatus === "completed" ? "text-emerald-700 bg-emerald-50" :
                        u.processingStatus === "processing" ? "text-amber-700 bg-amber-50" :
                        "text-muted-foreground bg-muted")}>
                        {u.processingStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── URL Input ── */}
        {state === "url-input" && (
          <motion.div key="url" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <button onClick={() => setState("idle")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">← Back</button>
            <h2 className="font-bold text-lg">Enter URL</h2>
            <p className="text-sm text-muted-foreground">Supports websites, YouTube videos, GitHub repos, and documentation pages.</p>
            <div className="flex gap-2">
              <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://docs.example.com/guide" onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-border focus:border-accent focus:outline-none text-sm" />
              <button onClick={handleUrlSubmit} className="px-5 py-3 rounded-xl bg-accent font-semibold text-sm hover:bg-accent-hover transition-colors">
                Analyze
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Paste Input ── */}
        {state === "paste-input" && (
          <motion.div key="paste" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <button onClick={() => setState("idle")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">← Back</button>
            <h2 className="font-bold text-lg">Paste Content</h2>
            <textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste your notes, ChatGPT conversation, AI summary, or any text…"
              className="w-full h-48 px-4 py-3 rounded-xl border-2 border-border focus:border-accent focus:outline-none text-sm resize-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{pasteText.length} chars {pasteText.length < 50 && "(need 50+)"}</span>
              <button onClick={handlePasteSubmit}
                className="px-5 py-2.5 rounded-xl bg-accent font-semibold text-sm hover:bg-accent-hover transition-colors disabled:opacity-50"
                disabled={pasteText.trim().length < 50}>
                Transform →
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Uploading ── */}
        {state === "uploading" && (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
              <Upload size={28} className="text-accent" />
            </div>
            <p className="font-bold text-lg">Uploading…</p>
            <div className="max-w-xs mx-auto">
              <div className="confidence-bar h-2 mb-2">
                <motion.div className="confidence-fill h-full bg-accent" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
              </div>
              <p className="text-sm text-muted-foreground">{progress}%</p>
            </div>
          </motion.div>
        )}

        {/* ── Processing ── */}
        {state === "processing" && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted">
              <Loader2 size={20} className="text-accent animate-spin shrink-0" />
              <div>
                <p className="font-bold">AI is analyzing your content</p>
                <p className="text-sm text-muted-foreground">{STAGES[currentStage]}</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {STAGES.map((stage, i) => (
                <div key={i} className={cn("flex items-center gap-3 p-3 rounded-xl transition-all",
                  completedStages.includes(i) ? "bg-emerald-50" : i === currentStage ? "bg-accent/5" : "opacity-40")}>
                  {completedStages.includes(i) ? (
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  ) : i === currentStage ? (
                    <Loader2 size={16} className="text-accent animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-border shrink-0" />
                  )}
                  <span className={cn("text-sm font-medium",
                    completedStages.includes(i) ? "text-emerald-700" : i === currentStage ? "text-foreground" : "text-muted-foreground")}>
                    {stage}
                  </span>
                  {completedStages.includes(i) && (
                    <span className="ml-auto text-[10px] text-emerald-600 font-semibold">Done</span>
                  )}
                </div>
              ))}
            </div>

            <div className="confidence-bar h-2">
              <motion.div className="confidence-fill h-full bg-accent" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
            </div>
            <p className="text-sm text-center text-muted-foreground">{progress}% complete</p>
          </motion.div>
        )}

        {/* ── Generation Menu ── */}
        {state === "gen-menu" && (
          <motion.div key="gen-menu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-emerald-800">Processing Complete!</p>
                <p className="text-sm text-emerald-700">{cardCount} concepts identified and ready to use</p>
              </div>
            </div>

            <div>
              <p className="font-bold mb-1">What would you like to generate?</p>
              <p className="text-sm text-muted-foreground mb-3">All outputs use the same analyzed content — no reprocessing</p>
              <div className="grid grid-cols-2 gap-2.5">
                {GEN_OPTIONS.map(({ id, icon: Icon, label, desc }) => (
                  <motion.button key={id} whileTap={{ scale: 0.97 }}
                    onClick={() => toggleOutput(id)}
                    className={cn("text-left p-3.5 rounded-xl border-2 transition-all",
                      selectedOutputs.includes(id) ? "border-accent bg-accent/5" : "border-border bg-white hover:border-accent/30")}>
                    <div className="flex items-start gap-2.5">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        selectedOutputs.includes(id) ? "bg-accent" : "bg-muted")}>
                        <Icon size={15} className={selectedOutputs.includes(id) ? "text-foreground" : "text-muted-foreground"} />
                      </div>
                      <div>
                        <p className="font-semibold text-[13px] leading-tight">{label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setSelectedOutputs(GEN_OPTIONS.map((o) => o.id))}
                className="px-4 py-2.5 rounded-xl bg-muted text-sm font-semibold hover:bg-muted/70 transition-colors">
                Select All
              </button>
              <motion.button whileTap={{ scale: 0.98 }}
                onClick={() => handleGenerate()}
                disabled={selectedOutputs.length === 0 || createUploadMutation.isPending || processUploadMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent font-bold text-sm hover:bg-accent-hover transition-colors disabled:opacity-50">
                <Sparkles size={16} />
                {createUploadMutation.isPending || processUploadMutation.isPending ? "Processing..." : `Start Learning (${selectedOutputs.length} selected)`}
              </motion.button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
