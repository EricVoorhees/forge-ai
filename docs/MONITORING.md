# FORGE V1 — Monitoring & Observability

## Overview

Comprehensive monitoring for API performance, GPU utilization, and business metrics.

---

## Stack

| Component | Tool | Purpose |
|-----------|------|---------|
| Metrics | Prometheus | Time-series metrics collection |
| Visualization | Grafana | Dashboards and alerting |
| Logging | Structured JSON | Application logs |
| Tracing | OpenTelemetry (V2) | Distributed tracing |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MONITORING STACK                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                   │
│   │  API Server  │   │  GPU Node    │   │   Redis      │                   │
│   │  /metrics    │   │  /metrics    │   │  /metrics    │                   │
│   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘                   │
│          │                  │                  │                            │
│          └──────────────────┼──────────────────┘                            │
│                             │                                                │
│                             ▼                                                │
│                    ┌──────────────────┐                                     │
│                    │    Prometheus    │                                     │
│                    │   (scraper)      │                                     │
│                    └────────┬─────────┘                                     │
│                             │                                                │
│                             ▼                                                │
│                    ┌──────────────────┐                                     │
│                    │     Grafana      │                                     │
│                    │  (dashboards)    │                                     │
│                    └────────┬─────────┘                                     │
│                             │                                                │
│                             ▼                                                │
│                    ┌──────────────────┐                                     │
│                    │   Alertmanager   │                                     │
│                    │    (alerts)      │                                     │
│                    └──────────────────┘                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Metrics

### API Server Metrics

```python
# api/services/metrics.py

from prometheus_client import Counter, Histogram, Gauge, Info
import time

# Request metrics
http_requests_total = Counter(
    'forge_http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

http_request_duration_seconds = Histogram(
    'forge_http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint'],
    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
)

# Inference metrics
inference_requests_total = Counter(
    'forge_inference_requests_total',
    'Total inference requests',
    ['model', 'status']
)

inference_duration_seconds = Histogram(
    'forge_inference_duration_seconds',
    'Inference request duration',
    ['model'],
    buckets=[0.5, 1.0, 2.0, 5.0, 10.0, 30.0, 60.0, 120.0, 300.0]
)

tokens_processed_total = Counter(
    'forge_tokens_processed_total',
    'Total tokens processed',
    ['model', 'type']  # type: prompt, completion
)

# Rate limiting metrics
rate_limit_hits_total = Counter(
    'forge_rate_limit_hits_total',
    'Total rate limit hits',
    ['limit_type', 'plan']
)

# Active connections
active_requests = Gauge(
    'forge_active_requests',
    'Currently active requests'
)

active_streams = Gauge(
    'forge_active_streams',
    'Currently active streaming connections'
)

# Business metrics
api_keys_total = Gauge(
    'forge_api_keys_total',
    'Total API keys',
    ['status']  # active, revoked
)

users_total = Gauge(
    'forge_users_total',
    'Total users',
    ['plan']
)

# System info
app_info = Info(
    'forge_app',
    'Application information'
)
app_info.info({'version': '1.0.0', 'environment': 'production'})
```

### FastAPI Middleware

```python
# api/middleware/metrics.py

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import time
from ..services.metrics import (
    http_requests_total,
    http_request_duration_seconds,
    active_requests
)


class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip metrics endpoint
        if request.url.path == "/metrics":
            return await call_next(request)
        
        method = request.method
        endpoint = self._get_endpoint(request.url.path)
        
        active_requests.inc()
        start_time = time.time()
        
        try:
            response = await call_next(request)
            status = str(response.status_code)
        except Exception as e:
            status = "500"
            raise
        finally:
            duration = time.time() - start_time
            active_requests.dec()
            
            http_requests_total.labels(
                method=method,
                endpoint=endpoint,
                status=status
            ).inc()
            
            http_request_duration_seconds.labels(
                method=method,
                endpoint=endpoint
            ).observe(duration)
        
        return response
    
    def _get_endpoint(self, path: str) -> str:
        # Normalize paths with IDs
        parts = path.split('/')
        normalized = []
        for part in parts:
            if self._is_uuid(part):
                normalized.append('{id}')
            else:
                normalized.append(part)
        return '/'.join(normalized)
    
    def _is_uuid(self, s: str) -> bool:
        import re
        return bool(re.match(
            r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
            s.lower()
        ))
```

