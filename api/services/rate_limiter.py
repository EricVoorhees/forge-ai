"""
FORGE Rate Limiter
Token bucket algorithm with Redis
"""

import redis
import time
from dataclasses import dataclass
from typing import Optional

from config import settings
from services.logging import get_logger

logger = get_logger("services.rate_limiter")

try:
    # Upstash Redis requires SSL
    redis_url = settings.redis_url
    ssl_required = redis_url.startswith("rediss://")
    
    redis_client = redis.Redis.from_url(
        redis_url,
        decode_responses=True,
        ssl_cert_reqs=None if ssl_required else None  # Skip SSL cert verification for Upstash
    )
    redis_client.ping()
    logger.info(f"Redis connected successfully")
except Exception as e:
    logger.error(f"Redis connection failed: {e}")
    redis_client = None


@dataclass
class RateLimitResult:
    """Result of a rate limit check."""
    allowed: bool
    remaining: int
    limit: int
    reset_at: float
    retry_after: Optional[float] = None


PLAN_LIMITS = {
    "free": {"rpm": 20, "tpm": 10000, "tpd": 100000},
    "pro": {"rpm": 120, "tpm": 100000, "tpd": 2000000},
    "enterprise": {"rpm": 500, "tpm": 500000, "tpd": 10000000},
}


