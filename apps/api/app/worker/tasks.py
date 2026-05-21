from uuid import UUID

from sqlalchemy import select

from app.core.config import settings
from app.worker.celery_app import celery_app
from app.worker.services import ensure_replay_parsed, extract_players
from dt_db.models import Job, JobStatus, Replay
from dt_db.session import create_sync_session_factory
from dt_logger import get_logger
from dt_parser import parse_replay
from dt_scraper import CaptchaError, ScraperError, extract_replay_id, scrape_replay

logger = get_logger(__name__)

sync_session = create_sync_session_factory(
    settings.DATABASE_URL, pool_size=40, max_overflow=10
)


class JobAwareTask(celery_app.Task):
    def on_failure(self, exc, task_id, args, kwargs, einfo):  # type: ignore[no-untyped-def]
        job_id_str = args[0] if args else kwargs.get("job_id_str")
        if not job_id_str:
            logger.error("task_on_failure_no_job_id", task_id=task_id, error=str(exc))
            return
        try:
            job_id = UUID(job_id_str)
        except (ValueError, TypeError):
            logger.error(
                "task_on_failure_invalid_job_id",
                job_id=job_id_str,
                error=str(exc),
            )
            return
        with sync_session() as session:
            job = session.get(Job, job_id)
            if not job:
                logger.error("task_on_failure_job_not_found", job_id=str(job_id))
                return
            if job.status in (JobStatus.COMPLETED, JobStatus.FAILED):
                return
            job.status = JobStatus.FAILED
            job.error = f"{type(exc).__name__}: {exc}"
            session.commit()
        logger.error("task_on_failure", job_id=str(job_id), error=str(exc))


@celery_app.task(
    base=JobAwareTask,
    autoretry_for=(CaptchaError, ScraperError),
    retry_kwargs={"max_retries": 3, "countdown": 5},
    soft_time_limit=180,
    time_limit=210,
)
def scrape_replay_task(job_id_str: str, url: str) -> None:
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
            api_key=settings.CAPSOLVER_API_KEY,
            site_key=settings.TURNSTILE_SITE_KEY,
            timeout=30.0,
            auth_cookies=settings.auth_cookies,
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
