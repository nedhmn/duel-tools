import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/features/layout/site-header";
import { usePlayerDetail } from "@/features/players/api";
import { useReplay } from "@/features/replay/api";
import { ReplayView } from "@/features/replay/replay-view";

type PlayerSearch = {
  replay?: string;
};

const validateSearch = (search: Record<string, unknown>): PlayerSearch => ({
  replay: typeof search.replay === "string" ? search.replay : undefined,
});

const stripQuotes = (s: string) => s.replace(/^"|"$/g, "");

type ReplayViewerProps = {
  replays: { duelingbook_id: string }[];
  currentIndex: number;
  onNavigate: (newIndex: number) => void;
};

const ReplayViewer = ({
  replays,
  currentIndex,
  onNavigate,
}: ReplayViewerProps) => {
  const rawId = replays[currentIndex]?.duelingbook_id ?? "";
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
        total: replays.length,
        onPrev: () => onNavigate(Math.max(0, currentIndex - 1)),
        onNext: () =>
          onNavigate(Math.min(replays.length - 1, currentIndex + 1)),
      }}
      replay={replay}
    />
  );
};

const PlayerPage = () => {
  const { "player-id": playerId } = Route.useParams();
  const { replay } = Route.useSearch();
  const navigate = useNavigate();

  const { data: player, isLoading } = usePlayerDetail(playerId);

  const replays = player?.replays ?? [];

  const currentIndex = replay
    ? Math.max(
        0,
        replays.findIndex((r) => stripQuotes(r.duelingbook_id) === replay)
      )
    : 0;

  const handleNavigate = (newIndex: number) => {
    const rawId = replays[newIndex]?.duelingbook_id;
    const newReplayId = rawId ? stripQuotes(rawId) : undefined;
    navigate({
      to: "/players/$player-id",
      params: { "player-id": playerId },
      search: { replay: newReplayId },
      replace: true,
    });
  };

  if (isLoading) {
    return (
      <>
        <SiteHeader
          breadcrumbs={[
            { label: "Players", href: "/players" },
            { label: "Loading..." },
          ]}
        />
        <main className="flex-1 p-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
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
          { label: "Players", href: "/players" },
          { label: player.username },
        ]}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 space-y-1">
          <h2 className="font-semibold text-xl">{player.username}</h2>
          <p className="text-muted-foreground text-sm">
            {player.replays.length} games recorded
          </p>
        </div>

        {player.replays.length > 0 ? (
          <ReplayViewer
            currentIndex={currentIndex}
            onNavigate={handleNavigate}
            replays={player.replays}
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
