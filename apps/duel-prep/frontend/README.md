# duel-prep frontend

React SPA for DuelingBook replay analysis.

## Setup

```bash
pnpm install
```

## Development

```bash
pnpm dev  # Starts on :3000, proxies /api to :8000
```

Backend must be running (`cd ../backend && make dev`).

## Commands

| Command      | Description          |
| ------------ | -------------------- |
| `pnpm dev`   | Development server   |
| `pnpm build` | Production build     |
| `pnpm check` | Lint check (Biome)   |
| `pnpm fix`   | Auto-fix lint issues |

## Routes

| Route          | Description                            |
| -------------- | -------------------------------------- |
| `/batch`       | Batch index (list all)                 |
| `/batch/:id`   | Batch detail with inline replay viewer |
| `/players`     | Player index                           |
| `/players/:id` | Player detail with replay history      |

## Features

```
src/features/
├── api/       # Fetch client, types
├── batch/     # Batch progress, status
├── layout/    # Sidebar, header
├── players/   # Player list, detail
├── replay/    # Replay viewer, card grids
├── scrape/    # URL extractor sheet
├── search/    # Global search (⌘K)
└── theme/     # Dark mode (default)
```

## Stack

- React 19 + TypeScript
- TanStack Router (file-based) + Query
- Tailwind v4 + shadcn/ui
- Zustand (state)
- Biome (linting)
