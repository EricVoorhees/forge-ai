"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";

export default function ModelPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />

      <main className="pt-20 pb-20 px-6">
        <div className="max-w-[800px] mx-auto">
          {/* Title */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Image src="/openframe-logo.png" alt="FORGE" width={32} height={32} />
              <h1 className="text-3xl font-semibold tracking-tight">FORGE 1</h1>
            </div>
            <p className="text-[#71717a] text-lg leading-relaxed">
              A 671 billion parameter Mixture-of-Experts language model optimized for code generation, 
              reasoning, and general-purpose AI tasks.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { value: "671B", label: "Total Parameters" },
              { value: "37B", label: "Active Parameters" },
              { value: "128K", label: "Context Window" },
              { value: "61", label: "Transformer Layers" },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#141414] border border-white/[0.06] rounded-xl p-4">
                <div className="text-white text-xl font-medium tabular-nums">{stat.value}</div>
                <div className="text-[#525252] text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Architecture Section */}
          <section className="mb-16">
            <h2 className="text-xl font-medium mb-6">Architecture</h2>
            
            <div className="space-y-6 text-[#a1a1aa] text-sm leading-relaxed">
              <p>
                FORGE 1 is built on the Transformer architecture with two key innovations: 
                <strong className="text-white"> Multi-Head Latent Attention (MLA)</strong> and 
                <strong className="text-white"> Mixture-of-Experts (MoE)</strong>.
              </p>

              <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-6">
                <h3 className="text-white text-base font-medium mb-4">Model Configuration</h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#525252]">Layers</span>
                    <span className="text-white tabular-nums">61</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#525252]">Hidden Dimension</span>
                    <span className="text-white tabular-nums">7,168</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#525252]">Attention Heads</span>
                    <span className="text-white tabular-nums">128</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#525252]">Head Dimension</span>
                    <span className="text-white tabular-nums">128</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#525252]">KV Compression</span>
                    <span className="text-white tabular-nums">512</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#525252]">Query Compression</span>
                    <span className="text-white tabular-nums">1,536</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* MoE Section */}
          <section className="mb-16">
            <h2 className="text-xl font-medium mb-6">Mixture-of-Experts</h2>
            
            <div className="space-y-6 text-[#a1a1aa] text-sm leading-relaxed">
              <p>
                FORGE uses a fine-grained MoE architecture where each MoE layer contains 
                <strong className="text-white"> 256 routed experts</strong> plus 
                <strong className="text-white"> 1 shared expert</strong>. For each token, 
                <strong className="text-white"> 8 experts</strong> are activated, resulting in 37B active parameters 
                per forward pass from the total 671B.
              </p>

              <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-6">
                <h3 className="text-white text-base font-medium mb-4">MoE Configuration</h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#525252]">Total Experts</span>
                    <span className="text-white tabular-nums">256 + 1 shared</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#525252]">Active Experts</span>
                    <span className="text-white tabular-nums">8 per token</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#525252]">Expert Hidden Dim</span>
                    <span className="text-white tabular-nums">2,048</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#525252]">MoE Layers</span>
                    <span className="text-white tabular-nums">58 of 61</span>
                  </div>
                </div>
              </div>

              <p>
                The first three layers use standard FFN instead of MoE for stability. 
                Auxiliary-loss-free load balancing ensures efficient expert utilization 
                without degrading model quality.
              </p>
            </div>
          </section>

          {/* Attention Section */}
          <section className="mb-16">
            <h2 className="text-xl font-medium mb-6">Multi-Head Latent Attention</h2>
            
            <div className="space-y-6 text-[#a1a1aa] text-sm leading-relaxed">
              <p>
                MLA performs low-rank compression on keys and values, dramatically reducing 
                KV cache memory during inference while maintaining performance comparable to 
                standard Multi-Head Attention.
              </p>

              <p>
                This enables efficient serving of the 128K context window without the memory 
                overhead typically associated with long-context models.
              </p>
            </div>
          </section>

          {/* Training Section */}
          <section className="mb-16">
            <h2 className="text-xl font-medium mb-6">Training</h2>
            
            <div className="space-y-6 text-[#a1a1aa] text-sm leading-relaxed">
              <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-6">
                <h3 className="text-white text-base font-medium mb-4">Training Details</h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#525252]">Training Tokens</span>
                    <span className="text-white tabular-nums">14.8T</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#525252]">Precision</span>
                    <span className="text-white">FP8 mixed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#525252]">Optimizer</span>
                    <span className="text-white">AdamW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#525252]">Max Sequence</span>
                    <span className="text-white tabular-nums">4K → 128K</span>
                  </div>
                </div>
              </div>

              <p>
                The model was pre-trained on 14.8 trillion tokens using FP8 mixed-precision training, 
                then extended to 128K context through continued training. Post-training includes 
                supervised fine-tuning and reinforcement learning from human feedback.
              </p>
            </div>
          </section>

          {/* Capabilities */}
          <section className="mb-16">
            <h2 className="text-xl font-medium mb-6">Capabilities</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Code Generation", desc: "State-of-the-art performance on HumanEval, MBPP, and LiveCodeBench" },
                { title: "Mathematical Reasoning", desc: "Strong performance on MATH, GSM8K, and competition mathematics" },
                { title: "Long Context", desc: "128K token context window for large codebases and documents" },
                { title: "Instruction Following", desc: "Aligned for helpful, harmless, and honest responses" },
              ].map((cap) => (
                <div key={cap.title} className="bg-[#141414] border border-white/[0.06] rounded-xl p-5">
                  <div className="text-white text-sm font-medium mb-1">{cap.title}</div>
                  <div className="text-[#525252] text-xs leading-relaxed">{cap.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* API Access */}
          <section className="border-t border-white/5 pt-12">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium mb-2">Access FORGE 1</h2>
                <p className="text-[#525252] text-sm">$1.00 / 1M input tokens · $1.50 / 1M output tokens</p>
              </div>
              <Link 
                href="/dashboard" 
                className="bg-white text-black text-sm font-medium px-5 py-2.5 rounded-full hover:bg-zinc-200 transition-colors"
              >
                Get API Key
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
