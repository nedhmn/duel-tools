from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.main import public_router
from app.core.logging import setup_logging

setup_logging()

app = FastAPI(title="duel-prep", version="0.1.0")

app.add_middleware(
    CORSMiddleware,  # type: ignore[arg-type]
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(public_router, prefix="/api/v1")
