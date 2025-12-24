FROM python:3.13-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
WORKDIR /app

ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

COPY pyproject.toml uv.lock ./
COPY packages/db/pyproject.toml packages/db/pyproject.toml
COPY packages/logger/pyproject.toml packages/logger/pyproject.toml
COPY packages/parser/pyproject.toml packages/parser/pyproject.toml
COPY packages/scraper/pyproject.toml packages/scraper/pyproject.toml
COPY packages/cron/pyproject.toml packages/cron/pyproject.toml

RUN uv sync --frozen --no-install-workspace --no-dev

COPY packages/ packages/

RUN uv sync --frozen --no-dev

ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1
WORKDIR /app/packages/cron

RUN useradd --create-home appuser
USER appuser
