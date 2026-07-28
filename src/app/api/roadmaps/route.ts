import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Roadmap, UserRoadmapProgress } from "@/lib/models";

// GET /api/roadmaps?userId=xxx
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const userId = new URL(req.url).searchParams.get("userId");

    if (!userId) {
      const roadmaps = await Roadmap.find({ isSystem: true }).lean();
      return NextResponse.json({ roadmaps });
    }

    const roadmaps = await Roadmap.find({
      $or: [{ isSystem: true }, { createdBy: userId }],
    }).lean();

    // Merge user progress into roadmap data
    const progressDocs = await UserRoadmapProgress.find({
      userId,
      roadmapId: { $in: roadmaps.map((r) => r._id) },
    }).lean();

    const progressMap = Object.fromEntries(
      progressDocs.map((p) => [p.roadmapId.toString(), p])
    );

    const roadmapsWithProgress = roadmaps.map((r) => {
      const prog = progressMap[r._id.toString()];
      return {
        ...r,
        userProgress: prog
          ? { overallPercent: prog.overallPercent, nodeProgress: prog.nodeProgress }
          : { overallPercent: 0, nodeProgress: [] },
      };
    });

    return NextResponse.json({ roadmaps: roadmapsWithProgress });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/roadmaps/:id/progress — update node progress
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { userId, roadmapId, nodeId, status, masteryLevel, completionPercent, confidenceScore } =
      await req.json();

    await UserRoadmapProgress.findOneAndUpdate(
      { userId, roadmapId },
      {
        $set: {
          "nodeProgress.$[el].status": status,
          "nodeProgress.$[el].masteryLevel": masteryLevel,
          "nodeProgress.$[el].completionPercent": completionPercent,
          "nodeProgress.$[el].confidenceScore": confidenceScore,
          "nodeProgress.$[el].lastActivity": new Date(),
        },
      },
      {
        arrayFilters: [{ "el.nodeId": nodeId }],
        upsert: true,
        new: true,
      }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
