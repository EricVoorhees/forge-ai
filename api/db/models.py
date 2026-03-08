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


# =============================================================================
# FORGE Audit Models
# =============================================================================

class AuditScan(Base):
    """Security audit scan job."""
    __tablename__ = "audit_scans"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Source info
    source_type = Column(String(20), nullable=False)  # github, gitlab, zip, paste
    repo_url = Column(Text)
    branch = Column(String(255))
    commit_sha = Column(String(40))
    
    # Status
    status = Column(String(20), nullable=False, default="queued")  # queued, running, completed, failed
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    error_message = Column(Text)
    
    # Results summary
    total_findings = Column(Integer, default=0)
    critical_count = Column(Integer, default=0)
    high_count = Column(Integer, default=0)
    medium_count = Column(Integer, default=0)
    low_count = Column(Integer, default=0)
    
    # Metadata
    files_scanned = Column(Integer, default=0)
    lines_of_code = Column(Integer, default=0)
    languages = Column(Text)  # JSON string
    
    # Usage tracking
    tokens_used = Column(Integer, default=0)
    cost = Column(Numeric(10, 6), default=0)
    
    # Model used for analysis
    model = Column(String(32), default="forge-coder")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    findings = relationship("AuditFinding", back_populates="scan", cascade="all, delete-orphan")
    dependencies = relationship("AuditDependency", back_populates="scan", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<AuditScan {self.id} ({self.status})>"


class AuditFinding(Base):
    """Individual security finding from an audit scan."""
    __tablename__ = "audit_findings"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    scan_id = Column(UUID(), ForeignKey("audit_scans.id", ondelete="CASCADE"), nullable=False)
    
    # Finding details
    finding_type = Column(String(50), nullable=False)  # sql_injection, xss, etc.
    severity = Column(String(20), nullable=False)  # critical, high, medium, low
    confidence = Column(String(20), nullable=False, default="medium")  # high, medium, low
    
    # Location
    file_path = Column(Text, nullable=False)
    line_number = Column(Integer)
    column_number = Column(Integer)
    code_snippet = Column(Text)
    
    # Analysis
    description = Column(Text, nullable=False)
    exploit_reasoning = Column(Text)
    suggested_fix = Column(Text)  # JSON string with { description, diff }
    
    # References
    cwe_id = Column(String(20))
    owasp_category = Column(String(50))
    references = Column(Text)  # JSON array
    
    # Status
    finding_status = Column(String(20), default="open")  # open, acknowledged, fixed, false_positive
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    scan = relationship("AuditScan", back_populates="findings")
    
    def __repr__(self):
        return f"<AuditFinding {self.finding_type} ({self.severity})>"


class AuditDependency(Base):
    """Vulnerable dependency found during audit."""
    __tablename__ = "audit_dependencies"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    scan_id = Column(UUID(), ForeignKey("audit_scans.id", ondelete="CASCADE"), nullable=False)
    
    package_name = Column(String(255), nullable=False)
    package_version = Column(String(50))
    ecosystem = Column(String(50))  # npm, pip, cargo, go
    
    # Vulnerability info
    cve_id = Column(String(20))
    severity = Column(String(20))
    cvss_score = Column(Numeric(3, 1))
    title = Column(Text)
    description = Column(Text)
    fixed_in = Column(String(50))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    scan = relationship("AuditScan", back_populates="dependencies")
    
    def __repr__(self):
        return f"<AuditDependency {self.package_name}@{self.package_version}>"


# =============================================================================
# GitHub Integration Models
# =============================================================================

class GitHubConnection(Base):
    """GitHub OAuth connection for a user."""
    __tablename__ = "github_connections"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # GitHub user info
    github_user_id = Column(Integer, nullable=False)
    github_username = Column(String(255), nullable=False)
    github_email = Column(String(255))
    github_avatar_url = Column(Text)
    
    # OAuth tokens (encrypted in production)
    access_token = Column(Text, nullable=False)
    token_type = Column(String(32), default="bearer")
    scope = Column(Text)  # Comma-separated scopes
    
    # Metadata
    connected_at = Column(DateTime(timezone=True), server_default=func.now())
    last_used_at = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)
    
    # Relationship
    user = relationship("User", backref="github_connection")
    
    def __repr__(self):
        return f"<GitHubConnection {self.github_username}>"
