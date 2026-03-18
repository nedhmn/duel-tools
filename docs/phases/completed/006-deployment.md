---
title: "Deployment"
phase: 6
status: completed
created: 2026-03-18
completed: 2026-03-18
context_doc: null
description: "Deployment (6a–6d: Dockerfile, CI/CD, Railway, fixes)"
---

## Tasks

### 6a: Dockerfile + Static Serving

- [x] `apps/api/Dockerfile` - Multi-stage: Node frontend build → Python backend with uv
- [x] `.dockerignore` - Create (repo root)
- [x] `apps/api/app/main.py` - Add static file serving, catch-all route for SPA

### 6b: GitHub Actions CI/CD

- [x] `.github/workflows/deploy.yml` - Create
  - [x] Trigger: push to main (paths: `apps/api/**, apps/web/**`, `packages/**`) + manual dispatch
  - [x] Job 1: `lint` - Backend (`make check`) + Frontend (`pnpm check`)
  - [x] Job 2: `deploy-api` - Railway CLI deploy to `duel-prep-api` service
  - [x] Job 3: `deploy-worker` - Railway CLI deploy to `duel-prep-worker` service

### 6c: Railway Setup

- [x] Create project: "duel-tools"
- [x] Add PostgreSQL plugin → `DATABASE_URL`
- [x] Add Redis plugin → `REDIS_URL`
- [x] Create service: `duel-prep-api`
- [x] Create service: `duel-prep-worker`
- [x] Init database (one-time): Railway shell → `python scripts/init_db.py`
- [x] Add `RAILWAY_TOKEN` secret to GitHub repo settings

### 6d: Deployment Fixes

- [x] Added `[build-system]` with hatchling to `packages/scraper/pyproject.toml`
- [x] Added `artifacts = ["*.json"]` to include `capsolver_task.json` in wheel
- [x] Fixed breadcrumbs - "Home" now shows on `/batch` and `/players` pages
- [x] Removed TanStack boilerplate images from `public/`
- [x] Updated `manifest.json` with "Duel Tools" name
- [x] Added `scripts/clear_db.py` - Delete all data from tables
- [x] Added `make clear-db` command

## References

| Resource                               | Description                               |
| -------------------------------------- | ----------------------------------------- |
| [Deploy guide](../../guides/deploy.md) | CI/CD workflows and environment variables |
| [Railway](../../services/railway.md)   | Railway service configuration             |
