import re
from datetime import datetime, timezone
from typing import Any

import pandas as pd

from dt_logger import get_logger
from dt_parser.models import CardInfo, Game, ParsedReplay, PlayerCards

logger = get_logger(__name__)

CARD_NAME_PATTERN = re.compile(r'"([^"]*)"')


def parse_replay(raw_json: dict[str, Any]) -> ParsedReplay:
    plays = raw_json.get("plays", [])
    player1 = raw_json["player1"]["username"]
    player2 = raw_json["player2"]["username"]

    card_id_map = _build_card_id_map(plays)
    card_names = set(card_id_map.keys())

    plays_df = _create_plays_df(plays)
    plays_df = _add_derived_columns(plays_df, card_names)

    cards_df = _create_cards_df(plays_df, card_id_map)

    games = []
    for game_num in sorted(plays_df["game_number"].unique()):
        if game_num == 0:
            continue
        game_df = plays_df[plays_df["game_number"] == game_num]

        games.append(
            Game(
                game_number=game_num,
                winner=_get_game_winner(player1, player2, game_df),
                went_first=_get_went_first(player1, player2, game_df),
                player1_cards=_build_player_cards(player1, game_num, cards_df),
                player2_cards=_build_player_cards(player2, game_num, cards_df),
            )
        )

    player1_wins = sum(1 for game in games if game.winner == player1)
    player2_wins = sum(1 for game in games if game.winner == player2)
    draws = sum(1 for game in games if game.winner is None)
    match_result = (
        f"{player1_wins}-{player2_wins}-{draws}"
        if draws > 0
        else f"{player1_wins}-{player2_wins}"
    )

    played_at = datetime.strptime(raw_json["date"], "%Y-%m-%d %H:%M:%S").replace(
        tzinfo=timezone.utc
    )

    logger.info("replay_parsed", replay_id=raw_json["id"], game_count=len(games))

    return ParsedReplay(
        replay_id=raw_json["id"],
        played_at=played_at,
        format=raw_json["format"],
        player1=player1,
        player2=player2,
        match_result=match_result,
        games=games,
    )


def _build_card_id_map(
    plays: list[dict[str, Any]],
) -> dict[str, tuple[int, str, str]]:
    card_map: dict[str, tuple[int, str, str]] = {}

    for play in plays:
        if "card" in play and isinstance(play["card"], dict):
            card = play["card"]
            if "name" in card and "id" in card:
                card_type = card.get("card_type", "")
                serial_number = card.get("serial_number", "")
                card_map[card["name"]] = (card["id"], card_type, serial_number)

        if "cards" in play and isinstance(play["cards"], list):
            for card in play["cards"]:
                if isinstance(card, dict) and "name" in card and "id" in card:
                    card_type = card.get("card_type", "")
                    serial_number = card.get("serial_number", "")
                    card_map[card["name"]] = (card["id"], card_type, serial_number)

    return card_map


def _create_plays_df(plays: list[dict[str, Any]]) -> pd.DataFrame:
    rows = []

    for play in plays:
        card_obj = play.get("card")
        card_name_from_play = (
            card_obj.get("name") if isinstance(card_obj, dict) else None
        )

        base = {
            "seconds": play.get("seconds"),
            "play": play.get("play"),
            "owner": play.get("owner"),
            "card_name_from_play": card_name_from_play,
        }

        logs = play.get("log")

        if isinstance(logs, list):
            for log in logs:
                rows.append({**base, **log})
        elif isinstance(logs, dict):
            rows.append({**base, **logs})

    df = pd.json_normalize(rows)

    if "owner" in df.columns and "username" in df.columns:
        df["username"] = df["owner"].fillna(df["username"])
        df = df.drop(columns=["owner"])
    elif "owner" in df.columns:
        df["username"] = df["owner"]
        df = df.drop(columns=["owner"])

    for col in ["public_log", "private_log"]:
        if col not in df.columns:
            df[col] = None

    return df


