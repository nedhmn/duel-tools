from anticaptchaofficial.recaptchav3proxyless import recaptchaV3Proxyless  # type: ignore

from logger import get_logger
from scraper.exceptions import CaptchaError

logger = get_logger(__name__)


def solve(url: str, api_key: str, site_key: str) -> str:
    logger.info("captcha_solving_started", solver="anticaptcha", url=url)

    solver = recaptchaV3Proxyless()
    solver.set_verbose(0)
    solver.set_key(api_key)
    solver.set_website_url(url)
    solver.set_website_key(site_key)
    solver.set_min_score(0.9)

    g_response: str = solver.solve_and_return_solution()

    if g_response == "0":
        logger.error(
            "captcha_failed",
            solver="anticaptcha",
            url=url,
            error_code=solver.error_code,
        )
        raise CaptchaError(f"Anticaptcha solving failed: {solver.error_code}")

    logger.info("captcha_solved", solver="anticaptcha", url=url)
    return g_response
