// Shared TypeScript types for KnowledgeScroll

export type Difficulty = "beginner" | "intermediate" | "advanced";
export type Strength = "strong" | "medium" | "weak" | "forgotten";
export type SubscriptionTier = "free" | "pro" | "enterprise";
export type QuestionType = "mcq" | "coding" | "theory" | "interview" | "mixed";
export type QuizDifficulty = "easy" | "medium" | "hard" | "mixed";
export type MentorType =
  | "java"
  | "python"
  | "devops"
  | "cybersecurity"
  | "ai"
  | "system_design"
  | "interview"
  | "placement"
  | "aptitude"
  | "tech_news";

// ─── Card ───────────────────────────────────────────────────────────────────

export interface KnowledgeCard {
  id: string;
  source: "ai_feed" | "upload" | "mentor";
  title: string;
  concept: string;
  explanation: string;
  example: string;
  interviewTip: string;
  commonMistake: string;
  visualizationUrl?: string;
  difficulty: Difficulty;
  readingTimeSeconds: number;
  topic: string;
  subtopic: string;
  tags: string[];
  upvotes: number;
  createdAt: string;
  // user-specific
  isBookmarked?: boolean;
  userStrength?: Strength;
  confidenceScore?: number;
}

export interface CardInteraction {
  cardId: string;
  action: "viewed" | "saved" | "known" | "weak" | "skipped";
  timeSpentSeconds: number;
  swipeDirection?: "up" | "down" | "left" | "right";
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  subscriptionTier: SubscriptionTier;
  preferences: UserPreferences;
  onboardingComplete: boolean;
  createdAt: string;
}

export interface UserPreferences {
  learningGoals: string[];
  topics: string[];
  dailyGoalMinutes: number;
  preferredDifficulty: Difficulty;
  notificationsEnabled: boolean;
}

// ─── Memory Engine ───────────────────────────────────────────────────────────

export interface ConceptMemory {
  id: string;
  topic: string;
  conceptKey: string;
  confidenceScore: number;
  strength: Strength;
  lastReviewed: string;
  nextReview: string;
  reviewCount: number;
  correctStreak: number;
  wrongStreak: number;
  retentionRate: number;
}

export interface MemoryReport {
  strong: ConceptMemory[];
  medium: ConceptMemory[];
  weak: ConceptMemory[];
  forgotten: ConceptMemory[];
  dueReview: ConceptMemory[];
  overallScore: number;
  topicsBreakdown: TopicBreakdown[];
  streak: StreakData | null;
  total: number;
}

export interface TopicBreakdown {
  topic: string;
  averageConfidence: number;
  conceptCount: number;
  weakCount: number;
  strongCount: number;
}

// ─── Roadmap ─────────────────────────────────────────────────────────────────

export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  dependencies: string[];
  estimatedHours: number;
  status: "locked" | "available" | "in_progress" | "completed";
  masteryLevel: "none" | "learning" | "proficient" | "mastered";
  completionPercent: number;
  confidenceScore: number;
}

export interface Roadmap {
  id: string;
  name: string;
  description: string;
  category: string;
  isSystem: boolean;
  nodes: RoadmapNode[];
  totalNodes: number;
  completedNodes: number;
  estimatedHours: number;
  icon: string;
}

// ─── Quiz ────────────────────────────────────────────────────────────────────

export interface QuizPreferences {
  count: 5 | 10 | 20 | 30 | 50;
  difficulty: QuizDifficulty;
  type: QuestionType;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];      // for MCQ
  correctAnswer: string;
  explanation: string;
  codeSnippet?: string;
  difficulty: Difficulty;
  topic: string;
}

export interface QuizSession {
  id: string;
  topic: string;
  preferences: QuizPreferences;
  questions: QuizQuestion[];
  currentIndex: number;
  answers: Record<string, string>;
  score?: number;
  timeTakenSeconds?: number;
  status: "in_progress" | "completed";
  createdAt: string;
}

// ─── Mentor ──────────────────────────────────────────────────────────────────

export interface Mentor {
  id: MentorType;
  name: string;
  specialty: string;
  description: string;
  personality: string;
  avatar: string;
  color: string;
  topics: string[];
  isAvailable: boolean;
}

export interface MentorMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface MentorConversation {
  id: string;
  mentorType: MentorType;
  messages: MentorMessage[];
  createdAt: string;
  updatedAt: string;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  dailyGoalMinutes: number;
  minutesToday: number;
  dailyStats: DailyStats[];
}

export interface DailyStats {
  date: string;
  cardsViewed: number;
  cardsSaved: number;
  quizScoreAvg: number;
  minutesActive: number;
  weakConceptsReviewed: number;
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export type FileType = "pdf" | "docx" | "ppt" | "md" | "txt" | "image";
export type ProcessingStatus = "queued" | "processing" | "completed" | "failed";

export interface UserUpload {
  id: string;
  filename: string;
  fileType: FileType;
  storageUrl: string;
  processingStatus: ProcessingStatus;
  extractedConceptsCount?: number;
  cardIds?: string[];
  createdAt: string;
}

// ─── Feed ─────────────────────────────────────────────────────────────────────

export interface FeedWeights {
  forgotten: number;
  weak: number;
  new: number;
  trending: number;
}
