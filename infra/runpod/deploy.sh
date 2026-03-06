#!/bin/bash
# FORGE RunPod GPU Deployment Script
# V1: 4x H100 with DeepSeek Coder V2
# V2: 8x H100 with 400B MoE (scale later)

set -e

# Configuration
RUNPOD_API_KEY="${RUNPOD_API_KEY:?Error: RUNPOD_API_KEY environment variable required}"
POD_NAME="${POD_NAME:-forge-inference-v1}"
IMAGE="${IMAGE:-ghcr.io/forge/inference:latest}"
GPU_TYPE="${GPU_TYPE:-NVIDIA H100 80GB}"

# V1: 4 GPUs (~$10/hr, ~$7,200/mo)
# V2: 8 GPUs (~$20/hr, ~$14,400/mo)
GPU_COUNT="${GPU_COUNT:-4}"

echo "=========================================="
echo "FORGE GPU Deployment (V1)"
echo "=========================================="
echo "Pod Name: ${POD_NAME}"
echo "Image: ${IMAGE}"
echo "GPU Type: ${GPU_TYPE}"
echo "GPU Count: ${GPU_COUNT}"
echo "Estimated Cost: ~\$${GPU_COUNT}0/hour"
echo "=========================================="

# Create pod
echo "Creating RunPod instance..."

curl -X POST "https://api.runpod.io/v2/pods" \
  -H "Authorization: Bearer ${RUNPOD_API_KEY}" \
  -H "Content-Type: application/json" \
  -d @- << EOF
{
  "name": "${POD_NAME}",
  "imageName": "${IMAGE}",
  "gpuTypeId": "${GPU_TYPE}",
  "gpuCount": ${GPU_COUNT},
  "volumeInGb": 1000,
  "containerDiskInGb": 100,
  "minVcpuCount": 32,
  "minMemoryInGb": 128,
  "ports": "8001/http",
  "env": {
    "MODEL_PATH": "deepseek-ai/DeepSeek-Coder-V2-Instruct",
    "MODEL_NAME": "forge-coder",
    "TENSOR_PARALLEL_SIZE": "${GPU_COUNT}",
    "GPU_MEMORY_UTIL": "0.9",
    "MAX_MODEL_LEN": "32768",
    "MAX_NUM_SEQS": "128"
  }
}
EOF

echo ""
echo "Pod deployment initiated."
echo "Check status at: https://www.runpod.io/console/pods"
echo ""
echo "V1 Monthly Cost Estimate: ~\$7,200"
echo "Break-even: ~73 subscribers at \$99/mo"
