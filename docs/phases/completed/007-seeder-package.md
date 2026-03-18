---
title: "Seeder Package"
phase: 7
status: completed
created: 2026-03-18
completed: 2026-03-18
context_doc: null
description: "Seeder Package"
---

## Tasks

- [x] `packages/seeder/` - Bulk import from AWS S3
- [x] Async: aioboto3 for S3, asyncpg for DB
- [x] Concurrency: aiometer `run_on_each()` with `max_at_once=20`
- [x] Per-replay processing: download → parse → insert → commit (own session)
- [x] Pre-filters duplicates by querying existing `duelingbook_id`s
- [x] `src/seeder/config.py` - Settings (DATABASE_URL, S3_*, AWS_*)
- [x] `src/seeder/loaders/s3.py` - `list_keys()`, `download_replay()`, `extract_replay_id()`
- [x] `src/seeder/db.py` - `get_existing_ids()`, `get_or_create_player()`, `seed_replay()`
- [x] `scripts/seed_s3.py` - Main entrypoint

## References

| Resource | Description |
| -------- | ----------- |
