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

dev:
	uv run fastapi dev app/main.py --port 8000

worker:
	uv run celery -A app.worker.celery_app worker --loglevel=info

init-db:
	uv run python scripts/init_db.py

clear-db:
	uv run python scripts/clear_db.py

help:
	@echo "Available commands:"
	@echo "  lint         : Run code linter"
	@echo "  format       : Run code formatter"
	@echo "  typecheck    : Run type checker (ty)"
	@echo "  check        : Run linting, formatting, and type checking"
	@echo "  clean        : Remove Python cache files and build artifacts"
	@echo "  dev          : Run server in development mode"
	@echo "  worker       : Run Celery worker"
	@echo "  init-db      : Create database tables"
	@echo "  clear-db     : Delete all data from tables"
