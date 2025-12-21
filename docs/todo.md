# Project TODO

## Current Phase

### Phase 1: Backend Setup (duel-prep) ✅
- [x] Core infrastructure (`app/core/`)
  - [x] `config.py` - pydantic-settings (DATABASE_URL, REDIS_URL, CAPSOLVER_API_KEY, etc.)
  - [x] `logging.py` - refactored to use shared `packages/logger`
- [x] API scaffold (`app/api/`)
  - [x] `main.py` - public_router
  - [x] `health/routes.py` - GET /health
- [x] `app/main.py` - FastAPI app with CORS, logging middleware
- [x] `Makefile` - dev, check commands

### Phase 2: Database + Shared Packages
- [x] `packages/db/` - SQLAlchemy models (Batch, Job, Replay, Player, ReplayPlayer)
- [x] `packages/logger/` - Shared structlog configuration
- [x] `packages/parser/` - Replay JSON parsing logic
  - [x] Adapted from `github.com/nedhmn/gfwl-data` → `gfwldata/transformers/replay_parser.py`
  - [x] Pandas for aggregations (groupby, cumsum, cummax)
  - [x] No ML deck prediction - just pandas + pydantic
  - [x] Card ID extraction: name→id lookup from `cards` arrays in plays
  - [x] Pydantic models: ParsedReplay, Game, PlayerCards, CardInfo
  - [x] Game boundaries via "Chose to go first" cumsum
  - [x] Winner detection via "Admitted defeat" / "Lost Duel"
  - [x] Card extraction via regex, deck change tracking
  - [x] Derived fields: card_count, match_result
  - [x] CLI script: `scripts/parse_replay.py`
- [x] `packages/scraper/` - DuelingBook scraping with CapSolver
  - [x] `src/scraper/client.py` - `scrape_replay()`, `extract_replay_id()`, captcha solving
  - [x] `src/scraper/exceptions.py` - CaptchaError, ScraperError
  - [x] `src/scraper/capsolver_task.json` - reCAPTCHA v2 task config (anchor/reload from CapSolver support)
  - [x] CLI script: `scripts/scrape_replay.py`

### Phase 3: Scrape Routes + Celery Worker
- [ ] Update `app/core/config.py` - rename `ANTICAPTCHA_API_KEY` → `CAPSOLVER_API_KEY`
- [ ] `app/api/scrape/models.py` - Pydantic request/response models
  - `ScrapeRequest`: urls (list[str], max 50, dedupe)
  - `ScrapeResponse`: batch_id, jobs[]
  - `BatchStatusResponse`: batch_id, status (computed), jobs[]
  - `JobResponse`: job_id, url, status, replay_id?, error?
- [ ] `app/api/scrape/routes.py` - Scrape endpoints
  - `POST /scrape`:
    - Validate URLs (max 50, dedupe silently, extract duelingbook_id)
    - Create Batch + Jobs (status=pending) in DB
    - Queue Celery task per job
    - Return batch_id + jobs
  - `GET /scrape/{batch_id}`:
    - Fetch batch + jobs
    - Compute batch status from jobs (all completed? any pending/processing?)
    - Return batch with jobs
- [ ] `app/api/deps.py` - `get_db` async session dependency (AsyncSession + yield)
- [ ] `app/worker/celery_app.py` - Celery config (Redis broker from settings.REDIS_URL)
- [ ] `app/worker/tasks.py` - `scrape_replay_task`
  - `@task(autoretry_for=(Exception,), retry_kwargs={'max_retries': 3})`
  - Use **sync** SQLAlchemy session (Celery runs sync, not async)
  - Update job status → processing
  - Check cache: if `replays.duelingbook_id` exists, link + complete (short-circuit)
  - Call `scraper.scrape_replay()` (sync, blocking)
  - Save to `replays` table, link job, mark completed
  - On final failure: mark job as failed with error message

**Design decisions:**
- API routes use AsyncSession, worker uses sync Session (different contexts)
- Cache check at worker (idempotent consumer pattern)
- Batch status computed on-the-fly (no status column in batches table)
- 3 retries, no backoff via `autoretry_for` (simpler than manual retry)
- Dedupe URLs silently within batch
- Use `Field(max_length=50)` for URL list validation

### Phase 5: Replay + Player Routes
- [ ] `GET /replays/{replay_id}` - Parse raw JSON, return structured response
- [ ] `GET /players` - List all players
- [ ] `GET /players/{player_id}` - Get player with their replays

### Phase 6: Frontend (duel-prep)
- [ ] Vite + React + TypeScript scaffold
- [ ] Tailwind + shadcn/ui
- [ ] URL input form
- [ ] Batch status polling UI
- [ ] Replay display with card images

### Phase 7: replay-viewer App
- [ ] Backend: `POST /parse` endpoint
- [ ] Frontend: JSON upload + display

---

## References

### Internal Docs
- `docs/project-overview.md` - Project overview
- `docs/architecture.md` - System architecture + DB schema
- `docs/api-spec.md` - API endpoints
- `apps/duel-prep/backend/CLAUDE.md` - Backend dev guidelines

### External Reference Repos
- `github.com/nedhmn/replay-scraper-api` - Scraping patterns
- `github.com/nedhmn/gfwl-data` - Parser logic
- `github.com/nedhmn/multipolicy/tree/main/apps/local/backend` - FastAPI patterns

---

**Note:** This is a high-level roadmap. Future sessions may break down items into finer phases as needed (e.g., parser and scraper could be separate phases).
