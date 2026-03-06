"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Header */}
      <header className="bg-black/90 backdrop-blur-[30px] w-full fixed top-0 z-50">
        <div className="h-20 flex justify-between items-center px-6 md:px-[60px]">
          {/* Logo & Nav */}
          <div className="flex items-center">
            <div className="text-2xl font-bold text-[#f7f8fc] mr-20">
              FORGE
            </div>
            <nav className="hidden md:flex items-center gap-[60px]">
              <Link href="/docs" className="text-[#f7f8fc] hover:text-[#615ced] transition-colors">
                Documentation
              </Link>
              <Link href="/pricing" className="text-[#f7f8fc] hover:text-[#615ced] transition-colors">
                Pricing
              </Link>
              <Link href="/dashboard" className="text-[#f7f8fc] hover:text-[#615ced] transition-colors">
                API Platform
              </Link>
            </nav>
          </div>
          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden md:flex text-[#f7f8fc] border border-[rgba(95,96,108,0.6)] px-4 py-2 rounded-full hover:border-[#615ced] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-[#615ced] text-[#f7f8fc] px-4 py-2 rounded-full hover:bg-[#7a78ff] transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-20">
        <div className="w-full max-w-[1080px] mx-auto px-6 pb-[120px]">
          {/* Main Hero */}
          <div className="w-full flex flex-col items-center mb-[180px]">
            <h1 className="text-[#f7f8fc] leading-[60px] font-semibold text-[32px] md:text-[48px] text-center mt-[100px] mb-3">
              Ask FORGE, Build Faster
            </h1>
            <p className="text-[#797b89] text-center text-lg mb-8 max-w-[600px]">
              OpenAI-compatible API powered by DeepSeek V3 671B. 
              Fast, reliable, and cost-effective code generation.
            </p>
            
            {/* Chat Input */}
            <div className="bg-[#414149] w-full max-w-[800px] relative mb-7 p-4 rounded-3xl">
              <textarea
                placeholder="Ask FORGE anything about code..."
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="bg-transparent text-[#f7f8fc] leading-[28px] text-[16px] w-full resize-none p-0 outline-none placeholder:text-[#797b89]"
              />
              <button className="bg-[#615ced] hover:bg-[#7a78ff] w-10 h-10 absolute flex justify-center items-center rounded-full right-4 bottom-4 transition-colors">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

            {/* Feature Tags */}
            <div className="flex flex-wrap justify-center gap-2 max-w-[800px]">
              {["Code Generation", "Debugging", "Code Review", "Documentation", "Refactoring", "Testing", "API Design", "Architecture"].map((tag) => (
                <button
                  key={tag}
                  className="bg-transparent text-[#f7f8fc] border border-[rgba(95,96,108,0.6)] px-3 py-2 rounded-xl hover:border-[#615ced] hover:text-[#615ced] transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="w-full flex flex-wrap justify-center gap-8 md:gap-20 mb-[120px]">
            <div className="text-center">
              <div className="text-[#615ced] text-4xl font-bold mb-2">671B</div>
              <div className="text-[#797b89]">Parameters</div>
            </div>
            <div className="text-center">
              <div className="text-[#615ced] text-4xl font-bold mb-2">$0.90</div>
              <div className="text-[#797b89]">Per 1M Tokens</div>
            </div>
            <div className="text-center">
              <div className="text-[#615ced] text-4xl font-bold mb-2">&lt;3s</div>
              <div className="text-[#797b89]">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-[#615ced] text-4xl font-bold mb-2">100%</div>
              <div className="text-[#797b89]">OpenAI Compatible</div>
            </div>
          </div>

          {/* Features Section */}
          <div className="text-center w-full flex flex-col items-center mb-[60px]">
            <h2 className="text-[#f7f8fc] text-2xl font-semibold mb-2">
              Product Features
            </h2>
            <p className="text-[#797b89]">
              Everything you need to build with AI
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-[120px]">
            {[
              { title: "OpenAI Compatible", desc: "Drop-in replacement for OpenAI API. Switch with one line of code." },
              { title: "Streaming Support", desc: "Real-time token streaming for responsive user experiences." },
              { title: "Rate Limiting", desc: "Built-in rate limiting with customizable plans and quotas." },
              { title: "Usage Analytics", desc: "Track token usage, costs, and API performance in real-time." },
              { title: "API Key Management", desc: "Create, rotate, and revoke API keys from your dashboard." },
              { title: "Enterprise Ready", desc: "SOC2 compliant infrastructure with 99.9% uptime SLA." },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-[#1a1a1f] border border-[rgba(95,96,108,0.3)] p-6 rounded-2xl hover:border-[#615ced] transition-colors"
              >
                <h3 className="text-[#f7f8fc] text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-[#797b89] text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Code Example */}
          <div className="text-center w-full flex flex-col items-center mb-[60px]">
            <h2 className="text-[#f7f8fc] text-2xl font-semibold mb-2">
              Simple Integration
            </h2>
            <p className="text-[#797b89]">
              Get started in minutes with our OpenAI-compatible API
            </p>
          </div>

          <div className="bg-[#1a1a1f] border border-[rgba(95,96,108,0.3)] rounded-2xl p-6 mb-[120px] overflow-x-auto">
            <pre className="text-sm">
              <code className="text-[#f7f8fc]">
{`import openai

client = openai.OpenAI(
    base_url="https://forge-api-a7pi.onrender.com/v1",
    api_key="sk-forge-xxx"
)

response = client.chat.completions.create(
    model="forge-coder",
    messages=[
        {"role": "user", "content": "Write a Python quicksort"}
    ]
)

print(response.choices[0].message.content)`}
              </code>
            </pre>
          </div>

          {/* CTA Section */}
          <div className="text-center w-full flex flex-col items-center">
            <h2 className="text-[#f7f8fc] text-3xl font-semibold mb-4">
              Ready to Build?
            </h2>
            <p className="text-[#797b89] mb-8 max-w-[500px]">
              Start building with FORGE today. Free tier includes 100K tokens per day.
            </p>
            <div className="flex gap-4">
              <Link
                href="/register"
                className="bg-[#615ced] text-[#f7f8fc] px-8 py-4 rounded-full font-semibold hover:bg-[#7a78ff] transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                href="/docs"
                className="border border-[rgba(95,96,108,0.6)] text-[#f7f8fc] px-8 py-4 rounded-full hover:border-[#615ced] transition-colors"
              >
                Read the Docs
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[rgba(95,96,108,0.3)] py-12 px-6 md:px-[60px]">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-wrap justify-between gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="text-2xl font-bold text-[#f7f8fc] mb-4">FORGE</div>
              <p className="text-[#797b89] max-w-[300px]">
                AI coding API built for developers. Fast, reliable, and cost-effective.
              </p>
            </div>
            
            {/* Links */}
            <div className="flex gap-20">
              <div>
                <div className="text-[#797b89] text-sm mb-4">Product</div>
                <div className="flex flex-col gap-3">
                  <Link href="/docs" className="text-[#f7f8fc] hover:text-[#615ced]">Documentation</Link>
                  <Link href="/pricing" className="text-[#f7f8fc] hover:text-[#615ced]">Pricing</Link>
                  <Link href="/dashboard" className="text-[#f7f8fc] hover:text-[#615ced]">Dashboard</Link>
                </div>
              </div>
              <div>
                <div className="text-[#797b89] text-sm mb-4">Legal</div>
                <div className="flex flex-col gap-3">
                  <Link href="/terms" className="text-[#f7f8fc] hover:text-[#615ced]">Terms of Service</Link>
                  <Link href="/privacy" className="text-[#f7f8fc] hover:text-[#615ced]">Privacy Policy</Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-[rgba(95,96,108,0.3)] pt-8 text-center text-[#797b89]">
            © 2024 FORGE. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
