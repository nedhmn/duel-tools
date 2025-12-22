import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ParsedReplay } from "@/features/api/types";
import { fetchJson } from "@/lib/fetch";

export const useReplay = (duelingbookId: string) =>
  useQuery({
    queryKey: ["replay", duelingbookId],
    queryFn: () => fetchJson<ParsedReplay>(`/api/v1/replays/${duelingbookId}`),
    enabled: !!duelingbookId,
    placeholderData: keepPreviousData,
  });
