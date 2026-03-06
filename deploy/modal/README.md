# FORGE Inference on Modal

Serverless GPU inference using Modal.com with vLLM.

## Setup

1. **Install Modal CLI:**
   ```bash
   pip install modal
   ```

2. **Authenticate:**
   ```bash
   modal token new
   ```

3. **Deploy:**
   ```bash
   cd deploy/modal
   modal deploy forge_inference.py
   ```

## Endpoints

After deployment, Modal provides URLs like:
- `https://<your-workspace>--forge-inference-chat-completions.modal.run`
- `https://<your-workspace>--forge-inference-health.modal.run`

## Usage

```python
import requests

response = requests.post(
    "https://YOUR_WORKSPACE--forge-inference-chat-completions.modal.run",
    json={
        "messages": [{"role": "user", "content": "Write hello world in Python"}],
        "max_tokens": 200,
        "temperature": 0.7
    }
)
print(response.json())
```

## Configuration

Edit `forge_inference.py` to change:
- `MODEL_NAME` - HuggingFace model ID
- `GPU_TYPE` - "H100", "A100", "A10G", etc.
- `MAX_MODEL_LEN` - Context length
- `container_idle_timeout` - How long to keep warm (seconds)

## Costs

Modal charges per GPU-second:
- H100: ~$0.001/sec
- A100: ~$0.0006/sec

Containers scale to zero when idle = $0 when not in use.

## Local Testing

```bash
modal run forge_inference.py
```
