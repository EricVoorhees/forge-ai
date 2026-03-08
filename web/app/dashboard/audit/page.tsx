"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type TabType = "setup" | "results";

const codeExamples = {
  cli: `# Install the CLI
npm install -g @openframe/audit

# Run a scan
forge-audit scan ./src`,
  github: `# .github/workflows/audit.yml
name: Security Scan
on: [push, pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: openframe/audit-action@v1
        with:
          api-key: \${{ secrets.FORGE_API_KEY }}`,
  api: `curl -X POST https://api.openframe.co/v1/audit \\
  -H "Authorization: Bearer $FORGE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"repo": "github.com/user/repo"}'`
};

const mockIssues = [
  { id: "1", type: "SQL Injection", severity: "critical" as const, file: "auth.ts:45" },
  { id: "2", type: "Weak Crypto", severity: "high" as const, file: "crypto.ts:23" },
  { id: "3", type: "XSS", severity: "high" as const, file: "user.ts:89" },
  { id: "4", type: "CORS Issue", severity: "medium" as const, file: "cors.ts:12" },
];

const severityColors = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500",
};

export default function ForgeAuditDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("setup");
  const [codeType, setCodeType] = useState<"cli" | "github" | "api">("cli");

  return (
    <div>
      {/* Header with Logo */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Image src="/openframe-logo.png" alt="F" width={28} height={28} className="rounded" />
          <h1 className="text-xl font-semibold text-white">Audit</h1>
        </div>
        <Link 
          href="/audit" 
          className="text-sm text-white/50 hover:text-white flex items-center gap-1 transition-colors"
        >
          View landing page
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-[#18181b] p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("setup")}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${
            activeTab === "setup" ? "bg-white/10 text-white" : "text-white/50 hover:text-white"
          }`}
        >
          Setup
        </button>
        <button
          onClick={() => setActiveTab("results")}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${
            activeTab === "results" ? "bg-white/10 text-white" : "text-white/50 hover:text-white"
          }`}
        >
          Results
        </button>
      </div>

      {activeTab === "setup" ? (
        <div className="grid grid-cols-2 gap-6">
          {/* Code Setup */}
          <div className="bg-[#18181b] border border-white/5 rounded-xl overflow-hidden">
            <div className="flex items-center gap-1 p-2 border-b border-white/5 bg-[#0c0c0e]">
              {(["cli", "github", "api"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setCodeType(type)}
                  className={`px-3 py-1.5 text-xs rounded transition-colors uppercase ${
                    codeType === type ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                  }`}
                >
                  {type === "cli" ? "CLI" : type === "github" ? "GitHub" : "API"}
                </button>
              ))}
            </div>
            <pre className="p-4 text-sm font-mono text-white/80 overflow-x-auto">
              <code>{codeExamples[codeType]}</code>
            </pre>
          </div>

          {/* Quick Start */}
          <div className="space-y-4">
            <div className="bg-[#18181b] border border-white/5 rounded-xl p-4">
              <h3 className="text-white text-sm font-medium mb-3">Quick Start</h3>
              <ol className="space-y-2 text-sm text-white/60">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  Install the CLI or add GitHub Action
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  Configure your API key
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  Run your first scan
                </li>
              </ol>
            </div>

            <div className="bg-[#18181b] border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white text-sm font-medium">API Key</h3>
                <button className="text-xs text-orange-400 hover:text-orange-300">Copy</button>
              </div>
              <div className="bg-[#0c0c0e] rounded-lg px-3 py-2 font-mono text-xs text-white/50 flex items-center gap-2">
                <span className="text-orange-400/80">sk-audit-</span>
                <span>••••••••••••••••</span>
              </div>
            </div>

            <Link 
              href="/audit-docs" 
              className="block bg-[#18181b] border border-white/5 rounded-xl p-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white text-sm font-medium mb-1">Documentation</h3>
                  <p className="text-white/40 text-xs">Full setup guide and API reference</p>
                </div>
                <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {/* Stats */}
          <div className="col-span-3 grid grid-cols-4 gap-3 mb-2">
            <div className="bg-[#18181b] border border-white/5 rounded-lg p-3 flex items-center justify-between">
              <span className="text-white/50 text-xs">Total</span>
              <span className="text-white font-semibold">{mockIssues.length}</span>
            </div>
            <div className="bg-[#18181b] border border-white/5 rounded-lg p-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs"><span className="w-2 h-2 rounded-full bg-red-500" />Critical</span>
              <span className="text-white font-semibold">1</span>
            </div>
            <div className="bg-[#18181b] border border-white/5 rounded-lg p-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs"><span className="w-2 h-2 rounded-full bg-orange-500" />High</span>
              <span className="text-white font-semibold">2</span>
            </div>
            <div className="bg-[#18181b] border border-white/5 rounded-lg p-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs"><span className="w-2 h-2 rounded-full bg-yellow-500" />Med/Low</span>
              <span className="text-white font-semibold">1</span>
            </div>
          </div>

          {/* Issues List */}
          <div className="col-span-2 bg-[#18181b] border border-white/5 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-white/5 flex items-center justify-between">
              <span className="text-white/50 text-xs">Issues</span>
              <button className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Rescan
              </button>
            </div>
            <div className="divide-y divide-white/5">
              {mockIssues.map((issue) => (
                <div key={issue.id} className="p-3 hover:bg-white/[0.02] transition-colors flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${severityColors[issue.severity]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm">{issue.type}</div>
                    <div className="text-white/40 text-xs">{issue.file}</div>
                  </div>
                  <button className="text-xs text-white/40 hover:text-white px-2 py-1 rounded hover:bg-white/5">
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Scans */}
          <div className="bg-[#18181b] border border-white/5 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-white/5">
              <span className="text-white/50 text-xs">Recent Scans</span>
            </div>
            <div className="divide-y divide-white/5">
              {[
                { repo: "api-server", time: "2h ago", status: "done" },
                { repo: "web-client", time: "1d ago", status: "done" },
                { repo: "ml-pipeline", time: "3d ago", status: "running" },
              ].map((scan, i) => (
                <div key={i} className="p-3 flex items-center justify-between">
                  <div>
                    <div className="text-white text-xs">{scan.repo}</div>
                    <div className="text-white/30 text-[10px]">{scan.time}</div>
                  </div>
                  <span className={`w-1.5 h-1.5 rounded-full ${scan.status === "done" ? "bg-green-500" : "bg-yellow-500 animate-pulse"}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
