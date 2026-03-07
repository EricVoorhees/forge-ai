"use client";

import { useState, useEffect, useRef } from "react";
import { useForgeAuth } from "@/lib/use-forge-auth";
import { 
  getRecentCalls, 
  getDailyUsage, 
  getUsage,
  getRateLimits,
  chatCompletion 
} from "@/lib/forge-api";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ApiCall {
  id: string;
  tokens_input: number;
  tokens_output: number;
  total_tokens: number;
  cost: number;
  timestamp: string;
}

interface DailyData {
  date: string;
  tokens_input: number;
  tokens_output: number;
  total_tokens: number;
  cost: number;
  requests: number;
}

export default function PlaygroundPage() {
  const { forgeToken, isLoading: authLoading } = useForgeAuth();
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  
  // Stats state
  const [recentCalls, setRecentCalls] = useState<ApiCall[]>([]);
  const [dailyUsage, setDailyUsage] = useState<DailyData[]>([]);
  const [usage, setUsage] = useState<{ total_tokens: number; total_cost: number; request_count: number } | null>(null);
  const [rateLimits, setRateLimits] = useState<{ tokens_per_minute: { used: number; limit: number }; tokens_per_day: { used: number; limit: number } } | null>(null);
  
  // Settings
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "traffic" | "stats">("chat");

  // Load saved API key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem("forge_playground_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  // Save API key to localStorage when changed
  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem("forge_playground_api_key", key);
    } else {
      localStorage.removeItem("forge_playground_api_key");
    }
  };

  // Load data
  useEffect(() => {
    if (!forgeToken) return;

    const loadData = async () => {
      try {
        const [callsData, dailyData, usageData, limitsData] = await Promise.all([
          getRecentCalls(forgeToken, 20),
          getDailyUsage(forgeToken, 14),
          getUsage(forgeToken),
          getRateLimits(forgeToken),
        ]);
        
        setRecentCalls(callsData.calls);
        setDailyUsage(dailyData.data);
        setUsage(usageData);
        setRateLimits(limitsData);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, [forgeToken]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !apiKey || isGenerating) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);

    try {
      const response = await chatCompletion(
        apiKey,
        [...messages, userMessage],
        { temperature, max_tokens: maxTokens }
      );

      const assistantMessage: Message = {
        role: "assistant",
        content: response.choices[0]?.message?.content || "No response",
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Refresh stats after call
      if (forgeToken) {
        const [callsData, usageData, limitsData] = await Promise.all([
          getRecentCalls(forgeToken, 20),
          getUsage(forgeToken),
          getRateLimits(forgeToken),
        ]);
        setRecentCalls(callsData.calls);
        setUsage(usageData);
        setRateLimits(limitsData);
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${error.message}` },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleString();
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(6)}`;
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Playground</h1>
          <p className="text-zinc-500 text-sm mt-1">Test the FORGE API and monitor your traffic</p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs text-zinc-500">Requests Today</div>
            <div className="text-lg font-medium text-white">{usage?.request_count || 0}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-500">Tokens Used</div>
            <div className="text-lg font-medium text-white">{(usage?.total_tokens || 0).toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-500">Cost (30d)</div>
            <div className="text-lg font-medium text-white">${(usage?.total_cost || 0).toFixed(4)}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#1a1a1a]">
        {[
          { id: "chat", label: "Chat" },
          { id: "traffic", label: "Traffic Log" },
          { id: "stats", label: "Statistics" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "text-white border-b-2 border-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chat Tab */}
      {activeTab === "chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden flex flex-col" style={{ height: "600px" }}>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-zinc-600">
                  <div className="text-center">
                    <div className="text-4xl mb-4">⚡</div>
                    <div className="text-lg font-medium">Start a conversation</div>
                    <div className="text-sm mt-1">Send a message to test the FORGE API</div>
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-white text-black"
                          : "bg-[#18181b] text-zinc-200"
                      }`}
                    >
                      <pre className="whitespace-pre-wrap font-sans text-sm">{msg.content}</pre>
                    </div>
                  </div>
                ))
              )}
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="bg-[#18181b] text-zinc-400 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-zinc-500 rounded-full animate-pulse"></div>
                      <span className="text-sm">Generating...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-[#1a1a1a] p-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 bg-[#18181b] border border-[#27272a] rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                  disabled={isGenerating}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isGenerating || !apiKey}
                  className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
              {!apiKey && (
                <p className="text-xs text-amber-500 mt-2">
                  Enter your API key in the settings panel to use the playground
                </p>
              )}
            </div>
          </div>

          {/* Settings Panel */}
          <div className="space-y-4">
            {/* API Key Input */}
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white">API Key</h3>
                {apiKey && (
                  <span className="text-xs text-green-500">● Connected</span>
                )}
              </div>
              
              {showApiKeyInput || !apiKey ? (
                <div className="space-y-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    placeholder="sk-forge-..."
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-zinc-500 font-mono"
                  />
                  <p className="text-xs text-zinc-500">
                    Paste your full API key. It will be stored locally in your browser.
                  </p>
                  {apiKey && (
                    <button
                      onClick={() => setShowApiKeyInput(false)}
                      className="text-xs text-zinc-400 hover:text-white"
                    >
                      Hide
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <code className="text-sm text-zinc-400 font-mono">
                    {apiKey.slice(0, 12)}...{apiKey.slice(-4)}
                  </code>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowApiKeyInput(true)}
                      className="text-xs text-zinc-400 hover:text-white"
                    >
                      Change
                    </button>
                    <button
                      onClick={() => handleApiKeyChange("")}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Model Settings */}
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
              <h3 className="text-sm font-medium text-white mb-3">Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">
                    Temperature: {temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-white"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">
                    Max Tokens: {maxTokens}
                  </label>
                  <input
                    type="range"
                    min="256"
                    max="8192"
                    step="256"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="w-full accent-white"
                  />
                </div>
              </div>
            </div>

            {/* Rate Limits */}
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
              <h3 className="text-sm font-medium text-white mb-3">Rate Limits</h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-500">Tokens/min</span>
                    <span className="text-zinc-400">
                      {rateLimits?.tokens_per_minute.used.toLocaleString() || 0} / {rateLimits?.tokens_per_minute.limit.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#27272a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, ((rateLimits?.tokens_per_minute.used || 0) / (rateLimits?.tokens_per_minute.limit || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-500">Tokens/day</span>
                    <span className="text-zinc-400">
                      {rateLimits?.tokens_per_day.used.toLocaleString() || 0} / {rateLimits?.tokens_per_day.limit.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#27272a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, ((rateLimits?.tokens_per_day.used || 0) / (rateLimits?.tokens_per_day.limit || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={clearChat}
              className="w-full px-4 py-2 border border-[#27272a] text-zinc-400 text-sm rounded-lg hover:bg-[#18181b] hover:text-white transition-colors"
            >
              Clear Chat
            </button>
          </div>
        </div>
      )}

      {/* Traffic Log Tab */}
      {activeTab === "traffic" && (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#1a1a1a]">
            <h3 className="text-sm font-medium text-white">Recent API Calls</h3>
            <p className="text-xs text-zinc-500 mt-1">Last 20 requests to the FORGE API</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  <th className="text-left text-xs font-medium text-zinc-500 px-4 py-3">Timestamp</th>
                  <th className="text-right text-xs font-medium text-zinc-500 px-4 py-3">Input Tokens</th>
                  <th className="text-right text-xs font-medium text-zinc-500 px-4 py-3">Output Tokens</th>
                  <th className="text-right text-xs font-medium text-zinc-500 px-4 py-3">Total</th>
                  <th className="text-right text-xs font-medium text-zinc-500 px-4 py-3">Cost</th>
                </tr>
              </thead>
              <tbody>
                {recentCalls.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-zinc-600">
                      No API calls yet. Send a message in the Chat tab to get started.
                    </td>
                  </tr>
                ) : (
                  recentCalls.map((call) => (
                    <tr key={call.id} className="border-b border-[#1a1a1a] hover:bg-[#0f0f0f]">
                      <td className="px-4 py-3 text-sm text-zinc-400">{formatTimestamp(call.timestamp)}</td>
                      <td className="px-4 py-3 text-sm text-zinc-300 text-right">{call.tokens_input.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-zinc-300 text-right">{call.tokens_output.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-white text-right font-medium">{call.total_tokens.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-zinc-400 text-right">{formatCost(call.cost)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === "stats" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
              <div className="text-xs text-zinc-500 mb-1">Total Requests</div>
              <div className="text-2xl font-semibold text-white">{usage?.request_count || 0}</div>
            </div>
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
              <div className="text-xs text-zinc-500 mb-1">Total Tokens</div>
              <div className="text-2xl font-semibold text-white">{(usage?.total_tokens || 0).toLocaleString()}</div>
            </div>
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
              <div className="text-xs text-zinc-500 mb-1">Total Cost</div>
              <div className="text-2xl font-semibold text-white">${(usage?.total_cost || 0).toFixed(4)}</div>
            </div>
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
              <div className="text-xs text-zinc-500 mb-1">Avg Tokens/Request</div>
              <div className="text-2xl font-semibold text-white">
                {usage?.request_count ? Math.round((usage.total_tokens || 0) / usage.request_count).toLocaleString() : 0}
              </div>
            </div>
          </div>

          {/* Daily Usage Chart */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
            <h3 className="text-sm font-medium text-white mb-4">Daily Usage (Last 14 Days)</h3>
            
            {dailyUsage.length === 0 ? (
              <div className="text-center py-12 text-zinc-600">
                No usage data yet
              </div>
            ) : (
              <div className="space-y-2">
                {/* Simple bar chart */}
                <div className="flex items-end gap-1 h-40">
                  {dailyUsage.map((day, i) => {
                    const maxTokens = Math.max(...dailyUsage.map((d) => d.total_tokens), 1);
                    const height = (day.total_tokens / maxTokens) * 100;
                    return (
                      <div
                        key={day.date}
                        className="flex-1 bg-white/10 hover:bg-white/20 rounded-t transition-colors relative group"
                        style={{ height: `${Math.max(height, 2)}%` }}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          <div className="font-medium">{day.date}</div>
                          <div>{day.total_tokens.toLocaleString()} tokens</div>
                          <div>{day.requests} requests</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* X-axis labels */}
                <div className="flex gap-1">
                  {dailyUsage.map((day, i) => (
                    <div key={day.date} className="flex-1 text-center text-[10px] text-zinc-600">
                      {i === 0 || i === dailyUsage.length - 1 ? day.date.slice(5) : ""}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Daily Breakdown Table */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#1a1a1a]">
              <h3 className="text-sm font-medium text-white">Daily Breakdown</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1a1a1a]">
                    <th className="text-left text-xs font-medium text-zinc-500 px-4 py-3">Date</th>
                    <th className="text-right text-xs font-medium text-zinc-500 px-4 py-3">Requests</th>
                    <th className="text-right text-xs font-medium text-zinc-500 px-4 py-3">Input Tokens</th>
                    <th className="text-right text-xs font-medium text-zinc-500 px-4 py-3">Output Tokens</th>
                    <th className="text-right text-xs font-medium text-zinc-500 px-4 py-3">Total Tokens</th>
                    <th className="text-right text-xs font-medium text-zinc-500 px-4 py-3">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyUsage.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-zinc-600">
                        No usage data yet
                      </td>
                    </tr>
                  ) : (
                    [...dailyUsage].reverse().map((day) => (
                      <tr key={day.date} className="border-b border-[#1a1a1a] hover:bg-[#0f0f0f]">
                        <td className="px-4 py-3 text-sm text-zinc-300">{day.date}</td>
                        <td className="px-4 py-3 text-sm text-zinc-400 text-right">{day.requests}</td>
                        <td className="px-4 py-3 text-sm text-zinc-400 text-right">{day.tokens_input.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-zinc-400 text-right">{day.tokens_output.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-white text-right font-medium">{day.total_tokens.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-zinc-400 text-right">{formatCost(day.cost)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
