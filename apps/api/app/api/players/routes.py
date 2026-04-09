from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from app.api.deps import get_db
from app.api.players.models import (
    PlayerDetailResponse,
    PlayerListResponse,
    PlayerResponse,
    ReplayMetadata,
)
from dt_db.models import Player, Replay, ReplayPlayer
from dt_logger import get_logger

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

    OpponentRP = aliased(ReplayPlayer)
    OpponentPlayer = aliased(Player)

    stmt = (
        select(
            Player.id.label("player_id"),
            Player.username.label("player_username"),
            Replay.id.label("replay_id"),
            Replay.duelingbook_id,
            Replay.url,
            Replay.played_at,
            Replay.match_result,
            Replay.format,
            Replay.raw_json["player1"]["username"].astext.label("player1_username"),
            OpponentPlayer.username.label("opponent_username"),
        )
        .select_from(Player)
        .join(ReplayPlayer, Player.id == ReplayPlayer.player_id)
        .join(Replay, ReplayPlayer.replay_id == Replay.id)
        .outerjoin(
            OpponentRP,
            (Replay.id == OpponentRP.replay_id) & (OpponentRP.player_id != player_id),
        )
        .outerjoin(OpponentPlayer, OpponentRP.player_id == OpponentPlayer.id)
        .where(Player.id == player_id)
        .where(Replay.played_at.isnot(None))
        .where(Replay.match_result.isnot(None))
        .order_by(Replay.played_at.desc())
    )

    result = await db.execute(stmt)
    rows = result.all()

    if not rows:
        player_check = await db.execute(
            select(Player.id, Player.username).where(Player.id == player_id)
        )
        player = player_check.one_or_none()
        if not player:
            logger.warning("player_not_found", player_id=str(player_id))
            raise HTTPException(status_code=404, detail="Player not found")
        return PlayerDetailResponse(id=player.id, username=player.username, replays=[])

    player_username = rows[0].player_username

    replays: list[ReplayMetadata] = []
    for row in rows:
        is_player1 = player_username == row.player1_username
        match_result = row.match_result
        if not is_player1 and match_result:
            match_result = flip_match_result(match_result)

        replays.append(
            ReplayMetadata(
                id=row.replay_id,
                duelingbook_id=row.duelingbook_id,
                url=row.url,
                opponent=row.opponent_username or "Unknown",
                played_at=row.played_at,
                match_result=match_result,
                format=row.format,
            )
        )

    logger.info(
        "player_detail_retrieved",
        player_id=str(player_id),
        replay_count=len(replays),
    )

    return PlayerDetailResponse(
        id=rows[0].player_id,
        username=player_username,
        replays=replays,
    )
