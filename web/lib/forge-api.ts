/**
 * FORGE API Client - Works with Clerk auth
 * Syncs Clerk users to FORGE backend and manages API keys
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ForgeUser {
  id: string;
  clerk_id: string;
  email: string;
  name: string | null;
  forge_token: string;
}

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  key?: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

interface UsageData {
  period: { start: string; end: string };
  tokens_input: number;
  tokens_output: number;
  total_tokens: number;
  total_cost: number;
  request_count: number;
}

interface RateLimits {
  tokens_per_minute: { used: number; limit: number; remaining: number };
  tokens_per_day: { used: number; limit: number; remaining: number };
}

interface Subscription {
  plan: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
}

// Sync Clerk user to FORGE backend and get FORGE token
export async function syncClerkUser(clerkId: string, email: string, name: string | null): Promise<ForgeUser> {
  const response = await fetch(`${API_URL}/auth/clerk-sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clerk_id: clerkId, email, name }),
  });

  if (!response.ok) {
    throw new Error("Failed to sync user with FORGE backend");
  }

  return response.json();
}

// API Keys
export async function getApiKeys(forgeToken: string): Promise<ApiKey[]> {
  const response = await fetch(`${API_URL}/v1/api-keys`, {
    headers: { Authorization: `Bearer ${forgeToken}` },
  });

  if (!response.ok) throw new Error("Failed to fetch API keys");
  return response.json();
}

export async function createApiKey(forgeToken: string, name: string): Promise<ApiKey> {
  const response = await fetch(`${API_URL}/v1/api-keys`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${forgeToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) throw new Error("Failed to create API key");
  return response.json();
}

export async function revokeApiKey(forgeToken: string, keyId: string): Promise<void> {
  const response = await fetch(`${API_URL}/v1/api-keys/${keyId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${forgeToken}` },
  });

  if (!response.ok) throw new Error("Failed to revoke API key");
}

// Usage
export async function getUsage(forgeToken: string): Promise<UsageData> {
  const response = await fetch(`${API_URL}/v1/usage`, {
    headers: { Authorization: `Bearer ${forgeToken}` },
  });

  if (!response.ok) throw new Error("Failed to fetch usage");
  return response.json();
}

export async function getRateLimits(forgeToken: string): Promise<RateLimits> {
  const response = await fetch(`${API_URL}/v1/usage/limits`, {
    headers: { Authorization: `Bearer ${forgeToken}` },
  });

  if (!response.ok) throw new Error("Failed to fetch rate limits");
  return response.json();
}

// Billing
export async function getSubscription(forgeToken: string): Promise<Subscription> {
  const response = await fetch(`${API_URL}/v1/billing/subscription`, {
    headers: { Authorization: `Bearer ${forgeToken}` },
  });

  if (!response.ok) throw new Error("Failed to fetch subscription");
  return response.json();
}

export async function createCheckout(
  forgeToken: string,
  plan: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ checkout_url: string }> {
  const response = await fetch(`${API_URL}/v1/billing/checkout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${forgeToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ plan, success_url: successUrl, cancel_url: cancelUrl }),
  });

  if (!response.ok) throw new Error("Failed to create checkout");
  return response.json();
}

export async function createPortal(
  forgeToken: string,
  returnUrl: string
): Promise<{ portal_url: string }> {
  const response = await fetch(`${API_URL}/v1/billing/portal?return_url=${encodeURIComponent(returnUrl)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${forgeToken}` },
  });

  if (!response.ok) throw new Error("Failed to create portal");
  return response.json();
}
