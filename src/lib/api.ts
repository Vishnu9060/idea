"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  KnowledgeCard,
  Roadmap,
  ConceptMemory,
  MemoryReport,
  QuizSession,
  QuizPreferences,
  MentorMessage,
  UserUpload,
} from "@/types";

// ─── Helpers ───────────────────────────────────────────────

async function fetchJSON(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data;
}

// ─── Feed ───────────────────────────────────────────────────

export function useFeed(userId: string | null) {
  return useQuery({
    queryKey: ["feed", userId],
    queryFn: async () => {
      const data = await fetchJSON(`/api/feed?userId=${userId}&limit=20`);
      return data.cards as KnowledgeCard[];
    },
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useInteract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      userId: string;
      cardId: string;
      action: string;
      timeSpentSeconds: number;
      topic: string;
      conceptKey: string;
    }) => {
      return fetchJSON("/api/feed/interact", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["memory"] });
    },
  });
}

// ─── Roadmaps ───────────────────────────────────────────────

export function useRoadmaps(userId: string | null) {
  return useQuery({
    queryKey: ["roadmaps", userId],
    queryFn: async () => {
      const data = await fetchJSON(`/api/roadmaps?userId=${userId}`);
      return data.roadmaps as Roadmap[];
    },
    enabled: !!userId,
    staleTime: 60_000,
  });
}

export function useUpdateRoadmapProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      userId: string;
      roadmapId: string;
      nodeId: string;
      status: string;
      masteryLevel: string;
      completionPercent: number;
      confidenceScore: number;
    }) => {
      return fetchJSON("/api/roadmaps", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmaps"] });
    },
  });
}

// ─── Memory ─────────────────────────────────────────────────

export function useMemory(userId: string | null) {
  return useQuery({
    queryKey: ["memory", userId],
    queryFn: async () => {
      const data = await fetchJSON(`/api/memory?userId=${userId}`);
      return data as MemoryReport & { streak: any };
    },
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useBatchUpdateMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { userId: string; updates: any[] }) => {
      return fetchJSON("/api/memory/update", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memory"] });
    },
  });
}

// ─── Uploads ────────────────────────────────────────────────

export function useUploads(userId: string | null) {
  return useQuery({
    queryKey: ["uploads", userId],
    queryFn: async () => {
      const data = await fetchJSON(`/api/upload?userId=${userId}`);
      return data.uploads as UserUpload[];
    },
    enabled: !!userId,
    staleTime: 10_000,
  });
}

export function useCreateUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      userId: string;
      filename: string;
      fileType: string;
      sourceUrl?: string;
    }) => {
      return fetchJSON("/api/upload", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploads"] });
    },
  });
}

export function useProcessUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      uploadId: string;
      userId: string;
      content?: string;
      fileData?: string;
      fileType: string;
      outputs: string[];
    }) => {
      return fetchJSON("/api/upload/process", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploads"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["roadmaps"] });
      queryClient.invalidateQueries({ queryKey: ["memory"] });
    },
  });
}

export function useUpdateUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      uploadId: string;
      processingStatus: string;
      processingStage?: string;
      progressPercent?: number;
      extractedConceptsCount?: number;
      cardIds?: string[];
      errorMessage?: string;
    }) => {
      return fetchJSON("/api/upload", {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploads"] });
    },
  });
}

// ─── Quiz ───────────────────────────────────────────────────

export function useCreateQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      userId: string;
      topic: string;
      preferences: QuizPreferences;
      questions: any[];
    }) => {
      return fetchJSON("/api/quiz", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz"] });
    },
  });
}

export function useSubmitAnswer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      sessionId: string;
      questionIndex: number;
      userAnswer: string;
      isCorrect: boolean;
      timeTakenSeconds: number;
    }) => {
      return fetchJSON("/api/quiz", {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quiz", variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ["memory"] });
    },
  });
}

export function useQuizSession(sessionId: string | null) {
  return useQuery({
    queryKey: ["quiz", sessionId],
    queryFn: async () => {
      const data = await fetchJSON(`/api/quiz?sessionId=${sessionId}`);
      return data.session as QuizSession;
    },
    enabled: !!sessionId,
  });
}

// ─── Mentors ────────────────────────────────────────────────

export function useMentorConversation(userId: string | null, mentorType: string | null) {
  return useQuery({
    queryKey: ["mentors", userId, mentorType],
    queryFn: async () => {
      const data = await fetchJSON(`/api/mentors?userId=${userId}&mentorType=${mentorType}`);
      return data.conversation as { messages: MentorMessage[] } | null;
    },
    enabled: !!userId && !!mentorType,
    staleTime: 5_000,
  });
}

export function useSendMentorMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      userId: string;
      mentorType: string;
      userMessage: string;
      cardContext?: string;
    }) => {
      return fetchJSON("/api/mentors", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["mentors", variables.userId, variables.mentorType] });
    },
  });
}

// ─── Flashcards ─────────────────────────────────────────────

export function useFlashcards(userId: string | null) {
  return useQuery({
    queryKey: ["flashcards", userId],
    queryFn: async () => {
      const data = await fetchJSON(`/api/flashcards?userId=${userId}`);
      return data.flashcards as any[];
    },
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useCreateFlashcards() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      userId: string;
      sourceUploadId?: string;
      cards: { front: string; back: string; topic: string; difficulty: string }[];
    }) => {
      return fetchJSON("/api/flashcards", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
    },
  });
}

export function useAnswerFlashcard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      flashcardId: string;
      userId: string;
      isCorrect: boolean;
      timeTakenSeconds: number;
    }) => {
      return fetchJSON("/api/flashcards/answer", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      queryClient.invalidateQueries({ queryKey: ["memory"] });
    },
  });
}

