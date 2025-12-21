from fastapi import APIRouter, Depends, HTTPException
from logger import get_logger
from parser import ParsedReplay, parse_replay
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from db.models import Replay

logger = get_logger(__name__)

router = APIRouter()


@router.get("/{duelingbook_id}", response_model=ParsedReplay)
async def get_replay(
    duelingbook_id: str,
    db: AsyncSession = Depends(get_db),
) -> ParsedReplay:
    logger.info("replay_requested", duelingbook_id=duelingbook_id)

    result = await db.execute(
        select(Replay).where(Replay.duelingbook_id == duelingbook_id)
    )
    replay = result.scalar_one_or_none()

    if not replay:
        logger.warning("replay_not_found", duelingbook_id=duelingbook_id)
        raise HTTPException(status_code=404, detail="Replay not found")

    parsed = parse_replay(replay.raw_json)

    logger.info(
        "replay_retrieved",
        duelingbook_id=duelingbook_id,
        replay_id=str(replay.id),
    )

    return parsed
