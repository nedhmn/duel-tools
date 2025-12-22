import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/features/layout/site-header";
import { usePlayerDetail } from "@/features/players/api";
import { useReplay } from "@/features/replay/api";
import { type PlayerFilter, ReplayView } from "@/features/replay/replay-view";

type PlayerSearch = {
  replay?: number;
  pov?: string;
  format?: string;
};

const validateSearch = (search: Record<string, unknown>): PlayerSearch => ({
  replay: typeof search.replay === "number" ? search.replay : undefined,
  pov: typeof search.pov === "string" ? search.pov : undefined,
  format: typeof search.format === "string" ? search.format : undefined,
});

const SKELETON_CARD_IDS = [
  "skel-1",
  "skel-2",
  "skel-3",
  "skel-4",
  "skel-5",
  "skel-6",
  "skel-7",
  "skel-8",
];

type ReplayMetadataItem = {
  duelingbook_id: string;
  opponent: string;
  match_result: string;
  played_at: string;
  format: string;
};

type FormatOption = { value: string; count: number };

type ReplayViewerProps = {
  replays: ReplayMetadataItem[];
  currentIndex: number;
  onNavigate: (newIndex: number) => void;
  focusedPlayerName: string;
  pov: PlayerFilter;
  onPovChange: (pov: PlayerFilter) => void;
  formatValue: string | null;
  formatOptions: FormatOption[];
  onFormatChange: (format: string | null) => void;
};

const ReplayViewer = ({
  replays,
  currentIndex,
  onNavigate,
  focusedPlayerName,
  pov,
  onPovChange,
  formatValue,
  formatOptions,
  onFormatChange,
}: ReplayViewerProps) => {
  const currentDuelingbookId = replays[currentIndex]?.duelingbook_id ?? "";

  const {
    data: replay,
    isLoading,
    isFetching,
  } = useReplay(currentDuelingbookId);

  const navigationItems = replays.map((r) => ({
    label: `vs ${r.opponent} · ${r.match_result}`,
    sublabel: new Date(r.played_at).toLocaleDateString(),
  }));

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
        formatFilter={{
          value: formatValue,
          options: formatOptions,
          onChange: onFormatChange,
        }}
        navigation={{
          current: currentIndex,
          total: replays.length,
          onPrev: () => onNavigate(Math.max(0, currentIndex - 1)),
          onNext: () =>
            onNavigate(Math.min(replays.length - 1, currentIndex + 1)),
          items: navigationItems,
          onSelect: onNavigate,
        }}
        playerFilter={{
          focusedPlayerName,
          value: pov,
          onChange: onPovChange,
        }}
        replay={replay}
      />
    </div>
  );
};

const PlayerPage = () => {
  const { "player-id": playerId } = Route.useParams();
  const { replay, pov, format } = Route.useSearch();
  const navigate = useNavigate();

  const { data: player, isLoading } = usePlayerDetail(playerId);

  const allReplays = [...(player?.replays ?? [])].sort(
    (a, b) => new Date(b.played_at).getTime() - new Date(a.played_at).getTime()
  );

  const formatOptions: FormatOption[] = (() => {
    const counts = new Map<string, number>();
    for (const r of allReplays) {
      if (r.format) {
        counts.set(r.format, (counts.get(r.format) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);
  })();

  const currentFormat = format ?? null;

  const replays = currentFormat
    ? allReplays.filter((r) => r.format === currentFormat)
    : allReplays;

  const currentIndex = replay
    ? Math.max(
        0,
        replays.findIndex((r) => Number(r.duelingbook_id) === replay)
      )
    : 0;

  const currentPov: PlayerFilter =
    pov === "player" || pov === "opponent" ? pov : "both";

  const handleNavigate = (newIndex: number) => {
    const rawId = replays[newIndex]?.duelingbook_id;
    const newReplayId = rawId ? Number(rawId) : undefined;
    navigate({
      to: "/players/$player-id",
      params: { "player-id": playerId },
      search: {
        replay: newReplayId,
        pov: currentPov === "both" ? undefined : currentPov,
        format: currentFormat ?? undefined,
      },
      replace: true,
    });
  };

  const handlePovChange = (newPov: PlayerFilter) => {
    navigate({
      to: "/players/$player-id",
      params: { "player-id": playerId },
      search: {
        replay,
        pov: newPov === "both" ? undefined : newPov,
        format: currentFormat ?? undefined,
      },
      replace: true,
    });
  };

  const handleFormatChange = (newFormat: string | null) => {
    navigate({
      to: "/players/$player-id",
      params: { "player-id": playerId },
      search: {
        replay: undefined,
        pov: currentPov === "both" ? undefined : currentPov,
        format: newFormat ?? undefined,
      },
      replace: true,
    });
  };

  if (isLoading) {
    return (
      <>
        <SiteHeader
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Players", href: "/players" },
            { label: "Loading..." },
          ]}
        />
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div className="space-y-1">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <div className="rounded-lg border border-border/50 p-4">
                <Skeleton className="mb-3 h-5 w-32" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <Skeleton className="mb-2 h-5 w-24" />
                    <div className="grid grid-cols-4 gap-[3px] sm:grid-cols-6 md:grid-cols-8">
                      {SKELETON_CARD_IDS.map((id) => (
                        <Skeleton
                          className="aspect-[421/614] w-full rounded"
                          key={`p1-${id}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <Skeleton className="mb-2 h-5 w-24" />
                    <div className="grid grid-cols-4 gap-[3px] sm:grid-cols-6 md:grid-cols-8">
                      {SKELETON_CARD_IDS.map((id) => (
                        <Skeleton
                          className="aspect-[421/614] w-full rounded"
                          key={`p2-${id}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!player) {
    return (
      <>
        <SiteHeader
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Players", href: "/players" },
            { label: "Not Found" },
          ]}
        />
        <main className="flex-1 p-6">
          <p className="text-muted-foreground">Player not found</p>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Players", href: "/players" },
          { label: player.username },
        ]}
      />
      <main className="flex-1 overflow-y-auto p-6">
        {replays.length > 0 ? (
          <ReplayViewer
            currentIndex={currentIndex}
            focusedPlayerName={player.username}
            formatOptions={formatOptions}
            formatValue={currentFormat}
            onFormatChange={handleFormatChange}
            onNavigate={handleNavigate}
            onPovChange={handlePovChange}
            pov={currentPov}
            replays={replays}
          />
        ) : (
          <p className="text-muted-foreground">No replays available</p>
        )}
      </main>
    </>
  );
};

export const Route = createFileRoute("/players/$player-id")({
  component: PlayerPage,
  validateSearch,
});
