"""
FORGE Completions Routes
OpenAI-compatible chat completions endpoint
"""

import time
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import get_db
from db.models import Subscription
from auth.api_key import ApiKeyData, validate_api_key
from services.rate_limiter import rate_limiter
from services.inference import inference_client
from services.usage import log_usage
from services.pricing import calculate_cost
from sqlalchemy import select
from decimal import Decimal

router = APIRouter(prefix="/v1", tags=["Completions"])


class Message(BaseModel):
    role: str
    content: str


class ChatCompletionRequest(BaseModel):
    model: str = "forge-coder"
    messages: List[Message]
    temperature: float = Field(default=0.7, ge=0, le=2)
    max_tokens: int = Field(default=4096, ge=1, le=32768)
    top_p: float = Field(default=1.0, ge=0, le=1)
    stream: bool = False
    n: int = Field(default=1, ge=1, le=1)
    stop: Optional[List[str]] = None


class Choice(BaseModel):
    index: int
    message: Message
    finish_reason: str


class Usage(BaseModel):
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int


class ChatCompletionResponse(BaseModel):
    id: str
    object: str = "chat.completion"
    created: int
    model: str
    choices: List[Choice]
    usage: Usage


def estimate_tokens(text: str) -> int:
    """Rough token estimation (4 chars per token)."""
    return len(text) // 4


@router.post("/chat/completions")
async def chat_completions(
    request: ChatCompletionRequest,
    api_key: ApiKeyData = Depends(validate_api_key),
    db: AsyncSession = Depends(get_db)
):
    """
    OpenAI-compatible chat completions endpoint.
    Supports streaming and non-streaming responses.
    """
    # Check RPM limit
    rpm_result = rate_limiter.check_rpm(api_key.api_key_id, api_key.plan)
    if not rpm_result.allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded (requests per minute)",
            headers={
                "X-RateLimit-Limit": str(rpm_result.limit),
                "X-RateLimit-Remaining": str(rpm_result.remaining),
                "X-RateLimit-Reset": str(int(rpm_result.reset_at)),
                "Retry-After": str(int(rpm_result.retry_after or 60))
            }
        )
    
    # Check credit balance for non-metered plans
    if api_key.plan != "metered":
        result = await db.execute(
            select(Subscription).where(Subscription.user_id == api_key.user_id)
        )
        subscription = result.scalar_one_or_none()
        
        if not subscription or subscription.credit_balance <= 0:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Insufficient credits. Please add more credits or upgrade your plan.",
                headers={
                    "X-Credits-Remaining": "0"
                }
            )
    
    messages = [{"role": m.role, "content": m.content} for m in request.messages]
    
    if request.stream:
        return await stream_completion(request, messages, api_key, db)
    
    try:
        response = await inference_client.chat_completion(
            messages=messages,
            model=request.model,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            top_p=request.top_p,
            stop=request.stop
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Inference error: {str(e)}"
        )
    
    prompt_tokens = response.get("usage", {}).get("prompt_tokens", 0)
    completion_tokens = response.get("usage", {}).get("completion_tokens", 0)
    
    # Calculate cost and deduct from credit balance (model + plan specific)
    cost = calculate_cost(request.model, api_key.plan, prompt_tokens, completion_tokens)
    
    if api_key.plan != "metered":
        result = await db.execute(
            select(Subscription).where(Subscription.user_id == api_key.user_id)
        )
        subscription = result.scalar_one_or_none()
        if subscription:
            subscription.credit_balance = max(Decimal("0"), subscription.credit_balance - cost)
            await db.commit()
    
    total_tokens = prompt_tokens + completion_tokens
    await log_usage(db, api_key.user_id, prompt_tokens, completion_tokens, cost=float(cost))
    rate_limiter.record_tokens(api_key.user_id, total_tokens)
    
    return response


async def stream_completion(
    request: ChatCompletionRequest,
    messages: List[dict],
    api_key: ApiKeyData,
    db: AsyncSession
):
    """Handle streaming completion response."""
    
    async def generate():
        prompt_tokens = sum(estimate_tokens(m["content"]) for m in messages)
        completion_tokens = 0
        
        try:
            async for chunk in inference_client.chat_completion_stream(
                messages=messages,
                model=request.model,
                temperature=request.temperature,
                max_tokens=request.max_tokens,
                top_p=request.top_p,
                stop=request.stop
            ):
                if "content" in chunk:
                    completion_tokens += 1
                yield chunk
        finally:
            output_tokens = completion_tokens * 4
            total_tokens = prompt_tokens + output_tokens
            
            # Calculate cost and deduct from credit balance (model + plan specific)
            cost = calculate_cost(request.model, api_key.plan, prompt_tokens, output_tokens)
            
            if api_key.plan != "metered":
                result = await db.execute(
                    select(Subscription).where(Subscription.user_id == api_key.user_id)
                )
                subscription = result.scalar_one_or_none()
                if subscription:
                    subscription.credit_balance = max(Decimal("0"), subscription.credit_balance - cost)
                    await db.commit()
            
            await log_usage(db, api_key.user_id, prompt_tokens, output_tokens, cost=float(cost))
            rate_limiter.record_tokens(api_key.user_id, total_tokens)
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
