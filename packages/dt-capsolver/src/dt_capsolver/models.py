from pydantic import BaseModel, Field


class TurnstileTask(BaseModel):
    type: str = Field(default="AntiTurnstileTaskProxyLess")
    websiteURL: str = Field(...)
    websiteKey: str = Field(...)
    metadata: dict[str, str] | None = Field(default=None)


class RecaptchaV2Task(BaseModel):
    type: str = Field(default="ReCaptchaV2TaskProxyLess")
    websiteURL: str = Field(...)
    websiteKey: str = Field(...)
    anchor: str = Field(...)
    reload: str = Field(...)


class CaptchaSolution(BaseModel):
    token: str = Field(...)
    user_agent: str | None = Field(default=None)
