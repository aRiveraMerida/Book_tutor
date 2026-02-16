"""
BookTutor Backend - FastAPI Application.
Educational platform with RAG-based AI tutoring.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import api_router
from app.core.config import settings

app = FastAPI(
    title="BookTutor API",
    description="Educational platform with AI tutoring powered by RAG",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
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
