"use client";

import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="pt-8 pb-16 px-8 lg:px-16">
        <div className="max-w-3xl">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-white text-4xl font-semibold tracking-tight mb-4">
              FORGE API Documentation
            </h1>
            <p className="text-[#a1a1aa] text-lg leading-relaxed">
              Build powerful AI applications with FORGE. Our API provides access to state-of-the-art language models for code generation, reasoning, and analysis.
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
            <Link
              href="/docs/quickstart"
              className="group p-5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.1] rounded-xl transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-white font-medium">Quickstart</span>
              </div>
              <p className="text-[#71717a] text-sm">Get up and running with the FORGE API in minutes.</p>
            </Link>

            <Link
              href="/docs/api/chat"
              className="group p-5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.1] rounded-xl transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-white font-medium">API Reference</span>
              </div>
              <p className="text-[#71717a] text-sm">Complete reference for all API endpoints.</p>
            </Link>

            <Link
              href="/docs/guides/prompts"
              className="group p-5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.1] rounded-xl transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <span className="text-white font-medium">Prompt Engineering</span>
              </div>
              <p className="text-[#71717a] text-sm">Learn how to write effective prompts.</p>
            </Link>

            <Link
              href="/docs/sdks/python"
              className="group p-5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.1] rounded-xl transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span className="text-white font-medium">SDKs & Libraries</span>
              </div>
              <p className="text-[#71717a] text-sm">Official SDKs for Python, Node.js, and more.</p>
            </Link>
          </div>

          {/* Introduction Content */}
          <div className="prose prose-invert max-w-none">
            <h2 className="text-white text-2xl font-semibold mb-4">Introduction</h2>
            <p className="text-[#a1a1aa] leading-relaxed mb-6">
              The FORGE API provides programmatic access to our AI models including Forge Coder (671B) and Forge Mini (120B). The API follows OpenAI-compatible conventions, making it easy to integrate with existing tools and workflows.
            </p>

            <h3 className="text-white text-lg font-medium mt-8 mb-3">Base URL</h3>
            <div className="bg-[#111113] border border-white/[0.06] rounded-lg p-4 font-mono text-sm text-[#a1a1aa] mb-6">
              https://api.openframe.co/v1
            </div>

            <h3 className="text-white text-lg font-medium mt-8 mb-3">Authentication</h3>
            <p className="text-[#a1a1aa] leading-relaxed mb-4">
              All API requests require authentication using an API key. Include your key in the <code className="bg-white/[0.06] px-1.5 py-0.5 rounded text-white/80">Authorization</code> header:
            </p>
            <div className="bg-[#111113] border border-white/[0.06] rounded-lg p-4 font-mono text-sm overflow-x-auto mb-6">
              <div className="text-[#71717a]"># Example request</div>
              <div className="text-[#a1a1aa] mt-2">
                <span className="text-emerald-400">curl</span> https://api.openframe.co/v1/chat/completions \
              </div>
              <div className="text-[#a1a1aa] pl-4">
                -H <span className="text-amber-300">"Authorization: Bearer sk-forge-..."</span> \
              </div>
              <div className="text-[#a1a1aa] pl-4">
                -H <span className="text-amber-300">"Content-Type: application/json"</span> \
              </div>
              <div className="text-[#a1a1aa] pl-4">
                -d <span className="text-amber-300">'{`{"model": "forge-coder", "messages": [{"role": "user", "content": "Hello"}]}`}'</span>
              </div>
            </div>

            <h3 className="text-white text-lg font-medium mt-8 mb-3">Models</h3>
            <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left text-[#71717a] font-medium px-4 py-3">Model</th>
                    <th className="text-left text-[#71717a] font-medium px-4 py-3">Context</th>
                    <th className="text-left text-[#71717a] font-medium px-4 py-3">Input</th>
                    <th className="text-left text-[#71717a] font-medium px-4 py-3">Output</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="text-white px-4 py-3 font-mono">forge-coder</td>
                    <td className="text-[#a1a1aa] px-4 py-3">128K tokens</td>
                    <td className="text-[#a1a1aa] px-4 py-3">$0.98 / 1M</td>
                    <td className="text-[#a1a1aa] px-4 py-3">$1.87 / 1M</td>
                  </tr>
                  <tr>
                    <td className="text-white px-4 py-3 font-mono">forge-mini</td>
                    <td className="text-[#a1a1aa] px-4 py-3">32K tokens</td>
                    <td className="text-[#a1a1aa] px-4 py-3">$0.079 / 1M</td>
                    <td className="text-[#a1a1aa] px-4 py-3">$0.37 / 1M</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-white text-lg font-medium mt-8 mb-3">Next Steps</h3>
            <ul className="text-[#a1a1aa] space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <span className="text-white/40">→</span>
                <Link href="/docs/quickstart" className="text-white hover:underline">Follow the Quickstart guide</Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-white/40">→</span>
                <Link href="/docs/api/chat" className="text-white hover:underline">Explore the Chat API</Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-white/40">→</span>
                <Link href="/dashboard" className="text-white hover:underline">Get your API key</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
  );
}

