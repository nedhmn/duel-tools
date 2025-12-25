import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  CheckCircle,
  Circle,
  Loader2,
  XCircle,
} from "lucide-react";
import { DataTable } from "@/components/data-table";
import { DataTableColumnFilter } from "@/components/data-table-column-filter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  BatchStatus,
  BatchStatusResponse,
  BatchSummary,
} from "@/features/api/types";
import { batchStatusQueryOptions, useBatches } from "@/features/batch/api";
import { SiteHeader } from "@/features/layout/site-header";
import { replayQueryOptions } from "@/features/replay/api";

const statusConfig: Record<
  BatchStatus,
  { icon: typeof Circle; className: string; label: string }
> = {
  pending: {
    icon: Circle,
    className: "text-muted-foreground",
    label: "Pending",
  },
  processing: {
    icon: Loader2,
    className: "text-blue-500 animate-spin",
    label: "Processing",
  },
  completed: {
    icon: CheckCircle,
    className: "text-green-500",
    label: "Completed",
  },
  failed: { icon: XCircle, className: "text-destructive", label: "Failed" },
};

const getColumns = (queryClient: QueryClient): ColumnDef<BatchSummary>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <Button
          className="-ml-4"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          variant="ghost"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
        <DataTableColumnFilter column={column} placeholder="Filter name..." />
      </div>
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <Button
          className="-ml-4"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          variant="ghost"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
        <DataTableColumnFilter column={column} placeholder="Filter status..." />
      </div>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as BatchStatus;
      const config = statusConfig[status];
      const Icon = config.icon;
      return (
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${config.className}`} />
          <span>{config.label}</span>
        </div>
      );
    },
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
    accessorKey: "created_at",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        <Button
          className="-ml-4"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          variant="ghost"
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
        <DataTableColumnFilter
          column={column}
          placeholder="Filter created..."
        />
      </div>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return (
        <span className="text-muted-foreground">
          {date.toLocaleDateString()}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link
        onMouseEnter={async () => {
          await queryClient.prefetchQuery(
            batchStatusQueryOptions(row.original.id)
          );
          const batchData = queryClient.getQueryData<BatchStatusResponse>([
            "batch",
            row.original.id,
          ]);
          const firstCompletedJob = batchData?.jobs.find(
            (job) => job.status === "completed" && job.duelingbook_id
          );
          if (firstCompletedJob?.duelingbook_id) {
            queryClient.prefetchQuery(
              replayQueryOptions(firstCompletedJob.duelingbook_id)
            );
          }
        }}
        params={{ "batch-id": row.original.id }}
        to="/batch/$batch-id"
      >
        <Button size="sm" variant="outline">
          Link
        </Button>
      </Link>
    ),
    meta: { sticky: "right" },
  },
];

const BatchIndexPage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useBatches();
  const batches = data?.batches ?? [];
  const columns = getColumns(queryClient);

  if (isLoading) {
    return (
      <>
        <SiteHeader
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Batches" }]}
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
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Batches" }]}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <DataTable columns={columns} data={batches} totalLabel="batch(es)" />
      </main>
    </>
  );
};

export const Route = createFileRoute("/batch/")({
  component: BatchIndexPage,
});
