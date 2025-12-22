import { useQuery } from "@tanstack/react-query";
import type {
  PlayerDetailResponse,
  PlayerListResponse,
} from "@/features/api/types";
import { fetchJson } from "@/lib/fetch";

export const usePlayerList = () =>
  useQuery({
    queryKey: ["players"],
    queryFn: () => fetchJson<PlayerListResponse>("/api/v1/players"),
  });

export const usePlayerDetail = (playerId: string) =>
  useQuery({
    queryKey: ["player", playerId],
    queryFn: () =>
      fetchJson<PlayerDetailResponse>(`/api/v1/players/${playerId}`),
    enabled: !!playerId,
  });
