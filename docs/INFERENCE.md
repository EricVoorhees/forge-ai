# FORGE V1 — Inference Node Specification

## Overview

The inference layer runs the 400B Sparse MoE model using vLLM on GPU hardware.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           INFERENCE NODE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                         Docker Container                              │  │
│   │  ┌────────────────────────────────────────────────────────────────┐  │  │
│   │  │                      vLLM Server                                │  │  │
│   │  │                                                                 │  │  │
│   │  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │  │  │
│   │  │   │   Tokenizer │  │  Scheduler  │  │   KV Cache Manager  │   │  │  │
│   │  │   └─────────────┘  └─────────────┘  └─────────────────────┘   │  │  │
│   │  │                                                                 │  │  │
│   │  │   ┌─────────────────────────────────────────────────────────┐  │  │  │
│   │  │   │              Sparse MoE Model (400B)                     │  │  │  │
│   │  │   │                                                          │  │  │  │
│   │  │   │   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │  │  │  │
│   │  │   │   │ E1  │ │ E2  │ │ E3  │ │ E4  │ │ ... │ │ E64 │      │  │  │  │
│   │  │   │   └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘      │  │  │  │
│   │  │   │              (Only 8 experts active per token)          │  │  │  │
│   │  │   └─────────────────────────────────────────────────────────┘  │  │  │
│   │  │                                                                 │  │  │
│   │  └────────────────────────────────────────────────────────────────┘  │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                         GPU Cluster (8x H100)                         │  │
│   │   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│   │   │ GPU0 │ │ GPU1 │ │ GPU2 │ │ GPU3 │ │ GPU4 │ │ GPU5 │ │ GPU6 │ │ GPU7 │  │
│   │   │ 80GB │ │ 80GB │ │ 80GB │ │ 80GB │ │ 80GB │ │ 80GB │ │ 80GB │ │ 80GB │  │
│   │   └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘  │
│   │                     Tensor Parallelism = 8                            │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Hardware Requirements

### Minimum Spec (V1)

| Component | Specification |
|-----------|---------------|
| GPUs | 8x NVIDIA H100 80GB |
| GPU Memory | 640GB total |
| System RAM | 256GB+ |
| Storage | 2TB NVMe SSD |
| Network | 100Gbps+ (for multi-node) |

### GPU Memory Breakdown

| Component | Memory |
|-----------|--------|
| Model Weights (FP16) | ~400GB |
| KV Cache | ~150GB |
| Activations | ~50GB |
| Overhead | ~40GB |
| **Total** | **~640GB** |

---

## Model Configuration

### Qwen 3.5 400B Sparse MoE

| Parameter | Value |
|-----------|-------|
| Total Parameters | 400B |
| Active Parameters | ~50B per token |
| Architecture | Sparse MoE |
| Experts | 64 total, 8 active |
| Context Length | 32,768 tokens |
| Vocabulary | 152,064 tokens |
| Hidden Size | 8,192 |
| Layers | 64 |
| Attention Heads | 64 |

### Model Files

```
/models/qwen-400b/
├── config.json
├── tokenizer.json
├── tokenizer_config.json
├── special_tokens_map.json
├── model-00001-of-00080.safetensors
├── model-00002-of-00080.safetensors
├── ...
├── model-00080-of-00080.safetensors
└── model.safetensors.index.json
```

---

## vLLM Configuration

### Launch Command

```bash
python -m vllm.entrypoints.openai.api_server \
    --model /models/qwen-400b \
    --served-model-name forge-400b \
    --tensor-parallel-size 8 \
    --gpu-memory-utilization 0.95 \
    --max-model-len 32768 \
    --max-num-seqs 256 \
    --max-num-batched-tokens 65536 \
    --trust-remote-code \
    --dtype bfloat16 \
    --host 0.0.0.0 \
    --port 8000 \
    --disable-log-requests
```

