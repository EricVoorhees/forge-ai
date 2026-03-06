# FORGE V1 — Deployment & Infrastructure

## Overview

FORGE V1 uses a simple deployment architecture optimized for fast launch and iteration.

---

## Infrastructure Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PRODUCTION                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         Cloudflare                                   │   │
│   │                    (DNS + CDN + DDoS)                               │   │
│   └───────────────────────────┬─────────────────────────────────────────┘   │
│                               │                                              │
│           ┌───────────────────┼───────────────────┐                         │
│           │                   │                   │                         │
│           ▼                   ▼                   ▼                         │
│   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐                │
│   │   Frontend    │   │  API Server   │   │  GPU Node     │                │
│   │   (Render)    │   │   (Render)    │   │  (RunPod)     │                │
│   │               │   │               │   │               │                │
│   │  forge.ai     │   │ api.forge.ai  │   │ gpu.forge.ai  │                │
│   │               │   │               │   │ (internal)    │                │
│   └───────────────┘   └───────┬───────┘   └───────────────┘                │
│                               │                                              │
│                    ┌──────────┴──────────┐                                  │
│                    │                     │                                  │
│                    ▼                     ▼                                  │
│            ┌───────────────┐     ┌───────────────┐                         │
│            │  PostgreSQL   │     │    Redis      │                         │
│            │   (Render)    │     │   (Render)    │                         │
│            └───────────────┘     └───────────────┘                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Provider Selection

| Component | Provider | Reason |
|-----------|----------|--------|
| Frontend | Render | Easy Next.js deployment, free tier |
| API Server | Render | Docker support, auto-deploy |
| PostgreSQL | Render | Managed, same network |
| Redis | Render | Managed, same network |
| GPU Inference | RunPod | H100 availability, cost |
| DNS/CDN | Cloudflare | Free tier, DDoS protection |
| Monitoring | Grafana Cloud | Free tier, hosted |

---

## Render Configuration

### render.yaml

```yaml
# render.yaml

services:
  # Frontend (Next.js)
  - type: web
    name: forge-frontend
    env: node
    region: oregon
    plan: starter
    buildCommand: cd web && npm install && npm run build
    startCommand: cd web && npm start
    envVars:
      - key: NEXT_PUBLIC_API_URL
        value: https://api.forge.ai
      - key: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        sync: false
    autoDeploy: true
    branch: main
    rootDir: web

  # API Server (FastAPI)
  - type: web
    name: forge-api
    env: docker
    region: oregon
    plan: starter
    dockerfilePath: ./api/Dockerfile
    dockerContext: ./api
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: forge-db
          property: connectionString
      - key: REDIS_URL
        fromService:
          name: forge-redis
          type: redis
          property: connectionString
      - key: JWT_SECRET_KEY
        generateValue: true
      - key: STRIPE_SECRET_KEY
        sync: false
      - key: STRIPE_WEBHOOK_SECRET
        sync: false
      - key: INFERENCE_URL
        sync: false
    healthCheckPath: /health
    autoDeploy: true
    branch: main

databases:
  - name: forge-db
    plan: starter
    region: oregon
    postgresMajorVersion: 15

services:
  - type: redis
    name: forge-redis
    plan: starter
    region: oregon
    maxmemoryPolicy: allkeys-lru
```

### API Dockerfile

```dockerfile
# api/Dockerfile

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### API Requirements

```txt
# api/requirements.txt

fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic==2.5.3
python-jose[cryptography]==3.3.0
passlib[argon2]==1.7.4
asyncpg==0.29.0
sqlalchemy[asyncio]==2.0.25
alembic==1.13.1
redis==5.0.1
httpx==0.26.0
stripe==7.8.0
python-multipart==0.0.6
prometheus-client==0.19.0
```

---

## RunPod GPU Deployment

### Pod Configuration

```json
{
  "name": "forge-inference",
  "imageName": "ghcr.io/forge/inference:latest",
  "gpuTypeId": "NVIDIA H100 80GB",
  "gpuCount": 8,
  "volumeInGb": 2000,
  "containerDiskInGb": 100,
  "minVcpuCount": 32,
  "minMemoryInGb": 256,
  "ports": "8000/http",
  "env": {
    "MODEL_PATH": "/runpod-volume/models/qwen-400b",
    "MODEL_NAME": "forge-400b",
    "TENSOR_PARALLEL_SIZE": "8",
    "GPU_MEMORY_UTIL": "0.95",
    "MAX_MODEL_LEN": "32768"
  }
}
```

### Deploy Script

```bash
#!/bin/bash
# infra/runpod/deploy.sh

