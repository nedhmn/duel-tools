import { useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitScrape } from "./api";

const URL_REGEX = /https?:\/\/(?:www\.)?duelingbook\.com\/replay\?id=(\d+)/g;

const extractUrls = (text: string): string[] => {
  const matches = text.matchAll(URL_REGEX);
  const urls = [...matches].map((m) => m[0]);
  return [...new Set(urls)];
};

export const UrlExtractor = () => {
  const navigate = useNavigate();
  const [rawText, setRawText] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const submitScrape = useSubmitScrape();

  const handleExtract = () => {
    const extracted = extractUrls(rawText);
    setUrls(extracted);
  };

  const handleRemoveUrl = (urlToRemove: string) => {
    setUrls((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const handleSubmit = () => {
    if (urls.length === 0) {
      return;
    }

    submitScrape.mutate(urls, {
      onSuccess: (data) => {
        navigate({
          to: "/scrape/$batchId",
          params: { batchId: data.batch_id },
        });
      },
    });
  };

  return (
    <div className="space-y-4">
      <Textarea
        className="min-h-32"
        onChange={(e) => setRawText(e.target.value)}
        placeholder="Paste DuelingBook replay URLs or text containing URLs..."
        value={rawText}
      />

      <div className="flex gap-2">
        <Button onClick={handleExtract} variant="secondary">
          Extract URLs
        </Button>
        <Button
          disabled={urls.length === 0 || submitScrape.isPending}
          onClick={handleSubmit}
        >
          {submitScrape.isPending ? "Submitting..." : `Submit (${urls.length})`}
        </Button>
      </div>

      {urls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {urls.map((url) => (
            <Badge className="gap-1 pr-1" key={url} variant="secondary">
              {url.split("id=")[1]}
              <button
                className="rounded p-0.5 hover:bg-muted"
                onClick={() => handleRemoveUrl(url)}
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {submitScrape.isError ? (
        <p className="text-destructive text-sm">
          Failed to submit: {submitScrape.error.message}
        </p>
      ) : null}
    </div>
  );
};
