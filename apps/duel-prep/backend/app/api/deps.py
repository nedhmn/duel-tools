from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from db.session import create_async_session_factory

from app.core.config import settings

async_session = create_async_session_factory(
    settings.DATABASE_URL_ASYNC, pool_size=30, max_overflow=10
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session
