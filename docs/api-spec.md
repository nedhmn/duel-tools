# API Specification

## duel-prep

Base URL: `/api/v1`

### Scraping

#### Submit URLs for scraping

```
POST /scrape
```

Request:
```json
{
  "urls": [
    "https://www.duelingbook.com/replay?id=...",
    "https://www.duelingbook.com/replay?id=..."
  ]
}
```

Response:
```json
{
  "batch_id": "uuid",
  "jobs": [
    { "job_id": "uuid", "url": "...", "status": "pending" },
    { "job_id": "uuid", "url": "...", "status": "pending" }
  ]
}
```

#### Get batch status (polling)

```
GET /scrape/{batch_id}
```

Response:
```json
{
  "batch_id": "uuid",
  "status": "processing",
  "jobs": [
    { "job_id": "uuid", "url": "...", "status": "completed", "replay_id": "uuid" },
    { "job_id": "uuid", "url": "...", "status": "processing", "replay_id": null },
    { "job_id": "uuid", "url": "...", "status": "failed", "error": "...", "replay_id": null }
  ]
}
```

Status values: `pending`, `processing`, `completed`, `failed`

### Replays

#### Get parsed replay

```
GET /replays/{replay_id}
```

Response:
```json
{
  "replay_id": 123456,
  "date": "2017-11-18 23:37:23",
  "format": "au",
  "player1": "username1",
  "player2": "username2",
  "match_result": "1-2",
  "games": [
    {
      "game_number": 1,
      "went_first": "username1",
      "winner": "username2",
      "player1_cards": {
        "username": "username1",
        "card_count": 8,
        "cards": [
          { "card_id": 123, "card_name": "Card Name", "card_amount": 2 }
        ]
      },
      "player2_cards": {
        "username": "username2",
        "card_count": 12,
        "cards": [
          { "card_id": 456, "card_name": "Card Name", "card_amount": 1 }
        ]
      }
    }
  ]
}
```

### Players

#### List all players

```
GET /players
```

Response:
```json
{
  "players": [
    { "id": "uuid", "username": "..." },
    { "id": "uuid", "username": "..." }
  ]
}
```

#### Get player with replays

```
GET /players/{player_id}
```

Response:
```json
{
  "id": "uuid",
  "username": "...",
  "replays": [
    { "id": "uuid", "url": "...", "opponent": "..." }
  ]
}
```

---

## replay-viewer

Base URL: `/api/v1`

### Parse

#### Parse uploaded JSON

```
POST /parse
```

Request:
```json
{
  "raw_json": { ... }
}
```

Response: Same structure as `GET /replays/{replay_id}`.

Note: Stateless - does not save to database.
