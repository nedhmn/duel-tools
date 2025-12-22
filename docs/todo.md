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
- [x] Wire to API: fetches `/batches` + `/players`

**Players Index (`/players`)** ✅
- [x] Create route `routes/players/index.tsx`
- [x] Empty state with ⌘K hint to search

**Player Page (`/players/$player-id`)** ✅
- [x] Create route `routes/players/$player-id.tsx`
- [x] Header: player username + total games count
- [x] Inline replay viewer with prev/next navigation
- [x] Create `features/players/api.ts` with `usePlayerDetail(playerId)`
- [x] Wired to real backend API

**Shareable Replay URLs (query param)** ✅
- [x] Batch page: `/batch/$batch-id?replay=duelingbook_id`
- [x] Player page: `/players/$player-id?replay=duelingbook_id`
- [x] Derive `currentIndex` from URL search param instead of `useState`
- [x] On prev/next: update URL search param (replace, not push)
- [x] Add `validateSearch` to routes (plain function, not zodValidator due to zod 4.x incompatibility)

**Player Navigation** ✅
- [x] Make player names in `ReplayView` clickable via `playerLinks` prop
- [x] Created `PlayerName` helper component with Link support
- [x] Wire player IDs from API (`player1_id`, `player2_id` in replay response)

**Notes:**
- Removed `@tanstack/zod-adapter` usage due to zod 4.x incompatibility (expects 3.x)
- Using plain `validateSearch` functions instead
- Added `stripQuotes` helper to handle potential quoted duelingbook_id values from API

### Phase 5g: Backend Integration ✅

**Parser Update** ✅
- [x] Update `packages/parser/` to extract `card_type` from raw JSON
  - Added `card_type: str` to `CardInfo` model
  - Extract from `cards` array in replay data (stores `(id, card_type)` tuples)
  - Fixed Maxx "C" bug: now extracts card info directly from `card` object in plays
- [x] Update frontend `CardInfo` type to include `card_type`
- [x] Update `CardGrid` to sort by: card_type (Monster → Spell → Trap) then alphabetical

**New Endpoints** ✅
- [x] `GET /batches` - List recent batches
  - Response: `{ batches: [{ id, name, created_at, replay_count }] }`
  - Ordered by `created_at` desc, limit 50
- [x] Update `GET /players` - Add `replay_count` to each player for global search
- [x] Update `POST /scrape` - Accept `name` field
  - Request: `{ urls: [...], name: "Tournament Finals" }`
  - Store in `batches.name` column
- [x] Update `GET /scrape/{batch_id}` - Return batch name
  - Added `name` field to `BatchStatusResponse`
- [x] Update `GET /replays/{duelingbook_id}` - Include player IDs
  - Added `player1_id`, `player2_id` to response for navigation

**Database Changes** ✅
- [x] Add `name` column to `batches` table (varchar 255)
- [x] Migration: `ALTER TABLE batches ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT '';`

**Frontend Wiring** ✅
- [x] Update `ScrapeSheet` to send `name` field
- [x] Update `BatchStatusResponse` type to include `name`
- [x] Sidebar recent batches → `useBatches()` query
- [x] Global search → `useBatches()` + `usePlayerList()` queries
- [x] Added `BatchSummary`, `BatchListResponse` types

### Phase 5h: Polish ✅

**App Rename** ✅
- [x] Renamed "Duel Prep" → "Duel Tools" (sidebar, HTML title)
- [x] Removed theme toggle - default dark mode only
- [x] Added `class="dark"` to HTML for instant dark mode (no flash)

**DataTable Improvements** ✅
- [x] Batch index: sortable headers, pagination (default 10), page size selector
- [x] Players index: sortable headers + "View" action button
- [x] Column filter buttons in table headers (popover with text input)
- [x] Added `DataTableColumnFilter` component (`src/components/data-table-column-filter.tsx`)

**Batch Processing UI** ✅
- [x] Created centered `BatchProcessing` component (replaces progress bar/job list)
  - Spinner icon, status text ("Processing replays... X of Y"), progress bar with percentage
