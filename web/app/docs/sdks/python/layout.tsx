import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Python SDK",
  description: "Official FORGE Python SDK documentation. Install, configure, and use the Python client library for the FORGE API with async support and type hints.",
  keywords: ["Python SDK", "FORGE Python", "Python AI library", "async Python", "OpenAI compatible Python"],
  openGraph: {
    title: "FORGE Python SDK - Official Client Library",
    description: "Install and use the official Python SDK for the FORGE API. Async support, type hints, and OpenAI compatibility.",
    url: "https://openframe.co/docs/sdks/python",
    images: [{ url: "/og-image.png", width: 1280, height: 720, alt: "FORGE Python SDK" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FORGE Python SDK | Open Frame",
    description: "Official Python client library for the FORGE API.",
    images: ["/og-image.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
