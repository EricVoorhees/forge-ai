import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best Practices",
  description: "Best practices for building with the Open Frame API. Optimize performance, reduce costs, handle errors gracefully, and build production-ready AI applications.",
  keywords: ["API best practices", "AI optimization", "cost reduction", "production AI", "FORGE tips"],
  openGraph: {
    title: "Open Frame API Best Practices - Build Better AI Apps",
    description: "Optimize performance, reduce costs, and build production-ready AI applications with FORGE.",
    url: "https://openframe.co/docs/guides/best-practices",
    images: [{ url: "/og-image.png", width: 1280, height: 720, alt: "Open Frame API Best Practices" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Open Frame API Best Practices | Open Frame",
    description: "Build production-ready AI applications with these best practices.",
    images: ["/og-image.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
