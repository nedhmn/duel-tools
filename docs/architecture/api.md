---
title: "API"
description: "Backend architecture: request flow, database schema, worker pipeline, and key design decisions"
created: 2026-03-18
---

# API

FastAPI + Celery backend for DuelingBook replay scraping and analysis.

## Table of Contents

- [API](#api)
  - [Table of Contents](#table-of-contents)
  - [Key Decisions](#key-decisions)
  - [Project Structure](#project-structure)
  - [Request Flow](#request-flow)
  - [Database Schema](#database-schema)
  - [Worker Pipeline](#worker-pipeline)
  - [References](#references)

## Key Decisions

| Decision                           | Rationale                                                                                                 |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Raw JSON storage, parse on-the-fly | Scraping is expensive, parsing is cheap. Parser can evolve without migrations — just re-parse stored JSON |
| Persistent batches                 | Batch URLs are shareable — users can bookmark `/batch/{id}`                                               |
| Player IDs in URLs (not usernames) | Usernames can contain complex UTF-8, UUIDs are safer for routing                                          |
| `replay_players` junction table    | Enables efficient player lookup queries without scanning replay JSON                                      |
| Redis for Celery only              | No app-level caching — frontend uses TanStack Query for client-side cache                                 |
| Idempotent tasks                   | Jobs can retry without side effects due to DB-level replay cache checks                                   |

## Project Structure

```
api/
├── app/
│   ├── main.py              # FastAPI app, static serving, CORS
│   ├── api/                  # Feature-based route modules
│   │   ├── main.py           # Router aggregation
│   │   ├── deps.py           # Shared dependencies (db session)
│   │   └── {feature}/        # routes.py + models.py per feature
│   ├── core/                 # Config, rate limiting, logging
│   └── worker/               # Celery app, tasks, services
├── scripts/                  # DB management scripts
└── static/                   # Frontend build (production only)
```

Each feature module (`scrape/`, `batches/`, `replays/`, `players/`, `health/`) exports a `router = APIRouter()` with colocated Pydantic request/response models.

## Request Flow

All routes sit under `/api/v1`. Every route except `/health` requires an `X-Auth-Password` header. Rate limiting is 200 requests/minute per IP via slowapi.

| Concern         | Pattern                                                 |
| --------------- | ------------------------------------------------------- |
| Auth            | `X-Auth-Password` header checked by middleware          |
| Rate limiting   | Global 200/min per IP (slowapi)                         |
| DB sessions     | Async dependency via `get_db` in `deps.py`              |
| Response models | Pydantic models colocated in each feature's `models.py` |
| OpenAPI docs    | Disabled in production                                  |

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

## Worker Pipeline

The `scrape_replay_task` Celery task processes one replay URL per job with automatic retry on `CaptchaError` and `ScraperError` (max 3 retries, 5s delay).

| Step | Action                                                                     |
| ---- | -------------------------------------------------------------------------- |
| 1    | Mark job as PROCESSING                                                     |
| 2    | Check if replay exists in DB (cache hit) — if so, reuse and mark COMPLETED |
| 3    | Scrape from DuelingBook (solve Turnstile via CapSolver)                    |
| 4    | Parse raw JSON for `match_result`, `played_at`, `format`                   |
| 5    | Create Replay, Player, ReplayPlayer records                                |
| 6    | Mark job COMPLETED (or FAILED on final failure)                            |

Helper services (`get_or_create_player`, `extract_players`) handle player record management to keep the task focused on orchestration.

## References

| Resource                                      | Description                              |
| --------------------------------------------- | ---------------------------------------- |
| [Development guide](../guides/development.md) | Local setup, running commands            |
| [Deploy guide](../guides/deploy.md)           | Dockerfile, CI/CD, environment variables |
| [Railway](../services/railway.md)             | Production service configuration         |
