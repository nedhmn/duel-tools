---
title: "Initial Product Spec"
description: "Original requirements for the duel-prep replay scraping and analysis app"
created: 2026-03-18
---

# Initial Product Spec

Original product requirements that kicked off the duel-prep app. Captures the initial vision for replay scraping, parsing, and analysis.

## Table of Contents

- [Initial Product Spec](#initial-product-spec)
  - [Table of Contents](#table-of-contents)
  - [Product Overview](#product-overview)
  - [Input Modes](#input-modes)
  - [Replay View](#replay-view)
  - [Data Storage](#data-storage)
  - [Scraping Strategy](#scraping-strategy)
  - [References](#references)

## Product Overview

A web app for analyzing DuelingBook replay URLs. Users submit replay URLs, the backend scrapes and parses the duel logs, and the frontend displays card-by-card breakdowns per game.

| Component | Original Choice       | Final Choice                 |
| --------- | --------------------- | ---------------------------- |
| Frontend  | Next.js on Vercel     | React + Vite (served by API) |
| Backend   | FastAPI on Railway    | FastAPI on Railway           |
| Database  | PostgreSQL on Railway | PostgreSQL on Railway        |
| Local DB  | Docker PostgreSQL     | Docker PostgreSQL            |

## Input Modes

Three modes were planned, each with different input formats and views:

| Mode       | Description                                             | Status          |
| ---------- | ------------------------------------------------------- | --------------- |
| Regular    | User submits a list of replay URLs (max 50)             | Implemented     |
| Tournament | Same scraping/parsing, different input format and views | Not implemented |
| GFWL       | Same scraping/parsing, different input format and views | Not implemented |

Only Regular mode was built. All modes share the same scraping and parsing pipeline.

## Replay View

Each replay is a match containing 1+ games. The view shows one replay at a time with navigation between replays.

| Element      | Description                                                   |
| ------------ | ------------------------------------------------------------- |
| Layout       | One row per game, two columns (player 1 left, player 2 right) |
| Card display | Cards seen by each player per game                            |
| Metadata     | Who went first, game number, game winner                      |

## Data Storage

Two requirements drove the storage design:

1. **Cache scraped replays** — scraping is slow and has an error rate. Store raw JSON in PostgreSQL so replays are only scraped once. Before scraping, check DB for existing data.
2. **Seed initial data** — one-time ingestion of existing replay data from an S3 bucket into the database. Handled by a separate script (became the `seeder` package).

## Scraping Strategy

DuelingBook replays are protected by reCAPTCHA. Scraping a single URL is slow due to captcha solving. Requirements:

| Concern         | Requirement                                                             |
| --------------- | ----------------------------------------------------------------------- |
| Captcha solving | Use anti-captcha service (became CapSolver)                             |
| Performance     | Asynchronous processing — scraping is too slow for synchronous requests |
| Error handling  | Scraping has a non-trivial error rate, needs retry logic                |
| Scalability     | Must handle batches of up to 50 URLs concurrently                       |

These requirements led to the Celery worker architecture with Redis as the message broker.

## References

| Resource                                   | Description                   |
| ------------------------------------------ | ----------------------------- |
| [API architecture](../architecture/api.md) | Current backend architecture  |
| [Web architecture](../architecture/web.md) | Current frontend architecture |
