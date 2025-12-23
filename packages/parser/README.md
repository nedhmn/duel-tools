# parser

Parse DuelingBook replay JSON into structured data.

## Usage

```python
from parser import parse_replay, ParsedReplay, Game, PlayerCards, CardInfo

parsed: ParsedReplay = parse_replay(raw_json)

print(parsed.player1, "vs", parsed.player2)
print(parsed.match_result)  # "2-1"
print(parsed.played_at)     # datetime

for game in parsed.games:
    print(f"Game {game.game_number}: {game.winner} won")
    print(f"  {game.player1_cards.username}: {game.player1_cards.card_count} cards")
```

## Output Models

| Model          | Fields                                                              |
| -------------- | ------------------------------------------------------------------- |
| `ParsedReplay` | replay_id, played_at, format, player1, player2, match_result, games |
| `Game`         | game_number, winner, went_first, player1_cards, player2_cards       |
| `PlayerCards`  | username, card_count, cards                                         |
| `CardInfo`     | card_id, card_name, card_amount, card_type, serial_number           |

## How It Works

1. Extracts card info from `plays` array (builds name → id/type map)
2. Creates DataFrame from play logs
3. Detects game boundaries via "Chose to go first/second"
4. Tracks deck changes (draws, returns) to count cards seen
5. Determines winners via "Admitted defeat" / "Lost Duel"
