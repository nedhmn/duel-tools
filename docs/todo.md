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

### Phase 5c: Batch Features ✅
- [x] Routes renamed from `/scrape` to `/batch`
- [x] Batch page (`/batch/$batch-id`): polling (2s), progress display, inline replay viewer when complete
- [x] Replay navigation: prev/next within batch
- [x] Batch header shows batch ID (will show name when backend supports it)

### Phase 5d: Replay Feature ✅
- [x] Replay view component (`features/replay/`): games as rows, card grids side-by-side, total cards section
- [x] Card images: `https://images.duelingbook.com/low-res/{card_id}.jpg` (8 columns, 3px gap)
- [x] Game rows with subtle borders, player sections with muted backgrounds
- [x] Replay metadata: player names, result, DuelingBook URL with external link
- [x] ~~Single replay page~~ - Not needed; replays always viewed in context (batch or player)

### Phase 5e: Sidebar + UX ✅
- [x] Sidebar header: "Duel Prep" clickable link to /batch
- [x] "New Batch" button (outline variant) opens ScrapeSheet
- [x] ScrapeSheet: batch name input (required) + URL paste/extract
- [x] Batch search: cmdk CommandDialog (⌘K), dummy data for now
- [x] Recent batches list: name, count, clickable links
- [x] Collapsed sidebar: icon-only support
- [x] App metadata: title "Duel Prep", description for SEO
- [x] Loading states (Skeleton)

### Phase 5f: Player Feature
- [ ] Player page (`/players/$playerId`): replay list, prev/next navigation through player's replays
- [ ] Player search in sidebar (separate from batch search, or combined?)

### Phase 5g: Backend Integration
- [ ] `GET /batches` - List recent batches (name, date, replay count)
- [ ] `POST /scrape` - Accept `name` field for batch
- [ ] `GET /scrape/{batch_id}` - Return batch name in response
- [ ] Wire up batch search to real API
- [ ] Wire up recent batches sidebar to real API

### Phase 5h: Polish
- [ ] Error handling (Toast, Alert for failed jobs)
- [ ] More replay metadata (format, played_at date, etc.)
- [ ] Responsive card grid columns (fewer on mobile)

**Stack:** Vite + React 19 + TypeScript, TanStack Router/Query, Zustand, Tailwind v4, shadcn/ui, Ultracite (Biome)

**Route Structure:**
```
routes/
├── __root.tsx              # Sidebar + SidebarInset layout
├── index.tsx               # Redirect to /batch
├── batch/
│   ├── index.tsx           # Empty state, prompts to create batch
│   └── $batch-id.tsx       # Batch polling + inline replay viewer
└── players/
    └── $player-id.tsx      # Player's replays with prev/next navigation
```

**Sidebar Structure:**
```
┌─────────────────────────┐
│ Duel Prep         [□]   │  ← clickable home link + collapse toggle
├─────────────────────────┤
│ [+ New Batch]           │  ← outline button, opens sheet
├─────────────────────────┤
│ [🔍 Search...    ⌘K]    │  ← opens CommandDialog
├─────────────────────────┤
│ Recent Batches          │
│ ├── Tournament Finals 3 │  ← clickable, shows count
│ ├── Practice Session  5 │
│ └── Ladder Games      2 │
└─────────────────────────┘
```

**Replay View Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│ Player1 vs Player2                        ◀ [1 of 3] ▶      │
│ Result: 2-0 · https://duelingbook.com/replay?id=123 ↗       │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Game 1  Winner: Player1 | First: Player2                │ │
│ │ ┌─────────────────────┐ ┌─────────────────────┐         │ │
│ │ │ Player1 (38)        │ │ Player2 (40)        │         │ │
│ │ │ [card grid 8 cols]  │ │ [card grid 8 cols]  │         │ │
│ │ └─────────────────────┘ └─────────────────────┘         │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Game 2  ...                                             │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Total Cards Seen                                        │ │
│ │ ┌─────────────────────┐ ┌─────────────────────┐         │ │
│ │ │ Player1             │ │ Player2             │         │ │
│ │ │ [card grid]         │ │ [card grid]         │         │ │
│ │ └─────────────────────┘ └─────────────────────┘         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
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
- `apps/duel-prep/frontend/CLAUDE.md` - Frontend dev guidelines

### External Reference Repos
- `github.com/nedhmn/replay-scraper-api` - Scraping patterns
- `github.com/nedhmn/gfwl-data` - Parser logic
- `github.com/nedhmn/multipolicy/tree/main/apps/local/backend` - FastAPI patterns
- `github.com/nedhmn/multipolicy/tree/main/apps/local/frontend` - React/TanStack patterns

---

**Note:** This is a high-level roadmap. Future sessions may break down items into finer phases as needed (e.g., parser and scraper could be separate phases).
