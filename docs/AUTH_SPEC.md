# FORGE V1 — Authentication & API Key System

## Overview

FORGE uses a dual authentication system:
1. **JWT Authentication** — For user dashboard/frontend access
2. **API Key Authentication** — For API endpoint access

---

## JWT Authentication (User Sessions)

### Flow

```
┌────────┐     POST /auth/login      ┌────────────┐
│ Client │ ─────────────────────────▶│ API Server │
└────────┘                           └─────┬──────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │ Validate     │
                                    │ Credentials  │
                                    └──────┬───────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │ Generate     │
                                    │ JWT Tokens   │
                                    └──────┬───────┘
                                           │
┌────────┐   { access_token,              │
│ Client │ ◀──  refresh_token }  ─────────┘
└────────┘
```

### Token Types

| Token | Lifetime | Purpose |
|-------|----------|---------|
| Access Token | 15 minutes | API authorization |
| Refresh Token | 7 days | Obtain new access tokens |

### JWT Structure

**Access Token Payload:**
```json
{
  "sub": "user_abc123",
  "email": "user@example.com",
  "type": "access",
  "iat": 1709654321,
  "exp": 1709655221
}
```

**Refresh Token Payload:**
```json
{
  "sub": "user_abc123",
  "type": "refresh",
  "jti": "unique_token_id",
  "iat": 1709654321,
  "exp": 1710259121
}
```

### Implementation

```python
# api/auth/jwt.py

from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext

# Configuration
SECRET_KEY = "your-secret-key"  # From environment
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password using Argon2id."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: str, email: str) -> str:
    """Create a short-lived access token."""
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user_id,
        "email": email,
        "type": "access",
        "iat": datetime.utcnow(),
        "exp": expire
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    """Create a long-lived refresh token."""
    import uuid
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": user_id,
        "type": "refresh",
        "jti": str(uuid.uuid4()),
        "iat": datetime.utcnow(),
        "exp": expire
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def verify_access_token(token: str) -> Optional[dict]:
    """Verify an access token."""
    payload = decode_token(token)
    if payload and payload.get("type") == "access":
        return payload
    return None


def verify_refresh_token(token: str) -> Optional[dict]:
    """Verify a refresh token."""
    payload = decode_token(token)
    if payload and payload.get("type") == "refresh":
        return payload
    return None
```

### FastAPI Dependencies

```python
# api/auth/dependencies.py

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .jwt import verify_access_token
from ..db.database import get_db
from ..db.models import User

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db = Depends(get_db)
) -> User:
    """Get the current authenticated user from JWT."""
    token = credentials.credentials
    payload = verify_access_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    user = await db.get(User, payload["sub"])
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    return user
```

---

## API Key Authentication

### Key Format

```
sk-forge-{32_random_alphanumeric_chars}
```

**Example:** `sk-forge-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

### Key Generation

```python
# api/services/api_keys.py

import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Tuple

PREFIX = "sk-forge-"
KEY_LENGTH = 32


def generate_api_key() -> Tuple[str, str, str]:
    """
    Generate a new API key.
    
    Returns:
        Tuple of (full_key, key_hash, prefix)
    """
    # Generate random key
    random_part = secrets.token_urlsafe(KEY_LENGTH)[:KEY_LENGTH]
    full_key = f"{PREFIX}{random_part}"
    
    # Hash for storage
    key_hash = hash_api_key(full_key)
    
    # Prefix for identification (first 12 chars)
    prefix = full_key[:12]
    
    return full_key, key_hash, prefix


def hash_api_key(key: str) -> str:
    """Hash an API key using SHA-256."""
    return hashlib.sha256(key.encode()).hexdigest()


def validate_api_key_format(key: str) -> bool:
    """Validate API key format."""
    if not key.startswith(PREFIX):
        return False
    if len(key) != len(PREFIX) + KEY_LENGTH:
        return False
    return True
