from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.api.main import public_router
from app.core.limiter import limiter
from app.core.logging import setup_logging

setup_logging()

app = FastAPI(
    title="duel-prep",
    version="0.1.0",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # ty: ignore[invalid-argument-type]
app.add_middleware(SlowAPIMiddleware)  # type: ignore[arg-type]

app.add_middleware(
    CORSMiddleware,  # type: ignore[arg-type]
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(public_router, prefix="/api/v1")

static_dir = Path(__file__).parent.parent / "static"
index_html = static_dir / "index.html"
assets_dir = static_dir / "assets"

if index_html.exists() and assets_dir.exists():
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{path:path}")
    async def spa_fallback(path: str) -> FileResponse:
        file_path = static_dir / path
        try:
            resolved = file_path.resolve()
        except (OSError, ValueError):
            return FileResponse(index_html)
        if not resolved.is_relative_to(static_dir.resolve()):
            return FileResponse(index_html)
        if resolved.is_file():
            return FileResponse(resolved)
        return FileResponse(index_html)
