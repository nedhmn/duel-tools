---
title: "Development Guide"
description: "Local development setup for the duel-tools monorepo"
created: 2026-03-18
---

# Development

Local development setup for duel-tools.

## Table of Contents

- [Development](#development)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
  - [Monorepo Commands](#monorepo-commands)
  - [API Development](#api-development)
    - [Environment](#environment)
    - [Running](#running)
    - [API Commands](#api-commands)
  - [Web Development](#web-development)
    - [Running](#running-1)
    - [Web Commands](#web-commands)
  - [Cron Development](#cron-development)
    - [Environment](#environment-1)
    - [Running](#running-2)
  - [Database Management](#database-management)
    - [Reset Database](#reset-database)
    - [Connect to Local Database](#connect-to-local-database)
  - [References](#references)

## Prerequisites

| Tool   | Version | Install                                                      |
| ------ | ------- | ------------------------------------------------------------ |
| Python | 3.13+   | [python.org](https://www.python.org)                         |
| uv     | Latest  | [docs.astral.sh/uv](https://docs.astral.sh/uv/)              |
| Node   | 22+     | [nodejs.org](https://nodejs.org)                             |
| pnpm   | Latest  | [pnpm.io](https://pnpm.io/)                                  |
| Docker | Latest  | [docker.com](https://www.docker.com/products/docker-desktop) |

## Setup

1. Start PostgreSQL and Redis:
   ```bash
   docker compose up -d
   ```

2. Install Python dependencies:
   ```bash
   uv sync
   ```

3. Install frontend dependencies:
   ```bash
   cd apps/web && pnpm install
   ```

4. Create `.env` files from examples:
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/cron/.env.example apps/cron/.env
   ```

5. Initialize the database:
   ```bash
   cd packages/dt-db && make migrate
   ```

## Monorepo Commands

Run from the repo root:

| Command              | Description                                |
| -------------------- | ------------------------------------------ |
| `make check`         | Run all checks (ruff + ty + frontend lint) |
| `make fix`           | Auto-fix lint issues and format            |
| `make fix-and-check` | Fix then run checks                        |
| `make clean`         | Remove build artifacts                     |

## API Development

### Environment

Edit `apps/api/.env`:

| Variable             | Description                    | Required |
| -------------------- | ------------------------------ | -------- |
| `DATABASE_URL`       | PostgreSQL connection string   | No       |
| `REDIS_URL`          | Redis connection string        | No       |
| `AUTH_PASSWORD`      | App access password            | Yes      |
| `CAPSOLVER_API_KEY`  | CapSolver API key              | Yes      |
| `TURNSTILE_SITE_KEY` | DuelingBook Turnstile site key | Yes      |
| `DB_USERNAME`        | DuelingBook account username   | Yes      |
| `DB_PASSWORD`        | DuelingBook account password   | Yes      |
| `DB_ID`              | DuelingBook account ID         | Yes      |
| `DB_REGULAR`         | DuelingBook account type       | No       |

`DATABASE_URL` and `REDIS_URL` have defaults pointing to local Docker services.

### Running

You need two processes:

```bash
# Terminal 1: Backend API
cd apps/api && make dev

# Terminal 2: Celery worker
cd apps/api && make worker
```

| Service  | URL                        |
| -------- | -------------------------- |
| Backend  | http://localhost:8000      |
| API Docs | http://localhost:8000/docs |

### API Commands

| Command       | Description            |
| ------------- | ---------------------- |
| `make dev`    | Run FastAPI dev server |
| `make worker` | Run Celery worker      |

## Web Development

### Running

```bash
cd apps/web && pnpm dev
```

Opens at http://localhost:3000. Proxies `/api/*` requests to the backend on `:8000`.

The backend must be running first.

### Web Commands

| Command      | Description          |
| ------------ | -------------------- |
| `pnpm dev`   | Development server   |
| `pnpm build` | Production build     |
| `pnpm check` | Lint check (Biome)   |
| `pnpm fix`   | Auto-fix lint issues |

## Cron Development

### Environment

Edit `apps/cron/.env`:

| Variable             | Description                               | Required |
| -------------------- | ----------------------------------------- | -------- |
| `DATABASE_URL`       | PostgreSQL connection string              | Yes      |
| `FL_TOKEN`           | FormLibrary API bearer token              | Yes      |
| `CAPSOLVER_API_KEY`  | CapSolver API key                         | Yes      |
| `TURNSTILE_SITE_KEY` | DuelingBook Turnstile site key            | Yes      |
| `DB_USERNAME`        | DuelingBook account username              | Yes      |
| `DB_PASSWORD`        | DuelingBook account password              | Yes      |
| `DB_ID`              | DuelingBook account ID                    | Yes      |
| `DB_REGULAR`         | DuelingBook account type                  | No       |
| `SYNC_CONCURRENCY`   | Max concurrent scrape tasks (default: 20) | No       |

### Running

```bash
cd apps/cron

make sync       # Sync latest events (page 1)
make sync-all   # Backfill all events
```

## Database Management

### Reset Database

```bash
cd packages/dt-db

# Downgrade and re-migrate
make migrate-down && make migrate
```

### Connect to Local Database

```bash
docker exec -it duel-tools-postgres psql -U duel_tools -d duel_tools
```

## References

| Resource                                          | Description                |
| ------------------------------------------------- | -------------------------- |
| [API architecture](../architecture/api.md)        | Backend architecture       |
| [Web architecture](../architecture/web.md)        | Frontend architecture      |
| [Deploy guide](./deploy.md)                       | Production deployment      |
| [DuelingBook service](../services/duelingbook.md) | Scraping credentials setup |
| [CapSolver service](../services/capsolver.md)     | Captcha API key setup      |
