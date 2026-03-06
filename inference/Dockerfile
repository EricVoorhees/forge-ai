# FORGE Inference Node Dockerfile
# vLLM with CUDA support for 400B Sparse MoE model

FROM nvidia/cuda:12.1-devel-ubuntu22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3.11 \
    python3.11-venv \
    python3-pip \
    git \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set Python 3.11 as default
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3.11 1 \
    && update-alternatives --install /usr/bin/pip pip /usr/bin/pip3 1

# Upgrade pip
RUN pip install --upgrade pip

# Install PyTorch with CUDA support
RUN pip install --no-cache-dir \
    torch==2.2.0 \
    --index-url https://download.pytorch.org/whl/cu121

# Install vLLM and dependencies
RUN pip install --no-cache-dir \
    vllm==0.4.0 \
    transformers==4.38.0 \
    accelerate==0.27.0 \
    sentencepiece \
    tiktoken \
    prometheus-client

# Create directories
RUN mkdir -p /models /app

# Copy configuration and scripts
COPY config.yaml /app/config.yaml
COPY run_vllm.sh /app/run_vllm.sh
RUN chmod +x /app/run_vllm.sh

WORKDIR /app

# Expose ports
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=300s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Default command
CMD ["/app/run_vllm.sh"]
