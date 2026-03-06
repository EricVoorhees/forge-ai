# FORGE V1 — Frontend Dashboard Specification

## Overview

The frontend is a Next.js application providing user dashboard, API key management, usage analytics, and billing.

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14 (App Router) |
| Styling | TailwindCSS 3.x |
| Components | Shadcn/ui |
| Icons | Lucide React |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| State | Zustand |
| HTTP Client | Axios / Fetch |

---

## Pages Structure

```
web/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page (/)
│   ├── pricing/
│   │   └── page.tsx            # Pricing page (/pricing)
│   ├── docs/
│   │   └── page.tsx            # Documentation (/docs)
│   ├── login/
│   │   └── page.tsx            # Login (/login)
│   ├── register/
│   │   └── page.tsx            # Register (/register)
│   ├── dashboard/
│   │   ├── layout.tsx          # Dashboard layout
│   │   ├── page.tsx            # Dashboard home (/dashboard)
│   │   ├── api-keys/
│   │   │   └── page.tsx        # API Keys (/dashboard/api-keys)
│   │   ├── usage/
│   │   │   └── page.tsx        # Usage (/dashboard/usage)
│   │   ├── billing/
│   │   │   └── page.tsx        # Billing (/dashboard/billing)
│   │   └── settings/
│   │       └── page.tsx        # Settings (/dashboard/settings)
│   └── api/
│       └── [...proxy]/
│           └── route.ts        # API proxy routes
├── components/
│   ├── ui/                     # Shadcn components
│   ├── landing/                # Landing page components
│   ├── dashboard/              # Dashboard components
│   └── shared/                 # Shared components
├── lib/
│   ├── api.ts                  # API client
│   ├── auth.ts                 # Auth utilities
│   └── utils.ts                # Utility functions
├── hooks/
│   ├── useAuth.ts
│   ├── useApiKeys.ts
│   └── useUsage.ts
└── stores/
    └── authStore.ts            # Zustand auth store
```

---

## Page Specifications

### 1. Landing Page (`/`)

**Purpose:** Marketing, value proposition, CTA to sign up.

**Sections:**
- Hero with headline and CTA
- Features grid
- Code example / demo
- Pricing preview
- Testimonials (future)
- Footer

```tsx
// web/app/page.tsx

import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { CodeDemo } from '@/components/landing/CodeDemo';
import { PricingPreview } from '@/components/landing/PricingPreview';
import { Footer } from '@/components/shared/Footer';

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <Features />
      <CodeDemo />
      <PricingPreview />
      <Footer />
    </main>
  );
}
```

### 2. Pricing Page (`/pricing`)

**Purpose:** Display plans and pricing, enable checkout.

**Components:**
- Plan comparison table
- Feature checklist per plan
- Checkout buttons (Stripe)
- FAQ section

```tsx
// web/app/pricing/page.tsx

import { PricingCards } from '@/components/pricing/PricingCards';
import { PricingFAQ } from '@/components/pricing/PricingFAQ';

const plans = [
  {
    name: 'Free',
    price: '$0',
    tokens: '100K tokens/month',
    features: ['10 requests/min', 'Community support', 'Basic analytics'],
    cta: 'Get Started',
    popular: false
  },
  {
    name: 'Starter',
    price: '$29',
    tokens: '500K tokens/month',
    features: ['30 requests/min', 'Email support', 'Usage analytics', 'API key management'],
    cta: 'Subscribe',
    popular: false
  },
  {
    name: 'Pro',
    price: '$99',
    tokens: '2M tokens/month',
    features: ['60 requests/min', 'Priority support', 'Advanced analytics', 'Multiple API keys'],
    cta: 'Subscribe',
    popular: true
  },
  {
    name: 'Enterprise',
    price: '$299',
    tokens: '10M tokens/month',
    features: ['120 requests/min', 'Dedicated support', 'Custom limits', 'SLA guarantee'],
    cta: 'Contact Sales',
    popular: false
  }
];

export default function PricingPage() {
  return (
    <main className="container mx-auto py-16">
      <h1 className="text-4xl font-bold text-center mb-4">
        Simple, Transparent Pricing
      </h1>
      <p className="text-center text-muted-foreground mb-12">
        Start free, scale as you grow
      </p>
      <PricingCards plans={plans} />
      <PricingFAQ />
    </main>
  );
}
```

### 3. Dashboard Home (`/dashboard`)

**Purpose:** Overview of account status, quick stats.

**Components:**
- Welcome message
- Usage summary card
- Quick actions (create key, view docs)
- Recent activity

