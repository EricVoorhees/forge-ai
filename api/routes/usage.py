"""
FORGE Usage Routes
Query usage statistics
"""

from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_db
from db.models import User
from auth.dependencies import get_current_user
from services.usage import get_usage_summary, get_daily_usage
from services.rate_limiter import rate_limiter

router = APIRouter(prefix="/v1/usage", tags=["Usage"])


class UsageSummaryResponse(BaseModel):
    period: dict
    tokens_input: int
    tokens_output: int
    total_tokens: int
    total_cost: float
    request_count: int


class RateLimitResponse(BaseModel):
    tokens_per_minute: dict
    tokens_per_day: dict
    tokens_per_month: dict = None


@router.get("", response_model=UsageSummaryResponse)
async def get_usage(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get usage summary for the current user."""
    start = datetime.fromisoformat(start_date) if start_date else None
    end = datetime.fromisoformat(end_date) if end_date else None
    
    summary = await get_usage_summary(db, str(user.id), start, end)
    return UsageSummaryResponse(**summary)


@router.get("/daily")
async def get_usage_daily(
    days: int = Query(30, ge=1, le=90, description="Number of days"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get daily usage breakdown."""
    daily = await get_daily_usage(db, str(user.id), days)
    return {"data": daily}


@router.get("/limits", response_model=RateLimitResponse)
async def get_rate_limits(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current rate limit status."""
    from db.models import Subscription
    from sqlalchemy import select
    
    # Fetch subscription separately to avoid lazy loading issues
    result = await db.execute(
        select(Subscription).where(Subscription.user_id == user.id)
    )
    subscription = result.scalar_one_or_none()
    plan = subscription.plan if subscription else "free"
    
    usage = rate_limiter.get_usage(str(user.id), plan)
    monthly = rate_limiter.get_monthly_usage(str(user.id), plan)
    return RateLimitResponse(
        tokens_per_minute=usage["tokens_per_minute"],
        tokens_per_day=usage["tokens_per_day"],
        tokens_per_month=monthly
    )


@router.get("/recent")
async def get_recent_calls(
    limit: int = Query(50, ge=1, le=100, description="Number of recent calls"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get recent API calls for the user."""
    from db.models import UsageLog
    from sqlalchemy import select
    
    result = await db.execute(
        select(UsageLog)
        .where(UsageLog.user_id == user.id)
        .order_by(UsageLog.timestamp.desc())
        .limit(limit)
    )
    logs = result.scalars().all()
    
    return {
        "calls": [
            {
                "id": str(log.id),
                "tokens_input": log.tokens_input,
                "tokens_output": log.tokens_output,
                "total_tokens": log.tokens_input + log.tokens_output,
                "cost": float(log.cost),
                "timestamp": log.timestamp.isoformat()
            }
            for log in logs
        ]
    }