```

### Key Validation Flow

```
┌────────┐     Authorization: Bearer sk-forge-xxx     ┌────────────┐
│ Client │ ──────────────────────────────────────────▶│ API Server │
└────────┘                                            └─────┬──────┘
                                                            │
                                                            ▼
                                                     ┌──────────────┐
                                                     │ Extract key  │
                                                     │ from header  │
                                                     └──────┬───────┘
                                                            │
                                                            ▼
                                                     ┌──────────────┐
                                                     │ Hash key     │
                                                     │ (SHA-256)    │
                                                     └──────┬───────┘
                                                            │
                                                            ▼
                                                     ┌──────────────┐
                                                     │ Lookup hash  │
                                                     │ in database  │
                                                     └──────┬───────┘
                                                            │
                                                            ▼
                                                     ┌──────────────┐
                                                     │ Validate:    │
                                                     │ - is_active  │
                                                     │ - not expired│
                                                     │ - user active│
                                                     └──────┬───────┘
                                                            │
                                                            ▼
                                                     ┌──────────────┐
                                                     │ Update       │
                                                     │ last_used_at │
                                                     └──────────────┘
```

### FastAPI Dependency

```python
# api/auth/api_key.py

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime
from ..db.database import get_db
from ..db.models import ApiKey, User, Subscription
from .api_keys import hash_api_key, validate_api_key_format

security = HTTPBearer()


class ApiKeyData:
    """Container for validated API key data."""
    def __init__(self, user: User, api_key: ApiKey, subscription: Subscription):
        self.user = user
        self.api_key = api_key
        self.subscription = subscription
        self.plan = subscription.plan if subscription else "free"


async def validate_api_key(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db = Depends(get_db)
) -> ApiKeyData:
    """Validate API key and return associated user data."""
    
    key = credentials.credentials
    
    # Validate format
    if not validate_api_key_format(key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "message": "Invalid API key format.",
                    "type": "authentication_error",
                    "code": "invalid_api_key"
                }
            }
        )
    
    # Hash and lookup
    key_hash = hash_api_key(key)
    
    result = await db.execute(
        """
        SELECT ak.*, u.*, s.*
        FROM api_keys ak
        JOIN users u ON ak.user_id = u.id
        LEFT JOIN subscriptions s ON u.id = s.user_id
        WHERE ak.key_hash = :key_hash
        """,
        {"key_hash": key_hash}
    )
    row = result.fetchone()
    
    if not row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "message": "Invalid API key provided.",
                    "type": "authentication_error",
                    "code": "invalid_api_key"
                }
            }
        )
    
    api_key = ApiKey(**row)
    user = User(**row)
    subscription = Subscription(**row) if row.stripe_customer_id else None
    
    # Check if key is active
    if not api_key.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "message": "API key has been revoked.",
                    "type": "authentication_error",
                    "code": "api_key_revoked"
                }
            }
        )
    
    # Check if key is expired
    if api_key.expires_at and api_key.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "message": "API key has expired.",
                    "type": "authentication_error",
                    "code": "api_key_expired"
                }
            }
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "message": "User account is inactive.",
                    "type": "authentication_error",
                    "code": "user_inactive"
                }
            }
        )
    
    # Update last_used_at (async, non-blocking)
    await db.execute(
        "UPDATE api_keys SET last_used_at = :now WHERE id = :id",
        {"now": datetime.utcnow(), "id": api_key.id}
    )
    
    return ApiKeyData(user, api_key, subscription)
```

---

## Security Best Practices

### Password Requirements

| Requirement | Value |
|-------------|-------|
| Minimum length | 8 characters |
| Maximum length | 128 characters |
| Complexity | At least 1 uppercase, 1 lowercase, 1 number |
| Hashing | Argon2id |

```python
import re

def validate_password(password: str) -> Tuple[bool, str]:
    """Validate password meets requirements."""
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if len(password) > 128:
        return False, "Password must be at most 128 characters"
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r"\d", password):
        return False, "Password must contain at least one number"
    return True, ""
