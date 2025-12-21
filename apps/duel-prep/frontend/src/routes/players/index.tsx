import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/features/layout/site-header";

const PlayersIndexPage = () => (
  <>
    <SiteHeader breadcrumbs={[{ label: "Players" }]} />
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="text-center">
        <h2 className="font-medium text-lg">No player selected</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Press{" "}
          <kbd className="inline-flex items-center gap-1 rounded border bg-muted px-1.5 py-0.5 font-medium font-mono text-xs">
            <span>⌘</span>K
          </kbd>{" "}
          to search for a player.
        </p>
      </div>
    </main>
  </>
);

export const Route = createFileRoute("/players/")({
  component: PlayersIndexPage,
});
