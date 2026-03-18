.PHONY: help dev worker

help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  dev       Run server in development mode"
	@echo "  worker    Run Celery worker"

dev:
	uv run fastapi dev app/main.py --port 8000

worker:
	uv run celery -A app.worker.celery_app worker --loglevel=info
