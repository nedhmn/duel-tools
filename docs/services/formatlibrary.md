---
title: "FormLibrary"
description: "Tournament event and replay data from the FormLibrary API for Goat format sync"
created: 2026-03-18
---

# FormLibrary

Tournament event data source for Goat format replays. The cron service syncs replay URLs from FormLibrary events daily, then scrapes them through the standard DuelingBook pipeline.

## Table of Contents

- [FormLibrary](#formlibrary)
  - [Table of Contents](#table-of-contents)
  - [API](#api)
  - [Endpoints Used](#endpoints-used)
    - [`/events` query params](#events-query-params)
    - [`/events/subscriber/{abbreviation}` response](#eventssubscriberabbreviation-response)
  - [Environment Variables](#environment-variables)
  - [References](#references)

## API

Base URL: `https://formatlibrary.com/api`

Authentication: Bearer token via `Authorization` header. Required only for the subscriber endpoint (fetching replay URLs).

## Endpoints Used

| Endpoint                            | Method | Auth | Description                                              |
| ----------------------------------- | ------ | ---- | -------------------------------------------------------- |
| `/events`                           | GET    | No   | List tournament events with pagination and format filter |
| `/events/subscriber/{abbreviation}` | GET    | Yes  | Get replay URLs for a specific event                     |

### `/events` query params

| Param    | Example          | Description      |
| -------- | ---------------- | ---------------- |
| `page`   | `1`              | Page number      |
| `limit`  | `100`            | Results per page |
| `sort`   | `startedAt:desc` | Sort order       |
| `filter` | `format:eq:Goat` | Filter by format |

### `/events/subscriber/{abbreviation}` response

Returns `{ "replays": [...] }` where each replay contains a DuelingBook URL to be scraped.

## Environment Variables

| Variable           | Description                               | Required |
| ------------------ | ----------------------------------------- | -------- |
| `FL_TOKEN`         | FormLibrary API bearer token              | Yes      |
| `SYNC_CONCURRENCY` | Max concurrent scrape tasks (default: 20) | No       |

## References

| Resource                                 | Description                                       |
| ---------------------------------------- | ------------------------------------------------- |
| [FormLibrary](https://formatlibrary.com) | Tournament platform                               |
| [DuelingBook service](./duelingbook.md)  | Scraping pipeline used after fetching replay URLs |
