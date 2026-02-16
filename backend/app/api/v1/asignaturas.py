"""
Asignaturas (subjects/books) endpoints.
Public access - no authentication required.
Subjects are auto-detected from docs/ folder structure.
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.core.config import settings
from app.services.ingest_service import ingest_service

router = APIRouter()


class AsignaturaResponse(BaseModel):
    slug: str
    name: str
    icon: str
    status: str
    chunks_count: int


class AsignaturaDetail(AsignaturaResponse):
    documents: list[str]


def _get_docs_for_asignatura(slug: str) -> list[str]:
    """Get list of markdown files for an asignatura."""
    docs_dir = settings.docs_path / slug
    if not docs_dir.exists():
        return []
    return sorted([f.name for f in docs_dir.glob("*.md")])


def _generate_icon(slug: str) -> str:
    """Generate an icon based on the subject slug."""
    icons = {
        "matematicas": "📐",
        "fisica": "⚛️",
        "quimica": "🧪",
        "biologia": "🧬",
        "historia": "📜",
        "lengua": "📝",
        "ingles": "🇬🇧",
        "informatica": "💻",
        "economia": "📊",
        "filosofia": "🤔",
        "arte": "🎨",
        "musica": "🎵",
    }
    slug_lower = slug.lower()
    for key, icon in icons.items():
        if key in slug_lower:
            return icon
    return "📚"


@router.get("", response_model=list[AsignaturaResponse])
async def list_asignaturas():
    """List all available asignaturas."""
    result = []
    for slug in ingest_service.list_books():
        status_info = ingest_service.get_book_status(slug)
        result.append(
            AsignaturaResponse(
                slug=slug,
                name=slug.replace("-", " ").replace("_", " ").title(),
                icon=_generate_icon(slug),
                status=status_info["status"],
                chunks_count=status_info["chunks_count"],
            )
        )
    return result


@router.get("/{slug}", response_model=AsignaturaDetail)
async def get_asignatura(slug: str):
    """Get details of a specific asignatura."""
    if not ingest_service.qdrant.collection_exists(slug):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asignatura '{slug}' not found",
        )

    status_info = ingest_service.get_book_status(slug)
    documents = _get_docs_for_asignatura(slug)

    return AsignaturaDetail(
        slug=slug,
        name=slug.replace("-", " ").replace("_", " ").title(),
        icon=_generate_icon(slug),
        status=status_info["status"],
        chunks_count=status_info["chunks_count"],
        documents=documents,
    )


@router.get("/{slug}/documents/{filename}")
async def get_document_content(slug: str, filename: str):
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
