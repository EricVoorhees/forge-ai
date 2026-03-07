"use client";

import Link from "next/link";

export default function AuditMethodsPage() {
  return (
    <div className="pt-8 pb-16 px-8 lg:px-16">
      <div className="max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link href="/docs" className="text-[#71717a] hover:text-white transition-colors">Docs</Link>
          <span className="text-[#52525b]">/</span>
          <Link href="/audit-docs" className="text-[#71717a] hover:text-white transition-colors">Forge Audit</Link>
          <span className="text-[#52525b]">/</span>
          <span className="text-white">Input Methods</span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">Input Methods</h1>
        <p className="text-[#a1a1aa] text-lg mb-8 leading-relaxed">
          Forge Audit supports multiple ways to submit code for analysis. Choose the method that best fits your workflow.
        </p>

        {/* Paste Code */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            Paste Code
          </h2>
          <p className="text-[#a1a1aa] mb-4 leading-relaxed">
            The quickest way to analyze code. Simply copy and paste your code directly into the editor.
          </p>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 mb-4">
            <h4 className="text-white font-medium mb-2">Best for:</h4>
            <ul className="space-y-2 text-[#a1a1aa] text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Quick one-off security checks
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Reviewing code snippets from pull requests
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Testing specific functions or modules
              </li>
            </ul>
          </div>
          <p className="text-[#71717a] text-sm">
            <strong className="text-white">Tip:</strong> The editor supports syntax highlighting and line numbers for easier navigation.
          </p>
        </section>

        {/* Upload Files */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            Upload Files
          </h2>
          <p className="text-[#a1a1aa] mb-4 leading-relaxed">
            Drag and drop files or click to select from your computer. Supports multiple files at once.
          </p>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 mb-4">
            <h4 className="text-white font-medium mb-2">Supported file types:</h4>
            <div className="flex flex-wrap gap-2">
              {[".js", ".jsx", ".ts", ".tsx", ".py", ".go", ".rs", ".sol", ".java", ".cpp", ".c", ".rb", ".php"].map((ext) => (
                <span key={ext} className="px-2 py-1 bg-[#18181b] border border-[#27272a] rounded text-xs font-mono text-[#a1a1aa]">
                  {ext}
                </span>
              ))}
            </div>
          </div>
          <p className="text-[#71717a] text-sm">
            <strong className="text-white">Tip:</strong> You can upload entire directories by selecting multiple files. The audit will analyze all files together for cross-file vulnerabilities.
          </p>
        </section>

        {/* GitHub */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </div>
            GitHub
          </h2>
          <p className="text-[#a1a1aa] mb-4 leading-relaxed">
            Connect directly to a GitHub repository. Analyze any public repo or your private repos with authentication.
          </p>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 mb-4">
            <h4 className="text-white font-medium mb-3">Configuration options:</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-orange-400 font-mono shrink-0">Repository URL</span>
                <span className="text-[#71717a]">The full GitHub URL (e.g., https://github.com/user/repo)</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-orange-400 font-mono shrink-0">Branch</span>
                <span className="text-[#71717a]">The branch to analyze (defaults to main/master)</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-orange-400 font-mono shrink-0">Path</span>
                <span className="text-[#71717a]">Optional subdirectory to limit the scan scope</span>
              </div>
            </div>
          </div>
        </section>

        {/* CI/CD */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            CI/CD Integration
          </h2>
          <p className="text-[#a1a1aa] mb-4 leading-relaxed">
            Automate security checks in your pipeline. Get ready-to-use configuration snippets for popular CI/CD platforms.
          </p>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 mb-4">
            <h4 className="text-white font-medium mb-3">Supported platforms:</h4>
            <div className="grid grid-cols-2 gap-3">
              {["GitHub Actions", "GitLab CI", "Jenkins", "CircleCI"].map((platform) => (
                <div key={platform} className="flex items-center gap-2 text-[#a1a1aa]">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {platform}
                </div>
              ))}
            </div>
          </div>
          <Link href="/audit-docs/cicd" className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors">
            View full CI/CD integration guide
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </section>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-8 border-t border-white/[0.06]">
          <Link href="/audit-docs/quickstart" className="flex items-center gap-2 text-[#71717a] hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quickstart
          </Link>
          <Link href="/audit-docs/cicd" className="flex items-center gap-2 text-[#71717a] hover:text-white transition-colors">
            CI/CD Integration
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

