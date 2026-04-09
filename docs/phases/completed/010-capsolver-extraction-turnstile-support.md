---
title: "Capsolver Extraction & Turnstile Support"
phase: 10
status: completed
created: 2026-04-08
completed: 2026-04-09
context_doc: "../../context/capsolver-extraction-turnstile.md"
description: "Extract capsolver logic into a standalone package and migrate from reCAPTCHA v2 to Cloudflare Turnstile."
---

## Tasks

- [x] Update CLAUDE.md with `uv init` convention for new packages
- [x] Scaffold `packages/dt-capsolver` via `uv init --package`
- [x] Implement `dt_capsolver` config, exceptions, turnstile solver, recaptcha_v2 solver
- [x] Move `capsolver_task.json` from scraper to `dt_capsolver/recaptcha_v2/task.json`
- [x] Swap scraper dep: `capsolver` pip → `dt-capsolver` workspace
- [x] Rewrite `scraper/client.py` to use `solve_turnstile()`, update form data (`turnstile: True`)
- [x] Remove `CAPSOLVER_API_KEY` from scraper config
- [x] Rewire scraper `CaptchaError` to wrap `dt_capsolver.CaptchaError`
- [x] Update `apps/api` worker task imports (`CaptchaError` from `dt_capsolver`)
- [x] Update `apps/cron` pipeline to use new `scrape_replay()` signature
- [x] Update scraper script imports and call signature

## References

| Resource                                                       | Description      |
| -------------------------------------------------------------- | ---------------- |
| [Context Doc](../../context/capsolver-extraction-turnstile.md) | Full design spec |
