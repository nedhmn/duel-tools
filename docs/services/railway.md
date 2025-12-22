# Railway Deployment

## Overview

duel-prep is deployed on Railway with the following services:

- **duel-prep-api** - FastAPI backend serving static frontend
- **duel-prep-worker** - Celery worker for background scraping tasks
- **PostgreSQL** - Database (Railway plugin)
- **Redis** - Celery broker (Railway plugin)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Railway                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ PostgreSQL   │    │    Redis     │    │   GitHub     │  │
│  │   plugin     │    │   plugin     │    │    repo      │  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘  │
│         │                   │                   │          │
│         │ DATABASE_URL      │ REDIS_URL         │          │
│         │                   │                   │          │
│  ┌──────▼───────────────────▼───────────────────▼───────┐  │
│  │                  duel-prep-api                        │  │
│  │  - FastAPI + static frontend                          │  │
│  │  - Dockerfile: apps/duel-prep/backend/Dockerfile      │  │
│  │  - CMD: fastapi run ...                               │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  duel-prep-worker                      │  │
│  │  - Celery worker                                       │  │
│  │  - Same Dockerfile                                     │  │
│  │  - CMD: celery -A app.worker.celery_app worker ...    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Dockerfile

The Dockerfile is at `apps/duel-prep/backend/Dockerfile` but uses the repo root as build context (Turborepo pattern).

**Key features:**
- Multi-stage build: Node frontend → Python backend
- Uses `uv` for Python dependency management
- `UV_COMPILE_BYTECODE=1` for faster startup
- `--no-install-workspace` for layer caching
- Non-root user (`appuser`) for security
- `fastapi run` (modern CLI)

**Build locally:**
```bash
docker build -f apps/duel-prep/backend/Dockerfile -t duel-prep .
```

## Service Configuration

### duel-prep-api

| Setting         | Value                             |
| --------------- | --------------------------------- |
| Source          | GitHub repo                       |
| Root Directory  | (empty - repo root)               |
| Dockerfile Path | Set via `RAILWAY_DOCKERFILE_PATH` |
| Start Command   | (use Dockerfile default)          |

**Variables:**
```
RAILWAY_DOCKERFILE_PATH=apps/duel-prep/backend/Dockerfile
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
CAPSOLVER_API_KEY=<your-key>
SITE_KEY=<duelingbook-site-key>
DB_USERNAME=<duelingbook-username>
DB_PASSWORD=<duelingbook-password>
DB_ID=<duelingbook-id>
DB_REGULAR=not
```

### duel-prep-worker

Same as API, except:

| Setting       | Value                                                    |
| ------------- | -------------------------------------------------------- |
| Start Command | `celery -A app.worker.celery_app worker --loglevel=info` |

## GitHub Actions CI/CD

Workflow: `.github/workflows/deploy.yml`

**Triggers:**
- Push to `main` branch (paths: `apps/duel-prep/**`, `packages/**`)
- Manual dispatch

**Jobs:**
1. `lint` - Backend (`make check`) + Frontend (`pnpm check`)
2. `deploy-api` - Deploy to `duel-prep-api` service
3. `deploy-worker` - Deploy to `duel-prep-worker` service

**Required secret:** `RAILWAY_TOKEN`

## Database Management

**Initialize tables (first deploy):**
```bash
# Railway shell
python scripts/init_db.py
```

**Clear all data:**
```bash
# Railway shell
python scripts/clear_db.py
```

## Environment Variables Reference

| Variable            | Source            | Description                               |
| ------------------- | ----------------- | ----------------------------------------- |
| `DATABASE_URL`      | PostgreSQL plugin | Auto-provided by Railway                  |
| `REDIS_URL`         | Redis plugin      | Auto-provided by Railway                  |
| `PORT`              | Railway           | Auto-injected, used by `fastapi run`      |
| `CAPSOLVER_API_KEY` | Manual            | CapSolver API key for captcha solving     |
| `SITE_KEY`          | Manual            | DuelingBook reCAPTCHA site key            |
| `DB_USERNAME`       | Manual            | DuelingBook account username              |
| `DB_PASSWORD`       | Manual            | DuelingBook account password              |
| `DB_ID`             | Manual            | DuelingBook account ID                    |
| `DB_REGULAR`        | Manual            | DuelingBook account type (default: "not") |

## Troubleshooting

### Celery "running as root" warning
Fixed by adding non-root user in Dockerfile:
```dockerfile
RUN useradd --create-home appuser
USER appuser
```

### Missing capsolver_task.json
Fixed by adding to `packages/scraper/pyproject.toml`:
```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["src/scraper"]
artifacts = ["*.json"]
```

### Static files not serving
Ensure the Dockerfile copies frontend build:
```dockerfile
COPY --from=frontend /app/dist apps/duel-prep/backend/static
```

And `main.py` checks for static dir existence before mounting.
