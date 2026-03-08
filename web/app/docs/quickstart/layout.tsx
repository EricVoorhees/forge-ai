import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quickstart",
  description: "Get started with the FORGE API in minutes. Install the SDK, configure authentication, and make your first API call to the 671B parameter FORGE 1 model.",
  openGraph: {
    title: "FORGE API Quickstart - Get Started in Minutes",
    description: "Install the SDK, configure your API key, and make your first call to FORGE 1. Complete quickstart guide for Python, Node.js, and cURL.",
    url: "https://openframe.co/docs/quickstart",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "FORGE API Quickstart Guide" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FORGE API Quickstart | Open Frame",
    description: "Get started with the FORGE API in minutes.",
    images: ["/og-image.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
