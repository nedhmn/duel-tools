---
title: "Cron Package"
phase: 8
status: completed
created: 2026-03-18
completed: 2026-03-18
context_doc: null
description: "Scheduled FormLibrary replay sync with scrape pipeline and Railway cron deployment"
---

## Tasks

- [x] Package scaffold (`apps/cron/pyproject.toml`, `Makefile`)
- [x] Add workspace deps: `db`, `parser`, `scraper`, `logger`
- [x] Update Makefile: add `sync` and `sync-all` commands
- [x] `src/cron/__init__.py`
- [x] `src/cron/config.py` - Settings (DATABASE_URL, FL_ACCESS, FL_PLAYER_ID, FL_PLAYER_NAME)
- [x] `src/cron/sources/__init__.py`
- [x] `src/cron/sources/formatlibrary.py` - fetch_events, fetch_all_events, fetch_event_replays
- [x] `src/cron/db.py` - get_existing_ids, get_or_create_player, seed_replay (copy from seeder)
- [x] `src/cron/pipeline.py` - process_replay (scrape→parse→seed with asyncio.to_thread)
- [x] `scripts/sync_formatlibrary.py` - Main entrypoint with `--all` flag, aiometer concurrency (20)
- [x] `apps/cron/Dockerfile` - Standalone container (no CMD, specify at runtime)
- [x] `.github/workflows/deploy.yml` - Add `deploy-fl-cron` job for `duel-prep-fl-cron`
- [x] Update `docs/services/railway.md` - Document cron service

## References

| Resource                             | Description                |
| ------------------------------------ | -------------------------- |
| [Railway](../../services/railway.md) | Cron service configuration |
