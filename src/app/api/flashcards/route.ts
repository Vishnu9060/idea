import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";

const FlashcardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  sourceUploadId: { type: mongoose.Schema.Types.ObjectId, ref: "Upload" },
  front: { type: String, required: true },
  back: { type: String, required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, default: "beginner" },
  isCorrect: { type: Number, default: 0 },
  isIncorrect: { type: Number, default: 0 },
  lastReviewed: { type: Date },
  nextReview: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

const Flashcard =
  mongoose.models.Flashcard ?? mongoose.model("Flashcard", FlashcardSchema);

// GET /api/flashcards?userId=xxx
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const userId = new URL(req.url).searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const flashcards = await Flashcard.find({ userId, nextReview: { $lte: new Date() } })
      .sort({ nextReview: 1 })
      .limit(20)
      .lean();

    return NextResponse.json({ flashcards });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/flashcards — create flashcards
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { userId, sourceUploadId, cards } = await req.json();

    if (!userId || !Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json({ error: "userId and cards array required" }, { status: 400 });
    }

    const flashcardDocs = cards.map((c: any) => ({
      userId: new mongoose.Types.ObjectId(userId),
      sourceUploadId: sourceUploadId ? new mongoose.Types.ObjectId(sourceUploadId) : undefined,
      front: c.front,
      back: c.back,
      topic: c.topic,
      difficulty: c.difficulty,
      nextReview: new Date(),
    }));

    const created = await Flashcard.insertMany(flashcardDocs);

    return NextResponse.json({ success: true, count: created.length, flashcards: created }, { status: 201 });
  } catch (err: any) {
    console.error("[flashcards]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

