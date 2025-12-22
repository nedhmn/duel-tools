from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from logger import get_logger
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_db
from app.api.players.models import (
    PlayerDetailResponse,
    PlayerListResponse,
    PlayerResponse,
    ReplayMetadata,
)
from db.models import Player, Replay, ReplayPlayer

logger = get_logger(__name__)


def flip_match_result(result: str) -> str:
    parts = result.split("-")
    if len(parts) == 2:
        return f"{parts[1]}-{parts[0]}"
    if len(parts) == 3:
        return f"{parts[1]}-{parts[0]}-{parts[2]}"
    return result


router = APIRouter()


@router.get("", response_model=PlayerListResponse)
async def list_players(
    db: AsyncSession = Depends(get_db),
) -> PlayerListResponse:
    logger.info("players_list_requested")

    stmt = (
        select(
            Player.id,
            Player.username,
            func.count(ReplayPlayer.id).label("replay_count"),
        )
        .outerjoin(ReplayPlayer, Player.id == ReplayPlayer.player_id)
        .group_by(Player.id)
        .order_by(Player.username)
    )

    result = await db.execute(stmt)
    rows = result.all()

    players = [
        PlayerResponse(
            id=row.id,
            username=row.username,
            replay_count=row.replay_count or 0,
        )
        for row in rows
    ]

    logger.info("players_list_retrieved", count=len(players))

    return PlayerListResponse(players=players)


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
        .options(
            selectinload(ReplayPlayer.replay)
            .selectinload(Replay.replay_players)
            .selectinload(ReplayPlayer.player)
        )
    )
    replay_players = list(result.scalars().all())

    replays: list[ReplayMetadata] = []
    for rp in replay_players:
        replay = rp.replay

        if not replay.played_at or not replay.match_result:
            continue

        opponent_rp = next(
            (p for p in replay.replay_players if p.player_id != player_id),
            None,
        )
        opponent = opponent_rp.player.username if opponent_rp else "Unknown"

        raw = replay.raw_json or {}
        p1 = raw.get("player1", {})
        player1_username = p1.get("username") if isinstance(p1, dict) else None
        is_player1 = player.username == player1_username

        match_result = replay.match_result
        if not is_player1 and match_result:
            match_result = flip_match_result(match_result)

        replays.append(
            ReplayMetadata(
                id=replay.id,
                duelingbook_id=replay.duelingbook_id,
                url=replay.url,
                opponent=opponent,
                played_at=replay.played_at,
                match_result=match_result,
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
