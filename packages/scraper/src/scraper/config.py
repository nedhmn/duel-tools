from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class ScraperSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_ignore_empty=True,
        extra="ignore",
    )

    CAPSOLVER_API_KEY: str = Field(...)
    SITE_KEY: str = Field(...)

    DB_USERNAME: str = Field(...)
    DB_PASSWORD: str = Field(...)
    DB_ID: str = Field(...)
    DB_REGULAR: str = Field(default="not")

    @property
    def auth_cookies(self) -> dict[str, str]:
        return {
            "username": self.DB_USERNAME,
            "password": self.DB_PASSWORD,
            "db_id": self.DB_ID,
            "regular": self.DB_REGULAR,
        }


settings = ScraperSettings()
