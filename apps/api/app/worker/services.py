from sqlalchemy import select
from sqlalchemy.orm import Session

from db.models import Player, Replay, ReplayPlayer
from logger import get_logger
from parser import parse_replay

logger = get_logger(__name__)


def get_or_create_player(session: Session, username: str) -> Player:
    result = session.execute(select(Player).where(Player.username == username))
    player = result.scalar_one_or_none()
    if not player:
        player = Player(username=username)
        session.add(player)
        session.flush()
        logger.info("player_created", player_id=str(player.id), username=username)
    return player


def extract_players(
    session: Session, replay: Replay, player1: str, player2: str
) -> None:
    p1 = get_or_create_player(session, player1)
    p2 = get_or_create_player(session, player2)

    session.add(ReplayPlayer(replay_id=replay.id, player_id=p1.id))
    session.add(ReplayPlayer(replay_id=replay.id, player_id=p2.id))
    session.flush()
    logger.info(
        "players_extracted",
        replay_id=str(replay.id),
        player1=player1,
        player2=player2,
    )


def ensure_replay_parsed(session: Session, replay: Replay) -> bool:
    has_players = session.execute(
        select(ReplayPlayer).where(ReplayPlayer.replay_id == replay.id)
    ).first()

    if has_players:
        return False

    parsed = parse_replay(replay.raw_json)
    replay.match_result = parsed.match_result
    replay.played_at = parsed.played_at
    extract_players(session, replay, parsed.player1, parsed.player2)
    logger.info(
        "replay_parsed",
        replay_id=str(replay.id),
        duelingbook_id=replay.duelingbook_id,
    )
    return True