### Configuration Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| `--model` | /models/qwen-400b | Model path |
| `--served-model-name` | forge-400b | API model name (hides original) |
| `--tensor-parallel-size` | 8 | Split across 8 GPUs |
| `--gpu-memory-utilization` | 0.95 | Use 95% of GPU memory |
| `--max-model-len` | 32768 | Maximum context length |
| `--max-num-seqs` | 256 | Max concurrent sequences |
| `--max-num-batched-tokens` | 65536 | Max tokens per batch |
| `--dtype` | bfloat16 | Use BF16 precision |
| `--trust-remote-code` | - | Allow custom model code |
| `--disable-log-requests` | - | Reduce logging overhead |

### Advanced Configuration

```yaml
# inference/config.yaml

model:
  path: /models/qwen-400b
  served_name: forge-400b
  dtype: bfloat16
  trust_remote_code: true

parallelism:
  tensor_parallel_size: 8
  pipeline_parallel_size: 1

memory:
  gpu_memory_utilization: 0.95
  swap_space: 4  # GB

limits:
  max_model_len: 32768
  max_num_seqs: 256
  max_num_batched_tokens: 65536

server:
  host: 0.0.0.0
  port: 8000
  
scheduling:
  scheduler_delay_factor: 0.0
  enable_chunked_prefill: true
  
logging:
  disable_log_requests: true
  disable_log_stats: false
```

---

## Docker Configuration

### Dockerfile

```dockerfile
# inference/Dockerfile

FROM nvidia/cuda:12.1-devel-ubuntu22.04

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3.11 \
    python3-pip \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Set Python 3.11 as default
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3.11 1

# Install PyTorch and vLLM
RUN pip install --no-cache-dir \
    torch==2.2.0 \
    vllm==0.4.0 \
    transformers==4.38.0 \
    accelerate==0.27.0 \
    sentencepiece \
    tiktoken

# Create model directory
RUN mkdir -p /models

# Copy configuration
COPY config.yaml /app/config.yaml
COPY run_vllm.sh /app/run_vllm.sh
RUN chmod +x /app/run_vllm.sh

WORKDIR /app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=300s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run vLLM server
CMD ["/app/run_vllm.sh"]
```

### Run Script

```bash
#!/bin/bash
# inference/run_vllm.sh

set -e

echo "Starting vLLM server..."
echo "Model: ${MODEL_PATH:-/models/qwen-400b}"
echo "Tensor Parallel Size: ${TENSOR_PARALLEL_SIZE:-8}"

python -m vllm.entrypoints.openai.api_server \
    --model "${MODEL_PATH:-/models/qwen-400b}" \
    --served-model-name "${MODEL_NAME:-forge-400b}" \
    --tensor-parallel-size "${TENSOR_PARALLEL_SIZE:-8}" \
    --gpu-memory-utilization "${GPU_MEMORY_UTIL:-0.95}" \
    --max-model-len "${MAX_MODEL_LEN:-32768}" \
    --max-num-seqs "${MAX_NUM_SEQS:-256}" \
    --max-num-batched-tokens "${MAX_BATCHED_TOKENS:-65536}" \
    --dtype "${DTYPE:-bfloat16}" \
    --trust-remote-code \
    --host 0.0.0.0 \
    --port 8000 \
    --disable-log-requests
```

### Docker Compose (Development)

```yaml
# docker-compose.inference.yml

version: '3.8'

services:
  inference:
    build:
      context: ./inference
      dockerfile: Dockerfile
    runtime: nvidia
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
      - MODEL_PATH=/models/qwen-400b
      - MODEL_NAME=forge-400b
      - TENSOR_PARALLEL_SIZE=8
      - GPU_MEMORY_UTIL=0.95
      - MAX_MODEL_LEN=32768
    volumes:
      - /data/models:/models:ro
    ports:
      - "8000:8000"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 8
              capabilities: [gpu]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 300s
```

---

## API Server Integration

### Inference Client

