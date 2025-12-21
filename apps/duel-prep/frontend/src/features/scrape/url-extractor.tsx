import { useNavigate } from "@tanstack/react-router";
import { Link, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSubmitScrape } from "./api";

const URL_REGEX = /https?:\/\/(?:www\.)?duelingbook\.com\/replay\?id=(\d+)/g;

const extractUrls = (text: string): string[] => {
  const matches = text.matchAll(URL_REGEX);
  const urls = [...matches].map((m) => m[0]);
  return [...new Set(urls)];
};

export const UrlExtractor = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const submitScrape = useSubmitScrape();

  const handleInputChange = (value: string) => {
    setInputValue(value);
    const extracted = extractUrls(value);
    setUrls(extracted);
    setOpen(extracted.length > 0);
  };

  const handleClear = () => {
    setInputValue("");
    setUrls([]);
    setOpen(false);
  };

  const handleRemoveUrl = (urlToRemove: string) => {
    const newUrls = urls.filter((url) => url !== urlToRemove);
    setUrls(newUrls);
    if (newUrls.length === 0) {
      setOpen(false);
    }
  };

  const handleSubmit = () => {
    if (urls.length === 0) {
      return;
    }

    submitScrape.mutate(urls, {
      onSuccess: (data) => {
        setOpen(false);
        setInputValue("");
        setUrls([]);
        navigate({
          to: "/scrape/$batch-id",
          params: { "batch-id": data.batch_id },
        });
      },
    });
  };

  const containerWidth = containerRef.current?.offsetWidth ?? 500;

  return (
    <div className="max-w-xl space-y-2">
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <div className="relative" ref={containerRef}>
            <Link className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pr-9 pl-9"
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Paste DuelingBook URLs..."
              value={inputValue}
            />
            {inputValue.length > 0 && (
              <button
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={handleClear}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="p-0"
          style={{ width: containerWidth }}
        >
          <div className="max-h-64 overflow-y-auto p-2">
            {urls.map((url) => (
              <div
                className="flex items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-muted"
                key={url}
              >
                <span className="truncate">{url}</span>
                <button
                  className="ml-2 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={() => handleRemoveUrl(url)}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="border-t p-2">
            <Button
              className="w-full"
              disabled={urls.length === 0 || submitScrape.isPending}
              onClick={handleSubmit}
              size="sm"
            >
              {submitScrape.isPending
                ? "Submitting..."
                : `Submit ${urls.length} URL${urls.length === 1 ? "" : "s"}`}
            </Button>
          </div>
          {submitScrape.isError ? (
            <p className="px-2 pb-2 text-destructive text-sm">
              {submitScrape.error.message}
            </p>
          ) : null}
        </PopoverContent>
      </Popover>
      <p className="text-muted-foreground text-sm">
        Paste text containing DuelingBook replay URLs to extract and scrape them
      </p>
    </div>
  );
};
