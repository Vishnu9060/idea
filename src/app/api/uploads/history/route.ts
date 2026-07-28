import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Upload } from "@/lib/models";

// GET /api/uploads/history?userId=xxx — returns uploads with generated output summaries
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const userId = new URL(req.url).searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const uploads = await Upload.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("cardIds", "title topic difficulty")
      .lean();

    const history = uploads.map((u) => ({
      id: u._id.toString(),
      filename: u.filename,
      fileType: u.fileType,
      sourceUrl: u.sourceUrl,
      processingStatus: u.processingStatus,
      processingStage: u.processingStage,
      progressPercent: u.progressPercent,
      errorMessage: u.errorMessage,
      extractedConceptsCount: u.extractedConceptsCount,
      cardCount: u.cardIds?.length ?? 0,
      cards: u.cardIds?.map((c: any) => ({
        id: c._id?.toString(),
        title: c.title,
        topic: c.topic,
        difficulty: c.difficulty,
      })) ?? [],
      roadmapId: u.roadmapId?.toString(),
      createdAt: u.createdAt,
      conceptGraph: u.conceptGraph,
    }));

    return NextResponse.json({ uploads: history });
  } catch (err: any) {
    console.error("[uploads/history]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

