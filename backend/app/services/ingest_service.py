"""
Ingest service for processing documents and creating RAG collections.
Handles markdown parsing, chunking, embedding, and vector storage.
"""
import logging
import re
from dataclasses import dataclass
from enum import Enum
from pathlib import Path

from app.core.config import settings
from app.db.qdrant import QdrantService, qdrant_service
from app.llm.base import LLMProvider, get_default_provider

logger = logging.getLogger(__name__)

# Regex to strip bold markers from Notion-exported headers
BOLD_HEADER_RE = re.compile(r"^(#{1,6})\s+\*\*(.+?)\*\*\s*$", re.MULTILINE)


class IngestStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    READY = "ready"
    ERROR = "error"


@dataclass
class ChunkMetadata:
    """Metadata for a document chunk."""
    content: str
    source_file: str
    titulo: str | None = None
    seccion: str | None = None
    subseccion: str | None = None


@dataclass
class IngestResult:
    """Result of an ingestion job."""
    book_id: str
    status: IngestStatus
    chunks_count: int
    files_processed: int
    error: str | None = None


class IngestService:
    """Service for document ingestion into RAG system."""

    def __init__(
        self,
        qdrant: QdrantService | None = None,
        llm: LLMProvider | None = None,
    ):
        self.qdrant = qdrant or qdrant_service
        self.llm = llm or get_default_provider()
        self.chunk_size = settings.chunk_size
        self.chunk_overlap = settings.chunk_overlap

    def _clean_notion_headers(self, content: str) -> str:
        """Strip **bold** markers from markdown headers."""
        return BOLD_HEADER_RE.sub(r"\1 \2", content)

    def _extract_header_metadata(self, text: str) -> dict[str, str | None]:
        """Extract title, section, subsection from markdown headers."""
        metadata = {"titulo": None, "seccion": None, "subseccion": None}

        lines = text.split("\n")
        for line in lines:
            line = line.strip()
            if line.startswith("# ") and not metadata["titulo"]:
                metadata["titulo"] = line[2:].strip()
            elif line.startswith("## ") and not metadata["seccion"]:
                metadata["seccion"] = line[3:].strip()
            elif line.startswith("### ") and not metadata["subseccion"]:
                metadata["subseccion"] = line[4:].strip()

        return metadata

    def _chunk_markdown(self, content: str, source_file: str) -> list[ChunkMetadata]:
        """
        Chunk markdown content into smaller pieces.

        Strategy:
        1. Split by headers (semantic boundaries)
        2. Further split large chunks by paragraphs
        3. Apply size limits with overlap
        """
        content = self._clean_notion_headers(content)
        chunks = []

        # Split by ## headers first (sections)
        sections = re.split(r"(?=^## )", content, flags=re.MULTILINE)

        for section in sections:
            if not section.strip():
                continue

            metadata = self._extract_header_metadata(section)

            # If section is small enough, keep as one chunk
            if len(section) <= self.chunk_size:
                chunks.append(
                    ChunkMetadata(
                        content=section.strip(),
                        source_file=source_file,
                        **metadata,
                    )
                )
            else:
                # Split large sections by paragraphs
                paragraphs = section.split("\n\n")
                current_chunk = ""

                for para in paragraphs:
                    if len(current_chunk) + len(para) <= self.chunk_size:
                        current_chunk += para + "\n\n"
                    else:
                        if current_chunk.strip():
                            chunks.append(
                                ChunkMetadata(
                                    content=current_chunk.strip(),
                                    source_file=source_file,
                                    **metadata,
                                )
                            )
                        current_chunk = para + "\n\n"

                if current_chunk.strip():
                    chunks.append(
                        ChunkMetadata(
                            content=current_chunk.strip(),
                            source_file=source_file,
                            **metadata,
                        )
                    )

        return chunks

    def _load_markdown_files(self, book_dir: Path) -> list[tuple[str, str]]:
        """Load all markdown files from a directory."""
        files = []
        for md_file in sorted(book_dir.glob("*.md")):
            content = md_file.read_text(encoding="utf-8")
            files.append((md_file.name, content))
        return files

    def ingest_book(
        self,
        book_id: str,
        book_dir: Path | None = None,
        force: bool = False,
    ) -> IngestResult:
        """
        Ingest a book into the RAG system.

        Args:
            book_id: Unique identifier for the book
            book_dir: Directory containing markdown files (defaults to docs/{book_id})
            force: If True, delete existing collection and re-ingest

        Returns:
            IngestResult with status and statistics
        """
        if book_dir is None:
            book_dir = settings.docs_path / book_id

        logger.info(f"Starting ingestion for book: {book_id}")

        # Validate directory
        if not book_dir.exists():
            return IngestResult(
                book_id=book_id,
                status=IngestStatus.ERROR,
                chunks_count=0,
                files_processed=0,
                error=f"Directory not found: {book_dir}",
            )

        # Handle existing collection
        if self.qdrant.collection_exists(book_id):
            if force:
                logger.info(f"Force flag set, deleting existing collection: {book_id}")
                self.qdrant.delete_collection(book_id)
            else:
                return IngestResult(
                    book_id=book_id,
                    status=IngestStatus.READY,
                    chunks_count=self.qdrant.count_chunks(book_id),
                    files_processed=0,
                    error="Collection already exists. Use force=True to re-ingest.",
                )

        try:
            # Load markdown files
            files = self._load_markdown_files(book_dir)
            if not files:
                return IngestResult(
                    book_id=book_id,
                    status=IngestStatus.ERROR,
                    chunks_count=0,
                    files_processed=0,
                    error=f"No .md files found in {book_dir}",
                )

            logger.info(f"Found {len(files)} markdown files")

            # Chunk all files
            all_chunks: list[ChunkMetadata] = []
            for filename, content in files:
                chunks = self._chunk_markdown(content, filename)
                all_chunks.extend(chunks)

            logger.info(f"Generated {len(all_chunks)} chunks")

            if not all_chunks:
                return IngestResult(
                    book_id=book_id,
                    status=IngestStatus.ERROR,
                    chunks_count=0,
                    files_processed=len(files),
                    error="No chunks generated from files",
                )

            # Generate embeddings
            logger.info("Generating embeddings...")
            texts = [chunk.content for chunk in all_chunks]
            embeddings = self.llm.embed(texts)

            # Create collection and insert
            logger.info("Creating Qdrant collection and inserting chunks...")
            self.qdrant.create_collection(book_id)

            chunk_dicts = [
                {
                    "content": c.content,
                    "source_file": c.source_file,
                    "titulo": c.titulo,
                    "seccion": c.seccion,
                    "subseccion": c.subseccion,
                }
                for c in all_chunks
            ]

            inserted = self.qdrant.insert_chunks(book_id, chunk_dicts, embeddings)

            logger.info(f"Ingestion complete: {inserted} chunks inserted")

            return IngestResult(
                book_id=book_id,
                status=IngestStatus.READY,
                chunks_count=inserted,
                files_processed=len(files),
            )

        except Exception as e:
            logger.exception(f"Ingestion failed for {book_id}")
            # Cleanup on failure
            if self.qdrant.collection_exists(book_id):
                self.qdrant.delete_collection(book_id)

            return IngestResult(
                book_id=book_id,
                status=IngestStatus.ERROR,
                chunks_count=0,
                files_processed=0,
                error=str(e),
            )

    def delete_book(self, book_id: str) -> bool:
        """Delete a book's collection."""
        return self.qdrant.delete_collection(book_id)

    def get_book_status(self, book_id: str) -> dict:
        """Get the status of a book's collection."""
        info = self.qdrant.get_collection_info(book_id)
        if info:
            return {
                "book_id": book_id,
                "status": IngestStatus.READY.value,
                "chunks_count": info["points_count"],
            }
        return {
            "book_id": book_id,
            "status": IngestStatus.PENDING.value,
            "chunks_count": 0,
        }

    def list_books(self) -> list[str]:
        """List all ingested books."""
        return self.qdrant.list_collections()


# Default service instance
ingest_service = IngestService()
