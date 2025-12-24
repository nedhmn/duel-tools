import argparse
import asyncio

import aiometer
import httpx

from db.session import create_async_session_factory
from logger import get_logger, setup_logging
from scraper import extract_replay_id

from cron.config import settings
from cron.db import get_existing_ids
from cron.pipeline import process_replay
from cron.sources.formatlibrary import (
    fetch_all_events,
    fetch_events,
    fetch_event_replays,
)

setup_logging()
logger = get_logger(__name__)


async def main(fetch_all: bool = False) -> None:
    session_factory = create_async_session_factory(
        settings.DATABASE_URL_ASYNC,
        pool_size=settings.SYNC_CONCURRENCY,
        max_overflow=5,
    )

    existing_ids = await get_existing_ids(session_factory)
    logger.info("existing_replays", count=len(existing_ids))

    async with httpx.AsyncClient(timeout=30.0) as client:
        if fetch_all:
            logger.info("mode", mode="backfill (all pages)")
            events = await fetch_all_events(client)
        else:
            logger.info("mode", mode="daily (page 1 only)")
            events = await fetch_events(client, page=1, limit=100)

        logger.info("events_fetched", count=len(events))

        all_urls: list[str] = []

        async def fetch_replays_for_event(event: dict) -> None:
            abbr = event["abbreviation"]
            replays = await fetch_event_replays(client, abbr, settings.FL_TOKEN)
            urls = [
                r["url"]
                for r in replays
                if r.get("url") and "duelingbook.com" in r["url"]
            ]
            all_urls.extend(urls)
            logger.info("event_replays", abbreviation=abbr, count=len(urls))

        await aiometer.run_on_each(
            fetch_replays_for_event,
            events,
            max_at_once=settings.SYNC_CONCURRENCY,
        )

    new_urls = []
    for url in all_urls:
        try:
            replay_id = extract_replay_id(url)
            if str(replay_id) not in existing_ids:
                new_urls.append(url)
        except Exception:
            logger.warning("skipping_invalid_url", url=url)
            continue
    logger.info("new_replays", total=len(all_urls), new=len(new_urls))

    if not new_urls:
        print("No new replays to process")
        return

    success = 0
    failed = 0

    async def process(url: str) -> None:
        nonlocal success, failed
        if await process_replay(session_factory, url):
            success += 1
        else:
            failed += 1

    await aiometer.run_on_each(
        process,
        new_urls,
        max_at_once=settings.SYNC_CONCURRENCY,
    )

    print(f"Processed {success} replays, {failed} failed")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sync replays from FormatLibrary")
    parser.add_argument(
        "--all",
        action="store_true",
        help="Fetch all events (backfill). Default: page 1 only (daily).",
    )
    args = parser.parse_args()

    asyncio.run(main(fetch_all=args.all))
