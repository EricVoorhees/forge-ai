"""
FORGE API Server
Main application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import asyncio

from config import settings
from db.database import init_db, close_db
from services.logging import setup_logging, get_logger
from middleware.request_logging import RequestLoggingMiddleware

logger = get_logger("main")
from routes.completions import router as completions_router
from routes.models import router as models_router
from routes.usage import router as usage_router
from routes.api_keys import router as api_keys_router
from routes.health import router as health_router
from routes.audit import router as audit_router
from routes.github import router as github_router
from auth.routes import router as auth_router
from billing.routes import router as billing_router
from billing.webhooks import router as webhooks_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    setup_logging()
    logger.info("="*60)
    logger.info("FORGE API Server starting up")
    logger.info(f"Environment: {settings.app_env}")
    logger.info(f"Debug mode: {settings.debug}")
    logger.info(f"CORS origins: {settings.cors_origins}")
    logger.info("="*60)
    
    logger.info("Initializing database...")
    # Retry database connection with backoff (services may still be starting)
    max_retries = 10
    retry_delay = 5
    for attempt in range(max_retries):
        try:
            await init_db()
            logger.info("Database initialized successfully")
            break
        except Exception as e:
            if attempt < max_retries - 1:
                logger.warning(f"Database connection failed (attempt {attempt + 1}/{max_retries}): {e}")
                logger.info(f"Retrying in {retry_delay} seconds...")
                await asyncio.sleep(retry_delay)
                retry_delay = min(retry_delay * 1.5, 30)  # Exponential backoff, max 30s
            else:
                logger.error(f"Database connection failed after {max_retries} attempts: {e}")
                raise
    
    yield
    
    # Shutdown
    logger.info("FORGE API Server shutting down...")
    await close_db()
    logger.info("Database connections closed")


app = FastAPI(
    title="FORGE API",
    description="400B Sparse MoE Coding API",
    version="1.0.0",
    lifespan=lifespan
)

# Request logging middleware (must be added first to wrap all requests)
app.add_middleware(RequestLoggingMiddleware)

# CORS
cors_origins = settings.cors_origins.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(completions_router)
app.include_router(models_router)
app.include_router(usage_router)
app.include_router(api_keys_router)
app.include_router(audit_router)
app.include_router(github_router)
app.include_router(billing_router)
app.include_router(webhooks_router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "FORGE API",
        "version": "1.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=os.getenv("DEBUG", "false").lower() == "true"
    )
