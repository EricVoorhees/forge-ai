# FORGE V1 — System Architecture

## Overview

FORGE is a production-ready AI inference platform exposing a 400B Sparse MoE model via a professional, OpenAI-compatible API.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FORGE PLATFORM                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────────────────┐   │
│   │   Frontend   │────▶│  API Server  │────▶│    Inference Node(s)     │   │
│   │   (Next.js)  │     │  (FastAPI)   │     │    (vLLM + GPU)          │   │
│   └──────────────┘     └──────┬───────┘     └──────────────────────────┘   │
│                               │                                              │
│                    ┌──────────┴──────────┐                                  │
│                    │                     │                                  │
│              ┌─────▼─────┐        ┌──────▼──────┐                           │
│              │ PostgreSQL│        │    Redis    │                           │
│              │ (persist) │        │   (cache)   │                           │
│              └───────────┘        └─────────────┘                           │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                    Monitoring (Prometheus + Grafana)                  │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Systems

### 1. Frontend (Next.js + TailwindCSS + Shadcn)

| Responsibility | Description |
|----------------|-------------|
| Landing Page | Marketing, pricing, signup |
| User Dashboard | Account management |
| API Key Management | Create, revoke, view keys |
| Usage Dashboard | Token consumption, costs |
| Billing Page | Subscription management via Stripe |

**Deployment:** Render (Static/SSR)

---

### 2. API Server (FastAPI)

The central brain of FORGE. Handles all business logic.

| Responsibility | Description |
|----------------|-------------|
| Authentication | JWT-based user auth |
| API Key Validation | Hash-based key verification |
| Rate Limiting | Token bucket via Redis |
| Usage Tracking | Log every request to PostgreSQL |
| Request Forwarding | Proxy to vLLM inference nodes |
| Streaming | SSE token streaming to clients |
| Billing Integration | Stripe webhook handling |

**Endpoints:**
```
POST /v1/chat/completions    # OpenAI-compatible chat
POST /v1/completions         # OpenAI-compatible completion
GET  /v1/models              # List available models
GET  /v1/usage               # User usage stats
POST /v1/api-keys            # Create API key
DELETE /v1/api-keys/{id}     # Revoke API key
GET  /v1/api-keys            # List user's API keys
POST /auth/register          # User registration
POST /auth/login             # User login
POST /auth/refresh           # Token refresh
POST /billing/webhook        # Stripe webhooks
GET  /billing/portal         # Stripe customer portal
```

**Deployment:** Render (Docker)

---

### 3. Database (PostgreSQL)

Persistent storage for all platform data.

**Tables:**
- `users` — User accounts
- `api_keys` — Hashed API keys
- `usage_records` — Per-request token logs
- `subscriptions` — Stripe subscription state
- `rate_limit_overrides` — Custom rate limits per user

**Deployment:** Render Managed PostgreSQL

---

### 4. Cache (Redis)

Fast, in-memory operations.

| Use Case | Description |
|----------|-------------|
| Rate Limiting | Token bucket counters |
| Session Cache | JWT blacklist |
| Request Throttling | Per-key request counts |
| Temporary State | Pending operations |

**Deployment:** Render Managed Redis

---

### 5. Inference Node (vLLM)

GPU-powered model serving.

| Component | Description |
|-----------|-------------|
| Model | Qwen 3.5 400B Sparse MoE |
| Engine | vLLM with tensor parallelism |
| Hardware | 8x H100 80GB GPUs |
| Provider | RunPod |

**vLLM Launch Command:**
```bash
python -m vllm.entrypoints.openai.api_server \
  --model /models/qwen-400b \
  --tensor-parallel-size 8 \
  --gpu-memory-utilization 0.95 \
  --max-model-len 32768 \
  --host 0.0.0.0 \
  --port 8000
```

**Internal Endpoint:** `http://gpu-node:8000/v1/chat/completions`

---

### 6. Monitoring (Prometheus + Grafana)

| Metric | Description |
|--------|-------------|
| GPU Utilization | Per-GPU load percentage |
| Tokens/sec | Inference throughput |
| Request Latency | P50, P95, P99 latencies |
| Request Rate | Requests per second |
| Error Rate | 4xx/5xx responses |
| Queue Depth | Pending requests |
| Expert Utilization | MoE expert activation patterns |

**Deployment:** Self-hosted or Grafana Cloud

---

## Request Flow

