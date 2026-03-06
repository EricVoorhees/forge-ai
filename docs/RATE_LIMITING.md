# FORGE V1 — Rate Limiting & Usage Tracking

## Overview

FORGE implements multi-dimensional rate limiting to:
1. Prevent abuse
2. Ensure fair usage
3. Enable tiered pricing
4. Protect infrastructure

---

## Rate Limit Dimensions

| Dimension | Description | Enforcement |
|-----------|-------------|-------------|
| Requests per minute (RPM) | Total API calls | Per API key |
| Tokens per minute (TPM) | Input + output tokens | Per API key |
| Tokens per day (TPD) | Daily token budget | Per user |
| Concurrent requests | Simultaneous connections | Per API key |

---

## Limits by Plan

| Plan | RPM | TPM | TPD | Concurrent |
|------|-----|-----|-----|------------|
| Free | 10 | 10,000 | 100,000 | 2 |
| Starter | 30 | 50,000 | 500,000 | 5 |
| Pro | 60 | 100,000 | 2,000,000 | 10 |
| Enterprise | 120 | 500,000 | 10,000,000 | 25 |

---

## Token Bucket Algorithm

FORGE uses the **Token Bucket** algorithm for rate limiting.

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                      TOKEN BUCKET                           │
│                                                             │
│   Capacity: 60 tokens (RPM limit)                          │
│   Refill Rate: 1 token per second                          │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │ ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●  │  │
│   │ ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●  │  │
│   │ ● ● ● ● ● ● ● ●                                     │  │
│   └─────────────────────────────────────────────────────┘  │
│                         ▲                                   │
│                         │                                   │
│                    58 tokens                                │
│                    remaining                                │
│                                                             │
│   Request arrives → Remove 1 token                         │
│   If bucket empty → Reject (429)                           │
│   Time passes → Refill tokens                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Benefits

- **Smooth traffic** — Allows bursts while maintaining average rate
- **Simple implementation** — Easy to understand and debug
- **Redis-friendly** — Atomic operations with Lua scripts

---

## Redis Implementation

### Data Structures

```
# Request rate limiting (RPM)
rate_limit:rpm:{api_key_id}
  - tokens: float (remaining tokens)
  - last_update: timestamp

# Token rate limiting (TPM)
rate_limit:tpm:{api_key_id}
  - tokens: float (remaining tokens)
  - last_update: timestamp

# Daily token tracking (TPD)
rate_limit:tpd:{user_id}:{date}
  - tokens_used: int

# Concurrent request tracking
rate_limit:concurrent:{api_key_id}
  - count: int
```

### Lua Script for Atomic Rate Limiting

```lua
-- rate_limit.lua
-- Token bucket rate limiting with atomic Redis operations

local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])  -- tokens per second
local requested = tonumber(ARGV[3])
local now = tonumber(ARGV[4])

-- Get current state
local bucket = redis.call('HMGET', key, 'tokens', 'last_update')
local tokens = tonumber(bucket[1])
local last_update = tonumber(bucket[2])

-- Initialize if not exists
if tokens == nil then
    tokens = capacity
    last_update = now
end

-- Calculate refill
local elapsed = now - last_update
local refill = elapsed * refill_rate
tokens = math.min(capacity, tokens + refill)

-- Check if request can be fulfilled
if tokens >= requested then
    tokens = tokens - requested
    redis.call('HMSET', key, 'tokens', tokens, 'last_update', now)
    redis.call('EXPIRE', key, 120)  -- 2 minute TTL
    return {1, tokens, capacity}  -- allowed, remaining, limit
else
    redis.call('HMSET', key, 'tokens', tokens, 'last_update', now)
    redis.call('EXPIRE', key, 120)
    local retry_after = (requested - tokens) / refill_rate
    return {0, tokens, capacity, retry_after}  -- denied, remaining, limit, retry_after
end
```

### Python Implementation

