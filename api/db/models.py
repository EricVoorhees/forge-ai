"""
FORGE Database Models
SQLAlchemy models matching db/schema.sql
"""

from sqlalchemy import (
    Column, String, Boolean, Integer, DateTime, 
    ForeignKey, Numeric, Text, TypeDecorator
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from .database import Base
from config import settings


# Cross-database UUID type - simplified for Neon PostgreSQL
class UUID(TypeDecorator):
    """Platform-independent UUID type. Uses PostgreSQL's UUID, else CHAR(36)."""
    impl = String(36)
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(PG_UUID(as_uuid=False))
        else:
            return dialect.type_descriptor(String(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        # Always convert to string for binding
        if isinstance(value, uuid.UUID):
            return str(value)
        return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if isinstance(value, uuid.UUID):
            return value
        return uuid.UUID(str(value))


class User(Base):
    """User account."""
    __tablename__ = "users"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)  # Nullable for Clerk users
    name = Column(String(255))
    clerk_id = Column(String(255), unique=True, nullable=True, index=True)  # Clerk user ID
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    email_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    api_keys = relationship("ApiKey", back_populates="user", cascade="all, delete-orphan")
    usage_logs = relationship("UsageLog", back_populates="user", cascade="all, delete-orphan")
    subscription = relationship("Subscription", back_populates="user", uselist=False)
    
    def __repr__(self):
        return f"<User {self.email}>"


class ApiKey(Base):
    """API key for authentication."""
    __tablename__ = "api_keys"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    key_hash = Column(String(64), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False, default="Default")
    prefix = Column(String(12), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_used_at = Column(DateTime(timezone=True))
    expires_at = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)
    
    user = relationship("User", back_populates="api_keys")
    
    def __repr__(self):
        return f"<ApiKey {self.prefix}...>"


class UsageLog(Base):
    """Token usage log for billing."""
    __tablename__ = "usage_logs"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    tokens_input = Column(Integer, nullable=False, default=0)
    tokens_output = Column(Integer, nullable=False, default=0)
    cost = Column(Numeric(10, 6), nullable=False, default=0)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="usage_logs")
    
    def __repr__(self):
        return f"<UsageLog {self.tokens_input}+{self.tokens_output} tokens>"


class Subscription(Base):
    """Stripe subscription with credit balance."""
    __tablename__ = "subscriptions"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    stripe_customer_id = Column(String(64), unique=True, nullable=False)
    stripe_subscription_id = Column(String(64), unique=True)
    plan = Column(String(32), nullable=False, default="free")
    status = Column(String(32), nullable=False, default="active")
    credit_balance = Column(Numeric(10, 4), nullable=False, default=0)  # USD balance remaining
    current_period_start = Column(DateTime(timezone=True))
    current_period_end = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user = relationship("User", back_populates="subscription")
    
    def __repr__(self):
        return f"<Subscription {self.plan} ({self.status}) ${self.credit_balance}>"
