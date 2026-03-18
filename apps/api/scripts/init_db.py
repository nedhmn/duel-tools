from sqlalchemy import create_engine

from app.core.config import settings
from db.models import Base
from logger import get_logger, setup_logging

setup_logging()
logger = get_logger(__name__)

engine = create_engine(settings.DATABASE_URL, echo=True)
Base.metadata.create_all(engine)
logger.info("tables_created")
