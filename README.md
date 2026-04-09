# Duel Tools

Yu-Gi-Oh replay scraping and analysis tool for DuelingBook. Scrape replays, parse duel logs, and analyze player performance across games.

## Quick Start (Self-Hosting)

```bash
git clone https://github.com/nedhmn/duel-tools.git
cd duel-tools
cp .env.example .env   # fill in required values
docker compose -f docker-compose.prod.yml up -d
```

App runs at `http://localhost:8000`.

See the [Self-Hosting guide](./docs/guides/self-hosting.md) for environment variable details.

## Project Structure

```
duel-tools/
├── apps/
│   ├── api/          # FastAPI + Celery worker
│   ├── cron/         # Scheduled sync jobs
│   └── web/          # React + Vite frontend
├── packages/
│   ├── dt-capsolver/ # Captcha solving (Turnstile, reCAPTCHA v2)
│   ├── dt-db/        # SQLAlchemy models + Alembic migrations
│   ├── dt-logger/    # structlog config
│   ├── dt-parser/    # Replay JSON parsing
│   ├── dt-scraper/   # DuelingBook scraping
│   └── dt-seeder/    # S3 replay import
└── docs/             # Guides + architecture docs
```

## Development

Prerequisites: Python 3.13+, Node 22+, [uv](https://docs.astral.sh/uv/), [pnpm](https://pnpm.io/), Docker

```bash
docker compose up -d                    # postgres + redis
uv sync                                 # python deps
cd apps/web && pnpm install             # frontend deps
cp apps/api/.env.example apps/api/.env  # configure env
cd packages/dt-db && make migrate       # init database
```

- **API**: `cd apps/api && make dev`
- **Worker**: `cd apps/api && make worker`
- **Frontend**: `cd apps/web && pnpm dev`

## Docs

| Guide                                         | Description           |
| --------------------------------------------- | --------------------- |
| [Development](./docs/guides/development.md)   | Full local setup      |
| [Self-Hosting](./docs/guides/self-hosting.md) | Docker Compose deploy |
| [Deployment](./docs/guides/deploy.md)         | CI/CD + Railway       |
