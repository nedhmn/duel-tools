---
title: "Replay + Player Routes"
phase: 4
status: completed
created: 2026-03-18
completed: 2026-03-18
context_doc: null
description: "Replay + Player Routes"
---

## Tasks

- [x] `packages/parser/` - Refactored `date` → `played_at` as datetime
- [x] `packages/db/` - Added `match_result`, `played_at` columns to Replay model
- [x] `packages/db/` - Added indexes on `jobs.batch_id`, `replay_players.replay_id`, `replay_players.player_id`
- [x] Extract players during scrape (in worker task)
  - [x] `app/worker/services.py` - `get_or_create_player()`, `extract_players()`, `ensure_replay_parsed()`
  - [x] `app/worker/tasks.py` - Parse replay, store `match_result`/`played_at`, create player records
  - [x] Cache hit path backfills player records for legacy replays
- [x] `app/api/replays/` - Replay endpoints
  - [x] `models.py` - Re-exports ParsedReplay from parser package
  - [x] `routes.py` - `GET /replays/{duelingbook_id}`
- [x] `app/api/players/` - Player endpoints
  - [x] `models.py` - PlayerResponse, PlayerListResponse, ReplayMetadata, PlayerDetailResponse
  - [x] `routes.py` - `GET /players`, `GET /players/{player_id}`
- [x] `app/api/main.py` - Registered replays and players routers

## References

| Resource | Description |
| -------- | ----------- |
