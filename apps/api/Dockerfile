# Stage 1: Frontend build
FROM node:22-slim AS frontend
WORKDIR /app
RUN corepack enable
COPY apps/web/package.json apps/web/pnpm-lock.yaml apps/web/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY apps/web/ ./
RUN pnpm build

# Stage 2: Backend
FROM python:3.13-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
WORKDIR /app

# Bytecode compilation for faster startup
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# Copy pyproject.toml files first (layer caching)
COPY pyproject.toml uv.lock ./
COPY apps/cron/pyproject.toml apps/cron/pyproject.toml
COPY apps/api/pyproject.toml apps/api/pyproject.toml
COPY packages/dt-db/pyproject.toml packages/dt-db/pyproject.toml
COPY packages/dt-logger/pyproject.toml packages/dt-logger/pyproject.toml
COPY packages/dt-parser/pyproject.toml packages/dt-parser/pyproject.toml
COPY packages/dt-scraper/pyproject.toml packages/dt-scraper/pyproject.toml
COPY packages/dt-seeder/pyproject.toml packages/dt-seeder/pyproject.toml
COPY packages/dt-capsolver/pyproject.toml packages/dt-capsolver/pyproject.toml

# Install deps without workspace packages (faster layer caching)
RUN uv sync --frozen --no-install-workspace --no-dev

# Copy source code
COPY packages/ packages/
COPY apps/api/ apps/api/

# Sync with workspace packages
RUN uv sync --frozen --no-dev

# Copy frontend build to static dir
COPY --from=frontend /app/dist apps/api/static

# Runtime config
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1
WORKDIR /app/apps/api

# Run as non-root user
RUN useradd --create-home appuser
USER appuser

# Default: run API (override CMD for worker)
CMD fastapi run --host 0.0.0.0 --port ${PORT:-8000} app/main.py
