---
title: "Database + Shared Packages"
phase: 2
status: completed
created: 2026-03-18
completed: 2026-03-18
context_doc: null
description: "Database + Shared Packages"
---

## Tasks

- [x] `packages/db/` - SQLAlchemy models (Batch, Job, Replay, Player, ReplayPlayer)
- [x] `packages/logger/` - Shared structlog configuration
- [x] `packages/parser/` - Replay JSON parsing logic
  - [x] Adapted from `github.com/nedhmn/gfwl-data` → `gfwldata/transformers/replay_parser.py`
  - [x] Pandas for aggregations (groupby, cumsum, cummax)
  - [x] Pydantic models: ParsedReplay, Game, PlayerCards, CardInfo
  - [x] Game boundaries via "Chose to go first" cumsum
  - [x] Winner detection via "Admitted defeat" / "Lost Duel"
  - [x] Card extraction via regex, deck change tracking
  - [x] CLI script: `scripts/parse_replay.py`
- [x] `packages/scraper/` - DuelingBook scraping with CapSolver
  - [x] `src/scraper/client.py` - `scrape_replay()`, `extract_replay_id()`, captcha solving
  - [x] `src/scraper/exceptions.py` - CaptchaError, ScraperError
  - [x] `src/scraper/capsolver_task.json` - reCAPTCHA v2 task config
  - [x] CLI script: `scripts/scrape_replay.py`

## References

| Resource | Description |
| -------- | ----------- |
