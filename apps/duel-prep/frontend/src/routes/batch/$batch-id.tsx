import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import type { JobResponse } from "@/features/api/types";
import { useBatchStatus } from "@/features/batch/api";
import { BatchProgress } from "@/features/batch/batch-progress";
import { SiteHeader } from "@/features/layout/site-header";
import { useReplay } from "@/features/replay/api";
import { ReplayView } from "@/features/replay/replay-view";

type BatchSearch = {
  replay?: string;
};

const validateSearch = (search: Record<string, unknown>): BatchSearch => ({
  replay: typeof search.replay === "string" ? search.replay : undefined,
});

const stripQuotes = (s: string) => s.replace(/^"|"$/g, "");

type ReplayViewerProps = {
  completedJobs: JobResponse[];
  currentIndex: number;
  onNavigate: (newIndex: number) => void;
};

const ReplayViewer = ({
  completedJobs,
  currentIndex,
  onNavigate,
}: ReplayViewerProps) => {
  const currentJob = completedJobs[currentIndex];
  const rawId = currentJob?.duelingbook_id ?? "";
  const currentDuelingbookId = stripQuotes(rawId);

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
        onPrev: () => onNavigate(Math.max(0, currentIndex - 1)),
        onNext: () =>
          onNavigate(Math.min(completedJobs.length - 1, currentIndex + 1)),
      }}
      replay={replay}
    />
  );
};

const BatchPage = () => {
  const { "batch-id": batchId } = Route.useParams();
  const { replay } = Route.useSearch();
  const navigate = useNavigate();
  const hasShownToast = useRef(false);

  const { data: batch, isLoading: batchLoading } = useBatchStatus(batchId);

  useEffect(() => {
    if (!batch || hasShownToast.current) {
      return;
    }

    const isComplete =
      batch.status === "completed" || batch.status === "failed";
    if (!isComplete) {
      return;
    }

    const completed = batch.jobs.filter((j) => j.status === "completed").length;
    const failed = batch.jobs.filter((j) => j.status === "failed").length;
    const total = batch.jobs.length;

    if (failed > 0) {
      toast.warning(`${completed} of ${total} jobs succeeded`, {
        description: `${failed} job${failed > 1 ? "s" : ""} failed`,
      });
    }

    hasShownToast.current = true;
  }, [batch]);

  const completedJobs =
    batch?.jobs.filter((j) => j.status === "completed" && j.duelingbook_id) ??
    [];

  const currentIndex = replay
    ? Math.max(
        0,
        completedJobs.findIndex((j) => stripQuotes(j.duelingbook_id) === replay)
      )
    : 0;

  const handleNavigate = (newIndex: number) => {
    const rawId = completedJobs[newIndex]?.duelingbook_id;
    const newReplayId = rawId ? stripQuotes(rawId) : undefined;
    navigate({
      to: "/batch/$batch-id",
      params: { "batch-id": batchId },
      search: { replay: newReplayId },
      replace: true,
    });
  };

  if (batchLoading) {
    return (
      <>
        <SiteHeader
          breadcrumbs={[
            { label: "Batches", href: "/batch" },
            { label: "Loading..." },
          ]}
        />
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
        <SiteHeader
          breadcrumbs={[
            { label: "Batches", href: "/batch" },
            { label: "Not Found" },
          ]}
        />
        <main className="flex-1 p-6">
          <p className="text-muted-foreground">Batch not found</p>
        </main>
      </>
    );
  }

  const isComplete = batch.status === "completed" || batch.status === "failed";
  const showReplayViewer = isComplete && completedJobs.length > 0;

  const batchTitle = batch.name || `Batch: ${batchId.slice(0, 8)}...`;

  return (
    <>
      <SiteHeader
        breadcrumbs={[
          { label: "Batches", href: "/batch" },
          { label: batchTitle },
        ]}
      />
      <main className="flex-1 overflow-y-auto p-6">
        {showReplayViewer ? (
          <ReplayViewer
            completedJobs={completedJobs}
            currentIndex={currentIndex}
            onNavigate={handleNavigate}
          />
        ) : (
          <BatchProgress jobs={batch.jobs} status={batch.status} />
        )}
      </main>
    </>
  );
};

export const Route = createFileRoute("/batch/$batch-id")({
  component: BatchPage,
  validateSearch,
});
