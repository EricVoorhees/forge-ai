"""
FORGE Auth Routes
Register, login, refresh, and logout endpoints
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from db.database import get_db
from db.models import User, Subscription
from .jwt import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from .dependencies import get_current_user
from services.logging import get_logger

logger = get_logger("auth.routes")

router = APIRouter(prefix="/auth", tags=["Authentication"])


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 900


class RefreshRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    created_at: str
    
    class Config:
        from_attributes = True


@router.post("/register", response_model=UserResponse)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user account."""
    logger.info(f"Registration attempt for email: {request.email}")
    
    try:
        result = await db.execute(
            select(User).where(User.email == request.email)
        )
        if result.scalar_one_or_none():
            logger.warning(f"Registration failed: Email already registered: {request.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        if len(request.password) < 8:
            logger.warning(f"Registration failed: Password too short for {request.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters"
            )
        
        user = User(
            email=request.email,
            password_hash=hash_password(request.password),
            name=request.name
        )
        db.add(user)
        await db.flush()
        
        logger.info(f"User registered successfully", extra={"user_id": str(user.id), "extra_data": {"email": user.email}})
        
        return UserResponse(
            id=str(user.id),
            email=user.email,
            name=user.name,
            created_at=user.created_at.isoformat()
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {type(e).__name__}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {type(e).__name__}: {str(e)}"
        )


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login and receive JWT tokens."""
    logger.info(f"Login attempt for email: {request.email}")
    
    result = await db.execute(
        select(User).where(User.email == request.email, User.is_active == True)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        logger.warning(f"Login failed: User not found or inactive: {request.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not verify_password(request.password, user.password_hash):
        logger.warning(f"Login failed: Invalid password for {request.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    logger.info(f"Login successful", extra={"user_id": str(user.id)})
    
    return TokenResponse(
        access_token=create_access_token(str(user.id), user.email),
        refresh_token=create_refresh_token(str(user.id))
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(request: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Refresh access token using refresh token."""
    logger.debug("Token refresh attempt")
    
    payload = decode_token(request.refresh_token)
    
    if not payload or payload.get("type") != "refresh":
        logger.warning("Token refresh failed: Invalid refresh token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("sub")
    logger.debug(f"Token refresh for user", extra={"user_id": user_id})
    
    result = await db.execute(
        select(User).where(User.id == user_id, User.is_active == True)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        logger.warning(f"Token refresh failed: User not found or inactive", extra={"user_id": user_id})
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    logger.info(f"Token refreshed successfully", extra={"user_id": str(user.id)})
    
    return TokenResponse(
        access_token=create_access_token(str(user.id), user.email),
        refresh_token=create_refresh_token(str(user.id))
    )


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    """Get current user profile."""
    logger.debug(f"Get profile request", extra={"user_id": str(user.id)})
    return UserResponse(
        id=str(user.id),
        email=user.email,
        name=user.name,
        created_at=user.created_at.isoformat()
    )


class ClerkSyncRequest(BaseModel):
    clerk_id: str
    email: EmailStr
    name: Optional[str] = None


class ClerkSyncResponse(BaseModel):
    id: str
    clerk_id: str
    email: str
    name: Optional[str] = None
    forge_token: str


@router.post("/clerk-sync", response_model=ClerkSyncResponse)
async def clerk_sync(request: ClerkSyncRequest, db: AsyncSession = Depends(get_db)):
    """
    Sync a Clerk user to FORGE backend.
    Creates user if not exists, returns FORGE JWT token for API access.
    """
    logger.info(f"Clerk sync for: {request.email}", extra={"extra_data": {"clerk_id": request.clerk_id}})
    
    # Check if user exists by clerk_id or email
    result = await db.execute(
        select(User).where(
            (User.clerk_id == request.clerk_id) | (User.email == request.email)
        )
    )
    user = result.scalar_one_or_none()
    
    if user:
        # Update clerk_id if not set
        if not user.clerk_id:
            user.clerk_id = request.clerk_id
        if request.name and not user.name:
            user.name = request.name
        logger.info(f"Clerk sync: existing user", extra={"user_id": str(user.id)})
    else:
        # Create new user
        user = User(
            email=request.email,
            clerk_id=request.clerk_id,
            name=request.name,
            password_hash=""  # No password for Clerk users
        )
        db.add(user)
        await db.flush()
        logger.info(f"Clerk sync: new user created", extra={"user_id": str(user.id)})
    
    # Generate FORGE token for this user
    forge_token = create_access_token(str(user.id), user.email)
    
    return ClerkSyncResponse(
        id=str(user.id),
        clerk_id=request.clerk_id,
        email=user.email,
        name=user.name,
        forge_token=forge_token
    )
