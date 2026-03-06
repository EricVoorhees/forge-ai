"""
FORGE Request Logging Middleware
Logs all incoming requests and responses with timing
"""

import time
import uuid
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from services.logging import get_logger

logger = get_logger("middleware.request")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log all HTTP requests and responses."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = str(uuid.uuid4())[:8]
        start_time = time.time()
        
        # Extract request info
        method = request.method
        path = request.url.path
        query = str(request.query_params) if request.query_params else ""
        client_ip = request.client.host if request.client else "unknown"
        
        # Get auth info from headers (masked)
        auth_header = request.headers.get("authorization", "")
        auth_type = "none"
        if auth_header.startswith("Bearer sk-forge-"):
            auth_type = "api_key"
        elif auth_header.startswith("Bearer ey"):
            auth_type = "jwt"
        
        logger.info(
            f"REQUEST {request_id} | {method} {path}",
            extra={
                "extra_data": {
                    "request_id": request_id,
                    "method": method,
                    "path": path,
                    "query": query,
                    "client_ip": client_ip,
                    "auth_type": auth_type,
                    "user_agent": request.headers.get("user-agent", "")[:100]
                }
            }
        )
        
        # Process request
        try:
            response = await call_next(request)
            duration_ms = round((time.time() - start_time) * 1000, 2)
            
            # Log response
            status_code = response.status_code
            log_level = "info" if status_code < 400 else "warning" if status_code < 500 else "error"
            
            getattr(logger, log_level)(
                f"RESPONSE {request_id} | {status_code} | {duration_ms}ms",
                extra={
                    "request_id": request_id,
                    "duration_ms": duration_ms,
                    "extra_data": {
                        "status_code": status_code,
                        "method": method,
                        "path": path
                    }
                }
            )
            
            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Response-Time"] = f"{duration_ms}ms"
            
            return response
            
        except Exception as e:
            duration_ms = round((time.time() - start_time) * 1000, 2)
            logger.error(
                f"REQUEST FAILED {request_id} | {str(e)}",
                extra={
                    "request_id": request_id,
                    "duration_ms": duration_ms,
                    "extra_data": {
                        "method": method,
                        "path": path,
                        "error": str(e)
                    }
                },
                exc_info=True
            )
            raise
