#!/bin/bash
# FORGE vLLM Server Launch Script
# V1: DeepSeek Coder V2 on 4x H100
# V2: 400B Sparse MoE on 8x H100 (scale later)

set -e

# V1 defaults: DeepSeek Coder V2 on 4x H100
# V2 upgrade: Change to 400B model with 8 GPUs
MODEL_PATH="${MODEL_PATH:-deepseek-ai/DeepSeek-Coder-V2-Instruct}"
MODEL_NAME="${MODEL_NAME:-forge-coder}"
TENSOR_PARALLEL="${TENSOR_PARALLEL_SIZE:-4}"
GPU_MEM="${GPU_MEMORY_UTIL:-0.9}"
MAX_LEN="${MAX_MODEL_LEN:-32768}"

echo "=========================================="
echo "FORGE Inference Node"
echo "=========================================="
echo "Model: ${MODEL_PATH}"
echo "Served as: ${MODEL_NAME}"
echo "Tensor Parallel Size: ${TENSOR_PARALLEL}"
echo "GPU Memory Utilization: ${GPU_MEM}"
echo "Max Model Length: ${MAX_LEN}"
echo "=========================================="

# Check GPU availability
echo "Checking GPU availability..."
nvidia-smi

# Start vLLM server
echo "Starting vLLM server..."

python -m vllm.entrypoints.openai.api_server \
    --model "${MODEL_PATH}" \
    --served-model-name "${MODEL_NAME}" \
    --tensor-parallel-size "${TENSOR_PARALLEL}" \
    --gpu-memory-utilization "${GPU_MEM}" \
    --max-model-len "${MAX_LEN}" \
    --max-num-seqs "${MAX_NUM_SEQS:-128}" \
    --dtype "${DTYPE:-bfloat16}" \
    --trust-remote-code \
    --host 0.0.0.0 \
    --port 8001 \
    --disable-log-requests
