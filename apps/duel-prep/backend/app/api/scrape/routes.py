from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from logger import get_logger
from scraper import extract_replay_id
from scraper.exceptions import ScraperError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_db
from app.api.scrape.models import (
    BatchStatusResponse,
    ScrapeRequest,
    ScrapeResponse,
)
from app.api.scrape.utils import compute_batch_status, job_to_response
from app.worker.tasks import scrape_replay_task
from db.models import Batch, Job, JobStatus

logger = get_logger(__name__)

router = APIRouter()


@router.post("", response_model=ScrapeResponse)
async def create_scrape_batch(
    request: ScrapeRequest,
    db: AsyncSession = Depends(get_db),
) -> ScrapeResponse:
    logger.info("scrape_batch_requested", url_count=len(request.urls))

    url_to_dbid: dict[str, str] = {}
    for url in request.urls:
        try:
            replay_id = extract_replay_id(url)
            db_id = str(replay_id)
            url_to_dbid[url] = db_id
        except ScraperError as e:
            logger.warning("invalid_url", url=url, error=str(e))
            raise HTTPException(status_code=400, detail=f"Invalid URL: {url}") from e

    seen_ids: set[str] = set()
    unique_urls: list[tuple[str, str]] = []
    for url, db_id in url_to_dbid.items():
        if db_id not in seen_ids:
            seen_ids.add(db_id)
            unique_urls.append((url, db_id))

    logger.info(
        "urls_deduped",
        original_count=len(request.urls),
        unique_count=len(unique_urls),
    )

    batch = Batch(name=request.name)
    db.add(batch)
    await db.flush()

    jobs: list[Job] = []
    for url, db_id in unique_urls:
        job = Job(
            batch_id=batch.id,
            url=url,
            duelingbook_id=db_id,
            status=JobStatus.PENDING,
        )
        db.add(job)
        jobs.append(job)

    await db.commit()

    for job in jobs:
        await db.refresh(job)

    for job in jobs:
        scrape_replay_task.delay(str(job.id), job.url)

    logger.info(
        "scrape_batch_created",
        batch_id=str(batch.id),
        job_count=len(jobs),
    )

    return ScrapeResponse(
        batch_id=batch.id,
        jobs=[job_to_response(job) for job in jobs],
    )


@router.get("/{batch_id}", response_model=BatchStatusResponse)
async def get_batch_status(
    batch_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> BatchStatusResponse:
    logger.info("batch_status_requested", batch_id=str(batch_id))

    result = await db.execute(select(Batch).where(Batch.id == batch_id))
    batch = result.scalar_one_or_none()

    if not batch:
        logger.warning("batch_not_found", batch_id=str(batch_id))
        raise HTTPException(status_code=404, detail="Batch not found")

    result = await db.execute(
        select(Job).where(Job.batch_id == batch_id).options(selectinload(Job.replay))
    )
    jobs = list(result.scalars().all())

    status = compute_batch_status(jobs)

    logger.info(
        "batch_status_retrieved",
        batch_id=str(batch_id),
        status=status,
        job_count=len(jobs),
    )

    return BatchStatusResponse(
        batch_id=batch.id,
        name=batch.name,
        status=status,
        jobs=[job_to_response(job) for job in jobs],
    )
