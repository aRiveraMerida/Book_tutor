import re
from pathlib import Path

from langchain_core.documents import Document
from langchain_text_splitters import (
    MarkdownHeaderTextSplitter,
    RecursiveCharacterTextSplitter,
)

from config.settings import settings

_BOLD_HEADER_RE = re.compile(r"^(#{1,6})\s+\*\*(.+?)\*\*\s*$", re.MULTILINE)


def _clean_notion_headers(content: str) -> str:
    """Strip **bold** markers from markdown headers (common in Notion exports)."""
    return _BOLD_HEADER_RE.sub(r"\1 \2", content)


def load_and_chunk_book(book_id: str) -> list[Document]:
    """Load all .md files for a book and return chunked Documents with metadata."""
    book_dir = settings.docs_path / book_id

    if not book_dir.exists():
        raise FileNotFoundError(f"Book directory not found: {book_dir}")

    md_files = sorted(book_dir.glob("*.md"))
    if not md_files:
        raise FileNotFoundError(f"No .md files found in: {book_dir}")

    # Step 1: Header-based semantic splitter
    headers_to_split_on = [
        ("#", "titulo"),
        ("##", "seccion"),
        ("###", "subseccion"),
    ]
    md_splitter = MarkdownHeaderTextSplitter(
        headers_to_split_on=headers_to_split_on,
        strip_headers=False,
    )

    # Step 2: Character-based safety net for large chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap,
        separators=["\n\n", "\n", ". ", " "],
    )

    all_chunks: list[Document] = []

    for md_file in md_files:
        content = md_file.read_text(encoding="utf-8")
        content = _clean_notion_headers(content)

        # Split by markdown headers
        header_splits = md_splitter.split_text(content)

        # Further split by character size
        final_splits = text_splitter.split_documents(header_splits)

        # Enrich metadata
        for doc in final_splits:
            doc.metadata["book_id"] = book_id
            doc.metadata["source"] = md_file.name

        all_chunks.extend(final_splits)

    return all_chunks
