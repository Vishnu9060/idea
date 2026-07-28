import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { UserMemory, UserStreak } from "@/lib/models";

// GET /api/memory?userId=xxx
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const userId = new URL(req.url).searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const [memoryRaw, streak] = await Promise.all([
      UserMemory.find({ userId }).sort({ confidenceScore: 1 }).populate("cardId", "title topic subtopic").lean(),
      UserStreak.findOne({ userId }).lean(),
    ]);

    const memory = memoryRaw.map((m) => ({ ...m, id: m._id.toString() }));

    const strong    = memory.filter((m) => m.strength === "strong");
    const medium    = memory.filter((m) => m.strength === "medium");
    const weak      = memory.filter((m) => m.strength === "weak");
    const forgotten = memory.filter((m) => m.strength === "forgotten");
    const dueReview = memory.filter((m) => new Date(m.nextReview) <= new Date());

    const overallScore =
      memory.length > 0
        ? Math.round(memory.reduce((sum, m) => sum + m.confidenceScore, 0) / memory.length)
        : 0;

    // Topics breakdown
    const topicMap: Record<string, { total: number; sumScore: number; weak: number; strong: number }> = {};
    memory.forEach((m) => {
      if (!topicMap[m.topic]) topicMap[m.topic] = { total: 0, sumScore: 0, weak: 0, strong: 0 };
      topicMap[m.topic].total++;
      topicMap[m.topic].sumScore += m.confidenceScore;
      if (m.strength === "weak" || m.strength === "forgotten") topicMap[m.topic].weak++;
      if (m.strength === "strong") topicMap[m.topic].strong++;
    });
    const topicsBreakdown = Object.entries(topicMap).map(([topic, d]) => ({
      topic,
      averageConfidence: Math.round(d.sumScore / d.total),
      conceptCount: d.total,
      weakCount: d.weak,
      strongCount: d.strong,
    }));

    return NextResponse.json({
      strong, medium, weak, forgotten, dueReview,
      overallScore, topicsBreakdown, streak,
      total: memory.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
