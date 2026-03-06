# FORGE — MASTER BUILD BLUEPRINT

**The single canonical architecture plan the entire system follows.**

---

## Goal

Build a high-performance coding LLM API (OpenAI compatible) running a Sparse MoE model via vLLM.

---

## Core Principles

1. **Minimal infrastructure** — No Kubernetes, no complex orchestration
2. **OpenAI-compatible API** — Drop-in replacement
3. **Horizontal GPU scaling** — Add nodes as needed
4. **Subscription billing** — Stripe handles everything
5. **Clean auth + usage tracking** — JWT + API keys

---

## 1. System Architecture (Final)

```
User
 │
 ▼
Frontend (Next.js)
 │
 ▼
API Gateway (FastAPI)
 │
 ├── Auth
 ├── Rate Limit
 ├── Usage Tracking
 ├── Billing
 │
 ▼
Inference Cluster
(vLLM + GPUs)
 │
 ▼
Sparse MoE Model
```

### Infrastructure Layers

| Layer | Provider |
|-------|----------|
| Frontend | Render |
| API | Render |
| Database | Render PostgreSQL |
| Cache | Redis |
| Inference | RunPod GPU cluster |
| Monitoring | Prometheus + Grafana |
| Payments | Stripe |

---

## 2. Core Technology Choices (FINAL)

**Your agent should not re-decide these.**

| Component | Technology |
|-----------|------------|
| Frontend | Next.js |
| API | FastAPI |
| Auth | JWT + API Keys |
| Database | PostgreSQL |
| Cache | Redis |
| Inference Engine | vLLM |
| GPU Cloud | RunPod |
| Payments | Stripe |
| Monitoring | Prometheus + Grafana |
| Containerization | Docker |

---

## 3. Phased Model Strategy (CRITICAL)

### The Smart Infrastructure Evolution

**DO NOT start with 400B model.** Start smaller, scale later.

#### Stage 1: V1 Launch (Recommended)

| Spec | Value |
|------|-------|
| Model | DeepSeek Coder V2 (236B MoE) |
| GPUs | 4x H100 80GB |
| VRAM | 320GB total |
| Cost | $3,000 - $6,000/month |
| Break-even | ~60 subscribers at $99/mo |

```bash
python -m vllm.entrypoints.openai.api_server \
  --model deepseek-coder-v2 \
  --tensor-parallel-size 4 \
  --gpu-memory-utilization 0.9 \
  --port 8001
```

#### Stage 2: Scale Up

| Spec | Value |
|------|-------|
| Model | 400B Sparse MoE |
| GPUs | 8x H100 80GB |
| VRAM | 640GB total |
| Cost | $15,000 - $20,000/month |
| Break-even | ~200 subscribers at $99/mo |

**Trigger for Stage 2:**
- >60% GPU utilization sustained
- >300 active subscribers
- Revenue covers infrastructure

#### Stage 3: Multi-Node

| Spec | Value |
|------|-------|
| Nodes | 2+ inference clusters |
| Load Balancing | API-level routing |
| Auto-scaling | Based on queue depth |

---

## 4. Why Sparse MoE Works

A Mixture-of-Experts model only activates a subset of parameters per token.

```
Total parameters: 400B
Experts: 64
Active per token: 2

Active parameters ≈ 12–20B
Compute cost ≈ 13B model
Knowledge capacity ≈ 400B model
```

### GPU Memory Layout (8x H100)

```
GPU 1 → experts 1-8
GPU 2 → experts 9-16
GPU 3 → experts 17-24
GPU 4 → experts 25-32
GPU 5 → experts 33-40
GPU 6 → experts 41-48
GPU 7 → experts 49-56
GPU 8 → experts 57-64
```

Router chooses which 2 experts activate per token.

---

## 5. Request Flow (Complete)

```
User App
  │
  ▼
API Gateway
  │
  ├ Verify API Key
  ├ Check Rate Limit
  ├ Check Subscription
  │
  ▼
Inference Server (vLLM)
  │
  ▼
Model generates response
  │
  ▼
Response streamed to user
  │
  ▼
Usage tokens logged to database
```

---

## 6. Repository Structure

```
forge/
├── frontend/          # Next.js dashboard
├── api/               # FastAPI server
│   ├── main.py
│   ├── auth/
│   ├── routes/
│   ├── services/
│   ├── models/
│   └── middleware/
├── inference/         # vLLM container
│   ├── Dockerfile
│   ├── run_vllm.sh
│   └── config.yaml
├── infra/             # Deployment configs
├── db/                # Database schemas
├── monitoring/        # Prometheus/Grafana
└── docs/              # Documentation
```

---

## 7. Core API Endpoints

```
POST /v1/chat/completions   # Main inference endpoint
GET  /v1/models             # List available models
GET  /v1/usage              # User usage stats
POST /v1/api-keys           # Create API key
DELETE /v1/api-keys/{id}    # Revoke API key
```

---

## 8. Database Schema (Simplified)

