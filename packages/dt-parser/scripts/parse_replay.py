#!/usr/bin/env python3
import json
import sys
from pathlib import Path

from dt_parser import parse_replay


def main() -> None:
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <replay.json>")
        sys.exit(1)

    replay_path = Path(sys.argv[1])
    if not replay_path.exists():
        print(f"Error: File not found: {replay_path}")
        sys.exit(1)

    with open(replay_path, encoding="utf-8") as f:
        raw_json = json.load(f)

    result = parse_replay(raw_json)

    print(result.model_dump_json(indent=2))


if __name__ == "__main__":
    main()
