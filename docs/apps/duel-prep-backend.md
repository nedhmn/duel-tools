# duel-prep Backend

FastAPI + Celery backend for DuelingBook replay scraping and analysis.

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

## Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI app, static serving, CORS
│   ├── api/
│   │   ├── __init__.py
│   │   ├── main.py              # public_router aggregation
│   │   ├── deps.py              # get_db async session dependency
│   │   ├── health/
│   │   │   └── routes.py        # GET /health
│   │   ├── scrape/
│   │   │   ├── routes.py        # POST /scrape, GET /scrape/{batch_id}
│   │   │   ├── models.py        # Request/response models
│   │   │   └── utils.py         # compute_batch_status, job_to_response
│   │   ├── batches/
│   │   │   ├── routes.py        # GET /batches
│   │   │   └── models.py        # BatchSummary, BatchListResponse
│   │   ├── replays/
│   │   │   ├── routes.py        # GET /replays/{duelingbook_id}
│   │   │   └── models.py        # Re-exports ParsedReplay from parser
│   │   └── players/
│   │       ├── routes.py        # GET /players, GET /players/{player_id}
│   │       └── models.py        # PlayerResponse, PlayerDetailResponse
│   ├── core/
│   │   ├── config.py            # pydantic-settings
│   │   ├── limiter.py           # slowapi rate limiter
│   │   └── logging.py           # structlog setup
│   └── worker/
│       ├── celery_app.py        # Celery config
│       ├── tasks.py             # scrape_replay_task
│       └── services.py          # get_or_create_player, extract_players
├── scripts/
│   ├── init_db.py               # Create database tables
│   └── clear_db.py              # Delete all data from tables
├── static/                      # Frontend build (production)
├── Dockerfile                   # Multi-stage build
├── Makefile                     # Dev commands
└── pyproject.toml               # Dependencies
```

## API Specification

Base URL: `/api/v1`

**Authentication**: All routes except `/health` require `X-Auth-Password` header.

**Rate Limiting**: 200 requests/minute per IP (global).

**OpenAPI docs**: Disabled in production.

### Auth

```
GET /auth/verify
Headers: X-Auth-Password: <password>
Response: { "ok": true }
Error: 401 { "detail": "Invalid password" }
```

### Health

```
GET /health
Response: { "status": "ok" }
```

### Scraping

```
POST /scrape
Request:
{
  "name": "Tournament Finals",
  "urls": ["https://www.duelingbook.com/replay?id=..."]
}
Response:
{
  "batch_id": "uuid",
  "jobs": [{ "job_id": "uuid", "url": "...", "status": "pending" }]
}

