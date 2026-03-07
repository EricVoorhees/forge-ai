import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FORGE 1 Benchmarks",
  description: "Performance benchmarks for FORGE 1 across coding, mathematics, reasoning, and generation tasks. HumanEval 65.2%, MATH-500 90.2%, MMLU 87.1%.",
  openGraph: {
    title: "FORGE 1 Benchmarks | Open Frame",
    description: "Performance benchmarks for FORGE 1 across coding, mathematics, reasoning, and generation tasks.",
  },
};

export default function BenchmarksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