```
┌────────┐
│ Client │
└───┬────┘
    │ HTTPS Request
    ▼
┌─────────────────────────────────────┐
│           API Server                │
│  ┌─────────────────────────────┐   │
│  │ 1. Validate API Key         │   │
│  │    (hash lookup in DB)      │   │
│  └──────────────┬──────────────┘   │
│                 ▼                   │
│  ┌─────────────────────────────┐   │
│  │ 2. Check Rate Limit         │   │
│  │    (Redis token bucket)     │   │
│  └──────────────┬──────────────┘   │
│                 ▼                   │
│  ┌─────────────────────────────┐   │
│  │ 3. Forward to vLLM          │   │
│  │    (HTTP proxy)             │   │
│  └──────────────┬──────────────┘   │
└─────────────────┼───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│         Inference Node              │
│  ┌─────────────────────────────┐   │
│  │ 4. vLLM processes request   │   │
│  │    - Sparse MoE routing     │   │
│  │    - Token generation       │   │
│  │    - Streaming response     │   │
│  └──────────────┬──────────────┘   │
└─────────────────┼───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│           API Server                │
│  ┌─────────────────────────────┐   │
│  │ 5. Stream tokens to client  │   │
│  └──────────────┬──────────────┘   │
│                 ▼                   │
│  ┌─────────────────────────────┐   │
│  │ 6. Record usage             │   │
│  │    (PostgreSQL + Redis)     │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## Technology Stack (Locked for V1)

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | Next.js | 14.x |
| UI Components | Shadcn/ui | Latest |
| Styling | TailwindCSS | 3.x |
| API Server | FastAPI | 0.109+ |
| Database | PostgreSQL | 15+ |
| Cache | Redis | 7+ |
| Inference | vLLM | 0.4+ |
| Model | Qwen 3.5 400B MoE | - |
| GPU | NVIDIA H100 80GB | 8x |
| Billing | Stripe | API v2024 |
| Monitoring | Prometheus + Grafana | - |
| Deployment | Render + RunPod | - |

---

## Repository Structure

```
forge/
├── api/                      # FastAPI backend
│   ├── main.py              # Application entry
│   ├── config.py            # Environment config
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── completions.py   # /v1/completions, /v1/chat/completions
│   │   ├── models.py        # /v1/models
│   │   ├── usage.py         # /v1/usage
│   │   └── api_keys.py      # /v1/api-keys
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── jwt.py           # JWT utilities
│   │   ├── routes.py        # /auth/* endpoints
│   │   └── dependencies.py  # Auth dependencies
│   ├── billing/
│   │   ├── __init__.py
│   │   ├── stripe.py        # Stripe client
│   │   └── routes.py        # /billing/* endpoints
│   ├── db/
│   │   ├── __init__.py
│   │   ├── database.py      # SQLAlchemy setup
│   │   ├── models.py        # ORM models
│   │   └── migrations/      # Alembic migrations
│   ├── services/
│   │   ├── __init__.py
│   │   ├── inference.py     # vLLM client
│   │   ├── rate_limiter.py  # Redis rate limiting
│   │   └── usage.py         # Usage tracking
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── openai.py        # OpenAI-compatible schemas
│   │   ├── auth.py          # Auth request/response
│   │   └── billing.py       # Billing schemas
│   ├── middleware/
│   │   ├── __init__.py
│   │   ├── auth.py          # Auth middleware
│   │   └── logging.py       # Request logging
│   ├── requirements.txt
│   └── Dockerfile
│
├── web/                      # Next.js frontend
│   ├── app/
│   │   ├── page.tsx         # Landing page
│   │   ├── dashboard/
│   │   ├── api-keys/
│   │   ├── usage/
│   │   └── billing/
│   ├── components/
│   │   ├── ui/              # Shadcn components
│   │   └── ...
│   ├── lib/
│   ├── package.json
│   └── Dockerfile
│
├── inference/                # vLLM inference node
│   ├── Dockerfile
│   ├── run_vllm.sh
│   └── config.yaml
│
├── db/                       # Database schemas
│   ├── schema.sql
│   └── migrations/
│
├── infra/                    # Infrastructure configs
│   ├── runpod/
│   │   └── deploy_gpu.sh
│   └── render/
│       └── render.yaml
│
├── monitoring/               # Observability
│   ├── prometheus.yml
│   └── grafana/
│       └── dashboards/
│
├── scripts/                  # Utility scripts
│   ├── setup.sh
│   └── seed_db.py
│
├── tests/                    # Test suites
│   ├── api/
│   ├── integration/
│   └── load/
│
├── sdks/                     # Client SDKs (future)
│   ├── python/
│   └── node/
│
├── docs/                     # Documentation
│   ├── ARCHITECTURE.md
│   ├── API_SPEC.md
│   ├── DATABASE.md
│   ├── DEPLOYMENT.md
│   └── ...
│
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## Scaling Strategy

### V1 (Launch)
- 1 API server instance
- 1 GPU node (8x H100)
- Single PostgreSQL instance
- Single Redis instance

### V2 (Growth)
- Multiple API server instances behind load balancer
- Multiple GPU nodes with request routing
- PostgreSQL read replicas
- Redis cluster

### V3 (Scale)
- Kubernetes orchestration
- Auto-scaling based on queue depth
- Multi-region deployment
- CDN for static assets

---

## Cost Estimates (V1)

| Component | Monthly Cost |
|-----------|--------------|
| GPU Node (8x H100) | ~$15,000 - $22,000 |
| Render API Server | ~$25 |
| Render PostgreSQL | ~$20 |
| Render Redis | ~$10 |
| Render Frontend | ~$0 (static) |
| Domain + SSL | ~$15 |
| **Total** | **~$15,070 - $22,070** |

**Break-even target:** ~500-700 Pro subscribers ($99/mo) or equivalent usage-based revenue.

---

## Security Considerations

1. **API Keys** — Never stored in plaintext; SHA-256 hashed
2. **JWT** — Short-lived access tokens (15 min), refresh tokens (7 days)
3. **HTTPS** — All traffic encrypted
4. **Rate Limiting** — Prevents abuse and DDoS
5. **Input Validation** — Strict schema validation on all endpoints
6. **Secrets Management** — Environment variables, never in code
7. **Audit Logging** — All API key operations logged

---

## V1 Launch Checklist

- [ ] Database schema deployed
- [ ] API authentication working
- [ ] API key system functional
- [ ] Rate limiting active
- [ ] Usage tracking operational
- [ ] vLLM inference node running
- [ ] API → vLLM integration tested
- [ ] Stripe billing configured
- [ ] Frontend dashboard deployed
- [ ] Monitoring dashboards live
- [ ] Documentation complete
- [ ] Load testing passed
