# Duel Tools

Yu-Gi-Oh replay scraping and analysis tool for DuelingBook. Scrape replays, parse duel logs, and analyze player performance across games.

## Quick Start (Self-Hosting)

```bash
git clone https://github.com/nedhmn/duel-tools.git
cd duel-tools
cp .env.example .env   # fill in required values
docker compose -f docker-compose.prod.yml up -d
```

App runs at `http://localhost:8000`. Logs at `http://localhost:9999` (Dozzle).

See the [Self-Hosting guide](./docs/guides/self-hosting.md) for environment variable details.

## Project Structure

```
duel-tools/
├── apps/
│   ├── api/          # FastAPI + Celery worker
│   ├── cron/         # Scheduled sync jobs
│   └── web/          # React + Vite frontend
├── packages/
│   ├── db/           # SQLAlchemy models + Alembic migrations
│   ├── logger/       # structlog config
│   ├── parser/       # Replay JSON parsing
│   ├── scraper/      # DuelingBook scraping
│   └── seeder/       # S3 replay import
└── docs/             # Guides + architecture docs
```

## Development

Prerequisites: Python 3.13+, Node 22+, [uv](https://docs.astral.sh/uv/), [pnpm](https://pnpm.io/), Docker

```bash
docker compose up -d                    # postgres + redis
uv sync                                 # python deps
cd apps/web && pnpm install             # frontend deps
cp apps/api/.env.example apps/api/.env  # configure env
cd packages/db && make migrate          # init database
```

- **API**: `cd apps/api && make dev`
- **Worker**: `cd apps/api && make worker`
- **Frontend**: `cd apps/web && pnpm dev`

### Commands

| Command              | Description                   |
| -------------------- | ----------------------------- |
| `make check`         | Lint + type check (ruff + ty) |
| `make fix`           | Auto-fix + format             |
| `make fix-and-check` | Fix then check                |
| `make migrate`       | Run database migrations       |
| `make clean`         | Remove build artifacts        |

## Docs

| Guide                                         | Description           |
| --------------------------------------------- | --------------------- |
| [Development](./docs/guides/development.md)   | Full local setup      |
| [Self-Hosting](./docs/guides/self-hosting.md) | Docker Compose deploy |
| [Deployment](./docs/guides/deploy.md)         | CI/CD + Railway       |
