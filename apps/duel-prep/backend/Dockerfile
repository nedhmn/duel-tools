# Stage 1: Frontend build
FROM node:22-slim AS frontend
WORKDIR /app
RUN corepack enable
COPY apps/duel-prep/frontend/package.json apps/duel-prep/frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY apps/duel-prep/frontend/ ./
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
COPY packages/db/pyproject.toml packages/db/pyproject.toml
COPY packages/logger/pyproject.toml packages/logger/pyproject.toml
COPY packages/parser/pyproject.toml packages/parser/pyproject.toml
COPY packages/scraper/pyproject.toml packages/scraper/pyproject.toml
COPY apps/duel-prep/backend/pyproject.toml apps/duel-prep/backend/pyproject.toml

# Install deps without workspace packages (faster layer caching)
RUN uv sync --frozen --no-install-workspace --no-dev

# Copy source code
COPY packages/ packages/
COPY apps/duel-prep/backend/ apps/duel-prep/backend/

# Sync with workspace packages
RUN uv sync --frozen --no-dev

# Copy frontend build to static dir
COPY --from=frontend /app/dist apps/duel-prep/backend/static

# Runtime config
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1
WORKDIR /app/apps/duel-prep/backend

# Default: run API (override CMD for worker)
CMD fastapi run --host 0.0.0.0 --port ${PORT:-8000} app/main.py
