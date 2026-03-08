"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";

// Load Dither with a placeholder to prevent flash
const Dither = dynamic(() => import("@/components/Dither"), { 
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-black to-black" />
  )
});

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
      <div className="text-white/70 text-sm font-medium mt-1">{label}</div>
      {sublabel && <div className="text-white/50 text-xs mt-0.5">{sublabel}</div>}
    </div>
  );
}

// Integration Showcase with tabbed code examples
function IntegrationShowcase() {
  const [activeTab, setActiveTab] = useState<'python' | 'javascript' | 'curl'>('python');
  
  const codeExamples = {
    python: {
      filename: 'example.py',
      code: `import requests

response = requests.post(
    "https://api.openframe.co/v1/chat/completions",
    headers={"Authorization": "Bearer sk-forge-xxx"},
    json={
        "model": "forge-671b",
        "messages": [{"role": "user", "content": "Hello"}]
    }
)
print(response.json())`
    },
    javascript: {
      filename: 'example.js',
      code: `const response = await fetch(
    "https://api.openframe.co/v1/chat/completions",
    {
        method: "POST",
        headers: {
            "Authorization": "Bearer sk-forge-xxx",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "forge-671b",
            messages: [{ role: "user", content: "Hello" }]
        })
    }
);
const data = await response.json();`
    },
    curl: {
      filename: 'terminal',
      code: `curl https://api.openframe.co/v1/chat/completions \\
  -H "Authorization: Bearer sk-forge-xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "forge-671b",
    "messages": [{"role": "user", "content": "Hello"}]
  }'`
    }
  };

  return (
    <div className="relative mb-32 rounded-2xl border border-white/10 overflow-hidden bg-black/50 backdrop-blur-sm">
      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Left - Code */}
        <div className="relative bg-[#0c0c0e] border-r border-white/[0.06] p-0 overflow-hidden">
          {/* Language tabs */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-black/40">
            <div className="flex items-center gap-1">
              {[
                { id: 'python', label: 'Python', icon: '🐍' },
                { id: 'javascript', label: 'JavaScript', icon: 'JS' },
                { id: 'curl', label: 'cURL', icon: '>' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'python' | 'javascript' | 'curl')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white/10 text-white'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                  }`}
                >
                  <span className="text-[10px]">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
            <span className="text-white/30 text-xs font-mono">{codeExamples[activeTab].filename}</span>
          </div>
          {/* Code content */}
          <div className="p-4 overflow-x-auto min-h-[280px]">
            <pre className="text-sm leading-relaxed font-mono">
              <code className="text-white/80 whitespace-pre">{codeExamples[activeTab].code}</code>
            </pre>
          </div>
        </div>
        
        {/* Right - Content */}
        <div className="p-10 lg:p-12 flex flex-col justify-center">
          <div className="flex items-center gap-2.5 mb-6">
            <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span className="text-lg font-semibold text-white tracking-tight">Simple Integration</span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
            Start Building in Minutes
          </h2>
          
          <p className="text-white/70 mb-6 leading-relaxed">
            Connect to FORGE with just a few lines of code. Our REST API is designed for simplicity—get up and running in minutes, not hours.
          </p>
          
          <div className="space-y-3 mb-8">
            {[
              "Clean REST API design",
              "Multiple SDK options",
              "Real-time streaming support",
              "Comprehensive error handling"
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-white/70 text-sm">
                <svg className="w-4 h-4 text-orange-400/80 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {item}
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
            >
              View Documentation
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/docs/quickstart"
              className="text-white/70 text-sm hover:text-white transition-colors"
            >
              Quickstart guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Model Showcase - Both Models Side by Side
function ModelShowcase() {
  return (
    <div className="w-full max-w-[1000px] mx-auto mb-32 px-6">
      {/* Two Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Forge Coder */}
        <div className="bg-gradient-to-br from-orange-500/10 via-black/60 to-black/60 backdrop-blur-sm border border-orange-500/20 rounded-2xl p-6 hover:border-orange-500/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                <Image src="/forge-logo.png" alt="F" width={20} height={20} />
              </div>
              <div>
                <span className="text-white font-semibold">Forge Coder</span>
                <div className="text-orange-400/80 text-xs">Premium • 671B MoE</div>
              </div>
            </div>
            <Link href="/research/model" className="text-white/50 text-xs hover:text-white transition-colors">
              Architecture →
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-white font-semibold tabular-nums">128K</div>
              <div className="text-white/40 text-xs">context</div>
            </div>
            <div>
              <div className="text-white font-semibold tabular-nums">37B</div>
              <div className="text-white/40 text-xs">active</div>
            </div>
            <div>
              <div className="text-white font-semibold tabular-nums">$0.98</div>
              <div className="text-white/40 text-xs">/ 1M in</div>
            </div>
            <div>
              <div className="text-white font-semibold tabular-nums">$1.87</div>
              <div className="text-white/40 text-xs">/ 1M out</div>
            </div>
          </div>
        </div>

        {/* Forge Mini */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-black/60 to-black/60 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-6 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Image src="/forge-logo.png" alt="F" width={20} height={20} />
              </div>
              <div>
                <span className="text-white font-semibold">Forge Mini</span>
                <div className="text-emerald-400/80 text-xs">Fast • 120B</div>
              </div>
            </div>
            <Link href="/research/mini" className="text-white/50 text-xs hover:text-white transition-colors">
              Architecture →
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-white font-semibold tabular-nums">32K</div>
              <div className="text-white/40 text-xs">context</div>
            </div>
            <div>
              <div className="text-white font-semibold tabular-nums">5.1B</div>
              <div className="text-white/40 text-xs">active</div>
            </div>
            <div>
              <div className="text-white font-semibold tabular-nums">$0.08</div>
              <div className="text-white/40 text-xs">/ 1M in</div>
            </div>
            <div>
              <div className="text-white font-semibold tabular-nums">$0.37</div>
              <div className="text-white/40 text-xs">/ 1M out</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {[
          { label: "Documentation", href: "/docs" },
          { label: "Pricing", href: "/pricing" },
          { label: "Benchmarks", href: "/research/benchmarks" },
        ].map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="group flex items-center gap-2 px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white/80 text-sm hover:border-white/40 hover:text-white transition-all"
          >
            <span>{link.label}</span>
            <svg className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </Link>
        ))}
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
      <main className="pt-14 relative">
        {/* Dither Background - Full Page */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <Dither
            waveColor={[0.8, 0.4, 0]}
            disableAnimation={false}
            enableMouseInteraction={false}
            mouseRadius={0.3}
            colorNum={4}
            waveAmplitude={0.3}
            waveFrequency={3}
            waveSpeed={0.05}
          />
          {/* Glossy card-like overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-white/[0.04]" />
          <div className="absolute inset-0 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-black/55" />
        </div>

        <div className="relative z-10 w-full max-w-[1080px] mx-auto px-6 pb-[120px]">
          {/* Main Hero */}
          <div className="w-full flex flex-col items-center mb-32">
            <h1 className="text-white leading-tight font-semibold text-[36px] md:text-[56px] text-center mt-24 mb-4 tracking-tight">
              Ask FORGE, Build Faster
            </h1>
            <p className="text-white/70 text-center text-lg mb-10 max-w-[600px]">
              Two powerful AI models for every use case. Premium coding with Forge Coder, or fast & affordable with Forge Mini.
            </p>
            
            {/* Chat Input */}
            <div className="bg-black/60 backdrop-blur-sm border border-white/20 w-full max-w-[720px] relative mb-8 p-4 rounded-2xl">
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
                  className="flex items-center gap-2 bg-black/40 text-white/80 border border-white/20 px-3 py-2 rounded-lg text-sm hover:border-white/40 hover:text-white transition-all"
                >
                  {tag.icon}
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Model Showcase */}
          <ModelShowcase />

          {/* Features Section */}
          <div className="text-center w-full flex flex-col items-center mb-10">
            <h2 className="text-white text-2xl md:text-3xl font-semibold mb-3 tracking-tight">
              Built for Developers
            </h2>
            <p className="text-white/50 max-w-lg">
              Both models share the same powerful capabilities, optimized for real-world coding tasks
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-32">
            {/* Feature 1 */}
            <div className="bg-black/40 backdrop-blur-sm border border-white/[0.08] p-5 rounded-xl hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-1">Code Generation</h3>
              <p className="text-white/50 text-sm leading-relaxed">Production-ready code in 20+ languages</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-black/40 backdrop-blur-sm border border-white/[0.08] p-5 rounded-xl hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-1">Reasoning</h3>
              <p className="text-white/50 text-sm leading-relaxed">Chain-of-thought for complex tasks</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-black/40 backdrop-blur-sm border border-white/[0.08] p-5 rounded-xl hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-1">Long Context</h3>
              <p className="text-white/50 text-sm leading-relaxed">Up to 128K tokens per request</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-black/40 backdrop-blur-sm border border-white/[0.08] p-5 rounded-xl hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-1">Fast Streaming</h3>
              <p className="text-white/50 text-sm leading-relaxed">Real-time token streaming</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-black/40 backdrop-blur-sm border border-white/[0.08] p-5 rounded-xl hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-1">Debugging</h3>
              <p className="text-white/50 text-sm leading-relaxed">Root cause analysis & fixes</p>
            </div>

            {/* Feature 6 */}
            <div className="bg-black/40 backdrop-blur-sm border border-white/[0.08] p-5 rounded-xl hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-1">Security Audit</h3>
              <p className="text-white/50 text-sm leading-relaxed">Vulnerability detection</p>
            </div>

            {/* Feature 7 */}
            <div className="bg-black/40 backdrop-blur-sm border border-white/[0.08] p-5 rounded-xl hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-1">Code Review</h3>
              <p className="text-white/50 text-sm leading-relaxed">Best practices & optimization</p>
            </div>

            {/* Feature 8 */}
            <div className="bg-black/40 backdrop-blur-sm border border-white/[0.08] p-5 rounded-xl hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-1">REST API</h3>
              <p className="text-white/50 text-sm leading-relaxed">OpenAI-compatible endpoints</p>
            </div>
          </div>

          {/* Simple Integration Section */}
          <IntegrationShowcase />

          {/* Forge Audit Showcase */}
          <div className="relative mb-32 rounded-2xl border border-white/20 overflow-hidden bg-black/50 backdrop-blur-sm">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.15] via-transparent to-amber-500/[0.08]" />
            
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Left - Content */}
              <div className="p-10 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-2.5 mb-6">
                  <Image src="/forge-logo.png" alt="F" width={28} height={28} />
                  <span className="text-xl font-semibold text-white tracking-tight">Audit</span>
                  <span className="ml-2 px-2 py-0.5 bg-orange-500/20 border border-orange-500/30 rounded text-orange-400 text-xs font-medium">New</span>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                  AI-Powered Code Security Analysis
                </h2>
                
                <p className="text-white/70 mb-6 leading-relaxed">
                  Detect vulnerabilities, exposed secrets, and code quality issues before they reach production. Powered by Forge Coder with support for 10+ languages.
                </p>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {["SQL Injection", "XSS", "Secrets", "CSRF", "Auth Flaws"].map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-black/30 border border-white/20 rounded-lg text-white/70 text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center gap-4">
                  <Link
                    href="/audit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Try Forge Audit
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href="/audit-docs"
                    className="text-white/70 text-sm hover:text-white transition-colors"
                  >
                    View docs
                  </Link>
                </div>
              </div>
              
              {/* Right - Visual */}
              <div className="relative bg-black/40 border-l border-white/10 p-8 lg:p-10 flex items-center justify-center min-h-[320px]">
                {/* Code preview mockup */}
                <div className="w-full max-w-sm">
                  <div className="bg-black/60 border border-white/20 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                      <div className="w-3 h-3 rounded-full bg-red-500/60" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                      <span className="ml-2 text-[#52525b] text-xs font-mono">audit-results.json</span>
                    </div>
                    <div className="p-4 font-mono text-xs space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-[10px]">CRITICAL</span>
                        <span className="text-white/80">SQL Injection in auth.js:42</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 rounded text-[10px]">HIGH</span>
                        <span className="text-white/80">Exposed API key in config.ts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[10px]">MEDIUM</span>
                        <span className="text-white/80">Missing CSRF token</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px]">PASSED</span>
                        <span className="text-white/60">47 checks passed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center w-full flex flex-col items-center">
            <h2 className="text-white text-3xl md:text-4xl font-semibold mb-4 tracking-tight">
              Ready to Build?
            </h2>
            <p className="text-white/60 mb-10 max-w-[500px]">
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
      <footer className="relative z-10 border-t border-white/10 py-12 px-6 md:px-12 mt-20 bg-black/30 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-wrap justify-between gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image src="/openframe-logo.png" alt="Open Frame" width={24} height={24} />
                <span className="text-xl font-semibold text-white tracking-tight">Open Frame</span>
              </div>
              <p className="text-white/60 text-sm max-w-[280px] leading-relaxed">
                FORGE AI coding API built for developers. Fast, reliable, and cost-effective.
              </p>
            </div>
            
            {/* Links */}
            <div className="flex gap-16">
              <div>
                <div className="text-white/50 text-xs uppercase tracking-wider mb-4">Product</div>
                <div className="flex flex-col gap-3">
                  <Link href="/docs" className="text-white/70 text-sm hover:text-white transition-colors">Documentation</Link>
                  <Link href="/pricing" className="text-white/70 text-sm hover:text-white transition-colors">Pricing</Link>
                  <Link href="/dashboard" className="text-white/70 text-sm hover:text-white transition-colors">Dashboard</Link>
                </div>
              </div>
              <div>
                <div className="text-white/50 text-xs uppercase tracking-wider mb-4">Legal</div>
                <div className="flex flex-col gap-3">
                  <Link href="/terms" className="text-white/70 text-sm hover:text-white transition-colors">Terms of Service</Link>
                  <Link href="/privacy" className="text-white/70 text-sm hover:text-white transition-colors">Privacy Policy</Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-center text-white/50 text-sm">
            © 2024 Open Frame. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
