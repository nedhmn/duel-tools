---
title: "Scrape Routes + Celery Worker"
phase: 3
status: completed
created: 2026-03-18
completed: 2026-03-18
context_doc: null
description: "Scrape Routes + Celery Worker"
---

## Tasks

- [x] `app/api/deps.py` - `get_db` async session dependency
- [x] `app/api/scrape/models.py` - Pydantic request/response models
- [x] `app/api/scrape/utils.py` - compute_batch_status, job_to_response
- [x] `app/api/scrape/routes.py` - Scrape endpoints
  - [x] `POST /scrape` - Validate, dedupe by duelingbook_id, create batch + jobs, queue tasks
  - [x] `GET /scrape/{batch_id}` - Fetch batch, compute status from jobs
- [x] `app/worker/celery_app.py` - Celery config (Redis broker, task autodiscovery)
- [x] `app/worker/tasks.py` - `scrape_replay_task` with cache check, retry logic
- [x] `packages/db/` - Added sync session support (`create_sync_session_factory`)
- [x] `scripts/init_db.py` - Database table creation script
- [x] `Makefile` - Added `worker`, `init-db` commands

## References

| Resource | Description |
| -------- | ----------- |
