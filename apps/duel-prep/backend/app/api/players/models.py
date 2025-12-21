from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class PlayerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    username: str


class PlayerListResponse(BaseModel):
    players: list[PlayerResponse]


class ReplayMetadata(BaseModel):
    id: UUID
    duelingbook_id: str
    url: str
    opponent: str
    played_at: datetime
    match_result: str


class PlayerDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    username: str
    replays: list[ReplayMetadata]
