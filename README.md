# duel-tools

A Python monorepo with web apps for analyzing Yu-Gi-Oh DuelingBook replays.

## Apps

- **duel-prep** - Input replay URLs, scrape and display games with card images
- **replay-viewer** - Upload replay JSON directly, view parsed games

## Tech Stack

Python + FastAPI | React + Vite | PostgreSQL | Celery + Redis

## Documentation

See [docs/](./docs/) for full documentation.

## Quick Start

```bash
# Start local services
docker compose up -d

# Install dependencies
uv sync

# Run an app
cd apps/duel-prep/backend && uv run uvicorn app.main:app --reload
```
