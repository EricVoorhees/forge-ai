"""
FORGE Logging Configuration
Structured logging with detailed context
"""

import logging
import sys
import json
from datetime import datetime
from typing import Any, Optional
from functools import wraps
import traceback

from config import settings


class JSONFormatter(logging.Formatter):
    """JSON formatter for structured logging."""
    
    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        if hasattr(record, "user_id"):
            log_data["user_id"] = record.user_id
        if hasattr(record, "api_key_id"):
            log_data["api_key_id"] = record.api_key_id
        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id
        if hasattr(record, "duration_ms"):
            log_data["duration_ms"] = record.duration_ms
        if hasattr(record, "extra_data"):
            log_data["data"] = record.extra_data
            
        if record.exc_info:
            log_data["exception"] = {
                "type": record.exc_info[0].__name__ if record.exc_info[0] else None,
                "message": str(record.exc_info[1]) if record.exc_info[1] else None,
                "traceback": traceback.format_exception(*record.exc_info) if record.exc_info[0] else None
            }
        
        return json.dumps(log_data)


class ColoredFormatter(logging.Formatter):
    """Colored formatter for development."""
    
    COLORS = {
        "DEBUG": "\033[36m",     # Cyan
        "INFO": "\033[32m",      # Green
        "WARNING": "\033[33m",   # Yellow
        "ERROR": "\033[31m",     # Red
        "CRITICAL": "\033[35m",  # Magenta
    }
    RESET = "\033[0m"
    
    def format(self, record: logging.LogRecord) -> str:
        color = self.COLORS.get(record.levelname, self.RESET)
        timestamp = datetime.utcnow().strftime("%H:%M:%S.%f")[:-3]
        
        base = f"{color}[{timestamp}] {record.levelname:8}{self.RESET} {record.name}: {record.getMessage()}"
        
        extras = []
        if hasattr(record, "user_id"):
            extras.append(f"user={record.user_id[:8]}...")
        if hasattr(record, "api_key_id"):
            extras.append(f"key={record.api_key_id[:8]}...")
        if hasattr(record, "duration_ms"):
            extras.append(f"duration={record.duration_ms}ms")
        if hasattr(record, "extra_data"):
            extras.append(f"data={record.extra_data}")
            
        if extras:
            base += f" ({', '.join(extras)})"
            
        if record.exc_info:
            base += "\n" + "".join(traceback.format_exception(*record.exc_info))
            
        return base


def setup_logging():
    """Initialize logging configuration."""
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG if settings.debug else logging.INFO)
    
    # Clear existing handlers
    root_logger.handlers.clear()
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG if settings.debug else logging.INFO)
    
    if settings.debug:
        console_handler.setFormatter(ColoredFormatter())
    else:
        console_handler.setFormatter(JSONFormatter())
    
    root_logger.addHandler(console_handler)
    
    # Reduce noise from third-party libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    
    return root_logger


def get_logger(name: str) -> logging.Logger:
    """Get a logger with the given name."""
    return logging.getLogger(f"forge.{name}")


class LogContext:
    """Context manager for adding extra fields to log records."""
    
    def __init__(self, logger: logging.Logger, **kwargs):
        self.logger = logger
        self.extra = kwargs
    
    def __enter__(self):
        return self
    
    def __exit__(self, *args):
        pass
    
    def _log(self, level: int, msg: str, *args, **kwargs):
        extra = kwargs.pop("extra", {})
        extra.update(self.extra)
        kwargs["extra"] = extra
        self.logger.log(level, msg, *args, **kwargs)
    
    def debug(self, msg: str, *args, **kwargs):
        self._log(logging.DEBUG, msg, *args, **kwargs)
    
    def info(self, msg: str, *args, **kwargs):
        self._log(logging.INFO, msg, *args, **kwargs)
    
    def warning(self, msg: str, *args, **kwargs):
        self._log(logging.WARNING, msg, *args, **kwargs)
    
    def error(self, msg: str, *args, **kwargs):
        self._log(logging.ERROR, msg, *args, **kwargs)


def log_function_call(logger: logging.Logger):
    """Decorator to log function entry/exit with timing."""
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            start = datetime.utcnow()
            logger.debug(f"ENTER {func.__name__}", extra={"extra_data": {"args_count": len(args), "kwargs_keys": list(kwargs.keys())}})
            try:
                result = await func(*args, **kwargs)
                duration = (datetime.utcnow() - start).total_seconds() * 1000
                logger.debug(f"EXIT {func.__name__}", extra={"duration_ms": round(duration, 2)})
                return result
            except Exception as e:
                duration = (datetime.utcnow() - start).total_seconds() * 1000
                logger.error(f"FAILED {func.__name__}: {str(e)}", extra={"duration_ms": round(duration, 2)}, exc_info=True)
                raise
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            start = datetime.utcnow()
            logger.debug(f"ENTER {func.__name__}", extra={"extra_data": {"args_count": len(args), "kwargs_keys": list(kwargs.keys())}})
            try:
                result = func(*args, **kwargs)
                duration = (datetime.utcnow() - start).total_seconds() * 1000
                logger.debug(f"EXIT {func.__name__}", extra={"duration_ms": round(duration, 2)})
                return result
            except Exception as e:
                duration = (datetime.utcnow() - start).total_seconds() * 1000
                logger.error(f"FAILED {func.__name__}: {str(e)}", extra={"duration_ms": round(duration, 2)}, exc_info=True)
                raise
        
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper
    return decorator
