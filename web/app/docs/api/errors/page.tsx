"use client";

import Link from "next/link";

export default function ErrorsPage() {
  return (
    <div className="pt-8 pb-16 px-8 lg:px-16">
        <div className="max-w-3xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-8">
            <Link href="/docs" className="text-[#71717a] hover:text-white transition-colors">Docs</Link>
            <span className="text-[#52525b]">/</span>
            <Link href="/docs/api/chat" className="text-[#71717a] hover:text-white transition-colors">API</Link>
            <span className="text-[#52525b]">/</span>
            <span className="text-white">Error Handling</span>
          </div>

          {/* Header */}
          <h1 className="text-white text-4xl font-semibold tracking-tight mb-4">
            Error Handling
          </h1>
          <p className="text-[#a1a1aa] text-lg leading-relaxed mb-12">
            Handle API errors gracefully in your applications.
          </p>

          {/* Content */}
          <div className="space-y-12">
            <div>
              <h2 className="text-white text-xl font-medium mb-4">Error Response Format</h2>
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                When an error occurs, the API returns a JSON response with an error object:
              </p>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <pre className="p-4 font-mono text-sm overflow-x-auto">
                  <code className="text-[#a1a1aa]">
{`{
  "error": {
    "message": "Invalid API key provided",
    "type": "authentication_error",
    "code": "invalid_api_key"
  }
}`}
                  </code>
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">HTTP Status Codes</h2>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left text-[#71717a] font-medium px-4 py-3">Code</th>
                      <th className="text-left text-[#71717a] font-medium px-4 py-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    <tr>
                      <td className="px-4 py-3">
                        <code className="text-emerald-400 font-mono">200</code>
                      </td>
                      <td className="text-[#a1a1aa] px-4 py-3">Success</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">
                        <code className="text-amber-400 font-mono">400</code>
                      </td>
                      <td className="text-[#a1a1aa] px-4 py-3">Bad Request - Invalid parameters</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">
                        <code className="text-red-400 font-mono">401</code>
                      </td>
                      <td className="text-[#a1a1aa] px-4 py-3">Unauthorized - Invalid or missing API key</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">
                        <code className="text-red-400 font-mono">403</code>
                      </td>
                      <td className="text-[#a1a1aa] px-4 py-3">Forbidden - Insufficient permissions</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">
                        <code className="text-amber-400 font-mono">429</code>
                      </td>
                      <td className="text-[#a1a1aa] px-4 py-3">Too Many Requests - Rate limit exceeded</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">
                        <code className="text-red-400 font-mono">500</code>
                      </td>
                      <td className="text-[#a1a1aa] px-4 py-3">Internal Server Error</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">
                        <code className="text-red-400 font-mono">503</code>
                      </td>
                      <td className="text-[#a1a1aa] px-4 py-3">Service Unavailable - Temporary overload</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Error Types</h2>
              <div className="space-y-4">
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4">
                  <code className="text-white font-mono text-sm">authentication_error</code>
                  <p className="text-[#a1a1aa] text-sm mt-2">Invalid, expired, or missing API key.</p>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4">
                  <code className="text-white font-mono text-sm">invalid_request_error</code>
                  <p className="text-[#a1a1aa] text-sm mt-2">Malformed request or invalid parameters.</p>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4">
                  <code className="text-white font-mono text-sm">rate_limit_error</code>
                  <p className="text-[#a1a1aa] text-sm mt-2">Too many requests. Implement exponential backoff.</p>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4">
                  <code className="text-white font-mono text-sm">server_error</code>
                  <p className="text-[#a1a1aa] text-sm mt-2">Internal server error. Retry with backoff.</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Handling Errors in Python</h2>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
                  <span className="text-[#71717a] text-xs">error_handling.py</span>
                  <button className="text-[#71717a] text-xs hover:text-white transition-colors">Copy</button>
                </div>
                <pre className="p-4 font-mono text-sm overflow-x-auto">
                  <code className="text-[#a1a1aa]">
{`from openai import OpenAI, APIError, RateLimitError
import time

client = OpenAI(
    base_url="https://api.openframe.co/v1",
    api_key="sk-forge-..."
)

def make_request_with_retry(messages, max_retries=3):
    for attempt in range(max_retries):
        try:
            return client.chat.completions.create(
                model="forge-coder",
                messages=messages
            )
        except RateLimitError:
            wait = 2 ** attempt  # Exponential backoff
            print(f"Rate limited. Waiting {wait}s...")
            time.sleep(wait)
        except APIError as e:
            print(f"API error: {e}")
            raise
    
    raise Exception("Max retries exceeded")`}
                  </code>
                </pre>
              </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-blue-400 font-medium">Tip</span>
              </div>
              <p className="text-[#a1a1aa] text-sm">
                Always implement retry logic with exponential backoff for rate limit and server errors. Start with a 1-second delay and double it with each retry.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-16 pt-8 border-t border-white/[0.06] flex justify-between">
            <Link
              href="/docs/api/streaming"
              className="group text-[#71717a] hover:text-white transition-colors"
            >
              <div className="text-xs mb-1">← Previous</div>
              <div className="text-white text-sm font-medium">Streaming</div>
            </Link>
            <Link
              href="/docs/guides/best-practices"
              className="group text-[#71717a] hover:text-white transition-colors text-right"
            >
              <div className="text-xs mb-1">Next →</div>
              <div className="text-white text-sm font-medium">Best Practices</div>
            </Link>
          </div>
        </div>
      </div>
  );
}

