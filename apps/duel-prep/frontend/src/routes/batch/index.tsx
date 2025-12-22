import { createFileRoute, Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, Circle, Loader2, XCircle } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import type { BatchStatus, BatchSummary } from "@/features/api/types";
import { useBatches } from "@/features/batch/api";
import { SiteHeader } from "@/features/layout/site-header";

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

const columns: ColumnDef<BatchSummary>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link
        className="font-medium hover:underline"
        params={{ "batch-id": row.original.id }}
        to="/batch/$batch-id"
      >
        {row.getValue("name")}
      </Link>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
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
    header: "Replays",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.getValue("replay_count")}
      </span>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return (
        <span className="text-muted-foreground">
          {date.toLocaleDateString()}
        </span>
      );
    },
  },
];

const BatchIndexPage = () => {
  const { data, isLoading } = useBatches();
  const batches = data?.batches ?? [];

  if (isLoading) {
    return (
      <>
        <SiteHeader breadcrumbs={[{ label: "Batches" }]} />
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
      <SiteHeader breadcrumbs={[{ label: "Batches" }]} />
      <main className="flex-1 overflow-y-auto p-6">
        <DataTable
          columns={columns}
          data={batches}
          searchColumn="name"
          searchPlaceholder="Search batches..."
        />
      </main>
    </>
  );
};

export const Route = createFileRoute("/batch/")({
  component: BatchIndexPage,
});
