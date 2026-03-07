"use client";

import Link from "next/link";

export default function StreamingPage() {
  return (
    <div className="pt-8 pb-16 px-8 lg:px-16">
        <div className="max-w-3xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-8">
            <Link href="/docs" className="text-[#71717a] hover:text-white transition-colors">Docs</Link>
            <span className="text-[#52525b]">/</span>
            <Link href="/docs/api/chat" className="text-[#71717a] hover:text-white transition-colors">API</Link>
            <span className="text-[#52525b]">/</span>
            <span className="text-white">Streaming</span>
          </div>

          {/* Header */}
          <h1 className="text-white text-4xl font-semibold tracking-tight mb-4">
            Streaming
          </h1>
          <p className="text-[#a1a1aa] text-lg leading-relaxed mb-12">
            Stream responses token-by-token for real-time applications.
          </p>

          {/* Content */}
          <div className="space-y-12">
            <div>
              <h2 className="text-white text-xl font-medium mb-4">Overview</h2>
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                Streaming allows you to receive partial responses as they are generated, rather than waiting for the complete response. This is useful for chat interfaces and real-time applications.
              </p>
              <p className="text-[#a1a1aa] leading-relaxed">
                Enable streaming by setting <code className="bg-white/[0.06] px-1.5 py-0.5 rounded text-white/80">stream: true</code> in your request. The response will be sent as Server-Sent Events (SSE).
              </p>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Python Example</h2>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
                  <span className="text-[#71717a] text-xs">stream.py</span>
                  <button className="text-[#71717a] text-xs hover:text-white transition-colors">Copy</button>
                </div>
                <pre className="p-4 font-mono text-sm overflow-x-auto">
                  <code className="text-[#a1a1aa]">
{`from openai import OpenAI

client = OpenAI(
    base_url="https://api.openframe.co/v1",
    api_key="sk-forge-..."
)

stream = client.chat.completions.create(
    model="forge-1",
    messages=[{"role": "user", "content": "Write a haiku"}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)`}
                  </code>
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Node.js Example</h2>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
                  <span className="text-[#71717a] text-xs">stream.js</span>
                  <button className="text-[#71717a] text-xs hover:text-white transition-colors">Copy</button>
                </div>
                <pre className="p-4 font-mono text-sm overflow-x-auto">
                  <code className="text-[#a1a1aa]">
{`import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://api.openframe.co/v1',
  apiKey: 'sk-forge-...'
});

const stream = await client.chat.completions.create({
  model: 'forge-1',
  messages: [{ role: 'user', content: 'Write a haiku' }],
  stream: true
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) process.stdout.write(content);
}`}
                  </code>
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Stream Event Format</h2>
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                Each SSE event contains a JSON object with the following structure:
              </p>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <pre className="p-4 font-mono text-sm overflow-x-auto">
                  <code className="text-[#a1a1aa]">
{`data: {"id":"chatcmpl-abc","object":"chat.completion.chunk","created":1709856000,"model":"forge-1","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}

data: {"id":"chatcmpl-abc","object":"chat.completion.chunk","created":1709856000,"model":"forge-1","choices":[{"index":0,"delta":{"content":"!"},"finish_reason":null}]}

data: {"id":"chatcmpl-abc","object":"chat.completion.chunk","created":1709856000,"model":"forge-1","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]`}
                  </code>
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Handling Stream End</h2>
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                The stream ends when you receive:
              </p>
              <ul className="space-y-2 text-[#a1a1aa]">
                <li className="flex items-start gap-3">
                  <span className="text-white/40">•</span>
                  <span>A chunk with <code className="bg-white/[0.06] px-1 rounded">finish_reason: "stop"</code> - normal completion</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-white/40">•</span>
                  <span>A chunk with <code className="bg-white/[0.06] px-1 rounded">finish_reason: "length"</code> - max tokens reached</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-white/40">•</span>
                  <span>The <code className="bg-white/[0.06] px-1 rounded">data: [DONE]</code> message</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-16 pt-8 border-t border-white/[0.06] flex justify-between">
            <Link
              href="/docs/api/chat"
              className="group text-[#71717a] hover:text-white transition-colors"
            >
              <div className="text-xs mb-1">← Previous</div>
              <div className="text-white text-sm font-medium">Chat Completions</div>
            </Link>
            <Link
              href="/docs/api/errors"
              className="group text-[#71717a] hover:text-white transition-colors text-right"
            >
              <div className="text-xs mb-1">Next →</div>
              <div className="text-white text-sm font-medium">Error Handling</div>
            </Link>
          </div>
        </div>
      </div>
  );
}

