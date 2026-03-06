# FORGE Modal Deployment

## Overview

FORGE uses Modal.com for serverless GPU inference with automatic scaling.

**Model:** Qwen 2.5 72B Instruct AWQ (4-bit quantized)  
**GPU:** NVIDIA H100 (80GB)  
**Endpoint:** `https://voorheeseric69--forge-vllm-72b-serve.modal.run`

## Pricing

| Resource | Rate | Per Hour |
|----------|------|----------|
| H100 GPU | $0.001097/sec | **$3.95/hr** |
| Idle | $0 | Scales to zero |

### Monthly Cost Estimates

| Usage Pattern | Hours/Day | Monthly Cost |
|---------------|-----------|--------------|
| Light (hobby) | 1 hr | ~$120 |
| Medium (startup) | 8 hrs | ~$950 |
| Heavy (production) | 24/7 | ~$2,850 |

## Scaling Behavior

- **Scale to zero:** No cost when idle
- **Cold start:** ~5-10 min (first request after idle)
- **Warm window:** 5 minutes (keeps GPU warm after last request)
- **Auto-scale up:** Spawns new replicas when concurrent requests > 16

## Configuration

Edit `forge_vllm.py` to adjust:

```python
SCALEDOWN_WINDOW_MINUTES = 5   # Increase to reduce cold starts (costs more)
MAX_CONCURRENT_REQUESTS = 16   # Requests per replica before scaling
GPU_TYPE = "H100"              # Options: H100, A100, L40S
```

## Deployment

```bash
# Install Modal CLI
pip install modal
modal token new

# Deploy
modal deploy deploy/modal/forge_vllm.py

# View logs
modal app logs forge-vllm-72b

# Stop (scale to zero immediately)
modal app stop forge-vllm-72b
```

## Usage

```python
import requests

response = requests.post(
    "https://voorheeseric69--forge-vllm-72b-serve.modal.run/v1/chat/completions",
    json={
        "model": "forge-coder",
        "messages": [{"role": "user", "content": "Write hello world in Python"}],
        "max_tokens": 200
    }
)
print(response.json())
```

## Dashboard

Monitor usage and costs: https://modal.com/apps/voorheeseric69/main/deployed/forge-vllm-72b
