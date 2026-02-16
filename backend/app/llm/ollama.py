"""
Ollama LLM provider for local development.
Uses Ollama API for both chat and embeddings.
"""
import re
from typing import AsyncIterator, Iterator

import httpx

from app.core.config import settings
from app.llm.base import LLMProvider


class OllamaProvider(LLMProvider):
    """Ollama-based LLM provider."""

    def __init__(
        self,
        base_url: str | None = None,
        model: str | None = None,
        embedding_model: str | None = None,
    ):
        self.base_url = base_url or settings.ollama_base_url
        self.model = model or settings.default_llm_model
        self.embedding_model = embedding_model or settings.embedding_model
        self.default_temperature = settings.llm_temperature
        self.default_max_tokens = settings.llm_max_tokens

    def _strip_thinking(self, text: str) -> str:
        """Remove <think>...</think> blocks from Qwen 3 output."""
        return re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()

    def _build_messages(
        self, prompt: str, system_prompt: str | None
    ) -> list[dict[str, str]]:
        """Build message list for chat API."""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        # Add /no_think for Qwen 3 to disable verbose thinking
        messages.append({"role": "user", "content": f"/no_think\n{prompt}"})
        return messages

    def generate(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> str:
        """Generate a response synchronously."""
        messages = self._build_messages(prompt, system_prompt)

        with httpx.Client(timeout=120.0) as client:
            response = client.post(
                f"{self.base_url}/api/chat",
                json={
                    "model": self.model,
                    "messages": messages,
                    "stream": False,
                    "options": {
                        "temperature": temperature or self.default_temperature,
                        "num_predict": max_tokens or self.default_max_tokens,
                    },
                },
            )
            response.raise_for_status()
            content = response.json()["message"]["content"]
            return self._strip_thinking(content)

    async def agenerate(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> str:
        """Generate a response asynchronously."""
        messages = self._build_messages(prompt, system_prompt)

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{self.base_url}/api/chat",
                json={
                    "model": self.model,
                    "messages": messages,
                    "stream": False,
                    "options": {
                        "temperature": temperature or self.default_temperature,
                        "num_predict": max_tokens or self.default_max_tokens,
                    },
                },
            )
            response.raise_for_status()
            content = response.json()["message"]["content"]
            return self._strip_thinking(content)

    def stream(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> Iterator[str]:
        """Stream response tokens synchronously."""
        messages = self._build_messages(prompt, system_prompt)

        with httpx.Client(timeout=120.0) as client:
            with client.stream(
                "POST",
                f"{self.base_url}/api/chat",
                json={
                    "model": self.model,
                    "messages": messages,
                    "stream": True,
                    "options": {
                        "temperature": temperature or self.default_temperature,
                        "num_predict": max_tokens or self.default_max_tokens,
                    },
                },
            ) as response:
                response.raise_for_status()
                buffer = ""
                in_thinking = False

                for line in response.iter_lines():
                    if line:
                        import json
                        data = json.loads(line)
                        if "message" in data and "content" in data["message"]:
                            chunk = data["message"]["content"]
                            buffer += chunk

                            # Handle <think> blocks
                            if "<think>" in buffer:
                                in_thinking = True
                            if "</think>" in buffer:
                                in_thinking = False
                                # Remove thinking block
                                buffer = re.sub(
                                    r"<think>.*?</think>",
                                    "",
                                    buffer,
                                    flags=re.DOTALL,
                                )

                            if not in_thinking and buffer:
                                yield buffer
                                buffer = ""

    async def astream(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> AsyncIterator[str]:
        """Stream response tokens asynchronously."""
        messages = self._build_messages(prompt, system_prompt)

        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/api/chat",
                json={
                    "model": self.model,
                    "messages": messages,
                    "stream": True,
                    "options": {
                        "temperature": temperature or self.default_temperature,
                        "num_predict": max_tokens or self.default_max_tokens,
                    },
                },
            ) as response:
                response.raise_for_status()
                buffer = ""
                in_thinking = False

                async for line in response.aiter_lines():
                    if line:
                        import json
                        data = json.loads(line)
                        if "message" in data and "content" in data["message"]:
                            chunk = data["message"]["content"]
                            buffer += chunk

                            if "<think>" in buffer:
                                in_thinking = True
                            if "</think>" in buffer:
                                in_thinking = False
                                buffer = re.sub(
                                    r"<think>.*?</think>",
                                    "",
                                    buffer,
                                    flags=re.DOTALL,
                                )

                            if not in_thinking and buffer:
                                yield buffer
                                buffer = ""

    def embed(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings for texts."""
        embeddings = []

        with httpx.Client(timeout=60.0) as client:
            for text in texts:
                response = client.post(
                    f"{self.base_url}/api/embeddings",
                    json={
                        "model": self.embedding_model,
                        "prompt": text,
                    },
                )
                response.raise_for_status()
                embeddings.append(response.json()["embedding"])

        return embeddings

    async def aembed(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings asynchronously."""
        embeddings = []

        async with httpx.AsyncClient(timeout=60.0) as client:
            for text in texts:
                response = await client.post(
                    f"{self.base_url}/api/embeddings",
                    json={
                        "model": self.embedding_model,
                        "prompt": text,
                    },
                )
                response.raise_for_status()
                embeddings.append(response.json()["embedding"])

        return embeddings

    async def health_check(self) -> dict:
        """Check Ollama availability and loaded models."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                if response.status_code == 200:
                    data = response.json()
                    models = [m["name"] for m in data.get("models", [])]
                    return {"status": "ok", "models": models}
        except Exception as e:
            return {"status": "error", "error": str(e)}

        return {"status": "unavailable", "models": []}
