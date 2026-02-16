"""
API v1 router - combines all endpoint routers.
"""
from fastapi import APIRouter

from app.api.v1 import asignaturas, chat, health

api_router = APIRouter()

# Include all routers
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(asignaturas.router, prefix="/asignaturas", tags=["Asignaturas"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