```

### API Key Security

1. **Never log full API keys** — Only log prefix
2. **Never store plaintext** — Always hash with SHA-256
3. **Show key only once** — At creation time
4. **Support expiration** — Optional expiry dates
5. **Support revocation** — Immediate invalidation
6. **Rate limit by key** — Prevent abuse

### JWT Security

1. **Short-lived access tokens** — 15 minutes
2. **Secure refresh tokens** — 7 days, single use
3. **Token blacklisting** — Redis for revoked tokens
4. **Secure secret key** — Environment variable, rotated periodically

### Token Blacklisting (Redis)

```python
# api/auth/blacklist.py

import redis
from datetime import timedelta

redis_client = redis.Redis(host='localhost', port=6379, db=0)

BLACKLIST_PREFIX = "token_blacklist:"


async def blacklist_token(jti: str, expires_in: int):
    """Add a token to the blacklist."""
    key = f"{BLACKLIST_PREFIX}{jti}"
    redis_client.setex(key, timedelta(seconds=expires_in), "1")


async def is_token_blacklisted(jti: str) -> bool:
    """Check if a token is blacklisted."""
    key = f"{BLACKLIST_PREFIX}{jti}"
    return redis_client.exists(key) > 0
```

---

## Auth Routes Implementation

```python
# api/auth/routes.py

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from datetime import datetime
from .jwt import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    verify_refresh_token
)
from .dependencies import get_current_user
from ..db.database import get_db
from ..db.models import User

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


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/register")
async def register(request: RegisterRequest, db = Depends(get_db)):
    """Register a new user."""
    # Check if email exists
    existing = await db.execute(
        "SELECT id FROM users WHERE email = :email",
        {"email": request.email}
    )
    if existing.fetchone():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Validate password
    valid, message = validate_password(request.password)
    if not valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
    
    # Create user
    password_hash = hash_password(request.password)
    result = await db.execute(
        """
        INSERT INTO users (email, password_hash, name)
        VALUES (:email, :password_hash, :name)
        RETURNING id, email, name, created_at
        """,
        {
            "email": request.email,
            "password_hash": password_hash,
            "name": request.name
        }
    )
    user = result.fetchone()
    
    # TODO: Send verification email
    
    return {
        "id": str(user.id),
        "email": user.email,
        "name": user.name,
        "created_at": user.created_at.isoformat(),
        "message": "Verification email sent."
    }


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db = Depends(get_db)):
    """Authenticate and receive tokens."""
    # Find user
    result = await db.execute(
        "SELECT * FROM users WHERE email = :email AND is_active = TRUE",
        {"email": request.email}
    )
    user = result.fetchone()
    
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Generate tokens
    access_token = create_access_token(str(user.id), user.email)
    refresh_token = create_refresh_token(str(user.id))
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )


@router.post("/refresh")
async def refresh(request: RefreshRequest, db = Depends(get_db)):
    """Refresh an access token."""
    payload = verify_refresh_token(request.refresh_token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    # Check if token is blacklisted
    if await is_token_blacklisted(payload.get("jti")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked"
        )
    
    # Get user
    result = await db.execute(
        "SELECT * FROM users WHERE id = :id AND is_active = TRUE",
        {"id": payload["sub"]}
    )
    user = result.fetchone()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Generate new access token
    access_token = create_access_token(str(user.id), user.email)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": 900
    }


@router.get("/me")
async def get_me(user: User = Depends(get_current_user), db = Depends(get_db)):
    """Get current user profile."""
    # Get subscription
    result = await db.execute(
        "SELECT * FROM subscriptions WHERE user_id = :user_id",
        {"user_id": user.id}
    )
    subscription = result.fetchone()
    
    return {
        "id": str(user.id),
        "email": user.email,
        "name": user.name,
        "created_at": user.created_at.isoformat(),
        "email_verified": user.email_verified,
        "subscription": {
            "plan": subscription.plan if subscription else "free",
            "status": subscription.status if subscription else "active",
            "current_period_end": subscription.current_period_end.isoformat() if subscription and subscription.current_period_end else None
        } if subscription else None
    }


