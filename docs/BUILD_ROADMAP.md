# FORGE V1 — Implementation Roadmap

## Overview

This document provides a step-by-step implementation plan for building FORGE from scratch.

**Estimated Timeline:** 4-6 weeks for MVP

**V1 Target:** DeepSeek Coder V2 on 4x H100 (~$5k/mo)

---

## Build Order (CRITICAL)

Follow this exact order per the Master Blueprint:

| Phase | Focus | Duration |
|-------|-------|----------|
| 1 | Core Backend | Week 1-2 |
| 2 | Inference | Week 2-3 |
| 3 | Billing | Week 3 |
| 4 | Frontend | Week 3-4 |
| 5 | Deployment | Week 4-5 |

---

## Phase 1: Core Backend (Week 1-2)

### 1.1 Project Setup

**Tasks:**
- [ ] Initialize Git repository
- [ ] Create directory structure
- [ ] Set up development environment
- [ ] Configure linting and formatting

**Commands:**
```bash
# Create project structure
mkdir -p forge/{api,web,inference,db,infra,monitoring,scripts,tests,docs}

# Initialize API (FastAPI)
cd forge/api
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install fastapi uvicorn pydantic sqlalchemy alembic asyncpg redis

# Initialize Frontend (Next.js)
cd ../web
npx create-next-app@latest . --typescript --tailwind --eslint --app
npx shadcn-ui@latest init
```

**Deliverables:**
- Working project structure
- Development environment ready
- Basic README.md

---

### 1.2 Database Schema

**Tasks:**
- [ ] Create PostgreSQL schema
- [ ] Set up Alembic migrations
- [ ] Create SQLAlchemy models
- [ ] Test database connection

**Files to Create:**

```python
# api/db/models.py

from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from .database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    email_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    api_keys = relationship("ApiKey", back_populates="user", cascade="all, delete-orphan")
    usage_records = relationship("UsageRecord", back_populates="user", cascade="all, delete-orphan")
    subscription = relationship("Subscription", back_populates="user", uselist=False)


class ApiKey(Base):
    __tablename__ = "api_keys"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    key_hash = Column(String(64), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False, default="Default")
    prefix = Column(String(12), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_used_at = Column(DateTime(timezone=True))
    expires_at = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)
    
    user = relationship("User", back_populates="api_keys")


class UsageRecord(Base):
    __tablename__ = "usage_records"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    api_key_id = Column(UUID(as_uuid=True), ForeignKey("api_keys.id", ondelete="SET NULL"))
    request_id = Column(String(64), unique=True, nullable=False)
    model = Column(String(64), nullable=False)
    prompt_tokens = Column(Integer, nullable=False, default=0)
    completion_tokens = Column(Integer, nullable=False, default=0)
    total_tokens = Column(Integer, nullable=False, default=0)
    latency_ms = Column(Integer)
    status = Column(String(20), nullable=False, default="success")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    user = relationship("User", back_populates="usage_records")


class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    stripe_customer_id = Column(String(64), unique=True, nullable=False)
    stripe_subscription_id = Column(String(64), unique=True)
    plan = Column(String(32), nullable=False, default="free")
    status = Column(String(32), nullable=False, default="active")
    current_period_start = Column(DateTime(timezone=True))
    current_period_end = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user = relationship("User", back_populates="subscription")


class RateLimitOverride(Base):
    __tablename__ = "rate_limit_overrides"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    requests_per_minute = Column(Integer, nullable=False, default=60)
    tokens_per_minute = Column(Integer, nullable=False, default=100000)
    tokens_per_day = Column(Integer, nullable=False, default=1000000)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
```

```python
# api/db/database.py

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://localhost/forge")

engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()


async def get_db():
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
```

**Deliverables:**
- Database schema defined
- Migrations working
- Models created

---

## Phase 2: Authentication (Week 1-2)

### 2.1 User Authentication

**Tasks:**
- [ ] Implement password hashing (Argon2)
- [ ] Implement JWT token generation
- [ ] Create auth routes (register, login, refresh)
- [ ] Create auth middleware

**Files to Create:**

```python
# api/auth/jwt.py

from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext
import os

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: str, email: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user_id,
        "email": email,
        "type": "access",
        "exp": expire
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    import uuid
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": user_id,
        "type": "refresh",
        "jti": str(uuid.uuid4()),
        "exp": expire
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None
```

