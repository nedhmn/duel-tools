import { useQuery } from "@tanstack/react-query";
import type { BatchStatusResponse } from "@/features/api/types";
import { fetchJson } from "@/lib/fetch";

export const useBatchStatus = (batchId: string) =>
  useQuery({
    queryKey: ["batch", batchId],
    queryFn: () => fetchJson<BatchStatusResponse>(`/api/v1/scrape/${batchId}`),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "completed" || status === "failed") {
        return false;
      }
      return 2000;
    },
  });
