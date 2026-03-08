import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FORGE 1 Architecture | Open Frame",
  description: "Technical specifications for FORGE 1 - a 671B parameter Mixture-of-Experts model with 128K context window, 37B active parameters, and state-of-the-art performance in code generation and reasoning.",
  keywords: [
    "FORGE 1 architecture",
    "671B parameters",
    "Mixture of Experts",
    "MoE model",
    "128K context",
    "37B active parameters",
    "transformer architecture",
    "Open Frame AI",
    "large language model"
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://openframe.co/research/model",
    siteName: "Open Frame",
    title: "FORGE 1 Architecture - 671B Parameter MoE Model",
    description: "Technical deep-dive into FORGE 1: 671B parameters, 128K context, Mixture-of-Experts architecture optimized for code generation.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FORGE 1 Architecture by Open Frame",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FORGE 1 Architecture | Open Frame",
    description: "671B parameter Mixture-of-Experts model with 128K context window.",
    images: ["/og-image.png"],
    creator: "@openframe",
  },
  alternates: {
    canonical: "https://openframe.co/research/model",
  },
};

export default function ModelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
