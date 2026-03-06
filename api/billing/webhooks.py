"""
FORGE Stripe Webhooks
Handle Stripe webhook events
"""

from datetime import datetime
from fastapi import APIRouter, Request, HTTPException, status
from sqlalchemy import select

from db.database import get_db_context
from db.models import Subscription
from .stripe_service import construct_webhook_event
from services.logging import get_logger

logger = get_logger("billing.webhooks")

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


@router.post("/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events."""
    logger.info("Stripe webhook received")
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    if not sig_header:
        logger.warning("Webhook missing stripe-signature header")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing stripe-signature header"
        )
    
    try:
        event = construct_webhook_event(payload, sig_header)
        logger.debug(f"Webhook signature verified")
    except ValueError:
        logger.error("Webhook invalid payload")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payload"
        )
    except Exception as e:
        logger.error(f"Webhook verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Webhook error: {str(e)}"
        )
    
    event_type = event["type"]
    event_id = event.get("id", "unknown")
    data = event["data"]["object"]
    
    logger.info(f"Processing webhook event", extra={"extra_data": {"event_type": event_type, "event_id": event_id}})
    
    try:
        if event_type == "checkout.session.completed":
            await handle_checkout_completed(data)
        elif event_type == "customer.subscription.created":
            await handle_subscription_created(data)
        elif event_type == "customer.subscription.updated":
            await handle_subscription_updated(data)
        elif event_type == "customer.subscription.deleted":
            await handle_subscription_deleted(data)
        elif event_type == "invoice.payment_succeeded":
            await handle_payment_succeeded(data)
        elif event_type == "invoice.payment_failed":
            await handle_payment_failed(data)
        else:
            logger.debug(f"Unhandled webhook event type: {event_type}")
        
        logger.info(f"Webhook processed successfully", extra={"extra_data": {"event_type": event_type, "event_id": event_id}})
    except Exception as e:
        logger.error(f"Webhook processing failed: {str(e)}", extra={"extra_data": {"event_type": event_type}}, exc_info=True)
        raise
    
    return {"status": "ok"}


async def handle_checkout_completed(data: dict):
    """Handle successful checkout."""
    customer_id = data.get("customer")
    subscription_id = data.get("subscription")
    plan = data.get("metadata", {}).get("plan", "pro")
    
    logger.info(f"Checkout completed", extra={"extra_data": {"customer_id": customer_id, "subscription_id": subscription_id, "plan": plan}})
    
    if not customer_id or not subscription_id:
        logger.warning("Checkout completed but missing customer_id or subscription_id")
        return
    
    async with get_db_context() as db:
        result = await db.execute(
            select(Subscription).where(Subscription.stripe_customer_id == customer_id)
        )
        subscription = result.scalar_one_or_none()
        
        if subscription:
            subscription.stripe_subscription_id = subscription_id
            subscription.plan = plan
            subscription.status = "active"
            logger.info(f"Subscription activated", extra={"extra_data": {"user_id": str(subscription.user_id), "plan": plan}})
        else:
            logger.warning(f"No subscription found for customer: {customer_id}")


async def handle_subscription_created(data: dict):
    """Handle new subscription."""
    customer_id = data.get("customer")
    subscription_id = data.get("id")
    status_value = data.get("status")
    
    logger.info(f"Subscription created", extra={"extra_data": {"customer_id": customer_id, "subscription_id": subscription_id, "status": status_value}})
    
    async with get_db_context() as db:
        result = await db.execute(
            select(Subscription).where(Subscription.stripe_customer_id == customer_id)
        )
        subscription = result.scalar_one_or_none()
        
        if subscription:
            subscription.stripe_subscription_id = subscription_id
            subscription.status = status_value
            subscription.current_period_start = datetime.fromtimestamp(data.get("current_period_start", 0))
            subscription.current_period_end = datetime.fromtimestamp(data.get("current_period_end", 0))
            logger.info(f"Subscription record updated", extra={"extra_data": {"user_id": str(subscription.user_id)}})
        else:
            logger.warning(f"No subscription record found for customer: {customer_id}")


async def handle_subscription_updated(data: dict):
    """Handle subscription update."""
    subscription_id = data.get("id")
    status_value = data.get("status")
    cancel_at_period_end = data.get("cancel_at_period_end", False)
    
    logger.info(f"Subscription updated", extra={"extra_data": {"subscription_id": subscription_id, "status": status_value, "cancel_at_period_end": cancel_at_period_end}})
    
    async with get_db_context() as db:
        result = await db.execute(
            select(Subscription).where(Subscription.stripe_subscription_id == subscription_id)
        )
        subscription = result.scalar_one_or_none()
        
        if subscription:
            subscription.status = status_value
            subscription.current_period_start = datetime.fromtimestamp(data.get("current_period_start", 0))
            subscription.current_period_end = datetime.fromtimestamp(data.get("current_period_end", 0))
            
            if cancel_at_period_end:
                subscription.status = "canceling"
                logger.info(f"Subscription set to cancel at period end", extra={"extra_data": {"user_id": str(subscription.user_id)}})
            else:
                logger.info(f"Subscription status updated", extra={"extra_data": {"user_id": str(subscription.user_id), "status": status_value}})
        else:
            logger.warning(f"No subscription found: {subscription_id}")


async def handle_subscription_deleted(data: dict):
    """Handle subscription cancellation."""
    subscription_id = data.get("id")
    
    logger.info(f"Subscription deleted", extra={"extra_data": {"subscription_id": subscription_id}})
    
    async with get_db_context() as db:
        result = await db.execute(
            select(Subscription).where(Subscription.stripe_subscription_id == subscription_id)
        )
        subscription = result.scalar_one_or_none()
        
        if subscription:
            user_id = str(subscription.user_id)
            subscription.plan = "free"
            subscription.status = "canceled"
            subscription.stripe_subscription_id = None
            logger.info(f"User downgraded to free plan", extra={"user_id": user_id})
        else:
            logger.warning(f"No subscription found to delete: {subscription_id}")


async def handle_payment_succeeded(data: dict):
    """Handle successful payment."""
    invoice_id = data.get("id")
    amount = data.get("amount_paid", 0) / 100  # Convert cents to dollars
    customer_id = data.get("customer")
    logger.info(f"Payment succeeded", extra={"extra_data": {"invoice_id": invoice_id, "amount": amount, "customer_id": customer_id}})


async def handle_payment_failed(data: dict):
    """Handle failed payment."""
    subscription_id = data.get("subscription")
    invoice_id = data.get("id")
    
    logger.warning(f"Payment failed", extra={"extra_data": {"invoice_id": invoice_id, "subscription_id": subscription_id}})
    
    if not subscription_id:
        logger.debug("No subscription_id in payment failed event")
        return
    
    async with get_db_context() as db:
        result = await db.execute(
            select(Subscription).where(Subscription.stripe_subscription_id == subscription_id)
        )
        subscription = result.scalar_one_or_none()
        
        if subscription:
            subscription.status = "past_due"
            logger.warning(f"Subscription marked as past_due", extra={"user_id": str(subscription.user_id)})
        else:
            logger.warning(f"No subscription found for failed payment: {subscription_id}")
