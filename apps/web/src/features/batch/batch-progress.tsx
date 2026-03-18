import { CheckCircle, Circle, Loader2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { JobResponse, JobStatus } from "@/features/api/types";

type BatchProgressProps = {
  jobs: JobResponse[];
  status: string;
};

const statusConfig: Record<
  JobStatus,
  { icon: typeof Circle; className: string }
> = {
  pending: { icon: Circle, className: "text-muted-foreground" },
  processing: { icon: Loader2, className: "text-blue-500 animate-spin" },
  completed: { icon: CheckCircle, className: "text-green-500" },
  failed: { icon: XCircle, className: "text-destructive" },
};

export const BatchProgress = ({ jobs, status }: BatchProgressProps) => {
  const counts = {
    pending: jobs.filter((j) => j.status === "pending").length,
    processing: jobs.filter((j) => j.status === "processing").length,
    completed: jobs.filter((j) => j.status === "completed").length,
    failed: jobs.filter((j) => j.status === "failed").length,
  };

  const total = jobs.length;
  const finishedCount = counts.completed + counts.failed;
  const progressPercent = total > 0 ? (finishedCount / total) * 100 : 0;
  const isComplete = status === "completed" || status === "failed";
  const hasFailed = counts.failed > 0;

  const getStatusText = () => {
    if (!isComplete) {
      return `${finishedCount} of ${total} completed`;
    }
    if (hasFailed) {
      return `${counts.completed} of ${total} succeeded`;
    }
    return "Batch complete";
  };

  const statusText = getStatusText();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">{statusText}</span>
          <div className="flex gap-3">
            {counts.completed > 0 && (
              <span className="text-green-500">{counts.completed} done</span>
            )}
            {counts.processing > 0 && (
              <span className="text-blue-500">
                {counts.processing} processing
              </span>
            )}
            {counts.pending > 0 && (
              <span className="text-muted-foreground">
                {counts.pending} pending
              </span>
            )}
            {counts.failed > 0 && (
              <span className="text-destructive">{counts.failed} failed</span>
            )}
          </div>
        </div>
        {!isComplete && <Progress className="h-2" value={progressPercent} />}
      </div>

      <div className="space-y-1">
        {jobs.map((job) => {
          const config = statusConfig[job.status];
          const Icon = config.icon;

          return (
            <div
              className="flex items-center gap-2 rounded px-2 py-1.5 text-sm"
              key={job.job_id}
            >
              <Icon className={`h-4 w-4 ${config.className}`} />
              <span className="truncate">{job.url}</span>
              {job.error ? (
                <span className="ml-auto text-destructive text-xs">
                  {job.error}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
