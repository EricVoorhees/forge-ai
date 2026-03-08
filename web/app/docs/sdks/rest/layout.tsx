import { Metadata } from "next";

export const metadata: Metadata = {
  title: "REST API",
  description: "Direct REST API access to FORGE. Complete reference for HTTP endpoints, request/response formats, and integration without SDKs using cURL or any HTTP client.",
  keywords: ["REST API", "HTTP API", "cURL", "direct API access", "OpenAI compatible REST"],
  openGraph: {
    title: "FORGE REST API - Direct HTTP Access",
    description: "Access FORGE directly via REST API. Complete HTTP endpoint reference for any language or platform.",
    url: "https://openframe.co/docs/sdks/rest",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "FORGE REST API" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FORGE REST API | Open Frame",
    description: "Direct HTTP access to the FORGE API without SDKs.",
    images: ["/og-image.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
