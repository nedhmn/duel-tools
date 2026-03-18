import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ScrapeRequest, ScrapeResponse } from "@/features/api/types";
import { fetchJson } from "@/lib/fetch";

export const useSubmitScrape = () =>
  useMutation({
    mutationFn: (request: ScrapeRequest) =>
      fetchJson<ScrapeResponse>("/api/v1/scrape", {
        method: "POST",
        body: JSON.stringify(request),
      }),
    onError: (error) => {
      toast.error("Failed to submit batch", {
        description: error.message,
      });
    },
  });
