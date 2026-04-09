---
title: "Capsolver Package Extraction & Turnstile Migration"
description: "Design for extracting capsolver into its own package and adding Cloudflare Turnstile support"
created: 2026-04-08
---

# Capsolver Package Extraction & Turnstile Migration

## Table of Contents

- [Capsolver Package Extraction \& Turnstile Migration](#capsolver-package-extraction--turnstile-migration)
  - [Table of Contents](#table-of-contents)
  - [Background](#background)
  - [Current Architecture](#current-architecture)
  - [What Changed](#what-changed)
  - [Turnstile via Capsolver](#turnstile-via-capsolver)
    - [Task Object](#task-object)
    - [Solution Object](#solution-object)
    - [Differences from reCAPTCHA v2](#differences-from-recaptcha-v2)
  - [New Package Scaffold](#new-package-scaffold)
    - [packages/capsolver\_client](#packagescapsolver_client)
    - [packages/scraper (updated)](#packagesscraper-updated)
  - [Dependency Flow](#dependency-flow)
  - [Open Items](#open-items)
  - [References](#references)

## Background

`packages/scraper` scrapes replay JSON from DuelingBook. It uses Capsolver to bypass a CAPTCHA challenge before POSTing to the `/view-replay` endpoint. The capsolver logic is tightly coupled into the scraper — config, task JSON, solve function, and `CaptchaError` all live inside `packages/scraper`.

DuelingBook switched from Google reCAPTCHA v2 to Cloudflare Turnstile, breaking the existing flow.

## Current Architecture

```
packages/scraper/
├── src/scraper/
│   ├── __init__.py              # exports: scrape_replay, extract_replay_id, CaptchaError, ScraperError, settings
│   ├── client.py                # _solve_captcha() + scrape_replay() + extract_replay_id()
│   ├── config.py                # CAPSOLVER_API_KEY, SITE_KEY, DB_* auth creds
│   ├── exceptions.py            # ScraperError, CaptchaError
│   └── capsolver_task.json      # ReCaptchaV2TaskProxyLess config (huge base64 anchor/reload blobs)
```

| Component             | Location        | Concern                                                              |
| --------------------- | --------------- | -------------------------------------------------------------------- |
| `_solve_captcha()`    | `client.py`     | Sets `capsolver.api_key`, loads task JSON, calls `capsolver.solve()` |
| `capsolver_task.json` | package root    | `ReCaptchaV2TaskProxyLess` with `anchor`/`reload` base64 blobs       |
| `CaptchaError`        | `exceptions.py` | Raised on captcha failures                                           |
| `CAPSOLVER_API_KEY`   | `config.py`     | API key for capsolver.com                                            |
| `SITE_KEY`            | `config.py`     | reCAPTCHA v2 site key (`6Lfxs4Up...`)                                |

The scraper flow:

1. `_solve_captcha()` loads task JSON, sends `ReCaptchaV2TaskProxyLess` to capsolver
2. Gets back `gRecaptchaResponse` token + `userAgent` + `secChUa` + optional `recaptcha-ca-t`/`recaptcha-ca-e` cookies
3. POSTs to `/view-replay` with `{token, recaptcha_version: 1, master: false}`

Consumers: `apps/api` (Celery worker + route), `apps/cron` (pipeline).

## What Changed

DuelingBook switched from **Google reCAPTCHA v2** to **Cloudflare Turnstile**.

- Different sitekey (Turnstile keys start with `0x4...`)
- Different token format
- The `/view-replay` endpoint likely expects different form data fields

## Turnstile via Capsolver

Capsolver supports Turnstile via task type `AntiTurnstileTaskProxyLess`[^1]. No proxy required. All Turnstile subtypes (manual, non-interactive, invisible) are automatically handled.

### Task Object

```json
{
  "type": "AntiTurnstileTaskProxyLess",
  "websiteURL": "https://www.duelingbook.com/replay?id=...",
  "websiteKey": "<turnstile-sitekey>",
  "metadata": {
    "action": "...",
    "cdata": "..."
  }
}
```

| Field             | Required | Description                                   |
| ----------------- | -------- | --------------------------------------------- |
| `type`            | Yes      | `AntiTurnstileTaskProxyLess`                  |
| `websiteURL`      | Yes      | Target page URL                               |
| `websiteKey`      | Yes      | Turnstile sitekey from the page               |
| `metadata.action` | No       | `data-action` attribute from Turnstile widget |
| `metadata.cdata`  | No       | `data-cdata` attribute from Turnstile widget  |

### Solution Object

```json
{
  "token": "0.mF74FV8w...",
  "type": "turnstile",
  "userAgent": "Mozilla/5.0 ..."
}
```

### Differences from reCAPTCHA v2

| Aspect                  | reCAPTCHA v2                                          | Turnstile                              |
| ----------------------- | ----------------------------------------------------- | -------------------------------------- |
| Task type               | `ReCaptchaV2TaskProxyLess`                            | `AntiTurnstileTaskProxyLess`           |
| Task config             | Needs `anchor`/`reload` base64 blobs                  | Just URL + sitekey + optional metadata |
| Token field in solution | `gRecaptchaResponse`                                  | `token`                                |
| Extra solution fields   | `secChUa`, `recaptcha-ca-t`, `recaptcha-ca-e` cookies | None — just `token` + `userAgent`      |
| SDK call                | `capsolver.solve(task)`                               | `capsolver.solve(task)` (same)         |

Python SDK usage[^1]:

```python
import capsolver

solution = capsolver.solve({
    "type": "AntiTurnstileTaskProxyLess",
    "websiteURL": "https://www.duelingbook.com/replay?id=...",
    "websiteKey": "0x4XXXXXXXXXXXXXXXXX",
})
token = solution["token"]
```

## New Package Scaffold

### packages/capsolver_client

```
packages/capsolver_client/
├── pyproject.toml
├── .env.example                     # CAPSOLVER_API_KEY
├── src/capsolver_client/
│   ├── __init__.py                  # exports from both engines + CaptchaError + settings
│   ├── config.py                    # CapsolverSettings (API key only)
│   ├── exceptions.py                # CaptchaError
│   ├── recaptcha_v2/
│   │   ├── __init__.py
│   │   ├── client.py                # solve_recaptcha_v2(url, site_key) -> CaptchaSolution
│   │   └── task.json                # anchor/reload blob (moved from scraper)
│   └── turnstile/
│       ├── __init__.py
│       └── client.py                # solve_turnstile(url, site_key, metadata?) -> CaptchaSolution
```

Named `capsolver_client` to avoid shadowing the `capsolver` pip package.

| Component                | Responsibility                                                      |
| ------------------------ | ------------------------------------------------------------------- |
| `config.py`              | `CAPSOLVER_API_KEY` only — site keys are caller-provided            |
| `exceptions.py`          | `CaptchaError` (moved from scraper)                                 |
| `recaptcha_v2/client.py` | Wraps existing `_solve_captcha` logic with task JSON                |
| `turnstile/client.py`    | Builds `AntiTurnstileTaskProxyLess` task, calls `capsolver.solve()` |

Both engines return a consistent shape (token + user_agent).

### packages/scraper (updated)

```
packages/scraper/
├── pyproject.toml                   # capsolver pip dep → capsolver_client workspace dep
├── .env.example                     # SITE_KEY, DB_* creds (CAPSOLVER_API_KEY removed)
├── src/scraper/
│   ├── __init__.py                  # exports: ScraperError, extract_replay_id, scrape_replay, settings
│   ├── client.py                    # scrape_replay() calls capsolver_client.solve_turnstile()
│   ├── config.py                    # ScraperSettings — SITE_KEY + DB_* auth (no CAPSOLVER_API_KEY)
│   └── exceptions.py                # ScraperError only (CaptchaError removed)
├── scripts/
│   └── scrape_replay.py
```

Removed from scraper: `capsolver` pip dep, `capsolver_task.json`, `CaptchaError`, `_solve_captcha()`.

`SITE_KEY` stays in scraper config — it's duelingbook-specific, not a capsolver concern.

## Dependency Flow

```
capsolver (pip)  ←  packages/capsolver_client  ←  packages/scraper  ←  apps/api, apps/cron
                          ↑
                    packages/logger
```

## Open Items

| Item                     | Detail                                                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------------------------- |
| Turnstile sitekey        | Need to extract from duelingbook page (`0x4...`)                                                         |
| Turnstile metadata       | Check if `data-action` / `data-cdata` attributes are present on the widget                               |
| `/view-replay` form data | Confirm what fields the endpoint expects now (token field name, `recaptcha_version` flag)                |
| Consumer updates         | `apps/api` and `apps/cron` import `CaptchaError` from scraper — update to import from `capsolver_client` |

## References

| Resource                                                                                                                    | Description                              |
| --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| [Capsolver Turnstile Docs](https://docs.capsolver.com/en/guide/captcha/cloudflare_turnstile/)                               | Official task structure and SDK examples |
| [Capsolver Cloudflare Products](https://www.capsolver.com/products/cloudflare)                                              | Capsolver Cloudflare product page        |
| [How to Solve Turnstile Captcha — Capsolver Blog](https://www.capsolver.com/blog/Cloudflare/how-to-solve-turnstile-captcha) | Walkthrough with Python examples         |
| [How to Solve Cloudflare Turnstile in 2026](https://www.capsolver.com/blog/Cloudflare/how-to-solve-cloudflare)              | Updated guide for 2026                   |

[^1]: [Capsolver Turnstile Docs](https://docs.capsolver.com/en/guide/captcha/cloudflare_turnstile/)