- [x] Sidebar shows spinner for processing/pending batches
- [x] Sidebar refreshes when batch completes (query invalidation)

**Card Grid Styling** ✅
- [x] Double grid lines with 3px gap between cards
- [x] Subtle borders: `border-white/[0.06]` on cards, `border-white/[0.04]` on empty slots
- [x] Hover effects: border brightens on hover
- [x] No rounded borders on cards
- [x] Minimum 32 slots with empty bordered placeholders
- [x] Rows auto-extend: both player grids match max rows in section
- [x] Removed gray backgrounds from card containers

**Replay View Updates** ✅
- [x] Card count shown next to player names in "Total Cards Seen" section
- [x] Both player grids in each section sync to same row count

**Remaining Polish** ✅
- [x] Toast notification for failed scrape jobs (via Sonner)
- [x] Failed jobs excluded from replay navigation (filtered to completed only)
- [x] Loading skeleton for player page

### Phase 5i: YDK Export & UX Polish ✅

**YDK Deck Export** ✅
- [x] Added `serial_number` field to `CardInfo` model (parser + frontend types)
- [x] Parser extracts `serial_number` from card objects in raw JSON
- [x] "Download deck" button next to player name + count (games + total cards sections)
- [x] YDK file format: sorted by type (Monster → Spell → Trap → alphabetical)
- [x] Max 3 copies per card in export, filename: `{player}_{date}.ydk`

**Parser Bug Fix** ✅
- [x] Fixed `_get_went_first()` to handle "Chose to go second" case
- [x] Now returns the other player when RPS winner chose to go second

