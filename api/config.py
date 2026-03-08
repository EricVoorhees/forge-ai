"""
FORGE API Configuration
Environment-based settings
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment."""
    
    # Database
    database_url: str = "postgresql+asyncpg://localhost/forge"
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    
    # JWT
    jwt_secret_key: str = "dev-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    
    # Stripe
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_price_starter: str = ""
    stripe_price_pro: str = ""
    stripe_price_enterprise: str = ""
    stripe_price_metered: str = ""  # Pay-as-you-go metered billing
    
    # Inference (Fireworks.ai)
    inference_url: str = "https://api.fireworks.ai/inference/v1"
    inference_timeout: float = 300.0
    fireworks_api_key: str = ""  # Required for Fireworks.ai
    inference_model: str = "accounts/fireworks/models/deepseek-v3p1"
    
    # Application
    app_env: str = "development"
    debug: bool = True
    cors_origins: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
