import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { DataTableColumnFilter } from "@/components/data-table-column-filter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  PlayerDetailResponse,
  PlayerResponse,
} from "@/features/api/types";
import { SiteHeader } from "@/features/layout/site-header";
import {
  playerDetailQueryOptions,
  usePlayerList,
} from "@/features/players/api";
import { replayQueryOptions } from "@/features/replay/api";

const getColumns = (queryClient: QueryClient): ColumnDef<PlayerResponse>[] => [
  {
    accessorKey: "username",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <Button
          className="-ml-4"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          variant="ghost"
        >
          Username
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
        <DataTableColumnFilter
          column={column}
          placeholder="Filter username..."
        />
      </div>
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("username")}</span>
    ),
  },
  {
    accessorKey: "replay_count",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <Button
          className="-ml-4"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          variant="ghost"
        >
          Replays
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
        <DataTableColumnFilter
          column={column}
          placeholder="Filter replays..."
        />
      </div>
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.getValue("replay_count")}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link
        onMouseEnter={async () => {
          await queryClient.prefetchQuery(
            playerDetailQueryOptions(row.original.id)
          );
          const playerData = queryClient.getQueryData<PlayerDetailResponse>([
            "player",
            row.original.id,
          ]);
          const firstReplayId = playerData?.replays[0]?.duelingbook_id;
          if (firstReplayId) {
            queryClient.prefetchQuery(replayQueryOptions(firstReplayId));
          }
        }}
        params={{ "player-id": row.original.id }}
        to="/players/$player-id"
      >
        <Button size="sm" variant="outline">
          Link
        </Button>
      </Link>
    ),
    meta: { sticky: "right" },
  },
];

const PlayersIndexPage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = usePlayerList();
  const players = data?.players ?? [];
  const columns = getColumns(queryClient);

  if (isLoading) {
    return (
      <>
        <SiteHeader
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Players" }]}
        />
        <main className="flex-1 p-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Players" }]}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <DataTable columns={columns} data={players} totalLabel="player(s)" />
      </main>
    </>
  );
};

export const Route = createFileRoute("/players/")({
  component: PlayersIndexPage,
});
