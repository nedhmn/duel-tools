import { useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitScrape } from "./api";

const URL_REGEX =
  /https?:\/\/(?:www\.)?duelingbook\.com\/replay\?id=(\d+(?:-\d+)?)/g;

const extractUrls = (text: string): string[] => {
  const matches = text.matchAll(URL_REGEX);
  const urls = [...matches].map((m) => m[0]);
  return [...new Set(urls)];
};

type ScrapeSheetProps = {
  children: ReactNode;
};

export const ScrapeSheet = ({ children }: ScrapeSheetProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [batchName, setBatchName] = useState("");
  const [rawText, setRawText] = useState("");
  const submitScrape = useSubmitScrape();

  const urls = extractUrls(rawText);
  const canSubmit = batchName.trim().length > 0 && urls.length > 0;

  const handleRemoveUrl = (urlToRemove: string) => {
    const regex = new RegExp(
      urlToRemove.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "g"
    );
    setRawText((prev) => prev.replace(regex, "").trim());
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    submitScrape.mutate(
      { urls, name: batchName.trim() },
      {
        onSuccess: (data) => {
          setOpen(false);
          setBatchName("");
          setRawText("");
          navigate({
            to: "/batch/$batch-id",
            params: { "batch-id": data.batch_id },
          });
        },
      }
    );
  };

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-[400px] flex-col sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>New Batch</SheetTitle>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-4">
          <div className="shrink-0 space-y-2">
            <label className="font-medium text-sm" htmlFor="batch-name">
              Batch Name
            </label>
            <Input
              id="batch-name"
              onChange={(e) => setBatchName(e.target.value)}
              placeholder="e.g., Tournament Finals, Practice Session"
              value={batchName}
            />
          </div>

          <div className="shrink-0 space-y-2">
            <label className="font-medium text-sm" htmlFor="urls">
              Paste URLs
            </label>
            <Textarea
              className="h-32 resize-none"
              id="urls"
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste text containing DuelingBook replay URLs..."
              value={rawText}
            />
          </div>

          {urls.length > 0 ? (
            <div className="flex min-h-0 flex-1 flex-col space-y-2">
              <p className="shrink-0 font-medium text-sm">
                Extracted ({urls.length})
              </p>
              <div className="flex-1 space-y-2 overflow-y-auto">
                {urls.map((url) => {
                  const id = url.split("id=")[1];
                  return (
                    <div
                      className="flex items-center justify-between rounded bg-muted px-3 py-2 text-sm"
                      key={url}
                    >
                      <span>replay?id={id}</span>
                      <button
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => handleRemoveUrl(url)}
                        type="button"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {submitScrape.isError ? (
            <p className="shrink-0 text-destructive text-sm">
              {submitScrape.error.message}
            </p>
          ) : null}
        </div>

        <SheetFooter>
          <Button
            className="w-full"
            disabled={!canSubmit || submitScrape.isPending}
            onClick={handleSubmit}
          >
            {submitScrape.isPending
              ? "Submitting..."
              : `Submit ${urls.length} URL${urls.length === 1 ? "" : "s"}`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
