"""
FORGE Health Routes
Health checks for monitoring
"""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["Health"])


class HealthResponse(BaseModel):
    status: str


@router.get("/health", response_model=HealthResponse)
async def health():
    """Basic health check."""
    return HealthResponse(status="healthy")


@router.get("/health/live", response_model=HealthResponse)
async def liveness():
    """Liveness probe for Kubernetes/Render."""
    return HealthResponse(status="alive")


@router.get("/health/config")
async def config_check():
    """Check if critical config is loaded (does not expose sensitive data)."""
    from config import settings
    return {
        "inference_url": settings.inference_url,
        "inference_model": settings.inference_model,
        "fireworks_api_key_set": bool(settings.fireworks_api_key),
        "redis_configured": bool(settings.redis_url and settings.redis_url != "redis://localhost:6379"),
        "environment": settings.app_env
    }


@router.get("/health/ready")
async def readiness():
    """
    Readiness probe - checks all dependencies.
    """
    checks = {}
    all_healthy = True
    
    try:
        from sqlalchemy import text
        from db.database import engine
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        checks["database"] = "healthy"
    except Exception as e:
        checks["database"] = f"unhealthy: {str(e)}"
        all_healthy = False
    
    try:
        from services.rate_limiter import redis_client
        if redis_client is None:
            checks["redis"] = "disabled (no URL configured)"
        else:
            redis_client.ping()
            checks["redis"] = "healthy"
    except Exception as e:
        checks["redis"] = f"unhealthy: {str(e)}"
        all_healthy = False
    
    return {
        "status": "ready" if all_healthy else "not_ready",
        "checks": checks
    }
