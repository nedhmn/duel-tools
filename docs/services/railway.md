---
title: "Railway"
description: "Hosting platform for API, Worker, and Cron services with managed PostgreSQL and Redis"
created: 2026-03-18
---

# Railway

Hosting platform for the API, Worker, and Cron services with managed PostgreSQL and Redis plugins.

## Table of Contents

- [Railway](#railway)
  - [Table of Contents](#table-of-contents)
  - [Services](#services)
    - [duel-prep-api](#duel-prep-api)
    - [duel-prep-worker](#duel-prep-worker)
    - [duel-prep-fl-cron](#duel-prep-fl-cron)
  - [Environment Variables](#environment-variables)
  - [GitHub Secrets](#github-secrets)
  - [References](#references)

## Services

API and Worker share `apps/api/Dockerfile`. Cron uses `apps/cron/Dockerfile`. All services use the repo root as build context.

### duel-prep-api

| Setting       | Value                                                 |
| ------------- | ----------------------------------------------------- |
| Dockerfile    | `apps/api/Dockerfile`                                 |
| Start Command | `fastapi run --host 0.0.0.0 --port $PORT app/main.py` |

### duel-prep-worker

| Setting       | Value                                                    |
| ------------- | -------------------------------------------------------- |
| Dockerfile    | `apps/api/Dockerfile`                                    |
| Start Command | `celery -A app.worker.celery_app worker --loglevel=info` |

### duel-prep-fl-cron

| Setting       | Value                                  |
| ------------- | -------------------------------------- |
| Dockerfile    | `apps/cron/Dockerfile`                 |
| Start Command | `python scripts/sync_formatlibrary.py` |
| Cron Schedule | `0 0 * * *` (daily at midnight UTC)    |

## Environment Variables

Shared by API and Worker:

| Variable            | Source            | Description                                     |
| ------------------- | ----------------- | ----------------------------------------------- |
| `DATABASE_URL`      | PostgreSQL plugin | Auto-provided connection string                 |
| `REDIS_URL`         | Redis plugin      | Auto-provided connection string                 |
| `PORT`              | Railway           | Auto-injected, used by API only (`fastapi run`) |
| `AUTH_PASSWORD`     | Manual            | App access password                             |
| `CAPSOLVER_API_KEY` | Manual            | CapSolver API key for captcha solving           |
| `SITE_KEY`          | Manual            | DuelingBook reCAPTCHA site key                  |
| `DB_USERNAME`       | Manual            | DuelingBook account username                    |
| `DB_PASSWORD`       | Manual            | DuelingBook account password                    |
| `DB_ID`             | Manual            | DuelingBook account ID                          |
| `DB_REGULAR`        | Manual            | DuelingBook account type (default: "not")       |

Cron-only:

| Variable            | Source            | Description                               |
| ------------------- | ----------------- | ----------------------------------------- |
| `DATABASE_URL`      | PostgreSQL plugin | Auto-provided connection string           |
| `FL_TOKEN`          | Manual            | FormLibrary API bearer token              |
| `CAPSOLVER_API_KEY` | Manual            | CapSolver API key for captcha solving     |
| `SITE_KEY`          | Manual            | DuelingBook reCAPTCHA site key            |
| `DB_USERNAME`       | Manual            | DuelingBook account username              |
| `DB_PASSWORD`       | Manual            | DuelingBook account password              |
| `DB_ID`             | Manual            | DuelingBook account ID                    |
| `DB_REGULAR`        | Manual            | DuelingBook account type (default: "not") |

## GitHub Secrets

| Secret          | Description                                                         |
| --------------- | ------------------------------------------------------------------- |
| `RAILWAY_TOKEN` | Railway token for deployment (Railway dashboard → Account → Tokens) |

## References

| Resource                                                           | Description            |
| ------------------------------------------------------------------ | ---------------------- |
| [Railway CLI](https://docs.railway.com/develop/cli)                | Deploy from CI         |
| [PostgreSQL Plugin](https://docs.railway.com/databases/postgresql) | Database setup         |
| [Redis Plugin](https://docs.railway.com/databases/redis)           | Redis setup            |
| [Railway Dashboard](https://railway.com/dashboard)                 | Manage services        |
| [Deploy guide](../guides/deploy.md)                                | CI/CD workflow details |
