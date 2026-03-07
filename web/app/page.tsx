"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";

// Animated counter hook
function useCountUp(end: number, duration: number = 1500, decimals: number = 0, prefix: string = "", suffix: string = "") {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = performance.now();
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Easing function for smooth deceleration
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(easeOut * end);
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  const displayValue = decimals > 0 
    ? count.toFixed(decimals) 
    : Math.round(count).toString();

  return { countRef, displayValue: `${prefix}${displayValue}${suffix}` };
}

const FEATURE_TAGS = [
  { label: "Code Generation", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  )},
  { label: "Debugging", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )},
  { label: "Code Review", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  )},
  { label: "Documentation", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )},
  { label: "Refactoring", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )},
  { label: "Testing", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )},
  { label: "API Design", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )},
  { label: "Architecture", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  )},
];

// Animated Stat Component
function AnimatedStat({ value, decimals = 0, prefix = "", suffix = "", label, sublabel }: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  sublabel?: string;
}) {
  const { countRef, displayValue } = useCountUp(value, 1200, decimals, prefix, suffix);
  return (
    <div className="text-center">
      <span ref={countRef} className="text-white text-3xl md:text-4xl font-semibold tracking-tight tabular-nums">
        {displayValue}
      </span>
      <div className="text-[#a1a1aa] text-sm font-medium mt-1">{label}</div>
      {sublabel && <div className="text-[#52525b] text-xs mt-0.5">{sublabel}</div>}
    </div>
  );
}

