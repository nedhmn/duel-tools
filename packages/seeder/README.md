# seeder

Import replay JSONs from AWS S3 into the database.

## Setup

```bash
cp .env.example .env
# Edit .env with your credentials
```

## Usage

```bash
make seed-s3
```

## Configuration

| Variable                | Description                  | Default                       |
| ----------------------- | ---------------------------- | ----------------------------- |
| `DATABASE_URL`          | PostgreSQL connection string | `postgresql://duel_tools:...` |
| `S3_BUCKET`             | S3 bucket name               | `gfwl`                        |
| `S3_PREFIX`             | S3 key prefix                | `replays/`                    |
| `S3_CONCURRENCY`        | Max concurrent downloads     | `20`                          |
| `AWS_ACCESS_KEY_ID`     | AWS access key               | (required)                    |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key               | (required)                    |
| `AWS_REGION`            | AWS region                   | `us-east-1`                   |

## How It Works

1. Lists all `{id}_replay.json` files from S3
2. Queries DB for existing `duelingbook_id`s (skip duplicates)
3. Downloads new replays with 20 concurrent connections
4. For each replay: parse → insert replay + players → commit
5. Logs failures and continues (resumable)
