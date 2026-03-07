"use client";

import { useEffect, useState, useCallback } from "react";
import { useForgeAuth } from "@/lib/use-forge-auth";
import { getApiKeys, createApiKey, revokeApiKey } from "@/lib/forge-api";

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

export default function ApiKeysPage() {
  const { forgeToken, isLoading: authLoading } = useForgeAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [showNewKey, setShowNewKey] = useState<string | null>(null);

  const loadKeys = useCallback(async () => {
    if (forgeToken) {
      try {
        const data = await getApiKeys(forgeToken);
        setKeys(data);
      } catch (err) {
        console.error("Failed to load keys:", err);
      }
      setLoading(false);
    }
  }, [forgeToken]);

  useEffect(() => {
    if (forgeToken) {
      loadKeys();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [forgeToken, authLoading, loadKeys]);

  const handleCreate = async () => {
    if (!forgeToken || !newKeyName.trim()) return;
    setCreating(true);
    try {
      const result = await createApiKey(forgeToken, newKeyName.trim());
      setShowNewKey(result.key || null);
      setNewKeyName("");
      await loadKeys();
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (keyId: string) => {
    if (!forgeToken) return;
    if (!confirm("Are you sure you want to revoke this API key?")) return;
    await revokeApiKey(forgeToken, keyId);
    await loadKeys();
  };

  if (authLoading || loading) {
    return <div className="text-zinc-400">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white tracking-tight">API Keys</h1>

      {/* Create New Key */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Create New Key</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g., Production)"
            className="flex-1 px-4 py-3 bg-[#000000] border border-[#27272a] rounded-lg text-white placeholder:text-[#52525b] focus:outline-none focus:border-[#3f3f46] transition-colors"
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newKeyName.trim()}
            className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 disabled:opacity-50 transition-colors"
          >
            {creating ? "Creating..." : "Create Key"}
          </button>
        </div>
      </div>

      {/* New Key Display */}
      {showNewKey && (
        <div className="bg-[#0a0a0a] border border-[#22c55e]/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[#22c55e] mb-2">
            API Key Created
          </h3>
          <p className="text-[#a1a1aa] mb-4">
            Copy this key now. You won&apos;t be able to see it again.
          </p>
          <div className="flex gap-2">
            <code className="flex-1 px-4 py-3 bg-[#000000] border border-[#1a1a1a] rounded-lg text-[#22c55e] font-mono text-sm">
              {showNewKey}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(showNewKey);
              }}
              className="px-4 py-3 bg-[#18181b] text-white rounded-lg hover:bg-[#27272a] transition-colors"
            >
              Copy
            </button>
          </div>
          <button
            onClick={() => setShowNewKey(null)}
            className="mt-4 text-[#71717a] hover:text-white text-sm transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Keys List */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-[#1a1a1a]">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-[#71717a]">
                Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-[#71717a]">
                Key
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-[#71717a]">
                Created
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-[#71717a]">
                Last Used
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-[#71717a]">
                Status
              </th>
              <th className="px-6 py-4 text-right text-sm font-medium text-[#71717a]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1a]">
            {keys.map((key) => (
              <tr key={key.id} className="hover:bg-[#0f0f0f] transition-colors">
                <td className="px-6 py-4 text-white font-medium">{key.name}</td>
                <td className="px-6 py-4 text-[#71717a] font-mono text-sm">
                  {key.prefix}...
                </td>
                <td className="px-6 py-4 text-[#a1a1aa]">
                  {new Date(key.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-[#a1a1aa]">
                  {key.last_used_at
                    ? new Date(key.last_used_at).toLocaleDateString()
                    : "Never"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      key.is_active
                        ? "bg-[#22c55e]/10 text-[#22c55e]"
                        : "bg-[#ef4444]/10 text-[#ef4444]"
                    }`}
                  >
                    {key.is_active ? "Active" : "Revoked"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {key.is_active && (
                    <button
                      onClick={() => handleRevoke(key.id)}
                      className="text-[#ef4444] hover:text-[#f87171] text-sm font-medium transition-colors"
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {keys.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="text-[#3f3f46] mb-3">
                    <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <p className="text-[#71717a]">No API keys yet. Create one to get started.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
