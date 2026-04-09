from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_db
from app.api.replays.models import ParsedReplayResponse
from dt_db.models import Replay, ReplayPlayer
from dt_logger import get_logger
from dt_parser import parse_replay

logger = get_logger(__name__)

router = APIRouter()


@router.get("/{duelingbook_id}", response_model=ParsedReplayResponse)
async def get_replay(
    duelingbook_id: str,
    db: AsyncSession = Depends(get_db),
) -> ParsedReplayResponse:
    logger.info("replay_requested", duelingbook_id=duelingbook_id)

    result = await db.execute(
        select(Replay)
        .where(Replay.duelingbook_id == duelingbook_id)
        .options(selectinload(Replay.replay_players).selectinload(ReplayPlayer.player))
    )
    replay = result.scalar_one_or_none()

    if not replay:
        logger.warning("replay_not_found", duelingbook_id=duelingbook_id)
        raise HTTPException(status_code=404, detail="Replay not found")

    parsed = parse_replay(replay.raw_json)

    player1_id = None
    player2_id = None
    for rp in replay.replay_players:
        if rp.player.username == parsed.player1:
            player1_id = rp.player_id
        elif rp.player.username == parsed.player2:
            player2_id = rp.player_id

    logger.info(
        "replay_retrieved",
        duelingbook_id=duelingbook_id,
        replay_id=str(replay.id),
    )

    return ParsedReplayResponse(
        **parsed.model_dump(),
        player1_id=player1_id,
        player2_id=player2_id,
    )