set -e

RUNPOD_API_KEY="${RUNPOD_API_KEY:?RUNPOD_API_KEY required}"
POD_NAME="forge-inference"
IMAGE="ghcr.io/forge/inference:latest"

echo "Deploying GPU pod to RunPod..."

# Create or update pod
curl -X POST "https://api.runpod.io/v2/pods" \
  -H "Authorization: Bearer ${RUNPOD_API_KEY}" \
  -H "Content-Type: application/json" \
  -d @- << EOF
{
  "name": "${POD_NAME}",
  "imageName": "${IMAGE}",
  "gpuTypeId": "NVIDIA H100 80GB",
  "gpuCount": 8,
  "volumeInGb": 2000,
  "containerDiskInGb": 100,
  "minVcpuCount": 32,
  "minMemoryInGb": 256,
  "ports": "8000/http",
  "env": {
    "MODEL_PATH": "/runpod-volume/models/qwen-400b",
    "MODEL_NAME": "forge-400b",
    "TENSOR_PARALLEL_SIZE": "8"
  }
}
EOF

echo "Pod deployment initiated."
```

### Model Download Script

```bash
#!/bin/bash
# infra/runpod/download_model.sh

set -e

MODEL_ID="Qwen/Qwen2.5-400B-Instruct"
MODEL_DIR="/runpod-volume/models/qwen-400b"

echo "Downloading model ${MODEL_ID}..."

pip install huggingface_hub

huggingface-cli download \
    --repo-type model \
    --local-dir "${MODEL_DIR}" \
    --local-dir-use-symlinks False \
    "${MODEL_ID}"

