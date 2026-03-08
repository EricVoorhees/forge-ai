import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Open Frame FORGE Architecture",
  description: "Technical specifications for Open Frame's FORGE model - a state-of-the-art 671B parameter Mixture-of-Experts model with 128K context window, 37B active parameters, optimized for code generation and reasoning.",
  keywords: [
    "Open Frame FORGE architecture",
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
    title: "Open Frame FORGE Architecture",
    description: "Technical deep-dive into Open Frame's FORGE model: 671B parameters, 128K context, Mixture-of-Experts architecture.",
    images: [
      {
        url: "https://openframe.co/og-image.png",
        width: 1280,
        height: 720,
        alt: "Open Frame FORGE Architecture",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Open Frame FORGE Architecture",
    description: "Open Frame's state-of-the-art 671B parameter MoE model with 128K context.",
    images: ["https://openframe.co/og-image.png"],
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
