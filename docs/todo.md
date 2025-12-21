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

### Phase 2: Database + Shared Packages ✅
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

### Phase 3: Scrape Routes + Celery Worker ✅
- [x] Update `app/core/config.py` - rename `ANTICAPTCHA_API_KEY` → `CAPSOLVER_API_KEY`
- [x] `app/api/deps.py` - `get_db` async session dependency (AsyncSession + yield)
- [x] `app/api/scrape/models.py` - Pydantic request/response models
- [x] `app/api/scrape/utils.py` - Helper functions (compute_batch_status, job_to_response)
- [x] `app/api/scrape/routes.py` - Scrape endpoints
  - `POST /scrape` - Validate, dedupe by duelingbook_id, create batch + jobs, queue tasks
  - `GET /scrape/{batch_id}` - Fetch batch, compute status from jobs
- [x] `app/worker/celery_app.py` - Celery config (Redis broker, task autodiscovery)
- [x] `app/worker/tasks.py` - `scrape_replay_task` with cache check, retry logic
- [x] `packages/db/` - Added sync session support (`create_sync_session_factory`, `psycopg2-binary`)
- [x] `scripts/init_db.py` - Database table creation script
- [x] `Makefile` - Added `worker`, `init-db` commands

### Phase 4: Replay + Player Routes ✅
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

**Design decisions:**
- Player extraction happens during scrape (parsing is cheap, keeps data consistent)
- `match_result` and `played_at` stored in DB during worker task (no repeated parsing)
- Replay endpoint uses `duelingbook_id` in URL (user-friendly, matches DuelingBook URLs)
- Player list returns all (client-side dropdown filter, <1000 players expected)
- Player detail returns lightweight metadata, not full parsed replays (avoids heavy responses)

### Phase 5a: Frontend Scaffold Alignment ✅
- [x] Simplify `main.tsx` (inline QueryClient, add Toaster, keep unified devtools)
- [x] Add Vite proxy: `/api/*` → `http://localhost:8000`
- [x] Rename `styles.css` → `index.css`
- [x] Create `CLAUDE.md` (multipolicy patterns: kebab-case, arrow functions, feature folders)
- [x] Delete boilerplate: `integrations/`, `Header.tsx`, `demo/`, `logo.svg`, `reportWebVitals.ts`
- [x] Install shadcn components + Zustand

### Phase 5b: Core Infrastructure ✅
- [x] API types (`features/api/types.ts`) + fetch util (`lib/fetch.ts`)
- [x] Theme toggle with Zustand + localStorage (`features/theme/`)
- [x] Root layout with Sidebar + SidebarInset (`features/layout/`, `routes/__root.tsx`)
- [x] Index redirect to `/scrape`

### Phase 5c: Scrape + Batch Features
- [ ] Scrape page (`/scrape`): textarea + "Extract URLs" button + removable badges
- [ ] Batch page (`/scrape/$batchId`): polling (2s), progress display, inline replay viewer when complete
- [ ] Replay navigation: prev/next within batch

### Phase 5d: Replay Feature
- [ ] Replay view component (`features/replay/`): games as rows, card grids side-by-side, total row (capped at 3)
- [ ] Card images: `https://images.duelingbook.com/low-res/{card_id}.jpg`
- [ ] Single replay page (`/replays/$duelingbookId`)

### Phase 5e: Player Feature + Polish
- [ ] Player search in sidebar (cmdk Command in Popover)
- [ ] Player page (`/players/$playerId`): replay list with opponent, date, match_result
- [ ] Loading states (Skeleton) throughout
- [ ] Error handling (Toast, Alert for failed jobs)

**Stack:** Vite + React 19 + TypeScript, TanStack Router/Query, Zustand, Tailwind v4, shadcn/ui, Biome

**Route Structure:**
```
routes/
├── __root.tsx              # Sidebar + SidebarInset layout
├── index.tsx               # Redirect to /scrape
├── scrape/
│   ├── index.tsx           # URL submission form
│   └── $batchId.tsx        # Batch polling + inline replay viewer
├── players/
│   └── $playerId.tsx       # Player's replays
└── replays/
    └── $duelingbookId.tsx  # Single replay detail
```

**Replay View Mockup:**
```
┌─────────────────────────────────────────────────────────┐
│  Match: Player1 vs Player2    Result: 2-1               │
│  ◀ Prev  [Replay 1 of 3]  Next ▶   (if in batch)        │
├─────────────────────────────────────────────────────────┤
│  Game 1 - Winner: Player1 | Went First: Player2         │
│  [Player1 Cards Grid]    [Player2 Cards Grid]           │
├─────────────────────────────────────────────────────────┤
│  Game 2 - ...                                           │
├─────────────────────────────────────────────────────────┤
│  TOTAL CARDS SEEN (max 3 per card)                      │
│  [Player1 Total Grid]    [Player2 Total Grid]           │
└─────────────────────────────────────────────────────────┘
```

### Phase 6: replay-viewer App
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
