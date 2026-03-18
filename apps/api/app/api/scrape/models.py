from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from db.models import JobStatus


class ScrapeRequest(BaseModel):
    urls: list[str] = Field(min_length=1, max_length=50)
    name: str = Field(min_length=1, max_length=100)


class JobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    job_id: UUID
    url: str
    duelingbook_id: str
    status: JobStatus
    replay_id: UUID | None
    error: str | None
    player1: str | None = None
    player2: str | None = None
    match_result: str | None = None
    played_at: datetime | None = None
    format: str | None = None


class ScrapeResponse(BaseModel):
    batch_id: UUID
    jobs: list[JobResponse]


class BatchStatusResponse(BaseModel):
    batch_id: UUID
    name: str
    status: str
    jobs: list[JobResponse]
