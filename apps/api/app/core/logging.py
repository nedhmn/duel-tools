from logger import get_logger, setup_logging as _setup_logging

from app.core.config import settings


def setup_logging() -> None:
    _setup_logging(settings.LOG_LEVEL)


__all__ = ["get_logger", "setup_logging"]
