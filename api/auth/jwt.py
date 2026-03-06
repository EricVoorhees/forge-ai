"""
FORGE JWT Authentication
Token generation and validation
"""

from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext

from config import settings
from services.logging import get_logger

logger = get_logger("auth.jwt")

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password using Argon2."""
    logger.debug("Hashing password")
    hashed = pwd_context.hash(password)
    logger.debug("Password hashed successfully")
    return hashed


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    logger.debug("Verifying password")
    result = pwd_context.verify(plain_password, hashed_password)
    logger.debug(f"Password verification: {'SUCCESS' if result else 'FAILED'}")
    return result


def create_access_token(user_id: str, email: str) -> str:
    """Create a JWT access token."""
    logger.info(f"Creating access token for user", extra={"user_id": user_id})
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {
        "sub": user_id,
        "email": email,
        "type": "access",
        "exp": expire,
        "iat": datetime.utcnow()
    }
    token = jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    logger.info(f"Access token created, expires in {settings.access_token_expire_minutes} minutes", extra={"user_id": user_id})
    return token


def create_refresh_token(user_id: str) -> str:
    """Create a JWT refresh token."""
    import uuid
    logger.info(f"Creating refresh token for user", extra={"user_id": user_id})
    expire = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
    jti = str(uuid.uuid4())
    payload = {
        "sub": user_id,
        "type": "refresh",
        "jti": jti,
        "exp": expire,
        "iat": datetime.utcnow()
    }
    token = jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    logger.info(f"Refresh token created, expires in {settings.refresh_token_expire_days} days", extra={"user_id": user_id, "extra_data": {"jti": jti[:8]}})
    return token


def decode_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT token."""
    logger.debug(f"Decoding JWT token (first 20 chars): {token[:20]}...")
    try:
        payload = jwt.decode(
            token, 
            settings.jwt_secret_key, 
            algorithms=[settings.jwt_algorithm]
        )
        logger.debug(f"Token decoded successfully", extra={"user_id": payload.get("sub"), "extra_data": {"type": payload.get("type")}})
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Token decode failed: Token expired")
        return None
    except jwt.PyJWTError as e:
        logger.warning(f"Token decode failed: {str(e)}")
        return None
