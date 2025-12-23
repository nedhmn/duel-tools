# duel-prep backend

FastAPI + Celery backend for DuelingBook replay scraping and analysis.

## Setup

```bash
cp .env.example .env  # Configure environment
make init-db          # Create database tables
```

## Development

```bash
make dev     # FastAPI server on :8000
make worker  # Celery worker (separate terminal)
```

## API Endpoints

| Endpoint                               | Description                 |
| -------------------------------------- | --------------------------- |
| `POST /api/v1/scrape`                  | Submit batch of replay URLs |
| `GET /api/v1/scrape/{batch_id}`        | Get batch status + jobs     |
| `GET /api/v1/batches`                  | List recent batches         |
| `GET /api/v1/replays/{duelingbook_id}` | Get parsed replay           |
| `GET /api/v1/players`                  | List all players            |
| `GET /api/v1/players/{player_id}`      | Get player with replays     |
| `GET /health`                          | Health check                |

## Commands

| Command         | Description                 |
| --------------- | --------------------------- |
| `make dev`      | Run FastAPI dev server      |
| `make worker`   | Run Celery worker           |
| `make init-db`  | Create database tables      |
| `make clear-db` | Delete all data             |
| `make check`    | Run linting + type checking |

## Architecture

```
app/
├── api/           # Route handlers
│   ├── scrape/    # POST/GET batch endpoints
│   ├── batches/   # List batches
│   ├── replays/   # Get parsed replay
│   ├── players/   # Player list/detail
│   └── health/    # Health check
├── worker/        # Celery tasks
│   ├── celery_app.py
│   ├── tasks.py   # scrape_replay_task
│   └── services.py
└── core/          # Config, logging
```
