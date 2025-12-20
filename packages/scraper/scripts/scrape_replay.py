#!/usr/bin/env python3
import json
import os
import sys

from logger import setup_logging
from scraper import CaptchaError, ScraperError, extract_replay_id, scrape_replay
from scraper.solvers import anticaptcha


def get_solver():
    solver_name = os.environ.get("CAPTCHA_SOLVER", "anticaptcha")

    if solver_name == "anticaptcha":
        return anticaptcha.solve

    print(f"Error: Unknown solver '{solver_name}'", file=sys.stderr)
    print("Available solvers: anticaptcha", file=sys.stderr)
    sys.exit(1)


def main() -> None:
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <replay_url>")
        print(
            "Example: uv run scripts/scrape_replay.py 'https://www.duelingbook.com/replay?id=12345'"
        )
        print()
        print("Environment variables:")
        print("  CAPTCHA_SOLVER - Solver to use: anticaptcha (default)")
        print("  CAPTCHA_API_KEY - API key for the captcha solver (required)")
        print("  SITE_KEY - DuelingBook reCAPTCHA site key (required)")
        print("  LOG_LEVEL - Logging level (default: INFO)")
        sys.exit(1)

    url = sys.argv[1]

    api_key = os.environ.get("CAPTCHA_API_KEY")
    if not api_key:
        print("Error: CAPTCHA_API_KEY environment variable not set")
        sys.exit(1)

    site_key = os.environ.get("SITE_KEY")
    if not site_key:
        print("Error: SITE_KEY environment variable not set")
        sys.exit(1)

    log_level = os.environ.get("LOG_LEVEL", "INFO")
    setup_logging(log_level)  # type: ignore

    solver = get_solver()

    try:
        replay_id = extract_replay_id(url)
        result = scrape_replay(url, replay_id, api_key, site_key, solver)
        print(json.dumps(result, indent=2))
    except CaptchaError as exc:
        print(f"Captcha error: {exc}", file=sys.stderr)
        sys.exit(2)
    except ScraperError as exc:
        print(f"Scraper error: {exc}", file=sys.stderr)
        sys.exit(3)


if __name__ == "__main__":
    main()
