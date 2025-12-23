from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_ignore_empty=True,
        extra="ignore",
    )

    DATABASE_URL: str = Field(
        default="postgresql://duel_tools:duel_tools@localhost:5432/duel_tools"
    )
    S3_BUCKET: str = Field(default="gfwl")
    S3_PREFIX: str = Field(default="replays/")
    S3_CONCURRENCY: int = Field(default=20)

    @property
    def DATABASE_URL_ASYNC(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url


settings = Settings()
