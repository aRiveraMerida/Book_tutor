"""
Auto-ingest service for automatic RAG initialization.
Scans docs/ directory and creates RAG collections for each subject folder.
"""
import logging
from pathlib import Path

from app.core.config import settings
from app.services.ingest_service import ingest_service, IngestStatus

logger = logging.getLogger(__name__)


def scan_and_ingest_subjects() -> dict[str, dict]:
    """
    Scan the docs directory and ingest all subject folders.
    
    Each subfolder in docs/ represents a subject (asignatura).
    If the folder contains .md files, a RAG collection is created.
    
    Returns:
        Dictionary with subject slugs as keys and status info as values.
    """
    docs_path = settings.docs_path
    results = {}
    
    if not docs_path.exists():
        logger.warning(f"Docs directory does not exist: {docs_path}")
        docs_path.mkdir(parents=True, exist_ok=True)
        return results
    
    # Find all subdirectories with .md files
    for subject_dir in docs_path.iterdir():
        if not subject_dir.is_dir():
            continue
        
        # Skip hidden directories
        if subject_dir.name.startswith('.'):
            continue
        
        # Check if directory contains .md files
        md_files = list(subject_dir.glob("*.md"))
        if not md_files:
            logger.info(f"Skipping {subject_dir.name}: no .md files found")
            continue
        
        slug = subject_dir.name
        logger.info(f"Found subject: {slug} ({len(md_files)} .md files)")
        
        # Check if already ingested
        if ingest_service.qdrant.collection_exists(slug):
            status = ingest_service.get_book_status(slug)
            logger.info(f"Subject {slug} already ingested: {status['chunks_count']} chunks")
            results[slug] = {
                "status": "existing",
                "chunks_count": status["chunks_count"],
                "files_count": len(md_files),
            }
            continue
        
        # Ingest the subject
        logger.info(f"Ingesting subject: {slug}")
        result = ingest_service.ingest_book(slug, subject_dir)
        
        results[slug] = {
            "status": result.status.value,
            "chunks_count": result.chunks_count,
            "files_count": result.files_processed,
            "error": result.error,
        }
        
        if result.status == IngestStatus.READY:
            logger.info(f"Successfully ingested {slug}: {result.chunks_count} chunks")
        else:
            logger.error(f"Failed to ingest {slug}: {result.error}")
    
    return results


def get_available_subjects() -> list[dict]:
    """
    Get list of available subjects from docs directory.
    
    Returns:
        List of subject info dictionaries with slug, name, file_count.
    """
    docs_path = settings.docs_path
    subjects = []
    
    if not docs_path.exists():
        return subjects
    
    for subject_dir in sorted(docs_path.iterdir()):
        if not subject_dir.is_dir() or subject_dir.name.startswith('.'):
            continue
        
        md_files = list(subject_dir.glob("*.md"))
        if not md_files:
            continue
        
        # Generate display name from slug
        name = subject_dir.name.replace("-", " ").replace("_", " ").title()
        
        subjects.append({
            "slug": subject_dir.name,
            "name": name,
            "file_count": len(md_files),
        })
    
    return subjects
