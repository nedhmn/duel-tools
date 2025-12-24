from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_ignore_empty=True,
        extra="ignore",
    )

    LOG_LEVEL: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = Field(
        default="INFO"
    )

    DATABASE_URL: str = Field(
        default="postgresql://duel_tools:duel_tools@localhost:5432/duel_tools"
    )

    @property
    def DATABASE_URL_ASYNC(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

    REDIS_URL: str = Field(default="redis://localhost:6379/0")

    AUTH_PASSWORD: str = Field(...)


settings = Settings()
