import asyncio
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from logger import get_logger
from scraper import extract_replay_id, scrape_replay, settings as scraper_settings

from cron.db import seed_replay

logger = get_logger(__name__)


async def process_replay(
    session_factory: async_sessionmaker[AsyncSession],
    url: str,
) -> bool:
    duelingbook_id = str(extract_replay_id(url))
    replay_id = extract_replay_id(url)

    logger.info("processing_replay", duelingbook_id=duelingbook_id, url=url)

    try:
        raw_json: dict[str, Any] = await asyncio.to_thread(
            scrape_replay,
            url,
            replay_id,
            scraper_settings.CAPSOLVER_API_KEY,
            scraper_settings.SITE_KEY,
            30.0,
            scraper_settings.auth_cookies,
        )

        await seed_replay(session_factory, duelingbook_id, raw_json)
        logger.info("replay_seeded", duelingbook_id=duelingbook_id)
        return True

    except Exception as e:
        logger.error("replay_failed", duelingbook_id=duelingbook_id, error=str(e))
        return False
