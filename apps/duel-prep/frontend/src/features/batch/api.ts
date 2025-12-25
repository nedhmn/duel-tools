import { queryOptions, useQuery } from "@tanstack/react-query";
import type {
  BatchListResponse,
  BatchStatusResponse,
} from "@/features/api/types";
import { fetchJson } from "@/lib/fetch";

export const batchStatusQueryOptions = (batchId: string) =>
  queryOptions({
    queryKey: ["batch", batchId],
    queryFn: () => fetchJson<BatchStatusResponse>(`/api/v1/scrape/${batchId}`),
    staleTime: 30 * 1000,
  });

export const useBatchStatus = (batchId: string) =>
  useQuery({
    ...batchStatusQueryOptions(batchId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "completed" || status === "failed") {
        return false;
      }
      return 2000;
    },
  });

export const useBatches = () =>
  useQuery({
    queryKey: ["batches"],
    queryFn: () => fetchJson<BatchListResponse>("/api/v1/batches"),
    staleTime: 30 * 1000,
  });
