---
title: "CapSolver"
description: "Captcha solving service for bypassing Cloudflare Turnstile on DuelingBook"
created: 2026-03-18
---

# CapSolver

Captcha solving service used to bypass protection on DuelingBook replay pages. Implemented in `packages/dt-capsolver`.

## Table of Contents

- [CapSolver](#capsolver)
  - [Table of Contents](#table-of-contents)
  - [Turnstile](#turnstile)
  - [reCAPTCHA v2 (Legacy)](#recaptcha-v2-legacy)
  - [Environment Variables](#environment-variables)
  - [References](#references)

## Turnstile

Active solver for Cloudflare Turnstile protection on DuelingBook (switched from reCAPTCHA v2 in April 2026).

| Setting        | Value                         |
| -------------- | ----------------------------- |
| Task type      | `AntiTurnstileTaskProxyLess`  |
| Python package | `capsolver` (v1.0.7+)         |
| Website URL    | `https://www.duelingbook.com` |
| Website key    | Set via `TURNSTILE_SITE_KEY`  |

A successful solve returns:

| Field       | Description                              |
| ----------- | ---------------------------------------- |
| `token`     | Captcha token sent with the scrape POST  |
| `userAgent` | Browser user agent to forward in headers |

Errors raise `CaptchaError` which triggers automatic retry in the worker pipeline (max 3 retries, 5s delay).

## reCAPTCHA v2 (Legacy)

Previous solver for Google reCAPTCHA v2 protection. Retained in `dt_capsolver/recaptcha_v2/` for backwards compatibility.

| Setting     | Value                                                |
| ----------- | ---------------------------------------------------- |
| Task type   | `ReCaptchaV2TaskProxyLess`                           |
| Task config | `dt_capsolver/recaptcha_v2/task.json` (base64 blobs) |

A successful solve returns:

| Field                | Description                              |
| -------------------- | ---------------------------------------- |
| `gRecaptchaResponse` | Captcha token (mapped to `token`)        |
| `userAgent`          | Browser user agent to forward in headers |

## Environment Variables

| Variable            | Description                      | Required |
| ------------------- | -------------------------------- | -------- |
| `CAPSOLVER_API_KEY` | API key from CapSolver dashboard | Yes      |

## References

| Resource                                                                                 | Description              |
| ---------------------------------------------------------------------------------------- | ------------------------ |
| [CapSolver docs](https://docs.capsolver.com)                                             | API reference            |
| [CapSolver Turnstile](https://docs.capsolver.com/en/guide/captcha/cloudflare_turnstile/) | Turnstile task type docs |
| [CapSolver reCAPTCHA v2](https://docs.capsolver.com/en/guide/captcha/ReCaptchaV2.html)   | Legacy task type docs    |
| [CapSolver dashboard](https://dashboard.capsolver.com)                                   | API key management       |
| [DuelingBook service](./duelingbook.md)                                                  | Where CapSolver is used  |
