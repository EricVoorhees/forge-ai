"use client";

import Link from "next/link";

export default function ChatAPIPage() {
  return (
    <div className="pt-8 pb-16 px-8 lg:px-16">
        <div className="max-w-3xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-8">
            <Link href="/docs" className="text-[#71717a] hover:text-white transition-colors">Docs</Link>
            <span className="text-[#52525b]">/</span>
            <Link href="/docs/api/chat" className="text-[#71717a] hover:text-white transition-colors">API</Link>
            <span className="text-[#52525b]">/</span>
            <span className="text-white">Chat Completions</span>
          </div>

          {/* Header */}
          <h1 className="text-white text-4xl font-semibold tracking-tight mb-4">
            Chat Completions
          </h1>
          <p className="text-[#a1a1aa] text-lg leading-relaxed mb-8">
            Create chat completions with the FORGE model.
          </p>

          {/* Endpoint */}
          <div className="flex items-center gap-3 mb-8">
            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-medium px-2 py-1 rounded">POST</span>
            <code className="text-white font-mono">/v1/chat/completions</code>
          </div>

          {/* Request Body */}
          <div className="mb-12">
            <h2 className="text-white text-xl font-medium mb-6">Request Body</h2>
            <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left text-[#71717a] font-medium px-4 py-3">Parameter</th>
                    <th className="text-left text-[#71717a] font-medium px-4 py-3">Type</th>
                    <th className="text-left text-[#71717a] font-medium px-4 py-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  <tr>
                    <td className="px-4 py-3">
                      <code className="text-white font-mono text-sm">model</code>
                      <span className="text-red-400 ml-1">*</span>
                    </td>
                    <td className="text-[#71717a] px-4 py-3">string</td>
                    <td className="text-[#a1a1aa] px-4 py-3">Model ID to use. Currently only <code className="bg-white/[0.06] px-1 rounded">forge-1</code></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <code className="text-white font-mono text-sm">messages</code>
                      <span className="text-red-400 ml-1">*</span>
                    </td>
                    <td className="text-[#71717a] px-4 py-3">array</td>
                    <td className="text-[#a1a1aa] px-4 py-3">Array of message objects with <code className="bg-white/[0.06] px-1 rounded">role</code> and <code className="bg-white/[0.06] px-1 rounded">content</code></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <code className="text-white font-mono text-sm">max_tokens</code>
                    </td>
                    <td className="text-[#71717a] px-4 py-3">integer</td>
                    <td className="text-[#a1a1aa] px-4 py-3">Maximum tokens to generate. Default: 4096</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <code className="text-white font-mono text-sm">temperature</code>
                    </td>
                    <td className="text-[#71717a] px-4 py-3">number</td>
                    <td className="text-[#a1a1aa] px-4 py-3">Sampling temperature (0-2). Default: 1</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <code className="text-white font-mono text-sm">top_p</code>
                    </td>
                    <td className="text-[#71717a] px-4 py-3">number</td>
                    <td className="text-[#a1a1aa] px-4 py-3">Nucleus sampling threshold. Default: 1</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <code className="text-white font-mono text-sm">stream</code>
                    </td>
                    <td className="text-[#71717a] px-4 py-3">boolean</td>
                    <td className="text-[#a1a1aa] px-4 py-3">Enable streaming responses. Default: false</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <code className="text-white font-mono text-sm">stop</code>
                    </td>
                    <td className="text-[#71717a] px-4 py-3">string | array</td>
                    <td className="text-[#a1a1aa] px-4 py-3">Stop sequences to end generation</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[#52525b] text-xs mt-2">* Required parameters</p>
          </div>

          {/* Example Request */}
          <div className="mb-12">
            <h2 className="text-white text-xl font-medium mb-4">Example Request</h2>
            <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
                <span className="text-[#71717a] text-xs">cURL</span>
                <button className="text-[#71717a] text-xs hover:text-white transition-colors">Copy</button>
              </div>
              <pre className="p-4 font-mono text-sm overflow-x-auto">
                <code className="text-[#a1a1aa]">
{`curl https://api.openframe.co/v1/chat/completions \\
  -H "Authorization: Bearer sk-forge-..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "forge-1",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello!"}
    ],
    "max_tokens": 1024,
    "temperature": 0.7
  }'`}
                </code>
              </pre>
            </div>
          </div>

          {/* Example Response */}
          <div className="mb-12">
            <h2 className="text-white text-xl font-medium mb-4">Example Response</h2>
            <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
                <span className="text-[#71717a] text-xs">JSON</span>
              </div>
              <pre className="p-4 font-mono text-sm overflow-x-auto">
                <code className="text-[#a1a1aa]">
{`{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1709856000,
  "model": "forge-1",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 25,
    "completion_tokens": 9,
    "total_tokens": 34
  }
}`}
                </code>
              </pre>
            </div>
          </div>

          {/* Message Roles */}
          <div className="mb-12">
            <h2 className="text-white text-xl font-medium mb-4">Message Roles</h2>
            <div className="space-y-4">
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4">
                <code className="text-white font-mono text-sm">system</code>
                <p className="text-[#a1a1aa] text-sm mt-2">Sets the behavior and context for the assistant. Placed at the beginning of the conversation.</p>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4">
                <code className="text-white font-mono text-sm">user</code>
                <p className="text-[#a1a1aa] text-sm mt-2">Messages from the user/human in the conversation.</p>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4">
                <code className="text-white font-mono text-sm">assistant</code>
                <p className="text-[#a1a1aa] text-sm mt-2">Previous responses from the model. Used for multi-turn conversations.</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-16 pt-8 border-t border-white/[0.06] flex justify-between">
            <Link
              href="/docs/authentication"
              className="group text-[#71717a] hover:text-white transition-colors"
            >
              <div className="text-xs mb-1">← Previous</div>
              <div className="text-white text-sm font-medium">Authentication</div>
            </Link>
            <Link
              href="/docs/api/streaming"
              className="group text-[#71717a] hover:text-white transition-colors text-right"
            >
              <div className="text-xs mb-1">Next →</div>
              <div className="text-white text-sm font-medium">Streaming</div>
            </Link>
          </div>
        </div>
      </div>
  );
}

