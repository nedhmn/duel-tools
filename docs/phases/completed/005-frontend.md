---
title: "Frontend"
phase: 5
status: completed
created: 2026-03-18
completed: 2026-03-18
context_doc: null
description: "Frontend (5a–5i: scaffold, infrastructure, batch, replay, sidebar, search, integration, polish, YDK export)"
---

## Tasks

### 5a: Frontend Scaffold Alignment

- [x] Simplify `main.tsx` (inline QueryClient, add Toaster, keep unified devtools)
- [x] Add Vite proxy: `/api/*` → `http://localhost:8000`
- [x] Rename `styles.css` → `index.css`
- [x] Create `CLAUDE.md` (multipolicy patterns: kebab-case, arrow functions, feature folders)
- [x] Delete boilerplate: `integrations/`, `Header.tsx`, `demo/`, `logo.svg`, `reportWebVitals.ts`
- [x] Install shadcn components + Zustand

### 5b: Core Infrastructure

- [x] API types (`features/api/types.ts`) + fetch util (`lib/fetch.ts`)
- [x] Theme toggle with Zustand + localStorage (`features/theme/`)
- [x] Root layout with Sidebar + SidebarInset (`features/layout/`, `routes/__root.tsx`)
- [x] Index redirect to `/scrape`

### 5c: Batch Features

- [x] Routes renamed from `/scrape` to `/batch`
- [x] Batch page (`/batch/$batch-id`): polling (2s), progress display, inline replay viewer when complete
- [x] Replay navigation: prev/next within batch
- [x] Batch header shows batch ID (will show name when backend supports it)

### 5d: Replay Feature

- [x] Replay view component (`features/replay/`): games as rows, card grids side-by-side, total cards section
- [x] Card images: `https://images.duelingbook.com/low-res/{card_id}.jpg` (8 columns, 3px gap)
- [x] Game rows with subtle borders, player sections with muted backgrounds
- [x] Replay metadata: player names, result, DuelingBook URL with external link

### 5e: Sidebar + UX

- [x] Sidebar header: "Duel Prep" clickable link to /batch
- [x] "New Batch" button (outline variant) opens ScrapeSheet
- [x] ScrapeSheet: batch name input (required) + URL paste/extract
- [x] Batch search: cmdk CommandDialog (⌘K), dummy data for now
- [x] Recent batches list: name, count, clickable links
- [x] Collapsed sidebar: icon-only support
- [x] App metadata: title "Duel Prep", description for SEO
- [x] Loading states (Skeleton)

### 5f: Global Search + Player Feature

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

### 5g: Backend Integration

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

### 5h: Polish

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

### 5i: YDK Export & UX Polish

- [x] Added `serial_number` field to `CardInfo` model (parser + frontend types)
- [x] Parser extracts `serial_number` from card objects in raw JSON
- [x] "Download deck" button next to player name + count
- [x] YDK file format: sorted by type (Monster → Spell → Trap → alphabetical)
- [x] Max 3 copies per card in export, filename: `{player}_{date}.ydk`
- [x] Fixed `_get_went_first()` to handle "Chose to go second" case
- [x] Added `keepPreviousData` to `useReplay` hook (TanStack Query)
- [x] Previous replay stays visible while fetching next (no layout shift)
- [x] Opacity fade + pointer-events-none during transition

## References

| Resource | Description |
| -------- | ----------- |
