.PHONY: help sync sync-all

help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  sync      Sync FormLibrary replays (page 1)"
	@echo "  sync-all  Sync FormLibrary replays (all pages)"

sync:
	uv run python scripts/sync_formatlibrary.py

sync-all:
	uv run python scripts/sync_formatlibrary.py --all
