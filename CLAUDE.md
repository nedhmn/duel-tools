# Project-Wide Preferences

## Code Style

- No comments, no docstrings, no module docstrings
- Code should be self-documenting through clear naming

## Dependencies

- **NEVER** edit `pyproject.toml` or `package.json` dependency sections directly
- Python: always use `uv add` / `uv remove` (use `--dev` for dev dependencies)
- Frontend: always use `pnpm add` / `pnpm remove`

## Validation

Run `make fix-and-check` from the repo root after making code changes.

```bash
make fix-and-check
```

## Logging (structlog)

Structured logging via `packages/logger`. First positional arg is event name, kwargs for context.

### Event Naming

```
{resource}_{action}           # scrape_started, job_completed
{resource}_{action}_completed # scrape_completed (end of operation)
{resource}_{action}_failed    # scrape_failed (error)
```

### Log Levels

| Level     | Use Case                                           |
| --------- | -------------------------------------------------- |
| `info`    | Normal operations (batch_created, replay_cached)   |
| `warning` | Expected failures with recovery (captcha_retry)    |
| `error`   | Final failures requiring attention (scrape_failed) |

### When to Log

These operations **must** have logging:

| Operation                 | What to log                                  |
| ------------------------- | -------------------------------------------- |
| API route handlers        | Request received + response (or error)       |
| External API calls        | Call start + success/failure with status     |
| Database writes           | Entity created/updated/deleted with IDs      |
| Background tasks          | Task started + completed/failed + retries    |
| Data pipelines            | Items processed, skipped, failed with counts |
| Race conditions / retries | Each attempt with context                    |

**Never** use `print()` — always use `logger`. Scripts included.

### Required Context

Always include structured key-value pairs, not f-strings:

```python
logger.info("scrape_started", batch_id=batch_id, url_count=len(urls))
logger.error("scrape_failed", job_id=job_id, error=str(e))
```

### Pattern: Request Lifecycle

```python
@router.post("")
async def create_item(request: CreateRequest):
    logger.info("item_create_requested", url_count=len(request.urls))
    # ... do work ...
    logger.info("item_created", item_id=str(item.id))
    return item
```

### Pattern: External API Calls

```python
try:
    result = await client.fetch(params)
    logger.info("external_fetch_completed", count=len(result))
except ExternalAPIError as e:
    logger.error("external_fetch_failed", error=str(e))
    raise
```

## Phase Documentation

Phases live in `docs/phases/` (active) and `docs/phases/completed/` (done) with YAML frontmatter. Use `/docs-go` to manage phases.
