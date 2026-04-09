---
title: "Deployment Guide"
description: "CI/CD workflows and production deployment for duel-tools"
created: 2026-03-18
---

# Deployment

CI/CD configuration and production deployment.

## Table of Contents

- [Deployment](#deployment)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [First Deployment](#first-deployment)
    - [1. Railway Setup](#1-railway-setup)
    - [2. GitHub Secrets](#2-github-secrets)
    - [3. Push to Main](#3-push-to-main)
    - [4. Initialize Database](#4-initialize-database)
  - [GitHub Secrets](#github-secrets)
  - [Database Initialization](#database-initialization)
  - [CI/CD Workflows](#cicd-workflows)
    - [ci.yml — Code Quality](#ciyml--code-quality)
    - [app-ci.yml — API + Worker](#app-ciyml--api--worker)
    - [cron-ci.yml — Cron Service](#cron-ciyml--cron-service)
  - [Ongoing Deploys](#ongoing-deploys)
  - [Verify](#verify)
  - [References](#references)

## Prerequisites

| Service   | Purpose                   | Sign Up                                    |
| --------- | ------------------------- | ------------------------------------------ |
| GitHub    | Repository + CI/CD        | [github.com](https://github.com)           |
| Railway   | API, Worker, Cron hosting | [railway.app](https://railway.app)         |
| CapSolver | Captcha solving           | [capsolver.com](https://www.capsolver.com) |

A DuelingBook account is also required for scraping credentials.

## First Deployment

### 1. Railway Setup

Create a Railway project with PostgreSQL and Redis plugins, then configure three services. See [Railway service docs](../services/railway.md) for service configuration and environment variables.

### 2. GitHub Secrets

Add the Railway token to GitHub before the first push to `main`.

### 3. Push to Main

The first push triggers CI/CD workflows which build and deploy all services.

### 4. Initialize Database

Run once after the first deployment via Railway shell:

```bash
python scripts/init_db.py
```

## GitHub Secrets

| Secret          | Source                               |
| --------------- | ------------------------------------ |
| `RAILWAY_TOKEN` | Railway Dashboard → Account → Tokens |

## Database Initialization

First deployment only. Run via Railway shell on the API service:

```bash
python scripts/init_db.py
```

To clear all data (keeps tables):

```bash
python scripts/clear_db.py
```

## CI/CD Workflows

### ci.yml — Code Quality

| Setting | Value                                                         |
| ------- | ------------------------------------------------------------- |
| Trigger | Push to main + PRs (paths-ignore: `docs/**`)                  |
| Jobs    | `uv sync --locked` → `make check` (ruff + ty + frontend lint) |

### app-ci.yml — API + Worker

| Setting       | Value                                             |
| ------------- | ------------------------------------------------- |
| Trigger       | Push to main + PRs                                |
| Paths         | `apps/api/**`, `apps/web/**`, `packages/**`       |
| Build Job     | Docker build validation with BuildKit + GHA cache |
| Deploy API    | Railway deploy `duel-prep-api` (main only)        |
| Deploy Worker | Railway deploy `duel-prep-worker` (main only)     |

### cron-ci.yml — Cron Service

| Setting     | Value                                                              |
| ----------- | ------------------------------------------------------------------ |
| Trigger     | Push to main + PRs                                                 |
| Paths       | `apps/cron/**`, `packages/**`                                      |
| Build Job   | Docker build validation with BuildKit + GHA cache                  |
| Deploy Cron | Railway deploy `duel-prep-fl-cron` (main only, currently disabled) |

## Ongoing Deploys

Push to `main` triggers CI automatically:

| Workflow      | Purpose                       | Deploy Targets                      |
| ------------- | ----------------------------- | ----------------------------------- |
| `ci.yml`      | Lint, type check, format      | —                                   |
| `app-ci.yml`  | Build + deploy API and Worker | `duel-prep-api`, `duel-prep-worker` |
| `cron-ci.yml` | Build + deploy Cron           | `duel-prep-fl-cron` (disabled)      |

## Verify

1. Check health endpoint: `GET /api/v1/health`
2. Create a batch with a test URL
3. Verify worker is processing jobs (check Railway logs)

## References

| Resource                                               | Description               |
| ------------------------------------------------------ | ------------------------- |
| [Railway service docs](../services/railway.md)         | Service config + env vars |
| [CapSolver service docs](../services/capsolver.md)     | Captcha API setup         |
| [DuelingBook service docs](../services/duelingbook.md) | Scraping credentials      |
| [Development guide](./development.md)                  | Local development setup   |
