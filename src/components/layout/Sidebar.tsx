"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home, BookOpen, Zap, Users, BarChart2,
  Settings, Bell, Search, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/feed",      label: "Feed",      icon: Home },
  { href: "/learn",     label: "Learn",     icon: BookOpen },
  { href: "/practice",  label: "Practice",  icon: Zap },
  { href: "/mentors",   label: "Mentors",   icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-border bg-background shrink-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-border">
        <Link href="/feed" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center font-bold text-lg shadow-sm group-hover:shadow-md transition-shadow">
            K
          </div>
          <div>
            <p className="font-bold text-foreground tracking-tight leading-tight">
              Knowledge
            </p>
            <p className="text-xs text-muted-foreground font-medium">Scroll</p>
          </div>
        </Link>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-muted text-muted-foreground text-sm hover:bg-muted/80 transition-colors">
          <Search size={15} />
          <span>Search anything…</span>
          <kbd className="ml-auto text-[10px] font-medium bg-border px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5" aria-label="Sidebar navigation">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors relative group",
                isActive
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute inset-0 bg-muted rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-r" />
              )}
              <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} className="relative z-10 shrink-0" />
              <span className="relative z-10">{label}</span>
              {isActive && (
                <ChevronRight size={14} className="relative z-10 ml-auto text-muted-foreground" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border space-y-1">
        <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Settings size={18} strokeWidth={1.8} />
          Settings
        </Link>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Bell size={18} strokeWidth={1.8} />
          Notifications
        </button>
      </div>
    </aside>
  );
}
