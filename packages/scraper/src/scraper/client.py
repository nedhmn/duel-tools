import json
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, urlparse

import capsolver  # type: ignore
import httpx

from logger import get_logger
from scraper.exceptions import CaptchaError, ScraperError

logger = get_logger(__name__)

_TASK_CONFIG_PATH = Path(__file__).parent / "capsolver_task.json"


def _load_task_config() -> dict[str, Any]:
    with open(_TASK_CONFIG_PATH) as f:
        return json.load(f)


def _solve_captcha(url: str, api_key: str, site_key: str) -> dict[str, Any]:
    logger.info("captcha_solving_started", url=url)

    capsolver.api_key = api_key

    task = _load_task_config()
    task["websiteURL"] = url
    task["websiteKey"] = site_key

    try:
        solution = capsolver.solve(task)
    except Exception as exc:
        logger.error("captcha_failed", url=url, error=str(exc))
        raise CaptchaError(f"Capsolver failed: {exc}") from exc

    token = solution.get("gRecaptchaResponse")
    if not token:
        logger.error("captcha_no_token", url=url, solution=solution)
        raise CaptchaError("Capsolver returned no token")

    cookies = {}
    if solution.get("recaptcha-ca-t"):
        cookies["recaptcha-ca-t"] = solution["recaptcha-ca-t"]
    if solution.get("recaptcha-ca-e"):
        cookies["recaptcha-ca-e"] = solution["recaptcha-ca-e"]

    logger.info(
        "captcha_solved",
        url=url,
        user_agent=solution.get("userAgent"),
        sec_ch_ua=solution.get("secChUa"),
        has_cookies=bool(cookies),
    )
    return {
        "token": token,
        "user_agent": solution.get("userAgent"),
        "sec_ch_ua": solution.get("secChUa"),
        "cookies": cookies or None,
    }


def extract_replay_id(url: str) -> int:
    logger.debug("extracting_replay_id", url=url)

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
    api_key: str,
    site_key: str,
    timeout: float = 30.0,
    auth_cookies: dict[str, str] | None = None,
) -> dict[str, Any]:
    logger.info("scrape_started", url=url, replay_id=replay_id)

    result = _solve_captcha(url, api_key, site_key)
    token = result["token"]
    user_agent = result.get("user_agent")
    sec_ch_ua = result.get("sec_ch_ua")
    captcha_cookies = result.get("cookies")

    cookies: dict[str, str] = {}
    if auth_cookies:
        cookies.update(auth_cookies)
    if captcha_cookies:
        cookies.update(captcha_cookies)

    data_url = f"https://www.duelingbook.com/view-replay?id={replay_id}"
    form_data = {"token": token, "recaptcha_version": 1, "master": False}

    headers = {}
    if user_agent:
        headers["User-Agent"] = user_agent
    if sec_ch_ua:
        headers["Sec-Ch-Ua"] = sec_ch_ua

    if headers:
        logger.debug("using_solver_headers", user_agent=user_agent, sec_ch_ua=sec_ch_ua)

    logger.debug(
        "posting_to_duelingbook",
        data_url=data_url,
        replay_id=replay_id,
        has_cookies=bool(cookies),
    )

    try:
        with httpx.Client(
            timeout=timeout, headers=headers, cookies=cookies or None
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
