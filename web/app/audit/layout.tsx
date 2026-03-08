import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FORGE Audit - AI-Powered Code Security Analysis | Open Frame",
  description: "Detect vulnerabilities, security flaws, and code quality issues before they reach production. FORGE Audit uses the 671B parameter FORGE 1 model to perform deep semantic analysis with 99.2% detection rate across 50+ vulnerability types.",
  keywords: [
    "code security",
    "vulnerability detection",
    "FORGE Audit",
    "Open Frame",
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
    title: "FORGE Audit - AI-Powered Code Security Analysis",
    description: "Detect vulnerabilities, security flaws, and code quality issues before they reach production. Powered by the FORGE 1 model with 99.2% detection rate.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FORGE Audit - AI-Powered Code Security Analysis by Open Frame",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FORGE Audit - AI-Powered Code Security Analysis",
    description: "Detect vulnerabilities, security flaws, and code quality issues before they reach production. Powered by FORGE 1.",
    images: ["/og-image.png"],
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