### Metrics Endpoint

```python
# api/routes/metrics.py

from fastapi import APIRouter
from fastapi.responses import PlainTextResponse
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

router = APIRouter()


@router.get("/metrics")
async def metrics():
    return PlainTextResponse(
        generate_latest(),
        media_type=CONTENT_TYPE_LATEST
    )
```

---

## GPU Metrics (vLLM)

vLLM exposes Prometheus metrics at `/metrics`:

| Metric | Description |
|--------|-------------|
| `vllm:num_requests_running` | Currently running requests |
| `vllm:num_requests_waiting` | Requests waiting in queue |
| `vllm:gpu_cache_usage_perc` | GPU KV cache utilization |
| `vllm:num_preemptions_total` | Total request preemptions |
| `vllm:prompt_tokens_total` | Total prompt tokens processed |
| `vllm:generation_tokens_total` | Total tokens generated |
| `vllm:time_to_first_token_seconds` | Time to first token |
| `vllm:time_per_output_token_seconds` | Time per output token |
| `vllm:e2e_request_latency_seconds` | End-to-end latency |

---

## Prometheus Configuration

```yaml
# monitoring/prometheus.yml

global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

rule_files:
  - "alerts/*.yml"

scrape_configs:
  # API Server
  - job_name: 'forge-api'
    static_configs:
      - targets: ['api.forge.ai:443']
    scheme: https
    metrics_path: /metrics
    
  # GPU Node (internal)
  - job_name: 'forge-inference'
    static_configs:
      - targets: ['gpu-node:8000']
    metrics_path: /metrics
    
  # Redis
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

---

## Alert Rules

```yaml
# monitoring/alerts/api.yml

groups:
  - name: api_alerts
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: |
          sum(rate(forge_http_requests_total{status=~"5.."}[5m]))
          /
          sum(rate(forge_http_requests_total[5m]))
          > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"
      
      # High latency
      - alert: HighLatency
        expr: |
          histogram_quantile(0.95, 
            sum(rate(forge_http_request_duration_seconds_bucket[5m])) by (le)
          ) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High API latency"
          description: "P95 latency is {{ $value }}s"
      
      # Rate limit hits
      - alert: HighRateLimitHits
        expr: rate(forge_rate_limit_hits_total[5m]) > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High rate limit hit rate"
          description: "{{ $value }} rate limit hits per second"

  - name: inference_alerts
    rules:
      # Inference queue depth
      - alert: HighQueueDepth
        expr: vllm:num_requests_waiting > 50
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High inference queue depth"
          description: "{{ $value }} requests waiting"
      
      # GPU memory
      - alert: HighGPUCacheUsage
        expr: vllm:gpu_cache_usage_perc > 0.95
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High GPU cache usage"
          description: "GPU cache at {{ $value | humanizePercentage }}"
      
      # Inference latency
      - alert: HighInferenceLatency
        expr: |
          histogram_quantile(0.95,
            sum(rate(vllm:e2e_request_latency_seconds_bucket[5m])) by (le)
          ) > 30
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High inference latency"
          description: "P95 inference latency is {{ $value }}s"

  - name: business_alerts
    rules:
      # No requests
      - alert: NoTraffic
        expr: sum(rate(forge_http_requests_total[5m])) == 0
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: "No API traffic"
          description: "No requests received in 15 minutes"
