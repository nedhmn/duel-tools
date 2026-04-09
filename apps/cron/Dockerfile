FROM python:3.13-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
WORKDIR /app

ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

COPY pyproject.toml uv.lock ./
COPY apps/cron/pyproject.toml apps/cron/pyproject.toml
COPY apps/api/pyproject.toml apps/api/pyproject.toml
COPY packages/dt-db/pyproject.toml packages/dt-db/pyproject.toml
COPY packages/dt-logger/pyproject.toml packages/dt-logger/pyproject.toml
COPY packages/dt-parser/pyproject.toml packages/dt-parser/pyproject.toml
COPY packages/dt-scraper/pyproject.toml packages/dt-scraper/pyproject.toml
COPY packages/dt-seeder/pyproject.toml packages/dt-seeder/pyproject.toml
COPY packages/dt-capsolver/pyproject.toml packages/dt-capsolver/pyproject.toml

RUN uv sync --frozen --no-install-workspace --no-dev

COPY packages/ packages/
COPY apps/cron/ apps/cron/

RUN uv sync --frozen --no-dev

ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1
WORKDIR /app/apps/cron

RUN useradd --create-home appuser
USER appuser
