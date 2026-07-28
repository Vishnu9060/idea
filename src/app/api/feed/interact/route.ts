import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CardInteraction, UserMemory } from "@/lib/models";
import { recordActivity } from "@/lib/streak";

const CONFIDENCE_DELTA: Record<string, number> = {
  known:      +10,
  weak:       -15,
  viewed:     +2,
  saved:      +3,
  bookmarked: +3,
  skipped:    -2,
  shared:     +1,
};

// POST /api/feed/interact
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, cardId, action, timeSpentSeconds, sectionViewed, topic, conceptKey } = body;

    if (!userId || !cardId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Log interaction
    await CardInteraction.create({ userId, cardId, action, timeSpentSeconds, sectionViewed });

    // Update memory engine
    const delta = CONFIDENCE_DELTA[action] ?? 0;

    const memory = await UserMemory.findOne({ userId, cardId });

    if (memory) {
      // Apply Ebbinghaus decay
      const daysSince = (Date.now() - memory.lastReviewed.getTime()) / 86400000;
      const decayed = memory.confidenceScore * Math.exp(-0.1 * daysSince);
      const newScore = Math.max(0, Math.min(100, decayed + delta));

      const strength =
        newScore >= 85 ? "strong" :
        newScore >= 60 ? "medium" :
        newScore >= 25 ? "weak" : "forgotten";

      // Spaced repetition interval
      const daysUntilReview =
        newScore >= 90 ? 21 :
        newScore >= 75 ? 10 :
        newScore >= 60 ? 5 :
        newScore >= 40 ? 2 :
        newScore >= 20 ? 1 : 0;

      const nextReview = new Date(Date.now() + daysUntilReview * 86400000);

      await UserMemory.updateOne(
        { userId, cardId },
        {
          $set: { confidenceScore: newScore, strength, lastReviewed: new Date(), nextReview },
          $inc: {
            reviewCount: 1,
            correctStreak: action === "known" ? 1 : 0,
            wrongStreak: action === "weak" ? 1 : 0,
          },
        }
      );
    } else {
      // First time seeing this card
      const initScore = Math.max(0, 0 + delta);
      await UserMemory.create({
        userId, cardId, topic, conceptKey,
        confidenceScore: initScore,
        strength: initScore >= 25 ? "medium" : "weak",
        lastReviewed: new Date(),
        nextReview: new Date(Date.now() + 86400000),
        reviewCount: 1,
      });
    }

    await recordActivity(userId, { action, timeSpentSeconds: timeSpentSeconds ?? 0 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
