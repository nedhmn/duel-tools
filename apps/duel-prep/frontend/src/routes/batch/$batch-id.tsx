import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import type { JobResponse } from "@/features/api/types";
import { useBatchStatus } from "@/features/batch/api";
import { BatchProcessing } from "@/features/batch/batch-processing";
import { SiteHeader } from "@/features/layout/site-header";
import { useReplay } from "@/features/replay/api";
import { type BatchFilter, ReplayView } from "@/features/replay/replay-view";

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
  const [batchFilter, setBatchFilter] = useState<BatchFilter>("both");

  const currentJob = completedJobs[currentIndex];
  const rawId = currentJob?.duelingbook_id ?? "";
  const currentDuelingbookId = stripQuotes(rawId);

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

  const handleNavigate = (newIndex: number) => {
    setBatchFilter("both");
    onNavigate(newIndex);
  };

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
          value: batchFilter,
          onChange: setBatchFilter,
        }}
        navigation={{
          current: currentIndex,
          total: completedJobs.length,
          onPrev: () => handleNavigate(Math.max(0, currentIndex - 1)),
          onNext: () =>
            handleNavigate(
              Math.min(completedJobs.length - 1, currentIndex + 1)
            ),
          items: navigationItems,
          onSelect: handleNavigate,
        }}
        replay={replay}
      />
    </div>
  );
};

const BatchPage = () => {
  const { "batch-id": batchId } = Route.useParams();
  const { replay } = Route.useSearch();
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
