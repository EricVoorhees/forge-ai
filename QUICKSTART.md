# FORGE Quick Start Guide

## Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker (optional, for full stack)

---

## Option 1: Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Run smoke tests
cd api
python -m tests.smoke_test
```

---

## Option 2: Manual Setup

### 1. Database & Redis

```bash
# Start PostgreSQL and Redis (if not using Docker)
# Or use Docker for just these:
docker run -d --name forge-postgres -e POSTGRES_DB=forge -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15
docker run -d --name forge-redis -p 6379:6379 redis:7
```

### 2. API Server

```bash
cd api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your settings:
# DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost/forge
# REDIS_URL=redis://localhost:6379
# JWT_SECRET_KEY=your-secret-key-here
# DEBUG=true

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend (Optional)

```bash
cd web

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local

# Run dev server
npm run dev
```

---

## Running Smoke Tests

```bash
cd api

# Make sure the API is running first, then:
python -m tests.smoke_test

# Or with pytest:
pytest tests/smoke_test.py -v
```

---

## Expected Log Output

When the API starts, you should see:

```
[HH:MM:SS] INFO     forge.main: ============================================================
[HH:MM:SS] INFO     forge.main: FORGE API Server starting up
[HH:MM:SS] INFO     forge.main: Environment: development
[HH:MM:SS] INFO     forge.main: Debug mode: True
[HH:MM:SS] INFO     forge.main: CORS origins: http://localhost:3000
[HH:MM:SS] INFO     forge.main: ============================================================
[HH:MM:SS] INFO     forge.main: Initializing database...
[HH:MM:SS] INFO     forge.services.rate_limiter: Redis connected successfully: redis://localhost:6379
[HH:MM:SS] INFO     forge.main: Database initialized successfully
```

When requests come in:

```
[HH:MM:SS] INFO     forge.middleware.request: REQUEST abc123 | POST /auth/register
[HH:MM:SS] INFO     forge.auth.routes: Registration attempt for email: test@example.com
[HH:MM:SS] DEBUG    forge.auth.jwt: Hashing password
[HH:MM:SS] INFO     forge.auth.routes: User registered successfully (user=12345678...)
[HH:MM:SS] INFO     forge.middleware.request: RESPONSE abc123 | 200 | 45.2ms
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/health/ready` | GET | Readiness check (DB + Redis) |
| `/auth/register` | POST | Register new user |
| `/auth/login` | POST | Login, get JWT tokens |
| `/auth/refresh` | POST | Refresh access token |
| `/auth/me` | GET | Get current user |
| `/v1/api-keys` | GET/POST | List/create API keys |
| `/v1/api-keys/{id}` | DELETE | Revoke API key |
| `/v1/models` | GET | List available models |
| `/v1/chat/completions` | POST | Chat completion (OpenAI compatible) |
| `/v1/usage` | GET | Get usage summary |
| `/v1/usage/daily` | GET | Get daily usage breakdown |
| `/v1/usage/limits` | GET | Get rate limit status |
| `/v1/billing/subscription` | GET | Get subscription status |
| `/v1/billing/checkout` | POST | Create Stripe checkout |
| `/v1/billing/portal` | POST | Create Stripe portal session |

---

## Testing the API

### 1. Register a user

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "name": "Test User"}'
```

### 2. Login

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### 3. Create API Key (use access_token from login)

```bash
curl -X POST http://localhost:8000/v1/api-keys \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My API Key"}'
```

### 4. Test Chat Completion (use API key from step 3)

```bash
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Authorization: Bearer sk-forge-YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "forge-coder",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

---

## Troubleshooting

### Database connection failed
- Check PostgreSQL is running: `docker ps | grep postgres`
- Verify DATABASE_URL in .env matches your setup

### Redis connection failed
- Check Redis is running: `docker ps | grep redis`
- Verify REDIS_URL in .env

### Import errors
- Make sure you're in the `api` directory
- Activate virtual environment: `source venv/bin/activate`

### 502 on chat completions
- This is expected if the inference server (vLLM) is not running
- The auth and rate limiting still work, just no actual completions

---

## Next Steps

1. **Run smoke tests** to verify all components work
2. **Set up Stripe** (optional) for billing
3. **Deploy inference server** on RunPod with vLLM
4. **Configure production** environment variables
5. **Deploy to Render** using the render.yaml blueprint
