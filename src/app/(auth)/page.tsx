"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

type Mode = "login" | "signup";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
    { label: "Special character", pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-400"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  if (!password) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={cn("h-1 flex-1 rounded-full transition-all", i < score ? colors[score - 1] : "bg-muted")} />
        ))}
      </div>
      <p className="text-[11px] font-medium" style={{ color: score >= 3 ? "#22c55e" : "#f59e0b" }}>
        {labels[score - 1] ?? "Too weak"}
      </p>
    </div>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  // ── Validation ───────────────────────────────────────────
  function validate(): string | null {
    if (mode === "signup" && !form.name.trim()) return "Full name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Enter a valid email address.";
    if (!form.password) return "Password is required.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    if (mode === "signup" && form.password !== form.confirmPassword) return "Passwords do not match.";
    return null;
  }

  // ── Submit ───────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          email: form.email.toLowerCase().trim(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      // Verify session cookie was set by the server before navigating
      const meRes = await fetch("/api/auth/me", { credentials: "include" });
      const meData = await meRes.json().catch(() => null);

      if (!meRes.ok || !meData?.user) {
        setError("Login succeeded but session cookie not found. Try again or enable cookies in your browser.");
        return;
      }

      // Sync the shared auth context before navigating — otherwise
      // AuthProvider's route guard still sees a stale null user on the
      // very first render of the dashboard route and bounces back here.
      await refresh();

      if (mode === "signup") {
        setSuccess("Account created! Redirecting…");
        setTimeout(() => router.push("/feed"), 1200);
      } else {
        router.push("/feed");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ── Left Panel (desktop branding) ── */}
      <div className="hidden md:flex flex-col justify-between w-1/2 bg-foreground text-white p-12">
        <div>
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center font-bold text-xl text-foreground mb-8">K</div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Every swipe<br />makes you smarter.
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">
            Upload any learning resource. AI transforms it into a personalized knowledge feed — cards, flashcards, quizzes, roadmaps, and mentor conversations.
          </p>
        </div>
        <div className="space-y-4">
          {["Upload PDF, YouTube, GitHub, or paste text", "AI generates personalized swipe cards", "Memory Engine tracks what you know", "Spaced repetition brings back forgotten concepts"].map((f) => (
            <div key={f} className="flex items-center gap-3 text-white/70 text-sm">
              <CheckCircle2 size={16} className="text-accent shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel (form) ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
          {/* Logo (mobile) */}
          <div className="flex items-center gap-2.5 mb-8 md:hidden">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center font-bold text-lg">K</div>
            <span className="font-bold text-lg">KnowledgeScroll</span>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-xl bg-muted mb-7">
            {(["login", "signup"] as Mode[]).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }}
                className={cn("flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize",
                  mode === m ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>

                {/* Name (signup only) */}
                {mode === "signup" && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type="text" value={form.name} onChange={set("name")} placeholder="Sanjay Kumar"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-border focus:border-accent focus:outline-none text-sm transition-colors"
                        autoComplete="name" />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-border focus:border-accent focus:outline-none text-sm transition-colors"
                      autoComplete="email" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type={showPass ? "text" : "password"} value={form.password} onChange={set("password")}
                      placeholder={mode === "login" ? "Your password" : "Min. 8 characters"}
                      className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-border focus:border-accent focus:outline-none text-sm transition-colors"
                      autoComplete={mode === "login" ? "current-password" : "new-password"} />
                    <button type="button" onClick={() => setShowPass((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {mode === "signup" && <PasswordStrength password={form.password} />}
                </div>

                {/* Confirm Password (signup) */}
                {mode === "signup" && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type={showPass ? "text" : "password"} value={form.confirmPassword} onChange={set("confirmPassword")}
                        placeholder="Repeat password"
                        className={cn("w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none text-sm transition-colors",
                          form.confirmPassword && form.confirmPassword !== form.password ? "border-red-300 focus:border-red-400" : "border-border focus:border-accent")}
                        autoComplete="new-password" />
                    </div>
                    {form.confirmPassword && form.confirmPassword !== form.password && (
                      <p className="text-[11px] text-red-500 mt-1">Passwords do not match</p>
                    )}
                  </div>
                )}

                {/* Forgot password */}
                {mode === "login" && (
                  <div className="text-right">
                    <button type="button" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-100">
                      <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{error}</p>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                      <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                      <p className="text-sm text-emerald-700">{success}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button type="submit" whileTap={{ scale: 0.98 }} disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent font-bold text-sm hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === "login" ? "Sign In" : "Create Account"}
                      <ArrowRight size={16} />
                    </>
                  )}
                </motion.button>

                {/* Terms (signup) */}
                {mode === "signup" && (
                  <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                    By creating an account you agree to our{" "}
                    <span className="underline cursor-pointer">Terms of Service</span> and{" "}
                    <span className="underline cursor-pointer">Privacy Policy</span>.
                  </p>
                )}
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
