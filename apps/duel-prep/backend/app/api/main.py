from fastapi import APIRouter

from app.api.health.routes import router as health_router
from app.api.players.routes import router as players_router
from app.api.replays.routes import router as replays_router
from app.api.scrape.routes import router as scrape_router

public_router = APIRouter()

public_router.include_router(health_router, prefix="/health", tags=["health"])
public_router.include_router(scrape_router, prefix="/scrape", tags=["scrape"])
public_router.include_router(replays_router, prefix="/replays", tags=["replays"])
public_router.include_router(players_router, prefix="/players", tags=["players"])
