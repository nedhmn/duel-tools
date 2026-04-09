import capsolver

from dt_capsolver.exceptions import CaptchaError
from dt_capsolver.models import CaptchaSolution, TurnstileTask
from dt_logger import get_logger

logger = get_logger(__name__)


def solve_turnstile(
    api_key: str,
    url: str,
    site_key: str,
    metadata: dict[str, str] | None = None,
) -> CaptchaSolution:
    logger.info("turnstile_solving_started", url=url)

    capsolver.api_key = api_key

    task = TurnstileTask(websiteURL=url, websiteKey=site_key, metadata=metadata)

    try:
        solution = capsolver.solve(task.model_dump(exclude_none=True))
    except Exception as exc:
        logger.error("turnstile_failed", url=url, error=str(exc))
        raise CaptchaError(f"Capsolver failed: {exc}") from exc

    token = solution.get("token")
    if not token:
        logger.error("turnstile_no_token", url=url, solution=solution)
        raise CaptchaError("Capsolver returned no token")

    logger.info(
        "turnstile_solved",
        url=url,
        user_agent=solution.get("userAgent"),
    )
    return CaptchaSolution(
        token=token,
        user_agent=solution.get("userAgent"),
    )