class RateLimiter:
    """Rate limiter using Redis sorted sets."""
    
    def _check_redis(self):
        """Check if Redis is available."""
        if redis_client is None:
            logger.warning("Redis not available, allowing request")
            return False
        return True
    
    def check_rpm(self, api_key_id: str, plan: str) -> RateLimitResult:
        """
        Check requests per minute limit.
        Uses sliding window with Redis sorted set.
        """
        logger.debug(f"Checking RPM limit", extra={"api_key_id": api_key_id, "extra_data": {"plan": plan}})
        
        if not self._check_redis():
            return RateLimitResult(allowed=True, remaining=999, limit=999, reset_at=0)
        
        limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
        key = f"rate_limit:rpm:{api_key_id}"
        
        now = time.time()
        window_start = now - 60
        
        try:
            pipe = redis_client.pipeline()
            pipe.zremrangebyscore(key, 0, window_start)
            pipe.zcard(key)
            pipe.zadd(key, {str(now): now})
            pipe.expire(key, 120)
            results = pipe.execute()
            
            current_count = results[1]
            
            if current_count >= limits["rpm"]:
                logger.warning(f"RPM limit exceeded", extra={"api_key_id": api_key_id, "extra_data": {"current": current_count, "limit": limits["rpm"]}})
                return RateLimitResult(
                    allowed=False,
                    remaining=0,
                    limit=limits["rpm"],
                    reset_at=now + 60,
                    retry_after=60
                )
            
            logger.debug(f"RPM check passed", extra={"api_key_id": api_key_id, "extra_data": {"current": current_count, "limit": limits["rpm"]}})
            return RateLimitResult(
                allowed=True,
                remaining=limits["rpm"] - current_count - 1,
                limit=limits["rpm"],
                reset_at=now + 60
            )
        except Exception as e:
            logger.error(f"RPM check failed: {e}", exc_info=True)
            return RateLimitResult(allowed=True, remaining=999, limit=999, reset_at=0)
    
    def check_tpm(self, user_id: str, plan: str, tokens: int) -> RateLimitResult:
        """
        Check tokens per minute limit.
        """
        logger.debug(f"Checking TPM limit", extra={"user_id": user_id, "extra_data": {"plan": plan, "tokens": tokens}})
        
        if not self._check_redis():
            return RateLimitResult(allowed=True, remaining=999999, limit=999999, reset_at=0)
        
        limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
        key = f"rate_limit:tpm:{user_id}"
        
        now = time.time()
        minute_key = f"{key}:{int(now // 60)}"
        
        try:
            current = redis_client.get(minute_key)
            current_tokens = int(current) if current else 0
            
            if current_tokens + tokens > limits["tpm"]:
                logger.warning(f"TPM limit exceeded", extra={"user_id": user_id, "extra_data": {"current": current_tokens, "requested": tokens, "limit": limits["tpm"]}})
                return RateLimitResult(
                    allowed=False,
                    remaining=max(0, limits["tpm"] - current_tokens),
                    limit=limits["tpm"],
                    reset_at=(int(now // 60) + 1) * 60,
                    retry_after=60 - (now % 60)
                )
            
            pipe = redis_client.pipeline()
            pipe.incrby(minute_key, tokens)
            pipe.expire(minute_key, 120)
            pipe.execute()
            
            logger.debug(f"TPM check passed", extra={"user_id": user_id, "extra_data": {"current": current_tokens + tokens, "limit": limits["tpm"]}})
            return RateLimitResult(
                allowed=True,
                remaining=limits["tpm"] - current_tokens - tokens,
                limit=limits["tpm"],
                reset_at=(int(now // 60) + 1) * 60
            )
        except Exception as e:
            logger.error(f"TPM check failed: {e}", exc_info=True)
            return RateLimitResult(allowed=True, remaining=999999, limit=999999, reset_at=0)
    
    def check_tpd(self, user_id: str, plan: str, tokens: int) -> RateLimitResult:
        """
        Check tokens per day limit.
        """
        limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
        today = time.strftime("%Y-%m-%d")
        key = f"rate_limit:tpd:{user_id}:{today}"
        
        current = redis_client.get(key)
        current_tokens = int(current) if current else 0
        
        if current_tokens + tokens > limits["tpd"]:
            now = time.time()
            tomorrow = (int(now // 86400) + 1) * 86400
            return RateLimitResult(
                allowed=False,
                remaining=max(0, limits["tpd"] - current_tokens),
                limit=limits["tpd"],
                reset_at=tomorrow,
                retry_after=tomorrow - now
            )
        
        pipe = redis_client.pipeline()
        pipe.incrby(key, tokens)
        pipe.expire(key, 86400 * 2)
        pipe.execute()
        
        return RateLimitResult(
            allowed=True,
            remaining=limits["tpd"] - current_tokens - tokens,
            limit=limits["tpd"],
            reset_at=0
        )
    
    def record_tokens(self, user_id: str, tokens: int):
        """Record token usage for TPM/TPD tracking."""
        logger.debug(f"Recording token usage", extra={"user_id": user_id, "extra_data": {"tokens": tokens}})
        
        if not self._check_redis():
            return
        
        now = time.time()
        today = time.strftime("%Y-%m-%d")
        minute_key = f"rate_limit:tpm:{user_id}:{int(now // 60)}"
        day_key = f"rate_limit:tpd:{user_id}:{today}"
        
        try:
            pipe = redis_client.pipeline()
            pipe.incrby(minute_key, tokens)
            pipe.expire(minute_key, 120)
            pipe.incrby(day_key, tokens)
            pipe.expire(day_key, 86400 * 2)
            pipe.execute()
            logger.debug(f"Token usage recorded", extra={"user_id": user_id, "extra_data": {"tokens": tokens}})
        except Exception as e:
            logger.error(f"Failed to record tokens: {e}", exc_info=True)
    
    def get_usage(self, user_id: str, plan: str) -> dict:
        """Get current usage stats."""
        logger.debug(f"Getting usage stats", extra={"user_id": user_id, "extra_data": {"plan": plan}})
        
        limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
        
        if not self._check_redis():
            return {
                "tokens_per_minute": {"used": 0, "limit": limits["tpm"], "remaining": limits["tpm"]},
                "tokens_per_day": {"used": 0, "limit": limits["tpd"], "remaining": limits["tpd"]}
            }
        
        now = time.time()
        today = time.strftime("%Y-%m-%d")
        
        minute_key = f"rate_limit:tpm:{user_id}:{int(now // 60)}"
        day_key = f"rate_limit:tpd:{user_id}:{today}"
        
        try:
            pipe = redis_client.pipeline()
            pipe.get(minute_key)
            pipe.get(day_key)
            results = pipe.execute()
            
            tpm_used = int(results[0]) if results[0] else 0
            tpd_used = int(results[1]) if results[1] else 0
            
            logger.debug(f"Usage stats retrieved", extra={"user_id": user_id, "extra_data": {"tpm_used": tpm_used, "tpd_used": tpd_used}})
            
            return {
                "tokens_per_minute": {
                    "used": tpm_used,
                    "limit": limits["tpm"],
                    "remaining": max(0, limits["tpm"] - tpm_used)
                },
                "tokens_per_day": {
                    "used": tpd_used,
                    "limit": limits["tpd"],
                    "remaining": max(0, limits["tpd"] - tpd_used)
                }
            }
        except Exception as e:
            logger.error(f"Failed to get usage stats: {e}", exc_info=True)
            return {
                "tokens_per_minute": {"used": 0, "limit": limits["tpm"], "remaining": limits["tpm"]},
                "tokens_per_day": {"used": 0, "limit": limits["tpd"], "remaining": limits["tpd"]}
            }


rate_limiter = RateLimiter()
