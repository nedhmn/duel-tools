# duel-prep

Tool for analyzing opponent decklists from DuelingBook replay URLs.

## Features

- Input replay URLs (up to 50)
- Scrapes replay data from DuelingBook (async with retry)
- Caches scraped data in PostgreSQL
- Displays games with card images, grouped by replay
- Player lookup mode
- YDK deck export

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       duel-prep                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Frontend   │    │   Backend    │    │   Worker     │  │
│  │    React     │◄──►│   FastAPI    │◄──►│   Celery     │  │
│  │  + Vite      │    │              │    │              │  │
│  └──────────────┘    └──────┬───────┘    └──────┬───────┘  │
│                             │                   │          │
│                      ┌──────▼───────────────────▼───────┐  │
│                      │         PostgreSQL               │  │
│                      └──────────────────────────────────┘  │
│                                                              │
│                      ┌──────────────────────────────────┐  │
│                      │            Redis                 │  │
│                      │       (Celery broker)            │  │
│                      └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flows

### Batch Scraping

```
User submits URLs
    ↓
POST /scrape → Create batch + jobs → Queue Celery tasks → return batch_id
    ↓
Frontend redirects to /batch/{batch_id}
    ↓
Frontend polls GET /scrape/{batch_id}
    ↓
Celery workers scrape DuelingBook (with retry)
    ↓
Workers update job status + store raw JSON
    ↓
All jobs done → frontend fetches GET /replays/{id} for each
    ↓
Parse raw JSON on-the-fly → display results
```

### Player Lookup

```
User selects player → Backend queries replay_players
                              ↓
          Display ← Parse ← Fetch matching replays from DB
```

## Database Schema

```
batches
├── id (UUID PK)
├── name (VARCHAR 255)
├── created_at
└── updated_at

jobs
├── id (UUID PK)
├── batch_id (FK → batches.id)
├── url
├── duelingbook_id
├── status (pending/processing/completed/failed)
├── replay_id (FK → replays.id, nullable)
├── error (text, nullable)
├── created_at
└── updated_at

replays
├── id (UUID PK)
├── duelingbook_id (unique)
├── url
├── raw_json (JSONB)
├── match_result
├── played_at
├── created_at
└── updated_at

players
├── id (UUID PK)
├── username (unique)
├── created_at
└── updated_at

replay_players
├── id (UUID PK)
├── replay_id (FK → replays.id)
├── player_id (FK → players.id)
├── created_at
└── updated_at
```

### Design Decisions

- **Persistent batches**: Batch URLs are shareable. Users can bookmark /batch/{id}.
- **Raw JSON only**: Scraping is expensive, parsing is cheap. Store raw, parse on-the-fly.
- **players table**: Uses IDs (not usernames) in URLs since usernames can have complex UTF-8.
- **replay_players junction**: Enables player lookup. Extracts both players to this table.
- **Redis for Celery only**: No app-level caching. Frontend uses TanStack Query.

## API Specification

Base URL: `/api/v1`

### Scraping

#### POST /scrape

Submit URLs for scraping.

Request:
```json
{
  "name": "Tournament Finals",
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
    { "job_id": "uuid", "url": "...", "status": "pending" }
  ]
}
```

#### GET /scrape/{batch_id}

Poll batch status.

Response:
```json
{
  "batch_id": "uuid",
  "name": "Tournament Finals",
  "status": "processing",
  "jobs": [
    { "job_id": "uuid", "url": "...", "status": "completed", "replay_id": "uuid" },
    { "job_id": "uuid", "url": "...", "status": "failed", "error": "..." }
  ]
}
```

### Batches

#### GET /batches

List recent batches.

Response:
```json
{
  "batches": [
    { "id": "uuid", "name": "...", "status": "completed", "replay_count": 5, "created_at": "..." }
  ]
}
```

### Replays

#### GET /replays/{duelingbook_id}

Get parsed replay.

Response:
```json
{
  "replay_id": 123456,
  "date": "2017-11-18 23:37:23",
  "player1": "username1",
  "player2": "username2",
  "player1_id": "uuid",
  "player2_id": "uuid",
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
          { "card_id": 123, "card_name": "Card Name", "card_type": "Monster", "serial_number": 12345678, "card_amount": 2 }
        ]
      },
      "player2_cards": { ... }
    }
  ],
  "total_player1_cards": { ... },
  "total_player2_cards": { ... }
}
```

### Players

#### GET /players

List all players.

Response:
```json
{
  "players": [
    { "id": "uuid", "username": "...", "replay_count": 5 }
  ]
}
```

#### GET /players/{player_id}

Get player with replays.

Response:
```json
{
  "id": "uuid",
  "username": "...",
  "replays": [
    { "duelingbook_id": "123", "url": "...", "opponent": "...", "match_result": "2-0", "played_at": "..." }
  ]
}
```

## Shared Packages

| Package | Description |
|---------|-------------|
| `db` | SQLAlchemy models + async session factory |
| `logger` | Shared structlog configuration |
| `parser` | Replay JSON parsing with Pydantic models |
| `scraper` | DuelingBook scraping + CapSolver integration |

## External Dependencies

- **DuelingBook API** - Source of replay data (requires captcha solving)
- **CapSolver** - Service to solve DuelingBook's reCAPTCHA v2
