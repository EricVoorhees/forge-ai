"use client";

import Link from "next/link";

export default function PythonSDKPage() {
  return (
    <div className="pt-8 pb-16 px-8 lg:px-16">
        <div className="max-w-3xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-8">
            <Link href="/docs" className="text-[#71717a] hover:text-white transition-colors">Docs</Link>
            <span className="text-[#52525b]">/</span>
            <span className="text-[#71717a]">SDKs</span>
            <span className="text-[#52525b]">/</span>
            <span className="text-white">Python</span>
          </div>

          {/* Header */}
          <h1 className="text-white text-4xl font-semibold tracking-tight mb-4">
            Python SDK
          </h1>
          <p className="text-[#a1a1aa] text-lg leading-relaxed mb-12">
            Use the official OpenAI Python library with FORGE.
          </p>

          {/* Content */}
          <div className="space-y-12">
            <div>
              <h2 className="text-white text-xl font-medium mb-4">Installation</h2>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg p-4 font-mono text-sm">
                <span className="text-[#71717a]">$</span> <span className="text-[#a1a1aa]">pip install openai</span>
              </div>
              <p className="text-[#71717a] text-sm mt-2">Requires Python 3.7+</p>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Configuration</h2>
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                Configure the client to use the FORGE API endpoint:
              </p>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <pre className="p-4 font-mono text-sm overflow-x-auto">
                  <code className="text-[#a1a1aa]">
{`from openai import OpenAI

client = OpenAI(
    base_url="https://api.openframe.co/v1",
    api_key="sk-forge-..."  # Or use OPENAI_API_KEY env var
)`}
                  </code>
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Chat Completions</h2>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <pre className="p-4 font-mono text-sm overflow-x-auto">
                  <code className="text-[#a1a1aa]">
{`response = client.chat.completions.create(
    model="forge-coder",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello!"}
    ],
    max_tokens=1024,
    temperature=0.7
)

print(response.choices[0].message.content)`}
                  </code>
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Streaming</h2>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <pre className="p-4 font-mono text-sm overflow-x-auto">
                  <code className="text-[#a1a1aa]">
{`stream = client.chat.completions.create(
    model="forge-coder",
    messages=[{"role": "user", "content": "Write a story"}],
    stream=True
)

for chunk in stream:
    content = chunk.choices[0].delta.content
    if content:
        print(content, end="", flush=True)`}
                  </code>
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Async Usage</h2>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <pre className="p-4 font-mono text-sm overflow-x-auto">
                  <code className="text-[#a1a1aa]">
{`from openai import AsyncOpenAI
import asyncio

client = AsyncOpenAI(
    base_url="https://api.openframe.co/v1",
    api_key="sk-forge-..."
)

async def main():
    response = await client.chat.completions.create(
        model="forge-coder",
        messages=[{"role": "user", "content": "Hello!"}]
    )
    print(response.choices[0].message.content)

asyncio.run(main())`}
                  </code>
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Environment Variables</h2>
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                You can also configure the client using environment variables:
              </p>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <div className="flex items-center px-4 py-2 border-b border-white/[0.06]">
                  <span className="text-[#71717a] text-xs">.env</span>
                </div>
                <pre className="p-4 font-mono text-sm">
                  <code className="text-[#a1a1aa]">{`OPENAI_API_KEY=sk-forge-...
OPENAI_BASE_URL=https://api.openframe.co/v1`}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-16 pt-8 border-t border-white/[0.06] flex justify-between">
            <Link
              href="/docs/guides/rate-limits"
              className="group text-[#71717a] hover:text-white transition-colors"
            >
              <div className="text-xs mb-1">← Previous</div>
              <div className="text-white text-sm font-medium">Rate Limits</div>
            </Link>
            <Link
              href="/docs/sdks/node"
              className="group text-[#71717a] hover:text-white transition-colors text-right"
            >
              <div className="text-xs mb-1">Next →</div>
              <div className="text-white text-sm font-medium">Node.js</div>
            </Link>
          </div>
        </div>
      </div>
  );
}

