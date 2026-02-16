"""
Asignaturas (subjects/books) endpoints.
- GET endpoints: accessible by all authenticated users
- POST/DELETE endpoints: admin only
"""
import shutil
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel

from app.core.config import settings
from app.core.security import RequireAdmin, RequireUser
from app.services.ingest_service import IngestStatus, ingest_service

router = APIRouter()


class AsignaturaBase(BaseModel):
    slug: str
    name: str
    icon: str = "📚"


class AsignaturaDetail(AsignaturaBase):
    status: str
    chunks_count: int
    documents: list[str]


class AsignaturaCreateRequest(BaseModel):
    name: str
    slug: str
    icon: str = "📚"


class AsignaturaResponse(BaseModel):
    slug: str
    name: str
    icon: str
    status: str
    chunks_count: int


class IngestStatusResponse(BaseModel):
    slug: str
    status: str
    chunks_count: int
    error: str | None = None


# In-memory metadata storage (replace with PostgreSQL in production)
ASIGNATURAS_METADATA: dict[str, dict] = {}


def _get_docs_for_asignatura(slug: str) -> list[str]:
    """Get list of markdown files for an asignatura."""
    docs_dir = settings.docs_path / slug
    if not docs_dir.exists():
        return []
    return sorted([f.name for f in docs_dir.glob("*.md")])


def _sync_metadata_with_qdrant():
    """Sync metadata with actual Qdrant collections."""
    collections = ingest_service.list_books()
    for slug in collections:
        if slug not in ASIGNATURAS_METADATA:
            # Auto-create metadata for existing collections
            ASIGNATURAS_METADATA[slug] = {
                "name": slug.replace("-", " ").title(),
                "icon": "📚",
            }


@router.get("", response_model=list[AsignaturaResponse])
async def list_asignaturas(current_user: RequireUser):
    """List all available asignaturas."""
    _sync_metadata_with_qdrant()

    result = []
    for slug in ingest_service.list_books():
        meta = ASIGNATURAS_METADATA.get(slug, {})
        status_info = ingest_service.get_book_status(slug)
        result.append(
            AsignaturaResponse(
                slug=slug,
                name=meta.get("name", slug),
                icon=meta.get("icon", "📚"),
                status=status_info["status"],
                chunks_count=status_info["chunks_count"],
            )
        )

    return result


@router.get("/{slug}", response_model=AsignaturaDetail)
async def get_asignatura(slug: str, current_user: RequireUser):
    """Get details of a specific asignatura."""
    if not ingest_service.qdrant.collection_exists(slug):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asignatura '{slug}' not found",
        )

    meta = ASIGNATURAS_METADATA.get(slug, {})
    status_info = ingest_service.get_book_status(slug)
    documents = _get_docs_for_asignatura(slug)

    return AsignaturaDetail(
        slug=slug,
        name=meta.get("name", slug),
        icon=meta.get("icon", "📚"),
        status=status_info["status"],
        chunks_count=status_info["chunks_count"],
        documents=documents,
    )


@router.post("", response_model=AsignaturaResponse, status_code=status.HTTP_201_CREATED)
async def create_asignatura(
    current_user: RequireAdmin,
    name: Annotated[str, Form()],
    slug: Annotated[str, Form()],
    icon: Annotated[str, Form()] = "📚",
    files: list[UploadFile] = File(...),
):
    """
    Create a new asignatura and upload markdown files.
    Admin only.

    1. Creates directory for the asignatura
    2. Saves uploaded markdown files
    3. Triggers RAG ingestion
    """
    # Validate slug
    if not slug.replace("-", "").replace("_", "").isalnum():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slug must contain only letters, numbers, hyphens, and underscores",
        )

    # Check if already exists
    if ingest_service.qdrant.collection_exists(slug):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Asignatura '{slug}' already exists",
        )

    # Create directory
    docs_dir = settings.docs_path / slug
    docs_dir.mkdir(parents=True, exist_ok=True)

    # Validate and save files
    saved_files = []
    try:
        for file in files:
            if not file.filename or not file.filename.endswith(".md"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Only .md files are allowed. Got: {file.filename}",
                )

            file_path = docs_dir / file.filename
            content = await file.read()
            file_path.write_bytes(content)
            saved_files.append(file.filename)

        if not saved_files:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one .md file is required",
            )

        # Store metadata
        ASIGNATURAS_METADATA[slug] = {"name": name, "icon": icon}

        # Trigger ingestion
        result = ingest_service.ingest_book(slug, docs_dir)

        if result.status == IngestStatus.ERROR:
            # Cleanup on failure
            shutil.rmtree(docs_dir, ignore_errors=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ingestion failed: {result.error}",
            )

        return AsignaturaResponse(
            slug=slug,
            name=name,
            icon=icon,
            status=result.status.value,
            chunks_count=result.chunks_count,
        )

    except HTTPException:
        raise
    except Exception as e:
        # Cleanup on any error
        shutil.rmtree(docs_dir, ignore_errors=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create asignatura: {str(e)}",
        )


@router.post("/{slug}/upload", response_model=IngestStatusResponse)
async def upload_files_to_asignatura(
    slug: str,
    current_user: RequireAdmin,
    files: list[UploadFile] = File(...),
    force: bool = False,
):
    """
    Upload additional markdown files to an existing asignatura.
    Admin only.

    If force=True, re-ingests all content.
    """
    docs_dir = settings.docs_path / slug

    if not docs_dir.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asignatura '{slug}' not found",
        )

    # Save new files
    for file in files:
        if not file.filename or not file.filename.endswith(".md"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only .md files are allowed. Got: {file.filename}",
            )

        file_path = docs_dir / file.filename
        content = await file.read()
        file_path.write_bytes(content)

    # Re-ingest
    result = ingest_service.ingest_book(slug, docs_dir, force=True)

    return IngestStatusResponse(
        slug=slug,
        status=result.status.value,
        chunks_count=result.chunks_count,
        error=result.error,
    )


@router.get("/{slug}/status", response_model=IngestStatusResponse)
async def get_ingest_status(slug: str, current_user: RequireAdmin):
    """Get ingestion status for an asignatura. Admin only."""
    status_info = ingest_service.get_book_status(slug)

    return IngestStatusResponse(
        slug=slug,
        status=status_info["status"],
        chunks_count=status_info["chunks_count"],
    )


@router.get("/{slug}/documents/{filename}")
async def get_document_content(slug: str, filename: str, current_user: RequireUser):
    """
    Get the content of a specific markdown document.
    """
    # Ensure filename ends with .md
    if not filename.endswith(".md"):
        filename = f"{filename}.md"

    file_path = settings.docs_path / slug / filename

    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document '{filename}' not found in asignatura '{slug}'",
        )

    content = file_path.read_text(encoding="utf-8")

    # Extract title from first line
    lines = content.split("\n")
    first_line = lines[0] if lines else ""
    title = first_line.lstrip("# ").strip() if first_line.startswith("#") else filename.replace(".md", "")

    return {
        "content": content,
        "title": title,
        "filename": filename,
        "slug": slug,
    }


@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_asignatura(slug: str, current_user: RequireAdmin):
    """
    Delete an asignatura and all its data.
    Admin only.
    """
    # Delete from Qdrant
    if ingest_service.qdrant.collection_exists(slug):
        ingest_service.delete_book(slug)

    # Delete files
    docs_dir = settings.docs_path / slug
    if docs_dir.exists():
        shutil.rmtree(docs_dir)

    # Remove metadata
    ASIGNATURAS_METADATA.pop(slug, None)

    return None
