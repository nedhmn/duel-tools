import type {
  BatchStatusResponse,
  ParsedReplay,
  PlayerDetailResponse,
  PlayerListResponse,
  ScrapeRequest,
  ScrapeResponse,
} from "./types";

const API_BASE = "/api/v1";

const fetchJson = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
};

// Scrape endpoints
export const submitScrape = (data: ScrapeRequest): Promise<ScrapeResponse> =>
  fetchJson(`${API_BASE}/scrape`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getBatchStatus = (batchId: string): Promise<BatchStatusResponse> =>
  fetchJson(`${API_BASE}/scrape/${batchId}`);

// Replay endpoints
export const getReplay = (duelingbookId: string): Promise<ParsedReplay> =>
  fetchJson(`${API_BASE}/replays/${duelingbookId}`);

// Player endpoints
export const getPlayers = (): Promise<PlayerListResponse> =>
  fetchJson(`${API_BASE}/players`);

export const getPlayer = (playerId: string): Promise<PlayerDetailResponse> =>
  fetchJson(`${API_BASE}/players/${playerId}`);