```python
# api/services/rate_limiter.py

import redis
import time
from typing import Tuple, Optional
from dataclasses import dataclass
from enum import Enum

redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

# Load Lua script
with open('rate_limit.lua', 'r') as f:
    RATE_LIMIT_SCRIPT = redis_client.register_script(f.read())


class RateLimitType(Enum):
    RPM = "rpm"
    TPM = "tpm"
    TPD = "tpd"
    CONCURRENT = "concurrent"


@dataclass
class RateLimitResult:
    allowed: bool
    remaining: int
    limit: int
    reset_at: Optional[float] = None
    retry_after: Optional[float] = None


@dataclass
class PlanLimits:
    rpm: int
    tpm: int
    tpd: int
    concurrent: int


PLAN_LIMITS = {
    "free": PlanLimits(rpm=10, tpm=10_000, tpd=100_000, concurrent=2),
    "starter": PlanLimits(rpm=30, tpm=50_000, tpd=500_000, concurrent=5),
    "pro": PlanLimits(rpm=60, tpm=100_000, tpd=2_000_000, concurrent=10),
    "enterprise": PlanLimits(rpm=120, tpm=500_000, tpd=10_000_000, concurrent=25),
}


def get_plan_limits(plan: str) -> PlanLimits:
    """Get rate limits for a plan."""
    return PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])


class RateLimiter:
    """Multi-dimensional rate limiter using Redis."""
    
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
    
    def check_rpm(
        self,
        api_key_id: str,
        plan: str,
        requested: int = 1
    ) -> RateLimitResult:
        """Check requests per minute limit."""
        limits = get_plan_limits(plan)
        key = f"rate_limit:rpm:{api_key_id}"
        
        # Capacity = RPM, refill_rate = RPM / 60 (per second)
        result = RATE_LIMIT_SCRIPT(
            keys=[key],
            args=[limits.rpm, limits.rpm / 60, requested, time.time()]
        )
        
        allowed = result[0] == 1
        remaining = int(result[1])
        limit = int(result[2])
        retry_after = result[3] if len(result) > 3 else None
        
        return RateLimitResult(
            allowed=allowed,
            remaining=remaining,
            limit=limit,
            reset_at=time.time() + 60,
            retry_after=retry_after
        )
    
    def check_tpm(
        self,
        api_key_id: str,
        plan: str,
        tokens: int
    ) -> RateLimitResult:
        """Check tokens per minute limit."""
        limits = get_plan_limits(plan)
        key = f"rate_limit:tpm:{api_key_id}"
        
        result = RATE_LIMIT_SCRIPT(
            keys=[key],
            args=[limits.tpm, limits.tpm / 60, tokens, time.time()]
        )
        
        allowed = result[0] == 1
        remaining = int(result[1])
        limit = int(result[2])
        retry_after = result[3] if len(result) > 3 else None
        
        return RateLimitResult(
            allowed=allowed,
            remaining=remaining,
            limit=limit,
            reset_at=time.time() + 60,
            retry_after=retry_after
        )
    
    def check_tpd(
        self,
        user_id: str,
        plan: str,
        tokens: int
    ) -> RateLimitResult:
        """Check tokens per day limit."""
        limits = get_plan_limits(plan)
        today = time.strftime("%Y-%m-%d")
        key = f"rate_limit:tpd:{user_id}:{today}"
        
        # Get current usage
        current = self.redis.get(key)
        current_usage = int(current) if current else 0
        
        if current_usage + tokens > limits.tpd:
            return RateLimitResult(
                allowed=False,
                remaining=max(0, limits.tpd - current_usage),
                limit=limits.tpd,
                reset_at=self._get_midnight_timestamp()
            )
        
        return RateLimitResult(
            allowed=True,
            remaining=limits.tpd - current_usage - tokens,
            limit=limits.tpd
        )
    
    def record_tpd_usage(self, user_id: str, tokens: int):
        """Record token usage for daily tracking."""
        today = time.strftime("%Y-%m-%d")
        key = f"rate_limit:tpd:{user_id}:{today}"
        
        pipe = self.redis.pipeline()
        pipe.incrby(key, tokens)
        pipe.expire(key, 86400 * 2)  # 2 day TTL
        pipe.execute()
    
    def check_concurrent(
        self,
        api_key_id: str,
        plan: str
    ) -> RateLimitResult:
        """Check concurrent request limit."""
        limits = get_plan_limits(plan)
        key = f"rate_limit:concurrent:{api_key_id}"
        
        current = self.redis.get(key)
        current_count = int(current) if current else 0
        
        if current_count >= limits.concurrent:
            return RateLimitResult(
                allowed=False,
                remaining=0,
                limit=limits.concurrent
            )
        
        return RateLimitResult(
            allowed=True,
            remaining=limits.concurrent - current_count - 1,
            limit=limits.concurrent
        )
    
    def increment_concurrent(self, api_key_id: str):
        """Increment concurrent request counter."""
        key = f"rate_limit:concurrent:{api_key_id}"
        pipe = self.redis.pipeline()
        pipe.incr(key)
        pipe.expire(key, 300)  # 5 minute TTL (safety)
        pipe.execute()
    
    def decrement_concurrent(self, api_key_id: str):
        """Decrement concurrent request counter."""
        key = f"rate_limit:concurrent:{api_key_id}"
        self.redis.decr(key)
    
    def _get_midnight_timestamp(self) -> float:
        """Get timestamp of next midnight UTC."""
        import datetime
        now = datetime.datetime.utcnow()
        midnight = datetime.datetime(now.year, now.month, now.day) + datetime.timedelta(days=1)
        return midnight.timestamp()


# Global instance
rate_limiter = RateLimiter(redis_client)
```

