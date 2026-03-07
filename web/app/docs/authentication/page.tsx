"use client";

import Link from "next/link";

export default function AuthenticationPage() {
  return (
    <div className="pt-8 pb-16 px-8 lg:px-16">
        <div className="max-w-3xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-8">
            <Link href="/docs" className="text-[#71717a] hover:text-white transition-colors">Docs</Link>
            <span className="text-[#52525b]">/</span>
            <span className="text-white">Authentication</span>
          </div>

          {/* Header */}
          <h1 className="text-white text-4xl font-semibold tracking-tight mb-4">
            Authentication
          </h1>
          <p className="text-[#a1a1aa] text-lg leading-relaxed mb-12">
            Secure your API requests with API keys.
          </p>

          {/* Content */}
          <div className="space-y-12">
            <div>
              <h2 className="text-white text-xl font-medium mb-4">API Keys</h2>
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                All API requests require authentication using an API key. You can create and manage API keys from your <Link href="/dashboard" className="text-white hover:underline">dashboard</Link>.
              </p>
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                API keys are prefixed with <code className="bg-white/[0.06] px-1.5 py-0.5 rounded text-white/80">sk-forge-</code> and should be kept secret. Never expose your API key in client-side code or public repositories.
              </p>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Using Your API Key</h2>
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                Include your API key in the <code className="bg-white/[0.06] px-1.5 py-0.5 rounded text-white/80">Authorization</code> header as a Bearer token:
              </p>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <span className="text-[#71717a]">Authorization:</span> <span className="text-[#a1a1aa]">Bearer sk-forge-your-api-key</span>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Environment Variables</h2>
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                We recommend storing your API key in an environment variable:
              </p>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden mb-4">
                <div className="flex items-center px-4 py-2 border-b border-white/[0.06]">
                  <span className="text-[#71717a] text-xs">.env</span>
                </div>
                <pre className="p-4 font-mono text-sm">
                  <code className="text-[#a1a1aa]">FORGE_API_KEY=sk-forge-your-api-key</code>
                </pre>
              </div>
              <p className="text-[#a1a1aa] leading-relaxed">
                Then access it in your code:
              </p>
              <div className="bg-[#111113] border border-white/[0.06] rounded-lg overflow-hidden mt-4">
                <div className="flex items-center px-4 py-2 border-b border-white/[0.06]">
                  <span className="text-[#71717a] text-xs">Python</span>
                </div>
                <pre className="p-4 font-mono text-sm">
                  <code className="text-[#a1a1aa]">{`import os

api_key = os.environ.get("FORGE_API_KEY")`}</code>
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-medium mb-4">Security Best Practices</h2>
              <ul className="space-y-3 text-[#a1a1aa]">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Store API keys in environment variables, not in code</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Add <code className="bg-white/[0.06] px-1 rounded">.env</code> to your <code className="bg-white/[0.06] px-1 rounded">.gitignore</code></span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Use separate API keys for development and production</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Rotate keys periodically and revoke unused keys</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Never expose API keys in client-side JavaScript</span>
                </li>
              </ul>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-amber-400 font-medium">Important</span>
              </div>
              <p className="text-[#a1a1aa] text-sm">
                If you believe your API key has been compromised, revoke it immediately from your dashboard and create a new one.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-16 pt-8 border-t border-white/[0.06] flex justify-between">
            <Link
              href="/docs/quickstart"
              className="group text-[#71717a] hover:text-white transition-colors"
            >
              <div className="text-xs mb-1">← Previous</div>
              <div className="text-white text-sm font-medium">Quickstart</div>
            </Link>
            <Link
              href="/docs/api/chat"
              className="group text-[#71717a] hover:text-white transition-colors text-right"
            >
              <div className="text-xs mb-1">Next →</div>
              <div className="text-white text-sm font-medium">Chat Completions</div>
            </Link>
          </div>
        </div>
      </div>
  );
}

