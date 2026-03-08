import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rate Limits",
  description: "Understand Open Frame API rate limits and quotas. Learn how to handle rate limiting, implement backoff strategies, and optimize your API usage.",
  keywords: ["rate limits", "API quotas", "throttling", "backoff strategy", "API limits"],
  openGraph: {
    title: "Open Frame API Rate Limits - Usage Guidelines",
    description: "Understand rate limits, implement backoff strategies, and optimize your Open Frame API usage.",
    url: "https://openframe.co/docs/guides/rate-limits",
    images: [{ url: "/og-image.png", width: 1280, height: 720, alt: "Open Frame API Rate Limits" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Open Frame API Rate Limits | Open Frame",
    description: "Rate limit guidelines and optimization strategies.",
    images: ["/og-image.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
