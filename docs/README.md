# duel-tools

Monorepo for Yu-Gi-Oh DuelingBook replay analysis tools.

## Documentation

| Directory | Description |
|-----------|-------------|
| [architecture/](./architecture/) | Application architecture docs |
| [guides/](./guides/) | Development and deployment guides |
| [services/](./services/) | External service integrations |
| [context/](./context/) | Design decisions and reference material |
| [phases/](./phases/) | Project phases and roadmap |

## Tech Stack

| Component | Technology |
|-----------|------------|
| Language | Python 3.13+ |
| Monorepo | uv workspaces |
| Backend | FastAPI |
| Frontend | React + Vite + Tailwind + shadcn/ui |
| Database | PostgreSQL |
| Job Queue | Celery + Redis |
| Hosting | Railway |

## Repository Structure

```
duel-tools/
├── apps/
│   └── duel-prep/
│       ├── backend/      # FastAPI + Celery
│       └── frontend/     # React + TanStack
├── packages/
│   ├── cron/             # Scheduled sync jobs
│   ├── db/               # SQLAlchemy models
│   ├── logger/           # structlog config
│   ├── parser/           # Replay JSON parsing
│   ├── scraper/          # DuelingBook scraping
│   └── seeder/           # S3 replay import
└── docs/
```