**4 tables only:**

```sql
users
├── id
├── email
├── password_hash
└── created_at

api_keys
├── id
├── user_id
├── key_hash
└── created_at

usage_logs
├── id
├── user_id
├── tokens_input
├── tokens_output
├── cost
└── timestamp

subscriptions
├── id
├── user_id
├── stripe_customer_id
├── plan
└── status
```

---

## 9. Rate Limiting

**Algorithm:** Token bucket (Redis)

| Plan | Limit |
|------|-------|
| Free | 20 req/min |
| Pro | 120 req/min |
| Enterprise | Custom |

---

## 10. GPU Deployment

### V1 Spec (4x H100)

| Component | Value |
|-----------|-------|
| GPUs | 4x H100 80GB |
| CPU | 32 cores |
| RAM | 128GB |
| Storage | 500GB NVMe |
| Cost | ~$10/hour |
| Monthly | ~$7,200 |

### V2 Spec (8x H100)

| Component | Value |
|-----------|-------|
| GPUs | 8x H100 80GB |
| CPU | 64 cores |
| RAM | 256GB |
| Storage | 1TB NVMe |
| Cost | ~$20/hour |
| Monthly | ~$14,400 |

---

## 11. Expected Performance

### On 4x H100 (DeepSeek V2)

| Metric | Value |
|--------|-------|
| Throughput | 60-100 tokens/sec |
| First token | ~1s |
| Full response | 2-3s |
| Requests/day | ~10,000+ |

### On 8x H100 (400B MoE)

| Metric | Value |
|--------|-------|
| Throughput | 80-150 tokens/sec |
| First token | ~1.5s |
| Full response | 2-4s |
| Requests/day | ~17,000+ |

---

## 12. Revenue Math

### V1 (4x H100)

| Metric | Value |
|--------|-------|
| Monthly cost | $5,000 |
| Price per user | $99/mo |
| Break-even | 51 users |
| Profit at 100 users | $4,900/mo |

### V2 (8x H100)

| Metric | Value |
|--------|-------|
| Monthly cost | $15,000 |
| Price per user | $99/mo |
| Break-even | 152 users |
| Profit at 300 users | $14,700/mo |

---

## 13. Build Order (CRITICAL)

**Follow this exact order.**

### Phase 1 — Core Backend

1. Database schema
2. User authentication
3. API key system
4. Rate limiting
5. Usage tracking

### Phase 2 — Inference

1. Deploy vLLM server
2. Load model
3. Connect API → inference
4. Streaming responses

### Phase 3 — Billing

1. Stripe subscriptions
2. Webhooks
3. Usage enforcement

### Phase 4 — Frontend

1. Dashboard
2. API key management
3. Usage graphs
4. Billing UI

### Phase 5 — Deployment

1. Deploy Render services
2. Deploy RunPod cluster
3. Configure monitoring
4. Load test

---

## 14. Deployment Layout

### Production

```
Render
├── frontend
├── api
├── postgres
└── redis

RunPod
└── inference cluster (4x H100 initially)
```

### Development

```bash
docker compose up
```

Services: api, postgres, redis, mock inference

---

## 15. What NOT to Build (V1)

**Avoid complexity:**

- ❌ Kubernetes
- ❌ Complex orchestration
- ❌ Multi-region clusters
- ❌ Premature autoscaling
- ❌ Multiple model variants
- ❌ Fine-tuning infrastructure

**Keep V1 simple.**

---

## 16. Scaling Triggers

**Add second node when:**

- GPU utilization > 60% sustained
- Queue depth > 50 requests
- P95 latency > 10s

**Upgrade to 400B when:**

- 300+ active subscribers
- Revenue > $25k/month
- User demand for larger context

---

## 17. Final MVP Stack

```
Next.js      → Frontend
FastAPI      → API
PostgreSQL   → Database
Redis        → Cache
vLLM         → Inference
Stripe       → Billing
RunPod       → GPUs
```

**That's it. Everything else is optional.**

---

## 18. Strategic Advantage

Most competitors build wrappers around existing APIs.

**FORGE builds:**
- Direct model hosting
- Lower cost per token
- Higher margins
- Custom models later

This is exactly what Together AI and Fireworks AI built their businesses on.

---

## 19. V1 Launch Checklist

- [ ] Database schema deployed
- [ ] User auth working
- [ ] API keys generating
- [ ] Rate limiting active
- [ ] vLLM serving requests
- [ ] Streaming working
- [ ] Stripe billing live
- [ ] Dashboard functional
- [ ] Monitoring active
- [ ] <500ms API latency (non-inference)
- [ ] <5s inference latency (P95)

---

## 20. Success Metrics

### Week 1

- [ ] 10+ registered users
- [ ] 1+ paying customer
- [ ] No critical bugs
- [ ] 99% uptime

### Month 1

- [ ] 50+ users
- [ ] 10+ paying customers
- [ ] <1% error rate
- [ ] Positive unit economics
