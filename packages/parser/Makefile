lint:
	uv run ruff check .

format:
	uv run ruff format .

typecheck:
	uv run ty check

check:
	make lint
	make format
	make typecheck

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type d -name ".ruff_cache" -exec rm -rf {} +

parse:
	@if [ -z "$(FILE)" ]; then echo "Usage: make parse FILE=<path-to-json>"; exit 1; fi
	uv run python scripts/parse_replay.py $(FILE)
