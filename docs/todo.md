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

### Phase 5f: Global Search + Player Feature ✅

**Bug Fix: URL Parsing** ✅
- [x] Fix `ScrapeSheet` regex to capture full ID: `id=(\d+(?:-\d+)?)`
- [x] Fixed textarea overflow in ScrapeSheet (fixed height with scroll)

**Header Refactor (breadcrumbs)** ✅
- [x] Install shadcn breadcrumb
- [x] Refactor `SiteHeader` to use breadcrumbs instead of plain title
- [x] Props: `breadcrumbs: { label: string, href?: string }[]`
- [x] Updated batch routes with proper breadcrumb navigation

**Global Search (header)** ✅
- [x] Create `features/search/global-search.tsx` - unified search component
  - Trigger button in header with ⌘K shortcut
  - Two groups: "Batches" and "Players" (dummy data for now)
- [x] Add GlobalSearch to `SiteHeader` (right side, before theme toggle)
- [x] Remove `BatchSearch` from sidebar (kept recent batches list)
- [ ] Wire to API: fetches `/batches` + `/players` (pending backend)

**Players Index (`/players`)** ✅
- [x] Create route `routes/players/index.tsx`
- [x] Empty state with ⌘K hint to search

**Player Page (`/players/$player-id`)** ✅
- [x] Create route `routes/players/$player-id.tsx`
- [x] Header: player username + total games count
- [x] Inline replay viewer with prev/next navigation
- [x] Create `features/players/api.ts` with `usePlayerDetail(playerId)` (dummy data)
- [ ] Replay list with metadata (pending backend for real data)

**Shareable Replay URLs (query param)** ✅
- [x] Batch page: `/batch/$batch-id?replay=duelingbook_id`
- [x] Player page: `/players/$player-id?replay=duelingbook_id`
- [x] Derive `currentIndex` from URL search param instead of `useState`
- [x] On prev/next: update URL search param (replace, not push)
- [x] Add `validateSearch` to routes (plain function, not zodValidator due to zod 4.x incompatibility)

**Player Navigation** ✅
- [x] Make player names in `ReplayView` clickable via `playerLinks` prop
- [x] Created `PlayerName` helper component with Link support
- [ ] Wire player IDs from API (pending backend update)

**Notes:**
- Removed `@tanstack/zod-adapter` usage due to zod 4.x incompatibility (expects 3.x)
- Using plain `validateSearch` functions instead
- Added `stripQuotes` helper to handle potential quoted duelingbook_id values from API

### Phase 5g: Backend Integration

**Parser Update**
- [ ] Update `packages/parser/` to extract `card_type` from raw JSON
  - Add `card_type: str` to `CardInfo` model (e.g., "monster", "spell", "trap")
  - Extract from `cards` array in replay data
- [ ] Update frontend `CardInfo` type to include `card_type`
- [ ] Update `CardGrid` to sort by: card_type (monster → spell → trap) then alphabetical

**New Endpoints**
- [ ] `GET /batches` - List recent batches
  - Response: `{ batches: [{ id, name, created_at, replay_count }] }`
  - Ordered by `created_at` desc, limit 50
- [ ] Update `GET /players` - Add `replay_count` to each player for global search
- [ ] Update `POST /scrape` - Accept `name` field
  - Request: `{ urls: [...], name: "Tournament Finals" }`
  - Store in `batches.name` column (add migration)
- [ ] Update `GET /scrape/{batch_id}` - Return batch name
  - Add `name` field to `BatchStatusResponse`
- [ ] Update `GET /replays/{duelingbook_id}` - Include player IDs
  - Add `player1_id`, `player2_id` to response for navigation

**Database Changes**
- [ ] Add `name` column to `batches` table (nullable, varchar)
- [ ] Migration script or ALTER TABLE

**Frontend Wiring**
- [ ] Update `ScrapeSheet` to send `name` field
- [ ] Update `BatchStatusResponse` type to include `name`
- [ ] Sidebar recent batches → `useBatches()` query
- [ ] Global search → `useBatches()` + `usePlayers()` queries
- [ ] Batch page header → show batch name instead of truncated ID

### Phase 5h: Polish

**Error Handling**
- [ ] Toast notification for failed scrape jobs (via Sonner)
- [ ] Auto-skip failed jobs in replay navigation
- [ ] Show "X of Y succeeded" summary when batch has failures

**Responsive Design**
- [ ] Card grid: 8 cols desktop → 6 cols tablet → 4 cols mobile
- [ ] Test sidebar collapse on mobile

**UX Improvements**
- [ ] Loading skeleton for player page
- [ ] Empty state for player with no replays
- [ ] Keyboard navigation hints in global search
- [ ] Batch progress during polling
  - Install shadcn Progress: `pnpm dlx shadcn@latest add progress`
  - Show "3 of 5 completed" text + Progress bar
  - Replace current "Processing..." text

**Stack:** Vite + React 19 + TypeScript, TanStack Router/Query, Zustand, Tailwind v4, shadcn/ui, Ultracite (Biome)

**Route Structure:**
```
routes/
├── __root.tsx              # Sidebar + SidebarInset layout, GlobalSearch in header
├── index.tsx               # Redirect to /batch
├── batch/
│   ├── index.tsx           # Empty state, prompts to create batch
│   └── $batch-id.tsx       # Batch polling + inline replay viewer
└── players/
    ├── index.tsx           # Empty state: "Use search to find a player"
    └── $player-id.tsx      # Player profile + replay list with inline viewer
```

**Header Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│ Batch / Tournament Finals     [🔍 Search...  ⌘K] [◐]       │
│ ↑ breadcrumbs                 ↑ GlobalSearch     ↑ ThemeToggle
└─────────────────────────────────────────────────────────────┘
```

**Sidebar Structure:**
```
┌─────────────────────────┐
│ Duel Prep         [□]   │  ← clickable home link + collapse toggle
├─────────────────────────┤
│ [+ New Batch]           │  ← outline button, opens sheet
├─────────────────────────┤
│ Recent Batches          │
│ ├── Tournament Finals 3 │  ← clickable, shows count (from API)
│ ├── Practice Session  5 │
│ └── Ladder Games      2 │
└─────────────────────────┘
```

**Replay View Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│ Player1 vs Player2                        ◀ [1 of 3] ▶      │
│ ↑ clickable (→ /players/$id)                                │
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
