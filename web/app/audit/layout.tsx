import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Open Frame Audit - AI-Powered Code Security Analysis",
  description: "Open Frame Audit detects vulnerabilities, security flaws, and code quality issues before they reach production. Powered by our state-of-the-art FORGE model with 99.2% detection rate across 50+ vulnerability types.",
  keywords: [
    "Open Frame",
    "code security",
    "vulnerability detection",
    "AI security scanner",
    "static analysis",
    "SAST",
    "code review",
    "SQL injection detection",
    "XSS detection",
    "secret scanning",
    "CI/CD security",
    "GitHub Actions security",
    "code quality",
    "security automation"
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://openframe.co/audit",
    siteName: "Open Frame",
    title: "Open Frame Audit - AI-Powered Code Security",
    description: "Detect vulnerabilities and security flaws before they reach production. Powered by our state-of-the-art FORGE model with 99.2% detection rate.",
    images: [
      {
        url: "https://openframe.co/og-image.png",
        width: 1280,
        height: 720,
        alt: "Open Frame Audit - AI-Powered Code Security Analysis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Open Frame Audit - AI-Powered Code Security",
    description: "Detect vulnerabilities and security flaws before production. Powered by our state-of-the-art FORGE model.",
    images: ["https://openframe.co/og-image.png"],
    creator: "@openframe",
  },
  alternates: {
    canonical: "https://openframe.co/audit",
  },
};

export default function AuditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
