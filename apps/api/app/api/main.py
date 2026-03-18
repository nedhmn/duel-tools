from fastapi import APIRouter, Depends

from app.api.auth.routes import router as auth_router
from app.api.batches.routes import router as batches_router
from app.api.deps import verify_auth
from app.api.health.routes import router as health_router
from app.api.players.routes import router as players_router
from app.api.replays.routes import router as replays_router
from app.api.scrape.routes import router as scrape_router

public_router = APIRouter()
public_router.include_router(health_router, prefix="/health", tags=["health"])

protected_router = APIRouter(dependencies=[Depends(verify_auth)])
protected_router.include_router(auth_router, prefix="/auth", tags=["auth"])
protected_router.include_router(scrape_router, prefix="/scrape", tags=["scrape"])
protected_router.include_router(batches_router, prefix="/batches", tags=["batches"])
protected_router.include_router(replays_router, prefix="/replays", tags=["replays"])
protected_router.include_router(players_router, prefix="/players", tags=["players"])

public_router.include_router(protected_router)
