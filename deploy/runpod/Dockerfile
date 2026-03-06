# RunPod vLLM Dockerfile for FORGE Inference
# Optimized for DeepSeek Coder V2 or similar large MoE models

FROM runpod/pytorch:2.1.0-py3.10-cuda12.1.0-devel-ubuntu22.04

WORKDIR /app

# Install vLLM and dependencies
RUN pip install --upgrade pip && \
    pip install vllm==0.3.3 \
    ray \
    transformers \
    accelerate \
    sentencepiece \
    protobuf

# Create startup script
COPY start_vllm.sh /app/start_vllm.sh
RUN chmod +x /app/start_vllm.sh

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=300s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start vLLM server
CMD ["/app/start_vllm.sh"]
