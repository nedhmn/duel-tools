# scraper

Scrapes replay JSON from DuelingBook using captcha solving services.

## Exports

- `extract_replay_id(url)` - parse replay ID from URL
- `scrape_replay(url, replay_id, api_key, site_key, solver)` - fetch raw replay JSON
- `solvers.anticaptcha.solve` - AntiCaptcha solver
- `CaptchaError`, `ScraperError` - exceptions (both retryable)

## Scripts

```bash
cp .env.example .env  # set CAPTCHA_SOLVER, CAPTCHA_API_KEY, SITE_KEY
uv run --env-file .env scripts/scrape_replay.py '<duelingbook_replay_url>'
```

Set `LOG_LEVEL=DEBUG` for verbose output.
