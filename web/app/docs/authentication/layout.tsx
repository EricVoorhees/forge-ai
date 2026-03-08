import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Learn how to authenticate with the FORGE API. Generate API keys, configure authorization headers, and implement secure authentication in your applications.",
  openGraph: {
    title: "FORGE API Authentication - Secure Your Requests",
    description: "Generate API keys, configure authorization headers, and implement secure authentication with the FORGE API.",
    url: "https://openframe.co/docs/authentication",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "FORGE API Authentication" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FORGE API Authentication | Open Frame",
    description: "Secure authentication guide for the FORGE API.",
    images: ["/og-image.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