def _add_derived_columns(df: pd.DataFrame, card_names: set[str]) -> pd.DataFrame:
    df = df.copy()
    df["card_name"] = df.apply(lambda row: _extract_card_name(row, card_names), axis=1)
    df["deck_change"] = df.apply(_calculate_deck_change, axis=1)
    df["game_number"] = df["public_log"].str.contains("Chose to go", na=False).cumsum()
    return df


def _extract_card_name(row: pd.Series, card_names: set[str]) -> str | None:
    if row.get("play") == "Duel message":
        return None

    card_name_from_play = row.get("card_name_from_play")
    if pd.notna(card_name_from_play) and card_name_from_play:
        return card_name_from_play

    for log in (row.get("private_log"), row.get("public_log")):
        if not log:
            continue
        log_str = str(log)

        for name in card_names:
            if f'"{name}"' in log_str:
                return name

        matches = CARD_NAME_PATTERN.findall(log_str)
        if matches:
            return matches[0]

    return None


def _calculate_deck_change(row: pd.Series) -> int:
    logs = [str(row.get("private_log", "")), str(row.get("public_log", ""))]

    if any("Revealed" in log and "from Deck" in log for log in logs):
        return 0

    if any(
        phrase in log
        for log in logs
        for phrase in ("Drew", "from Deck", "from top of deck")
    ):
        return 1

    if any(
        phrase in log
        for log in logs
        for phrase in ("to top of deck", "to bottom of deck")
    ):
        return -1

    return 0


def _get_went_first(player1: str, player2: str, game_df: pd.DataFrame) -> str:
    first_row = game_df[game_df["public_log"] == "Chose to go first"]
    if not first_row.empty:
        return first_row.iloc[0]["username"]

    second_row = game_df[game_df["public_log"] == "Chose to go second"]
    if not second_row.empty:
        chose_second = second_row.iloc[0]["username"]
        return player1 if chose_second == player2 else player2

    return ""


def _get_game_winner(player1: str, player2: str, game_df: pd.DataFrame) -> str | None:
    loser_rows = game_df[game_df["public_log"].isin(["Admitted defeat", "Lost Duel"])]

    if loser_rows.empty:
        return None

    loser = loser_rows.iloc[0]["username"]
    return player1 if loser == player2 else player2


def _create_cards_df(
    plays_df: pd.DataFrame, card_id_map: dict[str, tuple[int, str, str]]
) -> pd.DataFrame:
    df = plays_df.dropna(subset=["card_name"]).copy()

    if df.empty:
        return pd.DataFrame(
            columns=pd.Index(
                [
                    "game_number",
                    "username",
                    "card_name",
                    "card_id",
                    "card_type",
                    "card_amount",
                    "serial_number",
                ]
            )
        )

    df["cum_deck_change"] = df.groupby(["game_number", "username", "card_name"])[
        "deck_change"
    ].cumsum()

    result = (
        df.groupby(["game_number", "username", "card_name"])
        .agg(card_amount=("cum_deck_change", "max"))
        .reset_index()
    )

    result = result[result["card_amount"] > 0]
    result["card_id"] = (
        result["card_name"]
        .map(lambda n: card_id_map.get(n, (0, "", ""))[0])
        .astype(int)
    )
    result["card_type"] = result["card_name"].map(
        lambda n: card_id_map.get(n, (0, "", ""))[1]
    )
    result["serial_number"] = result["card_name"].map(
        lambda n: card_id_map.get(n, (0, "", ""))[2]
    )

    return result


def _build_player_cards(
    username: str, game_number: int, cards_df: pd.DataFrame
) -> PlayerCards:
    player_cards = cards_df[
        (cards_df["game_number"] == game_number) & (cards_df["username"] == username)
    ]

    cards = [
        CardInfo(
            card_id=row["card_id"],
            card_name=row["card_name"],
            card_amount=row["card_amount"],
            card_type=row["card_type"],
            serial_number=row["serial_number"],
        )
        for _, row in player_cards.iterrows()
    ]

    card_count = sum(card.card_amount for card in cards)

    return PlayerCards(username=username, card_count=card_count, cards=cards)
