# Architecture

## System Overview

```bash
┌─────────────────────────────────────────────────────────┐
│                      duel-tools                         │
├─────────────────────────┬───────────────────────────────┤
│      duel-prep          │       replay-viewer           │
│  ┌─────────┐ ┌───────┐  │  ┌─────────┐ ┌───────┐        │
│  │Frontend │ │Backend│  │  │Frontend │ │Backend│        │
│  │ (React) │ │(Fast- │  │  │ (React) │ │(Fast- │        │
│  └────┬────┘ │ API)  │  │  └────┬────┘ │ API)  │        │
│       │      └───┬───┘  │       │      └───┬───┘        │
└───────┼──────────┼──────┴───────┼──────────┼────────────┘
        │          │              │          │
        │    ┌─────┴─────┐        │          │
        │    │  Celery   │        │          │
        │    │  + Redis  │        │          │
        │    └─────┬─────┘        │          │
        │          │              │          │
        └──────────┼──────────────┴──────────┘
                   │
           ┌───────┴───────┐
           │  PostgreSQL   │\
           │   (shared)    │
           └───────────────┘
```

## Data Flows

### duel-prep: Regular Mode

```
User submits URLs
    ↓
POST /scrape
    ↓
Create batch + jobs in PostgreSQL
    ↓
Queue Celery tasks → return batch_id
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

### duel-prep: Player Lookup Mode

```bash
User → Select player from dropdown → Backend queries replay_players
                                              ↓
                      Display ← Parse ← Fetch matching replays from DB
```

### replay-viewer

```bash
User → Upload JSON → Backend → Parse → Display
```

## Database Schema

```
batches
├── id (UUID PK)
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

- **Persistent batches**: Batch URLs are shareable. Users can bookmark /batch/{id} and return later.
- **Raw JSON only**: Scraping is expensive, parsing is cheap. Store raw scraped data, parse on-the-fly when displaying.
- **players table**: Stores unique players. API uses player IDs (not usernames) in URLs since usernames can have complex UTF-8 characters.
- **replay_players junction table**: Enables player lookup mode. A player can be in either position, so we extract both player IDs to this table.
- **Shared database**: Both apps use the same PostgreSQL instance.
- **Redis for Celery only**: No app-level caching. Frontend uses TanStack Query for client-side caching.

## Shared Packages

```
packages/
├── parser/
├── scraper/
└── db/
```

- **parser** - Replay JSON parsing logic
- **scraper** - DuelingBook scraping logic
- **db** - Database models and connection

## External Dependencies

- **DuelingBook API**: Source of replay data (requires captcha solving)
- **AntiCaptcha**: Service to solve DuelingBook's reCAPTCHA
