# Project TODO

## Current Phase

### Phase 1: Backend Setup (duel-prep) ✅
- [x] Core infrastructure (`app/core/`)
  - [x] `config.py` - pydantic-settings (DATABASE_URL, REDIS_URL, ANTICAPTCHA_API_KEY, etc.)
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
- [ ] `packages/scraper/` - DuelingBook scraping with anticaptcha

### Phase 3: Scrape Routes
- [ ] `POST /scrape` - Submit URLs, create batch + jobs, queue Celery tasks
- [ ] `GET /scrape/{batch_id}` - Poll batch status

### Phase 4: Celery Worker
- [ ] `app/worker/celery_app.py` - Celery config
- [ ] `app/worker/tasks.py` - scrape_replay task with retry logic

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
