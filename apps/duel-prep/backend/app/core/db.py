from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from db.session import create_session_factory

from app.core.config import settings

async_session = create_session_factory(settings.DATABASE_URL_ASYNC)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session
