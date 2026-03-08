"use client";

import Link from "next/link";

export default function NodeSDKPage() {
  return (
    <div className="pt-8 pb-16 px-8 lg:px-16">
        <div className="max-w-3xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-8">
            <Link href="/docs" className="text-[#71717a] hover:text-white transition-colors">Docs</Link>
            <span className="text-[#52525b]">/</span>
            <span className="text-[#71717a]">SDKs</span>
            <span className="text-[#52525b]">/</span>
            <span className="text-white">Node.js</span>
          </div>

          {/* Header */}
          <h1 className="text-white text-4xl font-semibold tracking-tight mb-4">
            Node.js SDK
          </h1>
          <p className="text-[#a1a1aa] text-lg leading-relaxed mb-12">
            Use the official OpenAI Node.js library with FORGE.
          </p>

          {/* Content */}
          <div className="space-y-12">
            <div>
              <h2 className="text-white text-xl font-medium mb-4">Installation</h2>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg p-4 font-mono text-sm">
                <span className="text-[#71717a]">$</span> <span className="text-[#a1a1aa]">npm install openai</span>
              </div>
              <p className="text-[#71717a] text-sm mt-2">Requires Node.js 18+</p>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Configuration</h2>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <pre className="p-4 font-mono text-sm overflow-x-auto">
                  <code className="text-[#a1a1aa]">
{`import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://api.openframe.co/v1',
  apiKey: 'sk-forge-...'  // Or use OPENAI_API_KEY env var
});`}
                  </code>
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Chat Completions</h2>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <pre className="p-4 font-mono text-sm overflow-x-auto">
                  <code className="text-[#a1a1aa]">
{`const response = await client.chat.completions.create({
  model: 'forge-coder',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' }
  ],
  max_tokens: 1024,
  temperature: 0.7
});

console.log(response.choices[0].message.content);`}
                  </code>
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Streaming</h2>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <pre className="p-4 font-mono text-sm overflow-x-auto">
                  <code className="text-[#a1a1aa]">
{`const stream = await client.chat.completions.create({
  model: 'forge-coder',
  messages: [{ role: 'user', content: 'Write a story' }],
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
              <h2 className="text-white text-xl font-medium mb-4">TypeScript</h2>
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                The SDK includes full TypeScript support:
              </p>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <pre className="p-4 font-mono text-sm overflow-x-auto">
                  <code className="text-[#a1a1aa]">
{`import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';

const messages: ChatCompletionMessageParam[] = [
  { role: 'user', content: 'Hello!' }
];

const response = await client.chat.completions.create({
  model: 'forge-coder',
  messages
});`}
                  </code>
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Edge Runtime</h2>
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                Works with Vercel Edge Functions, Cloudflare Workers, and other edge runtimes:
              </p>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <div className="flex items-center px-4 py-2 border-b border-white/[0.06]">
                  <span className="text-[#71717a] text-xs">app/api/chat/route.ts</span>
                </div>
                <pre className="p-4 font-mono text-sm overflow-x-auto">
                  <code className="text-[#a1a1aa]">
{`import OpenAI from 'openai';

export const runtime = 'edge';

const client = new OpenAI({
  baseURL: 'https://api.openframe.co/v1',
  apiKey: process.env.FORGE_API_KEY
});

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const stream = await client.chat.completions.create({
    model: 'forge-coder',
    messages,
    stream: true
  });

  return new Response(stream.toReadableStream());
}`}
                  </code>
                </pre>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-16 pt-8 border-t border-white/[0.06] flex justify-between">
            <Link
              href="/docs/sdks/python"
              className="group text-[#71717a] hover:text-white transition-colors"
            >
              <div className="text-xs mb-1">← Previous</div>
              <div className="text-white text-sm font-medium">Python</div>
            </Link>
            <Link
              href="/docs/sdks/rest"
              className="group text-[#71717a] hover:text-white transition-colors text-right"
            >
              <div className="text-xs mb-1">Next →</div>
              <div className="text-white text-sm font-medium">REST API</div>
            </Link>
          </div>
        </div>
      </div>
  );
}

