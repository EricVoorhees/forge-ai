import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Streaming API",
  description: "Implement real-time streaming responses with the FORGE API. Server-sent events, chunked responses, and streaming best practices for low-latency AI applications.",
  keywords: ["streaming API", "SSE", "server-sent events", "real-time AI", "chunked responses", "low latency"],
  openGraph: {
    title: "FORGE Streaming API - Real-Time Responses",
    description: "Implement streaming responses with server-sent events. Build low-latency AI applications with FORGE.",
    url: "https://openframe.co/docs/api/streaming",
    images: [{ url: "/og-image.png", width: 1280, height: 720, alt: "FORGE Streaming API" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FORGE Streaming API | Open Frame",
    description: "Real-time streaming responses with server-sent events.",
    images: ["/og-image.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
