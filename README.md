# Duel Tools

Monorepo for Yu-Gi-Oh DuelingBook replay analysis.

## Project Structure

```
duel-tools/
├── apps/
│   ├── api/                # FastAPI + Celery
│   ├── cron/               # Scheduled sync jobs
│   └── web/                # React + Vite
├── packages/
│   ├── db/                 # SQLAlchemy models
│   ├── logger/             # structlog config
│   ├── parser/             # Replay JSON parsing
│   ├── scraper/            # DuelingBook scraping
│   └── seeder/             # S3 replay import
└── docs/                   # Documentation
```

## Documentation

| Guide                                       | Description            |
| ------------------------------------------- | ---------------------- |
| [Development](./docs/guides/development.md) | Local setup + commands |
| [Deployment](./docs/guides/deploy.md)       | Pre-reqs + CI/CD       |
| [Railway](./docs/services/railway.md)       | Railway configuration  |
