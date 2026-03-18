parse:
	@if [ -z "$(FILE)" ]; then echo "Usage: make parse FILE=<path-to-json>"; exit 1; fi
	uv run python scripts/parse_replay.py $(FILE)

test:
	uv run pytest tests/

help:
	@echo "Available commands:"
	@echo "  parse FILE=<path>  : Parse a replay JSON file"
	@echo "  test               : Run pytest"
