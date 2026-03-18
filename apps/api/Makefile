.PHONY: help dev worker init-db clear-db

help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  dev       Run server in development mode"
	@echo "  worker    Run Celery worker"
	@echo "  init-db   Run database migrations"
	@echo "  clear-db  Delete all data from tables"

dev:
	uv run fastapi dev app/main.py --port 8000

worker:
	uv run celery -A app.worker.celery_app worker --loglevel=info

init-db:
	cd ../../packages/db && make migrate

clear-db:
	uv run python scripts/clear_db.py
