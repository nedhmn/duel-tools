from sqlalchemy import create_engine

from app.core.config import settings
from db.models import Base

engine = create_engine(settings.DATABASE_URL, echo=True)
Base.metadata.create_all(engine)
print("Tables created successfully!")
