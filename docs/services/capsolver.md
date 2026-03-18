---
title: "CapSolver"
description: "Captcha solving service for bypassing reCAPTCHA v2 on DuelingBook"
created: 2026-03-18
---

# CapSolver

Captcha solving service used to bypass reCAPTCHA v2 protection on DuelingBook replay pages.

## Table of Contents

- [CapSolver](#capsolver)
  - [Table of Contents](#table-of-contents)
  - [Task Configuration](#task-configuration)
  - [Solution Response](#solution-response)
  - [Environment Variables](#environment-variables)
  - [References](#references)

## Task Configuration

The task config is stored in `packages/scraper/src/scraper/capsolver_task.json` and loaded at runtime.

| Setting        | Value                         |
| -------------- | ----------------------------- |
| Task type      | `ReCaptchaV2TaskProxyLess`    |
| Python package | `capsolver` (v1.0.7+)         |
| Website URL    | `https://www.duelingbook.com` |
| Website key    | Set via `SITE_KEY` env var    |

## Solution Response

A successful solve returns:

| Field                | Description                                     |
| -------------------- | ----------------------------------------------- |
| `gRecaptchaResponse` | Captcha token sent with the scrape POST request |
| `userAgent`          | Browser user agent to forward in headers        |
| `secChUa`            | Sec-Ch-Ua header to forward                     |
| `recaptcha-ca-t`     | Optional cookie forwarded to DuelingBook        |
| `recaptcha-ca-e`     | Optional cookie forwarded to DuelingBook        |

Errors raise `CaptchaError` which triggers automatic retry in the worker pipeline (max 3 retries, 5s delay).

## Environment Variables

| Variable            | Description                      | Required |
| ------------------- | -------------------------------- | -------- |
| `CAPSOLVER_API_KEY` | API key from CapSolver dashboard | Yes      |
| `SITE_KEY`          | DuelingBook reCAPTCHA site key   | Yes      |

## References

| Resource                                                                               | Description             |
| -------------------------------------------------------------------------------------- | ----------------------- |
| [CapSolver docs](https://docs.capsolver.com)                                           | API reference           |
| [CapSolver reCAPTCHA v2](https://docs.capsolver.com/en/guide/captcha/ReCaptchaV2.html) | Task type documentation |
| [CapSolver dashboard](https://dashboard.capsolver.com)                                 | API key management      |
| [DuelingBook service](./duelingbook.md)                                                | Where CapSolver is used |
