.PHONY: help migrate migrate-new migrate-down migrate-history migrate-check schema

help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  migrate          Apply all pending migrations"
	@echo "  migrate-new      Create new migration: make migrate-new msg=\"description\""
	@echo "  migrate-down     Rollback one migration"
	@echo "  migrate-history  Show migration history"
	@echo "  migrate-check    Check for pending migrations"
	@echo "  schema           Generate schema.sql from all migrations"

migrate:
	uv run alembic upgrade head
	$(MAKE) schema

migrate-new:
	uv run alembic revision --autogenerate -m "$(msg)"

migrate-down:
	uv run alembic downgrade -1

migrate-history:
	uv run alembic history

migrate-check:
	uv run alembic check

schema:
	uv run alembic upgrade base:head --sql > schema.sql
