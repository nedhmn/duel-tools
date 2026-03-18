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
    events = response.json()
    logger.info("events_fetched", page=page, count=len(events))
    return events


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
    token: str,
) -> list[dict]:
    url = f"{FL_BASE_URL}/events/subscriber/{abbreviation}"
    headers = {"Authorization": f"Bearer {token}"}
    response = await client.get(url, headers=headers)
    response.raise_for_status()
    data = response.json()
    replays = data.get("replays", [])
    logger.info("event_replays_fetched", abbreviation=abbreviation, count=len(replays))
    return replays
