from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_ignore_empty=True,
        extra="ignore",
    )

    DATABASE_URL: str = Field(...)

    FL_TOKEN: str = Field(...)

    CAPSOLVER_API_KEY: str = Field(...)
    TURNSTILE_SITE_KEY: str = Field(...)

    DB_USERNAME: str | None = Field(default=None)
    DB_PASSWORD: str | None = Field(default=None)
    DB_ID: str | None = Field(default=None)
    DB_REGULAR: str = Field(default="is")

    SYNC_CONCURRENCY: int = Field(default=20)

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

    @property
    def DATABASE_URL_ASYNC(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url


settings = Settings()
