# FORGE V1 — Database Schema

## Overview

PostgreSQL 15+ is the primary persistent data store for FORGE.

---

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     users       │       │    api_keys     │       │ usage_records   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ user_id (FK)    │       │ id (PK)         │
│ email           │       │ id (PK)         │       │ user_id (FK)    │──────►│
│ password_hash   │       │ key_hash        │       │ api_key_id (FK) │──────►│
│ name            │       │ name            │       │ model           │
│ created_at      │       │ prefix          │       │ prompt_tokens   │
│ updated_at      │       │ created_at      │       │ completion_tkns │
│ email_verified  │       │ last_used_at    │       │ total_tokens    │
│ is_active       │       │ expires_at      │       │ latency_ms      │
└────────┬────────┘       │ is_active       │       │ created_at      │
         │                └─────────────────┘       │ request_id      │
         │                                          │ status          │
         │                                          └─────────────────┘
         │
         │        ┌─────────────────┐       ┌─────────────────────────┐
         │        │  subscriptions  │       │  rate_limit_overrides   │
         │        ├─────────────────┤       ├─────────────────────────┤
         └───────►│ user_id (FK)    │       │ id (PK)                 │
                  │ id (PK)         │       │ user_id (FK)            │──────►│
                  │ stripe_cust_id  │       │ requests_per_minute     │
                  │ stripe_sub_id   │       │ tokens_per_minute       │
                  │ plan            │       │ tokens_per_day          │
                  │ status          │       │ created_at              │
                  │ current_period_ │       │ updated_at              │
                  │   start         │       └─────────────────────────┘
                  │ current_period_ │
                  │   end           │
                  │ created_at      │
                  │ updated_at      │
                  └─────────────────┘
```

---

## Table Definitions

### 1. `users`

Stores user account information.

```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(255),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email_verified  BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| password_hash | VARCHAR(255) | NOT NULL | Argon2id hashed password |
| name | VARCHAR(255) | - | Display name |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Account creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update time |
| email_verified | BOOLEAN | DEFAULT FALSE | Email verification status |
| is_active | BOOLEAN | DEFAULT TRUE | Account active status |

---

### 2. `api_keys`

Stores hashed API keys for authentication.

