import secrets
from collections.abc import AsyncGenerator

from fastapi import Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from dt_db.session import create_async_session_factory


def verify_auth(x_auth_password: str | None = Header(default=None)) -> None:
    if not settings.AUTH_PASSWORD:
        return
    if not x_auth_password or not secrets.compare_digest(
        x_auth_password, settings.AUTH_PASSWORD
    ):
        raise HTTPException(status_code=401, detail="Invalid password")


async_session = create_async_session_factory(
    settings.DATABASE_URL_ASYNC, pool_size=30, max_overflow=10
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session
