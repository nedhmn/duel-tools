from typing import Any

import httpx

from dt_capsolver import CaptchaError as CapsolverError, solve_turnstile
from logger import get_logger
from scraper.exceptions import CaptchaError, ScraperError
from scraper.models import ViewReplayFormData

logger = get_logger(__name__)


def scrape_replay(
    url: str,
    replay_id: int,
    api_key: str,
    site_key: str,
    timeout: float = 30.0,
    auth_cookies: dict[str, str] | None = None,
) -> dict[str, Any]:
    logger.info("scrape_started", url=url, replay_id=replay_id)

    try:
        result = solve_turnstile(api_key, url, site_key)
    except CapsolverError as exc:
        raise CaptchaError(str(exc)) from exc

    data_url = f"https://www.duelingbook.com/view-replay?id={replay_id}"
    form_data = ViewReplayFormData(token=result.token)

    headers = {}
    if result.user_agent:
        headers["User-Agent"] = result.user_agent

    logger.debug(
        "posting_to_duelingbook",
        data_url=data_url,
        replay_id=replay_id,
        has_cookies=bool(auth_cookies),
    )

    try:
        with httpx.Client(
            timeout=timeout, headers=headers, cookies=auth_cookies or None
        ) as client:
            response = client.post(url=data_url, data=form_data.model_dump())
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPStatusError as exc:
        logger.error(
            "scrape_http_error", replay_id=replay_id, status=exc.response.status_code
        )
        raise ScraperError(f"HTTP error {exc.response.status_code}") from exc
    except httpx.RequestError as exc:
        logger.error("scrape_request_error", replay_id=replay_id, error=str(exc))
        raise ScraperError(f"Request failed: {exc}") from exc

    if data.get("action") == "Error":
        message = data.get("message", "Unknown error")
        if message == "Invalid Token":
            logger.error("captcha_token_rejected", replay_id=replay_id)
            raise CaptchaError(f"DuelingBook rejected captcha token: {message}")
        logger.error("duelingbook_error", replay_id=replay_id, message=message)
        raise ScraperError(f"DuelingBook error: {message}")

    logger.info("scrape_completed", replay_id=replay_id)
    return data
