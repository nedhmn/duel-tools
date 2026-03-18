import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { LoginModal } from "@/features/auth/login-modal";
import { useAuthStore } from "@/features/auth/store";
import { AppSidebar } from "@/features/layout/app-sidebar";

type RouterContext = {
  queryClient: QueryClient;
};

const RootLayout = () => {
  const password = useAuthStore((s) => s.password);

  return (
    <>
      <LoginModal open={!password} />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-w-0 overflow-hidden">
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </>
  );
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});
