# Project TODO

## Phase 1: Backend Setup ✅
- [x] Core infrastructure (`app/core/`)
  - [x] `config.py` - pydantic-settings (DATABASE_URL, REDIS_URL, CAPSOLVER_API_KEY, etc.)
  - [x] `logging.py` - refactored to use shared `packages/logger`
- [x] API scaffold (`app/api/`)
  - [x] `main.py` - public_router
  - [x] `health/routes.py` - GET /health
- [x] `app/main.py` - FastAPI app with CORS, logging middleware
- [x] `Makefile` - dev, check commands

## Phase 2: Database + Shared Packages ✅
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

## Phase 3: Scrape Routes + Celery Worker ✅
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

## Phase 4: Replay + Player Routes ✅
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

## Phase 5a: Frontend Scaffold Alignment ✅
- [x] Simplify `main.tsx` (inline QueryClient, add Toaster, keep unified devtools)
- [x] Add Vite proxy: `/api/*` → `http://localhost:8000`
- [x] Rename `styles.css` → `index.css`
- [x] Create `CLAUDE.md` (multipolicy patterns: kebab-case, arrow functions, feature folders)
- [x] Delete boilerplate: `integrations/`, `Header.tsx`, `demo/`, `logo.svg`, `reportWebVitals.ts`
- [x] Install shadcn components + Zustand

## Phase 5b: Core Infrastructure ✅
- [x] API types (`features/api/types.ts`) + fetch util (`lib/fetch.ts`)
- [x] Theme toggle with Zustand + localStorage (`features/theme/`)
- [x] Root layout with Sidebar + SidebarInset (`features/layout/`, `routes/__root.tsx`)
- [x] Index redirect to `/scrape`

## Phase 5c: Batch Features ✅
- [x] Routes renamed from `/scrape` to `/batch`
- [x] Batch page (`/batch/$batch-id`): polling (2s), progress display, inline replay viewer when complete
- [x] Replay navigation: prev/next within batch
- [x] Batch header shows batch ID (will show name when backend supports it)

## Phase 5d: Replay Feature ✅
- [x] Replay view component (`features/replay/`): games as rows, card grids side-by-side, total cards section
- [x] Card images: `https://images.duelingbook.com/low-res/{card_id}.jpg` (8 columns, 3px gap)
- [x] Game rows with subtle borders, player sections with muted backgrounds
- [x] Replay metadata: player names, result, DuelingBook URL with external link

## Phase 5e: Sidebar + UX ✅
- [x] Sidebar header: "Duel Prep" clickable link to /batch
- [x] "New Batch" button (outline variant) opens ScrapeSheet
- [x] ScrapeSheet: batch name input (required) + URL paste/extract
- [x] Batch search: cmdk CommandDialog (⌘K), dummy data for now
- [x] Recent batches list: name, count, clickable links
- [x] Collapsed sidebar: icon-only support
- [x] App metadata: title "Duel Prep", description for SEO
- [x] Loading states (Skeleton)

## Phase 5f: Global Search + Player Feature ✅
- [x] Fix `ScrapeSheet` regex to capture full ID: `id=(\d+(?:-\d+)?)`
- [x] Fixed textarea overflow in ScrapeSheet (fixed height with scroll)
- [x] Install shadcn breadcrumb
- [x] Refactor `SiteHeader` to use breadcrumbs instead of plain title
- [x] Create `features/search/global-search.tsx` - unified search component
- [x] Add GlobalSearch to `SiteHeader` (right side, before theme toggle)
- [x] Remove `BatchSearch` from sidebar (kept recent batches list)
- [x] Wire to API: fetches `/batches` + `/players`
- [x] Create route `routes/players/index.tsx` - Empty state with ⌘K hint
- [x] Create route `routes/players/$player-id.tsx` - Player detail + replay history
- [x] Create `features/players/api.ts` with `usePlayerDetail(playerId)`
- [x] Shareable replay URLs: `/batch/$batch-id?replay=duelingbook_id`
- [x] Make player names in `ReplayView` clickable via `playerLinks` prop
- [x] Wire player IDs from API (`player1_id`, `player2_id` in replay response)

## Phase 5g: Backend Integration ✅
- [x] Update `packages/parser/` to extract `card_type` from raw JSON
- [x] Update frontend `CardInfo` type to include `card_type`
- [x] Update `CardGrid` to sort by: card_type (Monster → Spell → Trap) then alphabetical
- [x] `GET /batches` - List recent batches
- [x] Update `GET /players` - Add `replay_count` to each player
- [x] Update `POST /scrape` - Accept `name` field
- [x] Update `GET /scrape/{batch_id}` - Return batch name
- [x] Update `GET /replays/{duelingbook_id}` - Include player IDs
- [x] Add `name` column to `batches` table
- [x] Update frontend to use new API fields

## Phase 5h: Polish ✅
- [x] Renamed "Duel Prep" → "Duel Tools" (sidebar, HTML title)
- [x] Removed theme toggle - default dark mode only
- [x] Added `class="dark"` to HTML for instant dark mode (no flash)
- [x] Batch index: sortable headers, pagination (default 10), page size selector
- [x] Players index: sortable headers + "View" action button
- [x] Column filter buttons in table headers (popover with text input)
- [x] Created centered `BatchProcessing` component
- [x] Sidebar shows spinner for processing/pending batches
- [x] Card grid styling: double grid lines, subtle borders, hover effects
- [x] Toast notification for failed scrape jobs (via Sonner)
- [x] Failed jobs excluded from replay navigation
- [x] Loading skeleton for player page

