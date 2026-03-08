import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Learn how to authenticate with the Open Frame API. Generate API keys, configure authorization headers, and implement secure authentication in your applications.",
  openGraph: {
    title: "Open Frame API Authentication - Secure Your Requests",
    description: "Generate API keys, configure authorization headers, and implement secure authentication with the Open Frame API.",
    url: "https://openframe.co/docs/authentication",
    images: [{ url: "/og-image.png", width: 1280, height: 720, alt: "Open Frame API Authentication" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Open Frame API Authentication | Open Frame",
    description: "Secure authentication guide for the Open Frame API.",
    images: ["/og-image.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
