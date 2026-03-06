/**
 * FORGE API Client
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ApiOptions {
  method?: string;
  body?: any;
  token?: string;
}

async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || "Request failed");
  }

  return response.json();
}

// Auth
export async function register(email: string, password: string, name?: string) {
  return api("/auth/register", {
    method: "POST",
    body: { email, password, name },
  });
}

export async function login(email: string, password: string) {
  return api<{ access_token: string; refresh_token: string }>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function refreshToken(refreshToken: string) {
  return api<{ access_token: string }>("/auth/refresh", {
    method: "POST",
    body: { refresh_token: refreshToken },
  });
}

export async function getMe(token: string) {
  return api<{ id: string; email: string; name: string }>("/auth/me", { token });
}

// API Keys
export async function getApiKeys(token: string) {
  return api<Array<{
    id: string;
    name: string;
    prefix: string;
    created_at: string;
    last_used_at: string | null;
    is_active: boolean;
  }>>("/v1/api-keys", { token });
}

export async function createApiKey(token: string, name: string) {
  return api<{
    id: string;
    name: string;
    prefix: string;
    key: string;
    created_at: string;
  }>("/v1/api-keys", {
    method: "POST",
    body: { name },
    token,
  });
}

export async function revokeApiKey(token: string, keyId: string) {
  return api(`/v1/api-keys/${keyId}`, {
    method: "DELETE",
    token,
  });
}

// Usage
export async function getUsage(token: string, startDate?: string, endDate?: string) {
  let url = "/v1/usage";
  const params = new URLSearchParams();
  if (startDate) params.set("start_date", startDate);
  if (endDate) params.set("end_date", endDate);
  if (params.toString()) url += `?${params.toString()}`;

  return api<{
    period: { start: string; end: string };
    tokens_input: number;
    tokens_output: number;
    total_tokens: number;
    total_cost: number;
    request_count: number;
  }>(url, { token });
}

export async function getDailyUsage(token: string, days: number = 30) {
  return api<{
    data: Array<{
      date: string;
      tokens_input: number;
      tokens_output: number;
      total_tokens: number;
      cost: number;
      requests: number;
    }>;
  }>(`/v1/usage/daily?days=${days}`, { token });
}

export async function getRateLimits(token: string) {
  return api<{
    tokens_per_minute: { used: number; limit: number; remaining: number };
    tokens_per_day: { used: number; limit: number; remaining: number };
  }>("/v1/usage/limits", { token });
}

// Billing
export async function getSubscription(token: string) {
  return api<{
    plan: string;
    status: string;
    current_period_start: string | null;
    current_period_end: string | null;
  }>("/v1/billing/subscription", { token });
}

export async function createCheckout(token: string, plan: string, successUrl: string, cancelUrl: string) {
  return api<{ checkout_url: string }>("/v1/billing/checkout", {
    method: "POST",
    body: { plan, success_url: successUrl, cancel_url: cancelUrl },
    token,
  });
}

export async function createPortal(token: string, returnUrl: string) {
  return api<{ portal_url: string }>(`/v1/billing/portal?return_url=${encodeURIComponent(returnUrl)}`, {
    method: "POST",
    token,
  });
}
