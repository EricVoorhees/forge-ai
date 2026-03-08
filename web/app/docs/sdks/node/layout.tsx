import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Node.js SDK",
  description: "Official FORGE Node.js SDK documentation. Install, configure, and use the JavaScript/TypeScript client library for the Open Frame API with full TypeScript support.",
  keywords: ["Node.js SDK", "FORGE JavaScript", "TypeScript SDK", "JavaScript AI library", "OpenAI compatible Node"],
  openGraph: {
    title: "FORGE Node.js SDK - Official Client Library",
    description: "Install and use the official Node.js SDK for the Open Frame API. Full TypeScript support and OpenAI compatibility.",
    url: "https://openframe.co/docs/sdks/node",
    images: [{ url: "/og-image.png", width: 1280, height: 720, alt: "FORGE Node.js SDK" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FORGE Node.js SDK | Open Frame",
    description: "Official Node.js/TypeScript client library for the Open Frame API.",
    images: ["/og-image.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
