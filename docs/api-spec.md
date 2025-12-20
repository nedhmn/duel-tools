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
  "id": "uuid",
  "url": "https://www.duelingbook.com/replay?id=...",
  "player1": { "id": "uuid", "username": "..." },
  "player2": { "id": "uuid", "username": "..." },
  "games": [
    {
      "game_number": 1,
      "went_first": "username",
      "winner": "username",
      "player1_cards": [
        { "card_id": "123", "card_name": "...", "count": 2 }
      ],
      "player2_cards": [
        { "card_id": "456", "card_name": "...", "count": 1 }
      ]
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

Response: Same structure as `GET /replays/{replay_id}` games array.

```json
{
  "player1": "username",
  "player2": "username",
  "games": [
    {
      "game_number": 1,
      "went_first": "username",
      "winner": "username",
      "player1_cards": [...],
      "player2_cards": [...]
    }
  ]
}
```

Note: Stateless - does not save to database.
