"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";

const benchmarks = [
  {
    category: "Software Engineering",
    tests: [
      { name: "SWE-bench Verified", score: "52.6%", comparison: "vs GPT-4o: 38.4%" },
      { name: "SWE-bench (High)", score: "62.4%", comparison: "with high reasoning" },
    ]
  },
  {
    category: "Reasoning",
    tests: [
      { name: "GPQA Diamond", score: "73.5%", comparison: "graduate-level science" },
      { name: "HLE (High)", score: "19.0%", comparison: "hard logic evaluation" },
    ]
  },
  {
    category: "Code Generation",
    tests: [
      { name: "HumanEval", score: "88.4%", comparison: "Python coding" },
      { name: "MBPP+", score: "78.2%", comparison: "basic programming" },
    ]
  },
  {
    category: "Mathematics",
    tests: [
      { name: "MATH-500", score: "82.1%", comparison: "competition math" },
      { name: "GSM8K", score: "94.2%", comparison: "grade school math" },
    ]
  },
];

export default function MiniBenchmarksPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />

      <main className="pt-20 pb-20 px-6">
        <div className="max-w-[900px] mx-auto">
          {/* Title */}
          <div className="mb-12">
            <div className="flex items-center gap-2 text-sm mb-4">
              <Link href="/research/mini" className="text-[#71717a] hover:text-white transition-colors">
                Forge Mini
              </Link>
              <span className="text-[#52525b]">/</span>
              <span className="text-white">Benchmarks</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight mb-4">Benchmarks</h1>
            <p className="text-[#71717a] text-lg leading-relaxed max-w-[600px]">
              Forge Mini performance across standard evaluation benchmarks. 
              Exceptional results for a model that fits on a single GPU.
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-16">
            <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5 text-center">
              <div className="text-white text-2xl font-medium">52.6%</div>
              <div className="text-[#525252] text-xs mt-1">SWE-bench Verified</div>
            </div>
            <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5 text-center">
              <div className="text-white text-2xl font-medium">73.5%</div>
              <div className="text-[#525252] text-xs mt-1">GPQA Diamond</div>
            </div>
            <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5 text-center">
              <div className="text-white text-2xl font-medium">88.4%</div>
              <div className="text-[#525252] text-xs mt-1">HumanEval</div>
            </div>
          </div>

          {/* Benchmark Categories */}
          <div className="space-y-8 mb-16">
            {benchmarks.map((category) => (
              <div key={category.category}>
                <h2 className="text-lg font-medium mb-4">{category.category}</h2>
                <div className="bg-[#141414] border border-white/[0.06] rounded-xl overflow-hidden">
                  {category.tests.map((test, idx) => (
                    <div 
                      key={test.name}
                      className={`flex items-center justify-between px-5 py-4 ${
                        idx !== category.tests.length - 1 ? 'border-b border-white/[0.06]' : ''
                      }`}
                    >
                      <div>
                        <div className="text-white text-sm font-medium">{test.name}</div>
                        <div className="text-[#525252] text-xs mt-0.5">{test.comparison}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-emerald-400 text-lg font-medium tabular-nums">{test.score}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Note */}
          <section className="mb-16">
            <h2 className="text-lg font-medium mb-4">Performance vs Efficiency</h2>
            <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-emerald-400 text-sm font-medium mb-2">Single GPU Deployment</div>
                  <p className="text-[#a1a1aa] text-sm leading-relaxed">
                    Forge Mini achieves these benchmarks while running on a single H100 GPU, 
                    making it ideal for cost-effective production deployments.
                  </p>
                </div>
                <div>
                  <div className="text-emerald-400 text-sm font-medium mb-2">Configurable Reasoning</div>
                  <p className="text-[#a1a1aa] text-sm leading-relaxed">
                    Results vary by reasoning level. High reasoning mode achieves 62.4% on 
                    SWE-bench, while low mode prioritizes speed.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 border-t border-white/[0.06]">
            <Link 
              href="/research/mini" 
              className="text-[#71717a] hover:text-white transition-colors text-sm"
            >
              ← Architecture
            </Link>
            <Link 
              href="/pricing" 
              className="text-[#71717a] hover:text-white transition-colors text-sm"
            >
              View Pricing →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
