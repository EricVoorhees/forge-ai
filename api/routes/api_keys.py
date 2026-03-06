"""
FORGE API Keys Routes
Create, list, and revoke API keys
"""

from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from db.database import get_db
from db.models import User, ApiKey
from auth.dependencies import get_current_user
from auth.api_key import generate_api_key

router = APIRouter(prefix="/v1/api-keys", tags=["API Keys"])


class CreateApiKeyRequest(BaseModel):
    name: str = "Default"


class ApiKeyResponse(BaseModel):
    id: str
    name: str
    prefix: str
    created_at: str
    last_used_at: Optional[str] = None
    is_active: bool


class ApiKeyCreatedResponse(ApiKeyResponse):
    key: str


@router.post("", response_model=ApiKeyCreatedResponse)
async def create_api_key(
    request: CreateApiKeyRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new API key. The full key is only shown once."""
    result = await db.execute(
        select(ApiKey).where(
            ApiKey.user_id == user.id,
            ApiKey.is_active == True
        )
    )
    active_keys = result.scalars().all()
    
    if len(active_keys) >= 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum of 10 active API keys allowed"
        )
    
    full_key, key_hash, prefix = generate_api_key()
    
    api_key = ApiKey(
        user_id=user.id,
        key_hash=key_hash,
        name=request.name,
        prefix=prefix
    )
    db.add(api_key)
    await db.flush()
    
    return ApiKeyCreatedResponse(
        id=str(api_key.id),
        name=api_key.name,
        prefix=api_key.prefix,
        created_at=api_key.created_at.isoformat(),
        last_used_at=None,
        is_active=True,
        key=full_key
    )


@router.get("", response_model=List[ApiKeyResponse])
async def list_api_keys(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all API keys for the current user."""
    result = await db.execute(
        select(ApiKey)
        .where(ApiKey.user_id == user.id)
        .order_by(ApiKey.created_at.desc())
    )
    keys = result.scalars().all()
    
    return [
        ApiKeyResponse(
            id=str(key.id),
            name=key.name,
            prefix=key.prefix,
            created_at=key.created_at.isoformat(),
            last_used_at=key.last_used_at.isoformat() if key.last_used_at else None,
            is_active=key.is_active
        )
        for key in keys
    ]


@router.delete("/{key_id}")
async def revoke_api_key(
    key_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Revoke an API key."""
    result = await db.execute(
        select(ApiKey).where(
            ApiKey.id == key_id,
            ApiKey.user_id == user.id
        )
    )
    api_key = result.scalar_one_or_none()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    api_key.is_active = False
    
    return {"message": "API key revoked"}
