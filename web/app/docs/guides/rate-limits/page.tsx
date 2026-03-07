"use client";

import Link from "next/link";

export default function RateLimitsPage() {
  return (
    <div className="pt-8 pb-16 px-8 lg:px-16">
        <div className="max-w-3xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-8">
            <Link href="/docs" className="text-[#71717a] hover:text-white transition-colors">Docs</Link>
            <span className="text-[#52525b]">/</span>
            <span className="text-[#71717a]">Guides</span>
            <span className="text-[#52525b]">/</span>
            <span className="text-white">Rate Limits</span>
          </div>

          {/* Header */}
          <h1 className="text-white text-4xl font-semibold tracking-tight mb-4">
            Rate Limits
          </h1>
          <p className="text-[#a1a1aa] text-lg leading-relaxed mb-12">
            Understanding and working with API rate limits.
          </p>

          {/* Content */}
          <div className="space-y-12">
            <div>
              <h2 className="text-white text-xl font-medium mb-4">Rate Limit Tiers</h2>
              <p className="text-[#a1a1aa] leading-relaxed mb-6">
                Rate limits vary by plan and are measured in requests per minute (RPM) and tokens per minute (TPM).
              </p>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left text-[#71717a] font-medium px-4 py-3">Plan</th>
                      <th className="text-left text-[#71717a] font-medium px-4 py-3">RPM</th>
                      <th className="text-left text-[#71717a] font-medium px-4 py-3">TPM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    <tr>
                      <td className="text-white px-4 py-3">Free</td>
                      <td className="text-[#a1a1aa] px-4 py-3">20</td>
                      <td className="text-[#a1a1aa] px-4 py-3">100,000</td>
                    </tr>
                    <tr>
                      <td className="text-white px-4 py-3">Starter</td>
                      <td className="text-[#a1a1aa] px-4 py-3">60</td>
                      <td className="text-[#a1a1aa] px-4 py-3">500,000</td>
                    </tr>
                    <tr>
                      <td className="text-white px-4 py-3">Pro</td>
                      <td className="text-[#a1a1aa] px-4 py-3">300</td>
                      <td className="text-[#a1a1aa] px-4 py-3">2,000,000</td>
                    </tr>
                    <tr>
                      <td className="text-white px-4 py-3">Enterprise</td>
                      <td className="text-[#a1a1aa] px-4 py-3">Custom</td>
                      <td className="text-[#a1a1aa] px-4 py-3">Custom</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Rate Limit Headers</h2>
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                Every response includes headers with your current rate limit status:
              </p>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left text-[#71717a] font-medium px-4 py-3">Header</th>
                      <th className="text-left text-[#71717a] font-medium px-4 py-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    <tr>
                      <td className="text-white px-4 py-3 font-mono text-xs">x-ratelimit-limit-requests</td>
                      <td className="text-[#a1a1aa] px-4 py-3">Max requests per minute</td>
                    </tr>
                    <tr>
                      <td className="text-white px-4 py-3 font-mono text-xs">x-ratelimit-remaining-requests</td>
                      <td className="text-[#a1a1aa] px-4 py-3">Remaining requests</td>
                    </tr>
                    <tr>
                      <td className="text-white px-4 py-3 font-mono text-xs">x-ratelimit-limit-tokens</td>
                      <td className="text-[#a1a1aa] px-4 py-3">Max tokens per minute</td>
                    </tr>
                    <tr>
                      <td className="text-white px-4 py-3 font-mono text-xs">x-ratelimit-remaining-tokens</td>
                      <td className="text-[#a1a1aa] px-4 py-3">Remaining tokens</td>
                    </tr>
                    <tr>
                      <td className="text-white px-4 py-3 font-mono text-xs">x-ratelimit-reset-requests</td>
                      <td className="text-[#a1a1aa] px-4 py-3">Time until request limit resets</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Handling 429 Errors</h2>
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                When you exceed rate limits, you'll receive a 429 status code. Implement exponential backoff:
              </p>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden">
                <pre className="p-4 font-mono text-sm overflow-x-auto">
                  <code className="text-[#a1a1aa]">
{`import time
import random

def exponential_backoff(attempt, base=1, max_delay=60):
    delay = min(base * (2 ** attempt) + random.uniform(0, 1), max_delay)
    time.sleep(delay)
    return delay

# Usage
for attempt in range(5):
    try:
        response = make_api_call()
        break
    except RateLimitError:
        delay = exponential_backoff(attempt)
        print(f"Rate limited. Retrying in {delay:.1f}s...")`}
                  </code>
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Best Practices</h2>
              <ul className="space-y-3 text-[#a1a1aa]">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Implement request queuing to smooth out bursts</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Cache responses when possible to reduce API calls</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Monitor rate limit headers proactively</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Use batch processing for multiple similar requests</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Contact us for higher limits if needed</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-blue-400 font-medium">Need higher limits?</span>
              </div>
              <p className="text-[#a1a1aa] text-sm">
                Enterprise customers can request custom rate limits. <Link href="/pricing" className="text-white hover:underline">Contact sales</Link> to discuss your needs.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-16 pt-8 border-t border-white/[0.06] flex justify-between">
            <Link
              href="/docs/guides/prompts"
              className="group text-[#71717a] hover:text-white transition-colors"
            >
              <div className="text-xs mb-1">← Previous</div>
              <div className="text-white text-sm font-medium">Prompt Engineering</div>
            </Link>
            <Link
              href="/docs/sdks/python"
              className="group text-[#71717a] hover:text-white transition-colors text-right"
            >
              <div className="text-xs mb-1">Next →</div>
              <div className="text-white text-sm font-medium">Python SDK</div>
            </Link>
          </div>
        </div>
      </div>
  );
}

