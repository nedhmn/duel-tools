from typing import Any

from parser import parse_replay


class TestStandardReplay:
    def test_metadata(self, standard_replay: dict[str, Any]) -> None:
        result = parse_replay(standard_replay)
        assert result.replay_id == 2178594
        assert result.format == "au"
        assert result.player1 == "Noxjja"
        assert result.player2 == "Drew Carter"
        assert result.match_result == "2-1"

    def test_game_count(self, standard_replay: dict[str, Any]) -> None:
        result = parse_replay(standard_replay)
        assert len(result.games) == 3

    def test_game_winners(self, standard_replay: dict[str, Any]) -> None:
        result = parse_replay(standard_replay)
        assert result.games[0].winner == "Drew Carter"
        assert result.games[1].winner == "Noxjja"
        assert result.games[2].winner == "Noxjja"

    def test_went_first(self, standard_replay: dict[str, Any]) -> None:
        result = parse_replay(standard_replay)
        assert result.games[0].went_first == "Noxjja"
        assert result.games[1].went_first == "Noxjja"
        assert result.games[2].went_first == "Noxjja"

    def test_card_counts(self, standard_replay: dict[str, Any]) -> None:
        result = parse_replay(standard_replay)
        assert result.games[0].player1_cards.card_count == 9
        assert result.games[0].player2_cards.card_count == 13
        assert result.games[1].player1_cards.card_count == 30
        assert result.games[1].player2_cards.card_count == 16
        assert result.games[2].player1_cards.card_count == 26
        assert result.games[2].player2_cards.card_count == 8


class TestDoubleQuoteCards:
    def test_metadata(self, double_quote_cards: dict[str, Any]) -> None:
        result = parse_replay(double_quote_cards)
        assert result.replay_id == 64022114
        assert result.player1 == "LuckExtreme"
        assert result.player2 == "texas sucks"
        assert result.match_result == "2-0"

    def test_game_count(self, double_quote_cards: dict[str, Any]) -> None:
        result = parse_replay(double_quote_cards)
        assert len(result.games) == 2

    def test_double_quote_card_name(self, double_quote_cards: dict[str, Any]) -> None:
        result = parse_replay(double_quote_cards)
        game2_p1_cards = result.games[1].player1_cards
        maxx_c = next(c for c in game2_p1_cards.cards if c.card_id == 2797)
        assert maxx_c.card_name == 'Maxx "C"'
        assert maxx_c.card_amount == 1
        assert maxx_c.serial_number == "23434538"

    def test_card_counts(self, double_quote_cards: dict[str, Any]) -> None:
        result = parse_replay(double_quote_cards)
        assert result.games[0].player1_cards.card_count == 13
        assert result.games[0].player2_cards.card_count == 23
        assert result.games[1].player1_cards.card_count == 11
        assert result.games[1].player2_cards.card_count == 18


class TestRevealFromDeck:
    def test_metadata(self, reveal_from_deck: dict[str, Any]) -> None:
        result = parse_replay(reveal_from_deck)
        assert result.replay_id == 78631010
        assert result.player1 == "Bombo"
        assert result.player2 == "niekod5"
        assert result.match_result == "2-1"

    def test_game_count(self, reveal_from_deck: dict[str, Any]) -> None:
        result = parse_replay(reveal_from_deck)
        assert len(result.games) == 3

    def test_crescent_not_counted_as_draw(
        self, reveal_from_deck: dict[str, Any]
    ) -> None:
        result = parse_replay(reveal_from_deck)
        game1_p1 = result.games[0].player1_cards
        crescent = next(
            (
                c
                for c in game1_p1.cards
                if c.card_name == "Spellbook Library of the Crescent"
            ),
            None,
        )
        assert crescent is not None
        assert crescent.card_amount == 1

    def test_card_counts(self, reveal_from_deck: dict[str, Any]) -> None:
        result = parse_replay(reveal_from_deck)
        assert result.games[0].player1_cards.card_count == 13
        assert result.games[0].player2_cards.card_count == 16
        assert result.games[1].player1_cards.card_count == 17
        assert result.games[1].player2_cards.card_count == 10
        assert result.games[2].player1_cards.card_count == 26
        assert result.games[2].player2_cards.card_count == 13

    def test_game3_crescent_count(self, reveal_from_deck: dict[str, Any]) -> None:
        result = parse_replay(reveal_from_deck)
        game3_p1 = result.games[2].player1_cards
        crescent = next(
            c
            for c in game3_p1.cards
            if c.card_name == "Spellbook Library of the Crescent"
        )
        assert crescent.card_amount == 3


class TestDrawResult:
    def test_metadata(self, draw_result: dict[str, Any]) -> None:
        result = parse_replay(draw_result)
        assert result.replay_id == 63958640
        assert result.format == "gu"
        assert result.player1 == "MarcusHayden"
        assert result.player2 == "geistD"
        assert result.match_result == "1-2-1"

    def test_game_count(self, draw_result: dict[str, Any]) -> None:
        result = parse_replay(draw_result)
        assert len(result.games) == 4

    def test_draw_game_has_no_winner(self, draw_result: dict[str, Any]) -> None:
        result = parse_replay(draw_result)
        assert result.games[0].winner is None

    def test_non_draw_games_have_winners(self, draw_result: dict[str, Any]) -> None:
        result = parse_replay(draw_result)
        assert result.games[1].winner is not None
        assert result.games[2].winner is not None
        assert result.games[3].winner is not None
