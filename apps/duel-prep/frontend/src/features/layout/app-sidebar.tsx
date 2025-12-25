import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import { Layers, Loader2, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { batchStatusQueryOptions, useBatches } from "@/features/batch/api";
import {
  playerDetailQueryOptions,
  usePlayerList,
} from "@/features/players/api";
import { ScrapeSheet } from "@/features/scrape/scrape-sheet";

const SIDEBAR_LIMIT = 5;

export const AppSidebar = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { data: batchData } = useBatches();
  const { data: playerData } = usePlayerList();

  const batches = (batchData?.batches ?? []).slice(0, SIDEBAR_LIMIT);
  const players = (playerData?.players ?? [])
    .sort((a, b) => b.replay_count - a.replay_count)
    .slice(0, SIDEBAR_LIMIT);

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="flex flex-row items-center justify-between p-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2">
        <Link
          className="font-semibold text-lg group-data-[collapsible=icon]:hidden"
          to="/"
        >
          Duel Tools
        </Link>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <div className="px-3 py-2 group-data-[collapsible=icon]:px-2">
          <ScrapeSheet>
            <Button
              className="w-full group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:p-0"
              size="sm"
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
              <span className="group-data-[collapsible=icon]:hidden">
                New Batch
              </span>
            </Button>
          </ScrapeSheet>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Recent Batches</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {batches.map((batch) => (
                <SidebarMenuItem key={batch.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.includes(batch.id)}
                    tooltip={`${batch.name} (${batch.replay_count})`}
                  >
                    <Link
                      onMouseEnter={() =>
                        queryClient.prefetchQuery(
                          batchStatusQueryOptions(batch.id)
                        )
                      }
                      params={{ "batch-id": batch.id }}
                      to="/batch/$batch-id"
                    >
                      {batch.status === "processing" ||
                      batch.status === "pending" ? (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-blue-500" />
                      ) : (
                        <Layers className="h-4 w-4 shrink-0" />
                      )}
                      <span className="truncate">{batch.name}</span>
                      <span className="ml-auto text-muted-foreground text-xs">
                        {batch.replay_count}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            <Link
              className="mt-2 block px-2 text-muted-foreground text-xs hover:text-foreground group-data-[collapsible=icon]:hidden"
              to="/batch"
            >
              View all →
            </Link>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Top Players</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {players.map((player) => (
                <SidebarMenuItem key={player.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.includes(player.id)}
                    tooltip={`${player.username} (${player.replay_count})`}
                  >
                    <Link
                      onMouseEnter={() =>
                        queryClient.prefetchQuery(
                          playerDetailQueryOptions(player.id)
                        )
                      }
                      params={{ "player-id": player.id }}
                      to="/players/$player-id"
                    >
                      <User className="h-4 w-4 shrink-0" />
                      <span className="truncate">{player.username}</span>
                      <span className="ml-auto text-muted-foreground text-xs">
                        {player.replay_count}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            <Link
              className="mt-2 block px-2 text-muted-foreground text-xs hover:text-foreground group-data-[collapsible=icon]:hidden"
              to="/players"
            >
              View all →
            </Link>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
