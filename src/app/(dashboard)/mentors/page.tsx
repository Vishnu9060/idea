"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { MOCK_MENTORS } from "@/lib/mock-data";
import type { Mentor, MentorMessage } from "@/types";
import { Send, ArrowLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

function MentorCard({ mentor, onClick }: { mentor: Mentor; onClick: () => void }) {
  return (
    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClick}
      className="w-full text-left p-4 rounded-2xl border-2 border-border bg-white hover:border-accent/40 hover:shadow-card transition-all">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: mentor.color + "18" }}>
          {mentor.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-bold text-[15px]">{mentor.name}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <p className="text-xs font-semibold text-muted-foreground mb-1">{mentor.specialty}</p>
          <p className="text-[12px] text-muted-foreground line-clamp-2">{mentor.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {mentor.topics.slice(0, 3).map((t) => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function MentorChat({ mentor, onBack }: { mentor: Mentor; onBack: () => void }) {
  const [messages, setMessages] = useState<MentorMessage[]>([
    { role: "assistant", content: `Hey! I'm ${mentor.name} 👋 I specialize in ${mentor.specialty}. What would you like to learn today? I can help you with concepts, review your weak areas, or run a quick quiz!`, timestamp: new Date().toISOString() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: MentorMessage = { role: "user", content: input, timestamp: new Date().toISOString() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    // Simulate AI response
    setTimeout(() => {
      const replies: Record<string, string> = {
        java: "Great question! In Java, this relates to the JVM's memory model. Let me break it down for you with an example...",
        python: "Pythonic answer incoming! 🐍 The key insight here is how Python handles this internally. Here's how it works...",
        devops: "From a DevOps perspective, this is a common pattern. The best practice here is to automate everything and measure twice...",
        cybersecurity: "Security-first thinking! This is exactly the kind of vulnerability attackers exploit. Here's how to protect against it...",
        ai: "Fascinating from an AI perspective! This connects to how large language models process information. The math behind it is elegant...",
        system_design: "Let's think about this at scale. If you had 1 million users, here's how the architecture would need to evolve...",
        interview: "Perfect interview scenario! Here's how I'd structure your answer using STAR method: Situation, Task, Action, Result...",
        placement: "Based on company patterns I've seen, this question appears frequently at product-based companies. Here's the strategy...",
        aptitude: "Let's solve this step by step. The key formula here is... and here's a shortcut most people miss...",
        tech_news: "🔥 Hot off the press! Here's what's trending in tech right now and why it matters for your career...",
      };
      setMessages((m) => [...m, { role: "assistant", content: replies[mentor.id] ?? "That's a great topic! Let me help you understand it better...", timestamp: new Date().toISOString() }]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-56px)] md:h-[calc(100vh-80px)] max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-white sticky top-0 z-10">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style={{ background: mentor.color + "18" }}>{mentor.avatar}</div>
        <div>
          <p className="font-bold text-[15px]">{mentor.name}</p>
          <p className="text-[11px] text-muted-foreground">{mentor.specialty}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-[11px] text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 mr-2 mt-0.5" style={{ background: mentor.color + "18" }}>{mentor.avatar}</div>
            )}
            <div className={cn("max-w-[78%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed",
              msg.role === "user" ? "bg-foreground text-white rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm")}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: mentor.color + "18" }}>{mentor.avatar}</div>
            <div className="bg-muted px-4 py-2.5 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                {[0,1,2].map((i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-white">
        <div className="flex gap-2 items-end">
          <div className="flex-1 bg-muted rounded-2xl px-4 py-2.5 flex items-center gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder={`Ask ${mentor.name} anything…`}
              className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground" />
            <Sparkles size={14} className="text-muted-foreground/60 shrink-0" />
          </div>
          <motion.button whileTap={{ scale: 0.92 }} onClick={sendMessage}
            className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center hover:bg-accent-hover transition-colors shrink-0">
            <Send size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default function MentorsPage() {
  const [selected, setSelected] = useState<Mentor | null>(null);

  if (selected) return <MentorChat mentor={selected} onBack={() => setSelected(null)} />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AI Mentors</h1>
        <p className="text-muted-foreground text-sm mt-1">Specialized agents with memory, personality & expertise</p>
      </div>
      <div className="grid gap-3">
        {MOCK_MENTORS.map((mentor) => (
          <MentorCard key={mentor.id} mentor={mentor} onClick={() => setSelected(mentor)} />
        ))}
      </div>
    </div>
  );
}
