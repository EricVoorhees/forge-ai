"""
FORGE Inference Server on Modal
Serverless vLLM deployment with automatic scaling
"""

import modal

# Define the Modal app
app = modal.App("forge-inference")

# Model configuration
MODEL_NAME = "Qwen/Qwen2.5-Coder-7B-Instruct"  # Fast startup, good quality
GPU_TYPE = "A10G"  # Cheaper GPU, sufficient for 7B model
MAX_MODEL_LEN = 32768

# Create a persistent volume for model caching
model_cache = modal.Volume.from_name("forge-model-cache", create_if_missing=True)

# Define the container image with vLLM
vllm_image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "vllm>=0.6.0",
        "torch>=2.4.0",
        "transformers>=4.44.0",
        "accelerate>=0.33.0",
        "huggingface_hub>=0.24.0",
        "fastapi[standard]",
    )
    .env({"HF_HOME": "/cache/huggingface"})
)


@app.cls(
    gpu=GPU_TYPE,
    image=vllm_image,
    volumes={"/cache": model_cache},
    container_idle_timeout=300,  # Keep warm for 5 minutes
    allow_concurrent_inputs=10,
    timeout=600,
)
class ForgeInference:
    """vLLM inference server running on Modal."""
    
    @modal.enter()
    def load_model(self):
        """Load the model when container starts."""
        from vllm import LLM, SamplingParams
        
        print(f"Loading model: {MODEL_NAME}")
        self.llm = LLM(
            model=MODEL_NAME,
            max_model_len=MAX_MODEL_LEN,
            trust_remote_code=True,
            gpu_memory_utilization=0.90,
            dtype="auto",
        )
        self.SamplingParams = SamplingParams
        print("Model loaded successfully!")
    
    @modal.method()
    def generate(
        self,
        prompt: str,
        max_tokens: int = 2048,
        temperature: float = 0.7,
        top_p: float = 0.95,
        stop: list[str] | None = None,
    ) -> dict:
        """Generate text completion."""
        sampling_params = self.SamplingParams(
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=top_p,
            stop=stop or [],
        )
        
        outputs = self.llm.generate([prompt], sampling_params)
        output = outputs[0]
        
        return {
            "text": output.outputs[0].text,
            "prompt_tokens": len(output.prompt_token_ids),
            "completion_tokens": len(output.outputs[0].token_ids),
            "finish_reason": output.outputs[0].finish_reason,
        }
    
    @modal.method()
    def chat_completion(
        self,
        messages: list[dict],
        max_tokens: int = 2048,
        temperature: float = 0.7,
        top_p: float = 0.95,
        stop: list[str] | None = None,
    ) -> dict:
        """OpenAI-compatible chat completion."""
        from transformers import AutoTokenizer
        
        # Format messages using the model's chat template
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
        prompt = tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )
        
        result = self.generate(
            prompt=prompt,
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=top_p,
            stop=stop,
        )
        
        return {
            "id": f"chatcmpl-modal",
            "object": "chat.completion",
            "model": MODEL_NAME,
            "choices": [{
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": result["text"],
                },
                "finish_reason": result["finish_reason"],
            }],
            "usage": {
                "prompt_tokens": result["prompt_tokens"],
                "completion_tokens": result["completion_tokens"],
                "total_tokens": result["prompt_tokens"] + result["completion_tokens"],
            },
        }


# Web endpoint for direct HTTP access
@app.function(
    gpu=GPU_TYPE,
    image=vllm_image,
    volumes={"/cache": model_cache},
    timeout=600,
)
@modal.fastapi_endpoint(method="POST")
def chat_completions(request: dict) -> dict:
    """
    OpenAI-compatible /v1/chat/completions endpoint.
    """
    from vllm import LLM, SamplingParams
    from transformers import AutoTokenizer
    
    messages = request.get("messages", [])
    max_tokens = request.get("max_tokens", 2048)
    temperature = request.get("temperature", 0.7)
    top_p = request.get("top_p", 0.95)
    
    # Load model
    llm = LLM(
        model=MODEL_NAME,
        max_model_len=MAX_MODEL_LEN,
        trust_remote_code=True,
        gpu_memory_utilization=0.90,
    )
    
    # Format messages
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
    prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    
    # Generate
    sampling_params = SamplingParams(max_tokens=max_tokens, temperature=temperature, top_p=top_p)
    outputs = llm.generate([prompt], sampling_params)
    output = outputs[0]
    
    return {
        "id": "chatcmpl-modal",
        "object": "chat.completion",
        "model": MODEL_NAME,
        "choices": [{
            "index": 0,
            "message": {"role": "assistant", "content": output.outputs[0].text},
            "finish_reason": output.outputs[0].finish_reason,
        }],
        "usage": {
            "prompt_tokens": len(output.prompt_token_ids),
            "completion_tokens": len(output.outputs[0].token_ids),
            "total_tokens": len(output.prompt_token_ids) + len(output.outputs[0].token_ids),
        },
    }


# Health check endpoint
@app.function(image=vllm_image)
@modal.fastapi_endpoint(method="GET")
def health() -> dict:
    """Health check endpoint."""
    return {"status": "healthy", "model": MODEL_NAME}


# Local testing
if __name__ == "__main__":
    # Test locally with: modal run forge_inference.py
    with app.run():
        inference = ForgeInference()
        result = inference.chat_completion.remote(
            messages=[{"role": "user", "content": "Write a hello world in Python"}],
            max_tokens=200,
        )
        print(result)
