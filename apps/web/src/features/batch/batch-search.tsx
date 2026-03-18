import { useNavigate } from "@tanstack/react-router";
import { Layers, Search } from "lucide-react";
import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const dummyBatches = [
  { id: "abc123", name: "Tournament Finals", date: "Dec 21", count: 3 },
  { id: "def456", name: "Practice Session", date: "Dec 20", count: 5 },
  { id: "ghi789", name: "Ladder Games", date: "Dec 19", count: 2 },
];

export const BatchSearch = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (batchId: string) => {
    setOpen(false);
    navigate({
      to: "/batch/$batch-id",
      params: { "batch-id": batchId },
    });
  };

  return (
    <>
      <button
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 text-muted-foreground text-sm shadow-xs hover:bg-accent hover:text-accent-foreground"
        onClick={() => setOpen(true)}
        type="button"
      >
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <span>Search...</span>
        </div>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium font-mono text-[10px] text-muted-foreground sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog
        description="Search for batches"
        onOpenChange={setOpen}
        open={open}
        showCloseButton={false}
        title="Search Batches"
      >
        <CommandInput placeholder="Search batches..." />
        <CommandList>
          <CommandEmpty>No batches found.</CommandEmpty>
          <CommandGroup heading="Recent Batches">
            {dummyBatches.map((batch) => (
              <CommandItem
                key={batch.id}
                onSelect={() => handleSelect(batch.id)}
              >
                <Layers className="h-4 w-4" />
                <span>{batch.name}</span>
                <span className="ml-auto text-muted-foreground text-xs">
                  {batch.count} replays
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};
