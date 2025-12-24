from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import Session, sessionmaker


def create_async_session_factory(
    database_url: str,
    pool_size: int = 5,
    max_overflow: int = 10,
) -> async_sessionmaker[AsyncSession]:
    engine = create_async_engine(
        database_url,
        echo=False,
        pool_size=pool_size,
        max_overflow=max_overflow,
    )
    return async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


def create_sync_session_factory(
    database_url: str,
    pool_size: int = 5,
    max_overflow: int = 10,
) -> sessionmaker[Session]:
    engine = create_engine(
        database_url,
        echo=False,
        pool_size=pool_size,
        max_overflow=max_overflow,
    )
    return sessionmaker(engine, class_=Session, expire_on_commit=False)
