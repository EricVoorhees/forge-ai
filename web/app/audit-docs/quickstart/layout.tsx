import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quickstart Guide",
  description: "Get started with FORGE Audit in under 5 minutes. Learn how to run your first AI-powered security scan using the CLI, API, or GitHub integration.",
  openGraph: {
    title: "FORGE Audit Quickstart - Run Your First Security Scan",
    description: "Get started with FORGE Audit in under 5 minutes. Install the CLI, configure your API key, and run your first security scan.",
    url: "https://openframe.co/audit-docs/quickstart",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "FORGE Audit Quickstart Guide" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FORGE Audit Quickstart Guide",
    description: "Run your first AI-powered security scan in under 5 minutes.",
    images: ["/og-image.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
