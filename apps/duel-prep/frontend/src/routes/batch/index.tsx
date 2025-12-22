import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { SiteHeader } from "@/features/layout/site-header";

const BatchIndexPage = () => (
  <>
    <SiteHeader breadcrumbs={[{ label: "Batches" }]} />
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="text-center">
        <h2 className="font-medium text-lg">No batch selected</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Click{" "}
          <span className="inline-flex items-center gap-1 font-medium text-foreground">
            <Plus className="h-3 w-3" />
            New Batch
          </span>{" "}
          in the sidebar to get started.
        </p>
      </div>
    </main>
  </>
);

export const Route = createFileRoute("/batch/")({
  component: BatchIndexPage,
});