## Phase 5i: YDK Export & UX Polish ✅
- [x] Added `serial_number` field to `CardInfo` model (parser + frontend types)
- [x] Parser extracts `serial_number` from card objects in raw JSON
- [x] "Download deck" button next to player name + count
- [x] YDK file format: sorted by type (Monster → Spell → Trap → alphabetical)
- [x] Max 3 copies per card in export, filename: `{player}_{date}.ydk`
- [x] Fixed `_get_went_first()` to handle "Chose to go second" case
- [x] Added `keepPreviousData` to `useReplay` hook (TanStack Query)
- [x] Previous replay stays visible while fetching next (no layout shift)
- [x] Opacity fade + pointer-events-none during transition

## Phase 6a: Dockerfile + Static Serving ✅
- [x] `apps/duel-prep/backend/Dockerfile` - Multi-stage: Node frontend build → Python backend with uv
- [x] `.dockerignore` - Create (repo root)
- [x] `apps/duel-prep/backend/app/main.py` - Add static file serving, catch-all route for SPA

## Phase 6b: GitHub Actions CI/CD ✅
- [x] `.github/workflows/deploy.yml` - Create
  - [x] Trigger: push to main (paths: `apps/duel-prep/**`, `packages/**`) + manual dispatch
  - [x] Job 1: `lint` - Backend (`make check`) + Frontend (`pnpm check`)
  - [x] Job 2: `deploy-api` - Railway CLI deploy to `duel-prep-api` service
  - [x] Job 3: `deploy-worker` - Railway CLI deploy to `duel-prep-worker` service

## Phase 6c: Railway Setup ✅
- [x] Create project: "duel-tools"
- [x] Add PostgreSQL plugin → `DATABASE_URL`
- [x] Add Redis plugin → `REDIS_URL`
- [x] Create service: `duel-prep-api`
- [x] Create service: `duel-prep-worker`
- [x] Init database (one-time): Railway shell → `python scripts/init_db.py`
- [x] Add `RAILWAY_TOKEN` secret to GitHub repo settings

## Phase 6d: Deployment Fixes ✅
- [x] Added `[build-system]` with hatchling to `packages/scraper/pyproject.toml`
- [x] Added `artifacts = ["*.json"]` to include `capsolver_task.json` in wheel
- [x] Fixed breadcrumbs - "Home" now shows on `/batch` and `/players` pages
- [x] Removed TanStack boilerplate images from `public/`
- [x] Updated `manifest.json` with "Duel Tools" name
- [x] Added `scripts/clear_db.py` - Delete all data from tables
- [x] Added `make clear-db` command

## Phase 7: Seeder Package ✅
- [x] `packages/seeder/` - Bulk import from AWS S3
- [x] Async: aioboto3 for S3, asyncpg for DB
- [x] Concurrency: aiometer `run_on_each()` with `max_at_once=20`
- [x] Per-replay processing: download → parse → insert → commit (own session)
- [x] Pre-filters duplicates by querying existing `duelingbook_id`s
- [x] `src/seeder/config.py` - Settings (DATABASE_URL, S3_*, AWS_*)
- [x] `src/seeder/loaders/s3.py` - `list_keys()`, `download_replay()`, `extract_replay_id()`
- [x] `src/seeder/db.py` - `get_existing_ids()`, `get_or_create_player()`, `seed_replay()`
- [x] `scripts/seed_s3.py` - Main entrypoint

## Phase 8: Cron Package ✅
- [x] Package scaffold (`packages/cron/pyproject.toml`, `Makefile`)
- [x] Add workspace deps: `db`, `parser`, `scraper`, `logger`
- [x] Update Makefile: add `sync` and `sync-all` commands
- [x] `src/cron/__init__.py`
- [x] `src/cron/config.py` - Settings (DATABASE_URL, FL_ACCESS, FL_PLAYER_ID, FL_PLAYER_NAME)
- [x] `src/cron/sources/__init__.py`
- [x] `src/cron/sources/formatlibrary.py` - fetch_events, fetch_all_events, fetch_event_replays
- [x] `src/cron/db.py` - get_existing_ids, get_or_create_player, seed_replay (copy from seeder)
- [x] `src/cron/pipeline.py` - process_replay (scrape→parse→seed with asyncio.to_thread)
- [x] `scripts/sync_formatlibrary.py` - Main entrypoint with `--all` flag
- [x] `packages/cron/Dockerfile` - Standalone container (no CMD, specify at runtime)
- [x] `.github/workflows/deploy.yml` - Add `deploy-cron` job for `duel-prep-fl-cron`
- [ ] Railway: Create `duel-prep-fl-cron` service with cron schedule `0 0 * * *`
- [ ] Update `docs/services/railway.md` - Document cron service

## Future Work
- [ ] `packages/seeder/` - XLSX parser for Excel replay links
- [ ] `packages/cron/sources/discord.py` - Discord channel scraper

## References
- `docs/README.md` - Documentation hub
- `docs/guides/development.md` - Local setup + commands
- `docs/guides/deploy.md` - Deployment guide
- `docs/services/railway.md` - Railway configuration
- `docs/apps/duel-prep-backend.md` - Backend API docs
- `docs/apps/duel-prep-frontend.md` - Frontend docs
- `apps/duel-prep/backend/CLAUDE.md` - Backend dev guidelines
- `apps/duel-prep/frontend/CLAUDE.md` - Frontend dev guidelines
