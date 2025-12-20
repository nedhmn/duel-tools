# duel-tools

A monorepo containing web apps for analyzing Yu-Gi-Oh DuelingBook replays.

## Apps

### duel-prep

Tool for analyzing opponent decklists from DuelingBook replay URLs.

- Input a list of replay URLs (up to 50)
- Scrapes replay data from DuelingBook (async, with retry)
- Caches scraped data in PostgreSQL
- Displays games with card images, grouped by replay

### replay-viewer

Simpler tool for viewing replay data from raw JSON.

- Upload DuelingBook replay JSON directly
- No scraping needed (for when you already have the data)
- Same card/game display view as duel-prep

## Tech Stack

| Component | Technology                          |
| --------- | ----------------------------------- |
| Language  | Python 3.12+                        |
| Monorepo  | uv workspaces                       |
| Backend   | FastAPI                             |
| Frontend  | React + Vite + Tailwind + shadcn/ui |
| Database  | PostgreSQL                          |
| Job Queue | Celery + Redis                      |
| Hosting   | Railway                             |

## Repository Structure

```
duel-tools/
├── apps/
│   ├── duel-prep/
│   │   ├── backend/
│   │   └── frontend/
│   └── replay-viewer/
│       ├── backend/
│       └── frontend/
├── packages/
│   ├── parser/
│   ├── scraper/
│   └── db/
└── docs/
```

## Related Resources

- [DuelingBook](https://www.duelingbook.com/) - Source of replay data
- Existing scraper code: github.com/nedhmn/replay-scraper-api
- Existing parser code: github.com/nedhmn/gfwl-data
