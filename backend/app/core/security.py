"""
Security utilities and API key validation helpers
"""
from typing import Optional
from app.core.config import settings


def mask_secret(secret: Optional[str]) -> str:
    """Safely mask secrets for logging or status displays without leaking keys."""
    if not secret:
        return "NOT_CONFIGURED"
    if len(secret) <= 8:
        return "****"
    return f"{secret[:3]}...{secret[-3:]}"


def validate_gemini_configured() -> bool:
    """Check if Gemini API key is configured."""
    return bool(settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 0)


def validate_nvidia_configured() -> bool:
    """Check if NVIDIA API key is configured for embeddings."""
    return bool(settings.NVIDIA_API_KEY and len(settings.NVIDIA_API_KEY.strip()) > 0)
