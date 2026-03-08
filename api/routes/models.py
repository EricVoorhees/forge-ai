"""
FORGE Models Routes
List available models (OpenAI compatible)
"""

from typing import List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from auth.api_key import ApiKeyData, validate_api_key
from services.models import list_models as get_all_models, get_model as get_model_config

router = APIRouter(prefix="/v1/models", tags=["Models"])


class ModelInfo(BaseModel):
    id: str
    object: str = "model"
    created: int
    owned_by: str
    display_name: Optional[str] = None
    description: Optional[str] = None
    context_window: Optional[int] = None
    max_output: Optional[int] = None


class ModelsResponse(BaseModel):
    object: str = "list"
    data: List[ModelInfo]


def _model_to_info(model_config) -> ModelInfo:
    """Convert ModelConfig to ModelInfo response."""
    return ModelInfo(
        id=model_config.id,
        object="model",
        created=1709251200,
        owned_by="forge",
        display_name=model_config.display_name,
        description=model_config.description,
        context_window=model_config.context_window,
        max_output=model_config.max_output,
    )


@router.get("", response_model=ModelsResponse)
async def list_models(api_key: ApiKeyData = Depends(validate_api_key)):
    """List available models. Requires API key authentication."""
    models = get_all_models()
    return ModelsResponse(data=[_model_to_info(m) for m in models])


@router.get("/{model_id}", response_model=ModelInfo)
async def get_model(model_id: str, api_key: ApiKeyData = Depends(validate_api_key)):
    """Get model details. Requires API key authentication."""
    model_config = get_model_config(model_id)
    return _model_to_info(model_config)
