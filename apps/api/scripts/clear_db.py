from sqlalchemy import create_engine, text

from app.core.config import settings

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

print("All tables cleared!")
