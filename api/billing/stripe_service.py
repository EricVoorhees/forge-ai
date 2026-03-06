"""
FORGE Stripe Service
Stripe API integration for subscriptions
"""

import stripe
from typing import Optional

from config import settings

stripe.api_key = settings.stripe_secret_key

PLAN_PRICE_MAP = {
    "pro": settings.stripe_price_pro,
    "enterprise": settings.stripe_price_enterprise,
}


async def create_customer(email: str, name: Optional[str] = None) -> str:
    """Create a Stripe customer."""
    customer = stripe.Customer.create(
        email=email,
        name=name,
        metadata={"source": "forge"}
    )
    return customer.id


async def create_checkout_session(
    customer_id: str,
    plan: str,
    success_url: str,
    cancel_url: str
) -> str:
    """Create a Stripe Checkout session for subscription."""
    price_id = PLAN_PRICE_MAP.get(plan)
    if not price_id:
        raise ValueError(f"Invalid plan: {plan}")
    
    session = stripe.checkout.Session.create(
        customer=customer_id,
        payment_method_types=["card"],
        line_items=[{
            "price": price_id,
            "quantity": 1,
        }],
        mode="subscription",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"plan": plan}
    )
    return session.url


async def create_portal_session(customer_id: str, return_url: str) -> str:
    """Create a Stripe Customer Portal session."""
    session = stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url=return_url
    )
    return session.url


async def get_subscription(subscription_id: str) -> dict:
    """Get subscription details."""
    subscription = stripe.Subscription.retrieve(subscription_id)
    return {
        "id": subscription.id,
        "status": subscription.status,
        "current_period_start": subscription.current_period_start,
        "current_period_end": subscription.current_period_end,
        "cancel_at_period_end": subscription.cancel_at_period_end,
    }


async def cancel_subscription(subscription_id: str, at_period_end: bool = True) -> dict:
    """Cancel a subscription."""
    if at_period_end:
        subscription = stripe.Subscription.modify(
            subscription_id,
            cancel_at_period_end=True
        )
    else:
        subscription = stripe.Subscription.delete(subscription_id)
    
    return {
        "id": subscription.id,
        "status": subscription.status,
        "cancel_at_period_end": subscription.cancel_at_period_end,
    }


def construct_webhook_event(payload: bytes, sig_header: str) -> stripe.Event:
    """Construct and verify a webhook event."""
    return stripe.Webhook.construct_event(
        payload,
        sig_header,
        settings.stripe_webhook_secret
    )
