import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | Open Frame",
  description: "Create your Open Frame account to get started with the FORGE API. Access the 671B parameter AI model for code generation, reasoning, and analysis at $1.00/1M tokens.",
  keywords: [
    "Open Frame signup",
    "FORGE API account",
    "AI API registration",
    "create account",
    "get started"
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://openframe.co/register",
    siteName: "Open Frame",
    title: "Create Your Open Frame Account",
    description: "Get started with the FORGE API. Access the 671B parameter AI model at $1.00/1M tokens.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Create Open Frame Account",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Account | Open Frame",
    description: "Get started with the FORGE API today.",
    images: ["/og-image.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
