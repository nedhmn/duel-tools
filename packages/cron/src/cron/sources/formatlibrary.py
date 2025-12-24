import httpx

from logger import get_logger

logger = get_logger(__name__)

FL_BASE_URL = "https://formatlibrary.com/api"


async def fetch_events(
    client: httpx.AsyncClient,
    page: int = 1,
    limit: int = 100,
    format: str = "Goat",
) -> list[dict]:
    url = f"{FL_BASE_URL}/events"
    params = {
        "page": page,
        "limit": limit,
        "sort": "startedAt:desc",
        "filter": f"format:eq:{format}",
    }
    response = await client.get(url, params=params)
    response.raise_for_status()
    return response.json()


async def fetch_all_events(client: httpx.AsyncClient) -> list[dict]:
    all_events = []
    page = 1
    while True:
        events = await fetch_events(client, page=page)
        if not events:
            break
        all_events.extend(events)
        logger.info("fetched_events_page", page=page, count=len(events))
        page += 1
    return all_events


async def fetch_event_replays(
    client: httpx.AsyncClient,
    abbreviation: str,
    cookies: dict[str, str],
) -> list[dict]:
    url = f"{FL_BASE_URL}/events/{abbreviation}"
    response = await client.get(url, cookies=cookies)
    response.raise_for_status()
    data = response.json()
    return data.get("replays", [])
