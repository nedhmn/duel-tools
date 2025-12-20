# Setup

## Prerequisites

- Python 3.13+
- Node.js 20+
- Docker (for local PostgreSQL + Redis)
- uv (Python package manager)

## Local Development

### Start services

```bash
docker compose up -d
```

### Install dependencies

```bash
uv sync
```

### Run apps

```bash
# duel-prep
cd apps/duel-prep/backend && uv run uvicorn app.main:app --reload
cd apps/duel-prep/frontend && npm run dev

# replay-viewer
cd apps/replay-viewer/backend && uv run uvicorn app.main:app --reload
cd apps/replay-viewer/frontend && npm run dev
```

### Run Celery worker (duel-prep only)

```bash
cd apps/duel-prep/backend && uv run celery -A worker.celery_app worker
```

## Environment Variables

See `.env.example` in each app for required variables.