**Page Transition UX** ✅
- [x] Added `keepPreviousData` to `useReplay` hook (TanStack Query)
- [x] Previous replay stays visible while fetching next (no layout shift)
- [x] Opacity fade + pointer-events-none during transition
- [x] Skeleton only shows on initial load, not between replays

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
│ Batch / Tournament Finals           [🔍 Search...  ⌘K]      │
│ ↑ breadcrumbs                       ↑ GlobalSearch          │
└─────────────────────────────────────────────────────────────┘
```

**Sidebar Structure:**
```
┌─────────────────────────┐
│ Duel Tools        [□]   │  ← clickable home link + collapse toggle
├─────────────────────────┤
│ [+ New Batch]           │  ← outline button, opens sheet
├─────────────────────────┤
│ Recent Batches          │
│ ├── ◐ Processing...   0 │  ← spinner for pending/processing
│ ├── Tournament Finals 3 │  ← clickable, shows count (from API)
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
│ │ │ Player1 (38)  ↓deck │ │ Player2 (40)  ↓deck │         │ │
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
│ │ │ Player1 (42)  ↓deck │ │ Player2 (45)  ↓deck │         │ │
│ │ │ [card grid]         │ │ [card grid]         │         │ │
│ │ └─────────────────────┘ └─────────────────────┘         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```
`↓deck` = "Download deck" link (exports .ydk file)

### Phase 6a: Dockerfile + Static Serving ✅

**Pattern:** Turborepo-style - Dockerfile in app dir, build context at repo root.

- [x] `apps/duel-prep/backend/Dockerfile` - Create
  - Multi-stage: Node frontend build → Python backend with uv
  - Build context is repo root (access to `packages/`)
  - Uses `fastapi run` (modern CLI)
  - `UV_COMPILE_BYTECODE=1` for faster startup
  - `--no-install-workspace` for layer caching
  - Non-root user (`appuser`) for security
  - Railway uses `RAILWAY_DOCKERFILE_PATH` env var to find it
- [x] `.dockerignore` - Create (repo root)
- [x] `apps/duel-prep/backend/app/main.py` - Modify (add static file serving)
  - Mount `/assets` directory
  - Catch-all route returns `index.html` for SPA
  - Path traversal protection via `resolve()` + `is_relative_to()`

**Test locally:**
```bash
docker build -f apps/duel-prep/backend/Dockerfile -t duel-prep .
```

### Phase 6b: GitHub Actions CI/CD ✅

- [x] `.github/workflows/deploy.yml` - Create
  - Trigger: push to main (paths: `apps/duel-prep/**`, `packages/**`) + manual dispatch
  - Job 1: `lint` - Backend (`make check`) + Frontend (`pnpm check --frozen-lockfile`)
  - Job 2: `deploy-api` - Railway CLI deploy to `duel-prep-api` service
  - Job 3: `deploy-worker` - Railway CLI deploy to `duel-prep-worker` service
  - Requires: `RAILWAY_TOKEN` secret in GitHub repo

### Phase 6c: Railway Setup ✅

- [x] Create project: "duel-tools"
- [x] Add PostgreSQL plugin → `DATABASE_URL`
- [x] Add Redis plugin → `REDIS_URL`
- [x] Create service: `duel-prep-api`
  - Source: GitHub repo
  - Root Directory: (empty = repo root)
  - Variable: `RAILWAY_DOCKERFILE_PATH=apps/duel-prep/backend/Dockerfile`
  - Link DATABASE_URL, REDIS_URL from plugins
  - Add: CAPSOLVER_API_KEY, SITE_KEY, DB_USERNAME, DB_PASSWORD, DB_ID, DB_REGULAR
- [x] Create service: `duel-prep-worker`
  - Same config as API
  - Start command override: `celery -A app.worker.celery_app worker --loglevel=info`
- [x] Init database (one-time): Railway shell → `python scripts/init_db.py`
- [x] Add `RAILWAY_TOKEN` secret to GitHub repo settings

**Environment Variables:**
| Variable          | Source                    |
| ----------------- | ------------------------- |
| DATABASE_URL      | PostgreSQL plugin         |
| REDIS_URL         | Redis plugin              |
| CAPSOLVER_API_KEY | Manual                    |
| SITE_KEY          | Manual                    |
| DB_USERNAME       | Manual (DuelingBook auth) |
| DB_PASSWORD       | Manual (DuelingBook auth) |
| DB_ID             | Manual (DuelingBook auth) |
| DB_REGULAR        | Manual (optional)         |

### Phase 6d: Deployment Fixes ✅

**Scraper Package Fix**
- [x] Added `[build-system]` with hatchling to `packages/scraper/pyproject.toml`
- [x] Added `artifacts = ["*.json"]` to include `capsolver_task.json` in wheel

**Frontend Polish**
- [x] Fixed breadcrumbs - "Home" now shows on `/batch` and `/players` pages
- [x] Removed TanStack boilerplate images from `public/`
- [x] Updated `manifest.json` with "Duel Tools" name

**Backend Scripts**
- [x] Added `scripts/clear_db.py` - Delete all data from tables
- [x] Added `make clear-db` command

---

## Future Work

### Seeder Package (packages/seeder)
- [ ] S3 Replay Import - Seed DB with replay JSONs from AWS S3
- [ ] XLSX Parser - Extract replay links from Excel files, dedup, scrape if not in DB

**Note:** Replay/Player tables are independent of Batch/Job. Seeding can insert directly into `replays`, `players`, `replay_players` without creating batches.

---

## References

### Internal Docs
- `docs/README.md` - Documentation hub
- `docs/guides/development.md` - Local setup + commands
- `docs/guides/deploy.md` - Deployment pre-reqs + CI/CD
- `docs/services/railway.md` - Railway configuration
- `docs/apps/duel-prep-backend.md` - Backend API, database, Celery
- `docs/apps/duel-prep-frontend.md` - Frontend routes, components, UI
- `apps/duel-prep/backend/CLAUDE.md` - Backend dev guidelines
- `apps/duel-prep/frontend/CLAUDE.md` - Frontend dev guidelines

### Artifacts
- `docs/artifacts/replay-json-example.json` - DuelingBook replay JSON
- `docs/artifacts/deck-ydk-example.ydk` - YDK deck export format
- `docs/artifacts/init-prompt.md` - Initial project prompt

### External Reference Repos
- `github.com/nedhmn/replay-scraper-api` - Scraping patterns
- `github.com/nedhmn/gfwl-data` - Parser logic
- `github.com/nedhmn/multipolicy` - FastAPI/React patterns