GET /scrape/{batch_id}
Response:
{
  "batch_id": "uuid",
  "name": "Tournament Finals",
  "status": "processing",
  "jobs": [
    {
      "job_id": "uuid",
      "url": "...",
      "duelingbook_id": "123",
      "status": "completed",
      "replay_id": "uuid",
      "player1": "username1",
      "player2": "username2",
      "match_result": "2-0",
      "played_at": "2024-01-01T12:00:00Z",
      "format": "TCG"
    }
  ]
}
```

### Batches

```
GET /batches
Response:
{
  "batches": [
    {
      "id": "uuid",
      "name": "...",
      "created_at": "...",
      "replay_count": 5,
      "status": "completed"
    }
  ]
}
```

### Replays

```
GET /replays/{duelingbook_id}
Response:
{
  "replay_id": 123456,
  "played_at": "2017-11-18 23:37:23",
  "format": "...",
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
          {
            "card_id": 123,
            "card_name": "Card Name",
            "card_type": "Monster",
            "serial_number": 12345678,
            "card_amount": 2
          }
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

```
GET /players
Response:
{
  "players": [
    { "id": "uuid", "username": "...", "replay_count": 5 }
  ]
}

GET /players/{player_id}
Response:
{
  "id": "uuid",
  "username": "...",
  "replays": [
    {
      "id": "uuid",
      "duelingbook_id": "123",
      "url": "...",
      "opponent": "...",
      "match_result": "2-0",
      "played_at": "...",
      "format": "TCG"
    }
  ]
}
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
├── batch_id (FK → batches.id, indexed)
├── url (VARCHAR 512)
├── duelingbook_id (VARCHAR 64)
├── status (pending/processing/completed/failed)
├── replay_id (FK → replays.id, nullable)
├── error (TEXT, nullable)
├── created_at
└── updated_at

replays
├── id (UUID PK)
├── duelingbook_id (VARCHAR 64, unique, indexed)
├── url (VARCHAR 512)
├── raw_json (JSONB)
├── match_result (VARCHAR 16, nullable)
├── played_at (TIMESTAMP, nullable)
├── format (VARCHAR 64)
├── created_at
└── updated_at

players
├── id (UUID PK)
├── username (VARCHAR 255, unique, indexed)
├── created_at
└── updated_at

replay_players
├── id (UUID PK)
├── replay_id (FK → replays.id, indexed)
├── player_id (FK → players.id, indexed)
├── created_at
├── updated_at
└── UNIQUE(replay_id, player_id)
```

## Celery Worker

### Task: `scrape_replay_task`

```python
@celery_app.task(
    bind=True,
    autoretry_for=(CaptchaError, ScraperError),
    retry_kwargs={"max_retries": 3, "countdown": 5}
)
def scrape_replay_task(self, job_id_str: str, url: str) -> None:
```

**Flow:**

1. Update job status to PROCESSING
2. Check if replay exists in DB (cache hit)
   - If cached: reuse replay, ensure players extracted, mark COMPLETED
3. If new: scrape from DuelingBook
   - Solve captcha via CapSolver
   - Parse raw JSON for match_result, played_at
   - Create Replay, Player, ReplayPlayer records
   - Mark job COMPLETED
4. On CaptchaError/ScraperError: retry (max 3, 5s delay)
5. On final failure: mark job FAILED with error

### Worker Services

```python
get_or_create_player(session, username) -> Player
extract_players(session, replay, player1, player2) -> None
ensure_replay_parsed(session, replay) -> bool
```

## Configuration

```python
class Settings(BaseSettings):
    LOG_LEVEL: str = "INFO"
    DATABASE_URL: str = "postgresql://..."
    REDIS_URL: str = "redis://localhost:6379/0"

    @property
    def DATABASE_URL_ASYNC(self) -> str:
        # Converts to postgresql+asyncpg://
```

**Environment Variables:**

| Variable          | Description                    |
| ----------------- | ------------------------------ |
| DATABASE_URL      | PostgreSQL connection string   |
| REDIS_URL         | Redis connection string        |
| AUTH_PASSWORD     | App access password            |
| CAPSOLVER_API_KEY | CapSolver API key              |
| SITE_KEY          | DuelingBook reCAPTCHA site key |
| DB_USERNAME       | DuelingBook account username   |
| DB_PASSWORD       | DuelingBook account password   |
| DB_ID             | DuelingBook account ID         |
| DB_REGULAR        | DuelingBook account type       |

## Shared Packages

| Package   | Description                              |
| --------- | ---------------------------------------- |
| `db`      | SQLAlchemy models + session factories    |
| `logger`  | structlog configuration                  |
| `parser`  | Replay JSON parsing with Pydantic models |
| `scraper` | DuelingBook scraping + CapSolver         |

## Development

```bash
docker-compose up -d          # PostgreSQL + Redis
make dev                      # FastAPI dev server (:8000)
make worker                   # Celery worker
make check                    # ruff + ty (mypy)
make init-db                  # Create tables
make clear-db                 # Delete all data
```

## Design Decisions

- **Raw JSON only**: Scraping is expensive, parsing is cheap. Store raw, parse on-the-fly.
- **Persistent batches**: Batch URLs are shareable. Users can bookmark `/batch/{id}`.
- **Player IDs in URLs**: Usernames can have complex UTF-8, IDs are safer.
- **replay_players junction**: Enables efficient player lookup queries.
- **Redis for Celery only**: No app-level caching. Frontend uses TanStack Query.
- **Idempotent tasks**: Jobs can retry without side effects due to DB cache checks.
