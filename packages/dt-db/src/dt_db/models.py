import enum
import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class JobStatus(enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Batch(Base):
    __tablename__ = "batches"

    name: Mapped[str] = mapped_column(String(255))

    jobs: Mapped[list["Job"]] = relationship(back_populates="batch")


class Job(Base):
    __tablename__ = "jobs"

    batch_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("batches.id"), index=True
    )
    url: Mapped[str] = mapped_column(String(512))
    duelingbook_id: Mapped[str] = mapped_column(String(64))
    status: Mapped[JobStatus]
    replay_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("replays.id")
    )
    error: Mapped[str | None] = mapped_column(Text)

    batch: Mapped["Batch"] = relationship(back_populates="jobs")
    replay: Mapped["Replay | None"] = relationship(back_populates="jobs")


class Replay(Base):
    __tablename__ = "replays"

    duelingbook_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    url: Mapped[str] = mapped_column(String(512))
    raw_json: Mapped[dict[str, Any]] = mapped_column(JSONB)
    match_result: Mapped[str | None] = mapped_column(String(16))
    played_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    format: Mapped[str] = mapped_column(String(64))

    jobs: Mapped[list["Job"]] = relationship(back_populates="replay")
    replay_players: Mapped[list["ReplayPlayer"]] = relationship(back_populates="replay")


class Player(Base):
    __tablename__ = "players"

    username: Mapped[str] = mapped_column(String(255), unique=True, index=True)

    replay_players: Mapped[list["ReplayPlayer"]] = relationship(back_populates="player")


class ReplayPlayer(Base):
    __tablename__ = "replay_players"
    __table_args__ = (
        UniqueConstraint("replay_id", "player_id", name="uq_replay_player"),
    )

    replay_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("replays.id"), index=True
    )
    player_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("players.id"), index=True
    )

    replay: Mapped["Replay"] = relationship(back_populates="replay_players")
    player: Mapped["Player"] = relationship(back_populates="replay_players")
