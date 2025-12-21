import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/features/layout/site-header";
import { UrlExtractor } from "@/features/scrape/url-extractor";

const ScrapePage = () => (
  <>
    <SiteHeader title="Scrape" />
    <main className="flex-1 p-6">
      <UrlExtractor />
    </main>
  </>
);

export const Route = createFileRoute("/scrape/")({
  component: ScrapePage,
});
