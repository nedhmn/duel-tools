# duel-prep Frontend

React SPA for DuelingBook replay analysis with card grids and YDK export.

## Tech Stack

| Category     | Technology                   |
| ------------ | ---------------------------- |
| Framework    | React 19 + TypeScript        |
| Build        | Vite 7                       |
| Routing      | TanStack Router (file-based) |
| Server State | TanStack Query               |
| Client State | Zustand                      |
| Tables       | TanStack React Table         |
| Styling      | Tailwind CSS v4              |
| Components   | shadcn/ui + Radix UI         |
| Icons        | lucide-react                 |
| Toasts       | sonner                       |
| Validation   | Zod                          |
| Environment  | t3-env                       |
| Linting      | Ultracite (Biome)            |

## Directory Structure

```
src/
├── routes/                          # TanStack Router file-based routes
│   ├── __root.tsx                   # Root layout (LoginModal + Sidebar + Outlet)
│   ├── index.tsx                    # Home page (/)
│   ├── batch/
│   │   ├── index.tsx                # /batch - Batch list
│   │   └── $batch-id.tsx            # /batch/$batch-id - Batch detail
│   └── players/
│       ├── index.tsx                # /players - Player list
│       └── $player-id.tsx           # /players/$player-id - Player detail
│
├── features/                        # Feature-based modules
│   ├── api/
│   │   └── types.ts                 # Centralized API types
│   ├── auth/
│   │   ├── store.ts                 # Zustand auth store (persist)
│   │   └── login-modal.tsx          # Password login modal
│   ├── batch/
│   │   ├── api.ts                   # useBatches(), useBatchStatus()
│   │   ├── batch-processing.tsx     # Spinner + progress bar
│   │   └── batch-progress.tsx       # Job-by-job status
│   ├── replay/
│   │   ├── api.ts                   # useReplay()
│   │   ├── replay-view.tsx          # Main replay viewer
│   │   └── card-grid.tsx            # Card image grid
│   ├── players/
│   │   └── api.ts                   # usePlayerList(), usePlayerDetail()
│   ├── scrape/
│   │   ├── api.ts                   # useSubmitScrape()
│   │   └── scrape-sheet.tsx         # URL extraction + batch form
│   ├── search/
│   │   └── global-search.tsx        # Cmd+K search dialog
│   └── layout/
│       ├── app-sidebar.tsx          # Collapsible sidebar
│       └── site-header.tsx          # Breadcrumbs + search
│
├── components/
│   ├── data-table.tsx               # Sortable/filterable table
│   ├── data-table-column-filter.tsx # Column filter popover
│   └── ui/                          # shadcn/ui components
│
├── lib/
│   ├── fetch.ts                     # fetchJson() wrapper
│   └── utils.ts                     # shadcn utilities (cn)
│
├── main.tsx                         # Entry point with providers
├── index.css                        # Tailwind v4 + shadcn theme
├── env.ts                           # t3-env config
└── routeTree.gen.ts                 # Auto-generated
```

## Routes

| Route                 | Component        | Description                      |
| --------------------- | ---------------- | -------------------------------- |
| `/`                   | HomePage         | Getting started guide            |
| `/batch`              | BatchIndexPage   | Sortable/filterable batch table  |
| `/batch/$batch-id`    | BatchPage        | Batch detail + replay viewer     |
| `/players`            | PlayersIndexPage | Sortable/filterable player table |
| `/players/$player-id` | PlayerPage       | Player detail + replay history   |

**Search Params:**

- `/batch/$batch-id?replay=<duelingbook_id>&pov=<player1|player2>&format=<format>` - Deep link to replay with filters
- `/players/$player-id?replay=<duelingbook_id>&pov=<player|opponent>&format=<format>` - Deep link to replay with filters

## API Hooks

| Hook                        | Query Key              | Endpoint                         | Behavior                      |
| --------------------------- | ---------------------- | -------------------------------- | ----------------------------- |
| `useBatchStatus(batchId)`   | `["batch", batchId]`   | `GET /api/v1/scrape/{batchId}`   | Polls every 2s until complete |
| `useBatches()`              | `["batches"]`          | `GET /api/v1/batches`            | Static list                   |
| `useSubmitScrape()`         | -                      | `POST /api/v1/scrape`            | Mutation                      |
| `useReplay(duelingbookId)`  | `["replay", id]`       | `GET /api/v1/replays/{id}`       | Keeps previous data           |
| `usePlayerList()`           | `["players"]`          | `GET /api/v1/players`            | Static list                   |
| `usePlayerDetail(playerId)` | `["player", playerId]` | `GET /api/v1/players/{playerId}` | Conditional                   |

## Key Components

### ReplayView

Main replay display with two modes:

- **BatchFilter**: View replays within a batch context (player1/player2/both)
- **PlayerFilter**: View replays for a specific player (player/opponent/both)
- **FormatFilter**: Filter replays by game format (TCG, Goat, etc.)

Features:
- Played date displayed next to player names
- Format filter dropdown (filters navigation to selected format)
- Individual game cards with player grids side-by-side
- Aggregated "Total Cards Seen" section
- YDK deck file download per player
- Prev/next navigation within filtered context

### CardGrid

Responsive card image grid:
- Sorts by type: Monster → Spell → Trap → alphabetical
- Responsive columns: 6 (mobile) / 9 (tablet) / 12 (desktop)
- Empty slots for visual alignment
- Card tooltips with names
- Image source: `https://images.duelingbook.com/low-res/{cardId}.jpg`

