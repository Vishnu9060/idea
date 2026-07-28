import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Upload, Card, UserMemory, Roadmap, UserRoadmapProgress, QuizSession } from "@/lib/models";
import mongoose from "mongoose";
import {
  extractTextFromFile,
  extractConceptsFromText,
  generateFlashcardsFromConcepts,
  generateQuizFromConcepts,
  classifyTopic,
} from "@/lib/content-analysis";

function generateInterviewQuestions(
  concepts: any[]
): { question: string; answer: string; topic: string; difficulty: string }[] {
  return concepts.map((c) => ({
    question: `Explain ${c.concept} in detail with examples. How would you implement this in a production system?`,
    answer: `${c.explanation}\n\nExample: ${c.example}\n\nInterview Tip: ${c.interviewTip}`,
    topic: c.topic,
    difficulty: c.difficulty,
  }));
}

function generateCodingQuestions(
  concepts: any[]
): { question: string; solution: string; topic: string; difficulty: string }[] {
  return concepts.map((c) => ({
    question: `Write code to implement or demonstrate "${c.concept}". Include proper error handling and edge cases.`,
    solution: `// Implementation of ${c.concept}\n// ${c.explanation}\n\nfunction implement${c.concept.replace(/\s+/g, "")}() {\n  // TODO: implement\n  return null;\n}`,
    topic: c.topic,
    difficulty: c.difficulty,
  }));
}

function generateRoadmapNodes(concepts: any[]): any[] {
  return concepts.map((c, i) => ({
    title: c.concept,
    description: c.explanation.substring(0, 150),
    orderIndex: i,
    dependencies: i > 0 ? [new mongoose.Types.ObjectId()] : [],
    estimatedHours: c.difficulty === "beginner" ? 1 : c.difficulty === "intermediate" ? 2 : 3,
    cardIds: [],
  }));
}