```tsx
// web/app/dashboard/page.tsx

import { UsageSummaryCard } from '@/components/dashboard/UsageSummaryCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back!</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <UsageSummaryCard />
        <QuickActions />
      </div>
      
      <RecentActivity />
    </div>
  );
}
```

### 4. API Keys Page (`/dashboard/api-keys`)

**Purpose:** Create, view, and revoke API keys.

**Components:**
- Create key button + modal
- Keys table with actions
- Key creation success modal (show key once)

```tsx
// web/app/dashboard/api-keys/page.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ApiKeysTable } from '@/components/dashboard/ApiKeysTable';
import { CreateKeyDialog } from '@/components/dashboard/CreateKeyDialog';
import { KeyCreatedDialog } from '@/components/dashboard/KeyCreatedDialog';
import { useApiKeys } from '@/hooks/useApiKeys';
import { Plus } from 'lucide-react';

export default function ApiKeysPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const { keys, loading, createKey, revokeKey } = useApiKeys();

  const handleCreate = async (name: string, expiresInDays?: number) => {
    const result = await createKey(name, expiresInDays);
    if (result.key) {
      setNewKey(result.key);
      setCreateOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-muted-foreground">
            Manage your API keys for authentication
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Key
        </Button>
      </div>

      <ApiKeysTable 
        keys={keys} 
        loading={loading} 
        onRevoke={revokeKey} 
      />

      <CreateKeyDialog 
        open={createOpen} 
        onOpenChange={setCreateOpen}
        onCreate={handleCreate}
      />

      <KeyCreatedDialog 
        open={!!newKey}
        onOpenChange={() => setNewKey(null)}
        apiKey={newKey || ''}
      />
    </div>
  );
}
```

### 5. Usage Page (`/dashboard/usage`)

**Purpose:** View token usage, costs, and analytics.

**Components:**
- Usage chart (daily/hourly)
- Usage breakdown table
- Cost summary
- Export button

```tsx
// web/app/dashboard/usage/page.tsx

'use client';

import { useState } from 'react';
import { UsageChart } from '@/components/dashboard/UsageChart';
import { UsageTable } from '@/components/dashboard/UsageTable';
import { UsageStats } from '@/components/dashboard/UsageStats';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { useUsage } from '@/hooks/useUsage';

export default function UsagePage() {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  
  const { usage, loading } = useUsage(dateRange);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Usage</h1>
          <p className="text-muted-foreground">
            Monitor your API usage and costs
          </p>
        </div>
        <DateRangePicker 
          value={dateRange} 
          onChange={setDateRange} 
        />
      </div>

      <UsageStats data={usage?.total} loading={loading} />
      
      <UsageChart data={usage?.data} loading={loading} />
      
      <UsageTable data={usage?.data} loading={loading} />
    </div>
  );
}
```

### 6. Billing Page (`/dashboard/billing`)

**Purpose:** View subscription, manage billing, view invoices.

**Components:**
- Current plan card
- Usage vs limit progress
- Upgrade/downgrade buttons
- Billing portal link
- Invoice history

```tsx
// web/app/dashboard/billing/page.tsx

'use client';

import { CurrentPlanCard } from '@/components/dashboard/CurrentPlanCard';
import { UsageProgressCard } from '@/components/dashboard/UsageProgressCard';
import { BillingActions } from '@/components/dashboard/BillingActions';
import { useSubscription } from '@/hooks/useSubscription';

export default function BillingPage() {
  const { subscription, loading } = useSubscription();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CurrentPlanCard 
          subscription={subscription} 
          loading={loading} 
        />
        <UsageProgressCard 
          usage={subscription?.usage} 
          loading={loading} 
        />
      </div>

      <BillingActions subscription={subscription} />
    </div>
  );
}
```

---

## Key Components

### API Keys Table

```tsx
// web/components/dashboard/ApiKeysTable.tsx

'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Copy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
}

interface ApiKeysTableProps {
  keys: ApiKey[];
  loading: boolean;
  onRevoke: (id: string) => Promise<void>;
}

export function ApiKeysTable({ keys, loading, onRevoke }: ApiKeysTableProps) {
  const copyPrefix = (prefix: string) => {
    navigator.clipboard.writeText(prefix + '...');
    toast.success('Copied to clipboard');
  };

  if (loading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />;
  }

  if (keys.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No API keys yet</p>
        <p className="text-sm text-muted-foreground">
          Create your first API key to get started
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Key</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Last Used</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {keys.map((key) => (
          <TableRow key={key.id}>
            <TableCell className="font-medium">{key.name}</TableCell>
            <TableCell>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {key.prefix}...
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyPrefix(key.prefix)}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </TableCell>
            <TableCell>
              {formatDistanceToNow(new Date(key.created_at), { addSuffix: true })}
            </TableCell>
            <TableCell>
              {key.last_used_at
                ? formatDistanceToNow(new Date(key.last_used_at), { addSuffix: true })
                : 'Never'}
            </TableCell>
            <TableCell>
              <Badge variant={key.is_active ? 'default' : 'secondary'}>
                {key.is_active ? 'Active' : 'Revoked'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {key.is_active && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRevoke(key.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Usage Chart

```tsx
// web/components/dashboard/UsageChart.tsx

