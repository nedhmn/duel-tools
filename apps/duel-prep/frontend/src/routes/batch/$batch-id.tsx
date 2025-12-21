import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { JobResponse } from "@/features/api/types";
import { useBatchStatus } from "@/features/batch/api";
import { SiteHeader } from "@/features/layout/site-header";
import { useReplay } from "@/features/replay/api";
import { ReplayView } from "@/features/replay/replay-view";

type ReplayViewerProps = {
  completedJobs: JobResponse[];
  currentIndex: number;
  setCurrentIndex: (fn: (i: number) => number) => void;
};

const ReplayViewer = ({
  completedJobs,
  currentIndex,
  setCurrentIndex,
}: ReplayViewerProps) => {
  const currentJob = completedJobs[currentIndex];
  const currentDuelingbookId = currentJob?.duelingbook_id ?? "";

  const { data: replay, isLoading } = useReplay(currentDuelingbookId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!replay) {
    return null;
  }

  return (
    <ReplayView
      navigation={{
        current: currentIndex,
        total: completedJobs.length,
        onPrev: () => setCurrentIndex((i) => Math.max(0, i - 1)),
        onNext: () =>
          setCurrentIndex((i) => Math.min(completedJobs.length - 1, i + 1)),
      }}
      replay={replay}
    />
  );
};

const BatchPage = () => {
  const { "batch-id": batchId } = Route.useParams();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: batch, isLoading: batchLoading } = useBatchStatus(batchId);

  if (batchLoading) {
    return (
      <>
        <SiteHeader title="Batch" />
        <main className="flex-1 p-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </main>
      </>
    );
  }

  if (!batch) {
    return (
      <>
        <SiteHeader title="Batch" />
        <main className="flex-1 p-6">
          <p className="text-muted-foreground">Batch not found</p>
        </main>
      </>
    );
  }

  const completedJobs = batch.jobs.filter(
    (j) => j.status === "completed" && j.duelingbook_id
  );
  const isComplete = batch.status === "completed" || batch.status === "failed";
  const showReplayViewer = isComplete && completedJobs.length > 0;

  const batchTitle = `Batch: ${batchId.slice(0, 8)}...`;

  return (
    <>
      <SiteHeader title={batchTitle} />
      <main className="flex-1 overflow-y-auto p-6">
        {showReplayViewer ? (
          <ReplayViewer
            completedJobs={completedJobs}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
          />
        ) : (
          <p className="text-muted-foreground">Processing...</p>
        )}
      </main>
    </>
  );
};

export const Route = createFileRoute("/batch/$batch-id")({
  component: BatchPage,
});
