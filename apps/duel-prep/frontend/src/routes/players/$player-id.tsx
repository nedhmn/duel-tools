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
};

type ReplayViewerProps = {
  replays: ReplayMetadataItem[];
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

  const navigationItems = replays.map((r) => ({
    label: `vs ${r.opponent} · ${r.match_result}`,
    sublabel: new Date(r.played_at).toLocaleDateString(),
  }));

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
        items: navigationItems,
        onSelect: onNavigate,
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
