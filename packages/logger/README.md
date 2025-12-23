# logger

Shared structlog configuration for consistent logging across packages.

## Usage

```python
from logger import setup_logging, get_logger

# Initialize once at app startup
setup_logging(log_level="INFO")

# Get a logger anywhere
logger = get_logger(__name__)

# Log with structured context
logger.info("scrape_started", batch_id=batch_id, url_count=5)
logger.error("scrape_failed", job_id=job_id, error=str(e))
```

## Log Levels

- `DEBUG` - Verbose diagnostics
- `INFO` - Normal flow (job_completed, replay_cached)
- `WARNING` - Expected failures with retry
- `ERROR` - Final failures
- `CRITICAL` - System-level errors

## Output

Logs to stdout with ISO timestamps and console formatting (for Railway/Docker).
