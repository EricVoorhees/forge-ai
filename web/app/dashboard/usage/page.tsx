"use client";

import { useEffect, useState } from "react";
import { useForgeAuth } from "@/lib/use-forge-auth";
import { getUsage } from "@/lib/forge-api";

interface UsageData {
  period: { start: string; end: string };
  tokens_input: number;
  tokens_output: number;
  total_tokens: number;
  total_cost: number;
  request_count: number;
}

export default function UsagePage() {
  const { forgeToken, isLoading: authLoading } = useForgeAuth();
  const [summary, setSummary] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (forgeToken) {
      getUsage(forgeToken)
        .then(setSummary)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [forgeToken, authLoading]);

  if (authLoading || loading) {
    return <div className="text-[#71717a]">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white tracking-tight">Usage</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
          <div className="text-[#71717a] text-sm">Input Tokens</div>
          <div className="text-2xl font-semibold text-white mt-2">
            {summary?.tokens_input?.toLocaleString() || 0}
          </div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
          <div className="text-[#71717a] text-sm">Output Tokens</div>
          <div className="text-2xl font-semibold text-white mt-2">
            {summary?.tokens_output?.toLocaleString() || 0}
          </div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
          <div className="text-[#71717a] text-sm">Total Requests</div>
          <div className="text-2xl font-semibold text-white mt-2">
            {summary?.request_count?.toLocaleString() || 0}
          </div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
          <div className="text-[#71717a] text-sm">Total Cost</div>
          <div className="text-2xl font-semibold text-white mt-2">
            ${summary?.total_cost?.toFixed(2) || "0.00"}
          </div>
        </div>
      </div>

      {/* Usage Period */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Current Period
        </h2>
        <div className="flex items-center gap-4 text-[#a1a1aa]">
          <div>
            <span className="text-[#71717a] text-sm">From:</span>{" "}
            <span className="text-white">
              {summary?.period?.start ? new Date(summary.period.start).toLocaleDateString() : "—"}
            </span>
          </div>
          <div className="text-[#3f3f46]">→</div>
          <div>
            <span className="text-[#71717a] text-sm">To:</span>{" "}
            <span className="text-white">
              {summary?.period?.end ? new Date(summary.period.end).toLocaleDateString() : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Token Breakdown */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-6">
          Token Breakdown
        </h2>
        <div className="space-y-4">
          {/* Input tokens bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#a1a1aa]">Input Tokens</span>
              <span className="text-white font-medium">
                {summary?.tokens_input?.toLocaleString() || 0}
              </span>
            </div>
            <div className="h-2 bg-[#18181b] rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{
                  width: `${summary?.total_tokens ? (summary.tokens_input / summary.total_tokens) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
          
          {/* Output tokens bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#a1a1aa]">Output Tokens</span>
              <span className="text-white font-medium">
                {summary?.tokens_output?.toLocaleString() || 0}
              </span>
            </div>
            <div className="h-2 bg-[#18181b] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#71717a] rounded-full"
                style={{
                  width: `${summary?.total_tokens ? (summary.tokens_output / summary.total_tokens) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Total */}
        <div className="mt-6 pt-4 border-t border-[#1a1a1a] flex justify-between">
          <span className="text-[#a1a1aa]">Total Tokens</span>
          <span className="text-white font-semibold">
            {summary?.total_tokens?.toLocaleString() || 0}
          </span>
        </div>
      </div>

      {/* Empty state if no usage */}
      {(!summary || summary.total_tokens === 0) && (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-12 text-center">
          <div className="text-[#3f3f46] mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-white font-medium mb-2">No usage yet</h3>
          <p className="text-[#71717a] text-sm">
            Start making API requests to see your usage statistics here.
          </p>
        </div>
      )}
    </div>
  );
}
