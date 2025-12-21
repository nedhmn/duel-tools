// Scrape API types
export type JobStatus = "pending" | "processing" | "completed" | "failed";

export type ScrapeRequest = {
  urls: string[];
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
  status: string;
  jobs: JobResponse[];
};

// Replay API types
export type CardInfo = {
  card_id: number;
  card_name: string;
  card_amount: number;
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
};

// Player API types
export type PlayerResponse = {
  id: string;
  username: string;
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
