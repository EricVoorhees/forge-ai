# FORGE V1 — Billing Integration (Stripe)

## Overview

FORGE uses Stripe for subscription management, payment processing, and usage-based billing.

---

## Billing Model

### Subscription Plans

| Plan | Monthly Price | Included Tokens | Overage Rate |
|------|---------------|-----------------|--------------|
| Free | $0 | 100,000 | N/A (hard limit) |
| Starter | $29 | 500,000 | $0.004/1K tokens |
| Pro | $99 | 2,000,000 | $0.003/1K tokens |
| Enterprise | $299 | 10,000,000 | $0.002/1K tokens |

### Token Pricing

| Model | Input (per 1K) | Output (per 1K) |
|-------|----------------|-----------------|
| forge-400b | $0.003 | $0.006 |

---

## Stripe Configuration

### Products & Prices

Create these in Stripe Dashboard or via API:

```python
# scripts/setup_stripe.py

import stripe

stripe.api_key = "sk_live_xxx"

# Create product
product = stripe.Product.create(
    name="FORGE API",
    description="AI Coding API powered by 400B Sparse MoE"
)

# Create prices
prices = {
    "starter": stripe.Price.create(
        product=product.id,
        unit_amount=2900,  # $29.00
        currency="usd",
        recurring={"interval": "month"},
        metadata={"plan": "starter", "tokens_included": "500000"}
    ),
    "pro": stripe.Price.create(
        product=product.id,
        unit_amount=9900,  # $99.00
        currency="usd",
        recurring={"interval": "month"},
        metadata={"plan": "pro", "tokens_included": "2000000"}
    ),
    "enterprise": stripe.Price.create(
        product=product.id,
        unit_amount=29900,  # $299.00
        currency="usd",
        recurring={"interval": "month"},
        metadata={"plan": "enterprise", "tokens_included": "10000000"}
    )
}

print("Stripe products created:")
for plan, price in prices.items():
    print(f"  {plan}: {price.id}")
```

### Environment Variables

```bash
# Stripe configuration
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Price IDs (from Stripe Dashboard)
STRIPE_PRICE_STARTER=price_xxx
STRIPE_PRICE_PRO=price_xxx
STRIPE_PRICE_ENTERPRISE=price_xxx
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BILLING FLOW                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────┐     ┌──────────────┐     ┌─────────────────────────────┐    │
│   │ Frontend │────▶│  API Server  │────▶│         Stripe              │    │
│   │          │     │              │     │                             │    │
│   │ Checkout │     │ Create       │     │ ┌─────────────────────────┐ │    │
│   │ Button   │     │ Checkout     │     │ │ Checkout Session        │ │    │
│   │          │     │ Session      │     │ └─────────────────────────┘ │    │
│   └──────────┘     └──────────────┘     │                             │    │
│                                          │ ┌─────────────────────────┐ │    │
│                                          │ │ Customer Portal         │ │    │
│                                          │ └─────────────────────────┘ │    │
│                                          │                             │    │
│                                          │ ┌─────────────────────────┐ │    │
│   ┌──────────┐     ┌──────────────┐     │ │ Webhooks                │ │    │
│   │ Database │◀────│  API Server  │◀────│ │ - subscription.created  │ │    │
│   │          │     │              │     │ │ - subscription.updated  │ │    │
│   │ Update   │     │ Handle       │     │ │ - subscription.deleted  │ │    │
│   │ Plan     │     │ Webhook      │     │ │ - invoice.paid          │ │    │
│   └──────────┘     └──────────────┘     │ └─────────────────────────┘ │    │
│                                          └─────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation

### Stripe Service

```python
# api/billing/stripe.py

import stripe
from typing import Optional
from datetime import datetime
import os

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

PRICE_IDS = {
    "starter": os.getenv("STRIPE_PRICE_STARTER"),
    "pro": os.getenv("STRIPE_PRICE_PRO"),
    "enterprise": os.getenv("STRIPE_PRICE_ENTERPRISE")
}


