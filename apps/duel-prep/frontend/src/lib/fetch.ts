import { useAuthStore } from "@/features/auth/store";

export const fetchJson = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const password = useAuthStore.getState().password;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(password && { "X-Auth-Password": password }),
      ...options?.headers,
    },
    ...options,
  });

  if (response.status === 401) {
    useAuthStore.getState().logout();
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
};
