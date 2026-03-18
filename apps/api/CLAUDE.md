# Backend Rules & Preferences

## Project Structure

- Each feature: `api/{feature}/routes.py` exports `router = APIRouter()`
- Feature models: `api/{feature}/models.py`
- Shared deps: `api/deps.py`
- Router aggregation: `api/main.py`
- Never duplicate logic that belongs in packages

## Route Handlers

Parameter order: `db → filters/request body`

```python
async def list_items(db: DbSession, filters: Annotated[Filters, Query()]):
```

## Celery Worker

- Use `bind=True` for retry access
- Update job status in DB after each state change
- `autoretry_for` with `retry_kwargs` for transient errors
- Catch final exceptions and mark job as failed

## Pydantic v2

- Use `SettingsConfigDict` / `ConfigDict`, never `class Config`
- Use `ConfigDict(from_attributes=True)` on response models mapping from ORM
- Use `Field(...)` for required fields
- Use `str | None` not `Optional[str]`

## Type Hints

- All functions must have return type annotations
- ty strict mode
- Avoid `Any` — use proper models
