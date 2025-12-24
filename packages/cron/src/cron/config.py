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

    FL_ACCESS: str = Field(...)
    FL_PLAYER_ID: str = Field(...)
    FL_PLAYER_NAME: str = Field(...)

    @property
    def DATABASE_URL_ASYNC(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

    @property
    def fl_cookies(self) -> dict[str, str]:
        return {
            "access": self.FL_ACCESS,
            "playerId": self.FL_PLAYER_ID,
            "playerName": self.FL_PLAYER_NAME,
        }


settings = Settings()