```python
# api/services/inference.py

import httpx
import asyncio
from typing import AsyncIterator, Optional, List, Dict, Any
from dataclasses import dataclass
import json

INFERENCE_URL = "http://gpu-node:8000"
TIMEOUT = 300.0  # 5 minutes for long generations


@dataclass
class InferenceConfig:
    url: str = INFERENCE_URL
    timeout: float = TIMEOUT
    max_retries: int = 3
    retry_delay: float = 1.0


class InferenceClient:
    """Client for communicating with vLLM inference server."""
    
    def __init__(self, config: InferenceConfig = None):
        self.config = config or InferenceConfig()
        self.client = httpx.AsyncClient(
            base_url=self.config.url,
            timeout=httpx.Timeout(self.config.timeout)
        )
    
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = "forge-400b",
        temperature: float = 0.7,
        max_tokens: int = 4096,
        top_p: float = 1.0,
        frequency_penalty: float = 0.0,
        presence_penalty: float = 0.0,
        stop: Optional[List[str]] = None,
        stream: bool = False,
        **kwargs
    ) -> Dict[str, Any]:
        """Send a chat completion request to vLLM."""
        
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "top_p": top_p,
            "frequency_penalty": frequency_penalty,
            "presence_penalty": presence_penalty,
            "stream": stream
        }
        
        if stop:
            payload["stop"] = stop
        
        payload.update(kwargs)
        
        for attempt in range(self.config.max_retries):
            try:
                response = await self.client.post(
                    "/v1/chat/completions",
                    json=payload
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                if e.response.status_code >= 500 and attempt < self.config.max_retries - 1:
                    await asyncio.sleep(self.config.retry_delay * (attempt + 1))
                    continue
                raise
            except httpx.RequestError as e:
                if attempt < self.config.max_retries - 1:
                    await asyncio.sleep(self.config.retry_delay * (attempt + 1))
                    continue
                raise
    
    async def chat_completion_stream(
        self,
        messages: List[Dict[str, str]],
        model: str = "forge-400b",
        temperature: float = 0.7,
        max_tokens: int = 4096,
        **kwargs
    ) -> AsyncIterator[str]:
        """Stream a chat completion response."""
        
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True,
            **kwargs
        }
        
        async with self.client.stream(
            "POST",
            "/v1/chat/completions",
            json=payload
        ) as response:
            response.raise_for_status()
            
            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    data = line[6:]
                    if data == "[DONE]":
                        break
                    yield data
    
    async def completion(
        self,
        prompt: str,
        model: str = "forge-400b",
        max_tokens: int = 4096,
        temperature: float = 0.7,
        **kwargs
    ) -> Dict[str, Any]:
        """Send a completion request to vLLM."""
        
        payload = {
            "model": model,
            "prompt": prompt,
            "max_tokens": max_tokens,
            "temperature": temperature,
            **kwargs
        }
        
        response = await self.client.post(
            "/v1/completions",
            json=payload
        )
        response.raise_for_status()
        return response.json()
    
    async def health_check(self) -> bool:
        """Check if inference server is healthy."""
        try:
            response = await self.client.get("/health")
            return response.status_code == 200
        except:
            return False
    
    async def get_models(self) -> List[Dict[str, Any]]:
        """Get available models."""
        response = await self.client.get("/v1/models")
        response.raise_for_status()
        return response.json()["data"]
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()


# Global instance
inference_client = InferenceClient()
```

### Streaming Handler

