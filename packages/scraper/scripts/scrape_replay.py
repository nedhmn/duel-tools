#!/usr/bin/env python3
import json
import os
import sys

from logger import setup_logging
from scraper import (
    CaptchaError,
    ScraperError,
    extract_replay_id,
    scrape_replay,
    settings,
)


def main() -> None:
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <replay_url>")
        print(
            "Example: uv run scripts/scrape_replay.py 'https://www.duelingbook.com/replay?id=12345'"
        )
        sys.exit(1)

    url = sys.argv[1]

    log_level = os.environ.get("LOG_LEVEL", "INFO")
    setup_logging(log_level)  # type: ignore

    try:
        replay_id = extract_replay_id(url)
        result = scrape_replay(
            url,
            replay_id,
            api_key=settings.CAPSOLVER_API_KEY,
            site_key=settings.SITE_KEY,
            auth_cookies=settings.auth_cookies,
        )
        print(json.dumps(result, indent=2))
    except CaptchaError as exc:
        print(f"Captcha error: {exc}", file=sys.stderr)
        sys.exit(2)
    except ScraperError as exc:
        print(f"Scraper error: {exc}", file=sys.stderr)
        sys.exit(3)


if __name__ == "__main__":
    main()
