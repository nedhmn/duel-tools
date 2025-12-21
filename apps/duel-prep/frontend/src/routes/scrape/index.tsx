import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/features/layout/site-header";

const ScrapePage = () => (
  <>
    <SiteHeader title="Scrape" />
    <main className="flex-1 p-6">
      <p className="text-muted-foreground">Scrape page coming soon...</p>
    </main>
  </>
);

export const Route = createFileRoute("/scrape/")({
  component: ScrapePage,
});