class StripeService:
    """Service for Stripe operations."""
    
    async def create_customer(self, email: str, name: Optional[str] = None) -> str:
        """Create a Stripe customer."""
        customer = stripe.Customer.create(
            email=email,
            name=name,
            metadata={"source": "forge_api"}
        )
        return customer.id
    
    async def create_checkout_session(
        self,
        customer_id: str,
        plan: str,
        success_url: str,
        cancel_url: str
    ) -> str:
        """Create a Stripe Checkout session."""
        price_id = PRICE_IDS.get(plan)
        if not price_id:
            raise ValueError(f"Invalid plan: {plan}")
        
        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[{
                "price": price_id,
                "quantity": 1
            }],
            mode="subscription",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={"plan": plan}
        )
        return session.url
    
    async def create_portal_session(
        self,
        customer_id: str,
        return_url: str
    ) -> str:
        """Create a Stripe Customer Portal session."""
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=return_url
        )
        return session.url
    
    async def get_subscription(self, subscription_id: str) -> dict:
        """Get subscription details."""
        subscription = stripe.Subscription.retrieve(subscription_id)
        return {
            "id": subscription.id,
            "status": subscription.status,
            "plan": subscription.metadata.get("plan", "unknown"),
            "current_period_start": datetime.fromtimestamp(subscription.current_period_start),
            "current_period_end": datetime.fromtimestamp(subscription.current_period_end),
            "cancel_at_period_end": subscription.cancel_at_period_end
        }
    
    async def cancel_subscription(self, subscription_id: str, at_period_end: bool = True):
        """Cancel a subscription."""
        if at_period_end:
            stripe.Subscription.modify(
                subscription_id,
                cancel_at_period_end=True
            )
        else:
            stripe.Subscription.delete(subscription_id)
    
    async def update_subscription(self, subscription_id: str, new_plan: str):
        """Update subscription to a new plan."""
        price_id = PRICE_IDS.get(new_plan)
        if not price_id:
            raise ValueError(f"Invalid plan: {new_plan}")
        
        subscription = stripe.Subscription.retrieve(subscription_id)
        stripe.Subscription.modify(
            subscription_id,
            items=[{
                "id": subscription["items"]["data"][0].id,
                "price": price_id
            }],
            metadata={"plan": new_plan}
        )


stripe_service = StripeService()
```

### Webhook Handler

```python
# api/billing/webhooks.py

import stripe
from fastapi import APIRouter, Request, HTTPException, Header
import os
from ..db.database import get_db

router = APIRouter()

WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")


@router.post("/billing/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="Stripe-Signature")
):
    """Handle Stripe webhook events."""
    
    payload = await request.body()
    
    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle events
    if event.type == "checkout.session.completed":
        await handle_checkout_completed(event.data.object)
    
    elif event.type == "customer.subscription.created":
        await handle_subscription_created(event.data.object)
    
    elif event.type == "customer.subscription.updated":
        await handle_subscription_updated(event.data.object)
    
    elif event.type == "customer.subscription.deleted":
        await handle_subscription_deleted(event.data.object)
    
    elif event.type == "invoice.paid":
        await handle_invoice_paid(event.data.object)
    
    elif event.type == "invoice.payment_failed":
        await handle_payment_failed(event.data.object)
    
    return {"status": "ok"}


async def handle_checkout_completed(session):
    """Handle successful checkout."""
    db = await get_db()
    
    customer_id = session.customer
    subscription_id = session.subscription
    plan = session.metadata.get("plan", "starter")
    
    # Find user by Stripe customer ID
    result = await db.execute(
        "SELECT user_id FROM subscriptions WHERE stripe_customer_id = :customer_id",
        {"customer_id": customer_id}
    )
    row = result.fetchone()
    
    if row:
        # Update existing subscription
        await db.execute(
            """
            UPDATE subscriptions 
            SET stripe_subscription_id = :sub_id,
                plan = :plan,
                status = 'active',
                updated_at = NOW()
            WHERE stripe_customer_id = :customer_id
            """,
            {
                "sub_id": subscription_id,
                "plan": plan,
                "customer_id": customer_id
            }
        )


