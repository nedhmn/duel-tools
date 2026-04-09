.PHONY: help check fix fix-and-check clean migrate migrate-check

help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  check          Run all checks (CI)"
	@echo "  fix            Auto-fix lint issues and format"
	@echo "  fix-and-check  Fix then run checks"
	@echo "  clean          Remove build artifacts"
	@echo "  migrate        Run database migrations"
	@echo "  migrate-check  Check for pending migrations"

check:
	uv run ruff check .
	uv run ruff format --check .
	uv run ty check
	cd apps/web && pnpm check

fix:
	uv run ruff check --fix .
	uv run ruff format .
	cd apps/web && pnpm fix

fix-and-check: fix check

migrate:
	cd packages/dt-db && make migrate

migrate-check:
	cd packages/dt-db && make migrate-check

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".ruff_cache" -exec rm -rf {} +
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
