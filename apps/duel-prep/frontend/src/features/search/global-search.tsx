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

export const GlobalSearch = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { data: batchData } = useBatches();
  const { data: playerData } = usePlayerList();

  const allBatches = batchData?.batches ?? [];
  const allPlayers = playerData?.players ?? [];

  const batches = allBatches.slice(0, MAX_RESULTS);
  const players = allPlayers.slice(0, MAX_RESULTS);

  const hasMoreBatches = allBatches.length > MAX_RESULTS;
  const hasMorePlayers = allPlayers.length > MAX_RESULTS;

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
        className="h-9 w-48 justify-between text-muted-foreground"
        onClick={() => setOpen(true)}
        variant="outline"
      >
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <span>Search...</span>
        </div>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium font-mono text-[10px] text-muted-foreground sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog
        description="Search for batches and players"
        onOpenChange={setOpen}
        open={open}
        showCloseButton={false}
        title="Global Search"
      >
        <CommandInput placeholder="Search batches and players..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Batches">
            {batches.map((batch) => (
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
            {hasMoreBatches ? (
              <CommandItem onSelect={handleViewAllBatches}>
                <span className="text-muted-foreground">View all batches</span>
                <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </CommandItem>
            ) : null}
          </CommandGroup>
          <CommandGroup heading="Players">
            {players.map((player) => (
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
            {hasMorePlayers ? (
              <CommandItem onSelect={handleViewAllPlayers}>
                <span className="text-muted-foreground">View all players</span>
                <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </CommandItem>
            ) : null}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};
