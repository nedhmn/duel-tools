import { Link, useLocation } from "@tanstack/react-router";
import { Layers, Plus } from "lucide-react";
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
import { BatchSearch } from "@/features/batch/batch-search";
import { ScrapeSheet } from "@/features/scrape/scrape-sheet";

const dummyBatches = [
  { id: "abc123", name: "Tournament Finals", date: "Dec 21", count: 3 },
  { id: "def456", name: "Practice Session", date: "Dec 20", count: 5 },
  { id: "ghi789", name: "Ladder Games", date: "Dec 19", count: 2 },
];

export const AppSidebar = () => {
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="flex flex-row items-center justify-between p-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2">
        <Link
          className="font-semibold text-lg group-data-[collapsible=icon]:hidden"
          to="/batch"
        >
          Duel Prep
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
        <div className="px-3 py-2 group-data-[collapsible=icon]:hidden">
          <BatchSearch />
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Recent Batches</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dummyBatches.map((batch) => (
                <SidebarMenuItem key={batch.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname.includes(batch.id)}
                    tooltip={`${batch.name} (${batch.count})`}
                  >
                    <Link
                      params={{ "batch-id": batch.id }}
                      to="/batch/$batch-id"
                    >
                      <Layers className="h-4 w-4 shrink-0" />
                      <span className="truncate">{batch.name}</span>
                      <span className="ml-auto text-muted-foreground text-xs">
                        {batch.count}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