```sql
CREATE TABLE api_keys (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_hash        VARCHAR(64) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL DEFAULT 'Default',
    prefix          VARCHAR(12) NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at    TIMESTAMP WITH TIME ZONE,
    expires_at      TIMESTAMP WITH TIME ZONE,
    is_active       BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_prefix ON api_keys(prefix);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto | Unique key identifier |
| user_id | UUID | FK → users.id | Owner of the key |
| key_hash | VARCHAR(64) | UNIQUE, NOT NULL | SHA-256 hash of API key |
| name | VARCHAR(255) | NOT NULL | User-defined key name |
| prefix | VARCHAR(12) | NOT NULL | Key prefix for identification (e.g., `sk-forge-abc`) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Key creation time |
| last_used_at | TIMESTAMPTZ | - | Last usage timestamp |
| expires_at | TIMESTAMPTZ | - | Optional expiration |
| is_active | BOOLEAN | DEFAULT TRUE | Key active status |

**API Key Format:** `sk-forge-{random_32_chars}`

**Storage:** Only the SHA-256 hash is stored. The plaintext key is shown once at creation.

---

### 3. `usage_records`

Tracks token usage per request for billing and analytics.

```sql
CREATE TABLE usage_records (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    api_key_id          UUID REFERENCES api_keys(id) ON DELETE SET NULL,
    request_id          VARCHAR(64) NOT NULL UNIQUE,
    model               VARCHAR(64) NOT NULL,
    prompt_tokens       INTEGER NOT NULL DEFAULT 0,
    completion_tokens   INTEGER NOT NULL DEFAULT 0,
    total_tokens        INTEGER NOT NULL DEFAULT 0,
    latency_ms          INTEGER,
    status              VARCHAR(20) NOT NULL DEFAULT 'success',
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_usage_records_user_id ON usage_records(user_id);
CREATE INDEX idx_usage_records_created_at ON usage_records(created_at);
CREATE INDEX idx_usage_records_user_created ON usage_records(user_id, created_at);
CREATE INDEX idx_usage_records_model ON usage_records(model);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto | Unique record identifier |
| user_id | UUID | FK → users.id | User who made request |
| api_key_id | UUID | FK → api_keys.id | API key used (nullable) |
| request_id | VARCHAR(64) | UNIQUE, NOT NULL | Unique request identifier |
| model | VARCHAR(64) | NOT NULL | Model used |
| prompt_tokens | INTEGER | NOT NULL, DEFAULT 0 | Input tokens |
| completion_tokens | INTEGER | NOT NULL, DEFAULT 0 | Output tokens |
| total_tokens | INTEGER | NOT NULL, DEFAULT 0 | Total tokens |
| latency_ms | INTEGER | - | Request latency in ms |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'success' | Request status |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Request timestamp |

**Status Values:** `success`, `error`, `rate_limited`, `timeout`

---

### 4. `subscriptions`

Tracks Stripe subscription state.

```sql
CREATE TABLE subscriptions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    stripe_customer_id      VARCHAR(64) NOT NULL UNIQUE,
    stripe_subscription_id  VARCHAR(64) UNIQUE,
    plan                    VARCHAR(32) NOT NULL DEFAULT 'free',
    status                  VARCHAR(32) NOT NULL DEFAULT 'active',
    current_period_start    TIMESTAMP WITH TIME ZONE,
    current_period_end      TIMESTAMP WITH TIME ZONE,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto | Unique subscription ID |
| user_id | UUID | FK → users.id, UNIQUE | One subscription per user |
| stripe_customer_id | VARCHAR(64) | UNIQUE, NOT NULL | Stripe customer ID |
| stripe_subscription_id | VARCHAR(64) | UNIQUE | Stripe subscription ID |
| plan | VARCHAR(32) | NOT NULL, DEFAULT 'free' | Plan tier |
| status | VARCHAR(32) | NOT NULL, DEFAULT 'active' | Subscription status |
| current_period_start | TIMESTAMPTZ | - | Billing period start |
| current_period_end | TIMESTAMPTZ | - | Billing period end |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update time |

**Plan Values:** `free`, `starter`, `pro`, `enterprise`

**Status Values:** `active`, `past_due`, `canceled`, `incomplete`, `trialing`

---

### 5. `rate_limit_overrides`

Custom rate limits per user (for enterprise or special cases).

```sql
CREATE TABLE rate_limit_overrides (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    requests_per_minute     INTEGER NOT NULL DEFAULT 60,
    tokens_per_minute       INTEGER NOT NULL DEFAULT 100000,
    tokens_per_day          INTEGER NOT NULL DEFAULT 1000000,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rate_limit_overrides_user_id ON rate_limit_overrides(user_id);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto | Unique override ID |
| user_id | UUID | FK → users.id, UNIQUE | User with custom limits |
| requests_per_minute | INTEGER | NOT NULL, DEFAULT 60 | RPM limit |
| tokens_per_minute | INTEGER | NOT NULL, DEFAULT 100000 | TPM limit |
| tokens_per_day | INTEGER | NOT NULL, DEFAULT 1000000 | Daily token limit |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update time |

---

## Default Rate Limits by Plan

| Plan | Requests/min | Tokens/min | Tokens/day |
|------|--------------|------------|------------|
| free | 10 | 10,000 | 100,000 |
| starter | 30 | 50,000 | 500,000 |
| pro | 60 | 100,000 | 2,000,000 |
| enterprise | 120 | 500,000 | 10,000,000 |

---

## Migrations

Use Alembic for database migrations.

### Initial Migration

```python
# api/db/migrations/versions/001_initial.py

"""Initial schema

Revision ID: 001
Create Date: 2024-XX-XX
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Users table
    op.create_table(
        'users',
        sa.Column('id', UUID(), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('name', sa.String(255)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('email_verified', sa.Boolean(), server_default='false'),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
    )
    op.create_index('idx_users_email', 'users', ['email'])
    
    # API Keys table
    op.create_table(
        'api_keys',
        sa.Column('id', UUID(), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', UUID(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('key_hash', sa.String(64), nullable=False, unique=True),
        sa.Column('name', sa.String(255), nullable=False, server_default='Default'),
        sa.Column('prefix', sa.String(12), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('last_used_at', sa.DateTime(timezone=True)),
        sa.Column('expires_at', sa.DateTime(timezone=True)),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
    )
    op.create_index('idx_api_keys_user_id', 'api_keys', ['user_id'])
    op.create_index('idx_api_keys_key_hash', 'api_keys', ['key_hash'])
    
    # Usage Records table
    op.create_table(
        'usage_records',
        sa.Column('id', UUID(), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', UUID(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('api_key_id', UUID(), sa.ForeignKey('api_keys.id', ondelete='SET NULL')),
        sa.Column('request_id', sa.String(64), nullable=False, unique=True),
        sa.Column('model', sa.String(64), nullable=False),
        sa.Column('prompt_tokens', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('completion_tokens', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('total_tokens', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('latency_ms', sa.Integer()),
        sa.Column('status', sa.String(20), nullable=False, server_default='success'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('idx_usage_records_user_id', 'usage_records', ['user_id'])
    op.create_index('idx_usage_records_created_at', 'usage_records', ['created_at'])
    
    # Subscriptions table
    op.create_table(
        'subscriptions',
        sa.Column('id', UUID(), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', UUID(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('stripe_customer_id', sa.String(64), nullable=False, unique=True),
        sa.Column('stripe_subscription_id', sa.String(64), unique=True),
        sa.Column('plan', sa.String(32), nullable=False, server_default='free'),
        sa.Column('status', sa.String(32), nullable=False, server_default='active'),
        sa.Column('current_period_start', sa.DateTime(timezone=True)),
        sa.Column('current_period_end', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('idx_subscriptions_user_id', 'subscriptions', ['user_id'])
    
    # Rate Limit Overrides table
    op.create_table(
        'rate_limit_overrides',
        sa.Column('id', UUID(), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', UUID(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('requests_per_minute', sa.Integer(), nullable=False, server_default='60'),
        sa.Column('tokens_per_minute', sa.Integer(), nullable=False, server_default='100000'),
        sa.Column('tokens_per_day', sa.Integer(), nullable=False, server_default='1000000'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('idx_rate_limit_overrides_user_id', 'rate_limit_overrides', ['user_id'])

def downgrade():
    op.drop_table('rate_limit_overrides')
    op.drop_table('subscriptions')
    op.drop_table('usage_records')
    op.drop_table('api_keys')
    op.drop_table('users')
```

---

## Queries

### Common Queries

**Get user by email:**
```sql
SELECT * FROM users WHERE email = $1 AND is_active = TRUE;
```

**Validate API key:**
```sql
SELECT ak.*, u.id as owner_id, s.plan
FROM api_keys ak
JOIN users u ON ak.user_id = u.id
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE ak.key_hash = $1 
  AND ak.is_active = TRUE 
  AND u.is_active = TRUE
  AND (ak.expires_at IS NULL OR ak.expires_at > NOW());
```

**Get user usage for current period:**
```sql
SELECT 
    SUM(prompt_tokens) as total_prompt_tokens,
    SUM(completion_tokens) as total_completion_tokens,
    SUM(total_tokens) as total_tokens,
    COUNT(*) as request_count
FROM usage_records
WHERE user_id = $1
  AND created_at >= $2
  AND created_at < $3;
```

**Get daily usage breakdown:**
```sql
SELECT 
    DATE(created_at) as date,
    SUM(total_tokens) as tokens,
    COUNT(*) as requests
FROM usage_records
WHERE user_id = $1
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## Data Retention

| Data Type | Retention Period | Action |
|-----------|------------------|--------|
| Usage Records | 90 days | Archive to cold storage |
| API Keys (deleted) | 30 days | Hard delete |
| Users (deleted) | 30 days | Hard delete |
| Audit Logs | 1 year | Archive |

---

## Backup Strategy

- **Full backup:** Daily at 03:00 UTC
- **Point-in-time recovery:** Enabled (Render managed)
- **Backup retention:** 7 days
- **Cross-region replication:** V2 (not V1)
