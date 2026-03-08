import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Open Frame FORGE Benchmarks",
  description: "Performance benchmarks for Open Frame's state-of-the-art FORGE model across coding, mathematics, reasoning, and generation tasks. HumanEval 65.2%, MATH-500 90.2%, MMLU 87.1%.",
  keywords: [
    "Open Frame benchmarks",
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
    title: "Open Frame FORGE Benchmarks",
    description: "Performance benchmarks for Open Frame's FORGE model: HumanEval 65.2%, MATH-500 90.2%, MMLU 87.1%.",
    images: [
      {
        url: "https://openframe.co/og-image.png",
        width: 1280,
        height: 720,
        alt: "Open Frame FORGE Benchmarks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Open Frame FORGE Benchmarks",
    description: "HumanEval 65.2%, MATH-500 90.2%, MMLU 87.1% - see how Open Frame's FORGE model performs.",
    images: ["https://openframe.co/og-image.png"],
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
