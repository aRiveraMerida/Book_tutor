"""
Qdrant vector database client with CRUD operations.
Replaces ChromaDB for production-ready vector storage.
"""
import logging
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.exceptions import UnexpectedResponse

from app.core.config import settings

logger = logging.getLogger(__name__)


def get_qdrant_client() -> QdrantClient:
    """Create Qdrant client with optional API key for cloud."""
    return QdrantClient(
        url=settings.qdrant_url,
        api_key=settings.qdrant_api_key,
        timeout=30,
    )


# Singleton client
qdrant_client = get_qdrant_client()


class QdrantService:
    """Service class for Qdrant operations."""

    def __init__(self, client: QdrantClient | None = None):
        self.client = client or qdrant_client
        self.collection_prefix = settings.qdrant_collection_prefix
        self.vector_size = settings.embedding_dimensions

    def _collection_name(self, book_id: str) -> str:
        """Get full collection name with prefix."""
        return f"{self.collection_prefix}{book_id}"

    def collection_exists(self, book_id: str) -> bool:
        """Check if a collection exists."""
        try:
            self.client.get_collection(self._collection_name(book_id))
            return True
        except UnexpectedResponse:
            return False

    def list_collections(self) -> list[str]:
        """List all book collections (without prefix)."""
        collections = self.client.get_collections().collections
        prefix = self.collection_prefix
        return [
            c.name[len(prefix):]
            for c in collections
            if c.name.startswith(prefix)
        ]

    def create_collection(self, book_id: str) -> bool:
        """Create a new collection for a book."""
        collection_name = self._collection_name(book_id)

        if self.collection_exists(book_id):
            logger.warning(f"Collection {collection_name} already exists")
            return False

        self.client.create_collection(
            collection_name=collection_name,
            vectors_config=models.VectorParams(
                size=self.vector_size,
                distance=models.Distance.COSINE,
            ),
            # Optimized for search
            optimizers_config=models.OptimizersConfigDiff(
                indexing_threshold=10000,
            ),
        )

        # Create payload indexes for filtering
        self.client.create_payload_index(
            collection_name=collection_name,
            field_name="book_id",
            field_schema=models.PayloadSchemaType.KEYWORD,
        )
        self.client.create_payload_index(
            collection_name=collection_name,
            field_name="source_file",
            field_schema=models.PayloadSchemaType.KEYWORD,
        )

        logger.info(f"Created collection: {collection_name}")
        return True

    def delete_collection(self, book_id: str) -> bool:
        """Delete a collection."""
        collection_name = self._collection_name(book_id)

        if not self.collection_exists(book_id):
            logger.warning(f"Collection {collection_name} does not exist")
            return False

        self.client.delete_collection(collection_name)
        logger.info(f"Deleted collection: {collection_name}")
        return True

    def insert_chunks(
        self,
        book_id: str,
        chunks: list[dict[str, Any]],
        embeddings: list[list[float]],
    ) -> int:
        """
        Insert document chunks with their embeddings.

        Args:
            book_id: The book identifier
            chunks: List of dicts with keys: content, source_file, titulo, seccion, subseccion
            embeddings: Corresponding embedding vectors

        Returns:
            Number of points inserted
        """
        if len(chunks) != len(embeddings):
            raise ValueError("Chunks and embeddings must have same length")

        collection_name = self._collection_name(book_id)
        now = datetime.now(timezone.utc).isoformat()

        points = []
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            point_id = str(uuid4())
            payload = {
                "book_id": book_id,
                "chunk_index": i,
                "content": chunk["content"],
                "source_file": chunk.get("source_file", "unknown"),
                "titulo": chunk.get("titulo"),
                "seccion": chunk.get("seccion"),
                "subseccion": chunk.get("subseccion"),
                "created_at": now,
            }
            points.append(
                models.PointStruct(
                    id=point_id,
                    vector=embedding,
                    payload=payload,
                )
            )

        # Batch upsert
        self.client.upsert(
            collection_name=collection_name,
            points=points,
            wait=True,
        )

        logger.info(f"Inserted {len(points)} chunks into {collection_name}")
        return len(points)

    def search(
        self,
        book_id: str,
        query_vector: list[float],
        limit: int = 6,
        score_threshold: float | None = None,
    ) -> list[dict[str, Any]]:
        """
        Search for similar chunks.

        Args:
            book_id: The book to search in
            query_vector: The query embedding
            limit: Maximum results to return
            score_threshold: Minimum similarity score (0-1)

        Returns:
            List of results with score and payload
        """
        collection_name = self._collection_name(book_id)

        results = self.client.search(
            collection_name=collection_name,
            query_vector=query_vector,
            limit=limit,
            score_threshold=score_threshold,
            with_payload=True,
        )

        return [
            {
                "id": str(r.id),
                "score": r.score,
                "content": r.payload.get("content", ""),
                "source_file": r.payload.get("source_file"),
                "titulo": r.payload.get("titulo"),
                "seccion": r.payload.get("seccion"),
                "subseccion": r.payload.get("subseccion"),
                "chunk_index": r.payload.get("chunk_index"),
            }
            for r in results
        ]

    def get_collection_info(self, book_id: str) -> dict[str, Any] | None:
        """Get collection statistics."""
        if not self.collection_exists(book_id):
            return None

        collection_name = self._collection_name(book_id)
        info = self.client.get_collection(collection_name)

        return {
            "book_id": book_id,
            "points_count": info.points_count,
            "vectors_count": info.vectors_count,
            "status": info.status.value,
        }

    def count_chunks(self, book_id: str) -> int:
        """Get the number of chunks in a collection."""
        info = self.get_collection_info(book_id)
        return info["points_count"] if info else 0


# Default service instance
qdrant_service = QdrantService()
