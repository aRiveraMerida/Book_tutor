"""
CLI tool to test RAG queries without running the API server.

Usage:
    python scripts/test_query.py --book-id test-book --question "Que es el prompting?"
"""
import argparse
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.rag.chain import ask_question
from app.rag.vectorstore import collection_exists


def main():
    parser = argparse.ArgumentParser(description="Test RAG queries from CLI")
    parser.add_argument("--book-id", required=True, help="Book collection to query")
    parser.add_argument("--question", "-q", required=True, help="Question to ask")

    args = parser.parse_args()

    if not collection_exists(args.book_id):
        print(f"Error: Collection '{args.book_id}' not found.")
        print("Run: python scripts/ingest.py --list")
        sys.exit(1)

    print(f"Book: {args.book_id}")
    print(f"Question: {args.question}")
    print("-" * 50)

    start = time.time()
    result = ask_question(args.book_id, args.question)
    elapsed = time.time() - start

    print(f"\nAnswer:\n{result['answer']}")
    print(f"\nSources:")
    for src in result["sources"]:
        parts = [f"  - {src['source']}"]
        if src.get("seccion"):
            parts.append(f"Seccion: {src['seccion']}")
        if src.get("subseccion"):
            parts.append(f"Subseccion: {src['subseccion']}")
        print(" | ".join(parts))

    print(f"\n[{elapsed:.1f}s]")


if __name__ == "__main__":
    main()
