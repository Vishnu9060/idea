"use client";
import { motion } from "framer-motion";
import { User, Bell, Moon, Shield, CreditCard, ChevronRight, LogOut, Star } from "lucide-react";

const SETTINGS = [
  { group: "Account", items: [
    { icon: User,       label: "Edit Profile",        desc: "Name, avatar, email" },
    { icon: Bell,       label: "Notifications",       desc: "Daily reminders, streaks" },
    { icon: Moon,       label: "Appearance",          desc: "Light / Dark mode" },
  ]},
  { group: "Learning", items: [
    { icon: Star,       label: "Learning Goals",      desc: "Daily target, topics" },
    { icon: Shield,     label: "Privacy",             desc: "Data & analytics" },
  ]},
  { group: "Subscription", items: [
    { icon: CreditCard, label: "Upgrade to Pro",      desc: "Unlimited uploads & mentors" },
  ]},
];

export default function ProfilePage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center text-3xl font-bold shadow-elevated">
          S
        </div>
        <div className="text-center">
          <p className="font-bold text-xl">Sanju</p>
          <p className="text-sm text-muted-foreground">sanju@example.com</p>
          <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
            ⚡ Free Plan
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: "Day Streak",    value: "12" },
          { label: "Cards Learned", value: "284" },
          { label: "Quiz Score",    value: "78%" },
        ].map(({ label, value }) => (
          <div key={label} className="p-3 rounded-xl bg-muted">
            <p className="text-xl font-bold">{value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Settings groups */}
      {SETTINGS.map(({ group, items }) => (
        <div key={group}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">{group}</p>
          <div className="rounded-2xl border border-border bg-white overflow-hidden divide-y divide-border">
            {items.map(({ icon: Icon, label, desc }) => (
              <motion.button key={label} whileTap={{ scale: 0.99 }}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted transition-colors text-left">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Icon size={17} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[14px]">{label}</p>
                  <p className="text-[11px] text-muted-foreground">{desc}</p>
                </div>
                <ChevronRight size={15} className="text-muted-foreground" />
              </motion.button>
            ))}
          </div>
        </div>
      ))}

      {/* Sign out */}
      <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-100 text-red-600 font-semibold text-sm hover:bg-red-50 transition-colors">
        <LogOut size={16} /> Sign Out
      </button>
    </div>
  );
}
