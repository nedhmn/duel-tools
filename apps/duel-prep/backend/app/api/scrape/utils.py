from db.models import Job, JobStatus

from app.api.scrape.models import JobResponse


def compute_batch_status(jobs: list[Job]) -> str:
    statuses = {job.status for job in jobs}

    if JobStatus.FAILED in statuses:
        return "failed"
    if JobStatus.PROCESSING in statuses:
        return "processing"
    if JobStatus.PENDING in statuses:
        return "pending"
    return "completed"


def job_to_response(job: Job) -> JobResponse:
    player1 = None
    player2 = None
    match_result = None
    played_at = None

    if job.replay:
        raw = job.replay.raw_json or {}
        p1 = raw.get("player1")
        p2 = raw.get("player2")
        player1 = p1.get("username") if isinstance(p1, dict) else None
        player2 = p2.get("username") if isinstance(p2, dict) else None
        match_result = job.replay.match_result
        played_at = job.replay.played_at

    return JobResponse(
        job_id=job.id,
        url=job.url,
        duelingbook_id=job.duelingbook_id,
        status=job.status,
        replay_id=job.replay_id,
        error=job.error,
        player1=player1,
        player2=player2,
        match_result=match_result,
        played_at=played_at,
    )
