import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat Completions API",
  description: "Complete reference for the FORGE Chat Completions API. Create conversations, generate code, and build AI applications with the 671B parameter FORGE model.",
  keywords: ["chat completions", "Open Frame API", "conversation API", "AI chat", "code generation API", "OpenAI compatible"],
  openGraph: {
    title: "FORGE Chat Completions API Reference",
    description: "Complete API reference for chat completions. Create conversations and generate code with FORGE.",
    url: "https://openframe.co/docs/api/chat",
    images: [{ url: "/og-image.png", width: 1280, height: 720, alt: "FORGE Chat Completions API" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FORGE Chat Completions API | Open Frame",
    description: "Complete API reference for chat completions with FORGE.",
    images: ["/og-image.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
