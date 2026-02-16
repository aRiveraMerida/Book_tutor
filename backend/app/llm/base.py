"""
Abstract base class for LLM providers.
Enables switching between Ollama (dev), vLLM (prod), or OpenAI (fallback).
"""
from abc import ABC, abstractmethod
from typing import AsyncIterator, Iterator

from app.core.config import settings


class LLMProvider(ABC):
    """Abstract base class for LLM providers."""

    @abstractmethod
    def generate(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> str:
        """Generate a response synchronously."""
        ...

    @abstractmethod
    async def agenerate(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> str:
        """Generate a response asynchronously."""
        ...

    @abstractmethod
    def stream(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> Iterator[str]:
        """Stream response tokens synchronously."""
        ...

    @abstractmethod
    async def astream(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> AsyncIterator[str]:
        """Stream response tokens asynchronously."""
        ...

    @abstractmethod
    def embed(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings for texts."""
        ...

    @abstractmethod
    async def aembed(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings asynchronously."""
        ...


def get_llm_provider(provider: str | None = None) -> LLMProvider:
    """Factory function to get the appropriate LLM provider."""
    provider = provider or settings.default_llm_provider

    if provider == "ollama":
        from app.llm.ollama import OllamaProvider
        return OllamaProvider()
    elif provider == "vllm":
        from app.llm.vllm import VLLMProvider
        return VLLMProvider()
    else:
        raise ValueError(f"Unknown LLM provider: {provider}")


# Default provider instance
_default_provider: LLMProvider | None = None


def get_default_provider() -> LLMProvider:
    """Get or create the default LLM provider."""
    global _default_provider
    if _default_provider is None:
        _default_provider = get_llm_provider()
    return _default_provider
