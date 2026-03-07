"use client";

import Link from "next/link";

export default function RestAPIPage() {
  return (
    <div className="pt-8 pb-16 px-8 lg:px-16">
        <div className="max-w-3xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-8">
            <Link href="/docs" className="text-[#71717a] hover:text-white transition-colors">Docs</Link>
            <span className="text-[#52525b]">/</span>
            <span className="text-[#71717a]">SDKs</span>
            <span className="text-[#52525b]">/</span>
            <span className="text-white">REST API</span>
          </div>

          {/* Header */}
          <h1 className="text-white text-4xl font-semibold tracking-tight mb-4">
            REST API
          </h1>
          <p className="text-[#a1a1aa] text-lg leading-relaxed mb-12">
            Use the FORGE API directly with HTTP requests.
          </p>

          {/* Content */}
          <div className="space-y-12">
            <div>
              <h2 className="text-white text-xl font-medium mb-4">Base URL</h2>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg p-4 font-mono text-sm">
                <span className="text-[#a1a1aa]">https://api.openframe.co/v1</span>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Authentication</h2>
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                Include your API key in the Authorization header:
              </p>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg p-4 font-mono text-sm">
                <span className="text-[#71717a]">Authorization:</span> <span className="text-[#a1a1aa]">Bearer sk-forge-your-api-key</span>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">cURL Example</h2>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
                  <span className="text-[#71717a] text-xs">Terminal</span>
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
      {"role": "user", "content": "Hello!"}
    ]
  }'`}
                  </code>
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Fetch (JavaScript)</h2>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <pre className="p-4 font-mono text-sm overflow-x-auto">
                  <code className="text-[#a1a1aa]">
{`const response = await fetch('https://api.openframe.co/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk-forge-...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'forge-1',
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);`}
                  </code>
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Streaming with Fetch</h2>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <pre className="p-4 font-mono text-sm overflow-x-auto">
                  <code className="text-[#a1a1aa]">
{`const response = await fetch('https://api.openframe.co/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk-forge-...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'forge-1',
    messages: [{ role: 'user', content: 'Hello!' }],
    stream: true
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\\n').filter(line => line.startsWith('data: '));
  
  for (const line of lines) {
    const data = line.slice(6);
    if (data === '[DONE]') continue;
    
    const parsed = JSON.parse(data);
    const content = parsed.choices[0]?.delta?.content;
    if (content) process.stdout.write(content);
  }
}`}
                  </code>
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Available Endpoints</h2>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left text-[#71717a] font-medium px-4 py-3">Method</th>
                      <th className="text-left text-[#71717a] font-medium px-4 py-3">Endpoint</th>
                      <th className="text-left text-[#71717a] font-medium px-4 py-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    <tr>
                      <td className="px-4 py-3">
                        <span className="bg-emerald-500/20 text-emerald-400 text-xs font-medium px-2 py-0.5 rounded">POST</span>
                      </td>
                      <td className="text-white px-4 py-3 font-mono text-xs">/v1/chat/completions</td>
                      <td className="text-[#a1a1aa] px-4 py-3">Create chat completion</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">
                        <span className="bg-blue-500/20 text-blue-400 text-xs font-medium px-2 py-0.5 rounded">GET</span>
                      </td>
                      <td className="text-white px-4 py-3 font-mono text-xs">/v1/models</td>
                      <td className="text-[#a1a1aa] px-4 py-3">List available models</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">
                        <span className="bg-blue-500/20 text-blue-400 text-xs font-medium px-2 py-0.5 rounded">GET</span>
                      </td>
                      <td className="text-white px-4 py-3 font-mono text-xs">/v1/models/{'{model}'}</td>
                      <td className="text-[#a1a1aa] px-4 py-3">Get model details</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-16 pt-8 border-t border-white/[0.06] flex justify-between">
            <Link
              href="/docs/sdks/node"
              className="group text-[#71717a] hover:text-white transition-colors"
            >
              <div className="text-xs mb-1">← Previous</div>
              <div className="text-white text-sm font-medium">Node.js</div>
            </Link>
            <Link
              href="/docs"
              className="group text-[#71717a] hover:text-white transition-colors text-right"
            >
              <div className="text-xs mb-1">Back to →</div>
              <div className="text-white text-sm font-medium">Documentation</div>
            </Link>
          </div>
        </div>
      </div>
  );
}

