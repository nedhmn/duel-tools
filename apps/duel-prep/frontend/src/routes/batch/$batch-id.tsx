import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import type { JobResponse, ParsedReplay } from "@/features/api/types";
import { useBatchStatus } from "@/features/batch/api";
import { BatchProcessing } from "@/features/batch/batch-processing";
import { SiteHeader } from "@/features/layout/site-header";
import { replayQueryOptions, useReplay } from "@/features/replay/api";
import { type BatchFilter, ReplayView } from "@/features/replay/replay-view";

type BatchSearch = {
  replay?: number;
  pov?: string;
  format?: string;
};

const validateSearch = (search: Record<string, unknown>): BatchSearch => ({
  replay: typeof search.replay === "number" ? search.replay : undefined,
  pov: typeof search.pov === "string" ? search.pov : undefined,
  format: typeof search.format === "string" ? search.format : undefined,
});

type FormatOption = { value: string; count: number };

type ReplayViewerProps = {
  completedJobs: JobResponse[];
  currentIndex: number;
  onNavigate: (newIndex: number) => void;
  pov: BatchFilter;
  onPovChange: (pov: BatchFilter) => void;
  formatValue: string | null;
  formatOptions: FormatOption[];
  onFormatChange: (format: string | null) => void;
  replay: ParsedReplay | undefined;
  isReplayLoading: boolean;
  isReplayFetching: boolean;
};

const ReplayViewer = ({
  completedJobs,
  currentIndex,
  onNavigate,
  pov,
  onPovChange,
  formatValue,
  formatOptions,
  onFormatChange,
  replay,
  isReplayLoading,
  isReplayFetching,
}: ReplayViewerProps) => {
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

  if (isReplayLoading && !replay) {
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
        isReplayFetching
          ? "pointer-events-none opacity-60 transition-opacity"
          : ""
      }
    >
      <ReplayView
        batchFilter={{
          value: pov,
          onChange: onPovChange,
        }}
        formatFilter={{
          value: formatValue,
          options: formatOptions,
          onChange: onFormatChange,
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
  const { replay: replayParam, pov, format } = Route.useSearch();
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
    queryClient.invalidateQueries({ queryKey: ["players"] });

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

  const allCompletedJobs = (
    batch?.jobs.filter((j) => j.status === "completed" && j.duelingbook_id) ??
    []
  ).sort((a, b) => {
    if (!(a.played_at && b.played_at)) {
      return 0;
    }
    return new Date(b.played_at).getTime() - new Date(a.played_at).getTime();
  });

  const formatOptions: FormatOption[] = (() => {
    const counts = new Map<string, number>();
    for (const job of allCompletedJobs) {
      if (job.format) {
        counts.set(job.format, (counts.get(job.format) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);
  })();

  const currentFormat = format ?? null;

  const completedJobs = currentFormat
    ? allCompletedJobs.filter((j) => j.format === currentFormat)
    : allCompletedJobs;

  const currentIndex = replayParam
    ? Math.max(
        0,
        completedJobs.findIndex((j) => Number(j.duelingbook_id) === replayParam)
      )
    : 0;

  const currentDuelingbookId = replayParam
    ? String(replayParam)
    : (completedJobs[0]?.duelingbook_id ?? "");

  const {
    data: replayData,
    isLoading: isReplayLoading,
    isFetching: isReplayFetching,
  } = useReplay(currentDuelingbookId);

  useEffect(() => {
    const prevJob = completedJobs[currentIndex - 1];
    if (prevJob?.duelingbook_id) {
      queryClient.prefetchQuery(replayQueryOptions(prevJob.duelingbook_id));
    }

    const nextJob = completedJobs[currentIndex + 1];
    if (nextJob?.duelingbook_id) {
      queryClient.prefetchQuery(replayQueryOptions(nextJob.duelingbook_id));
    }
  }, [currentIndex, completedJobs, queryClient]);

  const currentPov: BatchFilter =
    pov === "player1" || pov === "player2" ? pov : "both";

  const handleNavigate = (newIndex: number) => {
    const rawId = completedJobs[newIndex]?.duelingbook_id;
    const newReplayId = rawId ? Number(rawId) : undefined;
    navigate({
      to: "/batch/$batch-id",
      params: { "batch-id": batchId },
      search: {
        replay: newReplayId,
        pov: currentPov === "both" ? undefined : currentPov,
        format: currentFormat ?? undefined,
      },
      replace: true,
    });
  };

  const handlePovChange = (newPov: BatchFilter) => {
    navigate({
      to: "/batch/$batch-id",
      params: { "batch-id": batchId },
      search: {
        replay: replayParam,
        pov: newPov === "both" ? undefined : newPov,
        format: currentFormat ?? undefined,
      },
      replace: true,
    });
  };

  const handleFormatChange = (newFormat: string | null) => {
    navigate({
      to: "/batch/$batch-id",
      params: { "batch-id": batchId },
      search: {
        replay: undefined,
        pov: currentPov === "both" ? undefined : currentPov,
        format: newFormat ?? undefined,
      },
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
            formatOptions={formatOptions}
            formatValue={currentFormat}
            isReplayFetching={isReplayFetching}
            isReplayLoading={isReplayLoading}
            onFormatChange={handleFormatChange}
            onNavigate={handleNavigate}
            onPovChange={handlePovChange}
            pov={currentPov}
            replay={replayData}
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