---

## FastAPI Middleware

```python
# api/middleware/rate_limit.py

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from ..services.rate_limiter import rate_limiter, RateLimitResult
from ..auth.api_key import ApiKeyData


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware to enforce rate limits on API requests."""
    
    async def dispatch(self, request: Request, call_next):
        # Skip non-API routes
        if not request.url.path.startswith("/v1/"):
            return await call_next(request)
        
        # Get API key data from request state (set by auth middleware)
        api_key_data: ApiKeyData = getattr(request.state, "api_key_data", None)
        if not api_key_data:
            return await call_next(request)
        
        api_key_id = str(api_key_data.api_key.id)
        user_id = str(api_key_data.user.id)
        plan = api_key_data.plan
        
        # Check RPM
        rpm_result = rate_limiter.check_rpm(api_key_id, plan)
        if not rpm_result.allowed:
            return self._rate_limit_response(rpm_result, "requests")
        
        # Check concurrent
        concurrent_result = rate_limiter.check_concurrent(api_key_id, plan)
        if not concurrent_result.allowed:
            return self._rate_limit_response(concurrent_result, "concurrent requests")
        
        # Increment concurrent counter
        rate_limiter.increment_concurrent(api_key_id)
        
        try:
            # Process request
            response = await call_next(request)
            
            # Add rate limit headers
            response.headers["X-RateLimit-Limit-Requests"] = str(rpm_result.limit)
            response.headers["X-RateLimit-Remaining-Requests"] = str(rpm_result.remaining)
            response.headers["X-RateLimit-Reset"] = str(int(rpm_result.reset_at))
            
            return response
        finally:
            # Decrement concurrent counter
            rate_limiter.decrement_concurrent(api_key_id)
    
    def _rate_limit_response(self, result: RateLimitResult, limit_type: str) -> JSONResponse:
        """Generate a 429 rate limit response."""
        headers = {
            "X-RateLimit-Limit": str(result.limit),
            "X-RateLimit-Remaining": str(result.remaining),
            "Retry-After": str(int(result.retry_after or 60))
        }
        
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "error": {
                    "message": f"Rate limit exceeded for {limit_type}. Please retry after {int(result.retry_after or 60)} seconds.",
                    "type": "rate_limit_error",
                    "code": "rate_limit_exceeded"
                }
            },
            headers=headers
        )
```

---

## Token-Based Rate Limiting

For TPM/TPD limits, we need to estimate tokens **before** the request completes.

### Pre-Request Estimation

```python
# api/services/token_estimator.py

import tiktoken

# Use cl100k_base as approximation (GPT-4 tokenizer)
ENCODING = tiktoken.get_encoding("cl100k_base")


def estimate_prompt_tokens(messages: list) -> int:
    """Estimate tokens in a chat completion request."""
    total = 0
    for message in messages:
        # ~4 tokens per message overhead
        total += 4
        total += len(ENCODING.encode(message.get("content", "")))
        total += len(ENCODING.encode(message.get("role", "")))
    total += 2  # Assistant priming
    return total


def estimate_completion_tokens(max_tokens: int) -> int:
    """Estimate maximum completion tokens."""
    # Use max_tokens as upper bound
    return max_tokens
```

### Rate Limit Check Flow

