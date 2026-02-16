"""
Health check endpoints.
"""
from fastapi import APIRouter

from app.core.config import settings
from app.llm.ollama import OllamaProvider

router = APIRouter()


@router.get("/health")
async def health_check():
    """Check system health: API status, Ollama availability, loaded models."""
    ollama = OllamaProvider()
    ollama_status = await ollama.health_check()

    return {
        "status": "ok",
        "environment": settings.environment.value,
        "ollama": ollama_status,
    }
