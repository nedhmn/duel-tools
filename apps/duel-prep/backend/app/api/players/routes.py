from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from logger import get_logger
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_db
from app.api.players.models import (
    PlayerDetailResponse,
    PlayerListResponse,
    PlayerResponse,
    ReplayMetadata,
)
from db.models import Player, ReplayPlayer

logger = get_logger(__name__)

router = APIRouter()


@router.get("", response_model=PlayerListResponse)
async def list_players(
    db: AsyncSession = Depends(get_db),
) -> PlayerListResponse:
    logger.info("players_list_requested")

    result = await db.execute(select(Player).order_by(Player.username))
    players = list(result.scalars().all())

    logger.info("players_list_retrieved", count=len(players))

    return PlayerListResponse(
        players=[PlayerResponse.model_validate(p) for p in players]
    )


@router.get("/{player_id}", response_model=PlayerDetailResponse)
async def get_player(
    player_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> PlayerDetailResponse:
    logger.info("player_detail_requested", player_id=str(player_id))

    result = await db.execute(select(Player).where(Player.id == player_id))
    player = result.scalar_one_or_none()

    if not player:
        logger.warning("player_not_found", player_id=str(player_id))
        raise HTTPException(status_code=404, detail="Player not found")

    result = await db.execute(
        select(ReplayPlayer)
        .where(ReplayPlayer.player_id == player_id)
        .options(selectinload(ReplayPlayer.replay))
    )
    replay_players = list(result.scalars().all())

    replays: list[ReplayMetadata] = []
    for rp in replay_players:
        replay = rp.replay

        if not replay.played_at or not replay.match_result:
            continue

        opponent_result = await db.execute(
            select(ReplayPlayer)
            .where(ReplayPlayer.replay_id == replay.id)
            .where(ReplayPlayer.player_id != player_id)
            .options(selectinload(ReplayPlayer.player))
        )
        opponent_rp = opponent_result.scalar_one_or_none()
        opponent = opponent_rp.player.username if opponent_rp else "Unknown"

        replays.append(
            ReplayMetadata(
                id=replay.id,
                duelingbook_id=replay.duelingbook_id,
                url=replay.url,
                opponent=opponent,
                played_at=replay.played_at,
                match_result=replay.match_result,
            )
        )

    logger.info(
        "player_detail_retrieved",
        player_id=str(player_id),
        replay_count=len(replays),
    )

    return PlayerDetailResponse(
        id=player.id,
        username=player.username,
        replays=replays,
    )
