from pathlib import Path

import pytest

FIXTURES = Path(__file__).parent / "fixtures"


@pytest.fixture
def replay_json() -> str:
    return (FIXTURES / "replay-json-example.json").read_text()


@pytest.fixture
def max_json() -> str:
    return (FIXTURES / "max-json-example.json").read_text()


@pytest.fixture
def reveal_from_deck_json() -> str:
    return (FIXTURES / "reveal-from-deck-example.json").read_text()


@pytest.fixture
def deck_ydk() -> str:
    return (FIXTURES / "deck-ydk-example.ydk").read_text()
