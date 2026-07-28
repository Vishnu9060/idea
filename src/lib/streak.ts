import { UserStreak } from "@/lib/models";

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

interface ActivityInput {
  action: string;
  timeSpentSeconds: number;
}

// Called on every real user interaction (feed swipe, etc). Advances the
// day-streak counter, resets it if a day was missed, and rolls today's
// activity into the dailyStats history used by the analytics heatmap.
export async function recordActivity(userId: string, { action, timeSpentSeconds }: ActivityInput) {
  const streak = await UserStreak.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, currentStreak: 0, longestStreak: 0, dailyGoalMinutes: 30, minutesToday: 0, dailyStats: [] } },
    { upsert: true, new: true }
  );

  const now = new Date();
  const today = startOfDay(now);
  const lastActiveDay = startOfDay(new Date(streak.lastActiveDate));
  const daysSinceActive = Math.round((today.getTime() - lastActiveDay.getTime()) / 86400000);

  const minutesToAdd = timeSpentSeconds / 60;

  if (daysSinceActive === 0) {
    streak.minutesToday += minutesToAdd;
    // First-ever activity also lands on "day 0" (lastActiveDate defaults to
    // signup time) — without this, a brand-new user's streak never leaves 0.
    if (streak.currentStreak === 0) streak.currentStreak = 1;
  } else if (daysSinceActive === 1) {
    streak.currentStreak += 1;
    streak.minutesToday = minutesToAdd;
  } else if (daysSinceActive > 1) {
    streak.currentStreak = 1;
    streak.minutesToday = minutesToAdd;
  }
  // daysSinceActive < 0 (clock skew) — leave streak/minutesToday untouched

  streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
  streak.lastActiveDate = now;

  const todayEntry = streak.dailyStats.find((d) => startOfDay(new Date(d.date)).getTime() === today.getTime());

  if (todayEntry) {
    todayEntry.cardsViewed += 1;
    todayEntry.minutesActive += minutesToAdd;
    if (action === "saved" || action === "bookmarked") todayEntry.cardsSaved += 1;
    if (action === "weak") todayEntry.weakConceptsReviewed += 1;
  } else {
    streak.dailyStats.push({
      date: today,
      cardsViewed: 1,
      cardsSaved: action === "saved" || action === "bookmarked" ? 1 : 0,
      quizScoreAvg: 0,
      minutesActive: minutesToAdd,
      weakConceptsReviewed: action === "weak" ? 1 : 0,
    });
  }

  // Cap history so the document doesn't grow unbounded.
  if (streak.dailyStats.length > 90) {
    streak.dailyStats = streak.dailyStats.slice(-90);
  }

  await streak.save();
  return streak;
}
