import json
from pathlib import Path
from typing import Any

import capsolver  # type: ignore

from logger import get_logger

from dt_capsolver.config import settings
from dt_capsolver.exceptions import CaptchaError
from dt_capsolver.models import CaptchaSolution

logger = get_logger(__name__)

_TASK_CONFIG_PATH = Path(__file__).parent / "task.json"


def _load_task_config() -> dict[str, Any]:
    with open(_TASK_CONFIG_PATH) as f:
        return json.load(f)


def solve_recaptcha_v2(url: str, site_key: str) -> CaptchaSolution:
    logger.info("recaptcha_v2_solving_started", url=url)

    capsolver.api_key = settings.CAPSOLVER_API_KEY

    task = _load_task_config()
    task["websiteURL"] = url
    task["websiteKey"] = site_key

    try:
        solution = capsolver.solve(task)
    except Exception as exc:
        logger.error("recaptcha_v2_failed", url=url, error=str(exc))
        raise CaptchaError(f"Capsolver failed: {exc}") from exc

    token = solution.get("gRecaptchaResponse")
    if not token:
        logger.error("recaptcha_v2_no_token", url=url, solution=solution)
        raise CaptchaError("Capsolver returned no token")

    logger.info(
        "recaptcha_v2_solved",
        url=url,
        user_agent=solution.get("userAgent"),
    )
    return CaptchaSolution(
        token=token,
        user_agent=solution.get("userAgent"),
    )
