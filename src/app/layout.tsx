import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KnowledgeScroll — AI-Powered Learning",
  description:
    "Replace mindless scrolling with intelligent learning. AI-powered personalized knowledge cards, adaptive quizzes, roadmaps, and mentor agents.",
  keywords: [
    "AI learning",
    "knowledge cards",
    "spaced repetition",
    "coding interview prep",
    "personalized education",
  ],
  authors: [{ name: "KnowledgeScroll" }],
  openGraph: {
    title: "KnowledgeScroll — AI-Powered Learning",
    description: "Every swipe makes you smarter.",
    type: "website",
  },
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>
          {children}
          <Toaster
            position="top-center"
            richColors
            toastOptions={{
              style: { fontFamily: "var(--font-inter)" },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