```python
# api/routes/completions.py

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from typing import List, Optional
from pydantic import BaseModel
import json
import time
import uuid

from ..auth.api_key import validate_api_key, ApiKeyData
from ..services.inference import inference_client
from ..services.usage import record_usage
from ..services.rate_limiter import rate_limiter

router = APIRouter()


class Message(BaseModel):
    role: str
    content: str


class ChatCompletionRequest(BaseModel):
    model: str = "forge-400b"
    messages: List[Message]
    temperature: float = 0.7
    max_tokens: int = 4096
    top_p: float = 1.0
    frequency_penalty: float = 0.0
    presence_penalty: float = 0.0
    stream: bool = False
    stop: Optional[List[str]] = None
    user: Optional[str] = None


@router.post("/v1/chat/completions")
async def chat_completions(
    request: ChatCompletionRequest,
    api_key_data: ApiKeyData = Depends(validate_api_key)
):
    """Handle chat completion requests."""
    
    start_time = time.time()
    request_id = f"chatcmpl-{uuid.uuid4().hex[:24]}"
    
    messages = [{"role": m.role, "content": m.content} for m in request.messages]
    
    if request.stream:
        return StreamingResponse(
            stream_chat_completion(
                request_id=request_id,
                messages=messages,
                request=request,
                api_key_data=api_key_data,
                start_time=start_time
            ),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Request-ID": request_id
            }
        )
    
    # Non-streaming response
    try:
        response = await inference_client.chat_completion(
            messages=messages,
            model=request.model,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            top_p=request.top_p,
            frequency_penalty=request.frequency_penalty,
            presence_penalty=request.presence_penalty,
            stop=request.stop
        )
        
        # Record usage
        latency_ms = int((time.time() - start_time) * 1000)
        await record_usage(
            user_id=str(api_key_data.user.id),
            api_key_id=str(api_key_data.api_key.id),
            model=request.model,
            prompt_tokens=response["usage"]["prompt_tokens"],
            completion_tokens=response["usage"]["completion_tokens"],
            latency_ms=latency_ms
        )
        
        # Record daily token usage
        rate_limiter.record_tpd_usage(
            str(api_key_data.user.id),
            response["usage"]["total_tokens"]
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail={
                "error": {
                    "message": "Inference service unavailable",
                    "type": "server_error",
                    "code": "inference_error"
                }
            }
        )


async def stream_chat_completion(
    request_id: str,
    messages: List[dict],
    request: ChatCompletionRequest,
    api_key_data: ApiKeyData,
    start_time: float
):
    """Stream chat completion tokens."""
    
    prompt_tokens = 0
    completion_tokens = 0
    
    try:
        async for chunk_data in inference_client.chat_completion_stream(
            messages=messages,
            model=request.model,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            top_p=request.top_p,
            stop=request.stop
        ):
            chunk = json.loads(chunk_data)
            
            # Track token counts from chunks
            if "usage" in chunk:
                prompt_tokens = chunk["usage"].get("prompt_tokens", 0)
                completion_tokens = chunk["usage"].get("completion_tokens", 0)
            
            yield f"data: {chunk_data}\n\n"
        
        yield "data: [DONE]\n\n"
        
        # Record usage after stream completes
        latency_ms = int((time.time() - start_time) * 1000)
        await record_usage(
            user_id=str(api_key_data.user.id),
            api_key_id=str(api_key_data.api_key.id),
            model=request.model,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            latency_ms=latency_ms
        )
        
        rate_limiter.record_tpd_usage(
            str(api_key_data.user.id),
            prompt_tokens + completion_tokens
        )
        
    except Exception as e:
        error_chunk = {
            "error": {
                "message": str(e),
                "type": "server_error",
                "code": "stream_error"
            }
        }
        yield f"data: {json.dumps(error_chunk)}\n\n"
```

---

## Health Monitoring

### Health Endpoints

vLLM exposes these health endpoints:

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Basic health check |
| `GET /v1/models` | List loaded models |

### Prometheus Metrics

vLLM exposes metrics at `/metrics`:

```
# GPU metrics
vllm:gpu_cache_usage_perc
vllm:num_requests_running
vllm:num_requests_waiting

# Throughput metrics
vllm:num_preemptions_total
vllm:prompt_tokens_total
vllm:generation_tokens_total

# Latency metrics
vllm:time_to_first_token_seconds
vllm:time_per_output_token_seconds
vllm:e2e_request_latency_seconds
```

### Custom Metrics

```python
# api/services/metrics.py

from prometheus_client import Counter, Histogram, Gauge

# Inference metrics
inference_requests = Counter(
    'forge_inference_requests_total',
    'Total inference requests',
    ['model', 'status']
)

inference_latency = Histogram(
    'forge_inference_latency_seconds',
    'Inference latency in seconds',
    ['model'],
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0, 60.0, 120.0]
)

tokens_generated = Counter(
    'forge_tokens_generated_total',
    'Total tokens generated',
    ['model', 'type']
)

active_requests = Gauge(
    'forge_active_requests',
    'Currently active inference requests'
)
```

---

## Scaling Strategy

### V1: Single Node

```
┌─────────────────────────────────────┐
│         Single GPU Node             │
│         8x H100 80GB                │
│                                     │
│   ┌─────────────────────────────┐  │
│   │      vLLM Container         │  │
│   │   Tensor Parallel = 8       │  │
│   └─────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### V2: Multi-Node (Future)

```
┌─────────────────────────────────────┐
│           Load Balancer             │
└──────────────┬──────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
    ▼          ▼          ▼
