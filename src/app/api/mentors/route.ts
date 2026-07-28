import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { MentorConversation } from "@/lib/models";

// GET /api/mentors?userId=xxx&mentorType=java
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId     = searchParams.get("userId");
    const mentorType = searchParams.get("mentorType");

    if (!userId || !mentorType) {
      return NextResponse.json({ error: "userId and mentorType required" }, { status: 400 });
    }

    const convo = await MentorConversation.findOne({ userId, mentorType })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({ conversation: convo ?? null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/mentors — add message & get AI reply
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { userId, mentorType, userMessage, cardContext } = await req.json();

    // Upsert conversation
    let convo = await MentorConversation.findOne({ userId, mentorType });

    if (!convo) {
      convo = await MentorConversation.create({
        userId, mentorType,
        messages: [],
      });
    }

    // Add user message
    convo.messages.push({ role: "user", content: userMessage, timestamp: new Date() });

    // Build context-aware reply (placeholder for Groq API call)
    const REPLIES: Record<string, string> = {
      java: `Great Java question! ${cardContext ? `Regarding "${cardContext}": ` : ""}Here's what you need to know from an internals perspective...`,
      python: `Pythonic answer! ${cardContext ? `About "${cardContext}": ` : ""}The key insight is...`,
      devops: `DevOps perspective: automation-first. ${cardContext ? `For "${cardContext}": ` : ""}The best practice is...`,
      cybersecurity: `Security-first! ${cardContext ? `On "${cardContext}": ` : ""}Think like an attacker. The vulnerability is...`,
      ai: `Fascinating AI question! ${cardContext ? `On "${cardContext}": ` : ""}The math behind this is elegant...`,
      system_design: `At scale, this becomes critical. ${cardContext ? `For "${cardContext}": ` : ""}If you had 1M users...`,
      interview: `STAR method time! ${cardContext ? `For "${cardContext}": ` : ""}Here's how I'd structure the answer...`,
      placement: `Company patterns show ${cardContext ? `"${cardContext}" ` : "this "}appears frequently at product companies. Strategy...`,
      aptitude: `Step by step! ${cardContext ? `For "${cardContext}": ` : ""}The shortcut most miss is...`,
      tech_news: `🔥 Hot take! ${cardContext ? `On "${cardContext}": ` : ""}Here's why this matters for your career...`,
    };

    const reply = REPLIES[mentorType] ?? "Let me help you understand that concept...";

    convo.messages.push({ role: "assistant", content: reply, timestamp: new Date() });

    // Keep only last 50 messages to control doc size
    if (convo.messages.length > 50) {
      convo.messages = convo.messages.slice(-50);
    }

    await convo.save();

    return NextResponse.json({ reply, conversationId: convo._id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
