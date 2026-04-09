from app.core.config import settings
from dt_logger import get_logger
from dt_logger import setup_logging as _setup_logging


def setup_logging() -> None:
    _setup_logging(settings.LOG_LEVEL)


__all__ = ["get_logger", "setup_logging"]
