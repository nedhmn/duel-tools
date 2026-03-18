BEGIN;

CREATE TABLE alembic_version (
    version_num VARCHAR(32) NOT NULL, 
    CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

-- Running upgrade  -> da7c09b1913f

CREATE TABLE batches (
    name VARCHAR(255) NOT NULL, 
    id UUID NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id)
);

CREATE TABLE players (
    username VARCHAR(255) NOT NULL, 
    id UUID NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX ix_players_username ON players (username);

CREATE TABLE replays (
    duelingbook_id VARCHAR(64) NOT NULL, 
    url VARCHAR(512) NOT NULL, 
    raw_json JSONB NOT NULL, 
    match_result VARCHAR(16), 
    played_at TIMESTAMP WITH TIME ZONE, 
    format VARCHAR(64) NOT NULL, 
    id UUID NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX ix_replays_duelingbook_id ON replays (duelingbook_id);

CREATE TYPE jobstatus AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

CREATE TABLE jobs (
    batch_id UUID NOT NULL, 
    url VARCHAR(512) NOT NULL, 
    duelingbook_id VARCHAR(64) NOT NULL, 
    status jobstatus NOT NULL, 
    replay_id UUID, 
    error TEXT, 
    id UUID NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(batch_id) REFERENCES batches (id), 
    FOREIGN KEY(replay_id) REFERENCES replays (id)
);

CREATE INDEX ix_jobs_batch_id ON jobs (batch_id);

CREATE TABLE replay_players (
    replay_id UUID NOT NULL, 
    player_id UUID NOT NULL, 
    id UUID NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(player_id) REFERENCES players (id), 
    FOREIGN KEY(replay_id) REFERENCES replays (id), 
    CONSTRAINT uq_replay_player UNIQUE (replay_id, player_id)
);

CREATE INDEX ix_replay_players_player_id ON replay_players (player_id);

CREATE INDEX ix_replay_players_replay_id ON replay_players (replay_id);

INSERT INTO alembic_version (version_num) VALUES ('da7c09b1913f') RETURNING alembic_version.version_num;

COMMIT;

