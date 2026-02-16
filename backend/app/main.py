"""
BookTutor Backend - FastAPI Application.
Educational platform with RAG-based AI tutoring.
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import api_router
from app.core.config import settings
from app.services.auto_ingest import scan_and_ingest_subjects

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - runs on startup and shutdown."""
    # Startup: Auto-ingest subjects from docs/
    logger.info("Starting auto-ingest of subjects...")
    try:
        results = scan_and_ingest_subjects()
        if results:
            logger.info(f"Auto-ingest complete: {len(results)} subjects processed")
            for slug, info in results.items():
                logger.info(f"  - {slug}: {info['status']} ({info['chunks_count']} chunks)")
        else:
            logger.info("No subjects found in docs/ directory")
    except Exception as e:
        logger.error(f"Auto-ingest failed: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down BookTutor API")


app = FastAPI(
    title="BookTutor API",
    description="Educational platform with AI tutoring powered by RAG",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 router
app.include_router(api_router, prefix="/api/v1")


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - API info."""
    return {
        "name": "BookTutor API",
        "version": "2.0.0",
        "docs": "/docs",
    }
