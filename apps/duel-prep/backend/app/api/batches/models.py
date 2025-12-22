from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class BatchSummary(BaseModel):
    id: UUID
    name: str
    created_at: datetime
    replay_count: int


class BatchListResponse(BaseModel):
    batches: list[BatchSummary]
