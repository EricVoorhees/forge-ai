"""
FORGE API Key Authentication
Generate, hash, and validate API keys
"""

import secrets
import hashlib
from typing import Tuple, Optional
from dataclasses import dataclass
from datetime import datetime

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from db.database import get_db
from db.models import ApiKey, User, Subscription
from services.logging import get_logger

logger = get_logger("auth.api_key")

PREFIX = "sk-forge-"
KEY_LENGTH = 32

security = HTTPBearer()


def generate_api_key() -> Tuple[str, str, str]:
    """
    Generate a new API key.
    Returns: (full_key, key_hash, prefix)
    """
    logger.debug("Generating new API key")
    random_part = secrets.token_urlsafe(KEY_LENGTH)[:KEY_LENGTH]
    full_key = f"{PREFIX}{random_part}"
    key_hash = hashlib.sha256(full_key.encode()).hexdigest()
    prefix = full_key[:12]
    logger.info(f"API key generated with prefix: {prefix}")
    return full_key, key_hash, prefix


def hash_api_key(key: str) -> str:
    """Hash an API key for storage/lookup."""
    return hashlib.sha256(key.encode()).hexdigest()


def validate_api_key_format(key: str) -> bool:
    """Check if API key has valid format."""
    return key.startswith(PREFIX) and len(key) == len(PREFIX) + KEY_LENGTH


@dataclass
class ApiKeyData:
    """Validated API key context."""
    user: User
    api_key: ApiKey
    subscription: Optional[Subscription]
    plan: str
    
    @property
    def user_id(self) -> str:
        return str(self.user.id)
    
    @property
    def api_key_id(self) -> str:
        return str(self.api_key.id)


async def validate_api_key(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> ApiKeyData:
    """
    FastAPI dependency to validate API key from Authorization header.
    Usage: api_key: ApiKeyData = Depends(validate_api_key)
    """
    key = credentials.credentials
    key_prefix = key[:12] if len(key) >= 12 else key[:4]
    logger.debug(f"Validating API key: {key_prefix}...")
    
    if not validate_api_key_format(key):
        logger.warning(f"Invalid API key format: {key_prefix}...")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key format"
        )
    
    key_hash = hash_api_key(key)
    logger.debug(f"Looking up API key hash: {key_hash[:16]}...")
    
    result = await db.execute(
        select(ApiKey, User, Subscription)
        .join(User, ApiKey.user_id == User.id)
        .outerjoin(Subscription, User.id == Subscription.user_id)
        .where(ApiKey.key_hash == key_hash)
    )
    row = result.first()
    
    if not row:
        logger.warning(f"API key not found in database: {key_prefix}...")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    
    api_key, user, subscription = row
    logger.debug(f"API key found", extra={"api_key_id": str(api_key.id), "user_id": str(user.id)})
    
    if not api_key.is_active:
        logger.warning(f"API key is revoked", extra={"api_key_id": str(api_key.id)})
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key has been revoked"
        )
    
    if api_key.expires_at and api_key.expires_at < datetime.utcnow():
        logger.warning(f"API key has expired", extra={"api_key_id": str(api_key.id), "extra_data": {"expired_at": api_key.expires_at.isoformat()}})
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key has expired"
        )
    
    if not user.is_active:
        logger.warning(f"User account is inactive", extra={"user_id": str(user.id)})
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive"
        )
    
    api_key.last_used_at = datetime.utcnow()
    
    plan = subscription.plan if subscription else "free"
    
    # SECURITY: Require paid subscription for API access
    if plan == "free" or not subscription:
        logger.warning(f"API access denied: no paid subscription", extra={"user_id": str(user.id), "extra_data": {"plan": plan}})
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="API access requires a paid subscription. Please upgrade at https://openframe.co/pricing"
        )
    
    # Check subscription is active
    if subscription.status not in ("active", "trialing"):
        logger.warning(f"API access denied: subscription not active", extra={"user_id": str(user.id), "extra_data": {"status": subscription.status}})
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Subscription is {subscription.status}. Please update your payment method."
        )
    
    logger.info(f"API key validated successfully", extra={"api_key_id": str(api_key.id), "user_id": str(user.id), "extra_data": {"plan": plan}})
    
    return ApiKeyData(
        user=user,
        api_key=api_key,
        subscription=subscription,
        plan=plan
    )
