import mongoose, { Schema, Document, Model } from "mongoose";

// ─── User ────────────────────────────────────────────────────────────────────

export interface IUser extends Document {
  email: string;
  name: string;
  avatarUrl?: string;
  passwordHash?: string;
  googleId?: string;
  subscriptionTier: "free" | "pro" | "enterprise";
  preferences: {
    learningGoals: string[];
    topics: string[];
    dailyGoalMinutes: number;
    preferredDifficulty: string;
    notificationsEnabled: boolean;
  };
  onboardingComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email:            { type: String, required: true, unique: true, lowercase: true, trim: true },
    name:             { type: String, required: true, trim: true },
    avatarUrl:        { type: String },
    passwordHash:     { type: String },
    googleId:         { type: String, sparse: true },
    subscriptionTier: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
    preferences: {
      learningGoals:         { type: [String], default: [] },
      topics:                { type: [String], default: [] },
      dailyGoalMinutes:      { type: Number, default: 30 },
      preferredDifficulty:   { type: String, default: "intermediate" },
      notificationsEnabled:  { type: Boolean, default: true },
    },
    onboardingComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

// ─── Card ────────────────────────────────────────────────────────────────────

export interface ICard extends Document {
  source: "ai_feed" | "upload" | "mentor" | "trending";
  uploadId?: mongoose.Types.ObjectId;
  title: string;
  topic: string;
  subtopic: string;
  concept: string;
  explanation: string;
  example: string;
  interviewTip: string;
  commonMistake: string;
  codeSnippet?: string;
  visualizationUrl?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  conceptType: string;
  readingTimeSeconds: number;
  tags: string[];
  relatedConcepts: string[];
  interviewRelevance: number;
  upvotes: number;
  createdAt: Date;
}

const CardSchema = new Schema<ICard>(
  {
    source:             { type: String, enum: ["ai_feed", "upload", "mentor", "trending"], required: true },
    uploadId:           { type: Schema.Types.ObjectId, ref: "Upload" },
    title:              { type: String, required: true, maxlength: 200 },
    topic:              { type: String, required: true, index: true },
    subtopic:           { type: String, required: true },
    concept:            { type: String, required: true },
    explanation:        { type: String, required: true },
    example:            { type: String, required: true },
    interviewTip:       { type: String, required: true },
    commonMistake:      { type: String, required: true },
    codeSnippet:        { type: String },
    visualizationUrl:   { type: String },
    difficulty:         { type: String, enum: ["beginner", "intermediate", "advanced"], required: true },
    conceptType:        { type: String, default: "concept" },
    readingTimeSeconds: { type: Number, required: true },
    tags:               { type: [String], default: [], index: true },
    relatedConcepts:    { type: [String], default: [] },
    interviewRelevance: { type: Number, min: 1, max: 10, default: 5 },
    upvotes:            { type: Number, default: 0 },
  },
  { timestamps: true }
);

CardSchema.index({ topic: 1, difficulty: 1 });
CardSchema.index({ tags: 1 });

export const Card: Model<ICard> =
  mongoose.models.Card ?? mongoose.model<ICard>("Card", CardSchema);

// ─── UserMemory ───────────────────────────────────────────────────────────────

export interface IUserMemory extends Document {
  userId: mongoose.Types.ObjectId;
  cardId: mongoose.Types.ObjectId;
  topic: string;
  conceptKey: string;
  confidenceScore: number;
  strength: "strong" | "medium" | "weak" | "forgotten";
  lastReviewed: Date;
  nextReview: Date;
  reviewCount: number;
  correctStreak: number;
  wrongStreak: number;
  retentionRate: number;
  quizAttempts: number;
  quizCorrect: number;
  interviewAttempts: number;
  interviewScoreAvg: number;
  codingAttempts: number;
  codingSolved: number;
  updatedAt: Date;
}

const UserMemorySchema = new Schema<IUserMemory>(
  {
    userId:            { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    cardId:            { type: Schema.Types.ObjectId, ref: "Card", required: true },
    topic:             { type: String, required: true },
    conceptKey:        { type: String, required: true },
    confidenceScore:   { type: Number, min: 0, max: 100, default: 0 },
    strength:          { type: String, enum: ["strong", "medium", "weak", "forgotten"], default: "weak" },
    lastReviewed:      { type: Date, default: Date.now },
    nextReview:        { type: Date, default: Date.now },
    reviewCount:       { type: Number, default: 0 },
    correctStreak:     { type: Number, default: 0 },
    wrongStreak:       { type: Number, default: 0 },
    retentionRate:     { type: Number, min: 0, max: 1, default: 0 },
    quizAttempts:      { type: Number, default: 0 },
    quizCorrect:       { type: Number, default: 0 },
    interviewAttempts: { type: Number, default: 0 },
    interviewScoreAvg: { type: Number, default: 0 },
    codingAttempts:    { type: Number, default: 0 },
    codingSolved:      { type: Number, default: 0 },
  },
  { timestamps: true }
);

UserMemorySchema.index({ userId: 1, topic: 1 });
UserMemorySchema.index({ userId: 1, strength: 1 });
UserMemorySchema.index({ userId: 1, nextReview: 1 });
// Compound unique — one memory record per user per card
UserMemorySchema.index({ userId: 1, cardId: 1 }, { unique: true });

export const UserMemory: Model<IUserMemory> =
  mongoose.models.UserMemory ?? mongoose.model<IUserMemory>("UserMemory", UserMemorySchema);

// ─── CardInteraction ──────────────────────────────────────────────────────────

export interface ICardInteraction extends Document {
  userId: mongoose.Types.ObjectId;
  cardId: mongoose.Types.ObjectId;
  action: "viewed" | "saved" | "known" | "weak" | "skipped" | "bookmarked" | "shared";
  timeSpentSeconds: number;
  sectionViewed?: string;
  createdAt: Date;
}

const CardInteractionSchema = new Schema<ICardInteraction>(
  {
    userId:           { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    cardId:           { type: Schema.Types.ObjectId, ref: "Card", required: true },
    action:           { type: String, enum: ["viewed","saved","known","weak","skipped","bookmarked","shared"], required: true },
    timeSpentSeconds: { type: Number, default: 0 },
    sectionViewed:    { type: String },
  },
  { timestamps: true }
);

CardInteractionSchema.index({ userId: 1, createdAt: -1 });
CardInteractionSchema.index({ userId: 1, cardId: 1, action: 1 });

export const CardInteraction: Model<ICardInteraction> =
  mongoose.models.CardInteraction ??
  mongoose.model<ICardInteraction>("CardInteraction", CardInteractionSchema);

// ─── Roadmap ─────────────────────────────────────────────────────────────────

export interface IRoadmapNode {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  orderIndex: number;
  dependencies: mongoose.Types.ObjectId[];
  estimatedHours: number;
  cardIds: mongoose.Types.ObjectId[];
}

export interface IRoadmap extends Document {
  name: string;
  description: string;
  category: string;
  isSystem: boolean;
  createdBy?: mongoose.Types.ObjectId;
  icon: string;
  nodes: IRoadmapNode[];
  estimatedHours: number;
  createdAt: Date;
}

const RoadmapNodeSchema = new Schema<IRoadmapNode>({
  title:          { type: String, required: true },
  description:    { type: String },
  orderIndex:     { type: Number, required: true },
  dependencies:   [{ type: Schema.Types.ObjectId }],
  estimatedHours: { type: Number, default: 2 },
  cardIds:        [{ type: Schema.Types.ObjectId, ref: "Card" }],
});

const RoadmapSchema = new Schema<IRoadmap>(
  {
    name:           { type: String, required: true },
    description:    { type: String },
    category:       { type: String, required: true, index: true },
    isSystem:       { type: Boolean, default: false },
    createdBy:      { type: Schema.Types.ObjectId, ref: "User" },
    icon:           { type: String, default: "📚" },
    nodes:          [RoadmapNodeSchema],
    estimatedHours: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Roadmap: Model<IRoadmap> =
  mongoose.models.Roadmap ?? mongoose.model<IRoadmap>("Roadmap", RoadmapSchema);

// ─── UserRoadmapProgress ──────────────────────────────────────────────────────

export interface IUserRoadmapProgress extends Document {
  userId: mongoose.Types.ObjectId;
  roadmapId: mongoose.Types.ObjectId;
  nodeProgress: {
    nodeId: mongoose.Types.ObjectId;
    status: "locked" | "available" | "in_progress" | "completed";
    masteryLevel: "none" | "learning" | "proficient" | "mastered";
    completionPercent: number;
    confidenceScore: number;
    lastActivity: Date;
  }[];
  overallPercent: number;
  updatedAt: Date;
}

const UserRoadmapProgressSchema = new Schema<IUserRoadmapProgress>(
  {
    userId:    { type: Schema.Types.ObjectId, ref: "User", required: true },
    roadmapId: { type: Schema.Types.ObjectId, ref: "Roadmap", required: true },
    nodeProgress: [{
      nodeId:            { type: Schema.Types.ObjectId, required: true },
      status:            { type: String, enum: ["locked","available","in_progress","completed"], default: "locked" },
      masteryLevel:      { type: String, enum: ["none","learning","proficient","mastered"], default: "none" },
      completionPercent: { type: Number, default: 0 },
      confidenceScore:   { type: Number, default: 0 },
      lastActivity:      { type: Date },
    }],
    overallPercent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

UserRoadmapProgressSchema.index({ userId: 1, roadmapId: 1 }, { unique: true });

export const UserRoadmapProgress: Model<IUserRoadmapProgress> =
  mongoose.models.UserRoadmapProgress ??
  mongoose.model<IUserRoadmapProgress>("UserRoadmapProgress", UserRoadmapProgressSchema);

// ─── QuizSession ──────────────────────────────────────────────────────────────

export interface IQuizSession extends Document {
  userId: mongoose.Types.ObjectId;
  topic: string;
  nodeId?: mongoose.Types.ObjectId;
  preferences: {
    count: number;
    difficulty: string;
    type: string;
  };
  questions: {
    questionText: string;
    type: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
    codeSnippet?: string;
    difficulty: string;
    topic: string;
  }[];
  answers: {
    questionIndex: number;
    userAnswer: string;
    isCorrect: boolean;
    timeTakenSeconds: number;
  }[];
  score: number;
  totalTimeTakenSeconds: number;
  status: "in_progress" | "completed";
  createdAt: Date;
}

const QuizSessionSchema = new Schema<IQuizSession>(
  {
    userId:  { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    topic:   { type: String, required: true },
    nodeId:  { type: Schema.Types.ObjectId, ref: "Roadmap" },
    preferences: {
      count:      { type: Number, default: 10 },
      difficulty: { type: String, default: "mixed" },
      type:       { type: String, default: "mixed" },
    },
    questions: [{
      questionText:  { type: String, required: true },
      type:          { type: String, required: true },
      options:       [String],
      correctAnswer: { type: String, required: true },
      explanation:   { type: String },
      codeSnippet:   { type: String },
      difficulty:    { type: String },
      topic:         { type: String },
    }],
    answers: [{
      questionIndex:    { type: Number },
      userAnswer:       { type: String },
      isCorrect:        { type: Boolean },
      timeTakenSeconds: { type: Number },
    }],
    score:                 { type: Number, default: 0 },
    totalTimeTakenSeconds: { type: Number, default: 0 },
    status:                { type: String, enum: ["in_progress","completed"], default: "in_progress" },
  },
  { timestamps: true }
);

export const QuizSession: Model<IQuizSession> =
  mongoose.models.QuizSession ?? mongoose.model<IQuizSession>("QuizSession", QuizSessionSchema);

// ─── Upload ───────────────────────────────────────────────────────────────────

export interface IUpload extends Document {
  userId: mongoose.Types.ObjectId;
  filename: string;
  fileType: "pdf" | "docx" | "ppt" | "md" | "txt" | "image" | "url" | "paste";
  sourceUrl?: string;
  storageKey?: string;
  processingStatus: "queued" | "processing" | "completed" | "failed";
  processingStage?: string;
  progressPercent: number;
  errorMessage?: string;
  retryCount: number;
  extractedConceptsCount: number;
  cardIds: mongoose.Types.ObjectId[];
  roadmapId?: mongoose.Types.ObjectId;
  conceptGraph?: object;
  createdAt: Date;
}

const UploadSchema = new Schema<IUpload>(
  {
    userId:                 { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    filename:               { type: String, required: true },
    fileType:               { type: String, enum: ["pdf","docx","ppt","md","txt","image","url","paste"], required: true },
    sourceUrl:              { type: String },
    storageKey:             { type: String },
    processingStatus:       { type: String, enum: ["queued","processing","completed","failed"], default: "queued", index: true },
    processingStage:        { type: String },
    progressPercent:        { type: Number, default: 0 },
    errorMessage:           { type: String },
    retryCount:             { type: Number, default: 0 },
    extractedConceptsCount: { type: Number, default: 0 },
    cardIds:                [{ type: Schema.Types.ObjectId, ref: "Card" }],
    roadmapId:              { type: Schema.Types.ObjectId, ref: "Roadmap" },
    conceptGraph:           { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Upload: Model<IUpload> =
  mongoose.models.Upload ?? mongoose.model<IUpload>("Upload", UploadSchema);

// ─── MentorConversation ───────────────────────────────────────────────────────

export interface IMentorConversation extends Document {
  userId: mongoose.Types.ObjectId;
  mentorType: string;
  messages: {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }[];
  contextSummary?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MentorConversationSchema = new Schema<IMentorConversation>(
  {
    userId:     { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    mentorType: { type: String, required: true },
    messages: [{
      role:      { type: String, enum: ["user","assistant"], required: true },
      content:   { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    }],
    contextSummary: { type: String },
  },
  { timestamps: true }
);

MentorConversationSchema.index({ userId: 1, mentorType: 1 });

export const MentorConversation: Model<IMentorConversation> =
  mongoose.models.MentorConversation ??
  mongoose.model<IMentorConversation>("MentorConversation", MentorConversationSchema);

// ─── UserStreak ───────────────────────────────────────────────────────────────

export interface IUserStreak extends Document {
  userId: mongoose.Types.ObjectId;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  dailyGoalMinutes: number;
  minutesToday: number;
  dailyStats: {
    date: Date;
    cardsViewed: number;
    cardsSaved: number;
    quizScoreAvg: number;
    minutesActive: number;
    weakConceptsReviewed: number;
  }[];
  updatedAt: Date;
}

const UserStreakSchema = new Schema<IUserStreak>(
  {
    userId:           { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    currentStreak:    { type: Number, default: 0 },
    longestStreak:    { type: Number, default: 0 },
    lastActiveDate:   { type: Date, default: Date.now },
    dailyGoalMinutes: { type: Number, default: 30 },
    minutesToday:     { type: Number, default: 0 },
    dailyStats: [{
      date:                   { type: Date, required: true },
      cardsViewed:            { type: Number, default: 0 },
      cardsSaved:             { type: Number, default: 0 },
      quizScoreAvg:           { type: Number, default: 0 },
      minutesActive:          { type: Number, default: 0 },
      weakConceptsReviewed:   { type: Number, default: 0 },
    }],
  },
  { timestamps: true }
);

export const UserStreak: Model<IUserStreak> =
  mongoose.models.UserStreak ?? mongoose.model<IUserStreak>("UserStreak", UserStreakSchema);