```

---

## Grafana Dashboards

### API Overview Dashboard

```json
{
  "title": "FORGE API Overview",
  "panels": [
    {
      "title": "Request Rate",
      "type": "graph",
      "targets": [
        {
          "expr": "sum(rate(forge_http_requests_total[5m])) by (status)",
          "legendFormat": "{{status}}"
        }
      ]
    },
    {
      "title": "Latency (P50, P95, P99)",
      "type": "graph",
      "targets": [
        {
          "expr": "histogram_quantile(0.50, sum(rate(forge_http_request_duration_seconds_bucket[5m])) by (le))",
          "legendFormat": "P50"
        },
        {
          "expr": "histogram_quantile(0.95, sum(rate(forge_http_request_duration_seconds_bucket[5m])) by (le))",
          "legendFormat": "P95"
        },
        {
          "expr": "histogram_quantile(0.99, sum(rate(forge_http_request_duration_seconds_bucket[5m])) by (le))",
          "legendFormat": "P99"
        }
      ]
    },
    {
      "title": "Active Requests",
      "type": "gauge",
      "targets": [
        {
          "expr": "forge_active_requests"
        }
      ]
    },
    {
      "title": "Error Rate",
      "type": "stat",
      "targets": [
        {
          "expr": "sum(rate(forge_http_requests_total{status=~\"5..\"}[5m])) / sum(rate(forge_http_requests_total[5m])) * 100"
        }
      ],
      "unit": "percent"
    }
  ]
}
```

### Inference Dashboard

```json
{
  "title": "FORGE Inference",
  "panels": [
    {
      "title": "Tokens/Second",
      "type": "graph",
      "targets": [
        {
          "expr": "sum(rate(forge_tokens_processed_total[5m])) by (type)",
          "legendFormat": "{{type}}"
        }
      ]
    },
    {
      "title": "GPU Cache Usage",
      "type": "gauge",
      "targets": [
        {
          "expr": "vllm:gpu_cache_usage_perc * 100"
        }
      ],
      "unit": "percent",
      "thresholds": [80, 95]
    },
    {
      "title": "Queue Depth",
      "type": "graph",
      "targets": [
        {
          "expr": "vllm:num_requests_running",
          "legendFormat": "Running"
        },
        {
          "expr": "vllm:num_requests_waiting",
          "legendFormat": "Waiting"
        }
      ]
    },
    {
      "title": "Time to First Token",
      "type": "graph",
      "targets": [
        {
          "expr": "histogram_quantile(0.95, sum(rate(vllm:time_to_first_token_seconds_bucket[5m])) by (le))",
          "legendFormat": "P95"
        }
      ]
    }
  ]
}
```

### Business Dashboard

```json
{
  "title": "FORGE Business Metrics",
  "panels": [
    {
      "title": "Total Users",
      "type": "stat",
      "targets": [
        {
          "expr": "sum(forge_users_total)"
        }
      ]
    },
    {
      "title": "Users by Plan",
      "type": "piechart",
      "targets": [
        {
          "expr": "forge_users_total",
          "legendFormat": "{{plan}}"
        }
      ]
    },
    {
      "title": "Daily Token Usage",
      "type": "graph",
      "targets": [
        {
          "expr": "sum(increase(forge_tokens_processed_total[24h]))"
        }
      ]
    },
    {
      "title": "API Keys",
      "type": "stat",
      "targets": [
        {
          "expr": "sum(forge_api_keys_total{status=\"active\"})"
        }
      ]
    }
  ]
}
```

---

## Logging

### Structured Logging

```python
# api/services/logging.py

import logging
import json
import sys
from datetime import datetime


class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        
        # Add extra fields
        if hasattr(record, 'request_id'):
            log_data['request_id'] = record.request_id
        if hasattr(record, 'user_id'):
            log_data['user_id'] = record.user_id
        if hasattr(record, 'api_key_prefix'):
            log_data['api_key_prefix'] = record.api_key_prefix
        
        # Add exception info
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        
        return json.dumps(log_data)


def setup_logging():
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())
    
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.addHandler(handler)
    
    # Reduce noise from libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)


# Request logging middleware
class RequestLoggingMiddleware:
    def __init__(self, app):
        self.app = app
        self.logger = logging.getLogger("api.requests")
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        import time
        import uuid
        
        request_id = str(uuid.uuid4())[:8]
        start_time = time.time()
        
        # Add request_id to scope
        scope["request_id"] = request_id
        
        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                duration = time.time() - start_time
                self.logger.info(
                    f"{scope['method']} {scope['path']} {message['status']}",
                    extra={
                        "request_id": request_id,
                        "method": scope["method"],
                        "path": scope["path"],
                        "status": message["status"],
                        "duration_ms": int(duration * 1000)
                    }
                )
            await send(message)
        
        await self.app(scope, receive, send_wrapper)