```python
# api/auth/routes.py

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..db.database import get_db
from ..db.models import User, Subscription
from .jwt import hash_password, verify_password, create_access_token, create_refresh_token, decode_token

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 900


@router.post("/register")
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check if email exists
    result = await db.execute(select(User).where(User.email == request.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=request.email,
        password_hash=hash_password(request.password),
        name=request.name
    )
    db.add(user)
    await db.flush()
    
    return {"id": str(user.id), "email": user.email, "message": "Registration successful"}


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where(User.email == request.email, User.is_active == True)
    )
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return TokenResponse(
        access_token=create_access_token(str(user.id), user.email),
        refresh_token=create_refresh_token(str(user.id))
    )


@router.post("/refresh")
async def refresh(refresh_token: str, db: AsyncSession = Depends(get_db)):
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    result = await db.execute(
        select(User).where(User.id == payload["sub"], User.is_active == True)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return {
        "access_token": create_access_token(str(user.id), user.email),
        "token_type": "bearer",
        "expires_in": 900
    }
```

**Deliverables:**
- User registration working
- User login working
- JWT tokens generated
- Token refresh working

---

### 2.2 API Key System

**Tasks:**
- [ ] Implement API key generation
- [ ] Implement API key hashing
- [ ] Create API key routes
- [ ] Create API key validation middleware

**Files to Create:**

```python
# api/services/api_keys.py

import secrets
import hashlib
from typing import Tuple

PREFIX = "sk-forge-"
KEY_LENGTH = 32


def generate_api_key() -> Tuple[str, str, str]:
    """Generate API key, hash, and prefix."""
    random_part = secrets.token_urlsafe(KEY_LENGTH)[:KEY_LENGTH]
    full_key = f"{PREFIX}{random_part}"
    key_hash = hashlib.sha256(full_key.encode()).hexdigest()
    prefix = full_key[:12]
    return full_key, key_hash, prefix


def hash_api_key(key: str) -> str:
    """Hash an API key."""
    return hashlib.sha256(key.encode()).hexdigest()


def validate_api_key_format(key: str) -> bool:
    """Validate API key format."""
    return key.startswith(PREFIX) and len(key) == len(PREFIX) + KEY_LENGTH
```

```python
# api/auth/api_key.py

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from ..db.database import get_db
from ..db.models import ApiKey, User, Subscription
from ..services.api_keys import hash_api_key, validate_api_key_format

security = HTTPBearer()


class ApiKeyData:
    def __init__(self, user: User, api_key: ApiKey, subscription: Subscription):
        self.user = user
        self.api_key = api_key
        self.subscription = subscription
        self.plan = subscription.plan if subscription else "free"


async def validate_api_key(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> ApiKeyData:
    key = credentials.credentials
    
    if not validate_api_key_format(key):
        raise HTTPException(status_code=401, detail="Invalid API key format")
    
    key_hash = hash_api_key(key)
    
    result = await db.execute(
        select(ApiKey, User, Subscription)
        .join(User, ApiKey.user_id == User.id)
        .outerjoin(Subscription, User.id == Subscription.user_id)
        .where(ApiKey.key_hash == key_hash)
    )
    row = result.first()
    
    if not row:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    api_key, user, subscription = row
    
    if not api_key.is_active:
        raise HTTPException(status_code=401, detail="API key revoked")
    
    if api_key.expires_at and api_key.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="API key expired")
    
    if not user.is_active:
        raise HTTPException(status_code=401, detail="User inactive")
    
    # Update last_used_at
    api_key.last_used_at = datetime.utcnow()
    
    return ApiKeyData(user, api_key, subscription)
```

**Deliverables:**
- API key generation working
- API key validation working
- API key CRUD routes

---

## Phase 3: Rate Limiting & Usage (Week 2)

### 3.1 Rate Limiting

**Tasks:**
- [ ] Set up Redis connection
- [ ] Implement token bucket algorithm
- [ ] Create rate limit middleware
- [ ] Add rate limit headers

**Files to Create:**

