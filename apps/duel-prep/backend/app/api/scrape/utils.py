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
    return JobResponse(
        job_id=job.id,
        url=job.url,
        duelingbook_id=job.duelingbook_id,
        status=job.status,
        replay_id=job.replay_id,
        error=job.error,
    )
