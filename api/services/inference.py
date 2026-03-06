"""
FORGE Inference Client
HTTP client for vLLM server (supports OpenAI-compatible, RunPod serverless, and Modal)
"""

import asyncio
import httpx
import json
import time
import uuid
from typing import AsyncIterator, List, Dict, Any, Optional

from config import settings
from services.logging import get_logger

logger = get_logger("services.inference")


class InferenceClient:
    """Client for communicating with vLLM inference server."""
    
    def __init__(self):
        self.base_url = settings.inference_url
        self.timeout = httpx.Timeout(settings.inference_timeout)
        self._client: Optional[httpx.AsyncClient] = None
        # Detect backend type
        self.is_runpod = "runpod.ai" in self.base_url if self.base_url else False
        self.is_modal = "modal.run" in self.base_url if self.base_url else False
        self.runpod_api_key = getattr(settings, 'runpod_api_key', None)
        logger.info(f"InferenceClient initialized", extra={"extra_data": {"base_url": self.base_url, "timeout": settings.inference_timeout, "is_runpod": self.is_runpod, "is_modal": self.is_modal}})
    
    @property
    def client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                timeout=self.timeout
            )
        return self._client
    
    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None
    
    def _format_messages_to_prompt(self, messages: List[Dict[str, str]]) -> str:
        """Convert OpenAI messages format to a single prompt string for RunPod."""
        prompt_parts = []
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role == "system":
                prompt_parts.append(f"System: {content}")
            elif role == "user":
                prompt_parts.append(f"User: {content}")
            elif role == "assistant":
                prompt_parts.append(f"Assistant: {content}")
        prompt_parts.append("Assistant:")
        return "\n\n".join(prompt_parts)

    async def _runpod_chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str,
        temperature: float,
        max_tokens: int,
        top_p: float,
        **kwargs
    ) -> Dict[str, Any]:
        """RunPod serverless chat completion."""
        start_time = time.time()
        
        # Convert messages to prompt
        prompt = self._format_messages_to_prompt(messages)
        
        # RunPod serverless payload
        payload = {
            "input": {
                "prompt": prompt,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "top_p": top_p,
            }
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {settings.runpod_api_key}"
        }
        
        # Extract endpoint ID from URL (e.g., https://api.runpod.ai/v2/c7h5q3np80boas)
        # and call /run endpoint
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            # Submit job
            run_url = f"{self.base_url}/run"
            logger.debug(f"Submitting RunPod job to {run_url}")
            
            response = await client.post(run_url, json=payload, headers=headers)
            response.raise_for_status()
            job_data = response.json()
            job_id = job_data.get("id")
            
            logger.debug(f"RunPod job submitted", extra={"extra_data": {"job_id": job_id}})
            
            # Poll for completion
            status_url = f"{self.base_url}/status/{job_id}"
            max_polls = 120  # 2 minutes max
            poll_interval = 1.0
            
            for _ in range(max_polls):
                status_response = await client.get(status_url, headers=headers)
                status_data = status_response.json()
                status = status_data.get("status")
                
                if status == "COMPLETED":
                    duration_ms = round((time.time() - start_time) * 1000, 2)
                    output = status_data.get("output", [])
                    
                    # Parse RunPod output to OpenAI format
                    generated_text = ""
                    prompt_tokens = 0
                    completion_tokens = 0
                    
                    if output and len(output) > 0:
                        first_output = output[0]
                        choices = first_output.get("choices", [])
                        if choices:
                            tokens = choices[0].get("tokens", [])
                            # Decode token string (remove special chars like Ġ)
                            generated_text = "".join(tokens).replace("Ġ", " ").replace("Ċ", "\n")
                        usage = first_output.get("usage", {})
                        prompt_tokens = usage.get("input", 0)
                        completion_tokens = usage.get("output", 0)
                    
                    logger.info(f"RunPod completion success", extra={"duration_ms": duration_ms, "extra_data": {"prompt_tokens": prompt_tokens, "completion_tokens": completion_tokens}})
                    
                    # Return OpenAI-compatible format
                    return {
                        "id": f"chatcmpl-{job_id}",
                        "object": "chat.completion",
                        "model": model,
                        "choices": [{
                            "index": 0,
                            "message": {
                                "role": "assistant",
                                "content": generated_text.strip()
                            },
                            "finish_reason": "stop"
                        }],
                        "usage": {
                            "prompt_tokens": prompt_tokens,
                            "completion_tokens": completion_tokens,
                            "total_tokens": prompt_tokens + completion_tokens
                        }
                    }
                
                elif status == "FAILED":
                    error = status_data.get("error", "Unknown error")
                    logger.error(f"RunPod job failed: {error}")
                    raise Exception(f"RunPod inference failed: {error}")
                
                elif status in ["IN_QUEUE", "IN_PROGRESS"]:
                    await asyncio.sleep(poll_interval)
                else:
                    logger.warning(f"Unknown RunPod status: {status}")
                    await asyncio.sleep(poll_interval)
            
            raise Exception("RunPod job timed out")

    async def _modal_chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str,
        temperature: float,
        max_tokens: int,
        top_p: float,
        **kwargs
    ) -> Dict[str, Any]:
        """Modal serverless chat completion."""
        start_time = time.time()
        
        # Modal expects a simple JSON payload
        payload = {
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "top_p": top_p,
        }
        
        headers = {"Content-Type": "application/json"}
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            logger.debug(f"Sending Modal request to {self.base_url}")
            
            response = await client.post(self.base_url, json=payload, headers=headers)
            response.raise_for_status()
            result = response.json()
            
            duration_ms = round((time.time() - start_time) * 1000, 2)
            usage = result.get("usage", {})
            logger.info(f"Modal completion success", extra={"duration_ms": duration_ms, "extra_data": {"prompt_tokens": usage.get("prompt_tokens"), "completion_tokens": usage.get("completion_tokens")}})
            
            # Modal returns OpenAI-compatible format, just pass through
            return result

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = "forge-coder",
        temperature: float = 0.7,
        max_tokens: int = 4096,
        top_p: float = 1.0,
        stream: bool = False,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Send chat completion request.
        Supports both OpenAI-compatible servers and RunPod serverless.
        """
        start_time = time.time()
        logger.info(f"Chat completion request", extra={"extra_data": {"model": model, "messages_count": len(messages), "max_tokens": max_tokens, "temperature": temperature, "is_runpod": self.is_runpod}})
        
        # Use RunPod-specific handler if detected
        if self.is_runpod:
            return await self._runpod_chat_completion(messages, model, temperature, max_tokens, top_p, **kwargs)
        
        # Use Modal handler if detected
        if self.is_modal:
            return await self._modal_chat_completion(messages, model, temperature, max_tokens, top_p, **kwargs)
        
        # Standard OpenAI-compatible request
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
        model: str = "forge-coder",
        temperature: float = 0.7,
        max_tokens: int = 4096,
        top_p: float = 1.0,
        **kwargs
    ) -> AsyncIterator[str]:
        """
        Send streaming chat completion request to vLLM.
        Yields SSE data chunks.
        """
        start_time = time.time()
        chunk_count = 0
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
