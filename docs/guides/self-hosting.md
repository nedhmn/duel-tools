---
title: "Self-Hosting Guide"
description: "Run duel-tools on your own server with Docker Compose"
created: 2026-03-18
---

# Self-Hosting

Run duel-tools on your own server with Docker Compose.

## Table of Contents

- [Self-Hosting](#self-hosting)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Quick Start](#quick-start)
  - [Logs](#logs)
  - [Updating](#updating)
  - [References](#references)

## Prerequisites

| Tool      | Purpose           | Sign Up                                    |
| --------- | ----------------- | ------------------------------------------ |
| Docker    | Container runtime | [docker.com](https://www.docker.com)       |
| CapSolver | reCAPTCHA solving | [capsolver.com](https://www.capsolver.com) |

## Environment Variables

| Variable            | Description                    | Required | Source                                                                                                            |
| ------------------- | ------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `POSTGRES_PASSWORD` | PostgreSQL password            | Yes      | Choose a secure password                                                                                          |
| `CAPSOLVER_API_KEY` | CapSolver API key              | Yes      | [CapSolver dashboard](https://dashboard.capsolver.com)                                                            |
| `SITE_KEY`          | DuelingBook reCAPTCHA site key | Yes      | Default in `.env.example` as of Mar 2026; may change — see [DuelingBook service docs](../services/duelingbook.md) |
| `DB_USERNAME`       | DuelingBook account username   | No       | Your DuelingBook account                                                                                          |
| `DB_PASSWORD`       | DuelingBook account password   | No       | Your DuelingBook account                                                                                          |
| `DB_ID`             | DuelingBook account ID         | No       | Your DuelingBook account                                                                                          |
| `DB_REGULAR`        | DuelingBook account type       | No       | Your DuelingBook account                                                                                          |
| `PORT`              | API port (default: 8000)       | No       | —                                                                                                                 |
| `DOZZLE_PORT`       | Dozzle port (default: 9999)    | No       | —                                                                                                                 |
| `LOG_LEVEL`         | Log level (default: INFO)      | No       | —                                                                                                                 |

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/nedhmn/duel-tools.git
   cd duel-tools
   ```

2. Create the environment file:
   ```bash
   cp .env.example .env
   ```

3. Fill in the required variables in `.env`.

4. Start all services:
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

The API runs on `http://localhost:8000` (or your configured `PORT`). Database migrations run automatically on startup.

## Logs

Dozzle provides a web UI for viewing container logs at `http://localhost:9999` (or your configured `DOZZLE_PORT`).

You can also query the database directly using the SQL query feature in the app.

## Updating

Pull the latest changes and rebuild:

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

Migrations run automatically on each startup.

## References

| Resource                                               | Description             |
| ------------------------------------------------------ | ----------------------- |
| [CapSolver service docs](../services/capsolver.md)     | Captcha API setup       |
| [DuelingBook service docs](../services/duelingbook.md) | Scraping credentials    |
| [Development guide](./development.md)                  | Local development setup |
