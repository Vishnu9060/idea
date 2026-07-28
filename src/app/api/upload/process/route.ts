import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Upload, Card, UserMemory, Roadmap, UserRoadmapProgress, QuizSession } from "@/lib/models";
import mongoose from "mongoose";

// Simulated concept extraction from content
function extractConcepts(content: string, fileType: string): any[] {
  const lines = content.split("\n").filter((l) => l.trim());
  const topic = getTopicFromContent(content);
  const sampleConcepts = [
    {
      concept: "Core Concept Overview",
      explanation:
        "This concept forms the foundation of understanding the subject matter. It covers fundamental principles and key terminology.",
      example:
        "Consider a practical scenario where this concept applies in real-world applications.",
      interviewTip:
        "When asked about this in interviews, start with the basic definition and then dive into implementation details.",
      commonMistake:
        "A common error is confusing this concept with related but distinct ideas in the same domain.",
      difficulty: "beginner",
      topic,
      subtopic: "Fundamentals",
      tags: ["fundamentals", "core"],
    },
    {
      concept: "Advanced Implementation Patterns",
      explanation:
        "Building on basic principles, this advanced pattern enables more efficient solutions to complex problems.",
      example:
        "Production systems typically implement this pattern to handle scale and maintainability.",
      interviewTip:
        "Mention real-world use cases and trade-offs. Show you understand when NOT to use this pattern.",
      commonMistake:
        "Over-engineering by applying this pattern where simpler solutions would suffice.",
      difficulty: "intermediate",
      topic,
      subtopic: "Implementation",
      tags: ["advanced", "patterns"],
    },
    {
      concept: "Best Practices & Optimization",
      explanation:
        "Industry-proven practices that improve performance, readability, and maintainability of your implementations.",
      example:
        "Measure twice, optimize once. Profile your application before and after applying these practices.",
      interviewTip:
        "Discuss profiling, benchmarking, and how you validated improvements with data.",
      commonMistake:
        "Premature optimization without profiling leads to complex code with marginal gains.",
      difficulty: "intermediate",
      topic,
      subtopic: "Optimization",
      tags: ["optimization", "best-practices"],
    },
    {
      concept: "Error Handling & Edge Cases",
      explanation:
        "Robust error handling anticipates failure modes and gracefully degrades when unexpected inputs occur.",
      example:
        "Input validation, try-catch blocks, and fallback mechanisms ensure system resilience.",
      interviewTip:
        "Show structured thinking: list edge cases, then explain your handling strategy for each.",
      commonMistake:
        "Only handling the happy path. Production failures often come from unhandled edge cases.",
      difficulty: "beginner",
      topic,
      subtopic: "Reliability",
      tags: ["error-handling", "robustness"],
    },
    {
      concept: "Design Trade-offs",
      explanation:
        "Every design decision involves trade-offs between competing concerns like performance, complexity, and flexibility.",
      example:
        "Choosing between SQL and NoSQL: consistency vs availability, structured vs flexible schema.",
      interviewTip:
        "Interviewers love hearing 'it depends' followed by a structured analysis of trade-offs.",
      commonMistake:
        "Claiming one solution is universally better without considering context.",
      difficulty: "advanced",
      topic,
      subtopic: "Architecture",
      tags: ["design", "architecture"],
    },
  ];
  return sampleConcepts.slice(
    0,
    Math.min(5 + Math.floor(Math.random() * 5), Math.max(lines.length, 3))
  );
}

function getTopicFromContent(content: string): string {
  const lower = content.toLowerCase();
  if (lower.includes("java") || lower.includes("spring") || lower.includes("jvm"))
    return "Java";
  if (lower.includes("python") || lower.includes("django") || lower.includes("flask"))
    return "Python";
  if (lower.includes("react") || lower.includes("vue") || lower.includes("angular"))
    return "Frontend";
  if (lower.includes("docker") || lower.includes("kubernetes") || lower.includes("aws"))
    return "DevOps";
  if (
    lower.includes("sql") ||
    lower.includes("mongodb") ||
    lower.includes("database")
  )
    return "Databases";
  if (
    lower.includes("algorithm") ||
    lower.includes("data structure") ||
    lower.includes("leetcode")
  )
    return "DSA";
  if (
    lower.includes("machine learning") ||
    lower.includes("ai") ||
    lower.includes("neural")
  )
    return "AI/ML";
  if (
    lower.includes("security") ||
    lower.includes("encryption") ||
    lower.includes("owasp")
  )
    return "Cybersecurity";
  return "General";
}

function generateQuestions(
  concepts: any[],
  count: number,
  difficulty: string,
  type: string
): any[] {
  const questions: any[] = [];
  const types =
    type === "mixed" ? ["mcq", "theory", "coding"] : [type];
  const difficulties =
    difficulty === "mixed"
      ? ["beginner", "intermediate", "advanced"]
      : [difficulty];

  for (let i = 0; i < count; i++) {
    const concept = concepts[i % concepts.length];
    const qType = types[i % types.length];
    const qDiff = difficulties[i % difficulties.length];

    const base: any = {
      questionText: `Based on "${concept.concept}", explain the key principles and how they apply in practice.`,
      type: qType,
      correctAnswer: concept.explanation,
      explanation: `This relates to ${concept.concept} which involves ${concept.explanation.toLowerCase()}`,
      difficulty: qDiff,
      topic: concept.topic,
    };

    if (qType === "mcq") {
      base.questionText = `What is the main focus of "${concept.concept}"?`;
      base.options = [
        concept.explanation.split(".")[0] + ".",
        `An unrelated approach that doesn't apply here.`,
        `The opposite of what the concept describes.`,
        `A simplified version that misses key details.`,
      ];
      base.correctAnswer = base.options[0];
    }

    questions.push(base);
  }
  return questions;
}

function generateFlashcards(concepts: any[]): {
  front: string;
  back: string;
  topic: string;
  difficulty: string;
}[] {
  return concepts.map((c) => ({
    front: `What is "${c.concept}"?`,
    back: c.explanation,
    topic: c.topic,
    difficulty: c.difficulty,
  }));
}

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
    const { userId, content, fileType, outputs } = body;

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

    // Stage 1: Extract Concepts
    await Upload.findByIdAndUpdate(uploadId, {
      $set: {
        processingStatus: "processing",
        processingStage: "Extracting content",
        progressPercent: 10,
      },
    });

    const concepts = content ? extractConcepts(content, fileType) : [];
    const topic =
      concepts.length > 0 ? concepts[0].topic : getTopicFromContent(content ?? "");

    // Stage 2: Create Cards
    await Upload.findByIdAndUpdate(uploadId, {
      $set: { processingStage: "Generating cards", progressPercent: 25 },
    });

    const cardIds: mongoose.Types.ObjectId[] = [];
    for (const c of concepts) {
      const card = await Card.create({
        source: "upload",
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
      const questions = generateQuestions(concepts, 10, "mixed", "mixed");
      const quizSession = await QuizSession.create({
        userId: new mongoose.Types.ObjectId(userId),
        topic,
        preferences: { count: 10, difficulty: "mixed", type: "mixed" },
        questions,
        answers: [],
        status: "in_progress",
      });
      generated.quizSessionId = quizSession._id.toString();
    }

    if (outputs.includes("flash") || outputs.includes("all")) {
      const flashcards = generateFlashcards(concepts);
      // Store flashcards in the upload record or as separate model entries
      generated.flashcards = flashcards;
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

