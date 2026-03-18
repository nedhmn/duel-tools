---
title: "Parser Bug Fixes"
phase: 9
status: completed
created: 2026-03-18
completed: 2026-03-18
context_doc: null
description: "Fix 'Revealed from Deck' double counting and add parser CLI command"
---

## Tasks

- [x] Fix "Revealed from Deck" double counting in `packages/parser/`
  - [x] `_calculate_deck_change()` now returns 0 for "Revealed ... from Deck" logs
  - [x] Cards revealed but not moved (stay in deck) no longer increment count
  - [x] Cards revealed then later added to hand count correctly as 1
- [x] Add `make parse FILE=<path>` command to parser Makefile

## References

| Resource                                      | Description                                                            |
| --------------------------------------------- | ---------------------------------------------------------------------- |
| [API architecture](../../architecture/api.md) | Raw JSON storage decision that enables parser fixes without migrations |
