"""
RAG (Retrieval-Augmented Generation) service.
Combines Qdrant retrieval with LLM generation for Q&A.
"""
import logging
from dataclasses import dataclass
from typing import AsyncIterator

from app.core.config import settings
from app.db.qdrant import QdrantService, qdrant_service
from app.llm.base import LLMProvider, get_default_provider

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """\
Eres un asistente experto en formación que responde preguntas basándose \
EXCLUSIVAMENTE en el contenido del libro proporcionado.

Reglas estrictas:
- Responde SOLO con información presente en el contexto proporcionado
- Si la respuesta no está en el contexto, di: "No encuentro esa información en este libro."
- Responde siempre en español
- Sé conciso pero completo
- Si el contexto contiene pasos o listas, mantén esa estructura en tu respuesta
- Cita las fuentes usando [N] junto a cada afirmación (ej: "El pruning reduce el tamaño del modelo [1].")
- Puedes combinar información de varias fuentes en una misma frase citando todas (ej: [1][3])
- NO inventes información que no esté en el contexto
- NO uses conocimiento externo

Contexto del libro:
{context}"""


@dataclass
class Source:
    """A source reference from retrieval."""
    source_file: str
    titulo: str | None
    seccion: str | None
    subseccion: str | None
    content: str
    score: float


@dataclass
class RAGResponse:
    """Response from RAG query."""
    answer: str
    sources: list[Source]
    book_id: str
    model_used: str


class RAGService:
    """Service for RAG-based question answering."""

    def __init__(
        self,
        qdrant: QdrantService | None = None,
        llm: LLMProvider | None = None,
    ):
        self.qdrant = qdrant or qdrant_service
        self.llm = llm or get_default_provider()
        self.retriever_k = settings.retriever_k
        self.min_relevance = settings.min_relevance_score

    def _build_context(self, chunks: list[dict]) -> tuple[str, list[Source]]:
        """Build numbered context string and source list."""
        numbered_parts = []
        sources = []

        for i, chunk in enumerate(chunks, 1):
            numbered_parts.append(f"[{i}] {chunk['content']}")
            sources.append(
                Source(
                    source_file=chunk.get("source_file", "unknown"),
                    titulo=chunk.get("titulo"),
                    seccion=chunk.get("seccion"),
                    subseccion=chunk.get("subseccion"),
                    content=chunk["content"],
                    score=round(chunk["score"], 3),
                )
            )

        context = "\n\n".join(numbered_parts)
        return context, sources

    def ask(self, book_id: str, question: str) -> RAGResponse:
        """
        Ask a question about a specific book (synchronous).

        Args:
            book_id: The book/asignatura slug
            question: User's question

        Returns:
            RAGResponse with answer and sources
        """
        # Check collection exists
        if not self.qdrant.collection_exists(book_id):
            raise ValueError(f"Book '{book_id}' not found")

        # Generate query embedding
        query_embedding = self.llm.embed([question])[0]

        # Retrieve relevant chunks
        results = self.qdrant.search(
            book_id=book_id,
            query_vector=query_embedding,
            limit=self.retriever_k * 3,  # Over-fetch for filtering
            score_threshold=self.min_relevance,
        )

        # Keep top k results
        results = results[: self.retriever_k]

        if not results:
            return RAGResponse(
                answer="No encuentro información relevante en este libro para responder tu pregunta.",
                sources=[],
                book_id=book_id,
                model_used=self.llm.model,
            )

        # Build context and sources
        context, sources = self._build_context(results)

        # Generate answer
        system_prompt = SYSTEM_PROMPT.format(context=context)
        answer = self.llm.generate(question, system_prompt=system_prompt)

        return RAGResponse(
            answer=answer,
            sources=sources,
            book_id=book_id,
            model_used=self.llm.model,
        )

    async def aask(self, book_id: str, question: str) -> RAGResponse:
        """Ask a question asynchronously."""
        if not self.qdrant.collection_exists(book_id):
            raise ValueError(f"Book '{book_id}' not found")

        # Generate query embedding
        query_embedding = (await self.llm.aembed([question]))[0]

        # Retrieve relevant chunks
        results = self.qdrant.search(
            book_id=book_id,
            query_vector=query_embedding,
            limit=self.retriever_k * 3,
            score_threshold=self.min_relevance,
        )
        results = results[: self.retriever_k]

        if not results:
            return RAGResponse(
                answer="No encuentro información relevante en este libro para responder tu pregunta.",
                sources=[],
                book_id=book_id,
                model_used=self.llm.model,
            )

        context, sources = self._build_context(results)
        system_prompt = SYSTEM_PROMPT.format(context=context)
        answer = await self.llm.agenerate(question, system_prompt=system_prompt)

        return RAGResponse(
            answer=answer,
            sources=sources,
            book_id=book_id,
            model_used=self.llm.model,
        )

    async def astream(
        self, book_id: str, question: str
    ) -> tuple[AsyncIterator[str], list[Source]]:
        """
        Stream answer tokens asynchronously.

        Returns:
            Tuple of (token iterator, sources list)
        """
        if not self.qdrant.collection_exists(book_id):
            raise ValueError(f"Book '{book_id}' not found")

        query_embedding = (await self.llm.aembed([question]))[0]

        results = self.qdrant.search(
            book_id=book_id,
            query_vector=query_embedding,
            limit=self.retriever_k * 3,
            score_threshold=self.min_relevance,
        )
        results = results[: self.retriever_k]

        if not results:
            async def empty_stream():
                yield "No encuentro información relevante en este libro para responder tu pregunta."
            return empty_stream(), []

        context, sources = self._build_context(results)
        system_prompt = SYSTEM_PROMPT.format(context=context)

        return self.llm.astream(question, system_prompt=system_prompt), sources


# Default service instance
rag_service = RAGService()
