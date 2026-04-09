from pydantic import BaseModel, Field


class TurnstileTask(BaseModel):
    type: str = Field(default="AntiTurnstileTaskProxyLess")
    websiteURL: str = Field(...)
    websiteKey: str = Field(...)
    metadata: dict[str, str] | None = Field(default=None)


class CaptchaSolution(BaseModel):
    token: str = Field(...)
    user_agent: str | None = Field(default=None)