```

---

## Health Checks

```python
# api/routes/health.py

from fastapi import APIRouter
from ..services.inference import inference_client
from ..db.database import engine
import redis
import os

router = APIRouter()


@router.get("/health")
async def health():
    """Basic health check."""
    return {"status": "healthy"}


@router.get("/health/ready")
async def readiness():
    """Readiness check - all dependencies available."""
    checks = {}
    
    # Database
    try:
        async with engine.connect() as conn:
            await conn.execute("SELECT 1")
        checks["database"] = "healthy"
    except Exception as e:
        checks["database"] = f"unhealthy: {str(e)}"
    
    # Redis
    try:
        r = redis.Redis.from_url(os.getenv("REDIS_URL"))
        r.ping()
        checks["redis"] = "healthy"
    except Exception as e:
        checks["redis"] = f"unhealthy: {str(e)}"
    
    # Inference
    try:
        if await inference_client.health_check():
            checks["inference"] = "healthy"
        else:
            checks["inference"] = "unhealthy"
    except Exception as e:
        checks["inference"] = f"unhealthy: {str(e)}"
    
    all_healthy = all(v == "healthy" for v in checks.values())
    
    return {
        "status": "ready" if all_healthy else "not_ready",
        "checks": checks
    }


@router.get("/health/live")
async def liveness():
    """Liveness check - application is running."""
    return {"status": "alive"}
```

---

## Alertmanager Configuration

```yaml
# monitoring/alertmanager.yml

global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'severity']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'default'
  routes:
    - match:
        severity: critical
      receiver: 'critical'
    - match:
        severity: warning
      receiver: 'warning'

receivers:
  - name: 'default'
    webhook_configs:
      - url: 'http://localhost:5001/'
  
  - name: 'critical'
    slack_configs:
      - api_url: '${SLACK_WEBHOOK_URL}'
        channel: '#alerts-critical'
        title: '🚨 Critical Alert'
        text: '{{ .CommonAnnotations.description }}'
    pagerduty_configs:
      - service_key: '${PAGERDUTY_KEY}'
  
  - name: 'warning'
    slack_configs:
      - api_url: '${SLACK_WEBHOOK_URL}'
        channel: '#alerts'
        title: '⚠️ Warning'
        text: '{{ .CommonAnnotations.description }}'
```

---

## Grafana Cloud Setup (Free Tier)

1. Create account at grafana.com
2. Get Prometheus remote write URL
3. Configure API server to push metrics:

```python
# api/services/metrics_push.py

import requests
import time
from prometheus_client import generate_latest
import os

GRAFANA_PUSH_URL = os.getenv("GRAFANA_PUSH_URL")
GRAFANA_USER = os.getenv("GRAFANA_USER")
GRAFANA_API_KEY = os.getenv("GRAFANA_API_KEY")


def push_metrics():
    """Push metrics to Grafana Cloud."""
    if not GRAFANA_PUSH_URL:
        return
    
    metrics = generate_latest()
    
    response = requests.post(
        GRAFANA_PUSH_URL,
        data=metrics,
        auth=(GRAFANA_USER, GRAFANA_API_KEY),
        headers={"Content-Type": "text/plain"}
    )
    response.raise_for_status()
```

---

## Key Metrics to Monitor

### SLIs (Service Level Indicators)

| SLI | Target | Measurement |
|-----|--------|-------------|
| Availability | 99.9% | Successful requests / Total requests |
| Latency (API) | P95 < 500ms | `forge_http_request_duration_seconds` |
| Latency (Inference) | P95 < 30s | `forge_inference_duration_seconds` |
| Error Rate | < 0.1% | 5xx responses / Total responses |

### Business Metrics

| Metric | Description |
|--------|-------------|
| Daily Active Users | Unique users making requests |
| Tokens Processed | Total tokens per day |
| Revenue | MRR, ARPU |
| Conversion Rate | Free → Paid |

### Infrastructure Metrics

| Metric | Description |
|--------|-------------|
| GPU Utilization | % GPU compute used |
| GPU Memory | % VRAM used |
| Queue Depth | Pending inference requests |
| API Response Time | End-to-end latency |
