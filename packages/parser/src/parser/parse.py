import re
from datetime import datetime, timezone
from typing import Any

import pandas as pd
from logger import get_logger

from parser.models import CardInfo, Game, ParsedReplay, PlayerCards

logger = get_logger(__name__)

CARD_NAME_PATTERN = re.compile(r'"([^"]*)"')


def parse_replay(raw_json: dict[str, Any]) -> ParsedReplay:
    plays = raw_json.get("plays", [])
    player1 = raw_json["player1"]["username"]
    player2 = raw_json["player2"]["username"]

    card_id_map = _build_card_id_map(plays)

    plays_df = _create_plays_df(plays)
    plays_df = _add_derived_columns(plays_df)

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
                went_first=_get_went_first(game_df),
                player1_cards=_build_player_cards(player1, game_num, cards_df),
                player2_cards=_build_player_cards(player2, game_num, cards_df),
            )
        )

    player1_wins = sum(1 for game in games if game.winner == player1)
    player2_wins = sum(1 for game in games if game.winner == player2)
    match_result = f"{player1_wins}-{player2_wins}"

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


def _build_card_id_map(plays: list[dict[str, Any]]) -> dict[str, int]:
    card_map: dict[str, int] = {}

    for play in plays:
        if "card" in play and isinstance(play["card"], dict):
            card = play["card"]
            if "name" in card and "id" in card:
                card_map[card["name"]] = card["id"]

        if "cards" in play and isinstance(play["cards"], list):
            for card in play["cards"]:
                if isinstance(card, dict) and "name" in card and "id" in card:
                    card_map[card["name"]] = card["id"]

    return card_map


def _create_plays_df(plays: list[dict[str, Any]]) -> pd.DataFrame:
    rows = []

    for play in plays:
        base = {
            "seconds": play.get("seconds"),
            "play": play.get("play"),
            "owner": play.get("owner"),
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


def _add_derived_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["card_name"] = df.apply(_extract_card_name, axis=1)
    df["deck_change"] = df.apply(_calculate_deck_change, axis=1)
    df["game_number"] = df["public_log"].str.contains("Chose to go", na=False).cumsum()
    return df


def _extract_card_name(row: pd.Series) -> str | None:
    if row.get("play") == "Duel message":
        return None

    for log in (row.get("private_log"), row.get("public_log")):
        if not log:
            continue
        matches = CARD_NAME_PATTERN.findall(str(log))
        if matches:
            return matches[0]

    return None


def _calculate_deck_change(row: pd.Series) -> int:
    logs = [str(row.get("private_log", "")), str(row.get("public_log", ""))]

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


def _get_went_first(game_df: pd.DataFrame) -> str:
    first_row = game_df[game_df["public_log"] == "Chose to go first"]
    if first_row.empty:
        return ""
    return first_row.iloc[0]["username"]


def _get_game_winner(player1: str, player2: str, game_df: pd.DataFrame) -> str | None:
    loser_rows = game_df[game_df["public_log"].isin(["Admitted defeat", "Lost Duel"])]

    if loser_rows.empty:
        return None

    loser = loser_rows.iloc[0]["username"]
    return player1 if loser == player2 else player2


def _create_cards_df(
    plays_df: pd.DataFrame, card_id_map: dict[str, int]
) -> pd.DataFrame:
    df = plays_df.dropna(subset=["card_name"]).copy()

    if df.empty:
        return pd.DataFrame(
            columns=pd.Index(
                ["game_number", "username", "card_name", "card_id", "card_amount"]
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
    result["card_id"] = result["card_name"].map(card_id_map).fillna(0).astype(int)

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
        )
        for _, row in player_cards.iterrows()
    ]

    card_count = sum(card.card_amount for card in cards)

    return PlayerCards(username=username, card_count=card_count, cards=cards)
