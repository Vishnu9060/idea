import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Upload, Card } from "@/lib/models";

// POST /api/upload — create upload record
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, filename, fileType, sourceUrl } = body;

    const upload = await Upload.create({
      userId, filename, fileType, sourceUrl,
      processingStatus: "queued",
      progressPercent: 0,
      retryCount: 0,
      extractedConceptsCount: 0,
      cardIds: [],
    });

    return NextResponse.json({ uploadId: upload._id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/upload?userId=xxx
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const userId = new URL(req.url).searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const uploads = await Upload.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({ uploads });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/upload — update processing status
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const { uploadId, processingStatus, processingStage, progressPercent,
            extractedConceptsCount, cardIds, errorMessage } = await req.json();

    await Upload.findByIdAndUpdate(uploadId, {
      $set: {
        processingStatus,
        processingStage,
        progressPercent,
        extractedConceptsCount,
        ...(cardIds && { cardIds }),
        ...(errorMessage && { errorMessage }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
