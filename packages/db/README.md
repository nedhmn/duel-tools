# db

SQLAlchemy models and session factories for PostgreSQL.

## Models

| Model          | Description                                                      |
| -------------- | ---------------------------------------------------------------- |
| `Batch`        | Collection of scrape jobs                                        |
| `Job`          | Individual scrape task (pending → processing → completed/failed) |
| `Replay`       | DuelingBook replay with raw JSON and parsed metadata             |
| `Player`       | Unique player by username                                        |
| `ReplayPlayer` | Many-to-many link between replays and players                    |

## Usage

```python
from db.models import Batch, Job, Replay, Player, ReplayPlayer
from db.session import create_async_session_factory, create_sync_session_factory

# Async (for FastAPI, seeder)
session_factory = create_async_session_factory("postgresql+asyncpg://...")
async with session_factory() as session:
    result = await session.execute(select(Replay))

# Sync (for Celery workers)
session_factory = create_sync_session_factory("postgresql://...")
with session_factory() as session:
    result = session.execute(select(Replay))
```
