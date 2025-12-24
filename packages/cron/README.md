# cron

Scheduled sync of replays from external sources into the database.

## Setup

```bash
cp .env.example .env
# Edit .env with your credentials
```

## Usage

```bash
make sync        # Daily mode (page 1 only)
make sync-all    # Backfill mode (all pages)
```

## Configuration

| Variable            | Description                  | Default                  |
| ------------------- | ---------------------------- | ------------------------ |
| `DATABASE_URL`      | PostgreSQL connection string | (required)               |
| `FL_ACCESS`         | FormLibrary access cookie    | (required)               |
| `FL_PLAYER_ID`      | FormLibrary player ID cookie | (required)               |
| `FL_PLAYER_NAME`    | FormLibrary player name      | (required)               |
| `CAPSOLVER_API_KEY` | CapSolver API key            | (required, from scraper) |
| `SITE_KEY`          | reCAPTCHA site key           | (required, from scraper) |
| `DB_USERNAME`       | DuelingBook username         | (required, from scraper) |
| `DB_PASSWORD`       | DuelingBook password         | (required, from scraper) |
| `DB_ID`             | DuelingBook user ID          | (required, from scraper) |
| `DB_REGULAR`        | DuelingBook regular flag     | `not`                    |
| `SYNC_CONCURRENCY`  | Max concurrent scrapes       | `20`                     |

## How It Works

1. Fetches Goat format events from FormLibrary API
2. Queries DB for existing `duelingbook_id`s (skip duplicates)
3. Scrapes new replays concurrently (20 at a time via aiometer)
4. For each replay: scrape → parse → insert replay + players → commit
5. Logs failures and continues (resumable)

## Sources

- `formatlibrary.py` - FormLibrary API client (events + replays)
- Future: Discord channel scraper
