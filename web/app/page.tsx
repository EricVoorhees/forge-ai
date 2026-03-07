"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

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

export default function Home() {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Header */}
      <header className="bg-[#0a0a0a]/80 backdrop-blur-xl w-full fixed top-0 z-50 border-b border-white/5">
        <div className="h-16 flex justify-between items-center px-6 md:px-12 max-w-[1400px] mx-auto">
          {/* Logo & Nav */}
          <div className="flex items-center">
            <div className="flex items-center gap-2 mr-12">
              <Image src="/forge-logo.png" alt="Open Frame" width={32} height={32} className="rounded" />
              <span className="text-xl font-semibold text-white tracking-tight">Open Frame</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/docs" className="text-[#a1a1aa] text-sm hover:text-white transition-colors">
                Documentation
              </Link>
              <Link href="/pricing" className="text-[#a1a1aa] text-sm hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/dashboard" className="text-[#a1a1aa] text-sm hover:text-white transition-colors">
                API Platform
              </Link>
            </nav>
          </div>
          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <SignedOut>
              <Link
                href="/sign-in"
                className="hidden md:flex text-[#a1a1aa] text-sm hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="bg-white text-black text-sm font-medium px-4 py-2 rounded-full hover:bg-white/90 transition-colors"
              >
                Get Started
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="text-[#a1a1aa] text-sm hover:text-white transition-colors mr-2"
              >
                Dashboard
              </Link>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-16">
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

          {/* Stats Section - Glassmorphic Card */}
          <div className="w-full max-w-[900px] mx-auto mb-32">
            <div className="bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-white text-4xl md:text-5xl font-semibold mb-2 tracking-tight">671B</div>
                  <div className="text-[#71717a] text-sm">Parameters</div>
                </div>
                <div className="text-center">
                  <div className="text-white text-4xl md:text-5xl font-semibold mb-2 tracking-tight">$0.90</div>
                  <div className="text-[#71717a] text-sm">Per 1M Tokens</div>
                </div>
                <div className="text-center">
                  <div className="text-white text-4xl md:text-5xl font-semibold mb-2 tracking-tight">&lt;3s</div>
                  <div className="text-[#71717a] text-sm">Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-white text-4xl md:text-5xl font-semibold mb-2 tracking-tight">99.9%</div>
                  <div className="text-[#71717a] text-sm">Uptime</div>
                </div>
              </div>
            </div>
          </div>

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
                desc: "Purpose-built API for the FORGE model. OpenAI-compatible endpoints for easy migration.",
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
              <div className="text-xl font-semibold text-white mb-4 tracking-tight">Open Frame</div>
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
