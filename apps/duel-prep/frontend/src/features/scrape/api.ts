import { useMutation } from "@tanstack/react-query";
import type { ScrapeRequest, ScrapeResponse } from "@/features/api/types";
import { fetchJson } from "@/lib/fetch";

export const useSubmitScrape = () =>
  useMutation({
    mutationFn: (urls: string[]) =>
      fetchJson<ScrapeResponse>("/api/v1/scrape", {
        method: "POST",
        body: JSON.stringify({ urls } satisfies ScrapeRequest),
      }),
  });
