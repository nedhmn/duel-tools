import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import type { ParsedReplay } from "@/features/api/types";
import { fetchJson } from "@/lib/fetch";

export const replayQueryOptions = (duelingbookId: string) =>
  queryOptions({
    queryKey: ["replay", duelingbookId],
    queryFn: () => fetchJson<ParsedReplay>(`/api/v1/replays/${duelingbookId}`),
    enabled: !!duelingbookId,
    placeholderData: keepPreviousData,
    staleTime: Number.POSITIVE_INFINITY,
  });

export const useReplay = (duelingbookId: string) =>
  useQuery(replayQueryOptions(duelingbookId));
