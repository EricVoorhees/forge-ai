import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Error Handling",
  description: "Handle Open Frame API errors gracefully. Complete guide to error codes, retry strategies, and best practices for robust AI application development.",
  keywords: ["API errors", "error handling", "retry strategy", "error codes", "API troubleshooting"],
  openGraph: {
    title: "Open Frame API Error Handling Guide",
    description: "Handle API errors gracefully with proper retry strategies and error code reference.",
    url: "https://openframe.co/docs/api/errors",
    images: [{ url: "/og-image.png", width: 1280, height: 720, alt: "Open Frame API Error Handling" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Open Frame API Error Handling | Open Frame",
    description: "Complete guide to API error codes and retry strategies.",
    images: ["/og-image.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
