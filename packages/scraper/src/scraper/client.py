from typing import Any
from urllib.parse import parse_qs, urlparse

import httpx

from dt_capsolver import CaptchaError as CapsolverError
from dt_capsolver import solve_turnstile
from logger import get_logger
from scraper.exceptions import CaptchaError, ScraperError

logger = get_logger(__name__)


def extract_replay_id(url: str) -> int:
    logger.debug("extracting_replay_id", url=url)

    # Normalize URL: ensure https:// scheme
    if not url.startswith(("http://", "https://")):
        url = f"https://{url}"

    try:
        parsed = urlparse(url)
    except Exception as exc:
        logger.error("url_parse_failed", url=url, error=str(exc))
        raise ScraperError(f"Invalid URL format: {url}") from exc

    if "duelingbook.com" not in parsed.netloc:
        logger.error("invalid_domain", url=url, netloc=parsed.netloc)
        raise ScraperError(f"URL must be from duelingbook.com: {url}")

    if parsed.path != "/replay":
        logger.error("invalid_path", url=url, path=parsed.path)
        raise ScraperError(f"URL path must be /replay: {url}")

    query_params = parse_qs(parsed.query)
    if "id" not in query_params:
        logger.error("missing_id_param", url=url)
        raise ScraperError(f"URL must contain 'id' query parameter: {url}")

    id_value = query_params["id"][0]

    if "-" in id_value:
        id_value = id_value.split("-")[-1]

    try:
        replay_id = int(id_value)
    except ValueError as exc:
        logger.error("invalid_replay_id", url=url, id_value=id_value)
        raise ScraperError(f"Invalid replay ID format: {id_value}") from exc

    logger.info("replay_id_extracted", url=url, replay_id=replay_id)
    return replay_id


def scrape_replay(
    url: str,
    replay_id: int,
    site_key: str,
    timeout: float = 30.0,
    auth_cookies: dict[str, str] | None = None,
) -> dict[str, Any]:
    logger.info("scrape_started", url=url, replay_id=replay_id)

    try:
        result = solve_turnstile(url, site_key)
    except CapsolverError as exc:
        raise CaptchaError(str(exc)) from exc

    data_url = f"https://www.duelingbook.com/view-replay?id={replay_id}"
    form_data: dict[str, Any] = {
        "token": result.token,
        "turnstile": True,
        "master": False,
    }

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
            response = client.post(url=data_url, data=form_data)
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
