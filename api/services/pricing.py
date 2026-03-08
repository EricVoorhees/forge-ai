"""
FORGE Pricing Service
Defines plan rates and handles credit deduction for usage-based billing.

Plans work like prepaid credits:
- User pays $19/$79/$299 upfront
- Gets that amount as credit balance
- Each API call deducts credits based on plan-specific token rates
- Higher plans get better rates (more tokens per dollar)
"""

from decimal import Decimal
from typing import Tuple
from dataclasses import dataclass


@dataclass
class PlanRates:
    """Token rates for a subscription plan (cost per 1M tokens in USD)."""
    input_rate: Decimal  # $ per 1M input tokens
    output_rate: Decimal  # $ per 1M output tokens
    plan_price: Decimal  # Monthly subscription price
    

# Plan-specific token rates
# Higher tiers get better rates (lower cost per token)
PLAN_RATES = {
    # API pay-as-you-go (baseline, worst rates)
    "metered": PlanRates(
        input_rate=Decimal("1.00"),
        output_rate=Decimal("2.00"),
        plan_price=Decimal("0"),
    ),
    # Starter: ~5% better than API
    "starter": PlanRates(
        input_rate=Decimal("0.95"),
        output_rate=Decimal("1.90"),
        plan_price=Decimal("19"),
    ),
    # Pro: ~15% better than API
    "pro": PlanRates(
        input_rate=Decimal("0.85"),
        output_rate=Decimal("1.75"),
        plan_price=Decimal("79"),
    ),
    # Enterprise: ~20% better than API
    "enterprise": PlanRates(
        input_rate=Decimal("0.80"),
        output_rate=Decimal("1.60"),
        plan_price=Decimal("299"),
    ),
    # Free plan (no API access, but define rates anyway)
    "free": PlanRates(
        input_rate=Decimal("1.00"),
        output_rate=Decimal("2.00"),
        plan_price=Decimal("0"),
    ),
}


def get_plan_rates(plan: str) -> PlanRates:
    """Get the token rates for a given plan."""
    return PLAN_RATES.get(plan, PLAN_RATES["free"])


def calculate_cost(plan: str, input_tokens: int, output_tokens: int) -> Decimal:
    """
    Calculate the credit cost for a given number of tokens.
    
    Args:
        plan: The subscription plan name
        input_tokens: Number of input tokens used
        output_tokens: Number of output tokens used
        
    Returns:
        Cost in USD (to deduct from credit balance)
    """
    rates = get_plan_rates(plan)
    
    # Convert tokens to millions and calculate cost
    input_millions = Decimal(input_tokens) / Decimal(1_000_000)
    output_millions = Decimal(output_tokens) / Decimal(1_000_000)
    
    input_cost = input_millions * rates.input_rate
    output_cost = output_millions * rates.output_rate
    
    return input_cost + output_cost


def check_sufficient_credits(credit_balance: Decimal, estimated_cost: Decimal) -> bool:
    """Check if user has enough credits for the estimated cost."""
    return credit_balance >= estimated_cost


def estimate_max_tokens(credit_balance: Decimal, plan: str) -> Tuple[int, int]:
    """
    Estimate how many tokens a user can afford with their remaining balance.
    Assumes 1:1 input:output ratio for estimation.
    
    Returns:
        Tuple of (max_input_tokens, max_output_tokens)
    """
    rates = get_plan_rates(plan)
    
    # Cost per 1M tokens at 1:1 ratio
    cost_per_million_pair = rates.input_rate + rates.output_rate
    
    # How many million-token pairs can they afford?
    affordable_pairs = credit_balance / cost_per_million_pair
    
    # Convert to actual token counts
    max_tokens = int(affordable_pairs * 1_000_000)
    
    return (max_tokens, max_tokens)


def get_plan_info(plan: str) -> dict:
    """Get plan information for display."""
    rates = get_plan_rates(plan)
    
    # Calculate effective rate at 1:1 ratio
    effective_rate = (rates.input_rate + rates.output_rate) / 2
    
    # Calculate savings vs API
    api_rates = get_plan_rates("metered")
    api_effective = (api_rates.input_rate + api_rates.output_rate) / 2
    savings_pct = ((api_effective - effective_rate) / api_effective) * 100
    
    return {
        "plan": plan,
        "price": float(rates.plan_price),
        "input_rate": float(rates.input_rate),
        "output_rate": float(rates.output_rate),
        "effective_rate": float(effective_rate),
        "savings_vs_api": float(savings_pct),
    }
