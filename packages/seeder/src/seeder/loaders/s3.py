import json
from typing import Any


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
    return keys


async def download_replay(s3_client: Any, bucket: str, key: str) -> dict[str, Any]:
    response = await s3_client.get_object(Bucket=bucket, Key=key)
    async with response["Body"] as stream:
        data = await stream.read()
    return json.loads(data)
