---
title: "DuelingBook"
description: "Replay scraping via DuelingBook API with CapSolver reCAPTCHA bypass"
created: 2026-03-18
---

# DuelingBook

Replay data source for Yu-Gi-Oh duels. Replays are scraped via HTTP POST with a reCAPTCHA token solved by CapSolver.

## Table of Contents

- [DuelingBook](#duelingbook)
  - [Table of Contents](#table-of-contents)
  - [Scraping Flow](#scraping-flow)
  - [CapSolver Integration](#capsolver-integration)
  - [Authentication](#authentication)
  - [Environment Variables](#environment-variables)
  - [References](#references)

## Scraping Flow

Replays are fetched from `https://www.duelingbook.com/view-replay` via POST with a solved captcha token. The response is raw JSON containing duel logs (card plays, game events, results).

| Step | Action                                                              |
| ---- | ------------------------------------------------------------------- |
| 1    | Extract replay ID from URL query param (`?id=123` or `?id=456-123`) |
| 2    | Solve reCAPTCHA v2 via CapSolver                                    |
| 3    | POST to `/view-replay` with captcha token + auth cookies            |
| 4    | Parse JSON response (error responses have `"action": "Error"`)      |

The scraper raises `CaptchaError` for token rejection (retryable) and `ScraperError` for invalid URLs or HTTP failures.

## CapSolver Integration

reCAPTCHA v2 is solved via [CapSolver](./capsolver.md) before each scrape request. The solution provides a captcha token and optional cookies that are forwarded with the POST request.

## Authentication

DuelingBook requires account cookies for authenticated access. These are sent as HTTP cookies on every scrape request.

| Cookie     | Source env var |
| ---------- | -------------- |
| `username` | `DB_USERNAME`  |
| `password` | `DB_PASSWORD`  |
| `db_id`    | `DB_ID`        |
| `regular`  | `DB_REGULAR`   |

## Environment Variables

| Variable            | Description                    | Required |
| ------------------- | ------------------------------ | -------- |
| `CAPSOLVER_API_KEY` | CapSolver API key              | Yes      |
| `SITE_KEY`          | DuelingBook reCAPTCHA site key | Yes      |
| `DB_USERNAME`       | DuelingBook account username   | Yes      |
| `DB_PASSWORD`       | DuelingBook account password   | Yes      |
| `DB_ID`             | DuelingBook account ID         | Yes      |
| `DB_REGULAR`        | DuelingBook account type       | No       |

## References

| Resource                                   | Description                                |
| ------------------------------------------ | ------------------------------------------ |
| [CapSolver service](./capsolver.md)        | Captcha solving configuration              |
| [API architecture](../architecture/api.md) | Worker pipeline that orchestrates scraping |
