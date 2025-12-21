import { useQuery } from "@tanstack/react-query";
import type { PlayerDetailResponse } from "@/features/api/types";

const dummyPlayerDetail: PlayerDetailResponse = {
  id: "player1",
  username: "ProDuelist99",
  replays: [
    {
      id: "replay1",
      duelingbook_id: "123456",
      url: "https://www.duelingbook.com/replay?id=123456",
      opponent: "CardMaster2024",
      played_at: "2024-12-20T15:30:00Z",
      match_result: "2-1",
    },
    {
      id: "replay2",
      duelingbook_id: "789012",
      url: "https://www.duelingbook.com/replay?id=789012",
      opponent: "DeckBuilder",
      played_at: "2024-12-19T10:00:00Z",
      match_result: "2-0",
    },
    {
      id: "replay3",
      duelingbook_id: "345678",
      url: "https://www.duelingbook.com/replay?id=345678",
      opponent: "MetaPlayer",
      played_at: "2024-12-18T20:00:00Z",
      match_result: "1-2",
    },
  ],
};

export const usePlayerDetail = (playerId: string) =>
  useQuery({
    queryKey: ["player", playerId],
    queryFn: async (): Promise<PlayerDetailResponse> => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { ...dummyPlayerDetail, id: playerId };
    },
    enabled: !!playerId,
  });