### ScrapeSheet

Batch creation modal:
- Batch name input (required)
- URL paste area with auto-extraction
- Regex: `https?://(?:www\.)?duelingbook\.com/replay\?id=(\d+(?:-\d+)?)`
- Visual URL list with remove buttons
- Deduplication

### DataTable

Full-featured table:
- Column sorting (asc/desc)
- Column filtering (per-column input)
- Pagination (10/20/30/50/100)
- TanStack React Table integration

### GlobalSearch

Cmd+K search dialog:
- Searches batches + players
- Quick navigation
- "View all" links

## API Types

```typescript
// Scrape
type JobStatus = "pending" | "processing" | "completed" | "failed";
type ScrapeRequest = { urls: string[]; name: string };
type JobResponse = {
  job_id: string;
  url: string;
  duelingbook_id: string;
  status: JobStatus;
  replay_id?: string;
  error?: string;
  player1?: string;
  player2?: string;
  match_result?: string;
  played_at?: string;
  format?: string;
};

// Batch
type BatchStatus = "pending" | "processing" | "completed" | "failed";
type BatchSummary = {
  id: string;
  name: string;
  created_at: string;
  replay_count: number;
  status: BatchStatus;
};

// Replay
type CardInfo = {
  card_id: number;
  card_name: string;
  card_amount: number;
  card_type: string;
  serial_number: number;
};
type PlayerCards = {
  username: string;
  card_count: number;
  cards: CardInfo[];
};
type Game = {
  game_number: number;
  winner: string;
  went_first: string;
  player1_cards: PlayerCards;
  player2_cards: PlayerCards;
};
type ParsedReplay = {
  replay_id: number;
  played_at: string;
  format: string;
  player1: string;
  player2: string;
  player1_id?: string;
  player2_id?: string;
  match_result: string;
  games: Game[];
  total_player1_cards: PlayerCards;
  total_player2_cards: PlayerCards;
};

// Player
type PlayerResponse = {
  id: string;
  username: string;
  replay_count: number;
};
type ReplayMetadata = {
  id: string;
  duelingbook_id: string;
  url: string;
  opponent: string;
  played_at: string;
  match_result: string;
  format: string;
};
type PlayerDetailResponse = {
  id: string;
  username: string;
  replays: ReplayMetadata[];
};
```

## YDK Export

Generates YDK deck files from card data:

1. Aggregate cards from all games
2. Sort by type: Monster (0) → Spell (1) → Trap (2) → Other (3)
3. Limit to 3 copies per card
4. Format: `#main` section with serial numbers
5. Filename: `{player}_{date}.ydk`

## Layout Structure

### Sidebar

```
┌─────────────────────────┐
│ Duel Tools        [□]   │  ← clickable home + collapse
├─────────────────────────┤
│ [+ New Batch]           │  ← opens ScrapeSheet
├─────────────────────────┤
│ Recent Batches          │
│ ├── ◐ Processing...   0 │  ← spinner for pending
│ ├── Tournament Finals 3 │
│ └── Ladder Games      2 │
├─────────────────────────┤
│ Top Players             │
│ ├── PlayerName       12 │  ← replay count
│ └── ...                 │
└─────────────────────────┘
```

### Header

```
┌─────────────────────────────────────────────────────────────┐
│ Batch / Tournament Finals           [🔍 Search...  ⌘K]      │
│ ↑ breadcrumbs                       ↑ GlobalSearch          │
└─────────────────────────────────────────────────────────────┘
```

### Replay View

```
┌─────────────────────────────────────────────────────────────┐
│ Player1 vs Player2  Jan 15, 2024          ◀ [1 of 3] ▶      │
│ Result: 2-0 · https://duelingbook.com/replay?id=123 ↗       │
│ [Both] [Player1] [Player2]              [All Formats ▼]     │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Game 1  Winner: Player1 | First: Player2                │ │
│ │ ┌─────────────────────┐ ┌─────────────────────┐         │ │
│ │ │ Player1 (38)  ↓deck │ │ Player2 (40)  ↓deck │         │ │
│ │ │ [card grid 8 cols]  │ │ [card grid 8 cols]  │         │ │
│ │ └─────────────────────┘ └─────────────────────┘         │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Total Cards Seen                                        │ │
│ │ ┌─────────────────────┐ ┌─────────────────────┐         │ │
│ │ │ Player1 (42)  ↓deck │ │ Player2 (45)  ↓deck │         │ │
│ │ │ [card grid]         │ │ [card grid]         │         │ │
│ │ └─────────────────────┘ └─────────────────────┘         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Development

```bash
pnpm dev      # Dev server (:3000), proxies /api/* to :8000
pnpm build    # TypeScript + Vite build
pnpm check    # Biome linting
pnpm fix      # Biome auto-fix
```

## Authentication

Password-based auth with login modal:

- Password stored in localStorage via Zustand persist
- Sent as `X-Auth-Password` header on all API requests
- Login modal blocks UI until authenticated
- 401 responses trigger auto-logout

## Error Handling

- `fetchJson()` parses `error.detail` from API responses
- `useSubmitScrape` shows toast on error via sonner
- Toast notifications for 400/401/404/422/429/500/503 errors

## Code Conventions

- **File naming**: kebab-case (`batch-processing.tsx`)
- **Imports**: `@/` alias for all paths
- **Components**: Arrow functions, destructured props
- **No comments/docstrings**: Self-documenting code
- **Types**: Centralized in `features/api/types.ts`