```python
# api/routes/completions.py

from fastapi import APIRouter, Depends, HTTPException, status
from ..auth.api_key import validate_api_key, ApiKeyData
from ..services.rate_limiter import rate_limiter
from ..services.token_estimator import estimate_prompt_tokens, estimate_completion_tokens
from ..services.usage import record_usage

router = APIRouter()


@router.post("/v1/chat/completions")
async def chat_completions(
    request: ChatCompletionRequest,
    api_key_data: ApiKeyData = Depends(validate_api_key)
):
    api_key_id = str(api_key_data.api_key.id)
    user_id = str(api_key_data.user.id)
    plan = api_key_data.plan
    
    # Estimate tokens
    prompt_tokens = estimate_prompt_tokens(request.messages)
    max_completion = request.max_tokens or 4096
    estimated_total = prompt_tokens + max_completion
    
    # Check TPM (tokens per minute)
    tpm_result = rate_limiter.check_tpm(api_key_id, plan, estimated_total)
    if not tpm_result.allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": {
                    "message": f"Token rate limit exceeded. {tpm_result.remaining} tokens remaining.",
                    "type": "rate_limit_error",
                    "code": "tokens_per_minute_exceeded"
                }
            },
            headers={
                "X-RateLimit-Limit-Tokens": str(tpm_result.limit),
                "X-RateLimit-Remaining-Tokens": str(tpm_result.remaining),
                "Retry-After": str(int(tpm_result.retry_after or 60))
            }
        )
    
    # Check TPD (tokens per day)
    tpd_result = rate_limiter.check_tpd(user_id, plan, estimated_total)
    if not tpd_result.allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": {
                    "message": f"Daily token limit exceeded. Resets at midnight UTC.",
                    "type": "rate_limit_error",
                    "code": "tokens_per_day_exceeded"
                }
            }
        )
    
    # Process request...
    response = await process_inference(request)
    
    # Record actual usage
    actual_tokens = response.usage.total_tokens
    rate_limiter.record_tpd_usage(user_id, actual_tokens)
    await record_usage(
        user_id=user_id,
        api_key_id=api_key_id,
        model=request.model,
        prompt_tokens=response.usage.prompt_tokens,
        completion_tokens=response.usage.completion_tokens
    )
    
    return response
```

---

## Usage Tracking

### Recording Usage

```python
# api/services/usage.py

from datetime import datetime
from typing import Optional
import uuid
from ..db.database import get_db


async def record_usage(
    user_id: str,
    api_key_id: str,
    model: str,
    prompt_tokens: int,
    completion_tokens: int,
    latency_ms: Optional[int] = None,
    status: str = "success"
):
    """Record a usage event in the database."""
    db = await get_db()
    
    request_id = f"req_{uuid.uuid4().hex[:24]}"
    total_tokens = prompt_tokens + completion_tokens
    
    await db.execute(
        """
        INSERT INTO usage_records (
            user_id, api_key_id, request_id, model,
            prompt_tokens, completion_tokens, total_tokens,
            latency_ms, status
        ) VALUES (
            :user_id, :api_key_id, :request_id, :model,
            :prompt_tokens, :completion_tokens, :total_tokens,
            :latency_ms, :status
        )
        """,
        {
            "user_id": user_id,
            "api_key_id": api_key_id,
            "request_id": request_id,
            "model": model,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": total_tokens,
            "latency_ms": latency_ms,
            "status": status
        }
    )
    
    return request_id


async def get_usage_summary(
    user_id: str,
    start_date: datetime,
    end_date: datetime,
    granularity: str = "day"
) -> dict:
    """Get usage summary for a user."""
    db = await get_db()
    
    if granularity == "day":
        query = """
            SELECT 
                DATE(created_at) as date,
                SUM(prompt_tokens) as prompt_tokens,
                SUM(completion_tokens) as completion_tokens,
                SUM(total_tokens) as total_tokens,
                COUNT(*) as requests
            FROM usage_records
            WHERE user_id = :user_id
              AND created_at >= :start_date
              AND created_at < :end_date
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        """
    elif granularity == "hour":
        query = """
            SELECT 
                DATE_TRUNC('hour', created_at) as date,
                SUM(prompt_tokens) as prompt_tokens,
                SUM(completion_tokens) as completion_tokens,
                SUM(total_tokens) as total_tokens,
                COUNT(*) as requests
            FROM usage_records
            WHERE user_id = :user_id
              AND created_at >= :start_date
              AND created_at < :end_date
            GROUP BY DATE_TRUNC('hour', created_at)
            ORDER BY date DESC
        """
    else:  # total
        query = """
            SELECT 
                SUM(prompt_tokens) as prompt_tokens,
                SUM(completion_tokens) as completion_tokens,
                SUM(total_tokens) as total_tokens,
                COUNT(*) as requests
            FROM usage_records
            WHERE user_id = :user_id
              AND created_at >= :start_date
              AND created_at < :end_date
        """
    
    result = await db.execute(query, {
        "user_id": user_id,
        "start_date": start_date,
        "end_date": end_date
    })
    
    return result.fetchall()


async def calculate_cost(
    prompt_tokens: int,
    completion_tokens: int,
    model: str = "forge-400b"
) -> float:
    """Calculate cost for token usage."""
    # Pricing per 1K tokens
    PRICING = {
        "forge-400b": {"prompt": 0.003, "completion": 0.006}
    }
    
    prices = PRICING.get(model, PRICING["forge-400b"])
    
    prompt_cost = (prompt_tokens / 1000) * prices["prompt"]
    completion_cost = (completion_tokens / 1000) * prices["completion"]
    
    return round(prompt_cost + completion_cost, 6)
```

