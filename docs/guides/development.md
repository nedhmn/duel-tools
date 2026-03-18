# Development Guide

Local development setup for duel-tools.

## Prerequisites

- Python 3.13+
- Node.js 22+
- Docker
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- [pnpm](https://pnpm.io/) (Node package manager)

## Setup

### 1. Start Services

```bash
docker compose up -d
```

This starts PostgreSQL and Redis locally.

### 2. Install Dependencies

```bash
# Python dependencies (from repo root)
uv sync

# Frontend dependencies
cd apps/web && pnpm install
```

### 3. Initialize Database

```bash
cd apps/api && make init-db
```

## Running Locally

You need three processes running:

```bash
# Terminal 1: Backend API
cd apps/api && make dev

# Terminal 2: Frontend dev server
cd apps/web && pnpm dev

# Terminal 3: Celery worker
cd apps/api && make worker
```

| Service  | URL                        |
| -------- | -------------------------- |
| Frontend | http://localhost:3000      |
| Backend  | http://localhost:8000      |
| API Docs | http://localhost:8000/docs |

The frontend proxies `/api/*` requests to the backend.

## Commands

### Backend (from `apps/api/`)

| Command         | Description                 |
| --------------- | --------------------------- |
| `make dev`      | Run FastAPI dev server      |
| `make worker`   | Run Celery worker           |
| `make init-db`  | Create database tables      |
| `make clear-db` | Delete all data from tables |

### Frontend (from `apps/web/`)

| Command      | Description             |
| ------------ | ----------------------- |
| `pnpm dev`   | Run dev server          |
| `pnpm build` | Build for production    |
| `pnpm check` | Run linting             |
| `pnpm fix`   | Auto-fix linting issues |

## Database Management

### Reset Database

```bash
cd apps/api

# Clear all data (keeps tables)
make clear-db

# Or recreate tables
make init-db
```

### Connect to Local Database

```bash
docker exec -it duel-tools-postgres psql -U duel_tools -d duel_tools
```

## Environment Variables

Local development uses defaults from `app/core/config.py`. For scraping to work, create `.env` in the backend directory:

```bash
# apps/api/.env
CAPSOLVER_API_KEY=your-key
SITE_KEY=duelingbook-recaptcha-site-key
DB_USERNAME=your-duelingbook-username
DB_PASSWORD=your-duelingbook-password
DB_ID=your-duelingbook-id
DB_REGULAR=not
```

See [deploy.md](./deploy.md) for production environment setup.
