"""
Application configuration with environment-based settings.
Supports dev/staging/prod environments.
"""
from enum import Enum
from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Environment(str, Enum):
    DEV = "dev"
    STAGING = "staging"
    PROD = "prod"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # Environment
    environment: Environment = Environment.DEV
    debug: bool = Field(default=True)

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_prefix: str = "/api/v1"

    # CORS
    cors_origins: list[str] = [
        "http://localhost:3000",
        "https://plataforma-libros.vercel.app",
    ]

    # Qdrant
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: str | None = None
    qdrant_collection_prefix: str = "book_"

    # Ollama (dev)
    ollama_base_url: str = "http://localhost:11434"

    # vLLM (prod)
    vllm_base_url: str = "http://localhost:8080"

    # LLM Settings (optimizado para bajo coste)
    default_llm_provider: Literal["ollama", "vllm"] = "ollama"
    default_llm_model: str = "qwen3:4b"  # 4b usa ~50% menos recursos que 8b
    llm_temperature: float = 0.2
    llm_max_tokens: int = 2048  # Reducido para menor coste
    llm_timeout: int = 120  # Timeout agresivo

    # Embeddings
    embedding_model: str = "bge-m3"
    embedding_dimensions: int = 1024

    # RAG Settings (optimizado)
    chunk_size: int = 1000  # Chunks más pequeños = menos tokens
    chunk_overlap: int = 100
    retriever_k: int = 4  # Menos chunks = menor coste
    min_relevance_score: float = 0.3  # Más estricto = mejores resultados

    # Storage
    docs_dir: str = "./docs"
    upload_dir: str = "./uploads"

    @computed_field
    @property
    def docs_path(self) -> Path:
        return Path(self.docs_dir)

    @computed_field
    @property
    def upload_path(self) -> Path:
        return Path(self.upload_dir)

    @computed_field
    @property
    def is_production(self) -> bool:
        return self.environment == Environment.PROD


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance."""
    return Settings()


settings = get_settings()
