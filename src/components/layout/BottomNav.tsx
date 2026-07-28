"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, BookOpen, Zap, Users, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/feed",      label: "Feed",      icon: Home },
  { href: "/learn",     label: "Learn",     icon: BookOpen },
  { href: "/practice",  label: "Practice",  icon: Zap },
  { href: "/mentors",   label: "Mentors",   icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav md:hidden" aria-label="Main navigation">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors relative min-w-[56px]",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-0 bg-accent/10 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={cn(
                  "relative z-10 transition-transform",
                  isActive && "scale-110"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium relative z-10",
                  isActive ? "font-semibold" : "font-normal"
                )}
              >
                {label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottom-dot"
                  className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-accent"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
