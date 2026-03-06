"""
FORGE Inference Server on Modal
Following Modal's official vLLM deployment pattern
https://modal.com/docs/examples/vllm_inference
"""

import modal

# Container image with vLLM (using Modal's recommended setup)
vllm_image = (
    modal.Image.from_registry("nvidia/cuda:12.8.0-devel-ubuntu22.04", add_python="3.12")
    .entrypoint([])
    .pip_install(
        "vllm==0.13.0",  # Use version from Modal's official example
        "huggingface-hub==0.36.0",
    )
    .env({"HF_XET_HIGH_PERFORMANCE": "1"})  # Faster model transfers
)

# Model configuration
MODEL_NAME = "Qwen/Qwen2.5-Coder-7B-Instruct"
MODEL_REVISION = None  # Use latest

# Volumes for caching
hf_cache_vol = modal.Volume.from_name("forge-hf-cache", create_if_missing=True)
vllm_cache_vol = modal.Volume.from_name("forge-vllm-cache", create_if_missing=True)

# Configuration
FAST_BOOT = True  # Faster cold starts, slightly slower inference
N_GPU = 1
MINUTES = 60
VLLM_PORT = 8000

app = modal.App("forge-vllm")


@app.function(
    image=vllm_image,
    gpu=f"A10G:{N_GPU}",  # A10G is cheaper, sufficient for 7B model
    scaledown_window=5 * MINUTES,  # Keep warm for 5 minutes
    timeout=10 * MINUTES,  # Container startup timeout
    volumes={
        "/root/.cache/huggingface": hf_cache_vol,
        "/root/.cache/vllm": vllm_cache_vol,
    },
)
@modal.concurrent(max_inputs=16)  # Handle 16 concurrent requests per replica
@modal.web_server(port=VLLM_PORT, startup_timeout=10 * MINUTES)
def serve():
    """Run vLLM's OpenAI-compatible server."""
    import subprocess

    cmd = [
        "vllm",
        "serve",
        MODEL_NAME,
        "--host", "0.0.0.0",
        "--port", str(VLLM_PORT),
        "--served-model-name", "forge-coder",  # Alias for our API
        "--trust-remote-code",
        "--max-model-len", "16384",
        "--gpu-memory-utilization", "0.90",
    ]

    # Add revision if specified
    if MODEL_REVISION:
        cmd += ["--revision", MODEL_REVISION]

    # Fast boot: disable compilation for faster cold starts
    if FAST_BOOT:
        cmd += ["--enforce-eager"]
    else:
        cmd += ["--no-enforce-eager"]

    # Tensor parallelism for multi-GPU
    cmd += ["--tensor-parallel-size", str(N_GPU)]

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
