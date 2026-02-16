"""
Ingestion script for RAG_QWEN.

Usage:
    python scripts/ingest.py --book-id prompting-avanzado
    python scripts/ingest.py --all
    python scripts/ingest.py --book-id prompting-avanzado --force
    python scripts/ingest.py --list
"""
import argparse
import sys
import time
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from config.settings import settings
from app.utils.markdown_loader import load_and_chunk_book
from app.rag.vectorstore import (
    collection_exists,
    create_vectorstore_from_documents,
    delete_collection,
    list_collections,
)


def ingest_book(book_id: str, force: bool = False) -> None:
    """Ingest a single book into ChromaDB."""
    print(f"\n{'='*50}")
    print(f"Ingesting: {book_id}")
    print(f"{'='*50}")

    if collection_exists(book_id):
        if force:
            print(f"  [FORCE] Deleting existing collection: {book_id}")
            delete_collection(book_id)
        else:
            print(f"  [SKIP] Collection already exists. Use --force to re-ingest.")
            return

    start = time.time()

    # Load and chunk
    book_dir = settings.docs_path / book_id
    md_files = list(book_dir.glob("*.md"))
    print(f"  Loading {len(md_files)} .md file(s) from: {book_dir}")
    chunks = load_and_chunk_book(book_id)
    print(f"  Chunks generated: {len(chunks)}")

    # Embed and store
    print(f"  Generating embeddings and storing in ChromaDB...")
    create_vectorstore_from_documents(book_id, chunks)

    elapsed = time.time() - start
    print(f"  Done in {elapsed:.1f}s")
    print(f"  Collection: {book_id} ({len(chunks)} chunks)")


def main():
    parser = argparse.ArgumentParser(description="Ingest books into RAG system")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--book-id", type=str, help="Ingest a specific book")
    group.add_argument("--all", action="store_true", help="Ingest all books in docs/")
    group.add_argument("--list", action="store_true", help="List existing collections")
    parser.add_argument("--force", action="store_true", help="Force re-ingestion")

    args = parser.parse_args()

    if args.list:
        collections = list_collections()
        print(f"Existing collections ({len(collections)}):")
        for name in collections:
            print(f"  - {name}")
        return

    if args.book_id:
        ingest_book(args.book_id, force=args.force)
    elif args.all:
        book_dirs = sorted(
            d.name
            for d in settings.docs_path.iterdir()
            if d.is_dir() and not d.name.startswith(".")
        )
        if not book_dirs:
            print(f"No book directories found in {settings.docs_path}")
            return
        print(f"Found {len(book_dirs)} book(s): {', '.join(book_dirs)}")
        for book_id in book_dirs:
            ingest_book(book_id, force=args.force)


if __name__ == "__main__":
    main()
