import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { UserMemory } from "@/lib/models";

// POST /api/memory/update - batch update memory entries
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { userId, updates } = await req.json();

    if (!userId || !Array.isArray(updates)) {
      return NextResponse.json({ error: "userId and updates array required" }, { status: 400 });
    }

    const results = [];
    for (const update of updates) {
      const { cardId, confidenceDelta, action } = update;
      
      const memory = await UserMemory.findOne({ userId, cardId });
      
      if (memory) {
        const newScore = Math.max(0, Math.min(100, memory.confidenceScore + (confidenceDelta ?? 0)));
        const strength =
          newScore >= 85 ? "strong" :
          newScore >= 60 ? "medium" :
          newScore >= 25 ? "weak" : "forgotten";

        const daysUntilReview =
          newScore >= 90 ? 21 :
          newScore >= 75 ? 10 :
          newScore >= 60 ? 5 :
          newScore >= 40 ? 2 :
          newScore >= 20 ? 1 : 0;

        await UserMemory.updateOne(
          { userId, cardId },
          {
            $set: {
              confidenceScore: newScore,
              strength,
              lastReviewed: new Date(),
              nextReview: new Date(Date.now() + daysUntilReview * 86400000),
            },
            $inc: {
              reviewCount: 1,
              correctStreak: action === "known" ? 1 : 0,
              wrongStreak: action === "weak" ? 1 : 0,
            },
          }
        );
        results.push({ cardId, success: true, newScore, strength });
      } else {
        results.push({ cardId, success: false, error: "Memory not found" });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error("[memory/update]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