// Bento Grid Component
function BentoGrid() {
  return (
    <div className="w-full max-w-[820px] mx-auto mb-28">
      <div className="grid grid-cols-3 gap-4">
        {/* Model Card - Hero */}
        <div className="col-span-2 row-span-2 bg-[#111113] rounded-[20px] p-7 flex flex-col justify-between min-h-[200px]">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Image src="/forge-logo.png" alt="FORGE" width={28} height={28} />
              <div>
                <div className="text-white text-lg font-medium">FORGE 1</div>
                <div className="text-[#52525b] text-sm">671 Billion Parameters</div>
              </div>
            </div>
            <p className="text-[#71717a] text-sm leading-relaxed max-w-[320px]">
              State-of-the-art mixture-of-experts architecture with 128K context window.
            </p>
          </div>
          <div className="flex items-center gap-8 mt-6">
            <div>
              <div className="text-white text-2xl font-medium tabular-nums">128K</div>
              <div className="text-[#52525b] text-xs">context</div>
            </div>
            <div>
              <div className="text-white text-2xl font-medium tabular-nums">37B</div>
              <div className="text-[#52525b] text-xs">active</div>
            </div>
            <div>
              <div className="text-white text-2xl font-medium tabular-nums">150+</div>
              <div className="text-[#52525b] text-xs">tok/s</div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="col-span-1 bg-[#111113] rounded-[20px] p-6">
          <div className="text-[#52525b] text-xs uppercase tracking-wide mb-4">Pricing</div>
          <div className="space-y-3">
            <div>
              <span className="text-white text-xl font-medium">$1.00</span>
              <span className="text-[#52525b] text-sm ml-2">/ 1M input</span>
            </div>
            <div>
              <span className="text-white text-xl font-medium">$1.50</span>
              <span className="text-[#52525b] text-sm ml-2">/ 1M output</span>
            </div>
          </div>
        </div>

        {/* Enterprise */}
        <div className="col-span-1 bg-[#111113] rounded-[20px] p-6">
          <div className="text-[#52525b] text-xs uppercase tracking-wide mb-4">Enterprise</div>
          <div className="text-white text-xl font-medium">99.9%</div>
          <div className="text-[#52525b] text-sm">uptime SLA</div>
        </div>

        {/* Code */}
        <div className="col-span-1 bg-[#111113] rounded-[20px] p-6">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
            <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <div className="text-white text-sm font-medium mb-1">Code Generation</div>
          <div className="text-[#52525b] text-xs leading-relaxed">Write, debug, and refactor code across languages</div>
        </div>

        {/* Reasoning */}
        <div className="col-span-1 bg-[#111113] rounded-[20px] p-6">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="text-white text-sm font-medium mb-1">Reasoning</div>
          <div className="text-[#52525b] text-xs leading-relaxed">Complex math, logic, and multi-step problems</div>
        </div>

        {/* Analysis */}
        <div className="col-span-1 bg-[#111113] rounded-[20px] p-6">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-white text-sm font-medium mb-1">Analysis</div>
          <div className="text-[#52525b] text-xs leading-relaxed">Documents, data, and long-form content</div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <main className="pt-14">
        <div className="w-full max-w-[1080px] mx-auto px-6 pb-[120px]">
          {/* Main Hero */}
          <div className="w-full flex flex-col items-center mb-32">
            <h1 className="text-white leading-tight font-semibold text-[36px] md:text-[56px] text-center mt-24 mb-4 tracking-tight">
              Ask FORGE, Build Faster
            </h1>
            <p className="text-[#71717a] text-center text-lg mb-10 max-w-[600px]">
              FORGE-671B is built on state-of-the-art open-source foundation models, delivering GPT-4 class performance at a fraction of the cost.
            </p>
            
            {/* Chat Input */}
            <div className="bg-[#18181b] border border-white/10 w-full max-w-[720px] relative mb-8 p-4 rounded-2xl">
              <textarea
                placeholder="Ask FORGE anything about code..."
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="bg-transparent text-white leading-7 text-base w-full resize-none p-0 outline-none placeholder:text-[#52525b]"
              />
              <button className="bg-white hover:bg-white/90 w-9 h-9 absolute flex justify-center items-center rounded-full right-3 bottom-3 transition-colors">
                <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

            {/* Feature Tags with Icons */}
            <div className="flex flex-wrap justify-center gap-2 max-w-[720px]">
              {FEATURE_TAGS.map((tag) => (
                <button
                  key={tag.label}
                  className="flex items-center gap-2 bg-transparent text-[#a1a1aa] border border-white/10 px-3 py-2 rounded-lg text-sm hover:border-white/30 hover:text-white transition-all"
                >
                  {tag.icon}
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bento Grid */}
          <BentoGrid />

          {/* Features Section */}
          <div className="text-center w-full flex flex-col items-center mb-12">
            <h2 className="text-white text-2xl md:text-3xl font-semibold mb-3 tracking-tight">
              Product Features
            </h2>
            <p className="text-[#71717a]">
              Everything you need to build with AI
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-32">
            {[
              { 
                title: "Open Frame Native", 
                desc: "Purpose-built API for the FORGE model. Standard REST endpoints for easy integration.",
                icon: (
                  <Image src="/forge-logo.png" alt="FORGE" width={24} height={24} className="rounded" />
                )
              },
              { 
                title: "Streaming Support", 
                desc: "Real-time token streaming with Server-Sent Events for responsive UX.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
              { 
                title: "Rate Limiting", 
                desc: "Built-in rate limiting with customizable plans, quotas, and burst handling.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )
              },
              { 
                title: "Usage Analytics", 
                desc: "Track token usage, costs, and API performance with real-time dashboards.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              },
              { 
                title: "API Key Management", 
                desc: "Create, rotate, and revoke API keys instantly from your dashboard.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                )
              },
              { 
                title: "Enterprise Ready", 
                desc: "Production-grade infrastructure with 99.9% uptime SLA guarantee.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group bg-[#18181b] border border-white/5 p-6 rounded-2xl hover:border-white/20 hover:bg-[#1c1c1f] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/70 group-hover:text-white group-hover:bg-white/10 transition-all mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-white text-base font-medium mb-2">{feature.title}</h3>
                <p className="text-[#71717a] text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Code Example */}
          <div className="text-center w-full flex flex-col items-center mb-12">
            <h2 className="text-white text-2xl md:text-3xl font-semibold mb-3 tracking-tight">
              Simple Integration
            </h2>
            <p className="text-[#71717a]">
              Get started in minutes with our developer-friendly API
            </p>
          </div>

          <div className="bg-[#18181b] border border-white/5 rounded-2xl p-6 mb-32 overflow-x-auto">
            <pre className="text-sm leading-relaxed">
              <code className="text-[#e4e4e7]">
{`import requests

response = requests.post(
    "https://api.openframe.co/v1/chat/completions",
    headers={"Authorization": "Bearer sk-forge-xxx"},
    json={
        "model": "forge-671b",
        "messages": [
            {"role": "user", "content": "Write a Python quicksort"}
        ]
    }
)

print(response.json()["choices"][0]["message"]["content"])`}
              </code>
            </pre>
          </div>

          {/* CTA Section */}
          <div className="text-center w-full flex flex-col items-center">
            <h2 className="text-white text-3xl md:text-4xl font-semibold mb-4 tracking-tight">
              Ready to Build?
            </h2>
            <p className="text-[#71717a] mb-10 max-w-[500px]">
              Start building with FORGE today. Free tier includes 100K tokens per day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/sign-up"
                className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-white/90 transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                href="/docs"
                className="border border-white/20 text-white px-8 py-3 rounded-full hover:border-white/40 transition-colors"
              >
                Read the Docs
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 md:px-12 mt-20">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-wrap justify-between gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image src="/forge-logo.png" alt="Open Frame" width={24} height={24} />
                <span className="text-xl font-semibold text-white tracking-tight">Open Frame</span>
              </div>
              <p className="text-[#71717a] text-sm max-w-[280px] leading-relaxed">
                FORGE AI coding API built for developers. Fast, reliable, and cost-effective.
              </p>
            </div>
            
            {/* Links */}
            <div className="flex gap-16">
              <div>
                <div className="text-[#71717a] text-xs uppercase tracking-wider mb-4">Product</div>
                <div className="flex flex-col gap-3">
                  <Link href="/docs" className="text-[#a1a1aa] text-sm hover:text-white transition-colors">Documentation</Link>
                  <Link href="/pricing" className="text-[#a1a1aa] text-sm hover:text-white transition-colors">Pricing</Link>
                  <Link href="/dashboard" className="text-[#a1a1aa] text-sm hover:text-white transition-colors">Dashboard</Link>
                </div>
              </div>
              <div>
                <div className="text-[#71717a] text-xs uppercase tracking-wider mb-4">Legal</div>
                <div className="flex flex-col gap-3">
                  <Link href="/terms" className="text-[#a1a1aa] text-sm hover:text-white transition-colors">Terms of Service</Link>
                  <Link href="/privacy" className="text-[#a1a1aa] text-sm hover:text-white transition-colors">Privacy Policy</Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-8 text-center text-[#52525b] text-sm">
            © 2024 Open Frame. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
