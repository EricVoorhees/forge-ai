"""
FORGE Models Routes
List available models (OpenAI compatible)
"""

from typing import List
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from auth.api_key import ApiKeyData, validate_api_key

router = APIRouter(prefix="/v1/models", tags=["Models"])


class ModelInfo(BaseModel):
    id: str
    object: str = "model"
    created: int
    owned_by: str


class ModelsResponse(BaseModel):
    object: str = "list"
    data: List[ModelInfo]


AVAILABLE_MODELS = [
    ModelInfo(
        id="forge-coder",
        object="model",
        created=1709251200,
        owned_by="forge"
    ),
]


@router.get("", response_model=ModelsResponse)
async def list_models(api_key: ApiKeyData = Depends(validate_api_key)):
    """List available models. Requires API key authentication."""
    return ModelsResponse(data=AVAILABLE_MODELS)


@router.get("/{model_id}", response_model=ModelInfo)
async def get_model(model_id: str, api_key: ApiKeyData = Depends(validate_api_key)):
    """Get model details. Requires API key authentication."""
    for model in AVAILABLE_MODELS:
        if model.id == model_id:
            return model
    
    return ModelInfo(
        id=model_id,
        object="model",
        created=1709251200,
        owned_by="forge"
    )