echo "Model downloaded to ${MODEL_DIR}"
ls -la "${MODEL_DIR}"
```

---

## Cloudflare Configuration

### DNS Records

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | forge.ai | Render IP | Yes |
| CNAME | api | forge-api.onrender.com | Yes |
| CNAME | www | forge.ai | Yes |

### Page Rules

```
# Force HTTPS
URL: *forge.ai/*
Setting: Always Use HTTPS

# API caching (none)
URL: api.forge.ai/*
Setting: Cache Level = Bypass
```

### Security Settings

- SSL/TLS: Full (strict)
- Always Use HTTPS: On
- Minimum TLS Version: 1.2
- Bot Fight Mode: On
- Security Level: Medium

---

## Environment Variables

### API Server

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/forge

# Redis
REDIS_URL=redis://user:pass@host:6379

# JWT
JWT_SECRET_KEY=your-256-bit-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_STARTER=price_xxx
STRIPE_PRICE_PRO=price_xxx
STRIPE_PRICE_ENTERPRISE=price_xxx

# Inference
INFERENCE_URL=http://gpu-node-ip:8000

# Monitoring
PROMETHEUS_MULTIPROC_DIR=/tmp/prometheus
```

### Frontend

```bash
NEXT_PUBLIC_API_URL=https://api.forge.ai
NEXT_PUBLIC_APP_URL=https://forge.ai
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

### GPU Node

```bash
MODEL_PATH=/models/qwen-400b
MODEL_NAME=forge-400b
TENSOR_PARALLEL_SIZE=8
GPU_MEMORY_UTIL=0.95
MAX_MODEL_LEN=32768
MAX_NUM_SEQS=256
```

---

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml

name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          cd api
          pip install -r requirements.txt
          pip install pytest pytest-asyncio
      
      - name: Run tests
        run: |
          cd api
          pytest tests/ -v

  deploy-api:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Render
        run: |
          curl -X POST "${{ secrets.RENDER_DEPLOY_HOOK_API }}"

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Render
        run: |
          curl -X POST "${{ secrets.RENDER_DEPLOY_HOOK_FRONTEND }}"

  deploy-inference:
    needs: test
    runs-on: ubuntu-latest
    if: contains(github.event.head_commit.message, '[deploy-gpu]')
    steps:
      - uses: actions/checkout@v4
      
      - name: Build and push Docker image
        run: |
          echo "${{ secrets.GHCR_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin
          docker build -t ghcr.io/forge/inference:latest ./inference
          docker push ghcr.io/forge/inference:latest
      
      - name: Restart RunPod
        run: |
          curl -X POST "https://api.runpod.io/v2/pods/${{ secrets.RUNPOD_POD_ID }}/restart" \
            -H "Authorization: Bearer ${{ secrets.RUNPOD_API_KEY }}"
```

---

## Database Migrations

### Alembic Setup

```bash
# Initialize Alembic
cd api
alembic init db/migrations

# Create migration
alembic revision --autogenerate -m "Initial schema"

# Run migrations
alembic upgrade head
```

### Migration Script

```bash
#!/bin/bash
# scripts/migrate.sh

set -e

echo "Running database migrations..."

cd api
alembic upgrade head

echo "Migrations complete."
```

---

## Monitoring Setup

### Prometheus Configuration

```yaml
# monitoring/prometheus.yml

global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'forge-api'
    static_configs:
      - targets: ['api.forge.ai']
    metrics_path: /metrics
    scheme: https

  - job_name: 'forge-inference'
    static_configs:
      - targets: ['gpu-node:8000']
    metrics_path: /metrics
```

### Grafana Dashboard

Import dashboards for:
- API request rates and latencies
- GPU utilization
- Token throughput
- Error rates
- User growth

---

## Backup Strategy

### Database Backups

Render provides automatic daily backups for PostgreSQL.

**Manual backup:**
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Model Weights

Store model weights on RunPod persistent volume. No backup needed (can re-download from HuggingFace).

---

## Scaling Playbook

### When to Scale

| Metric | Threshold | Action |
|--------|-----------|--------|
| API latency P95 | > 500ms | Add API instance |
| GPU utilization | > 90% | Add GPU node |
| Queue depth | > 100 | Add GPU node |
| Database connections | > 80% | Upgrade DB plan |

### Scaling API (Render)

1. Go to Render Dashboard
2. Select forge-api service
3. Click "Scale" → Add instances
4. Or upgrade plan for more resources

### Scaling GPU (RunPod)

1. Deploy additional pod with same configuration
2. Update API server with new node URL
3. Implement load balancing in inference router

---

## Disaster Recovery

### Runbook

**API Server Down:**
1. Check Render status page
2. Check logs: `render logs forge-api`
3. Restart service if needed
4. Roll back to previous deploy if issue persists

**GPU Node Down:**
1. Check RunPod status
2. SSH into pod: `runpodctl ssh forge-inference`
3. Check vLLM logs: `docker logs vllm`
4. Restart pod if needed

**Database Issues:**
1. Check Render PostgreSQL status
2. Restore from backup if needed
3. Contact Render support for critical issues

---

## Cost Optimization

### V1 Monthly Costs

| Service | Plan | Cost |
|---------|------|------|
| Render API | Starter | $7 |
| Render Frontend | Free | $0 |
| Render PostgreSQL | Starter | $7 |
| Render Redis | Starter | $10 |
| RunPod 8xH100 | On-demand | ~$20,000 |
| Cloudflare | Free | $0 |
| **Total** | | **~$20,024** |

### Cost Reduction Strategies

1. **Spot instances** — Use RunPod spot for 50% savings
2. **Auto-shutdown** — Stop GPU during low traffic
3. **Reserved capacity** — Commit for discounts
4. **Caching** — Cache common responses

---

## Security Checklist

- [ ] All secrets in environment variables
- [ ] HTTPS enforced everywhere
- [ ] Database not publicly accessible
- [ ] Redis not publicly accessible
- [ ] GPU node internal only (no public IP)
- [ ] API rate limiting enabled
- [ ] Stripe webhook signature verification
- [ ] JWT tokens short-lived
- [ ] Password hashing with Argon2
- [ ] Input validation on all endpoints
- [ ] CORS configured properly
- [ ] Security headers set (CSP, HSTS, etc.)

---

## Launch Checklist

### Pre-Launch

- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Stripe products/prices created
- [ ] Stripe webhooks configured
- [ ] DNS records configured
- [ ] SSL certificates active
- [ ] Model downloaded to GPU node
- [ ] vLLM server running and healthy
- [ ] API health check passing
- [ ] Frontend deployed and accessible

### Launch Day

- [ ] Monitor error rates
- [ ] Monitor latencies
- [ ] Monitor GPU utilization
- [ ] Test signup flow
- [ ] Test API key creation
- [ ] Test inference endpoint
- [ ] Test billing flow
- [ ] Announce launch

### Post-Launch

- [ ] Set up alerting
- [ ] Review logs daily
- [ ] Monitor costs
- [ ] Gather user feedback
- [ ] Plan V2 improvements
