# scraper

Scrapes replay JSON from DuelingBook using AntiCaptcha for reCAPTCHA v3.

## Exports

- `extract_replay_id(url)` - parse replay ID from URL (handles `?id=123` and `?id=user-123` formats)
- `scrape_replay(url, replay_id, api_key, site_key)` - solve captcha + fetch raw replay JSON
- `CaptchaError`, `ScraperError` - exceptions (both retryable)

## Scripts

```bash
cp .env.example .env  # add ANTICAPTCHA_API_KEY, SITE_KEY
uv run --env-file .env scripts/scrape_replay.py '<duelingbook_replay_url>'
```

Set `LOG_LEVEL=DEBUG` for verbose output.
