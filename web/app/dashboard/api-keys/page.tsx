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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">API Keys</h1>
      </div>

      {/* Create New Key */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Create New Key</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g., Production)"
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newKeyName.trim()}
            className="px-6 py-2 bg-white text-black rounded font-semibold hover:bg-gray-200 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Key"}
          </button>
        </div>
      </div>

      {/* New Key Display */}
      {showNewKey && (
        <div className="bg-green-500/20 border border-green-500 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-400 mb-2">
            API Key Created
          </h3>
          <p className="text-gray-300 mb-4">
            Copy this key now. You won&apos;t be able to see it again.
          </p>
          <div className="flex gap-2">
            <code className="flex-1 px-4 py-2 bg-gray-900 rounded text-green-400 font-mono text-sm">
              {showNewKey}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(showNewKey);
              }}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              Copy
            </button>
          </div>
          <button
            onClick={() => setShowNewKey(null)}
            className="mt-4 text-gray-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Keys Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">
                Key
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">
                Created
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">
                Last Used
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">
                Status
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {keys.map((key) => (
              <tr key={key.id}>
                <td className="px-6 py-4 text-white">{key.name}</td>
                <td className="px-6 py-4 text-gray-400 font-mono">
                  {key.prefix}...
                </td>
                <td className="px-6 py-4 text-gray-400">
                  {new Date(key.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-gray-400">
                  {key.last_used_at
                    ? new Date(key.last_used_at).toLocaleDateString()
                    : "Never"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      key.is_active
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {key.is_active ? "Active" : "Revoked"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {key.is_active && (
                    <button
                      onClick={() => handleRevoke(key.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {keys.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  No API keys yet. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
