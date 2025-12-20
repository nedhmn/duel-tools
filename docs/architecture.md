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

```bash
User → Input URLs → Backend → Queue scrape jobs → Celery workers
                                                       ↓
                                              Scrape DuelingBook
                                                       ↓
                              Display ← Parse ← Store raw JSON in DB
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

```bash
replays
├── id (UUID PK)
├── duelingbook_id (unique)
├── url
├── raw_json (JSONB)
├── created_at
└── updated_at

players
├── id (UUID PK)
├── username
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

- **Raw JSON only**: Scraping is expensive, parsing is cheap. Store raw scraped data, parse on-the-fly when displaying.
- **players table**: Stores unique players. API uses player IDs (not usernames) in URLs since usernames can have complex UTF-8 characters.
- **replay_players junction table**: Enables player lookup mode. A player can be in either position, so we extract both player IDs to this table.
- **Shared database**: Both apps use the same PostgreSQL instance.

## Shared Packages

```
packages/
└── parser/     # Shared replay parsing logic
                # Used by both duel-prep and replay-viewer
```

## External Dependencies

- **DuelingBook API**: Source of replay data (requires captcha solving)
- **AntiCaptcha**: Service to solve DuelingBook's reCAPTCHA