'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UsageData {
  date: string;
  total_tokens: number;
  requests: number;
  cost: number;
}

interface UsageChartProps {
  data: UsageData[] | undefined;
  loading: boolean;
}

export function UsageChart({ data, loading }: UsageChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-64 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis 
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip 
              formatter={(value: number) => [`${value.toLocaleString()} tokens`, 'Tokens']}
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
            />
            <Area
              type="monotone"
              dataKey="total_tokens"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

### Key Created Dialog

```tsx
// web/components/dashboard/KeyCreatedDialog.tsx

'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface KeyCreatedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: string;
}

export function KeyCreatedDialog({ open, onOpenChange, apiKey }: KeyCreatedDialogProps) {
  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success('API key copied to clipboard');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>API Key Created</DialogTitle>
          <DialogDescription>
            Copy your API key now. You won't be able to see it again.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <p className="text-sm text-amber-800">
              Store this key securely. It will not be shown again.
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              value={apiKey}
              readOnly
              className="font-mono text-sm"
            />
            <Button onClick={copyKey}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          <Button 
            className="w-full" 
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## API Client

```typescript
// web/lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.forge.ai';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'API request failed');
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{
      access_token: string;
      refresh_token: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, name?: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // API Keys
  async getApiKeys() {
    return this.request<{ data: any[] }>('/v1/api-keys');
  }

  async createApiKey(name: string, expiresInDays?: number) {
    return this.request('/v1/api-keys', {
      method: 'POST',
      body: JSON.stringify({ name, expires_in_days: expiresInDays }),
    });
  }

  async revokeApiKey(id: string) {
    return this.request(`/v1/api-keys/${id}`, {
      method: 'DELETE',
    });
  }

  // Usage
  async getUsage(startDate?: Date, endDate?: Date, granularity = 'day') {
    const params = new URLSearchParams({ granularity });
    if (startDate) params.set('start_date', startDate.toISOString());
    if (endDate) params.set('end_date', endDate.toISOString());
    
    return this.request(`/v1/usage?${params}`);
  }

  // Billing
  async getSubscription() {
    return this.request('/billing/subscription');
  }

  async createCheckout(plan: string) {
    return this.request<{ url: string }>('/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    });
  }

  async getBillingPortal() {
    return this.request<{ url: string }>('/billing/portal');
  }
}

export const api = new ApiClient();
```

---

## Auth Store (Zustand)

```typescript
// web/stores/authStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string | null;
  subscription?: {
    plan: string;
    status: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { access_token, refresh_token } = await api.login(email, password);
          api.setToken(access_token);
          set({ token: access_token, refreshToken: refresh_token });
          await get().fetchUser();
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (email, password, name) => {
        set({ isLoading: true });
        try {
          await api.register(email, password, name);
          // Auto-login after registration
          await get().login(email, password);
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        api.setToken(null);
        set({ user: null, token: null, refreshToken: null });
      },

      fetchUser: async () => {
        const token = get().token;
        if (!token) return;
        
        api.setToken(token);
        try {
          const user = await api.getMe();
          set({ user });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: 'forge-auth',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
```

---

## Environment Variables

```bash
# web/.env.local

NEXT_PUBLIC_API_URL=https://api.forge.ai
NEXT_PUBLIC_APP_URL=https://forge.ai
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

---

## Deployment (Render)

```yaml
# render.yaml (frontend service)

services:
  - type: web
    name: forge-frontend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NEXT_PUBLIC_API_URL
        value: https://api.forge.ai
```

---

## Design System

### Colors (TailwindCSS)

```javascript
// tailwind.config.js

module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
      },
    },
  },
};
```

### Typography

- **Headings:** Inter (font-bold)
- **Body:** Inter (font-normal)
- **Code:** JetBrains Mono

### Spacing

Follow Tailwind's default spacing scale (4px base).
