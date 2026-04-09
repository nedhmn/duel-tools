from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class CapsolverSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_ignore_empty=True,
        extra="ignore",
    )

    CAPSOLVER_API_KEY: str = Field(...)


settings = CapsolverSettings()
