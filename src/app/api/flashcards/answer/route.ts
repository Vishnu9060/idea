import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";

const FlashcardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  sourceUploadId: { type: mongoose.Schema.Types.ObjectId, ref: "Upload" },
  front: String,
  back: String,
  topic: String,
  difficulty: String,
  isCorrect: { type: Number, default: 0 },
  isIncorrect: { type: Number, default: 0 },
  lastReviewed: Date,
  nextReview: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

const Flashcard =
  mongoose.models.Flashcard ?? mongoose.model("Flashcard", FlashcardSchema);

// POST /api/flashcards/answer — record a flashcard answer
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { flashcardId, userId, isCorrect, timeTakenSeconds } = await req.json();

    if (!flashcardId || !userId) {
      return NextResponse.json({ error: "flashcardId and userId required" }, { status: 400 });
    }

    const flashcard = await Flashcard.findById(flashcardId);
    if (!flashcard) {
      return NextResponse.json({ error: "Flashcard not found" }, { status: 404 });
    }

    // Spaced repetition: if correct, extend interval; if wrong, shorten
    const daysUntilReview = isCorrect
      ? Math.max(1, Math.floor((flashcard.isCorrect + 1) * 1.5))
      : 1;

    await Flashcard.findByIdAndUpdate(flashcardId, {
      $inc: { isCorrect: isCorrect ? 1 : 0, isIncorrect: isCorrect ? 0 : 1 },
      $set: {
        lastReviewed: new Date(),
        nextReview: new Date(Date.now() + daysUntilReview * 86400000),
      },
    });

    return NextResponse.json({ success: true, nextReview: new Date(Date.now() + daysUntilReview * 86400000) });
  } catch (err: any) {
    console.error("[flashcards/answer]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

