import { createFileRoute, Link } from "@tanstack/react-router";
import { Command, Layers, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/features/layout/site-header";
import { ScrapeSheet } from "@/features/scrape/scrape-sheet";

const HomePage = () => (
  <>
    <SiteHeader breadcrumbs={[{ label: "Home" }]} />
    <main className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-2">
          <h1 className="font-semibold text-2xl">Getting Started</h1>
          <p className="text-muted-foreground">
            Scout opponents and analyze replays from DuelingBook
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-sm">
                1
              </span>
              <h2 className="font-medium">Create a Batch</h2>
            </div>
            <p className="text-muted-foreground text-sm">
              Paste DuelingBook replay URLs to scrape card data
            </p>
            <ScrapeSheet>
              <Button size="sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                New Batch
              </Button>
            </ScrapeSheet>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-sm">
                2
              </span>
              <h2 className="font-medium">View Replays</h2>
            </div>
            <p className="text-muted-foreground text-sm">
              See cards played per game with visual grids
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-sm">
                3
              </span>
              <h2 className="font-medium">Scout Players</h2>
            </div>
            <p className="text-muted-foreground text-sm">
              Search for a player to see all their recorded games
            </p>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span>Press</span>
              <kbd className="inline-flex items-center gap-1 rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">
                <Command className="h-3 w-3" />K
              </kbd>
              <span>to search</span>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="mb-4 font-medium text-muted-foreground text-sm">
            Quick Links
          </h3>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link to="/batch">
                <Layers className="mr-2 h-4 w-4" />
                Batches
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/players">
                <Users className="mr-2 h-4 w-4" />
                Players
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  </>
);

export const Route = createFileRoute("/")({
  component: HomePage,
});
