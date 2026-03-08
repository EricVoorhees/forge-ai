"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";

const benchmarks = {
  coding: [
    { name: "HumanEval", score: "65.2%", category: "Code Generation" },
    { name: "HumanEval+", score: "57.3%", category: "Code Generation" },
    { name: "MBPP", score: "75.4%", category: "Code Generation" },
    { name: "MBPP+", score: "69.8%", category: "Code Generation" },
    { name: "LiveCodeBench", score: "36.2%", category: "Code Reasoning" },
    { name: "Codeforces", score: "51.6%", category: "Competitive Programming" },
    { name: "SWE-bench Verified", score: "42.0%", category: "Software Engineering" },
  ],
  math: [
    { name: "MATH-500", score: "90.2%", category: "Mathematical Reasoning" },
    { name: "AIME 2024", score: "39.2%", category: "Competition Math" },
    { name: "CNMO 2024", score: "43.2%", category: "Competition Math" },
    { name: "GSM8K", score: "89.3%", category: "Grade School Math" },
    { name: "CMath", score: "90.7%", category: "Chinese Math" },
  ],
  reasoning: [
    { name: "MMLU", score: "87.1%", category: "Knowledge" },
    { name: "MMLU-Pro", score: "75.9%", category: "Knowledge" },
    { name: "MMLU-Redux", score: "86.2%", category: "Knowledge" },
    { name: "BBH", score: "87.5%", category: "Reasoning" },
    { name: "DROP", score: "91.6%", category: "Reading Comprehension" },
    { name: "ARC-Challenge", score: "95.3%", category: "Science Reasoning" },
  ],
  generation: [
    { name: "Arena-Hard", score: "85.5", category: "Instruction Following" },
    { name: "AlpacaEval 2.0", score: "70.0%", category: "User Preference" },
    { name: "LongBench v2", score: "48.7%", category: "Long Context" },
  ],
};

export default function BenchmarksPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />

      <main className="pt-20 pb-20 px-6">
        <div className="max-w-[900px] mx-auto">
          {/* Title */}
          <div className="mb-12">
            <h1 className="text-3xl font-semibold tracking-tight mb-4">Benchmarks</h1>
            <p className="text-[#71717a] text-lg leading-relaxed max-w-[600px]">
              Forge Coder performance across standard evaluation benchmarks. 
              Competitive with frontier closed-source models while using only 37B active parameters.
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-16">
            <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5 text-center">
              <div className="text-white text-2xl font-medium">90.2%</div>
              <div className="text-[#525252] text-xs mt-1">MATH-500</div>
            </div>
            <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5 text-center">
              <div className="text-white text-2xl font-medium">87.1%</div>
              <div className="text-[#525252] text-xs mt-1">MMLU</div>
            </div>
            <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5 text-center">
              <div className="text-white text-2xl font-medium">65.2%</div>
              <div className="text-[#525252] text-xs mt-1">HumanEval</div>
            </div>
          </div>

          {/* Coding */}
          <section className="mb-12">
            <h2 className="text-lg font-medium mb-4">Coding</h2>
            <div className="bg-[#141414] border border-white/[0.06] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    <th className="text-left text-[#525252] font-normal px-5 py-3">Benchmark</th>
                    <th className="text-left text-[#525252] font-normal px-5 py-3">Category</th>
                    <th className="text-right text-[#525252] font-normal px-5 py-3">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarks.coding.map((b, i) => (
                    <tr key={b.name} className={i !== benchmarks.coding.length - 1 ? "border-b border-white/[0.04]" : ""}>
                      <td className="text-white px-5 py-3">{b.name}</td>
                      <td className="text-[#525252] px-5 py-3">{b.category}</td>
                      <td className="text-white text-right px-5 py-3 tabular-nums font-medium">{b.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Math */}
          <section className="mb-12">
            <h2 className="text-lg font-medium mb-4">Mathematics</h2>
            <div className="bg-[#141414] border border-white/[0.06] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    <th className="text-left text-[#525252] font-normal px-5 py-3">Benchmark</th>
                    <th className="text-left text-[#525252] font-normal px-5 py-3">Category</th>
                    <th className="text-right text-[#525252] font-normal px-5 py-3">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarks.math.map((b, i) => (
                    <tr key={b.name} className={i !== benchmarks.math.length - 1 ? "border-b border-white/[0.04]" : ""}>
                      <td className="text-white px-5 py-3">{b.name}</td>
                      <td className="text-[#525252] px-5 py-3">{b.category}</td>
                      <td className="text-white text-right px-5 py-3 tabular-nums font-medium">{b.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Reasoning */}
          <section className="mb-12">
            <h2 className="text-lg font-medium mb-4">Reasoning & Knowledge</h2>
            <div className="bg-[#141414] border border-white/[0.06] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    <th className="text-left text-[#525252] font-normal px-5 py-3">Benchmark</th>
                    <th className="text-left text-[#525252] font-normal px-5 py-3">Category</th>
                    <th className="text-right text-[#525252] font-normal px-5 py-3">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarks.reasoning.map((b, i) => (
                    <tr key={b.name} className={i !== benchmarks.reasoning.length - 1 ? "border-b border-white/[0.04]" : ""}>
                      <td className="text-white px-5 py-3">{b.name}</td>
                      <td className="text-[#525252] px-5 py-3">{b.category}</td>
                      <td className="text-white text-right px-5 py-3 tabular-nums font-medium">{b.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Generation */}
          <section className="mb-16">
            <h2 className="text-lg font-medium mb-4">Generation & Instruction Following</h2>
            <div className="bg-[#141414] border border-white/[0.06] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    <th className="text-left text-[#525252] font-normal px-5 py-3">Benchmark</th>
                    <th className="text-left text-[#525252] font-normal px-5 py-3">Category</th>
                    <th className="text-right text-[#525252] font-normal px-5 py-3">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarks.generation.map((b, i) => (
                    <tr key={b.name} className={i !== benchmarks.generation.length - 1 ? "border-b border-white/[0.04]" : ""}>
                      <td className="text-white px-5 py-3">{b.name}</td>
                      <td className="text-[#525252] px-5 py-3">{b.category}</td>
                      <td className="text-white text-right px-5 py-3 tabular-nums font-medium">{b.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Methodology */}
          <section className="border-t border-white/5 pt-12">
            <h2 className="text-lg font-medium mb-4">Evaluation Methodology</h2>
            <div className="text-[#71717a] text-sm leading-relaxed space-y-4">
              <p>
                All evaluations use standardized few-shot prompting with output limited to 8K tokens. 
                Benchmarks with fewer than 1,000 samples are tested multiple times with varying temperatures 
                to ensure robust results.
              </p>
              <p>
                Scores reflect the chat-optimized model variant. Base model performance may differ. 
                For detailed methodology, see the technical documentation.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
