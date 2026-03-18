from uuid import UUID

from sqlalchemy import select

from db.models import Job, JobStatus, Replay
from db.session import create_sync_session_factory
from logger import get_logger
from parser import parse_replay
from scraper import extract_replay_id, scrape_replay, settings as scraper_settings
from scraper.exceptions import CaptchaError, ScraperError

from app.core.config import settings
from app.worker.celery_app import celery_app
from app.worker.services import ensure_replay_parsed, extract_players

logger = get_logger(__name__)

sync_session = create_sync_session_factory(
    settings.DATABASE_URL, pool_size=40, max_overflow=10
)


@celery_app.task(
    bind=True,
    autoretry_for=(CaptchaError, ScraperError),
    retry_kwargs={"max_retries": 3, "countdown": 5},
)
def scrape_replay_task(self, job_id_str: str, url: str) -> None:
    job_id = UUID(job_id_str)
    logger.info("scrape_task_started", job_id=str(job_id), url=url)

    with sync_session() as session:
        job = session.get(Job, job_id)
        if not job:
            logger.error("job_not_found", job_id=str(job_id))
            return

        job.status = JobStatus.PROCESSING
        session.commit()
        logger.info("job_status_updated", job_id=str(job_id), status="processing")

        try:
            replay_id_int = extract_replay_id(url)
            duelingbook_id = str(replay_id_int)

            result = session.execute(
                select(Replay).where(Replay.duelingbook_id == duelingbook_id)
            )
            existing_replay = result.scalar_one_or_none()

            if existing_replay:
                logger.info(
                    "replay_cached",
                    job_id=str(job_id),
                    replay_id=str(existing_replay.id),
                    duelingbook_id=duelingbook_id,
                )

                if ensure_replay_parsed(session, existing_replay):
                    logger.info(
                        "players_extracted_from_cache",
                        replay_id=str(existing_replay.id),
                    )

                job.replay_id = existing_replay.id
                job.status = JobStatus.COMPLETED
                session.commit()
                return

            logger.info(
                "scraping_replay", job_id=str(job_id), duelingbook_id=duelingbook_id
            )

            raw_json = scrape_replay(
                url=url,
                replay_id=replay_id_int,
                api_key=scraper_settings.CAPSOLVER_API_KEY,
                site_key=scraper_settings.SITE_KEY,
                timeout=30.0,
                auth_cookies=scraper_settings.auth_cookies,
            )

            parsed = parse_replay(raw_json)

            replay = Replay(
                duelingbook_id=duelingbook_id,
                url=url,
                raw_json=raw_json,
                match_result=parsed.match_result,
                played_at=parsed.played_at,
                format=parsed.format,
            )
            session.add(replay)
            session.flush()

            extract_players(session, replay, parsed.player1, parsed.player2)

            job.replay_id = replay.id
            job.status = JobStatus.COMPLETED
            session.commit()

            logger.info(
                "scrape_completed",
                job_id=str(job_id),
                replay_id=str(replay.id),
                duelingbook_id=duelingbook_id,
            )

        except (CaptchaError, ScraperError) as e:
            session.rollback()

            if self.request.retries >= 3:
                job = session.get(Job, job_id)
                if job:
                    job.status = JobStatus.FAILED
                    job.error = str(e)
                    session.commit()
                logger.error("scrape_failed_final", job_id=str(job_id), error=str(e))
                return

            logger.warning(
                "scrape_retry",
                job_id=str(job_id),
                error=str(e),
                retry_count=self.request.retries,
            )
            raise

        except Exception as e:
            logger.error("scrape_failed_unexpected", job_id=str(job_id), error=str(e))
            session.rollback()
            job = session.get(Job, job_id)
            if job:
                job.status = JobStatus.FAILED
                job.error = str(e)
                session.commit()
