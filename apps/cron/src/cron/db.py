from typing import Any

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from db.models import Player, Replay, ReplayPlayer
from logger import get_logger
from parser import parse_replay

logger = get_logger(__name__)


async def get_existing_ids(
    session_factory: async_sessionmaker[AsyncSession],
) -> set[str]:
    async with session_factory() as session:
        result = await session.execute(select(Replay.duelingbook_id))
        ids = {row[0] for row in result.all()}
        logger.info("existing_ids_fetched", count=len(ids))
        return ids


async def get_or_create_player(session: AsyncSession, username: str) -> Player:
    result = await session.execute(select(Player).where(Player.username == username))
    player = result.scalar_one_or_none()
    if player:
        return player

    try:
        async with session.begin_nested():
            player = Player(username=username)
            session.add(player)
            await session.flush()
            logger.info("player_created", player_id=str(player.id), username=username)
            return player
    except IntegrityError:
        logger.warning("player_create_race_condition", username=username)
        result = await session.execute(
            select(Player).where(Player.username == username)
        )
        return result.scalar_one()


async def seed_replay(
    session_factory: async_sessionmaker[AsyncSession],
    duelingbook_id: str,
    raw_json: dict[str, Any],
) -> None:
    parsed = parse_replay(raw_json)

    async with session_factory() as session:
        replay = Replay(
            duelingbook_id=duelingbook_id,
            url=f"https://www.duelingbook.com/replay?id={duelingbook_id}",
            raw_json=raw_json,
            match_result=parsed.match_result,
            played_at=parsed.played_at,
            format=parsed.format,
        )
        session.add(replay)
        await session.flush()

        p1 = await get_or_create_player(session, parsed.player1)
        p2 = await get_or_create_player(session, parsed.player2)
        session.add(ReplayPlayer(replay_id=replay.id, player_id=p1.id))
        session.add(ReplayPlayer(replay_id=replay.id, player_id=p2.id))

        await session.commit()
        logger.info(
            "replay_seeded",
            duelingbook_id=duelingbook_id,
            replay_id=str(replay.id),
            player1=parsed.player1,
            player2=parsed.player2,
        )