┌───────┐  ┌───────┐  ┌───────┐
│ Node1 │  │ Node2 │  │ Node3 │
│ 8xH100│  │ 8xH100│  │ 8xH100│
└───────┘  └───────┘  └───────┘
```

### Request Routing

```python
# api/services/inference_router.py

import random
from typing import List

class InferenceRouter:
    """Route requests to available inference nodes."""
    
    def __init__(self, nodes: List[str]):
        self.nodes = nodes
        self.healthy_nodes = set(nodes)
    
    def get_node(self) -> str:
        """Get a healthy node using round-robin."""
        if not self.healthy_nodes:
            raise Exception("No healthy inference nodes")
        return random.choice(list(self.healthy_nodes))
    
    async def health_check_all(self):
        """Check health of all nodes."""
        for node in self.nodes:
            try:
                client = InferenceClient(InferenceConfig(url=node))
                if await client.health_check():
                    self.healthy_nodes.add(node)
                else:
                    self.healthy_nodes.discard(node)
            except:
                self.healthy_nodes.discard(node)
```

---

## RunPod Deployment

### Deploy Script

```bash
#!/bin/bash
# infra/runpod/deploy_gpu.sh

# RunPod API configuration
RUNPOD_API_KEY="${RUNPOD_API_KEY}"
GPU_TYPE="NVIDIA H100 80GB"
GPU_COUNT=8

# Create pod
curl -X POST "https://api.runpod.io/v2/pods" \
  -H "Authorization: Bearer ${RUNPOD_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "forge-inference",
    "imageName": "ghcr.io/forge/inference:latest",
    "gpuTypeId": "NVIDIA H100 80GB",
    "gpuCount": 8,
    "volumeInGb": 2000,
    "containerDiskInGb": 100,
    "minVcpuCount": 32,
    "minMemoryInGb": 256,
    "ports": "8000/http",
    "env": {
      "MODEL_PATH": "/models/qwen-400b",
      "TENSOR_PARALLEL_SIZE": "8"
    }
  }'
```

### Environment Variables

```bash
# RunPod environment
MODEL_PATH=/runpod-volume/models/qwen-400b
MODEL_NAME=forge-400b
TENSOR_PARALLEL_SIZE=8
GPU_MEMORY_UTIL=0.95
MAX_MODEL_LEN=32768
MAX_NUM_SEQS=256
```

---

## Model Download

### Download Script

```bash
#!/bin/bash
# scripts/download_model.sh

MODEL_ID="Qwen/Qwen2.5-400B-Instruct"  # Example
MODEL_DIR="/models/qwen-400b"

# Using huggingface-cli
pip install huggingface_hub

huggingface-cli download \
    --repo-type model \
    --local-dir "${MODEL_DIR}" \
    --local-dir-use-symlinks False \
    "${MODEL_ID}"

echo "Model downloaded to ${MODEL_DIR}"
```

### Model Verification

```python
# scripts/verify_model.py

from transformers import AutoConfig, AutoTokenizer

MODEL_PATH = "/models/qwen-400b"

# Load config
config = AutoConfig.from_pretrained(MODEL_PATH, trust_remote_code=True)
print(f"Model: {config.model_type}")
print(f"Hidden size: {config.hidden_size}")
print(f"Num layers: {config.num_hidden_layers}")
print(f"Num experts: {getattr(config, 'num_experts', 'N/A')}")

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, trust_remote_code=True)
print(f"Vocab size: {tokenizer.vocab_size}")

print("Model verification complete!")
```

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| OOM Error | Insufficient GPU memory | Reduce `max_num_seqs` or `max_model_len` |
| Slow startup | Large model loading | Use NVMe storage, pre-warm cache |
| High latency | Batching inefficiency | Tune `max_num_batched_tokens` |
| Connection refused | Server not ready | Increase health check `start_period` |

### Debug Commands

```bash
# Check GPU status
nvidia-smi

# Check vLLM logs
docker logs forge-inference

# Test inference endpoint
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "forge-400b", "messages": [{"role": "user", "content": "Hello"}]}'

# Check model loading
curl http://localhost:8000/v1/models
```
