"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";

export default function MiniModelPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />

      <main className="pt-20 pb-20 px-6">
        <div className="max-w-[800px] mx-auto">
          {/* Title */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Image src="/forge-logo.png" alt="FORGE" width={32} height={32} />
              <h1 className="text-3xl font-semibold tracking-tight">Forge Mini</h1>
              <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-emerald-400 text-xs font-medium">
                New
              </span>
            </div>
            <p className="text-[#71717a] text-lg leading-relaxed">
              A 117 billion parameter Mixture-of-Experts model optimized for fast inference, 
              reasoning, and agentic tasks. Fits on a single GPU.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { value: "117B", label: "Total Parameters" },
              { value: "5.1B", label: "Active Parameters" },
              { value: "32K", label: "Context Window" },
              { value: "1×H100", label: "GPU Requirement" },
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
                Forge Mini is built on OpenAI&apos;s GPT-OSS architecture featuring 
                <strong className="text-white"> Mixture-of-Experts (MoE)</strong> with 
                <strong className="text-white"> MXFP4 quantization</strong>, enabling the full model 
                to run on a single 80GB GPU like NVIDIA H100 or AMD MI300X.
              </p>

              <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-6">
                <h3 className="text-white text-base font-medium mb-4">Model Configuration</h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#525252]">Total Parameters</span>
                    <span className="text-white tabular-nums">117B</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#525252]">Active Parameters</span>
                    <span className="text-white tabular-nums">5.1B</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#525252]">Context Window</span>
                    <span className="text-white tabular-nums">32,768</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#525252]">Quantization</span>
                    <span className="text-white">MXFP4</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#525252]">Activation</span>
                    <span className="text-white">SwiGLU</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#525252]">License</span>
                    <span className="text-white">Apache 2.0</span>
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
                Forge Mini uses a fine-grained MoE architecture where only 
                <strong className="text-white"> 5.1B parameters</strong> are activated per token 
                from the total 117B, enabling extremely fast inference while maintaining 
                high-quality outputs.
              </p>

              <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-6">
                <h3 className="text-white text-base font-medium mb-4">Efficiency Highlights</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-white">Single GPU Deployment</span>
                      <span className="text-[#525252]"> — Runs on one H100 or MI300X</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-white">MXFP4 Quantization</span>
                      <span className="text-[#525252]"> — Post-trained for optimal performance</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-white">Low Latency</span>
                      <span className="text-[#525252]"> — Optimized for real-time applications</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Reasoning Section */}
          <section className="mb-16">
            <h2 className="text-xl font-medium mb-6">Configurable Reasoning</h2>
            
            <div className="space-y-6 text-[#a1a1aa] text-sm leading-relaxed">
              <p>
                Forge Mini supports adjustable reasoning effort levels, allowing you to balance 
                between speed and depth based on your specific use case.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5">
                  <div className="text-emerald-400 text-sm font-medium mb-2">Low</div>
                  <div className="text-[#525252] text-xs">Fast responses for general dialogue and simple tasks</div>
                </div>
                <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5">
                  <div className="text-amber-400 text-sm font-medium mb-2">Medium</div>
                  <div className="text-[#525252] text-xs">Balanced speed and detail for most use cases</div>
                </div>
                <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5">
                  <div className="text-orange-400 text-sm font-medium mb-2">High</div>
                  <div className="text-[#525252] text-xs">Deep analysis with full chain-of-thought reasoning</div>
                </div>
              </div>
            </div>
          </section>

          {/* Capabilities */}
          <section className="mb-16">
            <h2 className="text-xl font-medium mb-6">Capabilities</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Agentic Tasks", desc: "Function calling, web browsing, and code execution capabilities" },
                { title: "Reasoning", desc: "Full chain-of-thought with configurable reasoning levels" },
                { title: "Tool Use", desc: "Native support for structured outputs and tool schemas" },
                { title: "Fine-tunable", desc: "Customize for specialized use cases on a single H100" },
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
                <h2 className="text-xl font-medium mb-2">Access Forge Mini</h2>
                <p className="text-[#525252] text-sm">$0.079 / 1M input tokens · $0.37 / 1M output tokens</p>
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
