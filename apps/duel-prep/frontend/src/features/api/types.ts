// Scrape API types
export type JobStatus = "pending" | "processing" | "completed" | "failed";

export type ScrapeRequest = {
  urls: string[];
  name: string;
};

export type JobResponse = {
  job_id: string;
  url: string;
  duelingbook_id: string;
  status: JobStatus;
  replay_id: string | null;
  error: string | null;
};

export type ScrapeResponse = {
  batch_id: string;
  jobs: JobResponse[];
};

export type BatchStatusResponse = {
  batch_id: string;
  name: string;
  status: string;
  jobs: JobResponse[];
};

// Batch API types
export type BatchSummary = {
  id: string;
  name: string;
  created_at: string;
  replay_count: number;
};

export type BatchListResponse = {
  batches: BatchSummary[];
};

// Replay API types
export type CardInfo = {
  card_id: number;
  card_name: string;
  card_amount: number;
  card_type: string;
};

export type PlayerCards = {
  username: string;
  card_count: number;
  cards: CardInfo[];
};

export type Game = {
  game_number: number;
  winner: string | null;
  went_first: string;
  player1_cards: PlayerCards;
  player2_cards: PlayerCards;
};

export type ParsedReplay = {
  replay_id: number;
  played_at: string;
  format: string;
  player1: string;
  player2: string;
  match_result: string;
  games: Game[];
  player1_id: string | null;
  player2_id: string | null;
};

// Player API types
export type PlayerResponse = {
  id: string;
  username: string;
  replay_count: number;
};

export type PlayerListResponse = {
  players: PlayerResponse[];
};

export type ReplayMetadata = {
  id: string;
  duelingbook_id: string;
  url: string;
  opponent: string;
  played_at: string;
  match_result: string;
};

export type PlayerDetailResponse = {
  id: string;
  username: string;
  replays: ReplayMetadata[];
};
