import capsolver  # type: ignore

from logger import get_logger
from scraper.exceptions import CaptchaError

logger = get_logger(__name__)


def solve(url: str, api_key: str, site_key: str) -> str:
    logger.info("captcha_solving_started", solver="capsolver", url=url)

    capsolver.api_key = api_key

    try:
        solution = capsolver.solve(
            {
                "type": "ReCaptchaV3TaskProxyLess",
                "websiteURL": url,
                "websiteKey": site_key,
                "pageAction": "submit",
                "isSession": True,
            }
        )
    except Exception as exc:
        logger.error("captcha_failed", solver="capsolver", url=url, error=str(exc))
        raise CaptchaError(f"Capsolver failed: {exc}") from exc

    token = solution.get("gRecaptchaResponse")
    if not token:
        logger.error("captcha_no_token", solver="capsolver", url=url, solution=solution)
        raise CaptchaError("Capsolver returned no token")

    logger.info("captcha_solved", solver="capsolver", url=url)
    return token
