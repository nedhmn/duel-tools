import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, Layers, Search, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useBatches } from "@/features/batch/api";
import { usePlayerList } from "@/features/players/api";

const MAX_RESULTS = 5;

const filterByName = <T extends { name?: string; username?: string }>(
  items: T[],
  query: string
): T[] => {
  if (!query) {
    return items;
  }
  const lower = query.toLowerCase();
  return items.filter((item) => {
    const name = item.name ?? item.username ?? "";
    return name.toLowerCase().includes(lower);
  });
};

export const GlobalSearch = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: batchData } = useBatches();
  const { data: playerData } = usePlayerList();

  const allBatches = batchData?.batches ?? [];
  const allPlayers = playerData?.players ?? [];

  const filteredBatches = filterByName(allBatches, search).slice(
    0,
    MAX_RESULTS
  );
  const filteredPlayers = filterByName(allPlayers, search).slice(
    0,
    MAX_RESULTS
  );

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

  const handleSelectBatch = (batchId: string) => {
    setOpen(false);
    navigate({
      to: "/batch/$batch-id",
      params: { "batch-id": batchId },
    });
  };

  const handleSelectPlayer = (playerId: string) => {
    setOpen(false);
    navigate({
      to: "/players/$player-id",
      params: { "player-id": playerId },
    });
  };

  const handleViewAllBatches = () => {
    setOpen(false);
    navigate({ to: "/batch" });
  };

  const handleViewAllPlayers = () => {
    setOpen(false);
    navigate({ to: "/players" });
  };

  return (
    <>
      <Button
        className="h-9 w-9 justify-center text-muted-foreground sm:w-48 sm:justify-between"
        onClick={() => setOpen(true)}
        variant="outline"
      >
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search...</span>
        </div>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium font-mono text-[10px] text-muted-foreground sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog
        description="Search for batches and players"
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setSearch("");
          }
        }}
        open={open}
        shouldFilter={false}
        showCloseButton={false}
        title="Global Search"
      >
        <CommandInput
          onValueChange={setSearch}
          placeholder="Search players and batches..."
          value={search}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Players">
            {filteredPlayers.map((player) => (
              <CommandItem
                key={player.id}
                onSelect={() => handleSelectPlayer(player.id)}
              >
                <User className="h-4 w-4" />
                <span>{player.username}</span>
                <span className="ml-auto text-muted-foreground text-xs">
                  {player.replay_count} replays
                </span>
              </CommandItem>
            ))}
            <CommandItem onSelect={handleViewAllPlayers}>
              <span className="text-muted-foreground">View all players</span>
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Batches">
            {filteredBatches.map((batch) => (
              <CommandItem
                key={batch.id}
                onSelect={() => handleSelectBatch(batch.id)}
              >
                <Layers className="h-4 w-4" />
                <span>{batch.name}</span>
                <span className="ml-auto text-muted-foreground text-xs">
                  {batch.replay_count} replays
                </span>
              </CommandItem>
            ))}
            <CommandItem onSelect={handleViewAllBatches}>
              <span className="text-muted-foreground">View all batches</span>
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};
