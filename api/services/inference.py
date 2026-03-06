"""
FORGE Inference Client
HTTP client for Fireworks.ai (OpenAI-compatible)

Model: DeepSeek V3.1 671B MoE (MIT license, open source)
Pricing: $0.90/1M tokens (input + output)
"""

import httpx
import time
from typing import AsyncIterator, List, Dict, Any, Optional

from config import settings
from services.logging import get_logger

logger = get_logger("services.inference")


# Default system prompt for FORGE identity
FORGE_SYSTEM_PROMPT = """You are FORGE, an advanced AI coding assistant. You are designed to help developers write, debug, and understand code across all programming languages and frameworks.

Key traits:
- You provide clear, accurate, and well-documented code
- You explain your reasoning when helpful
- You follow best practices and modern conventions
- You are direct and efficient in your responses

When asked about your identity, you are FORGE, an AI coding assistant."""


class InferenceClient:
    """Client for communicating with Fireworks.ai inference API (OpenAI-compatible)."""
    
    def __init__(self):
        self.base_url = settings.inference_url
        self.model = settings.inference_model
        self.api_key = settings.fireworks_api_key
        self.timeout = httpx.Timeout(settings.inference_timeout)
        self._client: Optional[httpx.AsyncClient] = None
        logger.info(f"InferenceClient initialized", extra={"extra_data": {"base_url": self.base_url, "model": self.model, "timeout": settings.inference_timeout}})
    
    @property
    def client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                timeout=self.timeout,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                }
            )
        return self._client
    
    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None

    def _inject_forge_identity(self, messages: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """Inject FORGE identity system prompt if no system message exists."""
        if not messages:
            return [{"role": "system", "content": FORGE_SYSTEM_PROMPT}]
        
        # Check if there's already a system message
        has_system = any(msg.get("role") == "system" for msg in messages)
        if has_system:
            return messages
        
        # Prepend FORGE system prompt
        return [{"role": "system", "content": FORGE_SYSTEM_PROMPT}] + messages

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        top_p: float = 1.0,
        stream: bool = False,
        **kwargs
    ) -> Dict[str, Any]:
        """Send chat completion request to Fireworks.ai API."""
        start_time = time.time()
        
        # Use configured model if not specified
        model = model or self.model
        
        # Inject FORGE identity if no system prompt provided
        messages = self._inject_forge_identity(messages)
        
        logger.info(f"Chat completion request", extra={"extra_data": {"model": model, "messages_count": len(messages), "max_tokens": max_tokens, "temperature": temperature}})
        
        # OpenAI-compatible request
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "top_p": top_p,
            "stream": False,
            **kwargs
        }
        
        try:
            response = await self.client.post(
                "/v1/chat/completions",
                json=payload
            )
            response.raise_for_status()
            result = response.json()
            
            duration_ms = round((time.time() - start_time) * 1000, 2)
            usage = result.get("usage", {})
            logger.info(f"Chat completion success", extra={"duration_ms": duration_ms, "extra_data": {"prompt_tokens": usage.get("prompt_tokens"), "completion_tokens": usage.get("completion_tokens"), "model": model}})
            
            return result
        except httpx.HTTPStatusError as e:
            duration_ms = round((time.time() - start_time) * 1000, 2)
            logger.error(f"Chat completion HTTP error: {e.response.status_code}", extra={"duration_ms": duration_ms, "extra_data": {"status_code": e.response.status_code, "response": e.response.text[:500]}})
            raise
        except Exception as e:
            duration_ms = round((time.time() - start_time) * 1000, 2)
            logger.error(f"Chat completion failed: {str(e)}", extra={"duration_ms": duration_ms}, exc_info=True)
            raise
    
    async def chat_completion_stream(
        self,
        messages: List[Dict[str, str]],
        model: str = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        top_p: float = 1.0,
        **kwargs
    ) -> AsyncIterator[str]:
        """
        Send streaming chat completion request to Fireworks.ai.
        Yields SSE data chunks.
        """
        start_time = time.time()
        chunk_count = 0
        
        # Use configured model if not specified
        model = model or self.model
        
        # Inject FORGE identity if no system prompt provided
        messages = self._inject_forge_identity(messages)
        
        logger.info(f"Chat completion stream request", extra={"extra_data": {"model": model, "messages_count": len(messages), "max_tokens": max_tokens}})
        
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "top_p": top_p,
            "stream": True,
            **kwargs
        }
        
        try:
            async with self.client.stream(
                "POST",
                "/v1/chat/completions",
                json=payload
            ) as response:
                response.raise_for_status()
                first_chunk_time = None
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        if first_chunk_time is None:
                            first_chunk_time = time.time()
                            ttft = round((first_chunk_time - start_time) * 1000, 2)
                            logger.debug(f"First token received", extra={"duration_ms": ttft})
                        
                        chunk_count += 1
                        data = line[6:]
                        if data.strip() == "[DONE]":
                            duration_ms = round((time.time() - start_time) * 1000, 2)
                            logger.info(f"Chat completion stream complete", extra={"duration_ms": duration_ms, "extra_data": {"chunks": chunk_count, "model": model}})
                            yield "data: [DONE]\n\n"
                            break
                        yield f"data: {data}\n\n"
        except Exception as e:
            duration_ms = round((time.time() - start_time) * 1000, 2)
            logger.error(f"Chat completion stream failed: {str(e)}", extra={"duration_ms": duration_ms, "extra_data": {"chunks_before_error": chunk_count}}, exc_info=True)
            raise
    
    async def health_check(self) -> bool:
        """Check if inference server is healthy."""
        logger.debug(f"Checking inference server health: {self.base_url}")
        try:
            response = await self.client.get("/health")
            healthy = response.status_code == 200
            if healthy:
                logger.debug("Inference server is healthy")
            else:
                logger.warning(f"Inference server unhealthy: status {response.status_code}")
            return healthy
        except Exception as e:
            logger.error(f"Inference server health check failed: {str(e)}")
            return False
    
    async def get_models(self) -> List[Dict[str, Any]]:
        """Get available models from inference server."""
        logger.debug("Fetching available models from inference server")
        try:
            response = await self.client.get("/v1/models")
            response.raise_for_status()
            data = response.json()
            models = data.get("data", [])
            logger.info(f"Retrieved {len(models)} models from inference server")
            return models
        except Exception as e:
            logger.error(f"Failed to fetch models: {str(e)}")
            return []


inference_client = InferenceClient()
