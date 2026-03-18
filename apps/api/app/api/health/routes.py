from fastapi import APIRouter

from app.core.config import settings

router = APIRouter()


@router.get("")
async def health() -> dict[str, str | bool]:
    return {"status": "ok", "auth_required": settings.AUTH_PASSWORD is not None}
