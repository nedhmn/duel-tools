# duel-tools

Monorepo for Yu-Gi-Oh DuelingBook replay analysis tools.

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

## Guides

| Guide                                            | Description                 |
| ------------------------------------------------ | --------------------------- |
| [guides/development.md](./guides/development.md) | Local setup + commands      |
| [guides/deploy.md](./guides/deploy.md)           | Deployment pre-reqs + CI/CD |
| [services/railway.md](./services/railway.md)     | Railway configuration       |

## Apps

| App                                                        | Description                     |
| ---------------------------------------------------------- | ------------------------------- |
| [apps/duel-prep-backend.md](./apps/duel-prep-backend.md)   | Backend API, database, Celery   |
| [apps/duel-prep-frontend.md](./apps/duel-prep-frontend.md) | Frontend routes, components, UI |

## Artifacts

Example files for reference:

- [artifacts/replay-json-example.json](./artifacts/replay-json-example.json) - DuelingBook replay JSON
- [artifacts/deck-ydk-example.ydk](./artifacts/deck-ydk-example.ydk) - YDK deck export format
- [artifacts/init-prompt.md](./artifacts/init-prompt.md) - Initial project prompt

## Other

- [todo.md](./todo.md) - Development roadmap
- [apps/duel-prep/backend/CLAUDE.md](../apps/duel-prep/backend/CLAUDE.md) - Backend dev guidelines
- [apps/duel-prep/frontend/CLAUDE.md](../apps/duel-prep/frontend/CLAUDE.md) - Frontend dev guidelines
