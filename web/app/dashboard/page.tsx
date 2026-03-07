"use client";

import { useEffect, useState } from "react";
import { useForgeAuth } from "@/lib/use-forge-auth";
import { getUsage, getRateLimits } from "@/lib/forge-api";

export default function DashboardPage() {
  const { forgeToken, isLoading: authLoading } = useForgeAuth();
  const [usage, setUsage] = useState<any>(null);
  const [limits, setLimits] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (forgeToken) {
      Promise.all([
        getUsage(forgeToken),
        getRateLimits(forgeToken),
      ])
        .then(([usageData, limitsData]) => {
          setUsage(usageData);
          setLimits(limitsData);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [forgeToken, authLoading]);

  if (authLoading || loading) {
    return <div className="text-zinc-400">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white tracking-tight">Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
          <div className="text-[#71717a] text-sm">Total Tokens (30d)</div>
          <div className="text-3xl font-semibold text-white mt-2">
            {usage?.total_tokens?.toLocaleString() || 0}
          </div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
          <div className="text-[#71717a] text-sm">Requests (30d)</div>
          <div className="text-3xl font-semibold text-white mt-2">
            {usage?.request_count?.toLocaleString() || 0}
          </div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
          <div className="text-[#71717a] text-sm">Cost (30d)</div>
          <div className="text-3xl font-semibold text-white mt-2">
            ${usage?.total_cost?.toFixed(2) || "0.00"}
          </div>
        </div>
      </div>

      {/* Rate Limits */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Rate Limits</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#a1a1aa]">Tokens per minute</span>
              <span className="text-white font-medium">
                {limits?.tokens_per_minute?.used?.toLocaleString() || 0} /{" "}
                {limits?.tokens_per_minute?.limit?.toLocaleString() || 0}
              </span>
            </div>
            <div className="h-2 bg-[#18181b] rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{
                  width: `${
                    ((limits?.tokens_per_minute?.used || 0) /
                      (limits?.tokens_per_minute?.limit || 1)) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#a1a1aa]">Tokens per day</span>
              <span className="text-white font-medium">
                {limits?.tokens_per_day?.used?.toLocaleString() || 0} /{" "}
                {limits?.tokens_per_day?.limit?.toLocaleString() || 0}
              </span>
            </div>
            <div className="h-2 bg-[#18181b] rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{
                  width: `${
                    ((limits?.tokens_per_day?.used || 0) /
                      (limits?.tokens_per_day?.limit || 1)) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Start</h2>
        <pre className="bg-[#000000] border border-[#1a1a1a] p-4 rounded-lg text-sm text-[#a1a1aa] overflow-x-auto font-mono">
{`curl https://forge-api-a7pi.onrender.com/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "forge-671b",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}
        </pre>
      </div>
    </div>
  );
}
