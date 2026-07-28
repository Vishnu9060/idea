"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { KnowledgeCardComponent } from "@/components/cards/KnowledgeCard";
import { CardSkeleton } from "@/components/cards/CardSkeleton";
import { useAuth } from "@/lib/auth-context";
import { useFeed, useInteract } from "@/lib/api";
import { toast } from "sonner";
import { Brain, TrendingUp, Flame, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export function FeedContainer() {
  const { userId } = useAuth();
  const { data: cards, isLoading, isError } = useFeed(userId);
  const interactMutation = useInteract();
  const queryClient = useQueryClient();
  const [activeIndex, setActiveIndex] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timeTrackingRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const activeCard = cards?.[activeIndex];
    if (activeCard) {
      timeTrackingRef.current.set(activeCard.id, Date.now());
    }
  }, [activeIndex, cards]);

  useEffect(() => {
    if (!cards?.length) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(
              (entry.target as HTMLElement).dataset.index ?? "0"
            );
            setActiveIndex(index);
          }
        });
      },
      { threshold: 0.6 }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observerRef.current?.observe(ref);
    });

    return () => observerRef.current?.disconnect();
  }, [cards]);

  const handleKnown = useCallback(
    (id: string) => {
      if (!userId || !cards) return;
      const card = cards.find((c) => c.id === id);
      if (!card) return;

      const startTime = timeTrackingRef.current.get(id);
      const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 5;

      interactMutation.mutate({
        userId,
        cardId: id,
        action: "known",
        timeSpentSeconds: timeSpent,
        topic: card.topic,
        conceptKey: card.concept,
      }, {
        onSuccess: () => {
          toast.success("Marked as Known! Confidence increased", { icon: "✅", duration: 2000 });
          queryClient.invalidateQueries({ queryKey: ["memory", userId] });
        },
        onError: () => {
          toast.error("Failed to update. Please try again.");
        },
      });
    },
    [userId, cards, interactMutation, queryClient]
  );

  const handleWeak = useCallback(
    (id: string) => {
      if (!userId || !cards) return;
      const card = cards.find((c) => c.id === id);
      if (!card) return;

      const startTime = timeTrackingRef.current.get(id);
      const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 5;

      interactMutation.mutate({
        userId,
        cardId: id,
        action: "weak",
        timeSpentSeconds: timeSpent,
        topic: card.topic,
        conceptKey: card.concept,
      }, {
        onSuccess: () => {
          toast("Added to Revision Queue", { icon: "📌", duration: 2000 });
          queryClient.invalidateQueries({ queryKey: ["memory", userId] });
        },
        onError: () => {
          toast.error("Failed to update. Please try again.");
        },
      });
    },
    [userId, cards, interactMutation, queryClient]
  );

  const handleBookmark = useCallback(
    (id: string) => {
      if (!userId || !cards) return;
      const card = cards.find((c) => c.id === id);
      if (!card) return;

      interactMutation.mutate({
        userId,
        cardId: id,
        action: "bookmarked",
        timeSpentSeconds: 0,
        topic: card.topic,
        conceptKey: card.concept,
      }, {
        onSuccess: () => toast.success("Saved to bookmarks", { icon: "🔖", duration: 1500 }),
        onError: () => toast.error("Failed to bookmark"),
      });
    },
    [userId, cards, interactMutation]
  );

  if (isLoading) {
    return (
      <div className="feed-container">
        <div className="snap-feed">
          {[0, 1].map((i) => (
            <div key={i} className="feed-card-wrapper flex items-center justify-center md:p-6">
              <div className="w-full h-full md:max-w-lg md:h-auto md:rounded-2xl overflow-hidden md:shadow-elevated">
                <CardSkeleton />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="feed-container flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto px-6">
          <AlertCircle size={48} className="text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-foreground">Failed to load feed</h2>
          <p className="text-sm text-muted-foreground">Something went wrong. Please try again.</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["feed", userId] })}
            className="px-5 py-2.5 rounded-xl bg-accent font-semibold text-sm hover:bg-accent-hover transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="feed-container flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto px-6">
          <Brain size={48} className="text-muted-foreground/30 mx-auto" />
          <h2 className="text-xl font-bold text-foreground">Your feed is empty</h2>
          <p className="text-sm text-muted-foreground">Upload your first learning resource to generate personalized knowledge cards.</p>
          <a href="/learn/uploads" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent font-semibold text-sm hover:bg-accent-hover transition-colors">Upload Content</a>
        </div>
      </div>
    );
  }

  return (
    <div className="feed-container">
      <div className="hidden md:flex items-center justify-between px-6 py-4 border-b border-border bg-background sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-bold">Your Feed</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Personalized by your Memory Engine</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
            <Flame size={13} />{cards.length} cards loaded
          </div>
        </div>
      </div>

      <div className="snap-feed" ref={feedRef}>
        {cards.map((card: any, index: number) => (
          <div key={card.id ?? index} ref={(el) => { cardRefs.current[index] = el; }} data-index={index}>
            <KnowledgeCardComponent card={card} isActive={index === activeIndex} onKnown={handleKnown} onWeak={handleWeak} onBookmark={handleBookmark} />
          </div>
        ))}
        <div className="feed-card-wrapper flex items-center justify-center">
          <div className="text-center space-y-3">
            <TrendingUp size={32} className="text-muted-foreground/40 mx-auto" />
            <p className="text-muted-foreground font-medium">{cards.length} concepts loaded</p>
            <p className="text-sm text-muted-foreground/60">Upload more content to expand your feed</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-24 right-4 md:hidden">
        <div className="text-[11px] font-semibold text-muted-foreground bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-border shadow-sm">
          {activeIndex + 1} / {cards.length}
        </div>
      </div>
    </div>
  );
}
