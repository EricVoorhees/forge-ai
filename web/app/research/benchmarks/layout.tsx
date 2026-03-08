import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FORGE 1 Benchmarks | Open Frame",
  description: "Performance benchmarks for FORGE 1 across coding, mathematics, reasoning, and generation tasks. HumanEval 65.2%, MATH-500 90.2%, MMLU 87.1%. Compare against GPT-4, Claude, and other leading models.",
  keywords: [
    "FORGE 1 benchmarks",
    "AI model benchmarks",
    "HumanEval",
    "MATH-500",
    "MMLU",
    "LLM comparison",
    "code generation benchmark",
    "Open Frame research",
    "671B model performance"
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://openframe.co/research/benchmarks",
    siteName: "Open Frame",
    title: "FORGE 1 Benchmarks - AI Model Performance",
    description: "Performance benchmarks for FORGE 1: HumanEval 65.2%, MATH-500 90.2%, MMLU 87.1%. Compare against leading AI models.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FORGE 1 Benchmarks by Open Frame",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FORGE 1 Benchmarks | Open Frame",
    description: "HumanEval 65.2%, MATH-500 90.2%, MMLU 87.1% - see how FORGE 1 performs.",
    images: ["/og-image.png"],
    creator: "@openframe",
  },
  alternates: {
    canonical: "https://openframe.co/research/benchmarks",
  },
};

export default function BenchmarksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
