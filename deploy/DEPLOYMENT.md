# FORGE Production Deployment

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        RENDER.COM                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ PostgreSQL  │  │    Redis    │  │    FORGE API        │  │
│  │   (DB)      │  │   (Cache)   │  │    (FastAPI)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                              │               │
│  ┌─────────────────────────────────────────┐ │               │
│  │         FORGE Frontend (Next.js)        │ │               │
│  └─────────────────────────────────────────┘ │               │
└──────────────────────────────────────────────┼───────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────┐
│                        RUNPOD                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  vLLM Server (H100 GPUs)                                ││
│  │  - DeepSeek Coder V2 / Qwen / Llama                     ││
│  │  - OpenAI-compatible API                                ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Deploy with Render Blueprint

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial FORGE deployment"
git remote add origin https://github.com/YOUR_USERNAME/forge.git
git push -u origin main
```

### Step 2: Deploy to Render
1. Go to https://render.com/deploy
2. Connect your GitHub repo
3. Render will detect `render.yaml` and create all services
4. Wait for deployment (~5-10 minutes)

### Step 3: Configure Secrets
After deployment, go to each service and set:

**forge-api Environment Variables:**
- `STRIPE_SECRET_KEY` - From Stripe Dashboard
- `STRIPE_WEBHOOK_SECRET` - From Stripe Webhooks
- `STRIPE_PRICE_STARTER` - Price ID for $29/mo plan
- `STRIPE_PRICE_PRO` - Price ID for $99/mo plan
- `STRIPE_PRICE_ENTERPRISE` - Price ID for $499/mo plan
- `INFERENCE_URL` - Your RunPod endpoint URL
- `CORS_ORIGINS` - Your frontend domain(s)

**forge-web Environment Variables:**
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - From Stripe Dashboard

---

## Manual Deployment Steps

### 1. Create Render PostgreSQL
1. Dashboard → New → PostgreSQL
2. Name: `forge-db`
3. Plan: Starter ($7/mo)
4. Copy Internal URL

### 2. Create Render Redis
1. Dashboard → New → Redis
2. Name: `forge-redis`
3. Plan: Starter ($10/mo)
4. Copy Internal URL

### 3. Deploy API
1. Dashboard → New → Web Service
2. Connect GitHub repo
3. Root Directory: `api`
4. Build: `pip install -r requirements.txt`
5. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Set all environment variables

### 4. Deploy Frontend
1. Dashboard → New → Static Site
2. Connect GitHub repo
3. Root Directory: `web`
4. Build: `npm install && npm run build`
5. Publish: `out`

### 5. Set Up RunPod
See `deploy/runpod/README.md`

---

## Environment Variables Reference

### API (forge-api)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql+asyncpg://user:pass@host/db` |
| `REDIS_URL` | Redis connection | `redis://host:6379` |
| `JWT_SECRET_KEY` | 256-bit secret for JWT | Auto-generated |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry | `15` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token expiry | `7` |
| `STRIPE_SECRET_KEY` | Stripe API key | `sk_live_xxx` |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | `whsec_xxx` |
| `STRIPE_PRICE_STARTER` | Starter plan price ID | `price_xxx` |
| `STRIPE_PRICE_PRO` | Pro plan price ID | `price_xxx` |
| `STRIPE_PRICE_ENTERPRISE` | Enterprise plan price ID | `price_xxx` |
| `INFERENCE_URL` | vLLM endpoint | `https://xxx.runpod.net` |
| `APP_ENV` | Environment | `production` |
| `DEBUG` | Debug mode | `false` |
| `CORS_ORIGINS` | Allowed origins | `https://forge.ai` |

### Frontend (forge-web)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | API base URL | `https://forge-api.onrender.com` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key | `pk_live_xxx` |

---

## Stripe Setup

### 1. Create Products
Go to Stripe Dashboard → Products → Add Product

| Plan | Price | Features |
|------|-------|----------|
| Starter | $29/mo | 100K tokens/day, 60 RPM |
| Pro | $99/mo | 500K tokens/day, 120 RPM |
| Enterprise | $499/mo | 2M tokens/day, 300 RPM |

### 2. Create Webhook
1. Developers → Webhooks → Add Endpoint
2. URL: `https://forge-api.onrender.com/webhooks/stripe`
3. Events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

---

## Post-Deployment Checklist

- [ ] All Render services are running (green status)
- [ ] Database migrations ran successfully
- [ ] API health check passes: `curl https://forge-api.onrender.com/health`
- [ ] Frontend loads correctly
- [ ] Stripe webhook is configured
- [ ] RunPod inference endpoint is responding
- [ ] Test user registration and login
- [ ] Test API key generation
- [ ] Test chat completion

---

## Monitoring

### Render Dashboard
- View logs for each service
- Monitor memory/CPU usage
- Set up alerts for downtime

### API Endpoints
- `/health` - Basic health check
- `/ready` - Readiness check (DB + Redis)

### Recommended: Add External Monitoring
- UptimeRobot (free) for uptime monitoring
- Sentry for error tracking
- Prometheus + Grafana for metrics

---

## Scaling

### When to Scale

| Metric | Threshold | Action |
|--------|-----------|--------|
| API Response Time | > 500ms | Upgrade Render plan |
| DB Connections | > 80% | Upgrade PostgreSQL |
| Redis Memory | > 80% | Upgrade Redis |
| GPU Queue Time | > 5s | Add RunPod workers |

### Render Scaling
- Starter → Standard → Pro plans
- Add more instances for horizontal scaling

### RunPod Scaling
- Increase max workers for serverless
- Add more GPU pods for always-on
