import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CI/CD Integration",
  description: "Integrate Open Frame Audit into your CI/CD pipeline. Complete setup guides for GitHub Actions, GitLab CI, Jenkins, and CircleCI with automated security scanning on every commit.",
  keywords: [
    "CI/CD security",
    "GitHub Actions security scanning",
    "GitLab CI security",
    "Jenkins security plugin",
    "CircleCI security",
    "automated vulnerability detection",
    "DevSecOps",
    "shift-left security"
  ],
  openGraph: {
    title: "Open Frame Audit CI/CD Integration - Automated Security Scanning",
    description: "Add automated security scanning to your CI/CD pipeline. Block merges on critical vulnerabilities with GitHub Actions, GitLab CI, Jenkins, and CircleCI.",
    url: "https://openframe.co/audit-docs/cicd",
    images: [{ url: "/og-image.png", width: 1280, height: 720, alt: "Open Frame Audit CI/CD Integration" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Open Frame Audit CI/CD Integration",
    description: "Automated security scanning for GitHub Actions, GitLab CI, Jenkins, and CircleCI.",
    images: ["/og-image.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
