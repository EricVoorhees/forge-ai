"""
FORGE Database Connection
Async SQLAlchemy with PostgreSQL
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from contextlib import asynccontextmanager

from config import settings

# Convert database URL to async format
database_url = settings.database_url

# Render/Fly provides postgres:// but SQLAlchemy async needs postgresql+asyncpg://
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Remove ssl/sslmode from URL (asyncpg handles it via connect_args)
import re
ssl_required = "ssl=" in database_url or "sslmode=" in database_url
database_url = re.sub(r'[?&](ssl|sslmode)=[^&]*', '', database_url)
# Clean up any trailing ? or &&
database_url = database_url.rstrip('?').replace('&&', '&').rstrip('&')

# SQLite doesn't support pool_size/max_overflow
if database_url.startswith("sqlite"):
    engine = create_async_engine(
        database_url,
        echo=settings.debug,
        connect_args={"check_same_thread": False}
    )
else:
    # For PostgreSQL with asyncpg, use connect_args for SSL
    connect_args = {}
    if ssl_required:
        import ssl
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        connect_args["ssl"] = ssl_context
    
    engine = create_async_engine(
        database_url,
        echo=settings.debug,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        connect_args=connect_args
    )

async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()


async def get_db():
    """Dependency for FastAPI routes."""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


@asynccontextmanager
async def get_db_context():
    """Context manager for non-route usage."""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Initialize database tables."""
    # Import models to register them with Base.metadata
    from db import models  # noqa: F401
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db():
    """Close database connections."""
    await engine.dispose()
