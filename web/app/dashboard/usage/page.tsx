"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store";
import { getDailyUsage, getUsage } from "@/lib/api";

interface DailyData {
  date: string;
  tokens_input: number;
  tokens_output: number;
  total_tokens: number;
  cost: number;
  requests: number;
}

export default function UsagePage() {
  const { accessToken } = useAuthStore();
  const [daily, setDaily] = useState<DailyData[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (accessToken) {
      Promise.all([getDailyUsage(accessToken, 30), getUsage(accessToken)])
        .then(([dailyData, summaryData]) => {
          setDaily(dailyData.data);
          setSummary(summaryData);
        })
        .finally(() => setLoading(false));
    }
  }, [accessToken]);

  if (loading) {
    return <div className="text-gray-400">Loading...</div>;
  }

  const maxTokens = Math.max(...daily.map((d) => d.total_tokens), 1);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Usage</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm">Input Tokens</div>
          <div className="text-2xl font-bold text-white mt-2">
            {summary?.tokens_input?.toLocaleString() || 0}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm">Output Tokens</div>
          <div className="text-2xl font-bold text-white mt-2">
            {summary?.tokens_output?.toLocaleString() || 0}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm">Total Requests</div>
          <div className="text-2xl font-bold text-white mt-2">
            {summary?.request_count?.toLocaleString() || 0}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm">Total Cost</div>
          <div className="text-2xl font-bold text-white mt-2">
            ${summary?.total_cost?.toFixed(2) || "0.00"}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-6">
          Daily Token Usage (Last 30 Days)
        </h2>
        <div className="h-64 flex items-end gap-1">
          {daily.map((day, i) => (
            <div
              key={day.date}
              className="flex-1 bg-blue-500 rounded-t hover:bg-blue-400 transition-colors"
              style={{
                height: `${(day.total_tokens / maxTokens) * 100}%`,
                minHeight: day.total_tokens > 0 ? "4px" : "0",
              }}
              title={`${day.date}: ${day.total_tokens.toLocaleString()} tokens`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{daily[0]?.date || ""}</span>
          <span>{daily[daily.length - 1]?.date || ""}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">
                Date
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-300">
                Input Tokens
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-300">
                Output Tokens
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-300">
                Requests
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-300">
                Cost
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {daily
              .slice()
              .reverse()
              .map((day) => (
                <tr key={day.date}>
                  <td className="px-6 py-4 text-white">{day.date}</td>
                  <td className="px-6 py-4 text-gray-400 text-right">
                    {day.tokens_input.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-right">
                    {day.tokens_output.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-right">
                    {day.requests.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-right">
                    ${day.cost.toFixed(4)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
