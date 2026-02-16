"""
Chat endpoints for RAG-based Q&A.
Accessible by all authenticated users.
"""
import json
from typing import AsyncGenerator

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.core.security import RequireUser
from app.services.rag_service import rag_service

router = APIRouter()


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=1000)


class SourceResponse(BaseModel):
    source_file: str
    titulo: str | None
    seccion: str | None
    subseccion: str | None
    content: str
    score: float


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceResponse]
    book_id: str
    model_used: str


@router.post("/{slug}/ask", response_model=ChatResponse)
async def ask_question(slug: str, request: ChatRequest, current_user: RequireUser):
    """
    Ask a question about an asignatura's content.

    The RAG system will:
    1. Search for relevant content in the book
    2. Generate an answer based on the found content
    3. Return the answer with source citations
    """
    try:
        response = await rag_service.aask(slug, request.question)

        return ChatResponse(
            answer=response.answer,
            sources=[
                SourceResponse(
                    source_file=s.source_file,
                    titulo=s.titulo,
                    seccion=s.seccion,
                    subseccion=s.subseccion,
                    content=s.content,
                    score=s.score,
                )
                for s in response.sources
            ],
            book_id=response.book_id,
            model_used=response.model_used,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"RAG error: {str(e)}",
        )


@router.post("/{slug}/stream")
async def stream_answer(slug: str, request: ChatRequest, current_user: RequireUser):
    """
    Stream answer tokens for a question.

    Returns Server-Sent Events (SSE) with:
    - `token` events: incremental answer tokens
    - `sources` event: source references (sent first)
    - `done` event: completion signal
    """

    async def generate() -> AsyncGenerator[str, None]:
        try:
            stream, sources = await rag_service.astream(slug, request.question)

            # Send sources first
            sources_data = [
                {
                    "source_file": s.source_file,
                    "titulo": s.titulo,
                    "seccion": s.seccion,
                    "content": s.content[:200] + "..." if len(s.content) > 200 else s.content,
                    "score": s.score,
                }
                for s in sources
            ]
            yield f"event: sources\ndata: {json.dumps(sources_data)}\n\n"

            # Stream tokens
            async for token in stream:
                yield f"event: token\ndata: {json.dumps({'token': token})}\n\n"

            # Done
            yield f"event: done\ndata: {json.dumps({'status': 'complete'})}\n\n"

        except ValueError as e:
            yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"
        except Exception as e:
            yield f"event: error\ndata: {json.dumps({'error': f'Stream error: {str(e)}'})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
