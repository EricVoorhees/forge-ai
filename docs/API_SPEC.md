# FORGE V1 — API Specification

## Overview

FORGE exposes an **OpenAI-compatible API** for seamless migration from OpenAI/other providers.

**Base URL:** `https://api.forge.ai/v1`

---

## Authentication

All API requests require authentication via API key in the `Authorization` header.

```
Authorization: Bearer sk-forge-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**API Key Format:** `sk-forge-{32_random_alphanumeric_chars}`

---

## Endpoints

### Chat Completions

#### `POST /v1/chat/completions`

Generate a chat completion. Primary endpoint for conversational AI.

**Request:**
```json
{
  "model": "forge-400b",
  "messages": [
    {"role": "system", "content": "You are a helpful coding assistant."},
    {"role": "user", "content": "Write a Python function to sort a list."}
  ],
  "temperature": 0.7,
  "max_tokens": 2048,
  "top_p": 1.0,
  "frequency_penalty": 0.0,
  "presence_penalty": 0.0,
  "stream": false,
  "stop": ["\n\n"],
  "user": "user-123"
}
```

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| model | string | Yes | - | Model ID to use |
| messages | array | Yes | - | Array of message objects |
| temperature | float | No | 0.7 | Sampling temperature (0-2) |
| max_tokens | int | No | 4096 | Maximum tokens to generate |
| top_p | float | No | 1.0 | Nucleus sampling parameter |
| frequency_penalty | float | No | 0.0 | Frequency penalty (-2 to 2) |
| presence_penalty | float | No | 0.0 | Presence penalty (-2 to 2) |
| stream | bool | No | false | Enable SSE streaming |
| stop | string/array | No | null | Stop sequences |
| user | string | No | null | End-user identifier |
| n | int | No | 1 | Number of completions |

**Message Object:**
```json
{
  "role": "system" | "user" | "assistant",
  "content": "string"
}
```

**Response (non-streaming):**
```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1709654321,
  "model": "forge-400b",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Here's a Python function to sort a list:\n\n```python\ndef sort_list(lst):\n    return sorted(lst)\n```"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 25,
    "completion_tokens": 42,
    "total_tokens": 67
  }
}
```

**Response (streaming):**

When `stream: true`, response is Server-Sent Events (SSE):

```
data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1709654321,"model":"forge-400b","choices":[{"index":0,"delta":{"role":"assistant"},"finish_reason":null}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1709654321,"model":"forge-400b","choices":[{"index":0,"delta":{"content":"Here's"},"finish_reason":null}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1709654321,"model":"forge-400b","choices":[{"index":0,"delta":{"content":" a"},"finish_reason":null}]}

...

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1709654321,"model":"forge-400b","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]
```

---

### Completions (Legacy)

#### `POST /v1/completions`

Generate a text completion. Legacy endpoint for non-chat use cases.

**Request:**
```json
{
  "model": "forge-400b",
  "prompt": "def fibonacci(n):",
  "max_tokens": 256,
  "temperature": 0.7,
  "top_p": 1.0,
  "stream": false,
  "stop": ["\n\n"]
}
```

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| model | string | Yes | - | Model ID to use |
| prompt | string/array | Yes | - | Prompt text or array |
| max_tokens | int | No | 4096 | Maximum tokens to generate |
| temperature | float | No | 0.7 | Sampling temperature |
| top_p | float | No | 1.0 | Nucleus sampling |
| stream | bool | No | false | Enable SSE streaming |
| stop | string/array | No | null | Stop sequences |
| suffix | string | No | null | Text after completion |
| echo | bool | No | false | Echo prompt in response |

**Response:**
```json
{
  "id": "cmpl-abc123",
  "object": "text_completion",
  "created": 1709654321,
  "model": "forge-400b",
  "choices": [
    {
      "text": "\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)",
      "index": 0,
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 5,
    "completion_tokens": 32,
    "total_tokens": 37
  }
}
```

---

### Models

#### `GET /v1/models`

List available models.

**Response:**
```json
{
  "object": "list",
  "data": [
    {
      "id": "forge-400b",
      "object": "model",
      "created": 1709654321,
      "owned_by": "forge",
      "permission": [],
      "root": "forge-400b",
      "parent": null
    }
  ]
}
```

#### `GET /v1/models/{model_id}`

Get model details.

**Response:**
```json
{
  "id": "forge-400b",
  "object": "model",
  "created": 1709654321,
  "owned_by": "forge",
  "permission": [],
  "root": "forge-400b",
  "parent": null,
  "context_length": 32768,
  "pricing": {
    "prompt": 0.003,
    "completion": 0.006
  }
}
```

---

### Usage

#### `GET /v1/usage`

Get usage statistics for the authenticated user.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| start_date | string | No | 30 days ago | Start date (ISO 8601) |
| end_date | string | No | now | End date (ISO 8601) |
| granularity | string | No | day | `day`, `hour`, `total` |

**Response:**
```json
{
  "object": "usage",
  "data": [
    {
      "date": "2024-03-05",
      "prompt_tokens": 125000,
      "completion_tokens": 87500,
      "total_tokens": 212500,
      "requests": 450,
      "cost": 0.85
    },
    {
      "date": "2024-03-04",
      "prompt_tokens": 98000,
      "completion_tokens": 72000,
      "total_tokens": 170000,
      "requests": 380,
      "cost": 0.68
    }
  ],
  "total": {
    "prompt_tokens": 223000,
    "completion_tokens": 159500,
    "total_tokens": 382500,
    "requests": 830,
    "cost": 1.53
  }
}
```

---

### API Keys

#### `GET /v1/api-keys`

List all API keys for the authenticated user.

**Response:**
```json
{
  "object": "list",
  "data": [
    {
      "id": "key_abc123",
      "object": "api_key",
      "name": "Production Key",
      "prefix": "sk-forge-abc",
      "created_at": "2024-03-01T12:00:00Z",
      "last_used_at": "2024-03-05T15:30:00Z",
      "expires_at": null,
      "is_active": true
    },
    {
      "id": "key_def456",
      "object": "api_key",
      "name": "Development Key",
      "prefix": "sk-forge-def",
      "created_at": "2024-02-15T09:00:00Z",
      "last_used_at": "2024-03-04T10:15:00Z",
      "expires_at": "2024-06-15T09:00:00Z",
      "is_active": true
    }
  ]
}
```

#### `POST /v1/api-keys`

Create a new API key.

**Request:**
```json
{
  "name": "My New Key",
  "expires_in_days": 90
}
```

**Response:**
```json
{
  "id": "key_ghi789",
  "object": "api_key",
  "name": "My New Key",
  "key": "sk-forge-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "prefix": "sk-forge-xxx",
  "created_at": "2024-03-05T16:00:00Z",
  "expires_at": "2024-06-03T16:00:00Z",
  "is_active": true,
  "warning": "Store this key securely. It will not be shown again."
}
```

**Note:** The full `key` is only returned once at creation. Store it securely.

#### `DELETE /v1/api-keys/{key_id}`

Revoke an API key.

**Response:**
```json
{
  "id": "key_ghi789",
  "object": "api_key",
  "deleted": true
}
```

---

## Authentication Endpoints

These endpoints use JWT authentication (not API keys).

### Register

#### `POST /auth/register`

Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "id": "user_abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2024-03-05T16:00:00Z",
  "message": "Verification email sent."
}
```

### Login

#### `POST /auth/login`

Authenticate and receive JWT tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 900
}
```

### Refresh Token

#### `POST /auth/refresh`

Refresh an expired access token.

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 900
}
```

### Get Current User

#### `GET /auth/me`

Get the authenticated user's profile.

**Response:**
```json
{
  "id": "user_abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2024-03-05T16:00:00Z",
  "email_verified": true,
  "subscription": {
    "plan": "pro",
    "status": "active",
    "current_period_end": "2024-04-05T16:00:00Z"
  }
}
```

---

## Billing Endpoints

### Get Billing Portal

#### `GET /billing/portal`

Get a Stripe customer portal URL.

**Response:**
```json
{
  "url": "https://billing.stripe.com/session/...",
  "expires_at": "2024-03-05T17:00:00Z"
}
```

### Get Subscription

#### `GET /billing/subscription`

Get current subscription details.

**Response:**
```json
{
  "id": "sub_abc123",
  "plan": "pro",
  "status": "active",
  "current_period_start": "2024-03-05T00:00:00Z",
  "current_period_end": "2024-04-05T00:00:00Z",
  "cancel_at_period_end": false,
  "usage": {
    "tokens_used": 382500,
    "tokens_limit": 2000000,
    "percentage": 19.1
  }
}
```

### Webhook (Internal)

#### `POST /billing/webhook`

Stripe webhook endpoint. Not for public use.

---

## Error Handling

All errors follow a consistent format:

```json
{
  "error": {
    "message": "Human-readable error message",
    "type": "error_type",
    "code": "error_code",
    "param": "parameter_name"
  }
}
```

### Error Types

| Type | Description |
|------|-------------|
| `invalid_request_error` | Invalid request parameters |
| `authentication_error` | Invalid or missing API key |
| `permission_error` | Insufficient permissions |
| `rate_limit_error` | Rate limit exceeded |
| `server_error` | Internal server error |
| `model_error` | Model inference error |

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

### Common Errors

**Invalid API Key (401):**
```json
{
  "error": {
    "message": "Invalid API key provided.",
    "type": "authentication_error",
    "code": "invalid_api_key"
  }
}
```

**Rate Limit Exceeded (429):**
```json
{
  "error": {
    "message": "Rate limit exceeded. Please retry after 60 seconds.",
    "type": "rate_limit_error",
    "code": "rate_limit_exceeded"
  }
}
```

**Headers on 429:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1709654400
Retry-After: 60
```

**Invalid Request (400):**
```json
{
  "error": {
    "message": "Invalid value for 'temperature': must be between 0 and 2.",
    "type": "invalid_request_error",
    "code": "invalid_parameter",
    "param": "temperature"
  }
}
```

**Model Overloaded (503):**
```json
{
  "error": {
    "message": "The model is currently overloaded. Please retry.",
    "type": "server_error",
    "code": "model_overloaded"
  }
}
```

---

## Rate Limits

Rate limits are applied per API key.

| Plan | Requests/min | Tokens/min | Tokens/day |
|------|--------------|------------|------------|
| Free | 10 | 10,000 | 100,000 |
| Starter | 30 | 50,000 | 500,000 |
| Pro | 60 | 100,000 | 2,000,000 |
| Enterprise | 120 | 500,000 | 10,000,000 |

**Rate Limit Headers:**

Every response includes:
```
X-RateLimit-Limit-Requests: 60
X-RateLimit-Remaining-Requests: 55
X-RateLimit-Limit-Tokens: 100000
X-RateLimit-Remaining-Tokens: 95000
X-RateLimit-Reset: 1709654400
```

---

## Pricing

| Model | Input (per 1K tokens) | Output (per 1K tokens) |
|-------|----------------------|------------------------|
| forge-400b | $0.003 | $0.006 |

---

## SDKs

### Python

```python
from forge import ForgeClient

client = ForgeClient(api_key="sk-forge-xxx")

response = client.chat.completions.create(
    model="forge-400b",
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)

print(response.choices[0].message.content)
```

### JavaScript/TypeScript

```typescript
import Forge from 'forge-ai';

const client = new Forge({ apiKey: 'sk-forge-xxx' });

const response = await client.chat.completions.create({
  model: 'forge-400b',
  messages: [
    { role: 'user', content: 'Hello!' }
  ]
});

console.log(response.choices[0].message.content);
```

### cURL

```bash
curl https://api.forge.ai/v1/chat/completions \
  -H "Authorization: Bearer sk-forge-xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "forge-400b",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

---

## OpenAI Compatibility

FORGE is designed as a **drop-in replacement** for OpenAI's API.

**To migrate from OpenAI:**

1. Change base URL: `https://api.openai.com/v1` → `https://api.forge.ai/v1`
2. Replace API key: `sk-...` → `sk-forge-...`
3. Update model: `gpt-4` → `forge-400b`

**Python (OpenAI SDK):**
```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-forge-xxx",
    base_url="https://api.forge.ai/v1"
)

response = client.chat.completions.create(
    model="forge-400b",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

**JavaScript (OpenAI SDK):**
```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'sk-forge-xxx',
  baseURL: 'https://api.forge.ai/v1'
});

const response = await client.chat.completions.create({
  model: 'forge-400b',
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

---

## Versioning

API version is specified in the URL path: `/v1/...`

Future versions will be `/v2/...`, etc.

Deprecation notices will be sent via email and API headers:
```
X-API-Deprecation-Warning: This endpoint will be deprecated on 2025-01-01
```
