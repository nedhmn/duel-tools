import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { JobResponse } from "@/features/api/types";

type BatchProcessingProps = {
  jobs: JobResponse[];
};

export const BatchProcessing = ({ jobs }: BatchProcessingProps) => {
  const total = jobs.length;
  const completed = jobs.filter((j) => j.status === "completed").length;
  const failed = jobs.filter((j) => j.status === "failed").length;
  const finished = completed + failed;
  const progress = total > 0 ? Math.round((finished / total) * 100) : 0;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6">
      <Loader2 className="size-8 animate-spin text-primary" />

      <p className="text-center text-sm">
        Processing replays... {finished} of {total}
      </p>

      <div className="w-full max-w-xs space-y-2">
        <Progress className="h-2" value={progress} />
        <p className="text-center text-muted-foreground text-xs">{progress}%</p>
      </div>
    </div>
  );
};
