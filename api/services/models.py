"""
FORGE Model Registry
Defines available models, their providers, and routing configuration.
"""

from dataclasses import dataclass
from typing import Dict, Optional, List
from decimal import Decimal


@dataclass
class ModelConfig:
    """Configuration for a FORGE model."""
    id: str                    # forge-coder, forge-mini
    display_name: str          # "Forge Coder", "Forge Mini"
    description: str
    provider: str              # fireworks
    provider_model: str        # actual model ID at provider
    context_window: int
    max_output: int
    # Your costs (for margin calculation, not exposed to users)
    cost_input: Decimal        # $/1M input tokens
    cost_output: Decimal       # $/1M output tokens


MODEL_REGISTRY: Dict[str, ModelConfig] = {
    "forge-coder": ModelConfig(
        id="forge-coder",
        display_name="Forge Coder",
        description="Premium 671B coding model for complex tasks",
        provider="fireworks",
        provider_model="accounts/fireworks/models/deepseek-v3p1",
        context_window=128000,
        max_output=32768,
        cost_input=Decimal("0.56"),
        cost_output=Decimal("1.68"),
    ),
    "forge-mini": ModelConfig(
        id="forge-mini",
        display_name="Forge Mini",
        description="Fast, affordable 120B model for everyday tasks",
        provider="fireworks",
        provider_model="accounts/fireworks/models/gpt-oss-120b",
        context_window=32000,
        max_output=8192,
        cost_input=Decimal("0.04"),
        cost_output=Decimal("0.19"),
    ),
}

# Aliases for backwards compatibility
MODEL_ALIASES = {
    "forge-671b": "forge-coder",
    "forge-1": "forge-coder",
}


def get_model(model_id: str) -> ModelConfig:
    """Get model config by ID, with fallback to forge-coder."""
    # Check aliases first
    if model_id in MODEL_ALIASES:
        model_id = MODEL_ALIASES[model_id]
    return MODEL_REGISTRY.get(model_id, MODEL_REGISTRY["forge-coder"])


def list_models() -> List[ModelConfig]:
    """List all available models."""
    return list(MODEL_REGISTRY.values())


def is_valid_model(model_id: str) -> bool:
    """Check if a model ID is valid."""
    if model_id in MODEL_ALIASES:
        return True
    return model_id in MODEL_REGISTRY
