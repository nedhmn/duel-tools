from sqlalchemy import create_engine, text

from app.core.config import settings
from logger import get_logger, setup_logging

setup_logging()
logger = get_logger(__name__)

engine = create_engine(settings.DATABASE_URL, echo=True)

tables = [
    "replay_players",
    "jobs",
    "replays",
    "players",
    "batches",
]

with engine.connect() as conn:
    for table in tables:
        conn.execute(text(f"DELETE FROM {table}"))
    conn.commit()

logger.info("tables_cleared", tables=tables)
