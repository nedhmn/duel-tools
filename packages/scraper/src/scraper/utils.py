from urllib.parse import parse_qs, urlparse

from logger import get_logger
from scraper.exceptions import ScraperError

logger = get_logger(__name__)


def extract_replay_id(url: str) -> int:
    logger.debug("extracting_replay_id", url=url)

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
