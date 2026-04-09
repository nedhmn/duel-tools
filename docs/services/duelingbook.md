---
title: "DuelingBook"
description: "Replay scraping via DuelingBook API with CapSolver Turnstile bypass"
created: 2026-03-18
---

# DuelingBook

Replay data source for Yu-Gi-Oh duels. Replays are scraped via HTTP POST with a Turnstile token solved by CapSolver.

## Table of Contents

- [DuelingBook](#duelingbook)
  - [Table of Contents](#table-of-contents)
  - [Scraping Flow](#scraping-flow)
  - [CapSolver Integration](#capsolver-integration)
  - [Authentication](#authentication)
    - [Finding Your Cookie Values](#finding-your-cookie-values)
  - [Environment Variables](#environment-variables)
  - [References](#references)

## Scraping Flow

Replays are fetched from `https://www.duelingbook.com/view-replay` via POST with a solved captcha token. The response is raw JSON containing duel logs (card plays, game events, results).

| Step | Action                                                              |
| ---- | ------------------------------------------------------------------- |
| 1    | Extract replay ID from URL query param (`?id=123` or `?id=456-123`) |
| 2    | Solve Cloudflare Turnstile via CapSolver                            |
| 3    | POST to `/view-replay` with captcha token + auth cookies            |
| 4    | Parse JSON response (error responses have `"action": "Error"`)      |

The scraper raises `CaptchaError` for token rejection (retryable) and `ScraperError` for invalid URLs or HTTP failures.

## CapSolver Integration

Cloudflare Turnstile is solved via [CapSolver](./capsolver.md) before each scrape request. The solution provides a captcha token that is forwarded with the POST request.

## Authentication

DuelingBook account cookies are optional but improve scrape success rate. When provided, they are sent as HTTP cookies on every scrape request.

| Cookie     | Source env var |
| ---------- | -------------- |
| `username` | `DB_USERNAME`  |
| `password` | `DB_PASSWORD`  |
| `db_id`    | `DB_ID`        |
| `regular`  | `DB_REGULAR`   |

### Finding Your Cookie Values

1. Log in to [duelingbook.com](https://duelingbook.com)
2. Open any replay link on DuelingBook
3. Open browser DevTools → Network tab
4. Find the request to `https://www.duelingbook.com/view-replay?id=<replay_id>`
5. In the request headers, copy the values for `username`, `password`, `db_id`, and `regular`

> **Note:** The `password` value is **not** your plain-text password — it is an encrypted value that DuelingBook sends in the request.

> **IMPORTANT:** Do not use a DuelingBook account you care about. Excessive automated use can result in the account being tracked and potentially banned. Create a throwaway account for scraping. If you're self-hosting locally, the scraping traffic comes from your own IP, so there's no fingerprint separation needed — just don't use your main account. If you're running on a remote server or want extra isolation, consider a tool like MultiLogin to create the account with separate fingerprints and proxies. Use at your own risk, and reach out if you have questions.

## Environment Variables

| Variable             | Description                                               | Required |
| -------------------- | --------------------------------------------------------- | -------- |
| `CAPSOLVER_API_KEY`  | CapSolver API key                                         | Yes      |
| `TURNSTILE_SITE_KEY` | DuelingBook Turnstile site key                            | Yes      |
| `DB_USERNAME`        | DuelingBook `username` cookie                             | No       |
| `DB_PASSWORD`        | DuelingBook `password` cookie (encrypted, not plain text) | No       |
| `DB_ID`              | DuelingBook `db_id` cookie                                | No       |
| `DB_REGULAR`         | DuelingBook `regular` cookie                              | No       |

## References

| Resource                                   | Description                                |
| ------------------------------------------ | ------------------------------------------ |
| [CapSolver service](./capsolver.md)        | Captcha solving configuration              |
| [API architecture](../architecture/api.md) | Worker pipeline that orchestrates scraping |