async def handle_subscription_created(subscription):
    """Handle new subscription."""
    db = await get_db()
    
    customer_id = subscription.customer
    subscription_id = subscription.id
    plan = subscription.metadata.get("plan", "starter")
    status = subscription.status
    
    await db.execute(
        """
        UPDATE subscriptions 
        SET stripe_subscription_id = :sub_id,
            plan = :plan,
            status = :status,
            current_period_start = :period_start,
            current_period_end = :period_end,
            updated_at = NOW()
        WHERE stripe_customer_id = :customer_id
        """,
        {
            "sub_id": subscription_id,
            "plan": plan,
            "status": status,
            "period_start": datetime.fromtimestamp(subscription.current_period_start),
            "period_end": datetime.fromtimestamp(subscription.current_period_end),
            "customer_id": customer_id
        }
    )


async def handle_subscription_updated(subscription):
    """Handle subscription update (plan change, renewal, etc.)."""
    db = await get_db()
    
    subscription_id = subscription.id
    plan = subscription.metadata.get("plan")
    status = subscription.status
    
    await db.execute(
        """
        UPDATE subscriptions 
        SET plan = COALESCE(:plan, plan),
            status = :status,
            current_period_start = :period_start,
            current_period_end = :period_end,
            updated_at = NOW()
        WHERE stripe_subscription_id = :sub_id
        """,
        {
            "plan": plan,
            "status": status,
            "period_start": datetime.fromtimestamp(subscription.current_period_start),
            "period_end": datetime.fromtimestamp(subscription.current_period_end),
            "sub_id": subscription_id
        }
    )


async def handle_subscription_deleted(subscription):
    """Handle subscription cancellation."""
    db = await get_db()
    
    subscription_id = subscription.id
    
    await db.execute(
        """
        UPDATE subscriptions 
        SET status = 'canceled',
            plan = 'free',
            updated_at = NOW()
        WHERE stripe_subscription_id = :sub_id
        """,
        {"sub_id": subscription_id}
    )


async def handle_invoice_paid(invoice):
    """Handle successful payment."""
    # Log payment for records
    # Could trigger email notification
    pass


async def handle_payment_failed(invoice):
    """Handle failed payment."""
    db = await get_db()
    
    customer_id = invoice.customer
    
    # Update subscription status
    await db.execute(
        """
        UPDATE subscriptions 
        SET status = 'past_due',
            updated_at = NOW()
        WHERE stripe_customer_id = :customer_id
        """,
        {"customer_id": customer_id}
    )
    
    # TODO: Send email notification to user
```

### Billing Routes

```python
# api/billing/routes.py

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..auth.dependencies import get_current_user
from ..db.database import get_db
from ..db.models import User
from .stripe import stripe_service

router = APIRouter(prefix="/billing", tags=["billing"])


class CreateCheckoutRequest(BaseModel):
    plan: str
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None


