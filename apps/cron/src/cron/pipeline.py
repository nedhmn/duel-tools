import asyncio
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from logger import get_logger
from scraper import extract_replay_id, scrape_replay

from cron.config import settings

from cron.db import seed_replay

logger = get_logger(__name__)


async def process_replay(
    session_factory: async_sessionmaker[AsyncSession],
    url: str,
) -> bool:
    replay_id = extract_replay_id(url)
    duelingbook_id = str(replay_id)

    logger.info("processing_replay", duelingbook_id=duelingbook_id, url=url)

    try:
        raw_json: dict[str, Any] = await asyncio.to_thread(
            scrape_replay,
            url,
            replay_id,
            api_key=settings.CAPSOLVER_API_KEY,
            site_key=settings.TURNSTILE_SITE_KEY,
            timeout=30.0,
            auth_cookies=settings.auth_cookies,
        )

        await seed_replay(session_factory, duelingbook_id, raw_json)
        logger.info("replay_seeded", duelingbook_id=duelingbook_id)
        return True

    except Exception as e:
        logger.error("replay_failed", duelingbook_id=duelingbook_id, error=str(e))
        return False
