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
	@echo "  dev          : Run server in development mode"
	@echo "  worker       : Run Celery worker"
	@echo "  init-db      : Create database tables"
	@echo "  clear-db     : Delete all data from tables"
