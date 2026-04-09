from uuid import UUID

from dt_parser import ParsedReplay


class ParsedReplayResponse(ParsedReplay):
    player1_id: UUID | None = None
    player2_id: UUID | None = None


__all__ = ["ParsedReplay", "ParsedReplayResponse"]
