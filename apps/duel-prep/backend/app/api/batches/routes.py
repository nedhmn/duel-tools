from fastapi import APIRouter, Depends
from logger import get_logger
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.batches.models import BatchListResponse, BatchSummary
from app.api.deps import get_db
from db.models import Batch, Job, JobStatus

logger = get_logger(__name__)

router = APIRouter()


@router.get("", response_model=BatchListResponse)
async def list_batches(
    db: AsyncSession = Depends(get_db),
) -> BatchListResponse:
    logger.info("batches_list_requested")

    stmt = (
        select(
            Batch.id,
            Batch.name,
            Batch.created_at,
            func.count(Job.id)
            .filter(Job.status == JobStatus.COMPLETED)
            .label("replay_count"),
        )
        .outerjoin(Job, Batch.id == Job.batch_id)
        .group_by(Batch.id)
        .order_by(Batch.created_at.desc())
        .limit(50)
    )

    result = await db.execute(stmt)
    rows = result.all()

    batches = [
        BatchSummary(
            id=row.id,
            name=row.name,
            created_at=row.created_at,
            replay_count=row.replay_count or 0,
        )
        for row in rows
    ]

    logger.info("batches_list_retrieved", count=len(batches))

    return BatchListResponse(batches=batches)
