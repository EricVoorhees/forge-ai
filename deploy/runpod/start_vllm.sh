#!/bin/bash
# FORGE vLLM Startup Script for RunPod
# Supports multiple model configurations

set -e

# Configuration (override via environment variables)
MODEL=${MODEL:-"deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct"}
TENSOR_PARALLEL=${TENSOR_PARALLEL:-4}
MAX_MODEL_LEN=${MAX_MODEL_LEN:-32768}
GPU_MEMORY_UTILIZATION=${GPU_MEMORY_UTILIZATION:-0.95}
PORT=${PORT:-8000}

echo "=============================================="
echo "FORGE vLLM Inference Server"
echo "=============================================="
echo "Model: $MODEL"
echo "Tensor Parallel Size: $TENSOR_PARALLEL"
echo "Max Model Length: $MAX_MODEL_LEN"
echo "GPU Memory Utilization: $GPU_MEMORY_UTILIZATION"
echo "Port: $PORT"
echo "=============================================="

# Wait for GPUs to be ready
nvidia-smi

# Start vLLM with OpenAI-compatible API
python -m vllm.entrypoints.openai.api_server \
    --model "$MODEL" \
    --tensor-parallel-size "$TENSOR_PARALLEL" \
    --max-model-len "$MAX_MODEL_LEN" \
    --gpu-memory-utilization "$GPU_MEMORY_UTILIZATION" \
    --host 0.0.0.0 \
    --port "$PORT" \
    --trust-remote-code \
    --disable-log-requests \
    --enable-prefix-caching