// POST /api/upload/process - full upload processing pipeline
export async function POST(req: NextRequest) {
  let uploadId: string | undefined;
  try {
    await connectDB();
    const body = await req.json();
    uploadId = body.uploadId;
    const { userId, fileType, outputs, fileData } = body;
    let { content } = body;

    if (!uploadId || !userId) {
      return NextResponse.json(
        { error: "uploadId and userId required" },
        { status: 400 }
      );
    }

    const upload = await Upload.findById(uploadId);
    if (!upload) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 });
    }

    // Stage 1: Extract Content
    await Upload.findByIdAndUpdate(uploadId, {
      $set: {
        processingStatus: "processing",
        processingStage: "Extracting content",
        progressPercent: 10,
      },
    });

    let extractionWarning: string | undefined;
    if (fileData && ["pdf", "docx", "ppt", "pptx"].includes(fileType)) {
      const extracted = await extractTextFromFile(fileData, fileType);
      content = extracted.text;
      extractionWarning = extracted.warning;
    }

    const concepts = content ? extractConceptsFromText(content) : [];
    const topic = concepts.length > 0 ? concepts[0].topic : classifyTopic(content ?? "");

    // Stage 2: Create Cards
    await Upload.findByIdAndUpdate(uploadId, {
      $set: { processingStage: "Generating cards", progressPercent: 25 },
    });

    const cardIds: mongoose.Types.ObjectId[] = [];
    for (const c of concepts) {
      const card = await Card.create({
        source: "upload",
        userId: new mongoose.Types.ObjectId(userId),
        uploadId: upload._id,
        title: c.concept,
        topic: c.topic,
        subtopic: c.subtopic,
        concept: c.concept,
        explanation: c.explanation,
        example: c.example,
        interviewTip: c.interviewTip,
        commonMistake: c.commonMistake,
        difficulty: c.difficulty,
        conceptType: "concept",
        readingTimeSeconds: Math.max(30, Math.floor(c.explanation.length / 10)),
        tags: c.tags,
        relatedConcepts: [],
        interviewRelevance: Math.floor(Math.random() * 5) + 5,
        upvotes: 0,
      });
      cardIds.push(card._id);
    }

    // Create UserMemory entries for each card
    await Upload.findByIdAndUpdate(uploadId, {
      $set: { processingStage: "Building memory", progressPercent: 40 },
    });

    const memoryEntries = cardIds.map((cardId, i) => ({
      userId: new mongoose.Types.ObjectId(userId),
      cardId,
      topic: concepts[i]?.topic ?? topic,
      conceptKey: concepts[i]?.concept ?? `Concept ${i}`,
      confidenceScore: 0,
      strength: "weak" as const,
      lastReviewed: new Date(),
      nextReview: new Date(Date.now() + 86400000),
      reviewCount: 0,
      correctStreak: 0,
      wrongStreak: 0,
      retentionRate: 0,
    }));
    if (memoryEntries.length > 0) {
      await UserMemory.insertMany(memoryEntries);
    }

    // Stage 3: Generate requested outputs
    await Upload.findByIdAndUpdate(uploadId, {
      $set: { processingStage: "Generating outputs", progressPercent: 60 },
    });

    const generated: Record<string, any> = {};

    if (outputs.includes("quiz") || outputs.includes("all")) {
      const tiers = generateQuizFromConcepts(concepts);
      const questions = [...tiers.beginner, ...tiers.professional, ...tiers.expert];
      const quizSession = await QuizSession.create({
        userId: new mongoose.Types.ObjectId(userId),
        topic,
        preferences: { count: questions.length, difficulty: "mixed", type: "mcq" },
        questions,
        answers: [],
        status: "in_progress",
      });
      generated.quizSessionId = quizSession._id.toString();
      generated.quizByDifficulty = {
        beginner: tiers.beginner.length,
        professional: tiers.professional.length,
        expert: tiers.expert.length,
      };
    }

    if (outputs.includes("flash") || outputs.includes("all")) {
      generated.flashcards = generateFlashcardsFromConcepts(concepts);
    }

    if (outputs.includes("interview") || outputs.includes("all")) {
      generated.interviewQuestions = generateInterviewQuestions(concepts);
    }

    if (outputs.includes("coding") || outputs.includes("all")) {
      generated.codingQuestions = generateCodingQuestions(concepts);
    }

    // Stage 4: Update Roadmap
    await Upload.findByIdAndUpdate(uploadId, {
      $set: { processingStage: "Updating roadmap", progressPercent: 80 },
    });

    const roadmapName = `${topic} Mastery`;
    let roadmap = await Roadmap.findOne({ name: roadmapName, createdBy: new mongoose.Types.ObjectId(userId) });

    if (!roadmap) {
      const nodes = generateRoadmapNodes(concepts);
      roadmap = await Roadmap.create({
        name: roadmapName,
        description: `Personalized roadmap from uploaded ${fileType} content`,
        category: topic,
        isSystem: false,
        createdBy: new mongoose.Types.ObjectId(userId),
        icon: "📚",
        nodes,
        estimatedHours: nodes.reduce((sum: number, n: any) => sum + n.estimatedHours, 0),
      });
    } else {
      // Merge new concepts into existing roadmap
      const existingTitles = new Set(roadmap.nodes.map((n) => n.title));
      const newNodes = concepts
        .filter((c: any) => !existingTitles.has(c.concept))
        .map((c: any, i: number) => ({
          title: c.concept,
          description: c.explanation.substring(0, 150),
          orderIndex: roadmap!.nodes.length + i,
          dependencies: [],
          estimatedHours: c.difficulty === "beginner" ? 1 : c.difficulty === "intermediate" ? 2 : 3,
          cardIds: [],
        }));
      if (newNodes.length > 0) {
        roadmap.nodes.push(...newNodes);
        await roadmap.save();
      }
    }

    // Create or update user progress
    await UserRoadmapProgress.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId), roadmapId: roadmap._id },
      {
        $setOnInsert: {
          nodeProgress: roadmap.nodes.map((n: any) => ({
            nodeId: n._id,
            status: "available",
            masteryLevel: "none",
            completionPercent: 0,
            confidenceScore: 0,
          })),
          overallPercent: 0,
        },
      },
      { upsert: true }
    );

    // Stage 5: Finalize
    await Upload.findByIdAndUpdate(uploadId, {
      $set: {
        processingStatus: "completed",
        processingStage: "Complete",
        progressPercent: 100,
        extractedConceptsCount: concepts.length,
        cardIds,
        roadmapId: roadmap._id,
      },
    });

    return NextResponse.json({
      success: true,
      conceptsCount: concepts.length,
      cardIds: cardIds.map((id) => id.toString()),
      roadmapId: roadmap._id.toString(),
      ...(extractionWarning && { warning: extractionWarning }),
      ...generated,
    });
  } catch (err: any) {
    console.error("[upload/process]", err);
    // Mark upload as failed
    try {
      await Upload.findByIdAndUpdate(uploadId, {
        $set: {
          processingStatus: "failed",
          errorMessage: err.message,
        },
      });
    } catch {}
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

