from fastapi import APIRouter

from app.api.health.routes import router as health_router

public_router = APIRouter()

public_router.include_router(health_router, prefix="/health", tags=["health"])
