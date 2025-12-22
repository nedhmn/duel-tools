# Duel Tools

Monorepo for Yu-Gi-Oh DuelingBook replay analysis.

## Project Structure

```
duel-tools/
├── apps/
│   └── duel-prep/          # Replay scraping + analysis app
│       ├── backend/        # FastAPI + Celery
│       └── frontend/       # React + Vite
├── packages/
│   ├── db/                 # SQLAlchemy models
│   ├── logger/             # structlog config
│   ├── parser/             # Replay JSON parsing
│   └── scraper/            # DuelingBook scraping
└── docs/                   # Documentation
```

## Documentation

| Guide                                       | Description            |
| ------------------------------------------- | ---------------------- |
| [Development](./docs/guides/development.md) | Local setup + commands |
| [Deployment](./docs/guides/deploy.md)       | Pre-reqs + CI/CD       |
| [Railway](./docs/services/railway.md)       | Railway configuration  |

| App Reference                                 | Description            |
| --------------------------------------------- | ---------------------- |
| [Backend](./docs/apps/duel-prep-backend.md)   | API, database, Celery  |
| [Frontend](./docs/apps/duel-prep-frontend.md) | Routes, components, UI |
