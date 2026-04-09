---
title: "Capsolver Extraction & Turnstile Support"
phase: 10
status: active
created: 2026-04-08
completed: null
context_doc: "../context/capsolver-extraction-turnstile.md"
description: "Extract capsolver logic into a standalone package and migrate from reCAPTCHA v2 to Cloudflare Turnstile."
---

## Tasks

> Preliminary — these tasks will be refined during planning and updated to reflect what was actually implemented.

- [ ] Create `packages/dt_capsolver` package scaffold (pyproject.toml, config, exceptions)
- [ ] Implement turnstile solver (`AntiTurnstileTaskProxyLess` via capsolver SDK)
- [ ] Move existing reCAPTCHA v2 logic into `dt_capsolver/recaptcha_v2/`
- [ ] Update `packages/scraper` to depend on `dt_capsolver` and call `solve_turnstile()`
- [ ] Remove capsolver-specific code from scraper (task JSON, `_solve_captcha()`, `CaptchaError`)
- [ ] Update `apps/api` and `apps/cron` imports (`CaptchaError` → `dt_capsolver`)
- [ ] Resolve open items: extract Turnstile sitekey, check metadata, confirm `/view-replay` form data

## References

| Resource                                                    | Description      |
| ----------------------------------------------------------- | ---------------- |
| [Context Doc](../context/capsolver-extraction-turnstile.md) | Full design spec |
