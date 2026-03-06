# FORGE — High-Performance Coding LLM API

Production-ready AI inference platform exposing Sparse MoE models via an OpenAI-compatible API.

> **V1 Strategy:** Start with DeepSeek Coder V2 on 4x H100 (~$5k/mo), scale to 400B MoE on 8x H100 (~$15k/mo) when demand justifies.

---

## Overview

FORGE is a scalable AI coding API that provides:

- **OpenAI-compatible API** — Drop-in replacement for existing integrations
- **Sparse MoE Models** — V1: DeepSeek Coder V2, V2: 400B MoE
- **Professional Auth** — JWT authentication + API key management
- **Usage Tracking** — Per-request token logging and analytics
- **Rate Limiting** — Tiered limits by subscription plan
- **Billing Integration** — Stripe subscriptions and usage-based billing
- **Monitoring** — Prometheus metrics and Grafana dashboards

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FORGE PLATFORM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────┐     ┌──────────┐     ┌────────────────────┐     │
│   │ Frontend │────▶│   API    │────▶│  Inference Node    │     │
│   │ (Next.js)│     │ (FastAPI)│     │  (vLLM + 8xH100)   │     │
│   └──────────┘     └────┬─────┘     └────────────────────┘     │
│                         │                                       │
│              ┌──────────┴──────────┐                           │
│              │                     │                           │
│        ┌─────▼─────┐        ┌──────▼──────┐                   │
│        │ PostgreSQL│        │    Redis    │                   │
│        └───────────┘        └─────────────┘                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker (for inference)

### Development Setup

```bash
# Clone repository
git clone https://github.com/your-org/forge.git
cd forge

# API Server
cd api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
uvicorn main:app --reload

# Frontend (separate terminal)
cd web
npm install
cp .env.example .env.local
npm run dev
```

### Environment Variables

```bash
# API Server
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/forge
REDIS_URL=redis://localhost:6379
JWT_SECRET_KEY=your-secret-key
STRIPE_SECRET_KEY=sk_test_xxx
INFERENCE_URL=http://localhost:8000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture and components |
| [API_SPEC.md](docs/API_SPEC.md) | OpenAI-compatible API specification |
| [DATABASE.md](docs/DATABASE.md) | Database schema and migrations |
| [AUTH_SPEC.md](docs/AUTH_SPEC.md) | Authentication and API key system |
| [RATE_LIMITING.md](docs/RATE_LIMITING.md) | Rate limiting and usage tracking |
| [INFERENCE.md](docs/INFERENCE.md) | vLLM inference node configuration |
| [BILLING.md](docs/BILLING.md) | Stripe billing integration |
| [FRONTEND.md](docs/FRONTEND.md) | Frontend dashboard specification |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deployment and infrastructure |
| [MONITORING.md](docs/MONITORING.md) | Monitoring and observability |
| [BUILD_ROADMAP.md](docs/BUILD_ROADMAP.md) | Implementation roadmap |

---

## API Endpoints

### Inference

```bash
# Chat Completion
curl https://api.forge.ai/v1/chat/completions \
  -H "Authorization: Bearer sk-forge-xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "forge-400b",
    "messages": [{"role": "user", "content": "Write a Python function"}]
  }'
```

### Authentication

```bash
# Register
POST /auth/register

# Login
POST /auth/login

# Refresh Token
POST /auth/refresh
```

### API Keys

```bash
# List Keys
GET /v1/api-keys

# Create Key
POST /v1/api-keys

# Revoke Key
DELETE /v1/api-keys/{id}
```

### Usage

```bash
# Get Usage
GET /v1/usage?start_date=2024-01-01&granularity=day
```

---

## Pricing

| Plan | Price | Requests/Min |
|------|-------|-------------|
| Free | $0 | 20 |
| Pro | $99 | 120 |
| Enterprise | $299 | Custom |

## Infrastructure Costs

| Stage | GPUs | Monthly Cost | Break-even |
|-------|------|--------------|------------|
| V1 | 4x H100 | ~$5,000 | 51 Pro users |
| V2 | 8x H100 | ~$15,000 | 152 Pro users |

---

## Project Structure

```
forge/
├── api/                    # FastAPI backend
│   ├── main.py
│   ├── routes/
│   ├── auth/
│   ├── billing/
│   ├── db/
│   ├── services/
│   └── middleware/
├── web/                    # Next.js frontend
│   ├── app/
│   ├── components/
│   └── lib/
├── inference/              # vLLM inference node
│   ├── Dockerfile
│   └── run_vllm.sh
├── db/                     # Database schemas
├── infra/                  # Infrastructure configs
├── monitoring/             # Prometheus/Grafana
├── scripts/                # Utility scripts
├── tests/                  # Test suites
└── docs/                   # Documentation
```

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TailwindCSS, Shadcn/ui |
| API | FastAPI, SQLAlchemy, Pydantic |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| Inference | vLLM on 4x H100 (V1) / 8x H100 (V2) |
| Model | DeepSeek Coder V2 (V1) / 400B MoE (V2) |
| GPU | 4x H100 (V1) / 8x H100 (V2) |
| Billing | Stripe |
| Monitoring | Prometheus, Grafana |
| Deployment | Render, RunPod, Cloudflare |

---

## Development

### Running Tests

```bash
cd api
pytest tests/ -v
```

### Database Migrations

```bash
cd api
alembic upgrade head
```

### Code Formatting

```bash
# Python
black api/
isort api/

# TypeScript
cd web && npm run lint
```

---

## Deployment

### Render (API + Frontend)

```bash
# Deploy via render.yaml
render deploy
```

### RunPod (GPU Inference)

```bash
# Deploy GPU pod
./infra/runpod/deploy.sh
```

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

---

## License

Proprietary. All rights reserved.

---

## Support

- Documentation: https://docs.forge.ai
- Email: support@forge.ai
- Discord: https://discord.gg/forge
