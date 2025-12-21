import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/features/layout/site-header";

const BatchPage = () => (
  <>
    <SiteHeader title="Batch" />
    <main className="flex-1 p-6">
      <p className="text-muted-foreground">Batch page coming soon...</p>
    </main>
  </>
);

export const Route = createFileRoute("/scrape/$batchId")({
  component: BatchPage,
});
