import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vulnerability Types",
  description: "Complete list of 50+ vulnerability types detected by Open Frame Audit: SQL injection, XSS, CSRF, authentication flaws, secret exposure, cryptographic issues, and more.",
  keywords: [
    "SQL injection detection",
    "XSS vulnerability scanner",
    "CSRF detection",
    "authentication vulnerability",
    "secret scanning",
    "API key detection",
    "cryptographic vulnerability",
    "OWASP Top 10",
    "security vulnerability types",
    "code security patterns"
  ],
  openGraph: {
    title: "Open Frame Audit Vulnerability Types - 50+ Security Patterns",
    description: "Detect SQL injection, XSS, CSRF, authentication flaws, exposed secrets, and 50+ other vulnerability types with AI-powered analysis.",
    url: "https://openframe.co/audit-docs/vulnerabilities",
    images: [{ url: "/og-image.png", width: 1280, height: 720, alt: "Open Frame Audit Vulnerability Detection" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Open Frame Audit - 50+ Vulnerability Types",
    description: "Comprehensive security coverage: SQL injection, XSS, CSRF, secrets, and more.",
    images: ["/og-image.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
