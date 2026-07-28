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

    const withId = (card: any) => ({ ...card, id: card._id.toString() });

    if (!userId) {
      // Return all cards sorted by upvotes if no user context
      const cards = await Card.find({})
        .sort({ upvotes: -1, createdAt: -1 })
        .limit(limit)
        .lean();
      return NextResponse.json({ cards: cards.map(withId), total: cards.length });
    }

    const memory = await UserMemory.find({ userId })
      .sort({ confidenceScore: 1 })
      .limit(50)
      .lean();

    // Ascending by confidence — weakest/most-forgotten first.
    const confidenceByCardId = new Map(memory.map((m) => [m.cardId.toString(), m.confidenceScore]));

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
            // Upload-sourced cards belong to whoever uploaded them — only
            // surface those for their owner. Non-upload cards (ai_feed,
            // trending, mentor) have no userId and are intentionally shared.
            $or: [{ source: { $ne: "upload" } }, { userId }],
          })
            .sort({ interviewRelevance: -1, createdAt: -1 })
            .limit(Math.max(limit, 8))
            .lean()
        : [],
      Card.find({ source: "upload", userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      Card.find({ source: "trending", _id: { $nin: seenCardIds } })
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    // MongoDB's $in doesn't preserve array order, so re-sort by actual
    // confidence — weakest/most-forgotten genuinely goes first.
    const weakCardsSorted = [...weakCards].sort((a, b) => {
      const scoreA = confidenceByCardId.get(a._id.toString()) ?? 0;
      const scoreB = confidenceByCardId.get(b._id.toString()) ?? 0;
      return scoreA - scoreB;
    });

    // weakCards goes first so its priority actually survives the dedup below
    // (dedup keeps the first occurrence of each card id).
    const merged = [...weakCardsSorted, ...userCards, ...unseenCards, ...uploadCards, ...trendingCards];
    const uniqueCards = merged.filter((card, index, arr) => {
      const id = card._id.toString();
      return arr.findIndex((item) => item._id.toString() === id) === index;
    });

    return NextResponse.json({
      cards: uniqueCards.slice(0, limit).map(withId),
      total: uniqueCards.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