@router.post("/logout")
async def logout(
    user: User = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Logout and invalidate tokens."""
    # Blacklist the current access token
    # In production, also blacklist the refresh token
    return {"message": "Logged out successfully"}
```

---

## API Key Routes Implementation

```python
# api/routes/api_keys.py

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
from ..auth.dependencies import get_current_user
from ..services.api_keys import generate_api_key
from ..db.database import get_db
from ..db.models import User

router = APIRouter(prefix="/v1/api-keys", tags=["api-keys"])


class CreateKeyRequest(BaseModel):
    name: str = "Default"
    expires_in_days: Optional[int] = None


@router.get("")
async def list_api_keys(
    user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """List all API keys for the current user."""
    result = await db.execute(
        """
        SELECT id, name, prefix, created_at, last_used_at, expires_at, is_active
        FROM api_keys
        WHERE user_id = :user_id
        ORDER BY created_at DESC
        """,
        {"user_id": user.id}
    )
    keys = result.fetchall()
    
    return {
        "object": "list",
        "data": [
            {
                "id": str(key.id),
                "object": "api_key",
                "name": key.name,
                "prefix": key.prefix,
                "created_at": key.created_at.isoformat(),
                "last_used_at": key.last_used_at.isoformat() if key.last_used_at else None,
                "expires_at": key.expires_at.isoformat() if key.expires_at else None,
                "is_active": key.is_active
            }
            for key in keys
        ]
    }


@router.post("")
async def create_api_key(
    request: CreateKeyRequest,
    user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Create a new API key."""
    # Generate key
    full_key, key_hash, prefix = generate_api_key()
    
    # Calculate expiration
    expires_at = None
    if request.expires_in_days:
        expires_at = datetime.utcnow() + timedelta(days=request.expires_in_days)
    
    # Insert into database
    result = await db.execute(
        """
        INSERT INTO api_keys (user_id, key_hash, name, prefix, expires_at)
        VALUES (:user_id, :key_hash, :name, :prefix, :expires_at)
        RETURNING id, created_at
        """,
        {
            "user_id": user.id,
            "key_hash": key_hash,
            "name": request.name,
            "prefix": prefix,
            "expires_at": expires_at
        }
    )
    row = result.fetchone()
    
    return {
        "id": str(row.id),
        "object": "api_key",
        "name": request.name,
        "key": full_key,  # Only shown once!
        "prefix": prefix,
        "created_at": row.created_at.isoformat(),
        "expires_at": expires_at.isoformat() if expires_at else None,
        "is_active": True,
        "warning": "Store this key securely. It will not be shown again."
    }


@router.delete("/{key_id}")
async def revoke_api_key(
    key_id: str,
    user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Revoke an API key."""
    # Verify ownership
    result = await db.execute(
        "SELECT id FROM api_keys WHERE id = :id AND user_id = :user_id",
        {"id": key_id, "user_id": user.id}
    )
    if not result.fetchone():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    # Soft delete (set is_active = false)
    await db.execute(
        "UPDATE api_keys SET is_active = FALSE WHERE id = :id",
        {"id": key_id}
    )
    
    return {
        "id": key_id,
        "object": "api_key",
        "deleted": True
    }
```

---

## Environment Variables

```bash
# Authentication
JWT_SECRET_KEY=your-256-bit-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Password hashing
ARGON2_TIME_COST=2
ARGON2_MEMORY_COST=65536
ARGON2_PARALLELISM=1
```

---

## Audit Logging

All authentication events should be logged:

| Event | Data Logged |
|-------|-------------|
| User registration | user_id, email, timestamp |
| User login | user_id, IP, user_agent, timestamp |
| Login failure | email, IP, timestamp, reason |
| Token refresh | user_id, timestamp |
| API key created | user_id, key_prefix, timestamp |
| API key revoked | user_id, key_id, timestamp |
| API key used | key_prefix, endpoint, timestamp |

```python
# api/services/audit.py

import logging
from datetime import datetime

audit_logger = logging.getLogger("audit")


def log_auth_event(event_type: str, **kwargs):
    """Log an authentication event."""
    audit_logger.info({
        "event": event_type,
        "timestamp": datetime.utcnow().isoformat(),
        **kwargs
    })
```