```python
# api/services/rate_limiter.py

import redis
import time
from dataclasses import dataclass
from typing import Optional
import os

redis_client = redis.Redis.from_url(
    os.getenv("REDIS_URL", "redis://localhost:6379"),
    decode_responses=True
)


@dataclass
class RateLimitResult:
    allowed: bool
    remaining: int
    limit: int
    reset_at: float
    retry_after: Optional[float] = None


PLAN_LIMITS = {
    "free": {"rpm": 10, "tpm": 10000, "tpd": 100000},
    "starter": {"rpm": 30, "tpm": 50000, "tpd": 500000},
    "pro": {"rpm": 60, "tpm": 100000, "tpd": 2000000},
    "enterprise": {"rpm": 120, "tpm": 500000, "tpd": 10000000},
}


class RateLimiter:
    def check_rpm(self, api_key_id: str, plan: str) -> RateLimitResult:
        limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
        key = f"rate_limit:rpm:{api_key_id}"
        
        now = time.time()
        window_start = now - 60
        
        pipe = redis_client.pipeline()
        pipe.zremrangebyscore(key, 0, window_start)
        pipe.zcard(key)
        pipe.zadd(key, {str(now): now})
        pipe.expire(key, 120)
        results = pipe.execute()
        
        current_count = results[1]
        
        if current_count >= limits["rpm"]:
            return RateLimitResult(
                allowed=False,
                remaining=0,
                limit=limits["rpm"],
                reset_at=now + 60,
                retry_after=60
            )
        
        return RateLimitResult(
            allowed=True,
            remaining=limits["rpm"] - current_count - 1,
            limit=limits["rpm"],
            reset_at=now + 60
        )
    
    def record_tokens(self, user_id: str, tokens: int):
        today = time.strftime("%Y-%m-%d")
        key = f"rate_limit:tpd:{user_id}:{today}"
        redis_client.incrby(key, tokens)
        redis_client.expire(key, 86400 * 2)


rate_limiter = RateLimiter()
```

**Deliverables:**
- Redis connection working
- RPM limiting working
- TPM limiting working
- TPD tracking working

---

### 3.2 Usage Tracking

**Tasks:**
- [ ] Create usage recording service
- [ ] Create usage query service
- [ ] Create usage API endpoint

**Deliverables:**
- Usage recording working
- Usage queries working
- Usage endpoint returning data

---

## Phase 4: Inference Integration (Week 2-3)

### 4.1 vLLM Client

**Tasks:**
- [ ] Create HTTP client for vLLM
- [ ] Implement chat completion proxy
- [ ] Implement streaming support
- [ ] Add error handling and retries

**Files to Create:**

```python
# api/services/inference.py

import httpx
import json
from typing import AsyncIterator, List, Dict, Any
import os

INFERENCE_URL = os.getenv("INFERENCE_URL", "http://localhost:8000")


class InferenceClient:
    def __init__(self):
        self.client = httpx.AsyncClient(
            base_url=INFERENCE_URL,
            timeout=httpx.Timeout(300.0)
        )
    
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = "forge-400b",
        temperature: float = 0.7,
        max_tokens: int = 4096,
        **kwargs
    ) -> Dict[str, Any]:
        response = await self.client.post(
            "/v1/chat/completions",
            json={
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
                **kwargs
            }
        )
        response.raise_for_status()
        return response.json()
    
    async def chat_completion_stream(
        self,
        messages: List[Dict[str, str]],
        model: str = "forge-400b",
        **kwargs
    ) -> AsyncIterator[str]:
        async with self.client.stream(
            "POST",
            "/v1/chat/completions",
            json={
                "model": model,
                "messages": messages,
                "stream": True,
                **kwargs
            }
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    yield line[6:]
    
    async def health_check(self) -> bool:
        try:
            response = await self.client.get("/health")
            return response.status_code == 200
        except:
            return False


inference_client = InferenceClient()
```

**Deliverables:**
- Inference client working
- Chat completions proxied
- Streaming working

---

### 4.2 Completion Endpoints

**Tasks:**
- [ ] Create /v1/chat/completions endpoint
- [ ] Create /v1/completions endpoint
- [ ] Create /v1/models endpoint
- [ ] Integrate rate limiting
- [ ] Integrate usage tracking

**Deliverables:**
- All completion endpoints working
- Rate limiting integrated
- Usage tracking integrated

---

## Phase 5: Billing (Week 3)

### 5.1 Stripe Integration

**Tasks:**
- [ ] Set up Stripe SDK
- [ ] Create Stripe products/prices
- [ ] Implement checkout session creation
- [ ] Implement customer portal
- [ ] Implement webhook handling

**Deliverables:**
- Stripe checkout working
- Customer portal working
- Webhooks processing correctly

---

## Phase 6: Frontend (Week 3-4)

### 6.1 Landing Page

