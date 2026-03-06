"""
FORGE Inference Server on Modal
Qwen 2.5 72B AWQ on H100 GPU

Pricing (as of 2024):
- H100: $0.001097/sec = $3.95/hr
- Scales to zero when idle (no cost)
- Auto-scales up based on request volume

Deployment: modal deploy deploy/modal/forge_vllm.py
Dashboard: https://modal.com/apps/voorheeseric69/main/deployed/forge-vllm-72b
"""

import modal

# =============================================================================
# CONFIGURATION
# =============================================================================

# Model settings
MODEL_NAME = "Qwen/Qwen2.5-72B-Instruct-AWQ"  # 4-bit quantized, fits on H100
MODEL_REVISION = None  # Use latest
SERVED_MODEL_NAME = "forge-coder"  # API model name
MAX_MODEL_LEN = 16384  # Context window

# GPU settings
GPU_TYPE = "H100"  # H100 = $3.95/hr, A100-80GB = $2.50/hr
N_GPU = 1  # Single GPU for 72B AWQ

# Scaling settings
SCALEDOWN_WINDOW_MINUTES = 5  # Keep warm for 5 min after last request (cost vs latency tradeoff)
MAX_CONCURRENT_REQUESTS = 16  # Requests per replica before scaling up
STARTUP_TIMEOUT_MINUTES = 15  # Time allowed for cold start

# Performance settings
FAST_BOOT = True  # Disable CUDA graphs for faster cold starts
GPU_MEMORY_UTILIZATION = 0.90  # Use 90% of GPU memory for KV cache

# =============================================================================
# MODAL SETUP
# =============================================================================

MINUTES = 60
VLLM_PORT = 8000

vllm_image = (
    modal.Image.from_registry("nvidia/cuda:12.8.0-devel-ubuntu22.04", add_python="3.12")
    .entrypoint([])
    .pip_install(
        "vllm==0.13.0",
        "huggingface-hub==0.36.0",
    )
    .env({"HF_XET_HIGH_PERFORMANCE": "1"})  # Faster model transfers
)

# Persistent volumes for caching (reduces cold start time)
hf_cache_vol = modal.Volume.from_name("forge-hf-cache", create_if_missing=True)
vllm_cache_vol = modal.Volume.from_name("forge-vllm-cache", create_if_missing=True)

app = modal.App("forge-vllm-72b")


@app.function(
    image=vllm_image,
    gpu=f"{GPU_TYPE}:{N_GPU}",
    scaledown_window=SCALEDOWN_WINDOW_MINUTES * MINUTES,
    timeout=STARTUP_TIMEOUT_MINUTES * MINUTES,
    volumes={
        "/root/.cache/huggingface": hf_cache_vol,
        "/root/.cache/vllm": vllm_cache_vol,
    },
)
@modal.concurrent(max_inputs=MAX_CONCURRENT_REQUESTS)
@modal.web_server(port=VLLM_PORT, startup_timeout=STARTUP_TIMEOUT_MINUTES * MINUTES)
def serve():
    """Run vLLM's OpenAI-compatible server."""
    import subprocess

    cmd = [
        "vllm",
        "serve",
        MODEL_NAME,
        "--host", "0.0.0.0",
        "--port", str(VLLM_PORT),
        "--served-model-name", SERVED_MODEL_NAME,
        "--trust-remote-code",
        "--max-model-len", str(MAX_MODEL_LEN),
        "--gpu-memory-utilization", str(GPU_MEMORY_UTILIZATION),
        "--tensor-parallel-size", str(N_GPU),
    ]

    if MODEL_REVISION:
        cmd += ["--revision", MODEL_REVISION]

    if FAST_BOOT:
        cmd += ["--enforce-eager"]

    print("Starting vLLM server:", " ".join(cmd))
    subprocess.Popen(" ".join(cmd), shell=True)


# Local testing entrypoint
@app.local_entrypoint()
def test():
    """Test the deployed server."""
    import requests
    import time

    url = serve.web_url
    print(f"Server URL: {url}")

    # Wait for server to be ready
    print("Waiting for server to start...")
    for _ in range(60):
        try:
            resp = requests.get(f"{url}/health", timeout=5)
            if resp.status_code == 200:
                print("Server is healthy!")
                break
        except:
            pass
        time.sleep(5)
    else:
        print("Server failed to start")
        return

    # Test chat completion
    print("\nTesting chat completion...")
    response = requests.post(
        f"{url}/v1/chat/completions",
        json={
            "model": "forge-coder",
            "messages": [{"role": "user", "content": "Write hello world in Python"}],
            "max_tokens": 100,
        },
        timeout=120,
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
