import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Card, UserMemory } from "@/lib/models";

// GET /api/feed?userId=xxx&limit=20
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") ?? "20");

    if (!userId) {
      // Return all cards sorted by upvotes if no user context
      const cards = await Card.find({})
        .sort({ upvotes: -1, createdAt: -1 })
        .limit(limit)
        .lean();
      return NextResponse.json({ cards, total: cards.length });
    }

    const memory = await UserMemory.find({ userId })
      .sort({ confidenceScore: 1 })
      .limit(50)
      .lean();

    const weakCardIds = memory
      .filter((m) => m.strength === "weak" || m.strength === "forgotten")
      .map((m) => m.cardId);

    const seenCardIds = memory.map((m) => m.cardId);
    const topics = [...new Set(memory.map((m) => m.topic).filter(Boolean))];

    const [weakCards, userCards, unseenCards, uploadCards, trendingCards] = await Promise.all([
      Card.find({ _id: { $in: weakCardIds } }).lean(),
      seenCardIds.length > 0 ? Card.find({ _id: { $in: seenCardIds } }).lean() : [],
      topics.length > 0
        ? Card.find({
            _id: { $nin: seenCardIds },
            topic: { $in: topics },
          })
            .sort({ interviewRelevance: -1, createdAt: -1 })
            .limit(Math.max(limit, 8))
            .lean()
        : [],
      Card.find({ source: "upload" })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      Card.find({ source: "trending", _id: { $nin: seenCardIds } })
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    const merged = [...userCards, ...weakCards, ...unseenCards, ...uploadCards, ...trendingCards];
    const uniqueCards = merged.filter((card, index, arr) => {
      const id = card._id.toString();
      return arr.findIndex((item) => item._id.toString() === id) === index;
    });

    return NextResponse.json({ cards: uniqueCards.slice(0, limit), total: uniqueCards.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
