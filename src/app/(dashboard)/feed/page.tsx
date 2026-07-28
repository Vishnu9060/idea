import { FeedContainer } from "@/components/feed/FeedContainer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feed — KnowledgeScroll",
  description: "Your personalized AI knowledge feed. Every swipe teaches you something new.",
};

export default function FeedPage() {
  return <FeedContainer />;
}
