import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatReadingTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s read`;
  const mins = Math.floor(seconds / 60);
  return `${mins} min read`;
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "beginner":
      return "text-emerald-600 bg-emerald-50";
    case "intermediate":
      return "text-amber-600 bg-amber-50";
    case "advanced":
      return "text-red-600 bg-red-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
}

export function getConfidenceLabel(score: number): string {
  if (score >= 85) return "Strong";
  if (score >= 65) return "Good";
  if (score >= 45) return "Learning";
  if (score >= 25) return "Weak";
  return "Forgotten";
}

export function getConfidenceColor(score: number): string {
  if (score >= 85) return "#22c55e";
  if (score >= 65) return "#f5c518";
  if (score >= 45) return "#f59e0b";
  if (score >= 25) return "#ef4444";
  return "#9ca3af";
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

export function relativeTime(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
