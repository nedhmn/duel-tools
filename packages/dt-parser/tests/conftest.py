import json
from pathlib import Path
from typing import Any

import pytest

FIXTURES = Path(__file__).parent / "fixtures"


@pytest.fixture
def standard_replay() -> dict[str, Any]:
    return json.loads((FIXTURES / "standard-replay.json").read_text())


@pytest.fixture
def double_quote_cards() -> dict[str, Any]:
    return json.loads((FIXTURES / "double-quote-cards.json").read_text())


@pytest.fixture
def reveal_from_deck() -> dict[str, Any]:
    return json.loads((FIXTURES / "reveal-from-deck.json").read_text())


@pytest.fixture
def draw_result() -> dict[str, Any]:
    return json.loads((FIXTURES / "draw-result.json").read_text())


@pytest.fixture
def deck_ydk() -> str:
    return (FIXTURES / "deck-ydk-example.ydk").read_text()
