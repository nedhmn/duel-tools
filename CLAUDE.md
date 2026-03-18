# Project-Wide Preferences

## Code Style

- No comments, no docstrings, no module docstrings
- Code should be self-documenting through clear naming

## Dependencies

- Python: `uv add` / `uv remove`, never edit pyproject.toml directly
- Frontend: `pnpm install` / `pnpm add`, never edit package.json directly

## Validation

### Python (backend, packages)

```bash
cd apps/duel-prep/backend && make check   # ruff + ty
```

### Frontend

```bash
cd apps/duel-prep/frontend && pnpm fix && pnpm check
```

## Logging (structlog)

Structured logging via `packages/logger`. First positional arg is event name, kwargs for context.

### Event Naming

```
{resource}_{action}           # scrape_started, job_completed
{resource}_{action}_failed    # scrape_failed (error)
```

### Log Levels

| Level     | Use Case                                           |
| --------- | -------------------------------------------------- |
| `info`    | Normal operations (batch_created, replay_cached)   |
| `warning` | Expected failures with recovery (captcha_retry)    |
| `error`   | Final failures requiring attention (scrape_failed) |

### Required Context

Always include structured key-value pairs, not f-strings:

```python
logger.info("scrape_started", batch_id=batch_id, url_count=len(urls))
logger.error("scrape_failed", job_id=job_id, error=str(e))
```

## Phase Documentation

Phases live in `docs/phases/` (active) and `docs/phases/completed/` (done) with YAML frontmatter. Use `/docs-go` to manage phases.
