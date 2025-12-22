# duel-tools

Monorepo for Yu-Gi-Oh DuelingBook replay analysis tools.

## Quick Links

| Resource                                     | Description                             |
| -------------------------------------------- | --------------------------------------- |
| [apps/duel-prep.md](./apps/duel-prep.md)     | Architecture, API spec, database schema |
| [services/railway.md](./services/railway.md) | Railway deployment guide                |
| [todo.md](./todo.md)                         | Development roadmap                     |

## Tech Stack

| Component | Technology                          |
| --------- | ----------------------------------- |
| Language  | Python 3.13+                        |
| Monorepo  | uv workspaces                       |
| Backend   | FastAPI                             |
| Frontend  | React + Vite + Tailwind + shadcn/ui |
| Database  | PostgreSQL                          |
| Job Queue | Celery + Redis                      |
| Hosting   | Railway                             |

## Repository Structure

```
duel-tools/
├── apps/
│   └── duel-prep/
│       ├── backend/      # FastAPI + Celery
│       └── frontend/     # React + TanStack
├── packages/
│   ├── db/               # SQLAlchemy models
│   ├── logger/           # structlog config
│   ├── parser/           # Replay JSON parsing
│   └── scraper/          # DuelingBook scraping
└── docs/
```

## Local Development

### Prerequisites

- Python 3.13+
- Node.js 22+
- Docker
- uv
- pnpm

### Setup

```bash
# Start PostgreSQL + Redis
docker compose up -d

# Install Python dependencies
uv sync

# Install frontend dependencies
cd apps/duel-prep/frontend && pnpm install
```

### Run

```bash
# Backend
cd apps/duel-prep/backend && make dev

# Frontend
cd apps/duel-prep/frontend && pnpm dev

# Worker
cd apps/duel-prep/backend && make worker
```

### Commands

| Command         | Description                 |
| --------------- | --------------------------- |
| `make dev`      | Run FastAPI dev server      |
| `make worker`   | Run Celery worker           |
| `make check`    | Run linting + type checking |
| `make init-db`  | Create database tables      |
| `make clear-db` | Delete all data from tables |
| `pnpm dev`      | Run frontend dev server     |
| `pnpm check`    | Run frontend linting        |
| `pnpm build`    | Build frontend              |

## Deployment

See [services/railway.md](./services/railway.md) for Railway deployment.

## Artifacts

Example files for reference:

- [artifacts/replay-json-example.json](./artifacts/replay-json-example.json) - DuelingBook replay JSON
- [artifacts/deck-ydk-example.ydk](./artifacts/deck-ydk-example.ydk) - YDK deck export format
- [artifacts/init-prompt.md](./artifacts/init-prompt.md) - Initial project prompt

## CLAUDE.md Files

App-specific development guidelines:

- [apps/duel-prep/backend/CLAUDE.md](../apps/duel-prep/backend/CLAUDE.md)
- [apps/duel-prep/frontend/CLAUDE.md](../apps/duel-prep/frontend/CLAUDE.md)
