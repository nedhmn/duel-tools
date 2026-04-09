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
        default="postgresql://duel_tools:duel_tools@localhost:5437/duel_tools"
    )

    @property
    def DATABASE_URL_ASYNC(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

    REDIS_URL: str = Field(default="redis://localhost:6380/0")

    CAPSOLVER_API_KEY: str = Field(...)
    SITE_KEY: str = Field(...)

    DB_USERNAME: str | None = Field(default=None)
    DB_PASSWORD: str | None = Field(default=None)
    DB_ID: str | None = Field(default=None)
    DB_REGULAR: str = Field(default="is")

    AUTH_PASSWORD: str | None = Field(default=None)

    @property
    def auth_cookies(self) -> dict[str, str] | None:
        if not self.DB_USERNAME or not self.DB_PASSWORD or not self.DB_ID:
            return None
        return {
            "username": self.DB_USERNAME,
            "password": self.DB_PASSWORD,
            "db_id": self.DB_ID,
            "regular": self.DB_REGULAR,
        }


settings = Settings()
