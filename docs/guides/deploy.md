# Deployment Guide

How to deploy duel-tools to production.

## Prerequisites

Before deploying, you need:

### API Keys & Credentials

| Credential        | Where to get it                         |
| ----------------- | --------------------------------------- |
| CAPSOLVER_API_KEY | [CapSolver](https://www.capsolver.com/) |
| SITE_KEY          | DuelingBook reCAPTCHA site key          |
| DB_USERNAME       | Your DuelingBook account username       |
| DB_PASSWORD       | Your DuelingBook account password       |
| DB_ID             | Your DuelingBook account ID             |

### Infrastructure

- GitHub repository (for CI/CD)
- Railway account (or other hosting)
- PostgreSQL database
- Redis instance

## Docker Build

Test the production build locally:

```bash
# From repo root
docker build -f apps/api/Dockerfile -t duel-prep .

# Run it
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://... \
  duel-prep
```

The Dockerfile:
- Multi-stage build (Node frontend → Python backend)
- Bundles frontend static files into backend
- Uses `uv` for fast Python installs
- Runs as non-root user

## CI/CD

Three GitHub Actions workflows in `.github/workflows/`:

### `ci.yml` — Generic checks (all changes)

**Triggers:** push to main + PRs (paths-ignore: `docs/**`)

**Jobs:**
- `check` — `uv sync --locked` → `make check` (ruff + ty + frontend lint)

### `app-ci.yml` — App services (API + Worker)

**Triggers:** push to main + PRs
**Paths:** `apps/api/**`, `apps/web/**`, `packages/**`

**Jobs:**
- `build` — Docker build validation with BuildKit + GHA cache
- `deploy-api` — Railway deploy `duel-prep-api` (main only)
- `deploy-worker` — Railway deploy `duel-prep-worker` (main only)

### `cron-ci.yml` — Cron service

**Triggers:** push to main + PRs
**Paths:** `apps/cron/**`, `packages/**`, `.github/workflows/cron-ci.yml`

**Jobs:**
- `build` — Docker build validation with BuildKit + GHA cache
- `deploy-cron` — Railway deploy `duel-prep-fl-cron` (main only, currently commented out)

**Required Secrets:**
- `RAILWAY_TOKEN` — Railway API token

## Railway Deployment

See [services/railway.md](../services/railway.md) for Railway-specific setup:

- Project & service configuration
- Environment variables
- Database initialization
- Troubleshooting

## Environment Variables

| Variable          | Description                       | Required |
| ----------------- | --------------------------------- | -------- |
| DATABASE_URL      | PostgreSQL connection string      | Yes      |
| REDIS_URL         | Redis connection string           | Yes      |
| AUTH_PASSWORD     | App access password               | Yes      |
| CAPSOLVER_API_KEY | CapSolver API key                 | Yes      |
| SITE_KEY          | DuelingBook reCAPTCHA site key    | Yes      |
| DB_USERNAME       | DuelingBook account username      | Yes      |
| DB_PASSWORD       | DuelingBook account password      | Yes      |
| DB_ID             | DuelingBook account ID            | Yes      |
| DB_REGULAR        | DuelingBook account type          | No       |
| PORT              | Server port (auto-set by Railway) | No       |

## Post-Deployment

### Initialize Database

First deployment only:

```bash
# Railway shell
python scripts/init_db.py
```

### Verify Deployment

1. Check health endpoint: `GET /api/v1/health`
2. Try creating a batch with a test URL
3. Verify worker is processing jobs (check logs)
