import { createFileRoute, Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import type { PlayerResponse } from "@/features/api/types";
import { SiteHeader } from "@/features/layout/site-header";
import { usePlayerList } from "@/features/players/api";

const columns: ColumnDef<PlayerResponse>[] = [
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => (
      <Link
        className="font-medium hover:underline"
        params={{ "player-id": row.original.id }}
        to="/players/$player-id"
      >
        {row.getValue("username")}
      </Link>
    ),
  },
  {
    accessorKey: "replay_count",
    header: "Replays",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.getValue("replay_count")}
      </span>
    ),
  },
];

const PlayersIndexPage = () => {
  const { data, isLoading } = usePlayerList();
  const players = data?.players ?? [];

  if (isLoading) {
    return (
      <>
        <SiteHeader breadcrumbs={[{ label: "Players" }]} />
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
      <SiteHeader breadcrumbs={[{ label: "Players" }]} />
      <main className="flex-1 overflow-y-auto p-6">
        <DataTable
          columns={columns}
          data={players}
          searchColumn="username"
          searchPlaceholder="Search players..."
        />
      </main>
    </>
  );
};

export const Route = createFileRoute("/players/")({
  component: PlayersIndexPage,
});
