import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Input Methods",
  description: "Learn the different ways to submit code to FORGE Audit: paste code directly, upload files, connect GitHub repositories, or integrate with your CI/CD pipeline.",
  openGraph: {
    title: "FORGE Audit Input Methods - Code Submission Options",
    description: "Submit code via paste, file upload, GitHub integration, or CI/CD pipeline. Multiple ways to scan your code for vulnerabilities.",
    url: "https://openframe.co/audit-docs/methods",
    images: [{ url: "/og-image.png", width: 1280, height: 720, alt: "FORGE Audit Input Methods" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FORGE Audit Input Methods",
    description: "Multiple ways to submit code for security scanning: paste, upload, GitHub, or CI/CD.",
    images: ["/og-image.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
