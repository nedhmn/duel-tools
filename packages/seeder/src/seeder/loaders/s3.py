import json
from typing import Any

from logger import get_logger

logger = get_logger(__name__)


def extract_replay_id(key: str) -> str:
    filename = key.split("/")[-1]
    return filename.replace("_replay.json", "")


async def list_keys(s3_client: Any, bucket: str, prefix: str) -> list[str]:
    keys: list[str] = []
    paginator = s3_client.get_paginator("list_objects_v2")
    async for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
        for obj in page.get("Contents", []):
            if obj["Key"].endswith("_replay.json"):
                keys.append(obj["Key"])
    logger.info("s3_keys_listed", bucket=bucket, prefix=prefix, count=len(keys))
    return keys


async def download_replay(s3_client: Any, bucket: str, key: str) -> dict[str, Any]:
    response = await s3_client.get_object(Bucket=bucket, Key=key)
    async with response["Body"] as stream:
        data = await stream.read()
    logger.info("s3_replay_downloaded", key=key)
    return json.loads(data)
