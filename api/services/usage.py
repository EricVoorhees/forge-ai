"""
FORGE Usage Tracking
Log and query token usage
"""

from datetime import datetime, timedelta
from typing import List, Optional
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from db.models import UsageLog
from services.logging import get_logger

logger = get_logger("services.usage")

INPUT_COST_PER_1K = Decimal("0.003")
OUTPUT_COST_PER_1K = Decimal("0.006")


async def log_usage(
    db: AsyncSession,
    user_id: str,
    tokens_input: int,
    tokens_output: int,
    cost: float = None
) -> UsageLog:
    """
    Log token usage for a request.
    Cost can be provided directly (from pricing service) or calculated from defaults.
    """
    logger.debug(f"Logging usage", extra={"user_id": user_id, "extra_data": {"tokens_input": tokens_input, "tokens_output": tokens_output}})
    
    if cost is None:
        cost = float(
            (Decimal(tokens_input) / 1000) * INPUT_COST_PER_1K +
            (Decimal(tokens_output) / 1000) * OUTPUT_COST_PER_1K
        )
    
    usage_log = UsageLog(
        user_id=user_id,
        tokens_input=tokens_input,
        tokens_output=tokens_output,
        cost=cost
    )
    
    db.add(usage_log)
    await db.flush()
    
    logger.info(f"Usage logged", extra={"user_id": user_id, "extra_data": {"tokens_input": tokens_input, "tokens_output": tokens_output, "cost": float(cost), "log_id": str(usage_log.id)}})
    
    return usage_log


async def get_usage_summary(
    db: AsyncSession,
    user_id: str,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> dict:
    """
    Get usage summary for a user.
    """
    logger.debug(f"Getting usage summary", extra={"user_id": user_id})
    
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    result = await db.execute(
        select(
            func.sum(UsageLog.tokens_input).label("total_input"),
            func.sum(UsageLog.tokens_output).label("total_output"),
            func.sum(UsageLog.cost).label("total_cost"),
            func.count(UsageLog.id).label("request_count")
        )
        .where(
            UsageLog.user_id == user_id,
            UsageLog.timestamp >= start_date,
            UsageLog.timestamp <= end_date
        )
    )
    row = result.first()
    
    summary = {
        "period": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat()
        },
        "tokens_input": row.total_input or 0,
        "tokens_output": row.total_output or 0,
        "total_tokens": (row.total_input or 0) + (row.total_output or 0),
        "total_cost": float(row.total_cost or 0),
        "request_count": row.request_count or 0
    }
    
    logger.debug(f"Usage summary retrieved", extra={"user_id": user_id, "extra_data": {"total_tokens": summary["total_tokens"], "request_count": summary["request_count"]}})
    
    return summary


async def get_daily_usage(
    db: AsyncSession,
    user_id: str,
    days: int = 30
) -> List[dict]:
    """
    Get daily usage breakdown.
    """
    logger.debug(f"Getting daily usage", extra={"user_id": user_id, "extra_data": {"days": days}})
    start_date = datetime.utcnow() - timedelta(days=days)
    
    result = await db.execute(
        select(
            func.date(UsageLog.timestamp).label("date"),
            func.sum(UsageLog.tokens_input).label("tokens_input"),
            func.sum(UsageLog.tokens_output).label("tokens_output"),
            func.sum(UsageLog.cost).label("cost"),
            func.count(UsageLog.id).label("requests")
        )
        .where(
            UsageLog.user_id == user_id,
            UsageLog.timestamp >= start_date
        )
        .group_by(func.date(UsageLog.timestamp))
        .order_by(func.date(UsageLog.timestamp))
    )
    
    return [
        {
            "date": str(row.date),
            "tokens_input": row.tokens_input or 0,
            "tokens_output": row.tokens_output or 0,
            "total_tokens": (row.tokens_input or 0) + (row.tokens_output or 0),
            "cost": float(row.cost or 0),
            "requests": row.requests or 0
        }
        for row in result.fetchall()
    ]
