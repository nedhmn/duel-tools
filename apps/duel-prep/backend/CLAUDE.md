# duel-prep Backend

## Project Structure

```bash
app/
├── __init__.py
├── main.py                  # App entry, static serving, routers
├── core/
│   ├── __init__.py
│   ├── config.py            # pydantic-settings
│   └── logging.py           # structlog setup
├── api/
│   ├── __init__.py
│   ├── main.py              # public_router
│   ├── deps.py              # get_db, etc.
│   ├── scrape/
│   │   ├── routes.py
│   │   └── models.py
│   ├── replays/
│   │   ├── routes.py
│   │   └── models.py
│   └── players/
│       ├── routes.py
│       └── models.py
└── worker/
    ├── __init__.py
    ├── celery_app.py
    └── tasks.py
```

## Route Collocation

- Each feature: `api/{feature}/routes.py` exports `router = APIRouter()`
- Feature models: `api/{feature}/models.py`
- Shared deps: `api/deps.py`
- Import as: `from app.api.{feature}.routes import router as {feature}_router`

## Shared Packages

```python
from db.models import Batch, Job, Replay, Player, ReplayPlayer
from db.session import get_session
from parser import parse_replay
from scraper import DuelingBookClient, solve_captcha
```

Never duplicate logic that belongs in packages.

## Code Style

- No comments, no docstrings, no module docstrings
- Code should be self-documenting through clear naming

## Logging (structlog)

Logs to stdout for Railway. First positional arg is event name, kwargs for context.

```python
logger.info("scrape_started", batch_id=batch_id, url_count=len(urls))
logger.info("job_completed", job_id=job_id, replay_id=replay_id)
logger.warning("captcha_retry", job_id=job_id, attempt=attempt)
logger.error("scrape_failed", job_id=job_id, error=str(e))
```

### Log Levels

- `info`: Normal flow (batch_created, job_completed, replay_cached)
- `warning`: Expected failures with retry (captcha_retry, rate_limited)
- `error`: Final failures (scrape_failed, db_error)
- `debug`: Verbose diagnostics

### Conventions

- Event names: lowercase snake_case
- Context keys: lowercase snake_case (job_id, batch_id, replay_id)

## Celery Worker

Tasks in `app/worker/tasks.py`.

```python
@celery_app.task(bind=True, max_retries=3)
def scrape_replay(self, job_id: str, url: str) -> None:
    try:
        # Update job status to processing
        # Scrape
        # Update job status to completed
    except CaptchaError as e:
        raise self.retry(exc=e, countdown=5)
    except Exception as e:
        # Update job status to failed with error message
```

- Use `bind=True` for retry access
- Update job status in DB after each state change
- Catch exceptions and mark job as failed

## Job Status Flow

```
pending → processing → completed
                    ↘ failed
```

## Pydantic v2

- Use `SettingsConfigDict` not `class Config`
- Use `ConfigDict` for model config
- Use `Field(...)` for required fields
- Use `str | None` not `Optional[str]`

## Type Hints

- All functions must have return type annotations
- mypy strict mode
- Avoid `Any` - use proper models

## Development

```bash
docker-compose up -d          # postgres + redis
make dev                      # FastAPI + Celery worker
make check                    # ruff + mypy
```