**Tasks:**
- [ ] Create landing page layout
- [ ] Create hero section
- [ ] Create features section
- [ ] Create pricing preview
- [ ] Create footer

**Deliverables:**
- Landing page complete
- Responsive design

---

### 6.2 Dashboard

**Tasks:**
- [ ] Create dashboard layout
- [ ] Create API keys page
- [ ] Create usage page
- [ ] Create billing page
- [ ] Create settings page

**Deliverables:**
- All dashboard pages working
- API key management working
- Usage charts working
- Billing integration working

---

## Phase 7: GPU Infrastructure (Week 4)

### 7.1 vLLM Setup

**Tasks:**
- [ ] Create inference Dockerfile
- [ ] Download model weights
- [ ] Configure vLLM server
- [ ] Test inference locally

**Deliverables:**
- vLLM container built
- Model loaded
- Inference working

---

### 7.2 RunPod Deployment

**Tasks:**
- [ ] Create RunPod account
- [ ] Deploy GPU pod
- [ ] Configure networking
- [ ] Test end-to-end

**Deliverables:**
- GPU pod running
- API connected to inference
- End-to-end working

---

## Phase 8: Deployment (Week 4-5)

### 8.1 Render Deployment

**Tasks:**
- [ ] Create Render account
- [ ] Deploy PostgreSQL
- [ ] Deploy Redis
- [ ] Deploy API server
- [ ] Deploy frontend
- [ ] Configure environment variables

**Deliverables:**
- All services deployed
- Environment configured
- Health checks passing

---

### 8.2 DNS & SSL

**Tasks:**
- [ ] Configure Cloudflare
- [ ] Set up DNS records
- [ ] Configure SSL
- [ ] Test all endpoints

**Deliverables:**
- DNS configured
- SSL working
- All endpoints accessible

---

## Phase 9: Testing & Launch (Week 5-6)

### 9.1 Testing

**Tasks:**
- [ ] Write API tests
- [ ] Write integration tests
- [ ] Load testing
- [ ] Security testing

**Deliverables:**
- Test suite passing
- Load test results documented
- Security issues addressed

---

### 9.2 Launch

**Tasks:**
- [ ] Final checklist review
- [ ] Monitoring setup
- [ ] Alerting setup
- [ ] Documentation complete
- [ ] Launch announcement

**Deliverables:**
- Platform live
- Monitoring active
- Documentation published

---

## Quick Reference: Build Order

```
Week 1:
├── Day 1-2: Project setup, directory structure
├── Day 3-4: Database schema, migrations
└── Day 5-7: User authentication (register, login, JWT)

Week 2:
├── Day 1-2: API key system
├── Day 3-4: Rate limiting (Redis)
└── Day 5-7: Usage tracking

Week 3:
├── Day 1-3: Inference integration (vLLM client)
├── Day 4-5: Completion endpoints
└── Day 6-7: Stripe billing

Week 4:
├── Day 1-3: Frontend (landing, auth pages)
├── Day 4-5: Dashboard (API keys, usage)
└── Day 6-7: GPU infrastructure (vLLM, RunPod)

Week 5:
├── Day 1-2: Render deployment
├── Day 3-4: DNS, SSL, final config
└── Day 5-7: Testing

Week 6:
├── Day 1-2: Bug fixes
├── Day 3-4: Documentation
└── Day 5-7: Launch
```

---

## Critical Path

The following items are on the critical path and must be completed in order:

1. **Database schema** → Everything depends on this
2. **User authentication** → Required for API keys
3. **API key system** → Required for API access
4. **Rate limiting** → Required before public access
5. **Inference integration** → Core functionality
6. **Billing** → Required for monetization
7. **Frontend** → Required for user onboarding
8. **Deployment** → Required for launch

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Model too large | Start with smaller model, upgrade later |
| GPU costs too high | Use spot instances, implement auto-shutdown |
| Low adoption | Focus on developer experience, documentation |
| Security breach | Implement security best practices from day 1 |
| Scaling issues | Design for horizontal scaling from start |

---

## Success Metrics

### Launch Criteria

- [ ] 100% of API endpoints working
- [ ] <500ms P95 latency for non-inference requests
- [ ] <30s P95 latency for inference requests
- [ ] 99.9% uptime target
- [ ] All security checklist items complete

### Week 1 Post-Launch

- [ ] 10+ registered users
- [ ] 1+ paying customer
- [ ] No critical bugs
- [ ] Monitoring dashboards active
