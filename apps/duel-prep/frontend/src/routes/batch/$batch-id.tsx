import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import type { JobResponse } from "@/features/api/types";
import { useBatchStatus } from "@/features/batch/api";
import { BatchProcessing } from "@/features/batch/batch-processing";
import { SiteHeader } from "@/features/layout/site-header";
import { useReplay } from "@/features/replay/api";
import { type BatchFilter, ReplayView } from "@/features/replay/replay-view";

type BatchSearch = {
  replay?: number;
  pov?: string;
};

const validateSearch = (search: Record<string, unknown>): BatchSearch => ({
  replay: typeof search.replay === "number" ? search.replay : undefined,
  pov: typeof search.pov === "string" ? search.pov : undefined,
});

type ReplayViewerProps = {
  completedJobs: JobResponse[];
  currentIndex: number;
  onNavigate: (newIndex: number) => void;
  pov: BatchFilter;
  onPovChange: (pov: BatchFilter) => void;
};

const ReplayViewer = ({
  completedJobs,
  currentIndex,
  onNavigate,
  pov,
  onPovChange,
}: ReplayViewerProps) => {
  const currentJob = completedJobs[currentIndex];
  const currentDuelingbookId = currentJob?.duelingbook_id ?? "";

  const {
    data: replay,
    isLoading,
    isFetching,
  } = useReplay(currentDuelingbookId);

  const navigationItems = completedJobs.map((job) => {
    const hasMetadata = job.player1 && job.player2;
    if (hasMetadata) {
      return {
        label: `${job.player1} vs ${job.player2} · ${job.match_result ?? ""}`,
        sublabel: job.played_at
          ? new Date(job.played_at).toLocaleDateString()
          : undefined,
      };
    }
    return {
      label: `Replay ${job.duelingbook_id}`,
    };
  });

  if (isLoading && !replay) {
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
    <div
      className={
        isFetching ? "pointer-events-none opacity-60 transition-opacity" : ""
      }
    >
      <ReplayView
        batchFilter={{
          value: pov,
          onChange: onPovChange,
        }}
        navigation={{
          current: currentIndex,
          total: completedJobs.length,
          onPrev: () => onNavigate(Math.max(0, currentIndex - 1)),
          onNext: () =>
            onNavigate(Math.min(completedJobs.length - 1, currentIndex + 1)),
          items: navigationItems,
          onSelect: onNavigate,
        }}
        replay={replay}
      />
    </div>
  );
};

const BatchPage = () => {
  const { "batch-id": batchId } = Route.useParams();
  const { replay, pov } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const hasHandledComplete = useRef(false);

  const { data: batch, isLoading: batchLoading } = useBatchStatus(batchId);

  useEffect(() => {
    if (!batch || hasHandledComplete.current) {
      return;
    }

    const isComplete =
      batch.status === "completed" || batch.status === "failed";
    if (!isComplete) {
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["batches"] });

    const completed = batch.jobs.filter((j) => j.status === "completed").length;
    const failed = batch.jobs.filter((j) => j.status === "failed").length;
    const total = batch.jobs.length;

    if (failed > 0) {
      toast.warning(`${completed} of ${total} jobs succeeded`, {
        description: `${failed} job${failed > 1 ? "s" : ""} failed`,
      });
    }

    hasHandledComplete.current = true;
  }, [batch, queryClient]);

  const completedJobs = (
    batch?.jobs.filter((j) => j.status === "completed" && j.duelingbook_id) ??
    []
  ).sort((a, b) => {
    if (!(a.played_at && b.played_at)) {
      return 0;
    }
    return new Date(b.played_at).getTime() - new Date(a.played_at).getTime();
  });

  const currentIndex = replay
    ? Math.max(
        0,
        completedJobs.findIndex((j) => Number(j.duelingbook_id) === replay)
      )
    : 0;

  const currentPov: BatchFilter =
    pov === "player1" || pov === "player2" ? pov : "both";

  const handleNavigate = (newIndex: number) => {
    const rawId = completedJobs[newIndex]?.duelingbook_id;
    const newReplayId = rawId ? Number(rawId) : undefined;
    navigate({
      to: "/batch/$batch-id",
      params: { "batch-id": batchId },
      search: { replay: newReplayId, pov: currentPov },
      replace: true,
    });
  };

  const handlePovChange = (newPov: BatchFilter) => {
    navigate({
      to: "/batch/$batch-id",
      params: { "batch-id": batchId },
      search: { replay, pov: newPov === "both" ? undefined : newPov },
      replace: true,
    });
  };

  if (batchLoading) {
    return (
      <>
        <SiteHeader
          breadcrumbs={[
            { label: "Home", href: "/" },
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
            { label: "Home", href: "/" },
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
          { label: "Home", href: "/" },
          { label: "Batches", href: "/batch" },
          { label: batchTitle },
        ]}
      />
      <main className="flex flex-1 flex-col overflow-y-auto p-6">
        {showReplayViewer ? (
          <ReplayViewer
            completedJobs={completedJobs}
            currentIndex={currentIndex}
            onNavigate={handleNavigate}
            onPovChange={handlePovChange}
            pov={currentPov}
          />
        ) : (
          <BatchProcessing jobs={batch.jobs} />
        )}
      </main>
    </>
  );
};

export const Route = createFileRoute("/batch/$batch-id")({
  component: BatchPage,
  validateSearch,
});
