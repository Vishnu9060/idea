import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { QuizSession } from "@/lib/models";

// POST /api/quiz — create session
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { userId, topic, preferences, questions } = await req.json();

    const session = await QuizSession.create({
      userId, topic, preferences,
      questions: questions ?? [],
      answers: [],
      status: "in_progress",
    });

    return NextResponse.json({ sessionId: session._id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/quiz?sessionId=xxx
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const sessionId = new URL(req.url).searchParams.get("sessionId");
    if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

    const session = await QuizSession.findById(sessionId).lean();
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    return NextResponse.json({ session });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/quiz — submit answer
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const { sessionId, questionIndex, userAnswer, isCorrect, timeTakenSeconds } = await req.json();

    const session = await QuizSession.findById(sessionId);
    if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

    session.answers.push({ questionIndex, userAnswer, isCorrect, timeTakenSeconds });

    // Check if complete
    if (session.answers.length >= session.questions.length) {
      session.status = "completed";
      session.score = session.answers.filter((a) => a.isCorrect).length;
    }

    await session.save();
    return NextResponse.json({ success: true, status: session.status, score: session.score });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