@router.post("/checkout")
async def create_checkout(
    request: CreateCheckoutRequest,
    user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Create a Stripe Checkout session."""
    
    # Get or create Stripe customer
    result = await db.execute(
        "SELECT stripe_customer_id FROM subscriptions WHERE user_id = :user_id",
        {"user_id": user.id}
    )
    row = result.fetchone()
    
    if row and row.stripe_customer_id:
        customer_id = row.stripe_customer_id
    else:
        # Create new Stripe customer
        customer_id = await stripe_service.create_customer(
            email=user.email,
            name=user.name
        )
        
        # Save to database
        await db.execute(
            """
            INSERT INTO subscriptions (user_id, stripe_customer_id, plan, status)
            VALUES (:user_id, :customer_id, 'free', 'active')
            ON CONFLICT (user_id) DO UPDATE SET stripe_customer_id = :customer_id
            """,
            {"user_id": user.id, "customer_id": customer_id}
        )
    
    # Create checkout session
    success_url = request.success_url or "https://forge.ai/dashboard?checkout=success"
    cancel_url = request.cancel_url or "https://forge.ai/pricing?checkout=canceled"
    
    checkout_url = await stripe_service.create_checkout_session(
        customer_id=customer_id,
        plan=request.plan,
        success_url=success_url,
        cancel_url=cancel_url
    )
    
    return {"url": checkout_url}


@router.get("/portal")
async def get_billing_portal(
    user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get Stripe Customer Portal URL."""
    
    result = await db.execute(
        "SELECT stripe_customer_id FROM subscriptions WHERE user_id = :user_id",
        {"user_id": user.id}
    )
    row = result.fetchone()
    
    if not row or not row.stripe_customer_id:
        raise HTTPException(
            status_code=400,
            detail="No billing account found"
        )
    
    portal_url = await stripe_service.create_portal_session(
        customer_id=row.stripe_customer_id,
        return_url="https://forge.ai/dashboard"
    )
    
    return {
        "url": portal_url,
        "expires_at": None  # Portal sessions don't expire
    }


@router.get("/subscription")
async def get_subscription(
    user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get current subscription details."""
    
    result = await db.execute(
        """
        SELECT s.*, 
               COALESCE(SUM(u.total_tokens), 0) as tokens_used
        FROM subscriptions s
        LEFT JOIN usage_records u ON s.user_id = u.user_id
            AND u.created_at >= s.current_period_start
            AND u.created_at < s.current_period_end
        WHERE s.user_id = :user_id
        GROUP BY s.id
        """,
        {"user_id": user.id}
    )
    row = result.fetchone()
    
    if not row:
        return {
            "plan": "free",
            "status": "active",
            "usage": {
                "tokens_used": 0,
                "tokens_limit": 100000,
                "percentage": 0
            }
        }
    
    # Get token limit for plan
    TOKEN_LIMITS = {
        "free": 100000,
        "starter": 500000,
        "pro": 2000000,
        "enterprise": 10000000
    }
    
    tokens_limit = TOKEN_LIMITS.get(row.plan, 100000)
    tokens_used = row.tokens_used or 0
    
    return {
        "id": str(row.stripe_subscription_id) if row.stripe_subscription_id else None,
        "plan": row.plan,
        "status": row.status,
        "current_period_start": row.current_period_start.isoformat() if row.current_period_start else None,
        "current_period_end": row.current_period_end.isoformat() if row.current_period_end else None,
        "cancel_at_period_end": False,  # Would need to fetch from Stripe
        "usage": {
            "tokens_used": tokens_used,
            "tokens_limit": tokens_limit,
            "percentage": round((tokens_used / tokens_limit) * 100, 1)
        }
    }


@router.post("/cancel")
async def cancel_subscription(
    user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Cancel subscription at end of billing period."""
    
    result = await db.execute(
        "SELECT stripe_subscription_id FROM subscriptions WHERE user_id = :user_id",
        {"user_id": user.id}
    )
    row = result.fetchone()
    
    if not row or not row.stripe_subscription_id:
        raise HTTPException(
            status_code=400,
            detail="No active subscription found"
        )
    
    await stripe_service.cancel_subscription(
        subscription_id=row.stripe_subscription_id,
        at_period_end=True
    )
    
    return {"message": "Subscription will be canceled at end of billing period"}
```

---

## Usage-Based Billing (Overages)

For users who exceed their included tokens, track overages:

```python
# api/billing/overages.py

from datetime import datetime
from ..db.database import get_db

OVERAGE_RATES = {
    "starter": 0.004,  # $0.004 per 1K tokens
    "pro": 0.003,
    "enterprise": 0.002
}

TOKEN_LIMITS = {
    "free": 100000,
    "starter": 500000,
    "pro": 2000000,
    "enterprise": 10000000
}


async def calculate_overage(user_id: str) -> dict:
    """Calculate overage charges for current billing period."""
    db = await get_db()
    
    # Get subscription and usage
    result = await db.execute(
        """
        SELECT s.plan, s.current_period_start, s.current_period_end,
               COALESCE(SUM(u.total_tokens), 0) as tokens_used
        FROM subscriptions s
        LEFT JOIN usage_records u ON s.user_id = u.user_id
            AND u.created_at >= s.current_period_start
            AND u.created_at < s.current_period_end
        WHERE s.user_id = :user_id
        GROUP BY s.id
        """,
        {"user_id": user_id}
    )
    row = result.fetchone()
    
    if not row:
        return {"overage_tokens": 0, "overage_cost": 0}
    
    plan = row.plan
    tokens_used = row.tokens_used
    tokens_limit = TOKEN_LIMITS.get(plan, 100000)
    
    if tokens_used <= tokens_limit:
        return {"overage_tokens": 0, "overage_cost": 0}
    
    overage_tokens = tokens_used - tokens_limit
    overage_rate = OVERAGE_RATES.get(plan, 0.004)
    overage_cost = (overage_tokens / 1000) * overage_rate
    
    return {
        "overage_tokens": overage_tokens,
        "overage_cost": round(overage_cost, 2)
    }


async def create_overage_invoice(user_id: str):
    """Create a Stripe invoice for overage charges."""
    import stripe
    
    overage = await calculate_overage(user_id)
    
    if overage["overage_cost"] <= 0:
        return None
    
    db = await get_db()
    result = await db.execute(
        "SELECT stripe_customer_id FROM subscriptions WHERE user_id = :user_id",
        {"user_id": user_id}
    )
    row = result.fetchone()
    
    if not row or not row.stripe_customer_id:
        return None
    
    # Create invoice item
    stripe.InvoiceItem.create(
        customer=row.stripe_customer_id,
        amount=int(overage["overage_cost"] * 100),  # Cents
        currency="usd",
        description=f"API Usage Overage: {overage['overage_tokens']:,} tokens"
    )
    
    # Create and finalize invoice
    invoice = stripe.Invoice.create(
        customer=row.stripe_customer_id,
        auto_advance=True  # Auto-finalize and charge
    )
    
    return invoice.id
```

---

## Frontend Integration

### Checkout Button (React)

```tsx
// web/components/CheckoutButton.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface CheckoutButtonProps {
  plan: 'starter' | 'pro' | 'enterprise';
}

export function CheckoutButton({ plan }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ plan })
      });
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleCheckout} disabled={loading}>
      {loading ? 'Loading...' : 'Subscribe'}
    </Button>
  );
}
```

### Billing Portal Button

```tsx
// web/components/BillingPortalButton.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false);

  const handlePortal = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/billing/portal', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Portal error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handlePortal} disabled={loading}>
      {loading ? 'Loading...' : 'Manage Billing'}
    </Button>
  );
}
```

---

## Webhook Configuration

### Stripe Dashboard Setup

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://api.forge.ai/billing/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### Testing Webhooks Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:8000/billing/webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
```

---

## Security Considerations

1. **Webhook Verification** — Always verify Stripe signatures
2. **Idempotency** — Handle duplicate webhook events
3. **HTTPS Only** — Stripe webhooks require HTTPS
4. **Secret Rotation** — Rotate webhook secrets periodically
5. **PCI Compliance** — Never handle card data directly (use Checkout)

---

## Monitoring

### Metrics to Track

| Metric | Description |
|--------|-------------|
| MRR | Monthly Recurring Revenue |
| Churn Rate | Subscription cancellations |
| ARPU | Average Revenue Per User |
| Conversion Rate | Free → Paid |
| Failed Payments | Payment failures |

### Alerts

```yaml
# monitoring/alerts/billing.yml

groups:
  - name: billing
    rules:
      - alert: HighPaymentFailureRate
        expr: rate(stripe_payment_failures_total[1h]) > 0.1
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: "High payment failure rate"
      
      - alert: WebhookProcessingErrors
        expr: rate(stripe_webhook_errors_total[5m]) > 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Stripe webhook processing errors"
```
