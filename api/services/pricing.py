"""
FORGE Pricing Service
Per-model, per-plan pricing with natural-looking rates.

Plans work like prepaid credits:
- User pays $19/$79/$299 upfront
- Gets that amount as credit balance
- Each API call deducts credits based on model + plan rates
- Higher plans get slightly better rates
"""

from decimal import Decimal
from typing import Tuple, Dict
from dataclasses import dataclass


@dataclass
class ModelPlanRates:
    """Token rates for a specific model + plan combination ($/1M tokens)."""
    input_rate: Decimal
    output_rate: Decimal


# Pricing matrix: MODEL_RATES[model_id][plan] = rates
# Natural pricing - avoid round numbers
MODEL_RATES: Dict[str, Dict[str, ModelPlanRates]] = {
    # Forge Coder (DeepSeek V3.1 671B) - Your cost: $0.56/$1.68
    "forge-coder": {
        "metered": ModelPlanRates(Decimal("0.98"), Decimal("1.87")),    # Best public rate
        "starter": ModelPlanRates(Decimal("1.03"), Decimal("1.96")),    # +5% premium
        "pro": ModelPlanRates(Decimal("1.00"), Decimal("1.91")),        # +2% premium
        "enterprise": ModelPlanRates(Decimal("0.98"), Decimal("1.83")), # Best overall
        "free": ModelPlanRates(Decimal("0.98"), Decimal("1.87")),
    },
    # Forge Mini (GPT-OSS-120B) - Your cost: $0.04/$0.19
    "forge-mini": {
        "metered": ModelPlanRates(Decimal("0.079"), Decimal("0.37")),   # Best public rate
        "starter": ModelPlanRates(Decimal("0.083"), Decimal("0.39")),   # +5% premium
        "pro": ModelPlanRates(Decimal("0.081"), Decimal("0.38")),       # +3% premium
        "enterprise": ModelPlanRates(Decimal("0.079"), Decimal("0.36")), # Best overall
        "free": ModelPlanRates(Decimal("0.079"), Decimal("0.37")),
    },
}

# Plan prices (for credit allocation)
PLAN_PRICES = {
    "free": Decimal("0"),
    "starter": Decimal("19"),
    "pro": Decimal("79"),
    "enterprise": Decimal("299"),
    "metered": Decimal("0"),
}


@dataclass
class PlanRates:
    """Plan-level rates including price and token rates."""
    plan_price: Decimal
    input_rate: Decimal
    output_rate: Decimal


# Legacy PLAN_RATES for backward compatibility with webhooks
PLAN_RATES = {
    "free": PlanRates(Decimal("0"), Decimal("0.98"), Decimal("1.87")),
    "starter": PlanRates(Decimal("19"), Decimal("1.03"), Decimal("1.96")),
    "pro": PlanRates(Decimal("79"), Decimal("1.00"), Decimal("1.91")),
    "enterprise": PlanRates(Decimal("299"), Decimal("0.98"), Decimal("1.83")),
    "metered": PlanRates(Decimal("0"), Decimal("0.98"), Decimal("1.87")),
}


def get_rates(model: str, plan: str) -> ModelPlanRates:
    """Get rates for a model + plan combination."""
    # Default to forge-coder if model not found
    model_rates = MODEL_RATES.get(model, MODEL_RATES["forge-coder"])
    # Default to metered if plan not found
    return model_rates.get(plan, model_rates["metered"])


def get_plan_price(plan: str) -> Decimal:
    """Get the monthly price for a plan."""
    return PLAN_PRICES.get(plan, Decimal("0"))


def calculate_cost(model: str, plan: str, input_tokens: int, output_tokens: int) -> Decimal:
    """
    Calculate the credit cost for a given number of tokens.
    
    Args:
        model: The model ID (forge-coder, forge-mini)
        plan: The subscription plan name
        input_tokens: Number of input tokens used
        output_tokens: Number of output tokens used
        
    Returns:
        Cost in USD (to deduct from credit balance)
    """
    rates = get_rates(model, plan)
    
    # Convert tokens to millions and calculate cost
    input_millions = Decimal(input_tokens) / Decimal(1_000_000)
    output_millions = Decimal(output_tokens) / Decimal(1_000_000)
    
    input_cost = input_millions * rates.input_rate
    output_cost = output_millions * rates.output_rate
    
    return input_cost + output_cost


def check_sufficient_credits(credit_balance: Decimal, estimated_cost: Decimal) -> bool:
    """Check if user has enough credits for the estimated cost."""
    return credit_balance >= estimated_cost


def estimate_max_tokens(credit_balance: Decimal, model: str, plan: str) -> Tuple[int, int]:
    """
    Estimate how many tokens a user can afford with their remaining balance.
    Assumes 1:1 input:output ratio for estimation.
    
    Returns:
        Tuple of (max_input_tokens, max_output_tokens)
    """
    rates = get_rates(model, plan)
    
    # Cost per 1M tokens at 1:1 ratio
    cost_per_million_pair = rates.input_rate + rates.output_rate
    
    # How many million-token pairs can they afford?
    affordable_pairs = credit_balance / cost_per_million_pair
    
    # Convert to actual token counts
    max_tokens = int(affordable_pairs * 1_000_000)
    
    return (max_tokens, max_tokens)


def get_model_pricing_info(model: str) -> dict:
    """Get pricing info for a model across all plans."""
    model_rates = MODEL_RATES.get(model, MODEL_RATES["forge-coder"])
    
    return {
        "model": model,
        "plans": {
            plan: {
                "input_rate": float(rates.input_rate),
                "output_rate": float(rates.output_rate),
                "blended_rate": float((rates.input_rate + rates.output_rate) / 2),
            }
            for plan, rates in model_rates.items()
        }
    }


def get_all_pricing() -> dict:
    """Get complete pricing info for all models and plans."""
    return {
        model: get_model_pricing_info(model)
        for model in MODEL_RATES.keys()
    }
