from pydantic import BaseModel, ConfigDict


class CardInfo(BaseModel):
    model_config = ConfigDict(frozen=True)

    card_id: int
    card_name: str


class PlayerCards(BaseModel):
    model_config = ConfigDict(frozen=True)

    username: str
    cards: list[CardInfo]


class Game(BaseModel):
    model_config = ConfigDict(frozen=True)

    game_number: int
    winner: str | None
    went_first: str
    player1_cards: PlayerCards
    player2_cards: PlayerCards


class ParsedReplay(BaseModel):
    model_config = ConfigDict(frozen=True)

    replay_id: int
    date: str
    format: str
    player1: str
    player2: str
    games: list[Game]
