"""
FORGE Billing Routes
Subscription management endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from db.database import get_db
from db.models import User, Subscription
from auth.dependencies import get_current_user
from .stripe_service import (
    create_customer,
    create_checkout_session,
    create_portal_session,
    get_subscription,
    cancel_subscription
)

router = APIRouter(prefix="/v1/billing", tags=["Billing"])


class CheckoutRequest(BaseModel):
    plan: str
    success_url: str
    cancel_url: str


class CheckoutResponse(BaseModel):
    checkout_url: str


class PortalResponse(BaseModel):
    portal_url: str


class SubscriptionResponse(BaseModel):
    plan: str
    status: str
    current_period_start: str = None
    current_period_end: str = None


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout(
    request: CheckoutRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a Stripe Checkout session for subscription."""
    valid_plans = ["starter", "pro", "enterprise", "metered"]
    if request.plan not in valid_plans:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid plan. Choose from: {', '.join(valid_plans)}"
        )
    
    result = await db.execute(
        select(Subscription).where(Subscription.user_id == user.id)
    )
    subscription = result.scalar_one_or_none()
    
    if subscription and subscription.stripe_customer_id:
        customer_id = subscription.stripe_customer_id
    else:
        customer_id = await create_customer(user.email, user.name)
        
        if subscription:
            subscription.stripe_customer_id = customer_id
        else:
            subscription = Subscription(
                user_id=user.id,
                stripe_customer_id=customer_id,
                plan="free",
                status="active"
            )
            db.add(subscription)
        await db.flush()
    
    checkout_url = await create_checkout_session(
        customer_id=customer_id,
        plan=request.plan,
        success_url=request.success_url,
        cancel_url=request.cancel_url
    )
    
    return CheckoutResponse(checkout_url=checkout_url)


@router.post("/portal", response_model=PortalResponse)
async def create_portal(
    return_url: str = Query(..., description="URL to return to after portal"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a Stripe Customer Portal session."""
    result = await db.execute(
        select(Subscription).where(Subscription.user_id == user.id)
    )
    subscription = result.scalar_one_or_none()
    
    if not subscription or not subscription.stripe_customer_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No billing account found"
        )
    
    portal_url = await create_portal_session(
        customer_id=subscription.stripe_customer_id,
        return_url=return_url
    )
    
    return PortalResponse(portal_url=portal_url)


@router.get("/subscription", response_model=SubscriptionResponse)
async def get_current_subscription(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current subscription status."""
    result = await db.execute(
        select(Subscription).where(Subscription.user_id == user.id)
    )
    subscription = result.scalar_one_or_none()
    
    if not subscription:
        return SubscriptionResponse(plan="free", status="active")
    
    return SubscriptionResponse(
        plan=subscription.plan,
        status=subscription.status,
        current_period_start=subscription.current_period_start.isoformat() if subscription.current_period_start else None,
        current_period_end=subscription.current_period_end.isoformat() if subscription.current_period_end else None
    )


@router.post("/cancel")
async def cancel_current_subscription(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Cancel subscription at end of billing period."""
    result = await db.execute(
        select(Subscription).where(Subscription.user_id == user.id)
    )
    subscription = result.scalar_one_or_none()
    
    if not subscription or not subscription.stripe_subscription_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active subscription found"
        )
    
    await cancel_subscription(subscription.stripe_subscription_id, at_period_end=True)
    
    return {"message": "Subscription will be cancelled at end of billing period"}
