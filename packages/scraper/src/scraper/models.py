from pydantic import BaseModel, Field


class ViewReplayFormData(BaseModel):
    token: str = Field(...)
    turnstile: bool = Field(default=True)
    master: bool = Field(default=False)