### Usage API Endpoint

```python
# api/routes/usage.py

from fastapi import APIRouter, Depends, Query
from datetime import datetime, timedelta
from ..auth.dependencies import get_current_user
from ..services.usage import get_usage_summary, calculate_cost
from ..db.models import User

router = APIRouter()


@router.get("/v1/usage")
async def get_usage(
    start_date: datetime = Query(default=None),
    end_date: datetime = Query(default=None),
    granularity: str = Query(default="day", regex="^(day|hour|total)$"),
    user: User = Depends(get_current_user)
):
    """Get usage statistics for the authenticated user."""
    
    # Default to last 30 days
    if not end_date:
        end_date = datetime.utcnow()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    # Get usage data
    usage_data = await get_usage_summary(
        user_id=str(user.id),
        start_date=start_date,
        end_date=end_date,
        granularity=granularity
    )
    
    # Format response
    data = []
    total_prompt = 0
    total_completion = 0
    total_requests = 0
    
    for row in usage_data:
        cost = await calculate_cost(row.prompt_tokens, row.completion_tokens)
        
        if granularity != "total":
            data.append({
                "date": row.date.isoformat() if hasattr(row, 'date') else None,
                "prompt_tokens": row.prompt_tokens,
                "completion_tokens": row.completion_tokens,
                "total_tokens": row.total_tokens,
                "requests": row.requests,
                "cost": cost
            })
        
        total_prompt += row.prompt_tokens or 0
        total_completion += row.completion_tokens or 0
        total_requests += row.requests or 0
    
    total_cost = await calculate_cost(total_prompt, total_completion)
    
    return {
        "object": "usage",
        "data": data,
        "total": {
            "prompt_tokens": total_prompt,
            "completion_tokens": total_completion,
            "total_tokens": total_prompt + total_completion,
            "requests": total_requests,
            "cost": total_cost
        }
    }
```

---

## Rate Limit Headers

Every API response includes rate limit headers:

```
X-RateLimit-Limit-Requests: 60
X-RateLimit-Remaining-Requests: 55
X-RateLimit-Limit-Tokens: 100000
X-RateLimit-Remaining-Tokens: 95000
X-RateLimit-Reset: 1709654400
```

On 429 responses:
```
Retry-After: 60
```

---

## Custom Rate Limits

Enterprise users can have custom rate limits stored in `rate_limit_overrides` table.

```python
async def get_user_limits(user_id: str, plan: str) -> PlanLimits:
    """Get rate limits for a user, checking for overrides."""
    db = await get_db()
    
    # Check for override
    result = await db.execute(
        "SELECT * FROM rate_limit_overrides WHERE user_id = :user_id",
        {"user_id": user_id}
    )
    override = result.fetchone()
    
    if override:
        return PlanLimits(
            rpm=override.requests_per_minute,
            tpm=override.tokens_per_minute,
            tpd=override.tokens_per_day,
            concurrent=10  # Default
        )
    
    return get_plan_limits(plan)
```

---

## Monitoring Rate Limits

### Prometheus Metrics

```python
# api/services/metrics.py

from prometheus_client import Counter, Histogram, Gauge

# Rate limit metrics
rate_limit_hits = Counter(
    'forge_rate_limit_hits_total',
    'Total rate limit hits',
    ['limit_type', 'plan']
)

rate_limit_remaining = Gauge(
    'forge_rate_limit_remaining',
    'Remaining rate limit capacity',
    ['api_key_id', 'limit_type']
)

tokens_used = Counter(
    'forge_tokens_used_total',
    'Total tokens used',
    ['model', 'token_type']
)

request_latency = Histogram(
    'forge_request_latency_seconds',
    'Request latency in seconds',
    ['endpoint', 'model']
)
```

### Alerting Rules

```yaml
# monitoring/prometheus/alerts.yml

groups:
  - name: rate_limits
    rules:
      - alert: HighRateLimitHits
        expr: rate(forge_rate_limit_hits_total[5m]) > 100
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High rate limit hit rate"
          description: "More than 100 rate limit hits per 5 minutes"
      
      - alert: UserApproachingDailyLimit
        expr: forge_tokens_used_daily / forge_tokens_limit_daily > 0.9
        for: 1m
        labels:
          severity: info
        annotations:
          summary: "User approaching daily token limit"
```
