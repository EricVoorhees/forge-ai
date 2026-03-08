"use client";

import Link from "next/link";

export default function QuickstartPage() {
  return (
    <div className="pt-8 pb-16 px-8 lg:px-16">
        <div className="max-w-3xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-8">
            <Link href="/docs" className="text-[#71717a] hover:text-white transition-colors">Docs</Link>
            <span className="text-[#52525b]">/</span>
            <span className="text-white">Quickstart</span>
          </div>

          {/* Header */}
          <h1 className="text-white text-4xl font-semibold tracking-tight mb-4">
            Quickstart
          </h1>
          <p className="text-[#a1a1aa] text-lg leading-relaxed mb-12">
            Get up and running with the FORGE API in under 5 minutes.
          </p>

          {/* Steps */}
          <div className="space-y-12">
            {/* Step 1 */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white text-sm font-medium">1</div>
                <h2 className="text-white text-xl font-medium">Get your API key</h2>
              </div>
              <p className="text-[#a1a1aa] leading-relaxed mb-4 pl-10">
                Sign up for an account and create an API key from your <Link href="/dashboard" className="text-white hover:underline">dashboard</Link>. Your key will look like <code className="bg-white/[0.06] px-1.5 py-0.5 rounded text-white/80">sk-forge-...</code>
              </p>
            </div>

            {/* Step 2 */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white text-sm font-medium">2</div>
                <h2 className="text-white text-xl font-medium">Install the SDK</h2>
              </div>
              <p className="text-[#a1a1aa] leading-relaxed mb-4 pl-10">
                Install the official Python or Node.js SDK:
              </p>
              
              {/* Code tabs */}
              <div className="pl-10">
                <div className="flex gap-4 mb-3">
                  <span className="text-white text-sm font-medium border-b-2 border-white pb-1">Python</span>
                  <span className="text-[#71717a] text-sm pb-1">Node.js</span>
                </div>
                <div className="bg-[#111113] border border-white/[0.06] rounded-lg p-4 font-mono text-sm">
                  <span className="text-[#71717a]">$</span> <span className="text-[#a1a1aa]">pip install openai</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white text-sm font-medium">3</div>
                <h2 className="text-white text-xl font-medium">Make your first request</h2>
              </div>
              <p className="text-[#a1a1aa] leading-relaxed mb-4 pl-10">
                Create a simple script to test the API:
              </p>
              
              <div className="pl-10">
                <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
                    <span className="text-[#71717a] text-xs">quickstart.py</span>
                    <button className="text-[#71717a] text-xs hover:text-white transition-colors">Copy</button>
                  </div>
                  <pre className="p-4 font-mono text-sm overflow-x-auto">
                    <code className="text-[#a1a1aa]">
{`from openai import OpenAI

client = OpenAI(
    base_url="https://api.openframe.co/v1",
    api_key="sk-forge-..."  # Your API key
)

response = client.chat.completions.create(
    model="forge-coder",
    messages=[
        {"role": "user", "content": "Write a Python function to reverse a string"}
    ]
)

print(response.choices[0].message.content)`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white text-sm font-medium">4</div>
                <h2 className="text-white text-xl font-medium">Run it</h2>
              </div>
              <div className="pl-10">
                <div className="bg-[#111113] border border-white/[0.06] rounded-lg p-4 font-mono text-sm mb-4">
                  <span className="text-[#71717a]">$</span> <span className="text-[#a1a1aa]">python quickstart.py</span>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-emerald-400 text-sm font-medium">Response</span>
                  </div>
                  <pre className="font-mono text-sm text-[#a1a1aa]">
{`def reverse_string(s: str) -> str:
    return s[::-1]`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-16 pt-8 border-t border-white/[0.06]">
            <h3 className="text-white text-lg font-medium mb-4">Next steps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/docs/api/chat"
                className="group p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.1] rounded-xl transition-all"
              >
                <div className="text-white text-sm font-medium mb-1">Chat API Reference →</div>
                <div className="text-[#71717a] text-xs">Learn about all available parameters</div>
              </Link>
              <Link
                href="/docs/api/streaming"
                className="group p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.1] rounded-xl transition-all"
              >
                <div className="text-white text-sm font-medium mb-1">Streaming →</div>
                <div className="text-[#71717a] text-xs">Stream responses in real-time</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
  );
}

