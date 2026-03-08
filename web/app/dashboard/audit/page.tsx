"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { clerkSync, getDashboardScans, getDashboardScan, AuditFinding } from "@/lib/api";

type TabType = "setup" | "results";

interface ScanSummary {
  scan_id: string;
  status: string;
  source_type: string;
  repo_url?: string;
  created_at: string;
  summary?: {
    total_findings: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

interface ScanDetails {
  scan_id: string;
  status: string;
  source_type: string;
  created_at: string;
  completed_at?: string;
  summary: {
    total_findings: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    files_scanned: number;
    lines_of_code: number;
  };
  findings: AuditFinding[];
}

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
  api: `curl -X POST https://api.openframe.co/v1/audit/try \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"code": "your code here", "save": true}'`
};

const severityColors: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500",
};

export default function ForgeAuditDashboard() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>("setup");
  const [codeType, setCodeType] = useState<"cli" | "github" | "api">("cli");
  
  // Real data state
  const [forgeToken, setForgeToken] = useState<string | null>(null);
  const [scans, setScans] = useState<ScanSummary[]>([]);
  const [selectedScan, setSelectedScan] = useState<ScanDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get FORGE token and load scans
  useEffect(() => {
    const loadData = async () => {
      if (!isSignedIn || !user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const email = user.primaryEmailAddress?.emailAddress;
        if (!email) return;
        
        // Get FORGE token
        const syncResult = await clerkSync(user.id, email, user.fullName || undefined);
        setForgeToken(syncResult.forge_token);
        
        // Load scans
        const scanList = await getDashboardScans(syncResult.forge_token);
        setScans(scanList);
        
        // Auto-select first scan if available
        if (scanList.length > 0 && !selectedScan) {
          const details = await getDashboardScan(syncResult.forge_token, scanList[0].scan_id);
          setSelectedScan(details);
        }
      } catch (err: any) {
        console.error("Failed to load audit data:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [isSignedIn, user]);

  const loadScanDetails = async (scanId: string) => {
    if (!forgeToken) return;
    
    try {
      const details = await getDashboardScan(forgeToken, scanId);
      setSelectedScan(details);
    } catch (err: any) {
      console.error("Failed to load scan details:", err);
    }
  };

  const refreshScans = async () => {
    if (!forgeToken) return;
    
    setIsLoading(true);
    try {
      const scanList = await getDashboardScans(forgeToken);
      setScans(scanList);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate totals from selected scan or all scans
  const totals = selectedScan?.summary || scans.reduce((acc, s) => {
    if (s.summary) {
      acc.total_findings += s.summary.total_findings;
      acc.critical += s.summary.critical;
      acc.high += s.summary.high;
      acc.medium += s.summary.medium;
      acc.low += s.summary.low;
    }
    return acc;
  }, { total_findings: 0, critical: 0, high: 0, medium: 0, low: 0 });

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div>
      {/* Header with Logo */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Image src="/forge-logo.png" alt="F" width={28} height={28} className="rounded" />
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
              <span className="text-white font-semibold">{totals.total_findings}</span>
            </div>
            <div className="bg-[#18181b] border border-white/5 rounded-lg p-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs"><span className="w-2 h-2 rounded-full bg-red-500" />Critical</span>
              <span className="text-white font-semibold">{totals.critical}</span>
            </div>
            <div className="bg-[#18181b] border border-white/5 rounded-lg p-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs"><span className="w-2 h-2 rounded-full bg-orange-500" />High</span>
              <span className="text-white font-semibold">{totals.high}</span>
            </div>
            <div className="bg-[#18181b] border border-white/5 rounded-lg p-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs"><span className="w-2 h-2 rounded-full bg-yellow-500" />Med/Low</span>
              <span className="text-white font-semibold">{totals.medium + totals.low}</span>
            </div>
          </div>

          {/* Issues List */}
          <div className="col-span-2 bg-[#18181b] border border-white/5 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-white/5 flex items-center justify-between">
              <span className="text-white/50 text-xs">
                {selectedScan ? `Issues from scan` : "All Issues"}
              </span>
              <button 
                onClick={refreshScans}
                disabled={isLoading}
                className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 disabled:opacity-50"
              >
                <svg className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="p-6 text-center text-white/40 text-sm">Loading...</div>
              ) : selectedScan?.findings && selectedScan.findings.length > 0 ? (
                selectedScan.findings.map((finding, idx) => (
                  <div key={idx} className="p-3 hover:bg-white/[0.02] transition-colors flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${severityColors[finding.severity] || 'bg-gray-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm">{finding.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                      <div className="text-white/40 text-xs">Line {finding.line}</div>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      finding.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                      finding.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      finding.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {finding.severity}
                    </span>
                  </div>
                ))
              ) : scans.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-white/40 text-sm mb-3">No scans yet</p>
                  <Link href="/audit" className="text-xs text-orange-400 hover:text-orange-300">
                    Run your first scan →
                  </Link>
                </div>
              ) : (
                <div className="p-6 text-center text-white/40 text-sm">
                  Select a scan to view issues
                </div>
              )}
            </div>
          </div>

          {/* Recent Scans */}
          <div className="bg-[#18181b] border border-white/5 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-white/5">
              <span className="text-white/50 text-xs">Recent Scans</span>
            </div>
            <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
              {scans.length > 0 ? (
                scans.map((scan) => (
                  <button
                    key={scan.scan_id}
                    onClick={() => loadScanDetails(scan.scan_id)}
                    className={`w-full p-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors text-left ${
                      selectedScan?.scan_id === scan.scan_id ? 'bg-white/[0.04]' : ''
                    }`}
                  >
                    <div>
                      <div className="text-white text-xs">
                        {scan.source_type === 'paste' ? 'Code Paste' : scan.repo_url || 'Scan'}
                      </div>
                      <div className="text-white/30 text-[10px]">{formatTimeAgo(scan.created_at)}</div>
                    </div>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      scan.status === "completed" ? "bg-green-500" : 
                      scan.status === "running" ? "bg-yellow-500 animate-pulse" :
                      scan.status === "failed" ? "bg-red-500" : "bg-gray-500"
                    }`} />
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-white/30 text-xs">
                  No scans yet
                </div>
              )}
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="col-span-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
