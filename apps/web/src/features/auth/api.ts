import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store";

type HealthResponse = {
  status: string;
  auth_required: boolean;
};

export const useAuthStatus = () =>
  useQuery({
    queryKey: ["auth-status"],
    queryFn: async () => {
      const response = await fetch("/api/v1/health");
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      const data = (await response.json()) as HealthResponse;
      useAuthStore.getState().setAuthRequired(data.auth_required);
      return data;
    },
    staleTime: Number.POSITIVE_INFINITY,
  });
