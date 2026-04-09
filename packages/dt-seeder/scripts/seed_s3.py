import asyncio

import aioboto3
import aiometer

from dt_db.session import create_async_session_factory
from dt_logger import get_logger, setup_logging
from dt_seeder.config import settings
from dt_seeder.db import get_existing_ids, seed_replay
from dt_seeder.loaders.s3 import download_replay, extract_replay_id, list_keys

logger = get_logger(__name__)


async def main() -> None:
    setup_logging()
    session_factory = create_async_session_factory(settings.DATABASE_URL_ASYNC)

    session = aioboto3.Session(
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )
    async with session.client("s3") as s3:
        logger.info(
            "listing_keys", bucket=settings.S3_BUCKET, prefix=settings.S3_PREFIX
        )
        all_keys = await list_keys(s3, settings.S3_BUCKET, settings.S3_PREFIX)
        logger.info("found_keys", count=len(all_keys))

        existing_ids = await get_existing_ids(session_factory)
        logger.info("existing_replays", count=len(existing_ids))

        new_keys = [k for k in all_keys if extract_replay_id(k) not in existing_ids]
        logger.info("new_replays", count=len(new_keys))

        if not new_keys:
            logger.info("no_new_replays")
            return

        seeded = 0
        failed = 0

        async def process(key: str) -> None:
            nonlocal seeded, failed
            duelingbook_id = extract_replay_id(key)
            try:
                raw_json = await download_replay(s3, settings.S3_BUCKET, key)
                await seed_replay(session_factory, duelingbook_id, raw_json)
                seeded += 1
                logger.info("seeded", duelingbook_id=duelingbook_id)
            except Exception as e:
                failed += 1
                logger.error("seed_failed", duelingbook_id=duelingbook_id, error=str(e))

        await aiometer.run_on_each(
            process,
            new_keys,
            max_at_once=settings.S3_CONCURRENCY,
        )

        logger.info("seed_completed", seeded=seeded, failed=failed)


if __name__ == "__main__":
    asyncio.run(main())
