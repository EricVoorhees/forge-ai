# FORGE RunPod Deployment Guide

## Option 1: RunPod Serverless (Recommended)

### Step 1: Create Serverless Endpoint
1. Go to [RunPod Console](https://runpod.io/console/serverless)
2. Click **New Endpoint**
3. Select **vLLM** template
4. Configure:
   - **GPU Type**: NVIDIA H100 80GB (or A100 for smaller models)
   - **GPU Count**: 4 (for DeepSeek V2) or 1 (for smaller models)
   - **Max Workers**: 1-2
   - **Idle Timeout**: 60 seconds

### Step 2: Set Environment Variables
```
MODEL=deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct
TENSOR_PARALLEL_SIZE=4
MAX_MODEL_LEN=32768
```

### Step 3: Get Endpoint URL
Your endpoint URL will be:
```
https://api.runpod.ai/v2/YOUR_ENDPOINT_ID/openai/v1
```

### Step 4: Update FORGE API
Set in Render environment variables:
```
INFERENCE_URL=https://api.runpod.ai/v2/YOUR_ENDPOINT_ID/openai/v1
```

---

## Option 2: GPU Pod (Always-On)

### Step 1: Deploy Pod
1. Go to [RunPod Pods](https://runpod.io/console/pods)
2. Click **Deploy**
3. Select:
   - **Template**: RunPod PyTorch 2.1
   - **GPU**: 4x NVIDIA H100 80GB
   - **Container Disk**: 50GB
   - **Volume**: 200GB (for model weights)

### Step 2: SSH and Start vLLM
```bash
# Install vLLM
pip install vllm

# Start server
python -m vllm.entrypoints.openai.api_server \
  --model deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct \
  --tensor-parallel-size 4 \
  --max-model-len 32768 \
  --host 0.0.0.0 \
  --port 8000 \
  --trust-remote-code
```

### Step 3: Get Pod URL
Your pod URL will be:
```
https://YOUR_POD_ID-8000.proxy.runpod.net
```

---

## Model Options

| Model | GPUs Required | VRAM | Notes |
|-------|--------------|------|-------|
| DeepSeek-Coder-V2-Lite-Instruct | 1x H100 | 80GB | Good for coding |
| DeepSeek-Coder-V2-Instruct | 4x H100 | 320GB | Best for coding |
| Qwen2.5-72B-Instruct | 2x H100 | 160GB | General purpose |
| Llama-3.1-70B-Instruct | 2x H100 | 160GB | General purpose |

---

## Cost Estimates

| Configuration | Hourly Cost | Monthly (24/7) |
|--------------|-------------|----------------|
| 1x H100 Serverless | ~$2.50/hr active | Pay per use |
| 4x H100 Serverless | ~$10/hr active | Pay per use |
| 4x H100 Pod | ~$12/hr | ~$8,640/mo |

**Recommendation**: Start with Serverless for development, switch to Pod for production with consistent traffic.
